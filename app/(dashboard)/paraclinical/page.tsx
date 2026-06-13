import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClsQueue } from "@/components/modules/paraclinical/cls-queue";

export default async function ParaclinicalDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const branchId = user.user_metadata?.branch_id || null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Khu Cận Lâm Sàng</h1>
        <p className="text-slate-400 mt-1">
          Tiếp nhận y lệnh, thực hiện kỹ thuật và trả kết quả xét nghiệm, chẩn đoán hình ảnh.
        </p>
      </div>
      <ClsQueue branchId={branchId} />
    </div>
  );
}
