"use client";

import React, { useEffect, useState } from "react";
import { useRealtimeQueue } from "@/hooks/use-realtime-queue";
import { useBranch } from "@/hooks/use-branch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DedicatedQueuePage() {
  const { activeBranchId, activeBranchName } = useBranch();
  const { queue, loading, error } = useRealtimeQueue(activeBranchId);
  const [time, setTime] = useState("");

  // Update clock every second
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const waitingQueue = queue.filter(
    (item) => item.visit.status === "WAITING" && item.vitals
  );
  const callingQueue = queue.filter((item) => item.visit.status === "IN_PROGRESS");

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-900">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 font-semibold">Đang tải bảng hàng đợi phòng khám...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-slate-105 p-6 space-y-6">
      {/* Top Banner / TV Header */}
      <header className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-gray-900 font-extrabold text-2xl">
            CH
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-wider">Clinic Hub Queue Screen</h1>
            <p className="text-gray-500 text-sm font-semibold">{activeBranchName || "Đang tải chi nhánh..."}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-4xl font-mono font-bold text-blue-400">{time}</span>
          <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </header>

      {/* Main Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1">
        {/* Left: Calling/Active Patients (2/5 size) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-emerald-500 bg-gray-50/40 backdrop-blur-xl h-full flex flex-col">
            <CardHeader className="border-b border-gray-200 bg-emerald-500/10 py-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full bg-emerald-500 animate-ping" />
                  Đang mời vào khám
                </CardTitle>
                <Badge className="bg-emerald-500 text-gray-900 font-bold px-3 py-1">
                  {callingQueue.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4 flex-1 overflow-y-auto">
              {callingQueue.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 py-16">
                  Không có lượt khám nào đang hoạt động
                </div>
              ) : (
                callingQueue.map((item) => (
                  <div
                    key={item.visit.id}
                    className="p-5 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5 flex flex-col space-y-3 shadow-lg shadow-emerald-500/5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-black text-gray-900 uppercase">{item.patient.fullName}</span>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono py-1 px-2.5">
                        {item.patient.patientCode}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-emerald-500/20">
                      <span className="text-gray-500">Bác sĩ phụ trách:</span>
                      <span className="font-extrabold text-emerald-300 text-base">{item.doctor.fullName}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Waiting List (3/5 size) */}
        <div className="lg:col-span-3">
          <Card className="border-gray-200 bg-gray-50/40 backdrop-blur-xl h-full flex flex-col">
            <CardHeader className="border-b border-gray-200 bg-gray-50/20 py-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-black text-gray-600 uppercase tracking-widest">
                  Danh sách chuẩn bị khám
                </CardTitle>
                <Badge className="bg-blue-500 text-gray-900 font-bold px-3 py-1">
                  {waitingQueue.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 overflow-y-auto">
              {waitingQueue.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 py-16">
                  Hàng chờ trống
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {waitingQueue.map((item, index) => (
                    <div
                      key={item.visit.id}
                      className="p-4 rounded-xl border border-gray-200 bg-gray-50/30 flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-white text-gray-600 font-bold text-xs flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="font-extrabold text-gray-900 text-base">{item.patient.fullName}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-mono ml-8">
                          {item.patient.patientCode} • BS. {item.doctor.fullName}
                        </p>
                      </div>
                      <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold text-xs">
                        Đợi khám
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Banner */}
      <footer className="bg-gray-50/40 border border-gray-200 p-4 rounded-2xl flex justify-between items-center text-xs text-gray-500 font-semibold">
        <span>Vui lòng chuẩn bị sẵn thẻ BHYT/CCCD khi đến lượt khám.</span>
        <span>Hệ thống tự động cập nhật thời gian thực</span>
      </footer>
    </div>
  );
}
