"use client";

import React, { useState, useTransition } from "react";
import { completeExaminationAction } from "@/actions/doctor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClsOrderForm } from "@/components/forms/cls-order-form";
import { PrescriptionForm } from "@/components/forms/prescription-form";
import { Patient360History } from "@/components/modules/doctor/patient-360-history";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PrescriptionItemInput } from "@/lib/validations/doctor";
import { CheckCircle2, Clock, Loader2, ExternalLink, AlertTriangle, FileText } from "lucide-react";

interface DoctorWorkspaceProps {
  visit: any;
  patient: any;
  vitals: any;
  clsOrders?: any[];
}

const commonIcd10 = [
  { code: "I10", desc: "Tăng huyết áp vô căn (nguyên phát)" },
  { code: "E11", desc: "Đái tháo đường không phụ thuộc insulin (Type 2)" },
  { code: "J00", desc: "Viêm mũi họng cấp (cảm lạnh thường)" },
  { code: "J02", desc: "Viêm họng cấp" },
  { code: "K29", desc: "Viêm dạ dày và tá tràng" },
  { code: "M54", desc: "Đau lưng" },
  { code: "N39", desc: "Nhiễm trùng đường tiết niệu" },
  { code: "R05", desc: "Ho" },
  { code: "R50", desc: "Sốt không rõ nguyên nhân" },
];

export function DoctorWorkspace({ visit, patient, vitals, clsOrders = [] }: DoctorWorkspaceProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Dialog controls
  const [isClsOpen, setIsClsOpen] = useState(false);

  // Form states
  const [chiefComplaint, setChiefComplaint] = useState(visit.chiefComplaint || "");
  const [icd10Code, setIcd10Code] = useState("");
  const [icd10Description, setIcd10Description] = useState("");
  const [notes, setNotes] = useState(""); // Lời dặn
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItemInput[]>([]);

  const handleSelectIcd10 = (item: { code: string; desc: string }) => {
    setIcd10Code(item.code);
    setIcd10Description(item.desc);
  };

  const handleAddDrug = (item: PrescriptionItemInput) => {
    // Check if drug already exists in prescription, merge quantities if so
    setPrescriptionItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.drugId === item.drugId);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
  };

  const handleRemoveDrug = (drugId: string) => {
    setPrescriptionItems((prev) => prev.filter((i) => i.drugId !== drugId));
  };

  const handleCompleteExam = () => {
    if (!chiefComplaint.trim()) {
      toast.warning("Vui lòng nhập triệu chứng lâm sàng");
      return;
    }
    if (!icd10Code.trim() || !icd10Description.trim()) {
      toast.warning("Vui lòng điền mã và mô tả chẩn đoán ICD-10");
      return;
    }

    const payload = {
      visitId: visit.id,
      chiefComplaint: chiefComplaint.trim(),
      icd10Code: icd10Code.trim().toUpperCase(),
      icd10Description: icd10Description.trim(),
      notes: notes.trim() || undefined,
      prescriptionItems,
    };

    startTransition(async () => {
      try {
        const res = await completeExaminationAction(payload);
        if (res.success) {
          toast.success("Đã hoàn tất ca khám bệnh!");
          router.push("/doctor");
        } else {
          toast.error(res.error || "Không thể hoàn tất ca khám");
        }
      } catch (err: any) {
        toast.error(err.message || "Lỗi hệ thống");
      }
    });
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Khám bệnh: {patient.fullName}
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Đang khám
            </Badge>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Mã lượt khám: {visit.visitCode} • Phòng khám nội bộ
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isClsOpen} onOpenChange={setIsClsOpen}>
            <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-200 h-9 px-4 cursor-pointer">
              Chỉ định Cận lâm sàng (CLS)
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-850 text-white">
              <DialogHeader>
                <DialogTitle>Lập phiếu chỉ định CLS</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Chọn các dịch vụ cận lâm sàng cho bệnh nhân: <strong className="text-white">{patient.fullName}</strong>.
                </DialogDescription>
              </DialogHeader>
              <ClsOrderForm
                visitId={visit.id}
                onSuccess={() => {
                  setIsClsOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>

          <Button
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6"
            onClick={handleCompleteExam}
          >
            {isPending ? "Đang hoàn tất..." : "Hoàn tất ca khám"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column: Patient vital signs & Info (1/4) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Vitals summary */}
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl">
            <CardHeader className="pb-3 bg-slate-950/20 border-b border-slate-850">
              <CardTitle className="text-sm font-bold text-slate-200">Chỉ số sinh hiệu (Reception)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {vitals ? (
                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Huyết áp:</span>
                    <strong className="text-white font-mono text-base">
                      {vitals.bloodPressureSystolic}/{vitals.bloodPressureDiastolic} <span className="text-xs font-normal text-slate-500">mmHg</span>
                    </strong>
                  </div>
                  <Separator className="bg-slate-900" />
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Nhịp tim:</span>
                    <strong className="text-sky-400 font-mono text-base">
                      {vitals.heartRate} <span className="text-xs font-normal text-slate-500">nhịp/p</span>
                    </strong>
                  </div>
                  <Separator className="bg-slate-900" />
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Nhiệt độ:</span>
                    <strong className="text-emerald-400 font-mono text-base">
                      {vitals.temperature}°C
                    </strong>
                  </div>
                  <Separator className="bg-slate-900" />
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">SpO2:</span>
                    <strong className="text-rose-400 font-mono text-base">
                      {vitals.spo2}%
                    </strong>
                  </div>
                  <Separator className="bg-slate-900" />
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Cân nặng:</span>
                    <span className="text-slate-200 font-semibold">{vitals.weight} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Chiều cao:</span>
                    <span className="text-slate-200 font-semibold">{vitals.height} cm</span>
                  </div>
                  
                  {vitals.notes && (
                    <div className="mt-3 p-2 bg-slate-950/45 rounded border border-slate-900 text-xs text-slate-400">
                      <span className="text-slate-500 font-semibold block">Ghi chú sinh hiệu:</span>
                      {vitals.notes}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-amber-500 text-xs">
                  Bệnh nhân này chưa được lễ tân đo sinh hiệu!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Patient Card */}
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl text-xs space-y-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-450 uppercase">Tóm tắt hành chính</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-slate-300">
              <div>
                <span className="text-slate-500 block">Số điện thoại:</span>
                <span>{patient.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Mã BHYT:</span>
                <span>{patient.bhytCode || "Không có"}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Dị ứng:</span>
                <span className={patient.allergies?.length > 0 ? "text-rose-400 font-semibold" : ""}>
                  {patient.allergies?.length > 0 ? patient.allergies.join(", ") : "Không phát hiện"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right columns: Clinical workspace tabs (3/4) */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="exam" className="w-full">
            <TabsList className="bg-slate-900 border border-slate-800 text-slate-450">
              <TabsTrigger value="exam" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white font-bold">Khám & Chẩn đoán</TabsTrigger>
              <TabsTrigger value="cls" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white font-bold">
                Kết quả CLS {clsOrders.length > 0 && `(${clsOrders.length})`}
              </TabsTrigger>
              <TabsTrigger value="prescription" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white font-bold">Kê đơn thuốc</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white font-bold">Lịch sử bệnh án (360)</TabsTrigger>
            </TabsList>

            {/* Tab 1: Examination & Diagnosis */}
            <TabsContent value="exam" className="mt-4 space-y-4">
              <Card className="border-slate-800 bg-slate-900/30">
                <CardContent className="p-6 space-y-4">
                  {/* Symptoms Input */}
                  <div className="space-y-1.5">
                    <Label htmlFor="chiefComplaint" className="text-slate-300 font-bold">Triệu chứng lâm sàng / Lý do khám <span className="text-rose-500">*</span></Label>
                    <Textarea
                      id="chiefComplaint"
                      value={chiefComplaint}
                      onChange={(e) => setChiefComplaint(e.target.value)}
                      placeholder="Nhập ghi chép triệu chứng của bệnh nhân..."
                      className="bg-slate-950 border-slate-850 text-white min-h-[100px]"
                    />
                  </div>

                  {/* ICD-10 Diagnosis */}
                  <div className="space-y-3">
                    <Label className="text-slate-300 font-bold">Chẩn đoán bệnh (mã ICD-10) <span className="text-rose-500">*</span></Label>
                    
                    {/* Common diagnoses selection */}
                    <div className="flex flex-wrap gap-2 py-1">
                      {commonIcd10.map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => handleSelectIcd10(item)}
                          className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-xs text-slate-400 hover:text-white border border-slate-850 transition font-mono"
                        >
                          {item.code} - {item.desc.slice(0, 15)}...
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-1 space-y-1.5">
                        <Label htmlFor="icd10Code" className="text-xs text-slate-400">Mã ICD-10</Label>
                        <Input
                          id="icd10Code"
                          placeholder="Ví dụ: I10"
                          value={icd10Code}
                          onChange={(e) => setIcd10Code(e.target.value)}
                          className="bg-slate-950 border-slate-850 text-white font-mono uppercase"
                        />
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <Label htmlFor="icd10Description" className="text-xs text-slate-400">Mô tả chẩn đoán xác định</Label>
                        <Input
                          id="icd10Description"
                          placeholder="Ví dụ: Tăng huyết áp vô căn..."
                          value={icd10Description}
                          onChange={(e) => setIcd10Description(e.target.value)}
                          className="bg-slate-950 border-slate-850 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Doctor's Notes / Advice */}
                  <div className="space-y-1.5">
                    <Label htmlFor="notes" className="text-slate-300 font-bold">Lời dặn / Ghi chú điều trị</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Dặn dò chế độ ăn uống, nghỉ ngơi, hẹn tái khám..."
                      className="bg-slate-950 border-slate-850 text-white min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Prescription Kê đơn */}
            <TabsContent value="prescription" className="mt-4 space-y-4">
              <PrescriptionForm onAdd={handleAddDrug} addedItems={prescriptionItems} />

              <Card className="border-slate-800 bg-slate-900/30">
                <CardHeader className="py-3 px-4 border-b border-slate-850 bg-slate-950/20">
                  <CardTitle className="text-sm font-bold text-slate-200">
                    Toa thuốc hiện tại ({prescriptionItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {prescriptionItems.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-12">Chưa có thuốc nào được chọn trong toa.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="text-slate-500 border-b border-slate-850 bg-slate-950/10">
                            <th className="py-2.5 px-4 font-semibold text-xs">Tên thuốc</th>
                            <th className="py-2.5 px-4 font-semibold text-xs">Liều dùng</th>
                            <th className="py-2.5 px-4 font-semibold text-xs text-center">Số lượng</th>
                            <th className="py-2.5 px-4 font-semibold text-xs text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prescriptionItems.map((item) => (
                            <tr key={item.drugId} className="border-b border-slate-900/50 last:border-0 hover:bg-slate-900/20">
                              <td className="py-3 px-4">
                                <span className="font-semibold text-slate-200 block">{item.drugName}</span>
                                <span className="text-[10px] text-slate-550 font-mono">Mã: {item.drugCode}</span>
                              </td>
                              <td className="py-3 px-4 text-xs text-slate-350">
                                <div className="font-semibold text-slate-300">
                                  {item.dosage} — {item.frequency} ({item.durationDays} ngày)
                                </div>
                                {item.instructions && <div className="text-[10px] text-slate-500 italic mt-0.5">{item.instructions}</div>}
                              </td>
                              <td className="py-3 px-4 text-center font-mono font-bold text-slate-200">
                                {item.quantity} {item.unit}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-rose-400 hover:text-rose-350 hover:bg-rose-500/10"
                                  onClick={() => handleRemoveDrug(item.drugId)}
                                >
                                  Xóa
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: CLS Results */}
            <TabsContent value="cls" className="mt-4 space-y-4">
              {clsOrders.length === 0 ? (
                <Card className="border-slate-800 bg-slate-900/30 text-center py-12">
                  <CardContent className="space-y-3">
                    <p className="text-sm text-slate-500">Chưa có chỉ định cận lâm sàng nào cho lượt khám này.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsClsOpen(true)}
                      className="border-slate-800 hover:bg-slate-900 text-slate-300"
                    >
                      Tạo chỉ định cận lâm sàng
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {clsOrders.map(({ order, result }: any) => {
                    const isCompleted = order.status === "COMPLETED";
                    const isInProgress = order.status === "IN_PROGRESS";
                    const isPending = order.status === "PENDING";
                    
                    return (
                      <Card key={order.id} className="border-slate-800 bg-slate-900/20 overflow-hidden">
                        <CardHeader className="py-3 px-4 bg-slate-950/20 border-b border-slate-850/60 flex flex-row justify-between items-center">
                          <div>
                            <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                              {order.serviceName}
                              <Badge className="bg-slate-800 text-slate-400 border border-slate-700 text-[9px] font-mono scale-90">
                                {order.serviceType}
                              </Badge>
                            </CardTitle>
                            <span className="text-[10px] text-slate-550 font-mono block mt-0.5">
                              Y lệnh: {order.orderCode} • Chỉ định lúc: {new Date(order.orderedAt).toLocaleString("vi-VN")}
                            </span>
                          </div>
                          
                          <div>
                            {isCompleted && (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Đã có kết quả
                              </Badge>
                            )}
                            {isInProgress && (
                              <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1 animate-pulse">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Đang thực hiện
                              </Badge>
                            )}
                            {isPending && (
                              <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Chờ thực hiện
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="p-4 space-y-3 text-sm">
                          {order.notes && (
                            <div className="text-xs text-slate-400 italic">
                              <span className="text-slate-500 font-semibold">Ghi chú chỉ định: </span>
                              "{order.notes}"
                            </div>
                          )}
                          
                          {isCompleted && result ? (
                            <div className="space-y-3">
                              {result.isAbnormal && (
                                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded text-rose-400 font-bold text-xs flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-rose-500 animate-bounce" />
                                  <span>CẢNH BÁO: KẾT QUẢ CÓ CHỈ SỐ BẤT THƯỜNG</span>
                                </div>
                              )}
                              
                              <div className="space-y-1.5">
                                <span className="text-xs text-slate-500 font-bold block">Mô tả chi tiết kết quả CLS:</span>
                                <div className="p-3 rounded bg-slate-950/40 border border-slate-900 text-slate-200 whitespace-pre-wrap leading-relaxed text-xs">
                                  {result.resultText}
                                </div>
                              </div>
                              
                              {result.fileUrls && result.fileUrls.length > 0 && (
                                <div className="space-y-1.5">
                                  <span className="text-xs text-slate-500 font-bold block">Tài liệu / Hình ảnh đính kèm:</span>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {result.fileUrls.map((url: string, fileIdx: number) => {
                                      const isImg = url.match(/\.(jpeg|jpg|gif|png|webp)/i) != null;
                                      const fileName = url.substring(url.lastIndexOf("/") + 1);
                                      
                                      return (
                                        <div key={fileIdx} className="group relative border border-slate-850 rounded overflow-hidden bg-slate-950/80">
                                          {isImg ? (
                                            <div className="h-28 w-full overflow-hidden flex items-center justify-center bg-slate-900">
                                              <img src={url} alt="CLS Scan" className="h-full w-full object-cover group-hover:scale-105 transition" />
                                            </div>
                                          ) : (
                                            <div className="h-28 w-full flex flex-col items-center justify-center p-3 text-slate-500 bg-slate-900/50">
                                              <FileText className="h-8 w-8 mb-2" />
                                              <span className="text-[10px] text-center truncate w-full">{fileName}</span>
                                            </div>
                                          )}
                                          <div className="p-1.5 border-t border-slate-850 bg-slate-900 flex justify-between items-center text-[10px]">
                                            <span className="text-slate-400 font-semibold">Tệp #{fileIdx + 1}</span>
                                            <a
                                              href={url}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5 hover:underline font-bold"
                                            >
                                              Xem
                                              <ExternalLink className="h-2.5 w-2.5" />
                                            </a>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 italic py-2">Chưa có dữ liệu kết quả cận lâm sàng.</p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Tab 3: Patient 360 History */}
            <TabsContent value="history" className="mt-4">
              <Patient360History patientId={patient.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
