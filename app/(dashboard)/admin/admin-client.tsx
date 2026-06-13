"use client";

import React, { useState, useEffect, useTransition } from "react";
import { ComboChart } from "@/components/modules/admin/combo-chart";
import { DonutChart } from "@/components/modules/admin/donut-chart";
import { getAdminStatsAction } from "@/actions/admin";
import { toast } from "sonner";

interface AdminClientProps {
  initialStats: any;
  branches: any[];
  role: string;
  userBranchId: string | null;
}

export function AdminClient({ initialStats, branches, role, userBranchId }: AdminClientProps) {
  const [stats, setStats] = useState<any>(initialStats);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(role === "BRANCH_ADMIN" ? userBranchId || "" : "");
  const [isPending, startTransition] = useTransition();

  const isSuperAdmin = role === "ADMIN";

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
    startTransition(async () => {
      const res = await getAdminStatsAction(branchId || undefined);
      if (res.success) {
        setStats(res.data);
      } else {
        toast.error(res.error || "Không thể lấy thông tin thống kê chi nhánh");
      }
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  return (
    <div className="space-y-8">
      {/* Header and Branch Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Tổng quan báo cáo</h2>
          <p className="text-sm text-slate-400">Xem thống kê và tình hình vận hành phòng khám</p>
        </div>

        {isSuperAdmin && (
          <div className="flex items-center space-x-3 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 pl-2">Lọc chi nhánh:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => handleBranchChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-white px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isPending}
            >
              <option value="">Tất cả các chi nhánh</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Visits Today */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl transition duration-300 hover:scale-[1.02] hover:border-slate-700">
          <div className="absolute top-0 left-0 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Lượt khám hôm nay
            </span>
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white">{stats.visitsToday}</span>
            <span className="text-xs text-slate-400">lượt</span>
          </div>
        </div>

        {/* Revenue Today */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl transition duration-300 hover:scale-[1.02] hover:border-slate-700">
          <div className="absolute top-0 left-0 w-24 h-24 bg-purple-600/10 rounded-full blur-2xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Doanh thu hôm nay
            </span>
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-white">{formatCurrency(stats.revenueToday)}</span>
          </div>
        </div>

        {/* Medications Warning */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl transition duration-300 hover:scale-[1.02] hover:border-slate-700">
          <div className="absolute top-0 left-0 w-24 h-24 bg-red-600/10 rounded-full blur-2xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Thuốc sắp hết hạn
            </span>
            <div className="h-9 w-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-red-400">
              {stats.inventoryStats.warning + stats.inventoryStats.expired}
            </span>
            <span className="text-xs text-slate-400">lô (Cảnh báo + Hết hạn)</span>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ComboChart data={stats.trendData} />
        </div>
        <div>
          <DonutChart stats={stats.inventoryStats} />
        </div>
      </div>
    </div>
  );
}
