"use server";

import { db } from "@/db";
import { appointments, patients, profiles, visits, patientBranchLinks, branches } from "@/db/schema";
import { eq, and, gte, lte, isNull, asc } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { appointmentSchema, AppointmentInput } from "@/lib/validations/appointments";
import { revalidatePath } from "next/cache";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function generateVisitCode(): string {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KH-${yyyy}${mm}${dd}-${rand}`;
}

/**
 * Fetch all appointments of a branch (filtered by role and date range).
 */
export async function getAppointmentsAction(selectedBranchId?: string): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    const role = user.user_metadata?.role;
    const userBranchId = user.user_metadata?.branch_id;

    // Enforce branch isolation
    let targetBranchId = selectedBranchId;
    if (role !== "ADMIN") {
      targetBranchId = userBranchId;
    }

    if (!targetBranchId) {
      return { success: false, error: "Không xác định được chi nhánh lấy lịch hẹn" };
    }

    // Fetch appointments with patient & doctor info
    const doctors = db.select().from(profiles).as("doctors");

    const list = await db
      .select({
        appointment: appointments,
        patient: patients,
        doctor: {
          id: profiles.id,
          fullName: profiles.fullName,
        },
      })
      .from(appointments)
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(profiles, eq(appointments.doctorId, profiles.id))
      .where(eq(appointments.branchId, targetBranchId))
      .orderBy(asc(appointments.scheduledAt));

    return { success: true, data: list };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi lấy danh sách lịch hẹn" };
  }
}

/**
 * Create a new appointment.
 */
export async function createAppointmentAction(input: AppointmentInput): Promise<ActionResult<any>> {
  try {
    const validated = appointmentSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    const branchId = user.user_metadata?.branch_id;
    if (!branchId) {
      return { success: false, error: "Tài khoản chưa liên kết với chi nhánh nào" };
    }

    const [newAppointment] = await db
      .insert(appointments)
      .values({
        patientId: input.patientId,
        branchId,
        doctorId: input.doctorId || null,
        scheduledAt: input.scheduledAt,
        durationMinutes: input.durationMinutes,
        status: "BOOKED",
        reason: input.reason,
        notes: input.notes || null,
      })
      .returning();

    revalidatePath("/admin/appointments");
    return { success: true, data: newAppointment };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi tạo lịch hẹn" };
  }
}

/**
 * Update appointment status.
 */
export async function updateAppointmentStatusAction(
  appointmentId: string,
  status: "BOOKED" | "CONFIRMED" | "ARRIVED" | "CANCELLED" | "NO_SHOW"
): Promise<ActionResult<any>> {
  try {
    const [updated] = await db
      .update(appointments)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, appointmentId))
      .returning();

    revalidatePath("/admin/appointments");
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi cập nhật trạng thái lịch hẹn" };
  }
}

/**
 * Check-in an arrived appointment, creating a visit queue entry.
 */
export async function checkInAppointmentAction(appointmentId: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    const receptionistId = user.id;

    // 1. Fetch appointment details
    const [appt] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appt) {
      return { success: false, error: "Không tìm thấy lịch hẹn" };
    }

    if (appt.status === "ARRIVED") {
      return { success: false, error: "Lịch hẹn này đã được check-in trước đó" };
    }

    if (!appt.doctorId) {
      return { success: false, error: "Lịch hẹn phải được chỉ định bác sĩ trước khi check-in" };
    }

    const visitCode = generateVisitCode();

    // 2. Perform check-in in database transaction
    const newVisit = await db.transaction(async (tx) => {
      // Create visit
      const [insertedVisit] = await tx
        .insert(visits)
        .values({
          visitCode,
          patientId: appt.patientId,
          branchId: appt.branchId,
          doctorId: appt.doctorId!,
          receptionistId,
          status: "WAITING",
          chiefComplaint: `Khám theo lịch hẹn: ${appt.reason}`,
          medicalHistory: "Khám theo lịch hẹn",
        })
        .returning();

      // Update appointment status to ARRIVED
      await tx
        .update(appointments)
        .set({
          status: "ARRIVED",
          updatedAt: new Date(),
        })
        .where(eq(appointments.id, appointmentId));

      // Manage patient branch linkage
      const links = await tx
        .select()
        .from(patientBranchLinks)
        .where(
          and(
            eq(patientBranchLinks.patientId, appt.patientId),
            eq(patientBranchLinks.branchId, appt.branchId)
          )
        );

      if (links.length > 0) {
        await tx
          .update(patientBranchLinks)
          .set({
            visitCount: links[0].visitCount + 1,
            lastVisitAt: new Date(),
          })
          .where(eq(patientBranchLinks.id, links[0].id));
      } else {
        await tx.insert(patientBranchLinks).values({
          patientId: appt.patientId,
          branchId: appt.branchId,
          visitCount: 1,
          isPrimary: false,
          lastVisitAt: new Date(),
        });
      }

      return insertedVisit;
    });

    revalidatePath("/admin/appointments");
    revalidatePath("/reception/queue");
    return { success: true, data: newVisit };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi check-in lịch hẹn" };
  }
}
