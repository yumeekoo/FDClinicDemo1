# 🎤 Kịch Bản Demo Clinic Hub (Dành cho Người Thuyết Trình)

*Tài liệu này là "Phao cứu sinh" giúp bạn có một buổi Demo hoàn hảo, phô diễn được toàn bộ những tính năng đắt giá nhất mà AI và bạn đã cùng nhau xây dựng.*

---

## 🕒 Phút 1: Lời Mở Đầu & Đăng nhập
**Hành động:**
- Mở trang `http://localhost:3000` (Giao diện trống trải, yêu cầu đăng nhập).
- Đăng nhập bằng tài khoản Quản trị: `admin@clinichub.vn` / `Password123!`

**Kịch bản nói:**
> *"Chào các anh/chị, hôm nay em xin phép demo Hệ thống Quản trị Phòng khám Clinic Hub. Hệ thống này được bảo mật tuyệt đối. Ngay từ khâu đăng nhập, chúng em đã phân quyền chặt chẽ: Ai là Lễ tân thì chỉ thấy màn hình Đón khách, ai là Bác sĩ thì chỉ thấy bệnh án."*

---

## 🕒 Phút 3: Màn Hình Lễ Tân & Sức mạnh của Master Patient Index (MPI)
**Hành động:**
- Chuyển sang Tab Lễ Tân (`/reception`).
- Bấm **"Tìm kiếm bệnh nhân"**, gõ thử một SĐT (VD: `0901234567`).

**Kịch bản nói:**
> *"Các anh/chị xem, đây là tính năng MPI (Master Patient Index). Khi khách hàng từ chi nhánh HCM đến Hà Nội khám, Lễ tân chỉ cần gõ SĐT, hệ thống sẽ dò quét toàn quốc và báo ngay đây là 'Khách chi nhánh khác', ngăn chặn tình trạng tạo trùng lặp hàng vạn bệnh nhân rác như các phần mềm cũ."*

---

## 🕒 Phút 5: Hàng Chờ Real-Time (Không cần Load lại trang)
**Hành động:**
- Mở 2 trình duyệt song song (1 cửa sổ Lễ tân, 1 cửa sổ Bác sĩ: `doctor@clinichub.vn`).
- Lễ tân bấm "Tạo lượt khám mới". Ngay lập tức màn hình của Bác sĩ nhảy lên 1 thẻ bệnh nhân mới ở cột `Waiting`.

**Kịch bản nói:**
> *"Điểm ăn tiền nhất của hệ thống là Real-time. Lễ tân vừa ấn Enter ở sảnh dưới, trên lầu Bác sĩ đã nghe tiếng 'Ting' và thấy hồ sơ bệnh nhân xuất hiện ngay trên màn hình mà KHÔNG CẦN F5 tải lại trang. Chống ùn tắc cực kỳ hiệu quả."*

---

## 🕒 Phút 8: Bác Sĩ Kê Đơn & Thuật Toán Trừ Kho Cận Date (FEFO)
**Hành động:**
- Bác sĩ bấm vào bệnh nhân, sang tab "Kê đơn thuốc".
- Gõ `Gastropulgite`, hệ thống tự gợi ý tên thuốc. Chọn số lượng 20 gói.
- Đăng nhập Thu ngân (`cashier@clinichub.vn`), bấm thanh toán.

**Kịch bản nói:**
> *"Đây là một bài toán hóc búa nhất của quản lý phòng khám: Thuốc cận Date! Nhưng với Clinic Hub, khi thu ngân bấm Thanh toán, hệ thống sẽ tự động quét trong kho, thấy lô thuốc nào (Batch) sắp hết hạn nhất, nó sẽ tự động lôi lô đó ra trừ trước (FEFO). Không bao giờ có chuyện thuốc mới dùng trước, thuốc cũ bị ế đến hết hạn!"*

---

## 🕒 Phút 10: Chốt Sale (Kiểm thử Tự Động)
**Hành động:**
- Mở màn hình Terminal của VSCode (hoặc PowerShell).
- Gõ lệnh: `npm run test` và sau đó là `npm run test:e2e`.

**Kịch bản nói:**
> *"Để chứng minh sự bền bỉ của hệ thống, em sẽ chạy một dàn 'Robot Lễ Tân Ảo'. Dàn Robot này (Playwright) sẽ tự động mở màn hình lên, tự điền Form, tự thanh toán và rà quét 139 kịch bản lỗi bảo mật trong chưa đầy 5 giây. Nếu có bất kỳ chức năng nào hỏng, hệ thống sẽ chặn không cho đưa lên máy chủ. Đây là chuẩn mực phần mềm quốc tế!"*

---
**Chúc bạn có một buổi Demo bùng nổ và chốt Deal thành công!** 🚀
