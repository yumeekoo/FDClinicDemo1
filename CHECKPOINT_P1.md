# CHECKPOINT - PHASE 1: FOUNDATION

## Đã Hoàn Thành (Done)

1. **Setup Dự án & Cấu trúc Thư mục**:
   - Khởi tạo Next.js 15 (App Router + Tailwind CSS + TypeScript strict mode)
   - Cài đặt và cấu hình Drizzle ORM + postgres.js
   - Cài đặt và cấu hình Supabase clients (Browser client, Server cookies-based client, Service role admin client)
   - Thiết lập cấu trúc thư mục đúng chuẩn theo Phần 2

2. **Cấu hình Môi trường**:
   - Tạo file mẫu `.env.local` đầy đủ biến cho Supabase & Drizzle

3. **Cơ sở Dữ liệu (Drizzle schemas)**:
   - Viết đầy đủ 18 bảng cơ sở dữ liệu bao gồm:
     - `branches`, `profiles` (mở rộng auth.users), `patients` (MPI), `patient_branch_links`, `visits`, `vitals`, `diagnoses`, `cls_orders`, `cls_results`, `prescriptions`, `prescription_items`, `procedures`, `invoices`, `invoice_items`, `payments`, `inventory_items`, `appointments`.
   - Re-export toàn bộ schemas trong `db/schema/index.ts`.
   - Chạy thành công `npx drizzle-kit generate` để tạo migration file SQL đầu tiên (`0000_powerful_luckman.sql`).

4. **RLS Policies**:
   - Viết toàn bộ 25+ RLS policies bằng SQL thuần trong `supabase/migrations/001_rls_policies.sql` đúng theo logic phân quyền & cách ly chi nhánh cho các bảng `patients`, `visits`, `cls_orders`, `cls_results`, `prescriptions`, `invoices`, `payments`, `inventory_items`.

5. **Middleware**:
   - Viết `middleware.ts` xử lý kiểm tra đăng nhập (auth check) và phân quyền route dựa trên `role` trong metadata của Supabase Auth.

6. **Các Trang Giao Diện Cơ Bản**:
   - Trang Đăng nhập (`(auth)/login/page.tsx`) với giao diện Glassmorphism tối hiện đại, xử lý auth với Supabase.
   - Trang Signout API route (`api/auth/signout/route.ts`) để xóa cookies phiên làm việc.
   - Layout Dashboard (`(dashboard)/layout.tsx`) với Sidebar hiển thị các menu chức năng tương ứng với role của user đang đăng nhập và thông tin chi nhánh hiện tại.

7. **Kiểm Tra Kỹ Thuật (Verification)**:
   - Chạy TypeScript compiler thành công (`npx tsc --noEmit` -> 0 lỗi).
   - Chạy build Next.js thành công (`npm run build` -> Succeeded).

## Chưa Hoàn Thành / Kế Hoạch Phase Tiếp Theo (Todo)

- Thực hiện **Phase 2: Core Patient Flow** (Tiếp đón bệnh nhân).
  - P2.1: Thành phần tìm kiếm bệnh nhân MPI Search (cross-branch).
  - P2.2: Form tạo mới / chỉnh sửa bệnh nhân (Zod validation).
  - P2.3: Đăng ký khám (Visit Creation) với status `WAITING`.
  - P2.4: Form nhập sinh hiệu (Vitals Form).
  - P2.5: Bảng hàng đợi real-time (Supabase Realtime subscription).
