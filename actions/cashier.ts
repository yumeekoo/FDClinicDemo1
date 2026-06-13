"use server";

import { db } from "@/db";
import {
  visits,
  patients,
  profiles,
  invoices,
  invoiceItems,
  payments,
} from "@/db/schema";
import { eq, and, gte, isNull, desc, or } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Get cashier queue: today's visits with status COMPLETED (pending payment) or PAID (paid).
 */
export async function getPendingPaymentsAction(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    const currentBranchId = user.user_metadata?.branch_id;
    if (!currentBranchId) {
      return { success: false, error: "Tài khoản của bạn chưa được liên kết với chi nhánh nào" };
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const rows = await db
      .select({
        visit: visits,
        patient: patients,
        doctor: {
          id: profiles.id,
          fullName: profiles.fullName,
        },
        invoice: invoices,
      })
      .from(visits)
      .innerJoin(patients, eq(visits.patientId, patients.id))
      .innerJoin(profiles, eq(visits.doctorId, profiles.id))
      .innerJoin(invoices, eq(invoices.visitId, visits.id))
      .where(
        and(
          eq(visits.branchId, currentBranchId),
          isNull(visits.deletedAt),
          gte(visits.createdAt, startOfToday),
          or(eq(visits.status, "COMPLETED"), eq(visits.status, "PAID"))
        )
      )
      .orderBy(desc(visits.updatedAt));

    return { success: true, data: rows };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi lấy hàng đợi thu ngân" };
  }
}

/**
 * Get detailed invoice items for a patient visit.
 */
export async function getInvoiceDetailsAction(visitId: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    // 1. Get visit, patient, doctor
    const visitRows = await db
      .select({
        visit: visits,
        patient: patients,
        doctor: {
          id: profiles.id,
          fullName: profiles.fullName,
        },
      })
      .from(visits)
      .innerJoin(patients, eq(visits.patientId, patients.id))
      .innerJoin(profiles, eq(visits.doctorId, profiles.id))
      .where(eq(visits.id, visitId))
      .limit(1);

    if (visitRows.length === 0) {
      return { success: false, error: "Không tìm thấy lượt khám" };
    }

    const { visit, patient, doctor } = visitRows[0];

    // 2. Get invoice
    const invoiceRows = await db
      .select()
      .from(invoices)
      .where(eq(invoices.visitId, visitId))
      .limit(1);

    if (invoiceRows.length === 0) {
      return { success: false, error: "Không tìm thấy hóa đơn cho lượt khám này" };
    }

    const invoice = invoiceRows[0];

    // Fetch payment if paid
    let payment = null;
    if (invoice.status === "PAID") {
      const paymentRows = await db
        .select()
        .from(payments)
        .where(eq(payments.invoiceId, invoice.id))
        .limit(1);
      if (paymentRows.length > 0) {
        payment = paymentRows[0];
      }
    }

    // 3. Get invoice items
    const items = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoice.id))
      .orderBy(invoiceItems.createdAt);

    return {
      success: true,
      data: {
        visit,
        patient,
        doctor,
        invoice,
        items,
        payment,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi lấy chi tiết hóa đơn" };
  }
}

interface ProcessPaymentInput {
  invoiceId: string;
  visitId: string;
  discountAmount: number;
  bhytAmount: number;
  paymentMethod: "CASH" | "CARD" | "TRANSFER" | "MOMO" | "VNPAY";
}

/**
 * Confirm payment, update invoice/visit status, and insert payment transaction.
 */
export async function processPaymentAction(input: ProcessPaymentInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    if (input.discountAmount < 0 || input.bhytAmount < 0) {
      return { success: false, error: "Số tiền giảm trừ phải lớn hơn hoặc bằng 0" };
    }

    const result = await db.transaction(async (tx) => {
      // 1. Fetch invoice
      const [invoice] = await tx
        .select()
        .from(invoices)
        .where(eq(invoices.id, input.invoiceId))
        .limit(1);

      if (!invoice) {
        throw new Error("Không tìm thấy hóa đơn thanh toán");
      }

      if (invoice.status === "PAID") {
        throw new Error("Hóa đơn này đã được thanh toán trước đó");
      }

      const subtotalVal = parseFloat(invoice.subtotal);
      const discountVal = input.discountAmount;
      const bhytVal = input.bhytAmount;

      const totalVal = Math.max(0, subtotalVal - discountVal - bhytVal);

      // 2. Update invoice status & amounts
      const [updatedInvoice] = await tx
        .update(invoices)
        .set({
          status: "PAID",
          discountAmount: discountVal.toFixed(2),
          bhytAmount: bhytVal.toFixed(2),
          totalAmount: totalVal.toFixed(2),
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, input.invoiceId))
        .returning();

      // 3. Update visit status to PAID
      await tx
        .update(visits)
        .set({
          status: "PAID",
          updatedAt: new Date(),
        })
        .where(eq(visits.id, input.visitId));

      // 4. Create payment record
      const [paymentRecord] = await tx
        .insert(payments)
        .values({
          invoiceId: input.invoiceId,
          amount: totalVal.toFixed(2),
          method: input.paymentMethod,
          status: "SUCCESS",
          paidAt: new Date(),
          processedBy: user.id,
        })
        .returning();

      return {
        invoice: updatedInvoice,
        payment: paymentRecord,
      };
    });

    revalidatePath("/cashier");
    revalidatePath(`/cashier/payment/${input.visitId}`);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi xử lý thanh toán" };
  }
}
