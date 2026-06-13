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
      <Card
        key={visit.id}
        className="border-slate-800 bg-slate-950/40 hover:bg-slate-900/60 transition duration-150 relative overflow-hidden group"
      >
        {/* Glow indicator based on state */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${
            visit.status === "WAITING"
              ? vitals
                ? "bg-sky-500"
                : "bg-amber-500"
              : visit.status === "IN_PROGRESS"
              ? "bg-emerald-500"
              : "bg-purple-500"
          }`}
        />
        <CardContent className="p-4 pl-5 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition">
                {patient.fullName}
              </h4>
              <p className="text-[10px] text-slate-500 font-mono">
                {patient.patientCode} • {visit.visitCode}
              </p>
            </div>
            <span className="text-[10px] text-slate-500">{timeAgo}</span>
          </div>

          <div className="text-xs space-y-1 text-slate-350">
            <div>
              <span className="text-slate-500">Bác sĩ: </span>
              <span className="font-semibold text-slate-200">{doctor.fullName}</span>
            </div>
            <div>
              <span className="text-slate-500">Lý do: </span>
              <span>{visit.chiefComplaint}</span>
            </div>
          </div>

          {vitals ? (
            <div className="bg-slate-900/80 p-2 rounded border border-slate-850 grid grid-cols-4 gap-1 text-[10px] font-mono text-slate-400 text-center">
              <div>
                <span className="text-slate-655 block">HA</span>
                <span className="text-white font-bold">
                  {vitals.bloodPressureSystolic}/{vitals.bloodPressureDiastolic}
                </span>
              </div>
              <div>
                <span className="text-slate-655 block">Mạch</span>
                <span className="text-sky-400 font-bold">{vitals.heartRate}</span>
              </div>
              <div>
                <span className="text-slate-655 block">Nhiệt</span>
                <span className="text-emerald-400 font-bold">{vitals.temperature}°C</span>
              </div>
              <div>
                <span className="text-slate-655 block">SpO2</span>
                <span className="text-rose-400 font-bold">{vitals.spo2}%</span>
              </div>
            </div>
          ) : (
            <div className="bg-amber-500/5 p-2 rounded border border-amber-500/10 text-[10px] text-amber-400 flex items-center justify-between">
              <span>Chưa đo sinh hiệu</span>
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-[10px] bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20 hover:text-white"
                onClick={() => {
                  setSelectedVisitForVitals(item);
                  setIsVitalsOpen(true);
                }}
              >
                Nhập sinh hiệu
              </Button>
            </div>
          )}

          {vitals && (
            <div className="flex justify-end gap-1.5 pt-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-[10px] text-slate-400 hover:text-white hover:bg-slate-800"
                onClick={() => {
                  setSelectedVisitForVitals(item);
                  setIsVitalsOpen(true);
                }}
              >
                Sửa sinh hiệu
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Hàng đợi lượt khám hôm nay</h2>
          <p className="text-sm text-slate-400">
            Tổng cộng: <strong className="text-white">{queue.length}</strong> bệnh nhân đang trong quy trình khám.
          </p>
        </div>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800 text-slate-400">
          <TabsTrigger value="grid" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">Dạng bảng cột</TabsTrigger>
          <TabsTrigger value="tabbed" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white">Dạng thẻ tab</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Column 1: WAITING for vitals */}
            <Card className="border-slate-800 bg-slate-900/30 flex flex-col min-h-[500px]">
              <CardHeader className="pb-3 border-b border-slate-850 bg-slate-950/20">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-bold text-slate-200">Chờ sinh hiệu</CardTitle>
                  <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {waitingForVitals.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-3 flex-1 overflow-y-auto">
                {waitingForVitals.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">Không có bệnh nhân</p>
                ) : (
                  waitingForVitals.map(renderVisitCard)
                )}
              </CardContent>
            </Card>

            {/* Column 2: WAITING for doctor */}
            <Card className="border-slate-800 bg-slate-900/30 flex flex-col min-h-[500px]">
              <CardHeader className="pb-3 border-b border-slate-850 bg-slate-950/20">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-bold text-slate-200">Chờ khám bác sĩ</CardTitle>
                  <Badge className="bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {waitingForDoctor.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-3 flex-1 overflow-y-auto">
                {waitingForDoctor.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">Không có bệnh nhân</p>
                ) : (
                  waitingForDoctor.map(renderVisitCard)
                )}
              </CardContent>
            </Card>

            {/* Column 3: IN PROGRESS */}
            <Card className="border-slate-800 bg-slate-900/30 flex flex-col min-h-[500px]">
              <CardHeader className="pb-3 border-b border-slate-850 bg-slate-950/20">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-bold text-slate-200">Đang khám</CardTitle>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {inProgress.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-3 flex-1 overflow-y-auto">
                {inProgress.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">Không có bệnh nhân</p>
                ) : (
                  inProgress.map(renderVisitCard)
                )}
              </CardContent>
            </Card>

            {/* Column 4: CLS PENDING */}
            <Card className="border-slate-800 bg-slate-900/30 flex flex-col min-h-[500px]">
              <CardHeader className="pb-3 border-b border-slate-850 bg-slate-950/20">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-bold text-slate-200">Chờ cận lâm sàng</CardTitle>
                  <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {clsPending.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-3 flex-1 overflow-y-auto">
                {clsPending.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">Không có bệnh nhân</p>
                ) : (
                  clsPending.map(renderVisitCard)
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tabbed" className="mt-4">
          <Tabs defaultValue="vitals" className="w-full">
            <div className="flex border-b border-slate-800 pb-2">
              <TabsList className="bg-slate-950 border border-slate-850 text-slate-400">
                <TabsTrigger value="vitals">Chờ sinh hiệu ({waitingForVitals.length})</TabsTrigger>
                <TabsTrigger value="doctor">Chờ khám ({waitingForDoctor.length})</TabsTrigger>
                <TabsTrigger value="inprogress">Đang khám ({inProgress.length})</TabsTrigger>
                <TabsTrigger value="cls">Chờ CLS ({clsPending.length})</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="vitals" className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {waitingForVitals.length === 0 ? (
                <div className="col-span-full py-8 text-center text-slate-500 text-sm">Không có bệnh nhân đang chờ đo sinh hiệu</div>
              ) : (
                waitingForVitals.map(renderVisitCard)
              )}
            </TabsContent>

            <TabsContent value="doctor" className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {waitingForDoctor.length === 0 ? (
                <div className="col-span-full py-8 text-center text-slate-500 text-sm">Không có bệnh nhân đang chờ khám bác sĩ</div>
              ) : (
                waitingForDoctor.map(renderVisitCard)
              )}
            </TabsContent>

            <TabsContent value="inprogress" className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {inProgress.length === 0 ? (
                <div className="col-span-full py-8 text-center text-slate-500 text-sm">Không có bệnh nhân đang trong phòng khám</div>
              ) : (
                inProgress.map(renderVisitCard)
              )}
            </TabsContent>

            <TabsContent value="cls" className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {clsPending.length === 0 ? (
                <div className="col-span-full py-8 text-center text-slate-500 text-sm">Không có bệnh nhân chờ kết quả cận lâm sàng</div>
              ) : (
                clsPending.map(renderVisitCard)
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Dialog for Entering Vitals */}
      <Dialog open={isVitalsOpen} onOpenChange={setIsVitalsOpen}>
        <DialogContent className="sm:max-w-[450px] bg-slate-900 border-slate-850 text-white">
          <DialogHeader>
            <DialogTitle>Nhập chỉ số sinh hiệu</DialogTitle>
            <DialogDescription className="text-slate-400">
              Đo sinh hiệu cho bệnh nhân: <strong className="text-white">{selectedVisitForVitals?.patient?.fullName}</strong>.
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
