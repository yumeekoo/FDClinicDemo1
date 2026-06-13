"use client";

import React, { useState } from "react";

interface ComboChartProps {
  data: { date: string; visits: number; revenue: number }[];
}

export function ComboChart({ data }: ComboChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Fallback if data is empty
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-white shadow-sm text-muted-foreground">
        Không có dữ liệu hiển thị
      </div>
    );
  }

  // Dimensions
  const width = 640;
  const height = 300;
  const paddingLeft = 50;
  const paddingRight = 60;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Max values for scaling
  const maxVisits = Math.max(...data.map((d) => d.visits), 1);
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  // Formatting currency
  const formatVND = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
    return `${value}đ`;
  };

  // Helper points
  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1 || 1)) * chartWidth;
    // Scale visits (left axis)
    const yVisits = paddingTop + chartHeight - (d.visits / maxVisits) * chartHeight;
    // Scale revenue (right axis)
    const yRevenue = paddingTop + chartHeight - (d.revenue / maxRevenue) * chartHeight;
    return { x, yVisits, yRevenue, ...d };
  });

  // Generate path string for revenue line
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yRevenue}`).join(" ");
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : "";

  return (
    <div className="relative rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Doanh thu & Lượt khám</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Thống kê 7 ngày gần nhất</p>
        </div>
        <div className="flex items-center space-x-4 text-xs font-medium text-muted-foreground">
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-blue-500" />
            <span>Lượt khám (Cột)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-purple-500" />
            <span>Doanh thu (Đường)</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px]">
          {/* Gradients */}
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingTop + ratio * chartHeight;
            return (
              <line
                key={i}
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="0.5"
                strokeDasharray="4,4"
              />
            );
          })}

          {/* Left Y Axis Labels (Visits) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingTop + chartHeight - ratio * chartHeight;
            const labelValue = Math.round(ratio * maxVisits);
            return (
              <text
                key={i}
                x={paddingLeft - 8}
                y={y + 4}
                fill="#94a3b8"
                fontSize="10"
                textAnchor="end"
              >
                {labelValue}
              </text>
            );
          })}

          {/* Right Y Axis Labels (Revenue) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingTop + chartHeight - ratio * chartHeight;
            const labelValue = ratio * maxRevenue;
            return (
              <text
                key={i}
                x={width - paddingRight + 8}
                y={y + 4}
                fill="#a855f7"
                fontSize="10"
                textAnchor="start"
              >
                {formatVND(labelValue)}
              </text>
            );
          })}

          {/* X Axis Labels */}
          {points.map((p, index) => (
            <text
              key={index}
              x={p.x}
              y={height - paddingBottom + 16}
              fill="#94a3b8"
              fontSize="10"
              textAnchor="middle"
            >
              {p.date}
            </text>
          ))}

          {/* Visits Columns */}
          {points.map((p, index) => {
            const colWidth = 24;
            const barHeight = chartHeight - (p.yVisits - paddingTop);
            return (
              <g
                key={index}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <rect
                  x={p.x - colWidth / 2}
                  y={p.yVisits}
                  width={colWidth}
                  height={barHeight}
                  rx="4"
                  fill="url(#barGrad)"
                  stroke="#60a5fa"
                  strokeWidth={hoveredIndex === index ? "1.5" : "0"}
                  className="transition-all duration-200"
                />
              </g>
            );
          })}

          {/* Area under revenue line */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#areaGrad)"
              className="pointer-events-none"
            />
          )}

          {/* Revenue line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#a855f7"
              strokeWidth="2.5"
              className="pointer-events-none"
            />
          )}

          {/* Dots on line and Hover tooltips */}
          {points.map((p, index) => (
            <g
              key={index}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <circle
                cx={p.x}
                cy={p.yRevenue}
                r={hoveredIndex === index ? "6" : "4"}
                fill="#ffffff"
                stroke="#a855f7"
                strokeWidth="2"
                className="transition-all duration-150"
              />
              {/* Invisible interactive zone for easier hovering */}
              <rect
                x={p.x - 20}
                y={paddingTop}
                width="40"
                height={chartHeight}
                fill="transparent"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Floating Tooltip Box */}
      {hoveredIndex !== null && (
        <div
          className="absolute z-20 rounded-lg border border-gray-200 bg-white p-3 shadow-lg text-xs space-y-1.5 transition-all duration-150"
          style={{
            left: `${Math.min(
              points[hoveredIndex].x,
              width - 150
            )}px`,
            top: `${points[hoveredIndex].yRevenue - 65}px`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="font-bold text-foreground text-center border-b border-gray-100 pb-1 mb-1">
            Ngày {points[hoveredIndex].date}
          </div>
          <div className="flex items-center justify-between space-x-4">
            <span className="text-muted-foreground">Lượt khám:</span>
            <span className="font-semibold text-blue-600">{points[hoveredIndex].visits} lượt</span>
          </div>
          <div className="flex items-center justify-between space-x-4">
            <span className="text-muted-foreground">Doanh thu:</span>
            <span className="font-semibold text-purple-600">
              {points[hoveredIndex].revenue.toLocaleString("vi-VN")} đ
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
