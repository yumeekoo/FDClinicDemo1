import { z } from "zod";

export const appointmentSchema = z.object({
  patientId: z.string().uuid("Bệnh nhân không hợp lệ"),
  doctorId: z.string().uuid("Bác sĩ không hợp lệ").nullable().optional(),
  scheduledAt: z.preprocess(
    (val) => (typeof val === "string" && val ? new Date(val) : val),
    z.date({
      message: "Thời gian hẹn không hợp lệ",
    })
  ),
  durationMinutes: z.coerce.number().int().min(5).max(120).default(15),
  reason: z.string().min(2, "Lý do hẹn phải có ít nhất 2 ký tự"),
  notes: z.string().optional().nullable(),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;
