"use client";

import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema } from "@/lib/validations/patient";
import { createPatientAction } from "@/actions/patients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface PatientFormProps {
  onSuccess?: (patient: any) => void;
}

export function PatientForm({ onSuccess }: PatientFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<any>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      fullName: "",
      dateOfBirth: "",
      gender: "MALE",
      phone: "",
      cccd: "",
      bhytCode: "",
      address: "",
      bloodType: "none",
      allergies: "",
      notes: "",
    },
  });

  const formErrors = errors as any;
  const genderValue = watch("gender");
  const bloodTypeValue = watch("bloodType");

  const onSubmit = async (data: any) => {
    startTransition(async () => {
      try {
        const res = await createPatientAction(data);
        if (res.success) {
          toast.success("Đã đăng ký bệnh nhân mới thành công!");
          reset();
          if (onSuccess) onSuccess(res.data);
        } else {
          toast.error(res.error || "Không thể đăng ký bệnh nhân");
        }
      } catch (error: any) {
        toast.error("Có lỗi xảy ra, vui lòng thử lại");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-slate-300">Họ và tên <span className="text-rose-500">*</span></Label>
          <Input
            id="fullName"
            placeholder="Nguyễn Văn A"
            className="bg-slate-950 border-slate-800 text-white"
            {...register("fullName")}
          />
          {formErrors.fullName && (
            <p className="text-xs text-rose-400 mt-0.5">{formErrors.fullName.message}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="space-y-1.5">
          <Label htmlFor="dateOfBirth" className="text-slate-300">Ngày sinh <span className="text-rose-500">*</span></Label>
          <Input
            id="dateOfBirth"
            type="date"
            className="bg-slate-950 border-slate-800 text-white"
            {...register("dateOfBirth")}
          />
          {formErrors.dateOfBirth && (
            <p className="text-xs text-rose-400 mt-0.5">{formErrors.dateOfBirth.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gender */}
        <div className="space-y-1.5">
          <Label className="text-slate-300">Giới tính <span className="text-rose-500">*</span></Label>
          <Select
            value={genderValue}
            onValueChange={(val) => setValue("gender", val || "MALE")}
          >
            <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
              <SelectValue placeholder="Chọn giới tính" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white">
              <SelectItem value="MALE">Nam</SelectItem>
              <SelectItem value="FEMALE">Nữ</SelectItem>
              <SelectItem value="OTHER">Khác</SelectItem>
            </SelectContent>
          </Select>
          {formErrors.gender && (
            <p className="text-xs text-rose-400 mt-0.5">{formErrors.gender.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-slate-300">Số điện thoại <span className="text-rose-500">*</span></Label>
          <Input
            id="phone"
            placeholder="09XXXXXXXX"
            className="bg-slate-950 border-slate-800 text-white"
            {...register("phone")}
          />
          {formErrors.phone && (
            <p className="text-xs text-rose-400 mt-0.5">{formErrors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CCCD */}
        <div className="space-y-1.5">
          <Label htmlFor="cccd" className="text-slate-300">Số CCCD (12 chữ số)</Label>
          <Input
            id="cccd"
            placeholder="012345678901"
            className="bg-slate-950 border-slate-800 text-white"
            {...register("cccd")}
          />
          {formErrors.cccd && (
            <p className="text-xs text-rose-400 mt-0.5">{formErrors.cccd.message}</p>
          )}
        </div>

        {/* BHYT */}
        <div className="space-y-1.5">
          <Label htmlFor="bhytCode" className="text-slate-300">Mã thẻ BHYT (15 ký tự)</Label>
          <Input
            id="bhytCode"
            placeholder="GD479XXXXXXXXXX"
            className="bg-slate-950 border-slate-800 text-white"
            {...register("bhytCode")}
          />
          {formErrors.bhytCode && (
            <p className="text-xs text-rose-400 mt-0.5">{formErrors.bhytCode.message}</p>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="space-y-1.5">
        <Label htmlFor="address" className="text-slate-300">Địa chỉ thường trú <span className="text-rose-500">*</span></Label>
        <Input
          id="address"
          placeholder="Số nhà, Đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
          className="bg-slate-950 border-slate-800 text-white"
          {...register("address")}
        />
        {formErrors.address && (
          <p className="text-xs text-rose-400 mt-0.5">{formErrors.address.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Blood Type */}
        <div className="space-y-1.5">
          <Label className="text-slate-300">Nhóm máu</Label>
          <Select
            value={bloodTypeValue || "none"}
            onValueChange={(val) => setValue("bloodType", val || "none")}
          >
            <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
              <SelectValue placeholder="Chọn nhóm máu" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-white">
              <SelectItem value="none">Không rõ</SelectItem>
              <SelectItem value="A+">A+</SelectItem>
              <SelectItem value="A-">A-</SelectItem>
              <SelectItem value="B+">B+</SelectItem>
              <SelectItem value="B-">B-</SelectItem>
              <SelectItem value="O+">O+</SelectItem>
              <SelectItem value="O-">O-</SelectItem>
              <SelectItem value="AB+">AB+</SelectItem>
              <SelectItem value="AB-">AB-</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Allergies */}
        <div className="space-y-1.5">
          <Label htmlFor="allergies" className="text-slate-300">Dị ứng (phân tách bằng dấu phẩy)</Label>
          <Input
            id="allergies"
            placeholder="Hải sản, Penicillin, Phấn hoa..."
            className="bg-slate-950 border-slate-800 text-white"
            {...register("allergies")}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-slate-300">Ghi chú tiền sử / Thể trạng</Label>
        <Textarea
          id="notes"
          placeholder="Thông tin lưu ý thêm về bệnh nhân..."
          className="bg-slate-950 border-slate-800 text-white min-h-[80px]"
          {...register("notes")}
        />
      </div>

      <div className="pt-4 flex justify-end gap-2 border-t border-slate-850">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 font-semibold"
        >
          {isPending ? "Đang lưu..." : "Lưu hồ sơ"}
        </Button>
      </div>
    </form>
  );
}
