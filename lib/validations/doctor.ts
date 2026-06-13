import { z } from "zod";

export const clsOrderInputSchema = z.object({
  serviceName: z.string().min(2, "Tên dịch vụ phải có ít nhất 2 ký tự"),
  serviceType: z.enum(["LAB", "IMAGING", "ECG", "OTHER"], {
    message: "Loại dịch vụ không hợp lệ",
  }),
  priority: z.enum(["NORMAL", "URGENT"], {
    message: "Độ ưu tiên không hợp lệ",
  }),
  notes: z.string().optional(),
});

export const clsOrderArraySchema = z.object({
  visitId: z.string().uuid("Lượt khám không hợp lệ"),
  orders: z.array(clsOrderInputSchema).min(1, "Vui lòng chọn ít nhất một dịch vụ cận lâm sàng"),
});

export const prescriptionItemInputSchema = z.object({
  drugId: z.string().uuid("Thuốc không hợp lệ"),
  drugName: z.string().min(1, "Tên thuốc không được để trống"),
  drugCode: z.string().min(1, "Mã thuốc không được để trống"),
  dosage: z.string().min(1, "Liều lượng không được để trống"), // e.g. "500mg" or "1 viên"
  frequency: z.string().min(1, "Tần suất không được để trống"), // e.g. "2 lần/ngày"
  durationDays: z.number({ message: "Số ngày dùng phải là số" }).min(1, "Số ngày dùng phải từ 1 ngày"),
  quantity: z.number({ message: "Số lượng phải là số" }).min(1, "Số lượng phải từ 1"),
  unit: z.string().min(1, "Đơn vị tính không được để trống"), // e.g. "Viên"
  instructions: z.string().optional(), // e.g. "Uống sau ăn"
  notes: z.string().optional(),
});

export const examinationCompleteSchema = z.object({
  visitId: z.string().uuid("Lượt khám không hợp lệ"),
  chiefComplaint: z.string().min(3, "Triệu chứng lâm sàng phải có ít nhất 3 ký tự"),
  icd10Code: z.string().min(2, "Mã ICD-10 phải có ít nhất 2 ký tự"),
  icd10Description: z.string().min(2, "Mô tả chẩn đoán phải có ít nhất 2 ký tự"),
  notes: z.string().optional(), // dặn dò bác sĩ
  prescriptionItems: z.array(prescriptionItemInputSchema).default([]),
});

export type ClsOrderInput = z.infer<typeof clsOrderInputSchema>;
export type ClsOrderArrayInput = z.infer<typeof clsOrderArraySchema>;
export type PrescriptionItemInput = z.infer<typeof prescriptionItemInputSchema>;
export type CompleteExamInput = z.infer<typeof examinationCompleteSchema>;
