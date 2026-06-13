"use client";

import React, { useEffect, useState, useCallback, useTransition } from "react";
import { getParaclinicalQueueAction, startClsOrderAction } from "@/actions/paraclinical";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Search, Play, FileEdit, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface ClsQueueProps {
  branchId: string | null;
}

export function ClsQueue({ branchId }: ClsQueueProps) {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const fetchQueue = useCallback(async () => {
    if (!branchId) return;
    try {
      const res = await getParaclinicalQueueAction();
      if (res.success) {
        setQueue(res.data);
        setError(null);
      } else {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err.message || "Lỗi tải hàng đợi cận lâm sàng");
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
    const channelName = `paraclinical-queue-${branchId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cls_orders",
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

  const handleStartCls = (orderId: string) => {
    startTransition(async () => {
      try {
        const res = await startClsOrderAction(orderId);
        if (res.success) {
          toast.success("Bắt đầu thực hiện y lệnh...");
          router.push(`/paraclinical/order/${orderId}`);
        } else {
          toast.error(res.error || "Không thể bắt đầu thực hiện");
        }
      } catch (error) {
        toast.error("Có lỗi xảy ra");
      }
    });
  };

  // Filter based on search term
  const filteredQueue = queue.filter((item) => {
    const term = searchTerm.toLowerCase();
    const patientName = item.patient.fullName.toLowerCase();
    const patientCode = item.patient.patientCode.toLowerCase();
    const serviceName = item.order.serviceName.toLowerCase();
    const orderCode = item.order.orderCode.toLowerCase();
    return (
      patientName.includes(term) ||
      patientCode.includes(term) ||
      serviceName.includes(term) ||
      orderCode.includes(term)
    );
  });

  const pendingOrders = filteredQueue.filter((item) => item.order.status === "PENDING");
  const inProgressOrders = filteredQueue.filter((item) => item.order.status === "IN_PROGRESS");
  const completedOrders = filteredQueue.filter((item) => item.order.status === "COMPLETED");

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-slate-800 bg-slate-900/40 animate-pulse">
            <CardHeader className="h-16 border-b border-slate-850" />
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

  const renderOrderCard = (item: any) => {
    const { order, patient, doctor, result } = item;
    const timeAgo = formatDistanceToNow(new Date(order.orderedAt), {
      addSuffix: true,
      locale: vi,
    });

    const isUrgent = order.priority === "URGENT";

    return (
      <Card
        key={order.id}
        className="border-slate-800 bg-slate-950/40 hover:bg-slate-900/50 transition duration-150 relative overflow-hidden group"
      >
        {/* State strip */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${
            isUrgent
              ? "bg-rose-500 animate-pulse"
              : order.status === "PENDING"
              ? "bg-amber-500"
              : order.status === "IN_PROGRESS"
              ? "bg-blue-500"
              : "bg-emerald-500"
          }`}
        />
        <CardContent className="p-4 pl-5 space-y-3">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block">
                {order.orderCode}
              </span>
              <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition">
                {patient.fullName}
              </h4>
              <p className="text-[10px] text-slate-400">
                {patient.gender === "MALE" ? "Nam" : patient.gender === "FEMALE" ? "Nữ" : "Khác"} • {new Date(patient.dateOfBirth).toLocaleDateString("vi-VN")}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[10px] text-slate-500">{timeAgo}</span>
              {isUrgent ? (
                <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-bold py-0 px-1.5 animate-pulse">
                  KHẨN CẤP
                </Badge>
              ) : (
                <Badge className="bg-slate-800 text-slate-400 border border-slate-700 text-[9px] font-bold py-0 px-1.5">
                  Thường
                </Badge>
              )}
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-900/80 border border-slate-850/50 space-y-1">
            <div className="text-xs font-semibold text-slate-200 flex items-start gap-1">
              <span className="text-slate-500">Chỉ định:</span>
              <span>{order.serviceName}</span>
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between">
              <div>
                <span className="text-slate-650">Bác sĩ: </span>
                <span className="font-semibold">{doctor.fullName}</span>
              </div>
              <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-mono py-0 scale-90 origin-right">
                {order.serviceType}
              </Badge>
            </div>
            {order.notes && (
              <div className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-850/30">
                Ghi chú: {order.notes}
              </div>
            )}
          </div>

          {order.status === "COMPLETED" && result && (
            <div className="p-2 rounded bg-emerald-500/5 border border-emerald-500/10 text-xs text-slate-350 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Kết quả: {result.isAbnormal ? "BẤT THƯỜNG" : "Bình thường"}</span>
              </div>
              <p className="line-clamp-2 text-[10px] text-slate-400 italic">
                "{result.resultText}"
              </p>
              {result.fileUrls && result.fileUrls.length > 0 && (
                <span className="text-[9px] text-slate-500 font-mono block">
                  Đính kèm: {result.fileUrls.length} file
                </span>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-slate-850 flex justify-end gap-2">
            {order.status === "PENDING" && (
              <Button
                size="sm"
                disabled={isPending}
                className="bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs flex items-center gap-1"
                onClick={() => handleStartCls(order.id)}
              >
                <Play className="h-3 w-3" />
                Bắt đầu làm
              </Button>
            )}

            {order.status === "IN_PROGRESS" && (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1"
                onClick={() => router.push(`/paraclinical/order/${order.id}`)}
              >
                <FileEdit className="h-3 w-3" />
                Nhập kết quả
              </Button>
            )}

            {order.status === "COMPLETED" && (
              <Button
                size="sm"
                variant="outline"
                className="border-slate-800 hover:bg-slate-900 text-slate-300 font-medium text-xs flex items-center gap-1"
                onClick={() => router.push(`/paraclinical/order/${order.id}`)}
              >
                <FileText className="h-3 w-3" />
                Xem / Sửa kết quả
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 text-left">
      {/* Search and refresh tools */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-500" />
          <Input
            placeholder="Tìm theo tên BN, mã BN, tên dịch vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-900/60 border-slate-800 text-white"
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white text-xs"
            onClick={fetchQueue}
          >
            Làm mới hàng đợi
          </Button>
        </div>
      </div>

      {/* Grid of Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: WAITING / PENDING */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Chờ thực hiện
            </h3>
            <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
              {pendingOrders.length}
            </Badge>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-1">
            {pendingOrders.length === 0 ? (
              <Card className="border-dashed border-slate-800 bg-slate-900/10 py-10 text-center text-xs text-slate-500">
                <AlertCircle className="h-6.5 w-6.5 mx-auto mb-2 text-slate-600" />
                Không có y lệnh chờ thực hiện
              </Card>
            ) : (
              pendingOrders.map(renderOrderCard)
            )}
          </div>
        </div>

        {/* Column 2: IN_PROGRESS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Đang thực hiện
            </h3>
            <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              {inProgressOrders.length}
            </Badge>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-1">
            {inProgressOrders.length === 0 ? (
              <Card className="border-dashed border-slate-800 bg-slate-900/10 py-10 text-center text-xs text-slate-500">
                <AlertCircle className="h-6.5 w-6.5 mx-auto mb-2 text-slate-600" />
                Không có y lệnh đang thực hiện
              </Card>
            ) : (
              inProgressOrders.map(renderOrderCard)
            )}
          </div>
        </div>

        {/* Column 3: COMPLETED */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Đã hoàn tất hôm nay
            </h3>
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              {completedOrders.length}
            </Badge>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-1">
            {completedOrders.length === 0 ? (
              <Card className="border-dashed border-slate-800 bg-slate-900/10 py-10 text-center text-xs text-slate-500">
                <AlertCircle className="h-6.5 w-6.5 mx-auto mb-2 text-slate-600" />
                Chưa có y lệnh nào hoàn tất hôm nay
              </Card>
            ) : (
              completedOrders.map(renderOrderCard)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
