import { z } from "zod";

export const patientSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  dateOfBirth: z.preprocess(
    (val) => (typeof val === "string" && val ? new Date(val) : val),
    z.date({
      message: "Ngày sinh không hợp lệ hoặc phải là định dạng ngày",
    })
  ),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    message: "Vui lòng chọn giới tính",
  }),
  phone: z
    .string()
    .min(10, "Số điện thoại phải từ 10 số")
    .max(15, "Số điện thoại không hợp lệ")
    .regex(/^[0-9]+$/, "Số điện thoại chỉ được chứa số"),
  cccd: z
    .string()
    .length(12, "Số CCCD phải có đúng 12 chữ số")
    .regex(/^[0-9]+$/, "Số CCCD chỉ được chứa số")
    .nullable()
    .or(z.literal("")),
  bhytCode: z
    .string()
    .length(15, "Mã BHYT phải có đúng 15 ký tự")
    .nullable()
    .or(z.literal("")),
  address: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  bloodType: z.preprocess(
    (val) => (val === "none" || val === "" ? undefined : val),
    z.enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]).optional()
  ),
  allergies: z.preprocess(
    (val) =>
      typeof val === "string"
        ? val
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item !== "")
        : val,
    z.array(z.string()).default([])
  ),
  notes: z.string().optional(),
});

export type PatientInput = z.infer<typeof patientSchema>;
