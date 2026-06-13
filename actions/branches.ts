"use server";

import { db } from "@/db";
import { branches, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResult<T> = 
  | { success: true; data: T } 
  | { success: false; error: string };

/**
 * Fetch all active branches.
 */
export async function getBranchesAction(): Promise<ActionResult<any[]>> {
  try {
    const list = await db
      .select()
      .from(branches)
      .where(eq(branches.isActive, true));

    return { success: true, data: list };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi lấy danh sách chi nhánh" };
  }
}

/**
 * Switch the active branch for the logged-in user (only if they are an ADMIN).
 */
export async function switchActiveBranchAction(branchId: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập" };
    }

    const role = user.user_metadata?.role;
    if (role !== "ADMIN") {
      return { success: false, error: "Chỉ quản trị viên mới có quyền chuyển đổi chi nhánh làm việc" };
    }

    // Check if the target branch exists and is active
    const targetBranch = await db
      .select()
      .from(branches)
      .where(eq(branches.id, branchId))
      .limit(1);

    if (targetBranch.length === 0 || !targetBranch[0].isActive) {
      return { success: false, error: "Chi nhánh không tồn tại hoặc đã bị vô hiệu hóa" };
    }

    // 1. Update the database profile
    await db
      .update(profiles)
      .set({ branchId })
      .where(eq(profiles.id, user.id));

    // 2. Update Supabase auth user metadata so the session matches
    const { error: updateAuthError } = await supabase.auth.updateUser({
      data: {
        branch_id: branchId,
        branch_name: targetBranch[0].name,
      },
    });

    if (updateAuthError) {
      return { success: false, error: "Lỗi đồng bộ session: " + updateAuthError.message };
    }

    revalidatePath("/", "layout");

    return { success: true, data: targetBranch[0] };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi chuyển đổi chi nhánh" };
  }
}
