import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import React from "react";
import { BranchProvider } from "@/hooks/use-branch";
import { ErrorBoundary } from "@/components/error-boundary";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = user.user_metadata?.role || "RECEPTION";
  const fullName = user.user_metadata?.full_name || user.email || "Nhân viên";
  const branchName = user.user_metadata?.branch_name || "Chi nhánh mặc định";
  const branchId = user.user_metadata?.branch_id || null;

  return (
    <BranchProvider initialBranchId={branchId} initialBranchName={branchName}>
      <div className="flex h-screen bg-[#F5F7FA] text-foreground overflow-hidden">
        {/* Interactive Sidebar */}
        <DashboardSidebar fullName={fullName} role={role} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-border bg-white/80 flex items-center justify-between px-8 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-foreground">Bảng điều khiển</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Clock or auxiliary info */}
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("vi-VN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-[#F5F7FA] p-6">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </BranchProvider>
  );
}
