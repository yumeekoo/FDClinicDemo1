"use server";

import { db } from "@/db";
import { patients, visits, vitals, patientBranchLinks, profiles } from "@/db/schema";
import { eq, and, gte, isNull, asc, aliasedTable } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { VisitInput, visitSchema, VitalsInput, vitalsSchema } from "@/lib/validations/visit";

type ActionResult<T> = 
  | { success: true; data: T } 
  | { success: false; error: string };

// Helper to generate visit code: KH-YYYYMMDD-XXXX
function generateVisitCode(): string {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  // Random 4 character alphanumeric
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KH-${yyyy}${mm}${dd}-${rand}`;
}

/**
 * Get active doctors for the current user's branch.
 */
export async function getDoctorsAction(): Promise<ActionResult<any[]>> {
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

    const doctorsList = await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
        employeeCode: profiles.employeeCode,
      })
      .from(profiles)
      .where(
        and(
          eq(profiles.role, "DOCTOR"),
          eq(profiles.isActive, true),
          eq(profiles.branchId, currentBranchId)
        )
      );

    return { success: true, data: doctorsList };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi lấy danh sách bác sĩ" };
  }
}

/**
 * Register a new clinic visit for a patient.
 */
export async function createVisitAction(input: VisitInput): Promise<ActionResult<any>> {
  try {
    const validated = visitSchema.safeParse(input);
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
      return { success: false, error: "Tài khoản của bạn chưa được liên kết với chi nhánh nào" };
    }

    const visitCode = generateVisitCode();

    const newVisit = await db.transaction(async (tx) => {
      // 1. Insert the visit
      const [insertedVisit] = await tx.insert(visits).values({
        visitCode,
        patientId: input.patientId,
        branchId: currentBranchId,
        doctorId: input.doctorId,
        receptionistId: user.id,
        status: "WAITING",
        chiefComplaint: input.chiefComplaint,
        medicalHistory: input.medicalHistory || "Không có",
      }).returning();

      // 2. Increment visit count and update lastVisitAt on the branch link
      const links = await tx
        .select()
        .from(patientBranchLinks)
        .where(
          and(
            eq(patientBranchLinks.patientId, input.patientId),
            eq(patientBranchLinks.branchId, currentBranchId)
          )
        );

      if (links.length > 0) {
        // Update existing link
        await tx
          .update(patientBranchLinks)
          .set({
            visitCount: links[0].visitCount + 1,
            lastVisitAt: new Date(),
          })
          .where(eq(patientBranchLinks.id, links[0].id));
      } else {
        // Insert new branch link (safety fallback in case they weren't linked)
        await tx.insert(patientBranchLinks).values({
          patientId: input.patientId,
          branchId: currentBranchId,
          visitCount: 1,
          isPrimary: false,
          lastVisitAt: new Date(),
        });
      }

      return insertedVisit;
    });

    return { success: true, data: newVisit };
  } catch (error: any) {
    if (error.message?.includes("visit_code")) {
      return { success: false, error: "Mã lượt khám đã tồn tại, vui lòng thử lại" };
    }
    return { success: false, error: error.message || "Lỗi khi tạo lượt khám" };
  }
}

/**
 * Record vitals for a patient visit.
 */
export async function updateVitalsAction(visitId: string, vitalsData: VitalsInput): Promise<ActionResult<any>> {
  try {
    const validated = vitalsSchema.safeParse(vitalsData);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    // Upsert vitals record for this visit
    const result = await db.transaction(async (tx) => {
      // Check if vitals already exists
      const existing = await tx
        .select()
        .from(vitals)
        .where(eq(vitals.visitId, visitId))
        .limit(1);

      let savedVitals;
      if (existing.length > 0) {
        // Update
        [savedVitals] = await tx
          .update(vitals)
          .set({
            bloodPressureSystolic: vitalsData.bloodPressureSystolic,
            bloodPressureDiastolic: vitalsData.bloodPressureDiastolic,
            heartRate: vitalsData.heartRate,
            temperature: vitalsData.temperature.toString(),
            weight: vitalsData.weight.toString(),
            height: vitalsData.height.toString(),
            spo2: vitalsData.spo2,
            notes: vitalsData.notes || null,
            recordedBy: user.id,
            updatedAt: new Date(),
          })
          .where(eq(vitals.id, existing[0].id))
          .returning();
      } else {
        // Insert
        [savedVitals] = await tx
          .insert(vitals)
          .values({
            visitId,
            bloodPressureSystolic: vitalsData.bloodPressureSystolic,
            bloodPressureDiastolic: vitalsData.bloodPressureDiastolic,
            heartRate: vitalsData.heartRate,
            temperature: vitalsData.temperature.toString(),
            weight: vitalsData.weight.toString(),
            height: vitalsData.height.toString(),
            spo2: vitalsData.spo2,
            notes: vitalsData.notes || null,
            recordedBy: user.id,
          })
          .returning();
      }

      return savedVitals;
    });

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi lưu chỉ số sinh hiệu" };
  }
}

/**
 * Fetch patient visits queue for the current branch.
 */
export async function getVisitsQueueAction(): Promise<ActionResult<any[]>> {
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

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const doctors = aliasedTable(profiles, "doctors");

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
      .where(
        and(
          eq(visits.branchId, currentBranchId),
          isNull(visits.deletedAt),
          gte(visits.createdAt, startOfToday)
        )
      )
      .orderBy(asc(visits.createdAt));

    // Return mapped/formatted rows
    return { success: true, data: rows };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi lấy hàng đợi khám" };
  }
}
