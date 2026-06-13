import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClinicQueue } from "@/components/modules/doctor/clinic-queue";

export default async function DoctorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const branchId = user.user_metadata?.branch_id || null;
  const role = user.user_metadata?.role || "DOCTOR";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Phòng khám Bác Sĩ</h1>
        <p className="text-slate-400 mt-1">
          Quản lý hàng đợi khám lâm sàng, lập chỉ định cận lâm sàng và kê toa thuốc điều trị.
        </p>
      </div>
      <ClinicQueue branchId={branchId} role={role} />
    </div>
  );
}
