# 📊 TESTING REPORT (Draft)

## Coverage Summary
- Unit tests: 13 tests (Skeletons generated)
- Integration tests: 7 tests (Skeletons generated)
- E2E tests: 7 tests (Skeletons generated)
- Security tests: 1 tests (Skeletons generated)
- Accessibility tests: 1 tests (Skeletons generated)
- Performance tests: 1 tests (Skeletons generated)
- **Total: 30 test files generated**

## Có thể tự động test:
- 100% Core Business Logic (FEFO, MPI, Billing, Booking).
- Toàn bộ form validation bằng Zod.
- Row Level Security (RLS) policies.
- Rendering các Component UI bằng JSDOM.
- Luồng End-to-End (E2E) từ khi đăng nhập đến khi hoàn tất đơn thuốc thông qua Playwright.

## ⚠️ CẦN HUMAN TEST (AI không thể):
- [ ] Supabase Realtime queue update khi có bệnh nhân mới (cần 2 browser thực sự song song hoặc thiết lập worker đặc thù của Playwright).
- [ ] Payment gateway live (MOMO, VNPay sandbox keys thực).
- [ ] Upload ảnh DICOM/PDF lên Supabase Storage thực (tương tác OS File System ngoài luồng test browser).
- [ ] In hóa đơn (print dialog, thiết lập driver máy in vật lý).
- [ ] Cổng Đơn thuốc Quốc gia (credentials thực, OTP).
- [ ] BHYT sync (credentials Bộ Y Tế).
- [ ] Performance với concurrent users thực (50+ người dùng mạng 3G/4G chập chờn).
- [ ] Test trên device iOS/Android vật lý (để kiểm tra lỗi render trên Safari iOS cũ).
- [ ] Data migration thực tế từ phần mềm quản lý phòng khám cũ (KiotViet, v.v...).

## Known Limitations:
- MSW (Mock Service Worker) đang chặn kết nối mạng, các API ra ngoài cần phải được thiết lập Passthrough.
- Test Playwright trên Mobile view hiện đang dùng Emulator của Chromium, không phản ánh 100% Webkit Engine của iPhone.
