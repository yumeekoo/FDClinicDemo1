import { z } from "zod";

export const submitClsResultSchema = z.object({
  orderId: z.string().uuid("Y lệnh không hợp lệ"),
  resultText: z.string().min(3, "Mô tả kết quả phải có ít nhất 3 ký tự"),
  isAbnormal: z.boolean().default(false),
  fileUrls: z.array(z.string()).default([]),
});

export type SubmitClsResultInput = z.infer<typeof submitClsResultSchema>;
