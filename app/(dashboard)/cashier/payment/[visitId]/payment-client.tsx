"use client";

import React, { useState, useTransition } from "react";
import { processPaymentAction } from "@/actions/cashier";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Printer, DollarSign, ShieldAlert, CreditCard, Landmark, Coins } from "lucide-react";

interface PaymentWorkspaceClientProps {
  initialData: {
    visit: any;
    patient: any;
    doctor: any;
    invoice: any;
    items: any[];
    payment?: any;
  };
}

export function PaymentWorkspaceClient({ initialData }: PaymentWorkspaceClientProps) {
  const { visit, patient, doctor, invoice, items, payment } = initialData;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Local state for calculations
  const subtotal = parseFloat(invoice.subtotal);
  const [discountAmount, setDiscountAmount] = useState(
    invoice.status === "PAID" ? parseFloat(invoice.discountAmount) : 0
  );
  const [bhytAmount, setBhytAmount] = useState(
    invoice.status === "PAID" ? parseFloat(invoice.bhytAmount) : 0
  );
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "TRANSFER" | "MOMO" | "VNPAY">(
    "CASH"
  );

  const totalAmount = Math.max(0, subtotal - discountAmount - bhytAmount);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const handleConfirmPayment = () => {
    if (discountAmount < 0 || bhytAmount < 0) {
      toast.warning("Số tiền giảm trừ phải lớn hơn hoặc bằng 0");
      return;
    }

    if (discountAmount + bhytAmount > subtotal) {
      toast.warning("Tổng số tiền giảm trừ không được vượt quá số tiền trước giảm trừ");
      return;
    }

    const payload = {
      invoiceId: invoice.id,
      visitId: visit.id,
      discountAmount,
      bhytAmount,
      paymentMethod,
    };

    startTransition(async () => {
      try {
        const res = await processPaymentAction(payload);
        if (res.success) {
          toast.success("Thanh toán thành công! Đang tải lại hóa đơn...");
          router.refresh();
        } else {
          toast.error(res.error || "Không thể thực hiện thanh toán");
        }
      } catch (err: any) {
        toast.error(err.message || "Lỗi hệ thống");
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "CASH":
        return "Tiền mặt";
      case "CARD":
        return "Quẹt thẻ";
      case "TRANSFER":
        return "Chuyển khoản ngân hàng";
      case "MOMO":
        return "Ví MoMo";
      case "VNPAY":
        return "VNPAY-QR";
      default:
        return method;
    }
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case "VISIT_FEE":
        return "Phí khám bệnh";
      case "CLS":
        return "Cận lâm sàng";
      case "PROCEDURE":
        return "Thủ thuật";
      case "DRUG":
        return "Thuốc điều trị";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6 text-left relative">
      {/* CSS print style to only show the receipt container during printing */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-receipt-section, #print-receipt-section * {
            visibility: visible;
          }
          #print-receipt-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 20px;
          }
          /* Hide non-printable items inside the printable area */
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Normal screen header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/cashier")}
            className="text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-900 h-9 w-9 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              Duyệt hóa đơn: {patient.fullName}
              {invoice.status === "PAID" ? (
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  Đã thanh toán
                </Badge>
              ) : (
                <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                  Chờ thanh toán
                </Badge>
              )}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Số hóa đơn: {invoice.invoiceCode} • Bác sĩ khám: BS. {doctor.fullName}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-slate-800 hover:bg-slate-900 text-slate-300 flex items-center gap-1.5"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4" />
            In hóa đơn
          </Button>

          {invoice.status !== "PAID" && (
            <Button
              disabled={isPending}
              onClick={handleConfirmPayment}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 flex items-center gap-1.5"
            >
              {isPending ? "Đang xử lý..." : (
                <>
                  <Check className="h-4 w-4" />
                  Xác nhận Thanh toán
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
        {/* Left Column: Details of bill items (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl">
            <CardHeader className="py-3 px-4 border-b border-slate-850 bg-slate-950/20">
              <CardTitle className="text-sm font-bold text-slate-200">
                Chi tiết các danh mục dịch vụ & sản phẩm thu phí
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-850 bg-slate-950/10 text-xs">
                      <th className="py-2.5 px-4 font-semibold">Phân loại</th>
                      <th className="py-2.5 px-4 font-semibold">Diễn giải dịch vụ / Thuốc</th>
                      <th className="py-2.5 px-4 font-semibold text-center">SL</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Đơn giá</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-slate-900/50 hover:bg-slate-900/20 text-xs">
                        <td className="py-3 px-4 font-medium text-slate-450">
                          {getItemTypeLabel(item.itemType)}
                        </td>
                        <td className="py-3 px-4 text-slate-200 font-semibold">
                          {item.description}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-400">
                          {formatCurrency(parseFloat(item.unitPrice))}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-200">
                          {formatCurrency(parseFloat(item.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Checkout Calculation / Payment form (1/3) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl">
            <CardHeader className="pb-3 border-b border-slate-850">
              <CardTitle className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Thanh toán viện phí
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              {/* Receipt Summary values */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Tổng chi phí (Subtotal):</span>
                  <strong className="font-mono text-sm text-slate-200">
                    {formatCurrency(subtotal)}
                  </strong>
                </div>

                {invoice.status === "PAID" ? (
                  <>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Miễn giảm / Ưu đãi:</span>
                      <span className="font-mono text-sm text-rose-400 font-semibold">
                        -{formatCurrency(discountAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Bảo hiểm chi trả (BHYT):</span>
                      <span className="font-mono text-sm text-emerald-400 font-semibold">
                        -{formatCurrency(bhytAmount)}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Discount Input */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-900">
                      <Label htmlFor="discount" className="text-slate-350">Miễn giảm khuyến mãi (VND)</Label>
                      <div className="relative">
                        <Input
                          id="discount"
                          type="number"
                          value={discountAmount || ""}
                          onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                          className="bg-slate-950 border-slate-800 text-white pl-8 font-mono"
                          placeholder="0"
                        />
                        <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-600" />
                      </div>
                    </div>

                    {/* BHYT Input */}
                    <div className="space-y-1.5">
                      <Label htmlFor="bhyt" className="text-slate-350">BHYT đồng chi trả (VND)</Label>
                      <div className="relative">
                        <Input
                          id="bhyt"
                          type="number"
                          value={bhytAmount || ""}
                          onChange={(e) => setBhytAmount(parseFloat(e.target.value) || 0)}
                          className="bg-slate-950 border-slate-800 text-white pl-8 font-mono"
                          placeholder="0"
                        />
                        <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-600" />
                      </div>
                    </div>
                  </>
                )}

                <Separator className="bg-slate-850 my-2" />

                <div className="flex justify-between items-center py-1 bg-slate-950/40 p-2.5 rounded border border-slate-850">
                  <span className="text-sm font-bold text-slate-300">Tổng thực thu:</span>
                  <strong className="font-mono text-lg text-emerald-400 font-black">
                    {formatCurrency(totalAmount)}
                  </strong>
                </div>
              </div>

              {invoice.status !== "PAID" ? (
                <>
                  {/* Select Payment Method */}
                  <div className="space-y-2.5 pt-2">
                    <Label className="text-slate-350 font-bold block">Phương thức thanh toán</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("CASH")}
                        className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-1.5 transition ${
                          paymentMethod === "CASH"
                            ? "bg-blue-600/10 border-blue-500 text-white"
                            : "bg-slate-950 border-slate-850 hover:bg-slate-900/50 text-slate-400"
                        }`}
                      >
                        <Coins className="h-4.5 w-4.5" />
                        <span className="text-[10px] font-semibold">Tiền mặt</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("CARD")}
                        className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-1.5 transition ${
                          paymentMethod === "CARD"
                            ? "bg-blue-600/10 border-blue-500 text-white"
                            : "bg-slate-950 border-slate-850 hover:bg-slate-900/50 text-slate-400"
                        }`}
                      >
                        <CreditCard className="h-4.5 w-4.5" />
                        <span className="text-[10px] font-semibold">Quẹt thẻ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("TRANSFER")}
                        className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-1.5 transition ${
                          paymentMethod === "TRANSFER"
                            ? "bg-blue-600/10 border-blue-500 text-white"
                            : "bg-slate-950 border-slate-850 hover:bg-slate-900/50 text-slate-400"
                        }`}
                      >
                        <Landmark className="h-4.5 w-4.5" />
                        <span className="text-[10px] font-semibold">Chuyển khoản</span>
                      </button>
                    </div>
                  </div>

                  <Button
                    disabled={isPending}
                    onClick={handleConfirmPayment}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 mt-2 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isPending ? "Đang xử lý thanh toán..." : (
                      <>
                        <Check className="h-4 w-4" />
                        Thu viện phí
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-slate-350 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Check className="h-4 w-4" />
                    ĐÃ THANH TOÁN THÀNH CÔNG
                  </div>
                  <Separator className="bg-slate-850/50 my-1" />
                  <div>
                    <span className="text-slate-500">Hình thức: </span>
                    <span className="font-semibold text-slate-200">{getPaymentMethodLabel(payment?.method || "CASH")}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Thời gian: </span>
                    <span className="text-slate-200">
                      {invoice.paidAt ? new Date(invoice.paidAt).toLocaleString("vi-VN") : "Hôm nay"}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print-Only Template (hidden on browser, visible when printed) */}
      <div id="print-receipt-section" className="hidden text-black font-mono p-8 max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold uppercase tracking-wide">HỆ THỐNG PHÒNG KHÁM CLINI-HUB</h2>
          <p className="text-xs">Địa chỉ: Chi nhánh hoạt động Clinic Hub</p>
          <p className="text-xs">Điện thoại liên hệ: 1900 6000 • Email: support@clinichub.vn</p>
          <h1 className="text-lg font-bold uppercase tracking-wider pt-4">HÓA ĐƠN THANH TOÁN VIỆN PHÍ</h1>
          <p className="text-xs">Số hóa đơn: {invoice.invoiceCode}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-black">
          <div className="space-y-1">
            <p><strong>Bệnh nhân:</strong> {patient.fullName}</p>
            <p><strong>Mã bệnh nhân:</strong> {patient.patientCode}</p>
            <p><strong>Ngày sinh:</strong> {new Date(patient.dateOfBirth).toLocaleDateString("vi-VN")} • <strong>Giới tính:</strong> {patient.gender === "MALE" ? "Nam" : "Nữ"}</p>
            <p><strong>Mã BHYT:</strong> {patient.bhytCode || "Không có"}</p>
          </div>
          <div className="space-y-1 text-right">
            <p><strong>Mã lượt khám:</strong> {visit.visitCode}</p>
            <p><strong>Bác sĩ khám:</strong> BS. {doctor.fullName}</p>
            <p><strong>Ngày lập HĐ:</strong> {new Date(invoice.createdAt).toLocaleString("vi-VN")}</p>
            <p><strong>Ngày thanh toán:</strong> {invoice.paidAt ? new Date(invoice.paidAt).toLocaleString("vi-VN") : "Chưa thanh toán"}</p>
          </div>
        </div>

        <table className="w-full text-xs text-left border-collapse border border-black pt-4">
          <thead>
            <tr className="border-b border-black bg-gray-100">
              <th className="p-2 border-r border-black font-bold">STT</th>
              <th className="p-2 border-r border-black font-bold">Diễn giải chi phí</th>
              <th className="p-2 border-r border-black text-center font-bold">SL</th>
              <th className="p-2 border-r border-black text-right font-bold">Đơn giá</th>
              <th className="p-2 text-right font-bold">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} className="border-b border-black">
                <td className="p-2 border-r border-black font-mono">{idx + 1}</td>
                <td className="p-2 border-r border-black">{item.description}</td>
                <td className="p-2 border-r border-black text-center font-mono">{item.quantity}</td>
                <td className="p-2 border-r border-black text-right font-mono">{formatCurrency(parseFloat(item.unitPrice))}</td>
                <td className="p-2 text-right font-mono">{formatCurrency(parseFloat(item.amount))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-1.5 text-xs text-right pt-4">
          <p>Cộng tiền (Subtotal): <strong>{formatCurrency(subtotal)}</strong></p>
          <p>Số tiền miễn giảm: <strong className="text-red-650">-{formatCurrency(discountAmount)}</strong></p>
          <p>Bảo hiểm thanh toán (BHYT): <strong className="text-green-650">-{formatCurrency(bhytAmount)}</strong></p>
          <div className="text-sm border-t border-black pt-1">
            <strong>Tổng thu thực tế: {formatCurrency(totalAmount)}</strong>
          </div>
        </div>

        <div className="text-xs italic pt-4">
          * Số tiền viết bằng chữ:.........................................................................................................
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs pt-8 text-center">
          <div>
            <p className="font-bold">Bệnh nhân / Người nộp tiền</p>
            <p className="text-[10px] text-gray-500">(Ký, ghi rõ họ tên)</p>
          </div>
          <div>
            <p><i>Ngày...... tháng...... năm 2026</i></p>
            <p className="font-bold">Nhân viên Thu ngân / Thủ quỹ</p>
            <p className="text-[10px] text-gray-500">(Ký, ghi rõ họ tên)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
