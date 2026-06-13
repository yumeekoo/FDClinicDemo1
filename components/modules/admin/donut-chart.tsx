"use client";

import React, { useState } from "react";

interface DonutChartProps {
  stats: {
    normal: number;
    warning: number;
    expired: number;
    total: number;
  };
}

export function DonutChart({ stats }: DonutChartProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const { normal, warning, expired, total } = stats;

  if (total === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-400">
        Kho dược hiện chưa có thuốc
      </div>
    );
  }

  // Circle radius and properties
  const r = 50;
  const circumference = 2 * Math.PI * r; // ~314.159
  const strokeWidth = 14;
  const center = 75;

  // Calculate percentages
  const pctNormal = normal / total;
  const pctWarning = warning / total;
  const pctExpired = expired / total;

  // Arc stroke dash lengths
  const lenNormal = pctNormal * circumference;
  const lenWarning = pctWarning * circumference;
  const lenExpired = pctExpired * circumference;

  // Cumulative offsets
  const offsetNormal = 0;
  const offsetWarning = lenNormal;
  const offsetExpired = lenNormal + lenWarning;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl flex flex-col justify-between h-full">
      <div>
        <h3 className="text-base font-bold text-white">Tồn kho theo hạn dùng</h3>
        <p className="text-xs text-slate-400">Tổng tồn kho: {total} sản phẩm</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around py-4 gap-6">
        {/* SVG Donut */}
        <div className="relative w-36 h-36">
          <svg viewBox="0 0 150 150" className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={center}
              cy={center}
              r={r}
              fill="transparent"
              stroke="#1e293b"
              strokeWidth={strokeWidth}
            />

            {/* Normal Segment */}
            {normal > 0 && (
              <circle
                cx={center}
                cy={center}
                r={r}
                fill="transparent"
                stroke="#10b981"
                strokeWidth={hoveredSegment === "normal" ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={`${lenNormal} ${circumference}`}
                strokeDashoffset={-offsetNormal}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSegment("normal")}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            )}

            {/* Warning Segment */}
            {warning > 0 && (
              <circle
                cx={center}
                cy={center}
                r={r}
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth={hoveredSegment === "warning" ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={`${lenWarning} ${circumference}`}
                strokeDashoffset={-offsetWarning}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSegment("warning")}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            )}

            {/* Expired Segment */}
            {expired > 0 && (
              <circle
                cx={center}
                cy={center}
                r={r}
                fill="transparent"
                stroke="#ef4444"
                strokeWidth={hoveredSegment === "expired" ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={`${lenExpired} ${circumference}`}
                strokeDashoffset={-offsetExpired}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSegment("expired")}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            )}
          </svg>

          {/* Central count text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {hoveredSegment === "normal" && (
              <>
                <span className="text-xl font-extrabold text-emerald-400">
                  {Math.round(pctNormal * 100)}%
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  An toàn
                </span>
              </>
            )}
            {hoveredSegment === "warning" && (
              <>
                <span className="text-xl font-extrabold text-amber-400">
                  {Math.round(pctWarning * 100)}%
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Sắp hết hạn
                </span>
              </>
            )}
            {hoveredSegment === "expired" && (
              <>
                <span className="text-xl font-extrabold text-red-500">
                  {Math.round(pctExpired * 100)}%
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Đã quá hạn
                </span>
              </>
            )}
            {!hoveredSegment && (
              <>
                <span className="text-2xl font-extrabold text-white">{total}</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider">
                  Thuốc / Vật tư
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col space-y-3 justify-center text-sm w-full sm:w-auto">
          {/* Normal */}
          <div
            className={`flex items-center justify-between space-x-8 p-1.5 rounded-lg transition duration-150 ${
              hoveredSegment === "normal" ? "bg-emerald-500/10" : ""
            }`}
            onMouseEnter={() => setHoveredSegment("normal")}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-300 text-xs font-medium">Bình thường (&gt;6th)</span>
            </div>
            <span className="font-semibold text-emerald-400 text-xs">{normal} lô</span>
          </div>

          {/* Warning */}
          <div
            className={`flex items-center justify-between space-x-8 p-1.5 rounded-lg transition duration-150 ${
              hoveredSegment === "warning" ? "bg-amber-500/10" : ""
            }`}
            onMouseEnter={() => setHoveredSegment("warning")}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-300 text-xs font-medium">Cảnh báo (1-6th)</span>
            </div>
            <span className="font-semibold text-amber-400 text-xs">{warning} lô</span>
          </div>

          {/* Expired */}
          <div
            className={`flex items-center justify-between space-x-8 p-1.5 rounded-lg transition duration-150 ${
              hoveredSegment === "expired" ? "bg-red-500/10" : ""
            }`}
            onMouseEnter={() => setHoveredSegment("expired")}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="text-slate-300 text-xs font-medium">Đã quá hạn (&lt;1n)</span>
            </div>
            <span className="font-semibold text-red-400 text-xs">{expired} lô</span>
          </div>
        </div>
      </div>
    </div>
  );
}
