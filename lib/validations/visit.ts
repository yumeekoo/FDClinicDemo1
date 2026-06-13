import { z } from "zod";

export const visitSchema = z.object({
  patientId: z.string().uuid("Bệnh nhân không hợp lệ"),
  doctorId: z.string().uuid("Bác sĩ không hợp lệ"),
  chiefComplaint: z.string().min(3, "Lý do khám phải có ít nhất 3 ký tự"),
  medicalHistory: z.string().default("Không có"),
});

export const vitalsSchema = z.object({
  bloodPressureSystolic: z
    .number({ message: "Vui lòng nhập huyết áp tâm thu" })
    .min(50, "Huyết áp tâm thu quá thấp")
    .max(250, "Huyết áp tâm thu quá cao"),
  bloodPressureDiastolic: z
    .number({ message: "Vui lòng nhập huyết áp tâm trương" })
    .min(30, "Huyết áp tâm trương quá thấp")
    .max(150, "Huyết áp tâm trương quá cao"),
  heartRate: z
    .number({ message: "Vui lòng nhập nhịp tim" })
    .min(30, "Nhịp tim quá thấp")
    .max(250, "Nhịp tim quá cao"),
  temperature: z
    .number({ message: "Vui lòng nhập nhiệt độ" })
    .min(30, "Nhiệt độ quá thấp")
    .max(45, "Nhiệt độ quá cao"),
  weight: z
    .number({ message: "Vui lòng nhập cân nặng" })
    .min(1, "Cân nặng quá thấp")
    .max(300, "Cân nặng quá cao"),
  height: z
    .number({ message: "Vui lòng nhập chiều cao" })
    .min(30, "Chiều cao quá thấp")
    .max(250, "Chiều cao quá cao"),
  spo2: z
    .number({ message: "Vui lòng nhập SpO2" })
    .min(50, "SpO2 quá thấp")
    .max(100, "SpO2 không thể vượt quá 100%"),
  notes: z.string().optional(),
});

export type VisitInput = z.infer<typeof visitSchema>;
export type VitalsInput = z.infer<typeof vitalsSchema>;
