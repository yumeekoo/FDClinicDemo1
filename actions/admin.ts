"use server";

import { db } from "@/db";
import { branches, profiles, visits, invoices, inventoryItems } from "@/db/schema";
import { eq, and, gte, lte, isNull, sql } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { branchSchema, BranchInput, employeeSchema, EmployeeInput } from "@/lib/validations/admin";
import { revalidatePath } from "next/cache";
import { getDashboardStats } from "@/services/admin.service";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Fetch stats for the admin dashboard (today's totals, drug status, and 7-day trend).
 */
export async function getAdminStatsAction(selectedBranchId?: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    const role = user.user_metadata?.role;
    const userBranchId = user.user_metadata?.branch_id;

    // Enforce branch isolation for BRANCH_ADMIN
    let targetBranchId = selectedBranchId;
    if (role === "BRANCH_ADMIN") {
      targetBranchId = userBranchId;
    }

    const data = await getDashboardStats(targetBranchId);

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi lấy thống kê" };
  }
}

/**
 * Create a new branch. (Super Admin only)
 */
export async function createBranchAction(input: BranchInput): Promise<ActionResult<any>> {
  try {
    const validated = branchSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== "ADMIN") {
      return { success: false, error: "Bạn không có quyền thực hiện thao tác này" };
    }

    const [newBranch] = await db
      .insert(branches)
      .values({
        name: input.name,
        address: input.address,
        phone: input.phone,
        code: input.code,
        isActive: input.isActive,
      })
      .returning();

    revalidatePath("/admin/branches");
    return { success: true, data: newBranch };
  } catch (error: any) {
    if (error.message?.includes("branches_code_key") || error.message?.includes("unique")) {
      return { success: false, error: "Mã chi nhánh đã tồn tại" };
    }
    return { success: false, error: error.message || "Lỗi khi tạo chi nhánh" };
  }
}

/**
 * Update branch details. (Super Admin only)
 */
export async function updateBranchAction(branchId: string, input: BranchInput): Promise<ActionResult<any>> {
  try {
    const validated = branchSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.user_metadata?.role !== "ADMIN") {
      return { success: false, error: "Bạn không có quyền thực hiện thao tác này" };
    }

    const [updated] = await db
      .update(branches)
      .set({
        name: input.name,
        address: input.address,
        phone: input.phone,
        code: input.code,
        isActive: input.isActive,
        updatedAt: new Date(),
      })
      .where(eq(branches.id, branchId))
      .returning();

    revalidatePath("/admin/branches");
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi cập nhật chi nhánh" };
  }
}

/**
 * Fetch employee profiles.
 */
export async function getAdminUsersAction(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    const role = user.user_metadata?.role;
    const userBranchId = user.user_metadata?.branch_id;

    let query = db.select().from(profiles);

    // Branch Admin can only view their own branch users
    if (role === "BRANCH_ADMIN") {
      if (!userBranchId) {
        return { success: false, error: "Không tìm thấy chi nhánh của tài khoản quản trị" };
      }
      query = query.where(eq(profiles.branchId, userBranchId)) as any;
    }

    const list = await query;
    return { success: true, data: list };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi lấy danh sách nhân viên" };
  }
}

/**
 * Create a new employee in both Supabase auth and profiles table.
 */
export async function createEmployeeAction(input: EmployeeInput): Promise<ActionResult<any>> {
  try {
    const validated = employeeSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    const currentRole = currentUser.user_metadata?.role;
    const userBranchId = currentUser.user_metadata?.branch_id;

    // Enforce role permission
    if (currentRole !== "ADMIN" && currentRole !== "BRANCH_ADMIN") {
      return { success: false, error: "Bạn không có quyền thực hiện thao tác này" };
    }

    // Branch Admin can only create users inside their own branch
    if (currentRole === "BRANCH_ADMIN" && input.branchId !== userBranchId) {
      return { success: false, error: "Quản trị chi nhánh chỉ có thể tạo nhân viên cho chi nhánh mình" };
    }

    // Fetch branch name to set metadata
    const [branch] = await db.select().from(branches).where(eq(branches.id, input.branchId)).limit(1);
    if (!branch) {
      return { success: false, error: "Chi nhánh không tồn tại" };
    }

    if (!input.password) {
      return { success: false, error: "Mật khẩu cho nhân viên mới là bắt buộc" };
    }

    // 1. Create auth user via supabaseAdmin
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        role: input.role,
        branch_id: input.branchId,
        branch_name: branch.name,
        full_name: input.fullName,
      },
    });

    if (authError || !authUser.user) {
      return { success: false, error: "Lỗi đăng ký tài khoản Auth: " + (authError?.message || "") };
    }

    // 2. Insert profile record in transaction
    const newProfile = await db.insert(profiles).values({
      id: authUser.user.id,
      fullName: input.fullName,
      phone: input.phone,
      role: input.role,
      branchId: input.branchId,
      employeeCode: input.employeeCode,
      isActive: input.isActive,
    }).returning();

    revalidatePath("/admin/users");
    return { success: true, data: newProfile[0] };
  } catch (error: any) {
    if (error.message?.includes("employee_code") || error.message?.includes("unique")) {
      return { success: false, error: "Mã nhân viên đã tồn tại" };
    }
    return { success: false, error: error.message || "Lỗi khi thêm nhân viên" };
  }
}

/**
 * Update employee details (profiles only).
 */
export async function updateEmployeeAction(
  employeeId: string,
  input: Omit<EmployeeInput, "email" | "password">
): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    const currentRole = currentUser.user_metadata?.role;
    const userBranchId = currentUser.user_metadata?.branch_id;

    if (currentRole !== "ADMIN" && currentRole !== "BRANCH_ADMIN") {
      return { success: false, error: "Bạn không có quyền thực hiện thao tác này" };
    }

    // Check target profile
    const [targetProfile] = await db.select().from(profiles).where(eq(profiles.id, employeeId)).limit(1);
    if (!targetProfile) {
      return { success: false, error: "Không tìm thấy hồ sơ nhân viên" };
    }

    // Enforce branch bounds for Branch Admin
    if (currentRole === "BRANCH_ADMIN") {
      if (targetProfile.branchId !== userBranchId || input.branchId !== userBranchId) {
        return { success: false, error: "Quản trị chi nhánh chỉ có quyền quản lý nhân viên thuộc chi nhánh mình" };
      }
    }

    // Fetch branch name to sync meta if branch changes
    const [branch] = await db.select().from(branches).where(eq(branches.id, input.branchId)).limit(1);
    if (!branch) {
      return { success: false, error: "Chi nhánh không tồn tại" };
    }

    // Update profiles table
    const [updatedProfile] = await db
      .update(profiles)
      .set({
        fullName: input.fullName,
        phone: input.phone,
        role: input.role,
        branchId: input.branchId,
        employeeCode: input.employeeCode,
        isActive: input.isActive,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, employeeId))
      .returning();

    // Sync metadata inside auth
    await supabaseAdmin.auth.admin.updateUserById(employeeId, {
      user_metadata: {
        role: input.role,
        branch_id: input.branchId,
        branch_name: branch.name,
        full_name: input.fullName,
      },
    });

    revalidatePath("/admin/users");
    return { success: true, data: updatedProfile };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi cập nhật nhân viên" };
  }
}
