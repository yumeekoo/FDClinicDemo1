"use client";

import React, { useState, useTransition } from "react";
import { submitClsResultAction } from "@/actions/paraclinical";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileUploader } from "@/components/modules/paraclinical/file-uploader";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, AlertTriangle, Activity, User, Heart } from "lucide-react";

interface ClsWorkspaceClientProps {
  data: {
    order: any;
    visit: any;
    patient: any;
    doctor: any;
    vitals: any;
    result: any;
  };
}

export function ClsWorkspaceClient({ data }: ClsWorkspaceClientProps) {
  const { order, visit, patient, doctor, vitals, result } = data;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Form states
  const [resultText, setResultText] = useState(result?.resultText || "");
  const [isAbnormal, setIsAbnormal] = useState(result?.isAbnormal || false);
  const [fileUrls, setFileUrls] = useState<string[]>(result?.fileUrls || []);

  const handleSubmit = () => {
    if (!resultText.trim()) {
      toast.warning("Vui lòng nhập mô tả kết quả chi tiết");
      return;
    }

    const payload = {
      orderId: order.id,
      resultText: resultText.trim(),
      isAbnormal,
      fileUrls,
    };

    startTransition(async () => {
      try {
        const res = await submitClsResultAction(payload);
        if (res.success) {
          toast.success("Đã cập nhật kết quả cận lâm sàng thành công!");
          router.push("/paraclinical");
        } else {
          toast.error(res.error || "Lỗi khi lưu kết quả");
        }
      } catch (err: any) {
        toast.error(err.message || "Lỗi hệ thống");
      }
    });
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/paraclinical")}
            className="text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-900 h-9 w-9 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              Trả kết quả: {patient.fullName}
              <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                {order.serviceName}
              </Badge>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Y lệnh: {order.orderCode} • Chỉ định bởi BS. {doctor.fullName}
            </p>
          </div>
        </div>

        <div className="flex gap-2.5">
          <Button
            variant="outline"
            onClick={() => router.push("/paraclinical")}
            className="border-slate-800 hover:bg-slate-900 text-slate-350"
          >
            Quay lại
          </Button>
          <Button
            disabled={isPending}
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 flex items-center gap-1.5"
          >
            {isPending ? "Đang xử lý..." : (
              <>
                <Check className="h-4 w-4" />
                Lưu & Trả kết quả
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Administrative & Vitals (1/4) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Administrative info */}
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl">
            <CardHeader className="pb-3 border-b border-slate-850">
              <CardTitle className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <User className="h-4 w-4 text-slate-400" />
                Hành chính & Sức khỏe
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 block">Họ và tên:</span>
                <span className="text-sm font-bold text-white">{patient.fullName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block">Mã BN:</span>
                  <span className="font-mono">{patient.patientCode}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Số điện thoại:</span>
                  <span>{patient.phone}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block">Ngày sinh:</span>
                  <span>{new Date(patient.dateOfBirth).toLocaleDateString("vi-VN")}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Giới tính:</span>
                  <span>{patient.gender === "MALE" ? "Nam" : patient.gender === "FEMALE" ? "Nữ" : "Khác"}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-500 block">Địa chỉ:</span>
                <span className="truncate block">{patient.address || "Chưa cập nhật"}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block">Nhóm máu:</span>
                  <span className="font-bold text-white">{patient.bloodGroup || "Không rõ"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">CCCD:</span>
                  <span className="font-mono">{patient.nationalId || "Không có"}</span>
                </div>
              </div>
              <Separator className="bg-slate-850" />
              <div>
                <span className="text-slate-500 block">Tiền sử dị ứng:</span>
                <span className={patient.allergies?.length > 0 ? "text-rose-400 font-semibold" : ""}>
                  {patient.allergies?.length > 0 ? patient.allergies.join(", ") : "Không có thông tin dị ứng"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Patient Vitals */}
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl">
            <CardHeader className="pb-3 border-b border-slate-850">
              <CardTitle className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-slate-400" />
                Chỉ số sinh hiệu
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {vitals ? (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Huyết áp:</span>
                    <strong className="text-white font-mono">
                      {vitals.bloodPressureSystolic}/{vitals.bloodPressureDiastolic} mmHg
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Mạch / SpO2:</span>
                    <strong className="text-white font-mono">
                      {vitals.heartRate} nhịp • {vitals.spo2}%
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Nhiệt độ:</span>
                    <strong className="text-white">{vitals.temperature}°C</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Thể trạng:</span>
                    <span>{vitals.weight}kg / {vitals.height}cm</span>
                  </div>
                </div>
              ) : (
                <p className="text-center py-4 text-slate-500 text-xs">Chưa có thông tin sinh hiệu</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Diagnosis form, results text, file uploads (3/4) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Clinical notes from Doctor */}
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl">
            <CardHeader className="py-3 px-4 border-b border-slate-850 bg-slate-950/10">
              <CardTitle className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-slate-400" />
                Yêu cầu lâm sàng từ Bác sĩ
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-xs text-slate-350 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block">Triệu chứng lâm sàng chính:</span>
                  <p className="text-white font-medium italic mt-1">"{visit.chiefComplaint}"</p>
                </div>
                <div>
                  <span className="text-slate-500 block">Ghi chú y lệnh CLS:</span>
                  <p className="text-white font-medium italic mt-1">
                    {order.notes ? `"${order.notes}"` : "Không có ghi chú thêm"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Form */}
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl">
            <CardHeader className="pb-3 border-b border-slate-850">
              <CardTitle className="text-sm font-bold text-white">
                Ghi nhận kết quả cận lâm sàng
              </CardTitle>
              <CardDescription className="text-slate-400">
                Nhập mô tả chi tiết và tải ảnh chụp/tài liệu đính kèm.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Result Text */}
              <div className="space-y-2">
                <Label htmlFor="resultText" className="text-slate-300 font-bold block">
                  Mô tả kết quả chi tiết <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  id="resultText"
                  value={resultText}
                  onChange={(e) => setResultText(e.target.value)}
                  placeholder="Nhập chẩn đoán hình ảnh, các chỉ số xét nghiệm, kết luận cận lâm sàng..."
                  className="bg-slate-950 border-slate-850 text-white min-h-[160px]"
                />
              </div>

              {/* Abnormal checkbox */}
              <div className="flex items-center space-x-3 p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg">
                <input
                  type="checkbox"
                  id="isAbnormal"
                  checked={isAbnormal}
                  onChange={(e) => setIsAbnormal(e.target.checked)}
                  className="h-4 w-4 rounded border-rose-950 text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <div className="text-left">
                  <Label htmlFor="isAbnormal" className="text-xs font-bold text-rose-400 cursor-pointer flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    Đánh dấu là KẾT QUẢ BẤT THƯỜNG
                  </Label>
                  <p className="text-[10px] text-slate-500">
                    Kết quả này sẽ được bôi đỏ cảnh báo nổi bật trên hồ sơ của Bác sĩ điều trị.
                  </p>
                </div>
              </div>

              {/* File Uploader */}
              <FileUploader
                orderId={order.id}
                visitId={visit.id}
                fileUrls={fileUrls}
                onChange={setFileUrls}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
