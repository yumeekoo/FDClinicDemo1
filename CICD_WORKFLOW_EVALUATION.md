# Tài liệu Báo cáo: CI/CD & Đánh giá Kiến trúc Workflow

Tài liệu này bao gồm hai phần chính:
1. Chi tiết về cách hoạt động của CI/CD trong dự án FDcare (Clinic Hub) hiện tại.
2. Đánh giá ưu nhược điểm giữa kiến trúc **Work-graph (DAG + Đệ quy)** so với kiến trúc **Role-based (Dựa trên Vai trò)** đang được sử dụng.

---

## Phần 1: Quy trình CI/CD trong dự án hiện tại

Dựa trên cấu trúc dự án (sử dụng Next.js, Vercel, Supabase, Vitest, Playwright), luồng CI/CD (Continuous Integration / Continuous Deployment) hiện tại được vận hành chủ yếu thông qua **GitHub** kết hợp với **Vercel** và các công cụ kiểm thử cục bộ.

### 1. Continuous Integration (Tích hợp liên tục - CI)
Trong quá trình phát triển, các kỹ sư/agent liên tục tích hợp code mới và đảm bảo tính đúng đắn qua các khâu:
*   **Linting & Type Checking:** Sử dụng `eslint` và Next.js build type check để đảm bảo code không có lỗi cú pháp và tuân thủ TypeScript strict-mode.
*   **Unit/Integration Testing:** Chạy qua `vitest` (`npm run test`). File cấu hình `vitest.config.ts` cho thấy test được chạy độc lập, kiểm tra các logic tính toán (VD: hàm tính tuổi, hàm xử lý chuỗi), các Server Actions cơ bản.
*   **End-to-End (E2E) Testing:** Chạy qua `playwright` (`npm run test:e2e`). Playwright đóng vai trò như một người dùng thật, thao tác trên giao diện trình duyệt để đảm bảo luồng nghiệp vụ (Tiếp đón -> Đăng ký) không bị gãy.

### 2. Continuous Deployment (Triển khai liên tục - CD)
Dự án được cấu hình triển khai tự động lên nền tảng **Vercel** (như cấu hình trong file `vercel.json` và tài liệu handover).
*   **Preview Deployments:** Khi tạo Pull Request (PR) hoặc đẩy code lên các branch tính năng, Vercel tự động build và tạo ra một Preview URL để team có thể kiểm tra trực quan giao diện và tính năng mới trước khi merge.
*   **Production Deployment:** Khi PR được merge vào branch chính (thường là `main`), Vercel tự động kích hoạt tiến trình Production Build. Quá trình này bao gồm build Next.js, tối ưu hóa asset và đẩy lên serverless edge network.
*   **Database Migrations (Supabase):** Mặc dù CI/CD cho code đã tự động, phần database thường đi kèm với các script migration của Drizzle/Supabase. Khi có cập nhật về lược đồ (schema), migration cần được chạy để đồng bộ cấu trúc database trên môi trường production.

---

## Phần 2: Đánh giá phương án Work-graph (DAG + Đệ quy) vs Role-base hiện tại

Hiện tại, hệ thống FDcare sử dụng luồng thiết kế **Role-base (Dựa trên Vai trò)**. Nghĩa là luồng nghiệp vụ được điều hướng phụ thuộc vào quyền của người dùng (Ví dụ: Lễ tân chỉ thấy form tiếp đón, Bác sĩ chỉ thấy danh sách chờ khám của mình).

Nếu dự định chuyển đổi cốt lõi điều phối (hoặc áp dụng hệ thống Multi-Agent / AI cho dự án) sang mô hình **Work-graph (DAG + Đệ quy)** (một cấu trúc đồ thị trạng thái có hướng, có khả năng quay lui/đệ quy giống LangGraph), dưới đây là đánh giá chi tiết:

### 1. Phương án Role-base hiện tại (Dựa trên Vai trò)

Trong phương án này, trạng thái của bệnh nhân chỉ đơn thuần là dữ liệu nằm trong Database. Ứng dụng/Agent quyết định mình phải làm gì tiếp theo bằng cách "nhìn" vào chức năng được cấp cho Role của mình.

**Ưu điểm:**
*   **Dễ hiểu và triển khai nhanh:** Ánh xạ trực tiếp 1-1 với cơ cấu tổ chức của phòng khám ngoài đời thực (Bộ phận Triage, Bộ phận Khám, Bộ phận Thuốc).
*   **Phân quyền rõ ràng (RBAC):** Rất chặt chẽ về mặt bảo mật. Admin dễ dàng thêm bớt quyền cho từng Role mà không làm ảnh hưởng đến luồng code quá nhiều.
*   **Giao diện độc lập:** Mỗi Role có một UI/Dashboard riêng (`/doctor`, `/receptionist`), dễ dàng thiết kế layout phù hợp cho từng cá nhân.

**Nhược điểm:**
*   **Luồng nghiệp vụ ẩn (Implicit Workflow):** Không có một nơi duy nhất định nghĩa "Bệnh nhân phải đi từ A -> B -> C". Luồng này bị phân mảnh trong logic giao diện và các lệnh truy vấn DB của từng Role.
*   **Khó xử lý các trường hợp ngoại lệ/linh hoạt:** Nếu một bệnh nhân cần khám, sau đó đi xét nghiệm, rồi quay lại khám tiếp (đây là một vòng lặp), hệ thống Role-base chỉ cập nhật trạng thái "Chờ khám lại", dễ dẫn đến rủi ro "bỏ quên" bệnh nhân nếu giao diện bác sĩ không query đúng trạng thái đó.
*   **Phụ thuộc vào con người/agent cụ thể:** Luồng chạy bị động, phải chờ người có role tương ứng đăng nhập và thao tác (chuyển giao trạng thái), không thể tự động hóa chuỗi hành động một cách dễ dàng.

### 2. Phương án Work-graph (DAG + Đệ quy)

Trong phương án Work-graph, toàn bộ quy trình khám chữa bệnh (hoặc quy trình xử lý của AI Agents) được mô hình hóa thành một **Đồ thị (Graph)**. Các đỉnh (Nodes) là các bước công việc/trạng thái (Tiếp đón, Triage, Khám, Xét nghiệm), và các cạnh (Edges) là luồng chuyển trạng thái. Đặc tính **Đệ quy** cho phép đồ thị quay ngược về Node trước đó (VD: Khám -> Xét nghiệm -> Khám lại).

**Ưu điểm:**
*   **Điều phối (Orchestration) mạnh mẽ:** Có một "Graph Engine" đóng vai trò là nhạc trưởng. Hệ thống biết chính xác bệnh nhân đang ở Node nào và tự động chuyển (route) bệnh nhân đến Node tiếp theo sau khi hoàn thành.
*   **Xử lý Đệ quy (Vòng lặp) xuất sắc:** Giải quyết cực tốt bài toán bệnh nhân phải quay lại phòng bác sĩ sau khi có kết quả xét nghiệm, vì đồ thị hỗ trợ vòng lặp có kiểm soát.
*   **Tự động hóa & Tích hợp AI (Agentic Workflow):** Rất dễ dàng chèn một Agent AI vào giữa graph (Ví dụ: Node "AI chẩn đoán sơ bộ") tự động xử lý trước khi đẩy sang Node Bác sĩ. Mô hình này là tiêu chuẩn cho thiết kế Multi-agent (như LangGraph).
*   **Dễ dàng theo dõi (Observability):** Có thể trace được log toàn bộ vòng đời của một bệnh nhân đi qua các node nào, mất bao nhiêu thời gian ở mỗi node.

**Nhược điểm:**
*   **Độ phức tạp kiến trúc cao:** Cần phải viết hoặc tích hợp một Workflow Engine (như XState, Temporal, hoặc custom graph engine trong Node.js) để duy trì state của đồ thị.
*   **Độ trễ (Latency) có thể tăng:** Việc tính toán bước tiếp theo qua graph engine đòi hỏi xử lý state phức tạp hơn so với việc chỉ đơn thuần ghi vào Database (Role-base).
*   **Khó linh hoạt vượt rào (Bypass):** Graph đòi hỏi sự chặt chẽ. Nếu quy trình ngoài đời có ca cấp cứu cần nhảy cóc (bypass) từ Tiếp đón thẳng vào Khám mà Graph không định nghĩa đường nối (edge) đó, hệ thống sẽ bị kẹt.

### Tổng kết và Khuyến nghị

*   **Giữ Role-base nếu:** Dự án FDcare ở các Phase đầu chỉ đơn thuần là công cụ CRUD (nhập liệu, lưu trữ) và muốn ra mắt nhanh. Các phòng khám nhỏ thường vận hành dựa trên giao tiếp miệng và chỉ dùng phần mềm để lưu hồ sơ.
*   **Chuyển sang Work-graph (DAG + Đệ quy) nếu:**
    1.  Bạn muốn xây dựng một hệ thống **chăm sóc tự động**, định tuyến bệnh nhân thông minh để giảm thời gian chờ đợi.
    2.  Bạn có kế hoạch tích hợp **AI Agents** (LLMs) tự động tương tác ở từng khâu (ví dụ nhắc nhở khám lại, phân tích kết quả xét nghiệm).
    3.  Quy trình phòng khám rất lớn, phức tạp và có nhiều vòng lặp (như bệnh viện).

Việc áp dụng Work-graph có thể bắt đầu bằng việc tích hợp **State Machine** (ví dụ `xstate`) vào logic của backend hoặc thiết kế một bảng `workflow_transitions` trong Database để dần dần chuyển từ luồng Implicit sang Explicit.
