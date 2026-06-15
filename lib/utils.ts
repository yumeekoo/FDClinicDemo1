import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value?: number | null | string): string {
  if (value === undefined || value === null) return "0 đ";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
}

export function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function getWaitTime(startTime: Date | string, nowTime: Date | string = new Date()): string {
  const start = new Date(startTime);
  const now = new Date(nowTime);
  if (isNaN(start.getTime()) || isNaN(now.getTime())) return "0 phút";
  
  const diffMs = now.getTime() - start.getTime();
  if (diffMs < 0) return "0 phút";

  const totalMins = Math.floor(diffMs / 60000);
  if (totalMins < 60) return `${totalMins} phút`;

  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return `${hours} giờ ${mins} phút`;
}
