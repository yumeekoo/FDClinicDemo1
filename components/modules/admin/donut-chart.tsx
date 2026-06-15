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
      <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-white shadow-sm text-muted-foreground">
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
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <h3 className="text-base font-semibold text-foreground">Tồn kho theo hạn dùng</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Tổng tồn kho: {total} sản phẩm</p>
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
              stroke="#F3F4F6"
              strokeWidth={strokeWidth}
            />

            {/* Normal Segment */}
            {normal > 0 && (
              <circle
                cx={center}
                cy={center}
                r={r}
                fill="transparent"
                stroke="#22C55E"
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
                <span className="text-xl font-bold text-green-600">
                  {Math.round(pctNormal * 100)}%
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  An toàn
                </span>
              </>
            )}
            {hoveredSegment === "warning" && (
              <>
                <span className="text-xl font-bold text-amber-600">
                  {Math.round(pctWarning * 100)}%
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Sắp hết hạn
                </span>
              </>
            )}
            {hoveredSegment === "expired" && (
              <>
                <span className="text-xl font-bold text-red-600">
                  {Math.round(pctExpired * 100)}%
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  Đã quá hạn
                </span>
              </>
            )}
            {!hoveredSegment && (
              <>
                <span className="text-2xl font-bold text-foreground">{total}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider px-1 text-center leading-tight">
                  Sản phẩm
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
              hoveredSegment === "normal" ? "bg-gray-50" : ""
            }`}
            onMouseEnter={() => setHoveredSegment("normal")}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
              <span className="text-muted-foreground text-xs font-medium">Bình thường (&gt;6th)</span>
            </div>
            <span className="font-semibold text-foreground text-xs">{normal} lô</span>
          </div>

          {/* Warning */}
          <div
            className={`flex items-center justify-between space-x-8 p-1.5 rounded-lg transition duration-150 ${
              hoveredSegment === "warning" ? "bg-gray-50" : ""
            }`}
            onMouseEnter={() => setHoveredSegment("warning")}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
              <span className="text-muted-foreground text-xs font-medium">Cảnh báo (1-6th)</span>
            </div>
            <span className="font-semibold text-foreground text-xs">{warning} lô</span>
          </div>

          {/* Expired */}
          <div
            className={`flex items-center justify-between space-x-8 p-1.5 rounded-lg transition duration-150 ${
              hoveredSegment === "expired" ? "bg-gray-50" : ""
            }`}
            onMouseEnter={() => setHoveredSegment("expired")}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
              <span className="text-muted-foreground text-xs font-medium">Đã quá hạn (&lt;1n)</span>
            </div>
            <span className="font-semibold text-foreground text-xs">{expired} lô</span>
          </div>
        </div>
      </div>
    </div>
  );
}
