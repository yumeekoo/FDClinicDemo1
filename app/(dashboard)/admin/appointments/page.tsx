import React from "react";
import { db } from "@/db";
import { patients, profiles } from "@/db/schema";
import { getAppointmentsAction } from "@/actions/appointments";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isNull, and, eq } from "drizzle-orm";
import { AppointmentsClient } from "./appointments-client";

export default async function AppointmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = user.user_metadata?.role;
  const userBranchId = user.user_metadata?.branch_id || null;

  // Verify access role (ADMIN, BRANCH_ADMIN, RECEPTION)
  if (role !== "ADMIN" && role !== "BRANCH_ADMIN" && role !== "RECEPTION") {
    redirect("/");
  }

  if (!userBranchId) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
        Tài khoản của bạn chưa được liên kết với chi nhánh làm việc nào
      </div>
    );
  }

  // 1. Fetch appointments list for the branch
  const apptsRes = await getAppointmentsAction(userBranchId);
  if (!apptsRes.success) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
        Lỗi khi tải lịch hẹn: {apptsRes.error}
      </div>
    );
  }

  // 2. Fetch active patients list (only non-deleted) for booking selection
  const patientsList = await db
    .select({
      id: patients.id,
      fullName: patients.fullName,
      patientCode: patients.patientCode,
      phone: patients.phone,
    })
    .from(patients)
    .where(isNull(patients.deletedAt))
    .orderBy(patients.fullName);

  // 3. Fetch active doctors for the current branch
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
        eq(profiles.branchId, userBranchId)
      )
    )
    .orderBy(profiles.fullName);

  return (
    <AppointmentsClient
      initialAppointments={apptsRes.data || []}
      patientsList={patientsList}
      doctorsList={doctorsList}
      currentUserRole={role}
    />
  );
}
