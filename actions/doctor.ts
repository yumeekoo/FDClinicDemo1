"use server";

import { db } from "@/db";
import {
  visits,
  patients,
  profiles,
  vitals,
  diagnoses,
  clsOrders,
  prescriptions,
  prescriptionItems,
  inventoryItems,
  invoices,
  invoiceItems,
  patientBranchLinks,
} from "@/db/schema";
import { eq, and, or, gte, isNull, asc, desc, aliasedTable, sql } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import {
  ClsOrderInput,
  CompleteExamInput,
  clsOrderArraySchema,
  examinationCompleteSchema,
} from "@/lib/validations/doctor";
import { revalidatePath } from "next/cache";

type ActionResult<T> = 
  | { success: true; data: T } 
  | { success: false; error: string };

/**
 * Get active visits queue for the doctor at their branch.
 * Doctors see patients assigned to them, but Admins see all active patients in the branch.
 */
export async function getDoctorQueueAction(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    const currentBranchId = user.user_metadata?.branch_id;
    const role = user.user_metadata?.role || "DOCTOR";
    if (!currentBranchId) {
      return { success: false, error: "Tài khoản của bạn chưa được liên kết với chi nhánh nào" };
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const doctors = aliasedTable(profiles, "doctors");

    // Retrieve active visits (WAITING, IN_PROGRESS, CLS_PENDING) of today
    // For DOCTOR: only show visits assigned to them
    // For ADMIN: show all
    const baseConditions = [
      eq(visits.branchId, currentBranchId),
      isNull(visits.deletedAt),
      gte(visits.createdAt, startOfToday),
      or(
        eq(visits.status, "WAITING"),
        eq(visits.status, "IN_PROGRESS"),
        eq(visits.status, "CLS_PENDING")
      ),
    ];

    if (role === "DOCTOR") {
      baseConditions.push(eq(visits.doctorId, user.id));
    }

    const rows = await db
      .select({
        visit: visits,
        patient: patients,
        doctor: {
          id: doctors.id,
          fullName: doctors.fullName,
        },
        vitals: vitals,
      })
      .from(visits)
      .innerJoin(patients, eq(visits.patientId, patients.id))
      .innerJoin(doctors, eq(visits.doctorId, doctors.id))
      .leftJoin(vitals, eq(visits.id, vitals.visitId))
      .where(and(...baseConditions))
      .orderBy(asc(visits.createdAt));

    return { success: true, data: rows };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi lấy hàng đợi khám" };
  }
}

/**
 * Start the examination of a patient (update status to IN_PROGRESS).
 */
export async function startExaminationAction(visitId: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    const [updatedVisit] = await db
      .update(visits)
      .set({
        status: "IN_PROGRESS",
        startedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(visits.id, visitId),
          or(eq(visits.status, "WAITING"), eq(visits.status, "IN_PROGRESS"))
        )
      )
      .returning();

    if (!updatedVisit) {
      return { success: false, error: "Không tìm thấy lượt khám hợp lệ hoặc lượt khám đã hoàn tất" };
    }

    revalidatePath("/doctor");
    return { success: true, data: updatedVisit };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi bắt đầu khám" };
  }
}

/**
 * Helper to get or create an invoice with visit fee.
 */
async function getOrCreateInvoiceForVisit(tx: any, visitId: string, branchId: string) {
  const existing = await tx
    .select()
    .from(invoices)
    .where(eq(invoices.visitId, visitId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const invoiceCode = `HD-${dateStr}-${rand}`;

  // 1. Insert invoice
  const [newInvoice] = await tx
    .insert(invoices)
    .values({
      invoiceCode,
      visitId,
      branchId,
      subtotal: "100000.00", // Initial visit fee
      discountAmount: "0.00",
      bhytAmount: "0.00",
      totalAmount: "100000.00",
      status: "PENDING",
    })
    .returning();

  // 2. Insert visit fee item
  await tx.insert(invoiceItems).values({
    invoiceId: newInvoice.id,
    itemType: "VISIT_FEE",
    description: "Phí khám lâm sàng ban đầu",
    quantity: 1,
    unitPrice: "100000.00",
    amount: "100000.00",
  });

  return newInvoice;
}

/**
 * Recompute invoice subtotal and totalAmount based on invoiceItems.
 */
async function updateInvoiceTotals(tx: any, invoiceId: string) {
  const items = await tx
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, invoiceId));

  let total = 0;
  for (const item of items) {
    total += parseFloat(item.amount);
  }

  await tx
    .update(invoices)
    .set({
      subtotal: total.toFixed(2),
      totalAmount: total.toFixed(2),
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId));
}

/**
 * Create CLS orders and transition visit to CLS_PENDING.
 */
export async function createClsOrdersAction(visitId: string, ordersInput: ClsOrderInput[]): Promise<ActionResult<any[]>> {
  try {
    const validated = clsOrderArraySchema.safeParse({ visitId, orders: ordersInput });
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    const currentBranchId = user.user_metadata?.branch_id;
    if (!currentBranchId) {
      return { success: false, error: "Không tìm thấy thông tin chi nhánh" };
    }

    const results = await db.transaction(async (tx) => {
      // 1. Get or create invoice
      const invoice = await getOrCreateInvoiceForVisit(tx, visitId, currentBranchId);

      const insertedOrders = [];
      for (const order of ordersInput) {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        const orderCode = `CLS-${dateStr}-${rand}`;

        // 2. Insert cls order
        const [inserted] = await tx
          .insert(clsOrders)
          .values({
            orderCode,
            visitId,
            branchId: currentBranchId,
            orderedBy: user.id,
            serviceName: order.serviceName,
            serviceType: order.serviceType,
            status: "PENDING",
            priority: order.priority,
            notes: order.notes || null,
          })
          .returning();

        insertedOrders.push(inserted);

        // Determine mock pricing
        let price = "100000.00";
        if (order.serviceType === "LAB") price = "150000.00";
        else if (order.serviceType === "IMAGING") price = "200000.00";
        else if (order.serviceType === "ECG") price = "80000.00";

        // 3. Add to invoice items
        await tx.insert(invoiceItems).values({
          invoiceId: invoice.id,
          itemType: "CLS",
          itemRefId: inserted.id,
          description: `CLS: ${order.serviceName}`,
          quantity: 1,
          unitPrice: price,
          amount: price,
        });
      }

      // 4. Update visit status
      await tx
        .update(visits)
        .set({
          status: "CLS_PENDING",
          updatedAt: new Date(),
        })
        .where(eq(visits.id, visitId));

      // 5. Update invoice totals
      await updateInvoiceTotals(tx, invoice.id);

      return insertedOrders;
    });

    revalidatePath(`/doctor/examination/${visitId}`);
    return { success: true, data: results };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi lập chỉ định cận lâm sàng" };
  }
}

/**
 * Get dynamic inventory list of the current branch.
 */
export async function getBranchInventoryAction(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    const currentBranchId = user.user_metadata?.branch_id;
    if (!currentBranchId) {
      return { success: false, error: "Không tìm thấy thông tin chi nhánh" };
    }

    const list = await db
      .select()
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.branchId, currentBranchId),
          sql`${inventoryItems.quantityInStock} > 0`
        )
      )
      .orderBy(inventoryItems.drugName);

    // Cast quantities to float/number for frontend safety
    const formattedList = list.map((item) => ({
      ...item,
      quantityInStock: parseFloat(item.quantityInStock),
    }));

    return { success: true, data: formattedList };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi lấy kho thuốc chi nhánh" };
  }
}

/**
 * Complete the patient examination: save diagnosis, save prescription, deduct stock, update invoice, complete visit.
 */
export async function completeExaminationAction(input: CompleteExamInput): Promise<ActionResult<any>> {
  try {
    const validated = examinationCompleteSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    const currentBranchId = user.user_metadata?.branch_id;
    if (!currentBranchId) {
      return { success: false, error: "Không tìm thấy thông tin chi nhánh" };
    }

    await db.transaction(async (tx) => {
      // 1. Insert Diagnosis
      await tx.insert(diagnoses).values({
        visitId: input.visitId,
        icd10Code: input.icd10Code,
        icd10Description: input.icd10Description,
        diagnosisType: "PRIMARY",
        notes: input.notes || null,
        createdBy: user.id,
      });

      // 2. Process Prescription (if any)
      if (input.prescriptionItems && input.prescriptionItems.length > 0) {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        const prescriptionCode = `DT-${dateStr}-${rand}`;

        // Create prescription record
        const [presc] = await tx
          .insert(prescriptions)
          .values({
            prescriptionCode,
            visitId: input.visitId,
            branchId: currentBranchId,
            prescribedBy: user.id,
            status: "CONFIRMED",
            notes: input.notes || null,
          })
          .returning();

        const invoice = await getOrCreateInvoiceForVisit(tx, input.visitId, currentBranchId);

        for (const item of input.prescriptionItems) {
          // Dynamic FEFO (First Expired First Out) stock check and deduction
          const batches = await tx
            .select()
            .from(inventoryItems)
            .where(
              and(
                eq(inventoryItems.branchId, currentBranchId),
                eq(inventoryItems.drugCode, item.drugCode),
                sql`${inventoryItems.quantityInStock} > 0`
              )
            )
            .orderBy(asc(inventoryItems.expiryDate));

          if (batches.length === 0) {
            throw new Error(`Thuốc "${item.drugName}" (mã: ${item.drugCode}) không tồn tại hoặc đã hết hàng trong kho chi nhánh`);
          }

          const totalAvailable = batches.reduce((sum: number, b: any) => sum + parseFloat(b.quantityInStock), 0);
          if (item.quantity > totalAvailable) {
            throw new Error(
              `Số lượng kê thuốc "${item.drugName}" (${item.quantity}) vượt quá tổng tồn kho khả dụng của chi nhánh (${totalAvailable})`
            );
          }

          // Deduct from batches using FEFO
          let remainingToDeduct = item.quantity;
          for (const batch of batches) {
            if (remainingToDeduct <= 0) break;
            const batchQty = parseFloat(batch.quantityInStock);
            if (batchQty >= remainingToDeduct) {
              const newQty = batchQty - remainingToDeduct;
              await tx
                .update(inventoryItems)
                .set({
                  quantityInStock: newQty.toFixed(2),
                  updatedAt: new Date(),
                })
                .where(eq(inventoryItems.id, batch.id));
              remainingToDeduct = 0;
            } else {
              await tx
                .update(inventoryItems)
                .set({
                  quantityInStock: "0.00",
                  updatedAt: new Date(),
                })
                .where(eq(inventoryItems.id, batch.id));
              remainingToDeduct -= batchQty;
            }
          }

          // Insert prescription item
          const [prescItem] = await tx
            .insert(prescriptionItems)
            .values({
              prescriptionId: presc.id,
              drugName: item.drugName,
              drugCode: item.drugCode,
              dosage: item.dosage,
              frequency: item.frequency,
              durationDays: item.durationDays,
              quantity: item.quantity,
              unit: item.unit,
              instructions: item.instructions || null,
            })
            .returning();

          // Mock drug pricing (e.g. 5000 VND per unit)
          const unitPrice = "5000.00";
          const amount = (item.quantity * 5000).toFixed(2);

          // Add drug to invoice
          await tx.insert(invoiceItems).values({
            invoiceId: invoice.id,
            itemType: "DRUG",
            itemRefId: prescItem.id,
            description: `Thuốc: ${item.drugName} ${item.dosage}`,
            quantity: item.quantity,
            unitPrice: unitPrice,
            amount: amount,
          });
        }

        // Update invoice total
        await updateInvoiceTotals(tx, invoice.id);
      }

      // 3. Complete Visit
      await tx
        .update(visits)
        .set({
          status: "COMPLETED",
          chiefComplaint: input.chiefComplaint,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(visits.id, input.visitId));
    });

    revalidatePath("/doctor");
    return { success: true, data: { status: "COMPLETED" } };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi hoàn tất khám bệnh" };
  }
}

/**
 * Get Patient 360 history: all past visits, diagnoses, prescriptions, and CLS orders across all branches.
 */
export async function getPatient360Action(patientId: string): Promise<ActionResult<any>> {
  try {
    const patientInfo = await db
      .select()
      .from(patients)
      .where(eq(patients.id, patientId))
      .limit(1);

    if (patientInfo.length === 0) {
      return { success: false, error: "Không tìm thấy hồ sơ bệnh nhân" };
    }

    const branchAlias = aliasedTable(profiles, "branch_profiles");

    // Fetch all historical visits for this patient
    const pastVisits = await db
      .select({
        id: visits.id,
        visitCode: visits.visitCode,
        chiefComplaint: visits.chiefComplaint,
        medicalHistory: visits.medicalHistory,
        status: visits.status,
        createdAt: visits.createdAt,
        doctorName: profiles.fullName,
      })
      .from(visits)
      .leftJoin(profiles, eq(visits.doctorId, profiles.id))
      .where(and(eq(visits.patientId, patientId), eq(visits.status, "COMPLETED")))
      .orderBy(desc(visits.createdAt));

    // Fetch detailed diagnostic and prescription details for each completed visit
    const history = [];
    for (const v of pastVisits) {
      const visitDiagnoses = await db
        .select()
        .from(diagnoses)
        .where(eq(diagnoses.visitId, v.id));

      const visitPrescriptions = await db
        .select()
        .from(prescriptions)
        .where(eq(prescriptions.visitId, v.id));

      const visitPrescItems = [];
      for (const p of visitPrescriptions) {
        const items = await db
          .select()
          .from(prescriptionItems)
          .where(eq(prescriptionItems.prescriptionId, p.id));
        visitPrescItems.push(...items);
      }

      const visitClsOrders = await db
        .select()
        .from(clsOrders)
        .where(eq(clsOrders.visitId, v.id));

      history.push({
        visit: v,
        diagnoses: visitDiagnoses,
        prescriptions: visitPrescItems,
        clsOrders: visitClsOrders,
      });
    }

    return {
      success: true,
      data: {
        patient: patientInfo[0],
        history,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi lấy thông tin bệnh án 360" };
  }
}

/**
 * Seed sample drugs into inventoryItems if the branch has no drugs.
 * Useful for demo and testing doctor workflows.
 */
export async function seedInventoryForDemoAction(): Promise<ActionResult<string>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    const currentBranchId = user.user_metadata?.branch_id;
    if (!currentBranchId) {
      return { success: false, error: "Không tìm thấy thông tin chi nhánh" };
    }

    const existing = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.branchId, currentBranchId))
      .limit(1);

    if (existing.length > 0) {
      return { success: true, data: "Kho đã có thuốc, không cần seed mẫu." };
    }

    const mockDrugs = [
      { name: "Paracetamol 500mg (Panadol Extra)", code: "PARA500", unit: "Viên", qty: "200.00" },
      { name: "Amoxicillin 500mg (Kháng sinh)", code: "AMOX500", unit: "Viên", qty: "150.00" },
      { name: "Ibuprofen 400mg (Giảm đau, kháng viêm)", code: "IBU400", unit: "Viên", qty: "100.00" },
      { name: "Cetirizine 10mg (Dị ứng)", code: "CET10", unit: "Viên", qty: "80.00" },
      { name: "Decolgen Forte (Trị cảm cúm)", code: "DECOL", unit: "Viên", qty: "120.00" },
      { name: "Salbutamol 2mg (Giãn phế quản)", code: "SALBU2", unit: "Viên", qty: "50.00" },
      { name: "Gaviscon (Dạ dày, trào ngược)", code: "GAVI", unit: "Gói", qty: "60.00" },
    ];

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 2); // 2 years from now

    for (const d of mockDrugs) {
      await db.insert(inventoryItems).values({
        branchId: currentBranchId,
        drugName: d.name,
        drugCode: d.code,
        unit: d.unit,
        quantityInStock: d.qty,
        minStockThreshold: "20.00",
        expiryDate: expiryDate.toISOString().slice(0, 10),
        batchNumber: `BAT-${Math.floor(Math.random() * 900000 + 100000)}`,
      });
    }

    return { success: true, data: "Đã nạp thành công 7 loại thuốc mẫu vào kho chi nhánh này!" };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi seed kho thuốc" };
  }
}
