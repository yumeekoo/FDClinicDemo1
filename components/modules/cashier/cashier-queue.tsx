"use client";

import React, { useEffect, useState, useCallback, useTransition } from "react";
import { getPendingPaymentsAction } from "@/actions/cashier";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, CreditCard, Receipt, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface CashierQueueProps {
  branchId: string | null;
}

export function CashierQueue({ branchId }: CashierQueueProps) {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const fetchQueue = useCallback(async () => {
    if (!branchId) return;
    try {
      const res = await getPendingPaymentsAction();
      if (res.success) {
        setQueue(res.data);
        setError(null);
      } else {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err.message || "Lỗi tải hàng đợi thu ngân");
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    if (!branchId) {
      setQueue([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchQueue();

    const supabase = createClient();
    const channelName = `cashier-queue-${branchId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "visits",
          filter: `branch_id=eq.${branchId}`,
        },
        () => {
          fetchQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [branchId, fetchQueue]);

  const filteredQueue = queue.filter((item) => {
    const term = searchTerm.toLowerCase();
    const patientName = item.patient.fullName.toLowerCase();
    const patientCode = item.patient.patientCode.toLowerCase();
    const visitCode = item.visit.visitCode.toLowerCase();
    const invoiceCode = item.invoice?.invoiceCode?.toLowerCase() || "";
    return (
      patientName.includes(term) ||
      patientCode.includes(term) ||
      visitCode.includes(term) ||
      invoiceCode.includes(term)
    );
  });

  const pendingPayments = filteredQueue.filter((item) => item.visit.status === "COMPLETED");
  const completedPayments = filteredQueue.filter((item) => item.visit.status === "PAID");

  const formatCurrency = (val: string) => {
    const num = parseFloat(val);
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="border-gray-200 bg-gray-50/40 animate-pulse">
            <CardHeader className="h-16 border-b border-gray-200" />
            <CardContent className="h-64" />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-rose-900 bg-rose-950/20 text-center p-8 text-rose-400">
        <p>Đã xảy ra lỗi: {error}</p>
      </Card>
    );
  }

  const renderVisitCard = (item: any) => {
    const { visit, patient, doctor, invoice } = item;
    const timeAgo = formatDistanceToNow(new Date(visit.updatedAt), {
      addSuffix: true,
      locale: vi,
    });

    const isPendingPayment = visit.status === "COMPLETED";

    return (
      <Card
        key={visit.id}
        className="border-gray-200 bg-gray-50/40 hover:bg-gray-50/50 transition duration-150 relative overflow-hidden group"
      >
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${
            isPendingPayment ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
          }`}
        />
        <CardContent className="p-4 pl-5 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-gray-500 font-mono block">
                Mã khám: {visit.visitCode}
              </span>
              <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-400 transition">
                {patient.fullName}
              </h4>
              <p className="text-[10px] text-gray-500">
                {patient.gender === "MALE" ? "Nam" : patient.gender === "FEMALE" ? "Nữ" : "Khác"} • {new Date(patient.dateOfBirth).toLocaleDateString("vi-VN")}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] text-gray-500">{timeAgo}</span>
              <Badge className={isPendingPayment ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold"}>
                {isPendingPayment ? "Chờ thanh toán" : "Đã thanh toán"}
              </Badge>
            </div>
          </div>

          <div className="p-2.5 rounded bg-gray-50/80 border border-gray-200/50 flex justify-between items-center text-xs">
            <div className="space-y-0.5">
              <span className="text-gray-500 block text-[10px]">Hóa đơn: <strong className="text-gray-600 font-mono">{invoice?.invoiceCode}</strong></span>
              <span className="text-gray-500">BS chỉ định: <strong className="text-gray-700">{doctor.fullName}</strong></span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-500 block">Tổng cộng</span>
              <strong className="text-sm font-mono text-gray-900 font-extrabold">
                {formatCurrency(invoice?.totalAmount || invoice?.subtotal || "0.00")}
              </strong>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200 flex justify-end">
            {isPendingPayment ? (
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-500 text-gray-900 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                onClick={() => router.push(`/cashier/payment/${visit.id}`)}
              >
                <CreditCard className="h-3.5 w-3.5" />
                Thu tiền & Xuất hóa đơn
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="border-gray-200 hover:bg-gray-50 text-gray-600 font-medium text-xs flex items-center gap-1.5 cursor-pointer"
                onClick={() => router.push(`/cashier/payment/${visit.id}`)}
              >
                <Receipt className="h-3.5 w-3.5" />
                Xem lại / In hóa đơn
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 text-left">
      {/* Search and tools */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-500" />
          <Input
            placeholder="Tìm theo tên BN, mã BN, mã khám, mã hóa đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-gray-50/60 border-gray-200 text-gray-900"
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-900 text-xs"
          onClick={fetchQueue}
        >
          Làm mới hàng đợi
        </Button>
      </div>

      {/* Grid of Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: WAITING FOR PAYMENT */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-350 flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-amber-500" />
              Danh sách Chờ thanh toán
            </h3>
            <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
              {pendingPayments.length} BN
            </Badge>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-1">
            {pendingPayments.length === 0 ? (
              <Card className="border-dashed border-gray-200 bg-gray-50/10 py-12 text-center text-xs text-gray-500">
                <AlertCircle className="h-7 w-7 mx-auto mb-2 text-slate-600" />
                Không có bệnh nhân chờ thanh toán
              </Card>
            ) : (
              pendingPayments.map(renderVisitCard)
            )}
          </div>
        </div>

        {/* Column 2: PAID TODAY */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-350 flex items-center gap-2">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
              Lịch sử đã thanh toán hôm nay
            </h3>
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              {completedPayments.length} giao dịch
            </Badge>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-1">
            {completedPayments.length === 0 ? (
              <Card className="border-dashed border-gray-200 bg-gray-50/10 py-12 text-center text-xs text-gray-500">
                <AlertCircle className="h-7 w-7 mx-auto mb-2 text-slate-600" />
                Chưa có giao dịch thanh toán nào hôm nay
              </Card>
            ) : (
              completedPayments.map(renderVisitCard)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
