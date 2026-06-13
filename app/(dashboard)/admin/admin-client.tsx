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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Tổng quan báo cáo</h2>
          <p className="text-sm text-muted-foreground mt-1">Xem thống kê và tình hình vận hành phòng khám</p>
        </div>

        {isSuperAdmin && (
          <div className="flex items-center space-x-3 bg-white p-1.5 rounded-xl border border-input shadow-sm">
            <span className="text-xs font-semibold text-muted-foreground pl-2 uppercase tracking-wider">Lọc chi nhánh:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => handleBranchChange(e.target.value)}
              className="bg-transparent border-none text-sm font-medium text-foreground px-2 py-1 focus:outline-none focus:ring-0 cursor-pointer"
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

      {/* Section Label */}
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Kết quả hoạt động</div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Visits Today */}
        <div className="relative overflow-hidden rounded-2xl border border-[var(--card-border)] bg-white p-6 shadow-sm stat-card">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#3B82F6]" />
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Lượt khám hôm nay
            </span>
            <div className="bg-blue-50 text-blue-500 rounded-xl p-2.5">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-bold text-foreground">{stats.visitsToday}</span>
            <span className="text-base font-normal text-muted-foreground ml-1">lượt</span>
          </div>
        </div>

        {/* Revenue Today */}
        <div className="relative overflow-hidden rounded-2xl border border-[var(--card-border)] bg-white p-6 shadow-sm stat-card">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#22C55E]" />
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Doanh thu hôm nay
            </span>
            <div className="bg-green-50 text-green-500 rounded-xl p-2.5">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-bold text-green-700">{formatCurrency(stats.revenueToday)}</span>
          </div>
        </div>

        {/* Medications Warning */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-300 bg-amber-50 p-6 shadow-sm stat-card">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#F59E0B]" />
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700/70">
              Thuốc sắp hết hạn
            </span>
            <div className={`bg-amber-100 text-amber-600 rounded-xl p-2.5 ${stats.inventoryStats.warning + stats.inventoryStats.expired > 0 ? "animate-pulse" : ""}`}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex flex-col justify-end">
            <span className="text-4xl font-bold text-amber-700">
              {stats.inventoryStats.warning + stats.inventoryStats.expired}
            </span>
            <span className="text-xs text-amber-600 mt-1">(Cảnh báo + Hết hạn)</span>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Biểu đồ phân tích</div>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
        <div>
          <ComboChart data={stats.trendData} />
        </div>
        <div>
          <DonutChart stats={stats.inventoryStats} />
        </div>
      </div>
    </div>
  );
}
