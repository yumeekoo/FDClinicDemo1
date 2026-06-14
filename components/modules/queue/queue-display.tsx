"use client";

import React, { useState } from "react";
import { useRealtimeQueue } from "@/hooks/use-realtime-queue";
import { useBranch } from "@/hooks/use-branch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VitalsForm } from "@/components/forms/vitals-form";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Users } from "lucide-react";

export function QueueDisplay() {
  const { activeBranchId } = useBranch();
  const { queue, loading, error } = useRealtimeQueue(activeBranchId);

  // States for entering vitals
  const [selectedVisitForVitals, setSelectedVisitForVitals] = useState<any>(null);
  const [isVitalsOpen, setIsVitalsOpen] = useState(false);

  // Group visits
  const waitingForVitals = queue.filter(
    (item) => item.visit.status === "WAITING" && !item.vitals
  );
  const waitingForDoctor = queue.filter(
    (item) => item.visit.status === "WAITING" && item.vitals
  );
  const inProgress = queue.filter((item) => item.visit.status === "IN_PROGRESS");
  const clsPending = queue.filter((item) => item.visit.status === "CLS_PENDING");

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-gray-200 bg-gray-50 animate-pulse rounded-2xl">
            <CardHeader className="h-16 border-b border-gray-100" />
            <CardContent className="h-64" />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 text-center p-8 text-red-600">
        <p>Đã xảy ra lỗi khi tải hàng đợi khám: {error}</p>
      </Card>
    );
  }

  const renderVisitCard = (item: any) => {
    const { visit, patient, doctor, vitals } = item;
    const timeAgo = formatDistanceToNow(new Date(visit.createdAt), {
      addSuffix: true,
      locale: vi,
    });

    return (
      <div
        key={visit.id}
        className="
          bg-white border border-gray-200
          rounded-xl p-3
          hover:border-blue-300 hover:shadow-md
          transition-all duration-150
          cursor-pointer
          group relative overflow-hidden
        "
      >
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${
            visit.status === "WAITING"
              ? vitals
                ? "bg-blue-500"
                : "bg-orange-400"
              : visit.status === "IN_PROGRESS"
              ? "bg-green-500"
              : "bg-violet-500"
          }`}
        />
        <div className="pl-2 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                {patient.fullName}
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {patient.patientCode} • {visit.visitCode}
              </p>
            </div>
            <span className="text-[11px] text-gray-400 whitespace-nowrap">{timeAgo}</span>
          </div>

          <div className="text-xs space-y-1">
            <div>
              <span className="text-gray-500">Bác sĩ: </span>
              <span className="font-medium text-gray-800">{doctor.fullName}</span>
            </div>
            <div>
              <span className="text-gray-500">Lý do: </span>
              <span className="text-gray-700">{visit.chiefComplaint}</span>
            </div>
          </div>

          {vitals ? (
            <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 grid grid-cols-4 gap-1 text-[10px] font-mono text-gray-500 text-center">
              <div>
                <span className="block">HA</span>
                <span className="text-gray-900 font-bold">
                  {vitals.bloodPressureSystolic}/{vitals.bloodPressureDiastolic}
                </span>
              </div>
              <div>
                <span className="block">Mạch</span>
                <span className="text-blue-600 font-bold">{vitals.heartRate}</span>
              </div>
              <div>
                <span className="block">Nhiệt</span>
                <span className="text-green-600 font-bold">{vitals.temperature}°C</span>
              </div>
              <div>
                <span className="block">SpO2</span>
                <span className="text-red-500 font-bold">{vitals.spo2}%</span>
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 p-2 rounded-lg border border-orange-100 text-[11px] text-orange-600 flex items-center justify-between">
              <span className="font-medium">Chưa đo sinh hiệu</span>
              <button
                className="px-3 py-1 text-[10px] font-medium rounded-md bg-white border border-orange-200 text-orange-600 hover:bg-orange-100 hover:border-orange-300 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVisitForVitals(item);
                  setIsVitalsOpen(true);
                }}
              >
                Nhập sinh hiệu
              </button>
            </div>
          )}

          {vitals && (
            <div className="flex justify-end pt-1">
              <button
                className="px-2 py-1 text-[11px] font-medium rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVisitForVitals(item);
                  setIsVitalsOpen(true);
                }}
              >
                Sửa sinh hiệu
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEmptyState = (title: string) => (
    <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Users className="w-5 h-5 text-gray-400" />
      </div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
    </div>
  );

  return (
    <div className="space-y-6 text-left">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Hàng đợi lượt khám hôm nay
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Tổng cộng:
          <span className="font-semibold text-blue-600 mx-1">
            {queue.length}
          </span>
          bệnh nhân đang trong quy trình khám.
        </p>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="flex gap-1 bg-gray-100 border border-gray-200 p-1 rounded-lg w-fit">
          <TabsTrigger 
            value="grid" 
            className="px-3 py-1.5 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-150"
          >
            Dạng bảng cột
          </TabsTrigger>
          <TabsTrigger 
            value="tabbed" 
            className="px-3 py-1.5 text-sm font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-150"
          >
            Dạng thẻ tab
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            
            {/* Column 1: WAITING for vitals */}
            <div className="bg-white border border-gray-200 rounded-2xl flex flex-col min-h-[500px] shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 rounded-t-2xl border-t-[3px] border-t-orange-400 bg-gray-50/50">
                <span className="text-sm font-semibold text-gray-800">Chờ sinh hiệu</span>
                <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold">
                  {waitingForVitals.length}
                </span>
              </div>
              <div className="flex-1 p-3 space-y-3 overflow-y-auto bg-gray-50/30">
                {waitingForVitals.length === 0 ? renderEmptyState("Không có bệnh nhân") : waitingForVitals.map(renderVisitCard)}
              </div>
            </div>

            {/* Column 2: WAITING for doctor */}
            <div className="bg-white border border-gray-200 rounded-2xl flex flex-col min-h-[500px] shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 rounded-t-2xl border-t-[3px] border-t-blue-500 bg-gray-50/50">
                <span className="text-sm font-semibold text-gray-800">Chờ khám bác sĩ</span>
                <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                  {waitingForDoctor.length}
                </span>
              </div>
              <div className="flex-1 p-3 space-y-3 overflow-y-auto bg-gray-50/30">
                {waitingForDoctor.length === 0 ? renderEmptyState("Không có bệnh nhân") : waitingForDoctor.map(renderVisitCard)}
              </div>
            </div>

            {/* Column 3: IN PROGRESS */}
            <div className="bg-white border border-gray-200 rounded-2xl flex flex-col min-h-[500px] shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 rounded-t-2xl border-t-[3px] border-t-green-500 bg-gray-50/50">
                <span className="text-sm font-semibold text-gray-800">Đang khám</span>
                <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-green-100 text-green-600 text-xs font-bold">
                  {inProgress.length}
                </span>
              </div>
              <div className="flex-1 p-3 space-y-3 overflow-y-auto bg-gray-50/30">
                {inProgress.length === 0 ? renderEmptyState("Không có bệnh nhân") : inProgress.map(renderVisitCard)}
              </div>
            </div>

            {/* Column 4: CLS PENDING */}
            <div className="bg-white border border-gray-200 rounded-2xl flex flex-col min-h-[500px] shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 rounded-t-2xl border-t-[3px] border-t-violet-500 bg-gray-50/50">
                <span className="text-sm font-semibold text-gray-800">Chờ cận lâm sàng</span>
                <span className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full bg-violet-100 text-violet-600 text-xs font-bold">
                  {clsPending.length}
                </span>
              </div>
              <div className="flex-1 p-3 space-y-3 overflow-y-auto bg-gray-50/30">
                {clsPending.length === 0 ? renderEmptyState("Không có bệnh nhân") : clsPending.map(renderVisitCard)}
              </div>
            </div>

          </div>
        </TabsContent>

        <TabsContent value="tabbed" className="mt-6">
          <Tabs defaultValue="vitals" className="w-full">
            <div className="flex border-b border-gray-200 pb-2">
              <TabsList className="bg-white border border-gray-200 text-gray-500 rounded-lg">
                <TabsTrigger value="vitals" className="data-[state=active]:text-orange-600 data-[state=active]:bg-orange-50 font-medium">Chờ sinh hiệu ({waitingForVitals.length})</TabsTrigger>
                <TabsTrigger value="doctor" className="data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50 font-medium">Chờ khám ({waitingForDoctor.length})</TabsTrigger>
                <TabsTrigger value="inprogress" className="data-[state=active]:text-green-600 data-[state=active]:bg-green-50 font-medium">Đang khám ({inProgress.length})</TabsTrigger>
                <TabsTrigger value="cls" className="data-[state=active]:text-violet-600 data-[state=active]:bg-violet-50 font-medium">Chờ CLS ({clsPending.length})</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="vitals" className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {waitingForVitals.length === 0 ? renderEmptyState("Không có bệnh nhân đang chờ đo sinh hiệu") : waitingForVitals.map(renderVisitCard)}
            </TabsContent>
            <TabsContent value="doctor" className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {waitingForDoctor.length === 0 ? renderEmptyState("Không có bệnh nhân đang chờ khám bác sĩ") : waitingForDoctor.map(renderVisitCard)}
            </TabsContent>
            <TabsContent value="inprogress" className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {inProgress.length === 0 ? renderEmptyState("Không có bệnh nhân đang trong phòng khám") : inProgress.map(renderVisitCard)}
            </TabsContent>
            <TabsContent value="cls" className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {clsPending.length === 0 ? renderEmptyState("Không có bệnh nhân chờ kết quả cận lâm sàng") : clsPending.map(renderVisitCard)}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Dialog for Entering Vitals */}
      <Dialog open={isVitalsOpen} onOpenChange={setIsVitalsOpen}>
        <DialogContent className="sm:max-w-[450px] bg-white border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Nhập chỉ số sinh hiệu</DialogTitle>
            <DialogDescription className="text-gray-500">
              Đo sinh hiệu cho bệnh nhân: <strong className="text-gray-900">{selectedVisitForVitals?.patient?.fullName}</strong>.
            </DialogDescription>
          </DialogHeader>
          {selectedVisitForVitals && (
            <VitalsForm
              visitId={selectedVisitForVitals.visit.id}
              initialData={selectedVisitForVitals.vitals}
              onSuccess={() => {
                setIsVitalsOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
