"use client";

import React, { useState, useTransition } from "react";
import { createClsOrdersAction } from "@/actions/doctor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface ClsOrderFormProps {
  visitId: string;
  onSuccess?: () => void;
}

interface ClsOption {
  id: string;
  name: string;
  type: "LAB" | "IMAGING" | "ECG" | "OTHER";
  priceText: string;
}

const standardClsOptions: ClsOption[] = [
  { id: "1", name: "Tổng phân tích tế bào máu ngoại vi (24 chỉ số)", type: "LAB", priceText: "150.000 VND" },
  { id: "2", name: "Sinh hóa máu (Glucose, Ure, Creatinin, GOT, GPT)", type: "LAB", priceText: "150.000 VND" },
  { id: "3", name: "Siêu âm ổ bụng tổng quát", type: "IMAGING", priceText: "200.000 VND" },
  { id: "4", name: "Chụp X-quang ngực thẳng kỹ thuật số", type: "IMAGING", priceText: "200.000 VND" },
  { id: "5", name: "Điện tâm đồ (ECG) 12 đầu dò", type: "ECG", priceText: "80.000 VND" },
];

export function ClsOrderForm({ visitId, onSuccess }: ClsOrderFormProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [customName, setCustomName] = useState("");
  const [customType, setCustomType] = useState<"LAB" | "IMAGING" | "ECG" | "OTHER">("OTHER");

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      toast.warning("Vui lòng nhập tên dịch vụ tự định nghĩa");
      return;
    }
    // We can add it directly to a local list or submit it as selected.
    // For simplicity, let's submit it. We can add a custom item to the selection.
    toast.success(`Đã thêm chỉ định tự chọn: ${customName}`);
    // Submit immediately or append? Let's append to a dynamic custom options list or just send it.
    // Let's create orders array and submit.
  };

  const handleSubmit = () => {
    const selectedOptions = standardClsOptions.filter((o) => selectedIds.includes(o.id));
    
    const orders = selectedOptions.map((o) => ({
      serviceName: o.name,
      serviceType: o.type,
      priority: "NORMAL" as const,
      notes: "",
    }));

    if (customName.trim()) {
      orders.push({
        serviceName: customName.trim(),
        serviceType: customType,
        priority: "NORMAL" as const,
        notes: "Chỉ định tùy chọn",
      });
    }

    if (orders.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một dịch vụ để chỉ định");
      return;
    }

    startTransition(async () => {
      try {
        const res = await createClsOrdersAction(visitId, orders);
        if (res.success) {
          toast.success("Lập chỉ định cận lâm sàng thành công!");
          setSelectedIds([]);
          setCustomName("");
          if (onSuccess) onSuccess();
        } else {
          toast.error(res.error || "Không thể lập chỉ định");
        }
      } catch (err) {
        toast.error("Có lỗi xảy ra");
      }
    });
  };

  return (
    <div className="space-y-4 text-left">
      <div className="space-y-2.5">
        <Label className="text-slate-350 text-xs font-bold uppercase tracking-wider">Chọn dịch vụ cận lâm sàng tiêu chuẩn</Label>
        <div className="space-y-2">
          {standardClsOptions.map((option) => {
            const isChecked = selectedIds.includes(option.id);
            return (
              <div
                key={option.id}
                onClick={() => handleToggle(option.id)}
                className={`p-3 rounded-lg border cursor-pointer transition flex justify-between items-center ${
                  isChecked
                    ? "bg-blue-600/10 border-blue-500/50 text-white"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-50/40 text-gray-600"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`h-4.5 w-4.5 rounded border flex items-center justify-center ${
                    isChecked ? "bg-blue-600 border-blue-500 text-white" : "border-gray-200 bg-gray-50"
                  }`}>
                    {isChecked && (
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-semibold">{option.name}</span>
                    <span className="ml-2 inline-block px-1.5 py-0.5 text-[9px] font-bold rounded bg-white text-gray-500">
                      {option.type}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-gray-500">{option.priceText}</span>
              </div>
            );
          })}
        </div>
      </div>

      <Separator className="bg-gray-100" />

      {/* Custom CLS */}
      <div className="space-y-2.5">
        <Label className="text-slate-350 text-xs font-bold uppercase tracking-wider">Chỉ định dịch vụ tự chọn (khác)</Label>
        <div className="grid grid-cols-3 gap-2">
          <Input
            placeholder="Tên xét nghiệm / siêu âm..."
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="col-span-2 bg-gray-50 border-gray-200 text-gray-900"
          />
          <select
            value={customType}
            onChange={(e) => setCustomType(e.target.value as any)}
            className="col-span-1 rounded-md border border-gray-200 bg-gray-50 text-gray-900 px-3 text-xs focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="LAB">Xét nghiệm (LAB)</option>
            <option value="IMAGING">Chụp chiếu (IMAGING)</option>
            <option value="ECG">Điện tim (ECG)</option>
            <option value="OTHER">Loại khác (OTHER)</option>
          </select>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <Button
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 font-semibold w-full sm:w-auto"
          onClick={handleSubmit}
        >
          {isPending ? "Đang xử lý chỉ định..." : "Xác nhận & Lập chỉ định"}
        </Button>
      </div>
    </div>
  );
}
