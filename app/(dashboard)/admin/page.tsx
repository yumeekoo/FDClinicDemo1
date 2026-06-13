import React from "react";
import { getAdminStatsAction } from "@/actions/admin";
import { getBranchesAction } from "@/actions/branches";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminClient } from "./admin-client";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = user.user_metadata?.role || "RECEPTION";
  const userBranchId = user.user_metadata?.branch_id || null;

  // Fetch initial dashboard stats
  const statsRes = await getAdminStatsAction();
  if (!statsRes.success) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
        Lỗi khi tải dữ liệu báo cáo: {statsRes.error}
      </div>
    );
  }

  // Fetch active branches list for filtering
  let branchesList: any[] = [];
  if (role === "ADMIN") {
    const branchesRes = await getBranchesAction();
    if (branchesRes.success) {
      branchesList = branchesRes.data;
    }
  }

  return (
    <AdminClient
      initialStats={statsRes.data}
      branches={branchesList}
      role={role}
      userBranchId={userBranchId}
    />
  );
}
