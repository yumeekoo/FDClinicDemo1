"use client";

import React from "react";
import { MpiSearch } from "@/components/modules/patient/mpi-search";
import { QueueDisplay } from "@/components/modules/queue/queue-display";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export default function ReceptionDashboard() {
  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Quầy Tiếp Đón Bệnh Nhân</h1>
        <p className="text-slate-400 mt-1">
          Đăng ký thông tin bệnh nhân, tra cứu MPI toàn hệ thống, đo chỉ số sinh hiệu và điều phối phòng khám.
        </p>
      </div>

      <Tabs defaultValue="register" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800 text-slate-400 p-1">
          <TabsTrigger
            value="register"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white px-6 py-2 text-sm font-semibold"
          >
            Tiếp đón & Đăng ký khám
          </TabsTrigger>
          <TabsTrigger
            value="queue"
            className="data-[state=active]:bg-slate-800 data-[state=active]:text-white px-6 py-2 text-sm font-semibold"
          >
            Hàng đợi khám hôm nay
          </TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="mt-6 space-y-6">
          <MpiSearch />
        </TabsContent>

        <TabsContent value="queue" className="mt-6">
          <QueueDisplay />
        </TabsContent>
      </Tabs>
    </div>
  );
}
