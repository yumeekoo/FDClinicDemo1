"use server";

import { db } from "@/db";
import { patients, patientBranchLinks } from "@/db/schema";
import { eq, or, ilike } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { PatientInput, patientSchema } from "@/lib/validations/patient";

type ActionResult<T> = 
  | { success: true; data: T } 
  | { success: false; error: string };

// Helper to generate patient code: BN-YYYYMMDD-XXXX
function generatePatientCode(): string {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  // Random 4 character alphanumeric
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BN-${yyyy}${mm}${dd}-${rand}`;
}

/**
 * MPI Search: Search patients globally across all branches by phone or CCCD.
 */
export async function searchPatientsAction(query: string): Promise<ActionResult<any[]>> {
  try {
    if (!query || query.trim() === "") {
      return { success: true, data: [] };
    }

    const trimmedQuery = query.trim();

    // Query patients table matching phone or CCCD using manual left join
    const rows = await db
      .select({
        patient: patients,
        link: patientBranchLinks,
      })
      .from(patients)
      .leftJoin(patientBranchLinks, eq(patients.id, patientBranchLinks.patientId))
      .where(
        or(
          ilike(patients.phone, `%${trimmedQuery}%`),
          eq(patients.cccd, trimmedQuery)
        )
      );

    // Group rows by patient ID
    const patientsMap = new Map<string, any>();
    for (const row of rows) {
      const p = row.patient;
      const l = row.link;
      if (!patientsMap.has(p.id)) {
        patientsMap.set(p.id, {
          id: p.id,
          patientCode: p.patientCode,
          fullName: p.fullName,
          dateOfBirth: p.dateOfBirth,
          gender: p.gender,
          phone: p.phone,
          cccd: p.cccd,
          bhytCode: p.bhytCode,
          address: p.address,
          bloodType: p.bloodType,
          allergies: p.allergies,
          primaryBranchId: p.primaryBranchId,
          notes: p.notes,
          branchLinks: [],
        });
      }
      if (l) {
        patientsMap.get(p.id).branchLinks.push(l);
      }
    }

    return { success: true, data: Array.from(patientsMap.values()) };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi tìm kiếm bệnh nhân" };
  }
}

/**
 * Create a new patient in the MPI system and link them to the current branch.
 */
export async function createPatientAction(input: PatientInput): Promise<ActionResult<any>> {
  try {
    const validated = patientSchema.safeParse(input);
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

    const patientCode = generatePatientCode();

    // Insert patient inside transaction to ensure both links and patient are created
    const newPatient = await db.transaction(async (tx) => {
      const [insertedPatient] = await tx.insert(patients).values({
        patientCode,
        fullName: input.fullName,
        dateOfBirth: input.dateOfBirth,
        gender: input.gender,
        phone: input.phone,
        cccd: input.cccd || null,
        bhytCode: input.bhytCode || null,
        address: input.address,
        bloodType: input.bloodType || null,
        allergies: input.allergies || [],
        primaryBranchId: currentBranchId,
        notes: input.notes || null,
      }).returning();

      // Create branch link
      await tx.insert(patientBranchLinks).values({
        patientId: insertedPatient.id,
        branchId: currentBranchId,
        visitCount: 0,
        isPrimary: true,
      });

      return insertedPatient;
    });

    return { success: true, data: newPatient };
  } catch (error: any) {
    if (error.message?.includes("cccd")) {
      return { success: false, error: "Số CCCD đã tồn tại trong hệ thống" };
    }
    if (error.message?.includes("patient_code")) {
      return { success: false, error: "Mã bệnh nhân đã tồn tại" };
    }
    return { success: false, error: error.message || "Lỗi khi tạo bệnh nhân" };
  }
}

/**
 * Link an existing patient from another branch to the current branch.
 */
export async function linkPatientToBranchAction(patientId: string): Promise<ActionResult<any>> {
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

    // Insert new branch link, if conflict do nothing
    const [link] = await db.insert(patientBranchLinks).values({
      patientId,
      branchId: currentBranchId,
      visitCount: 0,
      isPrimary: false,
    })
    .onConflictDoNothing()
    .returning();

    return { success: true, data: link || { message: "Đã liên kết trước đó" } };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi liên kết chi nhánh" };
  }
}
