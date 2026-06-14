"use client";

import React, { useEffect, useState, useCallback, useTransition, useRef } from "react";
import { getDoctorQueueAction, startExaminationAction, seedInventoryForDemoAction } from "@/actions/doctor";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface ClinicQueueProps {
  branchId: string | null;
  role: string;
}

export function ClinicQueue({ branchId, role }: ClinicQueueProps) {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const queueRef = useRef(queue);
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  const fetchQueue = useCallback(async () => {
    if (!branchId) return;
    try {
      const res = await getDoctorQueueAction();
      if (res.success) {
        setQueue(res.data);
        setError(null);
      } else {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err.message || "Lỗi tải hàng đợi khám");
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
    const channelName = `doctor-queue-${branchId}`;

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
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "cls_orders",
          filter: `branch_id=eq.${branchId}`,
        },
        (payload: any) => {
          if (
            payload.new &&
            payload.new.status === "COMPLETED" &&
            payload.old &&
            payload.old.status !== "COMPLETED"
          ) {
            const matched = queueRef.current.find(
              (item) => item.visit.id === payload.new.visit_id
            );
            if (matched) {
              toast.info(
                `Bệnh nhân ${matched.patient.fullName} đã có kết quả cận lâm sàng: ${payload.new.service_name}`
              );
            }
            fetchQueue();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [branchId, fetchQueue]);

  const handleStartExam = (visitId: string) => {
    startTransition(async () => {
      try {
        const res = await startExaminationAction(visitId);
        if (res.success) {
          toast.success("Đang bắt đầu lượt khám...");
          router.push(`/doctor/examination/${visitId}`);
        } else {
          toast.error(res.error || "Không thể bắt đầu ca khám");
        }
      } catch (error) {
        toast.error("Có lỗi xảy ra");
      }
    });
  };

  const handleSeedInventory = async () => {
    try {
      const res = await seedInventoryForDemoAction();
      if (res.success) {
        toast.success(res.data);
      } else {
        toast.error(res.error || "Lỗi nạp thuốc");
      }
    } catch (error) {
      toast.error("Lỗi kết nối");
    }
  };

  const waitingForDoc = queue.filter(
    (item) => item.visit.status === "WAITING" && item.vitals
  );
  const activeExams = queue.filter((item) => item.visit.status === "IN_PROGRESS");
  const clsPending = queue.filter((item) => item.visit.status === "CLS_PENDING");

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
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

  const renderPatientCard = (item: any) => {
    const { visit, patient, vitals } = item;
    const timeAgo = formatDistanceToNow(new Date(visit.createdAt), {
      addSuffix: true,
      locale: vi,
    });

    return (
      <Card
        key={visit.id}
        className="border-gray-200 bg-gray-50/40 hover:bg-gray-50/60 transition duration-150 relative overflow-hidden group"
      >
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${
            visit.status === "WAITING"
              ? "bg-sky-500"
              : visit.status === "IN_PROGRESS"
              ? "bg-emerald-500"
              : "bg-purple-500"
          }`}
        />
        <CardContent className="p-4 pl-5 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-400 transition">
                {patient.fullName}
              </h4>
              <p className="text-[10px] text-gray-500 font-mono">
                {patient.patientCode} • {visit.visitCode}
              </p>
            </div>
            <span className="text-[10px] text-gray-500">{timeAgo}</span>
          </div>

          <div className="text-xs space-y-1 text-slate-350">
            <div>
              <span className="text-gray-500">Giới tính: </span>
              <span>{patient.gender === "MALE" ? "Nam" : patient.gender === "FEMALE" ? "Nữ" : "Khác"}</span>
              <span className="text-slate-600 mx-1.5">|</span>
              <span className="text-gray-500">Ngày sinh: </span>
              <span>{new Date(patient.dateOfBirth).toLocaleDateString("vi-VN")}</span>
            </div>
            <div>
              <span className="text-gray-500">Lý do khám: </span>
              <span className="text-gray-700">{visit.chiefComplaint}</span>
            </div>
          </div>

          {vitals && (
            <div className="bg-gray-50/80 p-2 rounded border border-gray-200 grid grid-cols-4 gap-1 text-[10px] font-mono text-gray-500 text-center">
              <div>
                <span className="text-gray-500 block">Huyết Áp</span>
                <span className="text-gray-900 font-bold">
                  {vitals.bloodPressureSystolic}/{vitals.bloodPressureDiastolic}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Nhịp Tim</span>
                <span className="text-sky-400 font-bold">{vitals.heartRate}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Nhiệt Độ</span>
                <span className="text-emerald-400 font-bold">{vitals.temperature}°C</span>
              </div>
              <div>
                <span className="text-gray-500 block">SpO2</span>
                <span className="text-rose-400 font-bold">{vitals.spo2}%</span>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-gray-200 flex justify-end">
            {visit.status === "WAITING" ? (
              <Button
                size="sm"
                disabled={isPending}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium"
                onClick={() => handleStartExam(visit.id)}
              >
                Khám bệnh
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-gray-900 font-medium"
                onClick={() => router.push(`/doctor/examination/${visit.id}`)}
              >
                {visit.status === "IN_PROGRESS" ? "Khám tiếp" : "Xem hồ sơ / Kêt quả CLS"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Hàng đợi khám của bạn hôm nay</h2>
          <p className="text-sm text-slate-450 mt-0.5">
            Danh sách bệnh nhân đăng ký phòng khám đang hoạt động tại chi nhánh.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-900 text-xs"
            onClick={fetchQueue}
          >
            Làm mới hàng đợi
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white hover:bg-gray-50 text-gray-700 text-xs"
            onClick={handleSeedInventory}
          >
            Nạp kho thuốc mẫu (Demo)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: WAITING for doctor */}
        <Card className="border-gray-200 bg-gray-50/30 flex flex-col min-h-[500px]">
          <CardHeader className="pb-3 border-b border-gray-200 bg-gray-50/20">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-bold text-gray-700">Bệnh nhân chờ khám</CardTitle>
              <Badge className="bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                {waitingForDoc.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3 space-y-3 flex-1 overflow-y-auto">
            {waitingForDoc.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-12">Không có bệnh nhân chờ khám</p>
            ) : (
              waitingForDoc.map(renderPatientCard)
            )}
          </CardContent>
        </Card>

        {/* Column 2: IN PROGRESS */}
        <Card className="border-gray-200 bg-gray-50/30 flex flex-col min-h-[500px]">
          <CardHeader className="pb-3 border-b border-gray-200 bg-gray-50/20">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-bold text-gray-700">Đang khám bệnh</CardTitle>
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                {activeExams.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3 space-y-3 flex-1 overflow-y-auto">
            {activeExams.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-12">Không có bệnh nhân đang khám</p>
            ) : (
              activeExams.map(renderPatientCard)
            )}
          </CardContent>
        </Card>

        {/* Column 3: CLS PENDING */}
        <Card className="border-gray-200 bg-gray-50/30 flex flex-col min-h-[500px]">
          <CardHeader className="pb-3 border-b border-gray-200 bg-gray-50/20">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-bold text-gray-700">Chờ kết quả cận lâm sàng (CLS)</CardTitle>
              <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                {clsPending.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3 space-y-3 flex-1 overflow-y-auto">
            {clsPending.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-12">Không có bệnh nhân chờ CLS</p>
            ) : (
              clsPending.map(renderPatientCard)
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
