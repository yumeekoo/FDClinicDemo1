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
        <h1 className="text-2xl font-bold text-gray-900">Quầy Tiếp Đón Bệnh Nhân</h1>
        <p className="text-sm text-gray-500 mt-1">
          Đăng ký thông tin bệnh nhân, tra cứu MPI toàn hệ thống, đo chỉ số sinh hiệu và điều phối phòng khám.
        </p>
      </div>

      <Tabs defaultValue="register" className="w-full">
        <TabsList className="bg-gray-100 border border-gray-200 p-1 rounded-lg">
          <TabsTrigger
            value="register"
            className="text-sm font-medium rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm data-[state=active]:font-semibold text-gray-500 hover:text-gray-700 transition-all duration-150"
          >
            Tiếp đón & Đăng ký khám
          </TabsTrigger>
          <TabsTrigger
            value="queue"
            className="text-sm font-medium rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm data-[state=active]:font-semibold text-gray-500 hover:text-gray-700 transition-all duration-150"
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
