"use client";

import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vitalsSchema, VitalsInput } from "@/lib/validations/visit";
import { updateVitalsAction } from "@/actions/visits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface VitalsFormProps {
  visitId: string;
  initialData?: any;
  onSuccess?: () => void;
}

export function VitalsForm({ visitId, initialData, onSuccess }: VitalsFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VitalsInput>({
    resolver: zodResolver(vitalsSchema),
    defaultValues: {
      bloodPressureSystolic: initialData?.bloodPressureSystolic || undefined,
      bloodPressureDiastolic: initialData?.bloodPressureDiastolic || undefined,
      heartRate: initialData?.heartRate || undefined,
      temperature: initialData?.temperature ? parseFloat(initialData.temperature) : undefined,
      weight: initialData?.weight ? parseFloat(initialData.weight) : undefined,
      height: initialData?.height ? parseFloat(initialData.height) : undefined,
      spo2: initialData?.spo2 || undefined,
      notes: initialData?.notes || "",
    },
  });

  const onSubmit = async (data: VitalsInput) => {
    startTransition(async () => {
      try {
        const res = await updateVitalsAction(visitId, data);
        if (res.success) {
          toast.success("Đã ghi nhận chỉ số sinh hiệu thành công!");
          if (onSuccess) onSuccess();
        } else {
          toast.error(res.error || "Không thể lưu chỉ số sinh hiệu");
        }
      } catch (error) {
        toast.error("Có lỗi xảy ra, vui lòng thử lại");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 text-left">
      <div className="grid grid-cols-2 gap-4">
        {/* Blood Pressure Systolic */}
        <div className="space-y-1.5">
          <Label htmlFor="bloodPressureSystolic" className="text-slate-300">Huyết áp tâm thu (mmHg) <span className="text-rose-500">*</span></Label>
          <Input
            id="bloodPressureSystolic"
            type="number"
            placeholder="Ví dụ: 120"
            className="bg-slate-950 border-slate-800 text-white"
            {...register("bloodPressureSystolic", { valueAsNumber: true })}
          />
          {errors.bloodPressureSystolic && (
            <p className="text-xs text-rose-400 mt-0.5">{errors.bloodPressureSystolic.message}</p>
          )}
        </div>

        {/* Blood Pressure Diastolic */}
        <div className="space-y-1.5">
          <Label htmlFor="bloodPressureDiastolic" className="text-slate-300">Huyết áp tâm trương (mmHg) <span className="text-rose-500">*</span></Label>
          <Input
            id="bloodPressureDiastolic"
            type="number"
            placeholder="Ví dụ: 80"
            className="bg-slate-950 border-slate-800 text-white"
            {...register("bloodPressureDiastolic", { valueAsNumber: true })}
          />
          {errors.bloodPressureDiastolic && (
            <p className="text-xs text-rose-400 mt-0.5">{errors.bloodPressureDiastolic.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Heart Rate */}
        <div className="space-y-1.5">
          <Label htmlFor="heartRate" className="text-slate-300">Nhịp tim (nhịp/phút) <span className="text-rose-500">*</span></Label>
          <Input
            id="heartRate"
            type="number"
            placeholder="Ví dụ: 75"
            className="bg-slate-950 border-slate-800 text-white"
            {...register("heartRate", { valueAsNumber: true })}
          />
          {errors.heartRate && (
            <p className="text-xs text-rose-400 mt-0.5">{errors.heartRate.message}</p>
          )}
        </div>

        {/* Temperature */}
        <div className="space-y-1.5">
          <Label htmlFor="temperature" className="text-slate-300">Nhiệt độ (°C) <span className="text-rose-500">*</span></Label>
          <Input
            id="temperature"
            type="number"
            step="0.1"
            placeholder="Ví dụ: 36.5"
            className="bg-slate-950 border-slate-800 text-white"
            {...register("temperature", { valueAsNumber: true })}
          />
          {errors.temperature && (
            <p className="text-xs text-rose-400 mt-0.5">{errors.temperature.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Weight */}
        <div className="space-y-1.5 col-span-1">
          <Label htmlFor="weight" className="text-slate-300">Cân nặng (kg) <span className="text-rose-500">*</span></Label>
          <Input
            id="weight"
            type="number"
            step="0.01"
            placeholder="Ví dụ: 60"
            className="bg-slate-950 border-slate-800 text-white"
            {...register("weight", { valueAsNumber: true })}
          />
          {errors.weight && (
            <p className="text-xs text-rose-400 mt-0.5">{errors.weight.message}</p>
          )}
        </div>

        {/* Height */}
        <div className="space-y-1.5 col-span-1">
          <Label htmlFor="height" className="text-slate-300">Chiều cao (cm) <span className="text-rose-500">*</span></Label>
          <Input
            id="height"
            type="number"
            step="0.1"
            placeholder="Ví dụ: 165"
            className="bg-slate-950 border-slate-800 text-white"
            {...register("height", { valueAsNumber: true })}
          />
          {errors.height && (
            <p className="text-xs text-rose-400 mt-0.5">{errors.height.message}</p>
          )}
        </div>

        {/* SpO2 */}
        <div className="space-y-1.5 col-span-1">
          <Label htmlFor="spo2" className="text-slate-300">Chỉ số SpO2 (%) <span className="text-rose-500">*</span></Label>
          <Input
            id="spo2"
            type="number"
            placeholder="Ví dụ: 98"
            className="bg-slate-950 border-slate-800 text-white"
            {...register("spo2", { valueAsNumber: true })}
          />
          {errors.spo2 && (
            <p className="text-xs text-rose-400 mt-0.5">{errors.spo2.message}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-slate-300">Lưu ý khi đo / Thể chất khác</Label>
        <Textarea
          id="notes"
          placeholder="Bệnh nhân vừa đi bộ lên lầu, tim đập nhanh..."
          className="bg-slate-950 border-slate-800 text-white min-h-[60px]"
          {...register("notes")}
        />
      </div>

      <div className="pt-4 flex justify-end gap-2 border-t border-slate-850">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 font-semibold w-full"
        >
          {isPending ? "Đang lưu chỉ số..." : "Lưu chỉ số sinh hiệu"}
        </Button>
      </div>
    </form>
  );
}
