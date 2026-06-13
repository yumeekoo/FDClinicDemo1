import { z } from "zod";

export const branchSchema = z.object({
  name: z.string().min(2, "Tên chi nhánh phải có ít nhất 2 ký tự"),
  address: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  phone: z
    .string()
    .min(10, "Số điện thoại phải từ 10 số")
    .max(15, "Số điện thoại không hợp lệ")
    .regex(/^[0-9]+$/, "Số điện thoại chỉ được chứa số"),
  code: z.string().min(2, "Mã chi nhánh phải có ít nhất 2 ký tự"),
  isActive: z.boolean().default(true),
});

export type BranchInput = z.infer<typeof branchSchema>;

export const employeeSchema = z.object({
  email: z.string().email("Địa chỉ Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").optional().or(z.literal("")),
  fullName: z.string().min(2, "Họ tên nhân viên phải có ít nhất 2 ký tự"),
  phone: z
    .string()
    .min(10, "Số điện thoại phải từ 10 số")
    .max(15, "Số điện thoại không hợp lệ")
    .regex(/^[0-9]+$/, "Số điện thoại chỉ được chứa số"),
  role: z.enum([
    "ADMIN",
    "BRANCH_ADMIN",
    "RECEPTION",
    "DOCTOR",
    "PARACLINICAL",
    "CASHIER",
    "PHARMACIST"
  ], {
    message: "Vui lòng chọn vai trò hợp lệ",
  }),
  branchId: z.string().uuid("Chi nhánh không hợp lệ"),
  employeeCode: z.string().min(2, "Mã nhân viên phải có ít nhất 2 ký tự"),
  isActive: z.boolean().default(true),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;
