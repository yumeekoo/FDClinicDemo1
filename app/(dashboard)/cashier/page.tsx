import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CashierQueue } from "@/components/modules/cashier/cashier-queue";

export default async function CashierDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const branchId = user.user_metadata?.branch_id || null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Quầy Thu Ngân</h1>
        <p className="text-slate-400 mt-1">
          Duyệt viện phí, áp dụng giảm trừ BHYT/ưu đãi và xử lý thanh toán viện phí của bệnh nhân.
        </p>
      </div>
      <CashierQueue branchId={branchId} />
    </div>
  );
}
