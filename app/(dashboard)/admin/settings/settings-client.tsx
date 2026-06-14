"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function SettingsClient() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // States for clinic info mock config
  const [clinicName, setClinicName] = useState("Clinic Hub Việt Nam");
  const [hotline, setHotline] = useState("1900 8198");
  const [email, setEmail] = useState("contact@clinichub.vn");

  // Ensure mounted to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = () => {
    toast.success("Đã lưu cấu hình cài đặt hệ thống thành công!");
  };

  if (!mounted) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        Đang tải trang cài đặt...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900">Cài đặt Hệ thống</h2>
        <p className="text-sm text-gray-500">Cấu hình chung và tùy chọn giao diện người dùng</p>
      </div>

      <div className="space-y-6 rounded-2xl border border-gray-200 bg-gray-50/40 p-6 backdrop-blur-xl">
        {/* Theme select */}
        <div className="space-y-3 pb-6 border-b border-gray-200/60">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Giao diện (Theme)</h3>
            <p className="text-xs text-gray-500">Chọn chế độ màu sắc hiển thị cho giao diện quản trị</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {/* Dark */}
            <button
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                theme === "dark"
                  ? "bg-blue-600/10 border-blue-500 text-blue-400 font-bold"
                  : "bg-gray-50 border-gray-200 text-gray-500 hover:text-white"
              }`}
            >
              <div className="h-6 w-6 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mb-2">
                🌙
              </div>
              <span className="text-xs">Chế độ Tối (Dark)</span>
            </button>

            {/* Light */}
            <button
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                theme === "light"
                  ? "bg-blue-600/10 border-blue-500 text-blue-400 font-bold"
                  : "bg-gray-50 border-gray-200 text-gray-500 hover:text-white"
              }`}
            >
              <div className="h-6 w-6 rounded-full bg-white border border-slate-300 flex items-center justify-center mb-2">
                ☀️
              </div>
              <span className="text-xs">Chế độ Sáng (Light)</span>
            </button>

            {/* System */}
            <button
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                theme === "system"
                  ? "bg-blue-600/10 border-blue-500 text-blue-400 font-bold"
                  : "bg-gray-50 border-gray-200 text-gray-500 hover:text-white"
              }`}
            >
              <div className="h-6 w-6 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-2">
                💻
              </div>
              <span className="text-xs">Hệ thống (System)</span>
            </button>
          </div>
        </div>

        {/* General Options */}
        <div className="space-y-4 pb-6 border-b border-gray-200/60">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Định dạng & Quốc gia</h3>
            <p className="text-xs text-gray-500">Định dạng chung cho tiền tệ, ngôn ngữ hiển thị</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Ngôn ngữ giao diện</Label>
              <Input
                value="Tiếng Việt (Vietnamese)"
                disabled
                className="bg-gray-50/60 border-gray-200 text-xs text-gray-500 rounded-xl h-10"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Định dạng tiền tệ</Label>
              <Input
                value="Việt Nam Đồng (VND - đ)"
                disabled
                className="bg-gray-50/60 border-gray-200 text-xs text-gray-500 rounded-xl h-10"
              />
            </div>
          </div>
        </div>

        {/* Clinic info */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Thông tin Phòng khám</h3>
            <p className="text-xs text-gray-500">Hiển thị trên tiêu đề hóa đơn in ấn và biểu mẫu</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="clinicName" className="text-xs text-gray-600 font-semibold">
                Tên tổng công ty / phòng khám
              </Label>
              <Input
                id="clinicName"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="bg-gray-50 border-gray-200 text-xs text-gray-900 rounded-xl h-10 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="hotline" className="text-xs text-gray-600 font-semibold">
                  Hotline hỗ trợ
                </Label>
                <Input
                  id="hotline"
                  value={hotline}
                  onChange={(e) => setHotline(e.target.value)}
                  className="bg-gray-50 border-gray-200 text-xs text-gray-900 rounded-xl h-10 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs text-gray-600 font-semibold">
                  Email liên hệ
                </Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-50 border-gray-200 text-xs text-gray-900 rounded-xl h-10 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-gray-900 font-semibold text-xs h-10 rounded-xl px-8 shadow-lg shadow-blue-500/10"
        >
          Lưu cài đặt
        </Button>
      </div>
    </div>
  );
}
