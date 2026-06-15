# Quy Chuẩn Phát Triển (Developer & Contributing Guide)

Tài liệu này quy định các nguyên tắc để giữ cho source code đồng nhất, sạch sẽ và dễ bảo trì, phục vụ việc mở rộng các Phase 3, 4 tiếp theo.

## 1. Kiến Trúc Next.js 15 App Router
- **Server Components Mặc Định:** Không tự ý thêm `"use client"` ở đầu file trừ khi component đó cần sử dụng Hook (`useState`, `useEffect`) hoặc có tương tác trực tiếp với DOM (như `onClick`, `onChange`).
- **Data Fetching:** Khuyến khích fetch data trực tiếp trong các Server Components (bất đồng bộ `async`/`await`) để tối ưu tốc độ và SEO.

## 2. Xử Lý API (Server Actions)
- FDcare **KHÔNG** dùng Route Handlers (`app/api/`) cho các chức năng nội bộ.
- Mọi thao tác Mutation (Create - Read - Update - Delete) phải được viết trong thư mục `actions/`.
- File action phải có `"use server"` ở dòng đầu tiên. Hàm action nên trả về định dạng chuẩn: `{ success: boolean, data?: any, error?: string }`.

## 3. Database & Drizzle ORM
- Tuyệt đối không gọi các file trong thư mục `db/` trực tiếp từ Client Component.
- Khi cập nhật schema trong `db/schema/`, bắt buộc phải chạy lệnh `npx drizzle-kit generate` để tạo file SQL migration.
- **Quan trọng:** Dữ liệu đã được bảo mật qua **Row Level Security (RLS)** theo `branch_id`. Đừng cố gắng tự viết code lọc dữ liệu `.where(eq(tables.branchId, userBranchId))` trên mọi truy vấn vì điều đó dư thừa và dễ sai sót.

## 4. Giao Diện & UI/UX
- Dự án sử dụng **Tailwind CSS v4** (phiên bản mới nhất, cấu hình ngay tại file `globals.css`, không còn file `tailwind.config.ts`).
- Tận dụng tối đa thư viện UI từ `components/ui/` (được build trên nền shadcn/ui và radix-ui). Đừng tự code lại các component cơ bản (Button, Input, Select, Dialog...).

## 5. Xác Thực Dữ Liệu (Validation)
- Mọi form submit từ phía Client và mọi input truyền vào Server Action đều phải được kiểm tra (validate) chặt chẽ bằng **Zod**.
- Quy chuẩn Schema được lưu tại `lib/validations/`.

## 6. Git & Naming Convention
- Tên nhánh (Branch): `feature/ten-tinh-nang`, `fix/loi-gi-do`, `hotfix/loi-nghiem-trong`.
- Tên thư mục / file: Sử dụng kebab-case (ví dụ: `patient-list.tsx`, `use-branch.tsx`).
- Tên Component: PascalCase (ví dụ: `export function PatientList()`).
