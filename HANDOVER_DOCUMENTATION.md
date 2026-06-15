# TÀI LIỆU BÀN GIAO DỰ ÁN (HANDOVER DOCUMENTATION)
**Dự án:** FDcare - Hệ thống Quản lý Phòng khám Đa chi nhánh (Clinic Hub)
**Phiên bản:** 1.0 (Hoàn thành Phase 1 & 2 - Core Patient Flow)

Tài liệu này được chia làm hai phần: Phần 1 dành cho Khách hàng/Ban quản lý (tập trung vào tính năng, nghiệp vụ bằng ngôn ngữ dễ hiểu - low code) và Phần 2 dành cho Đội ngũ Kỹ thuật (tập trung vào kiến trúc, database và hướng dẫn bảo trì).

---

## PHẦN 1: TỔNG QUAN VÀ NGHIỆP VỤ (Dành cho Khách hàng / Quản lý)

### 1. Giới thiệu chung
Hệ thống **FDcare (Clinic Hub)** là phần mềm quản lý phòng khám hiện đại, hỗ trợ vận hành **nhiều chi nhánh cùng lúc**. Hệ thống giúp số hóa toàn bộ quy trình từ lúc bệnh nhân bước vào cửa đến khi hoàn tất thăm khám. Điểm đặc biệt của hệ thống là khả năng quản lý hồ sơ bệnh nhân tập trung (MPI), giúp bệnh nhân dù khám ở chi nhánh nào cũng có thể truy xuất lại lịch sử y tế cũ.

### 2. Các tính năng cốt lõi đã hoàn thiện
*   **Quản lý Đa chi nhánh (Multi-branch):** Nhân viên có thể làm việc tại nhiều chi nhánh khác nhau. Quản trị viên chỉ cần thêm tên chi nhánh mới vào hệ thống là có thể vận hành ngay lập tức mà không cần cài đặt lại phần mềm. Dữ liệu giữa các chi nhánh được cách ly hoàn toàn, đảm bảo bảo mật.
*   **Quản lý Hồ sơ Bệnh nhân Tập trung (MPI):** Tìm kiếm bệnh nhân cực nhanh qua Số điện thoại hoặc CCCD trên toàn bộ hệ thống.
*   **Quy trình Tiếp đón & Hàng đợi (Reception & Queue):**
    *   Đăng ký khám nhanh chóng, tự động sinh mã lượt khám (VD: KH-20260615-0001).
    *   Hỗ trợ ghi nhận Sinh hiệu ngay tại quầy (Huyết áp, Mạch, Nhiệt độ, SpO2, Chiều cao, Cân nặng) với cảnh báo chỉ số bất thường.
    *   **Màn hình Hàng đợi theo thời gian thực (Real-time Queue):** Hỗ trợ hiển thị trên Smart TV ở phòng chờ. Bệnh nhân thấy tên mình tự động cập nhật lên màn hình ngay khi lễ tân vừa đăng ký xong (không cần tải lại trang).
*   **Phân quyền bảo mật cao:** Hệ thống chia vai trò rõ ràng (Admin, Lễ tân, Bác sĩ). Nhân viên chỉ thấy được bệnh nhân và lượt khám thuộc chi nhánh mình đang trực.

### 3. Luồng nghiệp vụ cơ bản (User Flow)
1.  **Tiếp đón:** Bệnh nhân đến quầy, Lễ tân tìm số điện thoại/CCCD.
    *   *Nếu là bệnh nhân mới:* Tạo hồ sơ mới.
    *   *Nếu là bệnh nhân cũ:* Cập nhật thông tin nếu cần.
2.  **Đăng ký khám:** Lễ tân tạo lượt khám mới, bệnh nhân tự động được đưa vào danh sách chờ của chi nhánh. Tên bệnh nhân hiện lên màn hình Smart TV phòng chờ.
3.  **Đo sinh hiệu (Tùy chọn):** Điều dưỡng/Lễ tân đo và nhập sinh hiệu vào phần mềm.
4.  **Khám bệnh (Phase tiếp theo):** Bác sĩ gọi tên từ hàng đợi vào phòng khám, xem lịch sử và ra chỉ định.

---

## PHẦN 2: KIẾN TRÚC KỸ THUẬT & BẢO TRÌ (Dành cho Developers)

Phần này cung cấp cái nhìn toàn diện về Technical Stack và System Architecture để team dev mới có thể dễ dàng tiếp nhận, cài đặt, test và tiếp tục phát triển (Phase 3+).

### 1. Technology Stack
*   **Core Framework:** Next.js 15 (App Router, React 19) - Tối ưu hóa SEO và Server-Side Rendering (SSR).
*   **Ngôn ngữ:** TypeScript (Strict mode được bật 100%, không sử dụng `any`).
*   **Giao diện (UI):** Tailwind CSS v4, shadcn/ui, Lucide Icons, Glassmorphism UI design.
*   **Database:** PostgreSQL (Supabase).
*   **ORM:** Drizzle ORM kết hợp `postgres.js` (Tốc độ query nhanh, type-safe).
*   **Authentication & Realtime:** Supabase Auth (Cookies-based SSR) & Supabase Realtime Channels.
*   **Data Validation:** Zod schema & React Hook Form.
*   **Testing:** Vitest (Unit/Integration test), Playwright (E2E Testing).

### 2. Kiến trúc Hệ thống (System Architecture)
Dự án áp dụng mô hình phân tách Server/Client rõ ràng theo Next.js App Router:
*   `app/`: Chứa các Routes, Pages, và Layouts. Mọi component ở đây mặc định là Server Components (RSC) trừ khi khai báo `"use client"`.
*   `actions/`: Chứa các **Server Actions** (Next.js) thực hiện mọi tương tác (C-R-U-D) với database. Tuyệt đối không gọi trực tiếp Database từ Client. Các actions nổi bật: `patients.ts`, `visits.ts`, `branches.ts`.
*   `components/`: Chứa UI Components (shadcn/ui và custom modules).
*   `hooks/`: Custom React Hooks. Quan trọng: `use-branch.tsx` (Quản lý state chi nhánh), `use-realtime-queue.ts` (Lắng nghe web-socket cập nhật hàng đợi lượt khám).
*   `lib/validations/`: Chứa toàn bộ logic kiểm tra dữ liệu bằng Zod (VD: `patient.ts`, `visit.ts`).
*   `db/schema/`: Nơi định nghĩa cấu trúc của 15 bảng CSDL bằng Drizzle.

### 3. Database Schema & RLS (Row Level Security)
Hệ thống sử dụng **PostgreSQL** với 15 bảng cốt lõi (Xem tại `db/schema/`):
*   **Core:** `branches`, `users`, `profiles`
*   **Medical:** `patients` (MPI), `visits`, `vitals`, `diagnoses`
*   **Clinical:** `cls_orders`, `cls_results`, `prescriptions`, `procedures`
*   **Billing & Inventory:** `invoices`, `payments`, `inventory`

**Cơ chế Đa chi nhánh (Multi-branch) cực kỳ quan trọng:**
*   Hệ thống không hardcode chi nhánh.
*   Bảo mật ở cấp độ Database thông qua **Supabase Row Level Security (RLS)**.
*   Mỗi user được gán một hàm SQL `get_user_branch_id()`. Khi query thông qua Server Actions, Postgres sẽ tự động thêm bộ lọc (filter) chỉ trả về dữ liệu (visits, inovoices...) thuộc về `branch_id` hiện tại. Dev **không cần** thêm `.where(eq(visits.branchId, currentBranch))` vào mọi câu query. (Cấu hình RLS xem trong file migrations).

### 4. Hướng dẫn Cài đặt & Khởi chạy (Local Development)

**Yêu cầu môi trường:** Node.js 20+, npm/pnpm.

1.  **Clone & Install:**
    ```bash
    git clone <repo-url>
    cd clinic-hub
    npm install
    ```
2.  **Cấu hình Môi trường:**
    Tạo file `.env.local` ở thư mục gốc và điền các khóa Supabase:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    DATABASE_URL=your_postgres_connection_string
    ```
3.  **Đồng bộ Database (Drizzle):**
    ```bash
    npx drizzle-kit push  # Cập nhật schema trực tiếp lên DB
    # Hoặc nếu dùng migration chuẩn:
    npx drizzle-kit generate
    npx drizzle-kit migrate
    ```
4.  **Seed Dữ liệu mẫu (nếu DB trống):**
    ```bash
    npm run db:seed
    ```
5.  **Khởi chạy Server:**
    ```bash
    npm run dev
    ```

### 5. Hướng dẫn Test (Quality Assurance)
Hệ thống được thiết lập sẵn bộ công cụ test đầy đủ:
*   **Unit & Integration Tests:** Chạy `npm run test` (Dùng Vitest).
*   **Kiểm tra Coverage:** `npm run test:coverage`.
*   **E2E Tests (Luồng người dùng UI):** Chạy `npm run test:e2e` (Dùng Playwright). Báo cáo HTML tự động sinh ra ở `test-results/`.
*   **Kiểm tra TypeScript:** Đảm bảo không có lỗi bằng lệnh `npx tsc --noEmit`.

### 6. Hướng dẫn Triển khai (Deployment)
Nền tảng khuyên dùng: **Vercel**.
1.  Đẩy code lên GitHub.
2.  Kết nối Repo với Vercel.
3.  Cấu hình Environment Variables trên Vercel dashboard y hệt như file `.env.local`.
4.  Build Command mặc định là `npm run build`.
5.  *Lưu ý:* Cấu hình thêm SSL/TLS trên Supabase Database Network nếu có yêu cầu IP Pooling. Hệ thống đã sử dụng connection pooling an toàn qua chuỗi `DATABASE_URL`.

---
*Tài liệu này là "Sổ tay" để duy trì vòng đời phát triển dự án. Nếu có bất kỳ chỉnh sửa nào về cấu trúc Database hoặc Business Logic trong các Phase tiếp theo, vui lòng cập nhật trực tiếp vào file này.*
