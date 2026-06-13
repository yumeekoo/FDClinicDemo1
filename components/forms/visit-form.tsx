"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { visitSchema } from "@/lib/validations/visit";
import { createVisitAction, getDoctorsAction } from "@/actions/visits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface VisitFormProps {
  patientId: string;
  onSuccess?: () => void;
}

export function VisitForm({ patientId, onSuccess }: VisitFormProps) {
  const [isPending, startTransition] = useTransition();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<any>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      patientId,
      doctorId: "",
      chiefComplaint: "",
      medicalHistory: "Không có",
    },
  });

  const formErrors = errors as any;
  const doctorIdValue = watch("doctorId");

  // Load doctors on mount
  useEffect(() => {
    async function loadDoctors() {
      try {
        const res = await getDoctorsAction();
        if (res.success) {
          setDoctors(res.data);
        } else {
          toast.error(res.error || "Không thể tải danh sách bác sĩ");
        }
      } catch (error) {
        toast.error("Lỗi khi tải danh sách bác sĩ");
      } finally {
        setLoadingDoctors(false);
      }
    }
    loadDoctors();
  }, []);

  const onSubmit = async (data: any) => {
    startTransition(async () => {
      try {
        const res = await createVisitAction(data);
        if (res.success) {
          toast.success("Đăng ký lượt khám thành công!");
          reset();
          if (onSuccess) onSuccess();
        } else {
          toast.error(res.error || "Không thể tạo lượt khám");
        }
      } catch (error) {
        toast.error("Có lỗi xảy ra, vui lòng thử lại");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 text-left">
      {/* Patient ID (Hidden) */}
      <input type="hidden" {...register("patientId")} value={patientId} />

      {/* Doctor Selection */}
      <div className="space-y-1.5">
        <Label className="text-slate-300">Bác sĩ chỉ định khám <span className="text-rose-500">*</span></Label>
        {loadingDoctors ? (
          <div className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 animate-pulse flex items-center px-3 text-sm text-slate-500">
            Đang tải danh sách bác sĩ...
          </div>
        ) : doctors.length === 0 ? (
          <div className="h-10 w-full rounded-md border border-slate-800 bg-slate-950 flex items-center px-3 text-sm text-amber-500">
            Không có bác sĩ nào trực tại chi nhánh hôm nay
          </div>
        ) : (
          <Select
            value={doctorIdValue}
            onValueChange={(val) => setValue("doctorId", val || "")}
          >
            <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
              <SelectValue placeholder="Chọn bác sĩ khám" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white">
              {doctors.map((doc) => (
                <SelectItem key={doc.id || ""} value={doc.id || ""}>
                  {doc.fullName} ({doc.employeeCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {formErrors.doctorId && (
          <p className="text-xs text-rose-400 mt-0.5">{formErrors.doctorId.message}</p>
        )}
      </div>

      {/* Chief Complaint */}
      <div className="space-y-1.5">
        <Label htmlFor="chiefComplaint" className="text-slate-300">Lý do khám bệnh <span className="text-rose-500">*</span></Label>
        <Input
          id="chiefComplaint"
          placeholder="Đau họng, nhức đầu, ho sốt nhẹ..."
          className="bg-slate-950 border-slate-800 text-white"
          {...register("chiefComplaint")}
        />
        {formErrors.chiefComplaint && (
          <p className="text-xs text-rose-400 mt-0.5">{formErrors.chiefComplaint.message}</p>
        )}
      </div>

      {/* Medical History */}
      <div className="space-y-1.5">
        <Label htmlFor="medicalHistory" className="text-slate-300">Tiền sử bệnh án</Label>
        <Textarea
          id="medicalHistory"
          placeholder="Cao huyết áp 2 năm, tiểu đường type 2..."
          className="bg-slate-950 border-slate-800 text-white min-h-[80px]"
          {...register("medicalHistory")}
        />
        {formErrors.medicalHistory && (
          <p className="text-xs text-rose-400 mt-0.5">{formErrors.medicalHistory.message}</p>
        )}
      </div>

      <div className="pt-4 flex justify-end gap-2 border-t border-slate-850">
        <Button
          type="submit"
          disabled={isPending || loadingDoctors || doctors.length === 0}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 font-semibold w-full sm:w-auto"
        >
          {isPending ? "Đang xử lý..." : "Xác nhận đăng ký"}
        </Button>
      </div>
    </form>
  );
}
