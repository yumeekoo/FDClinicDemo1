import React from "react";
import { getAdminUsersAction } from "@/actions/admin";
import { getBranchesAction } from "@/actions/branches";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UsersClient } from "./users-client";

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = user.user_metadata?.role;
  const userBranchId = user.user_metadata?.branch_id || null;

  if (role !== "ADMIN" && role !== "BRANCH_ADMIN") {
    redirect("/");
  }

  // Fetch users list
  const usersRes = await getAdminUsersAction();
  if (!usersRes.success) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
        Lỗi khi tải danh sách nhân viên: {usersRes.error}
      </div>
    );
  }

  // Fetch branches list for filtering
  const branchesRes = await getBranchesAction();
  if (!branchesRes.success) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
        Lỗi khi tải danh sách chi nhánh: {branchesRes.error}
      </div>
    );
  }

  return (
    <UsersClient
      initialProfiles={usersRes.data || []}
      branches={branchesRes.data || []}
      currentUserRole={role}
      currentUserBranchId={userBranchId}
    />
  );
}
