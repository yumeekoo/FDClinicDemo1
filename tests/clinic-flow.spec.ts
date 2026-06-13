import { test, expect } from "@playwright/test";

test.describe("Clinic-Hub Complete Patient Care & Financial Workflow E2E", () => {
  // Test credentials (mocked or pre-configured in target database)
  const LOGIN_URL = "/login";
  const RECEPTION_EMAIL = "receptionist@clinichub.vn";
  const DOCTOR_EMAIL = "doctor@clinichub.vn";
  const PARACLINICAL_EMAIL = "technician@clinichub.vn";
  const CASHIER_EMAIL = "cashier@clinichub.vn";
  const PASSWORD = "Password123!";

  test("1. Receptionist can log in, register a patient and create a visit", async ({ page }) => {
    // A. Login as receptionist
    await page.goto(LOGIN_URL);
    await page.fill('input[type="email"]', RECEPTION_EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');

    // Confirm redirected to receptionist dashboard
    await expect(page).toHaveURL(/\/reception/);
    await expect(page.locator("text=Tiếp đón bệnh nhân")).toBeVisible();

    // B. Register a new patient
    await page.click("text=Thêm bệnh nhân mới");
    await page.fill('input[placeholder="Họ tên"]', "Nguyễn Văn Test");
    await page.fill('input[type="date"]', "1990-01-01");
    await page.selectOption("select#gender", "MALE");
    await page.fill('input[placeholder="Số điện thoại"]', "0987654321");
    await page.fill('input[placeholder="Số CCCD"]', "123456789012");
    await page.fill('input[placeholder="Mã BHYT"]', "GD4791234567890");
    await page.fill('input[placeholder="Địa chỉ"]', "123 Đường Test, Hà Nội");
    await page.click("text=Lưu hồ sơ");

    // Success notification should appear
    await expect(page.locator("text=Tạo hồ sơ bệnh nhân thành công")).toBeVisible();

    // C. Create a clinic visit queue entry
    await page.click("text=Đăng ký khám");
    await page.selectOption("select#doctor", { label: "Bác Sĩ Lâm Sàng" });
    await page.fill('textarea[placeholder="Lý do khám"]', "Đau bụng âm ỉ vùng thượng vị");
    await page.fill('textarea[placeholder="Tiền sử bệnh lý"]', "Dạ dày nhẹ");
    await page.click("text=Xác nhận đăng ký");

    await expect(page.locator("text=Tạo lượt khám thành công")).toBeVisible();
  });

  test("2. Doctor can record vitals, order CLS, and prescribe medicine", async ({ page }) => {
    // A. Login as doctor
    await page.goto(LOGIN_URL);
    await page.fill('input[type="email"]', DOCTOR_EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/doctor/);
    await expect(page.locator("text=Phòng khám bác sĩ")).toBeVisible();

    // B. Start examination
    // Select the first patient in WAITING queue
    await page.click("text=Khám bệnh");
    await expect(page.locator("text=Hồ Sơ Bệnh Nhân 360")).toBeVisible();

    // C. Fill Vitals Form
    await page.fill('input[name="bloodPressureSystolic"]', "120");
    await page.fill('input[name="bloodPressureDiastolic"]', "80");
    await page.fill('input[name="heartRate"]', "75");
    await page.fill('input[name="temperature"]', "36.8");
    await page.fill('input[name="weight"]', "65");
    await page.fill('input[name="height"]', "170");
    await page.fill('input[name="spo2"]', "98");
    await page.click("text=Cập nhật sinh hiệu");
    await expect(page.locator("text=Cập nhật sinh hiệu thành công")).toBeVisible();

    // D. Order Paraclinical (CLS)
    await page.click("text=Chỉ định Cận lâm sàng");
    await page.check('input[value="X-QUANG-NGUC"]');
    await page.check('input[value="CONG-THUC-MAU"]');
    await page.click("text=Xác nhận chỉ định");
    await expect(page.locator("text=Gửi chỉ định CLS thành công")).toBeVisible();

    // F. Diagnose and Prescribe
    await page.fill('input[placeholder="Nhập mã ICD-10"]', "K29"); // Gastritis
    await page.fill('textarea[placeholder="Chẩn đoán xác định"]', "Viêm dạ dày cấp tính");
    
    // Add prescription item
    await page.click("text=Thêm thuốc");
    await page.selectOption("select.drug-selector", { label: "Gastropulgite" });
    await page.fill('input[name="quantity"]', "30");
    await page.fill('input[name="usageInstruction"]', "Uống 1 gói trước khi ăn 30 phút, ngày 3 lần");
    
    // Complete Exam (sends to payment queue)
    await page.click("text=Hoàn tất khám");
    await expect(page.locator("text=Hoàn thành lượt khám bệnh")).toBeVisible();
  });

  test("3. Paraclinical technician can record and upload imaging results", async ({ page }) => {
    // A. Login as technician
    await page.goto(LOGIN_URL);
    await page.fill('input[type="email"]', PARACLINICAL_EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/paraclinical/);
    await expect(page.locator("text=Khu Cận lâm sàng")).toBeVisible();

    // B. Select order and enter results
    await page.click("text=Nhập kết quả");
    await page.fill('textarea[placeholder="Kết quả chi tiết"]', "Hình ảnh tim phổi bình thường, bóng tim không to.");
    await page.fill('textarea[placeholder="Kết luận"]', "X-quang ngực thẳng bình thường.");
    
    // Mock image upload
    await page.setInputFiles('input[type="file"]', {
      name: 'chest-xray.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('mock-data')
    });
    
    await page.click("text=Lưu & Trả kết quả");
    await expect(page.locator("text=Cập nhật kết quả CLS thành công")).toBeVisible();
  });

  test("4. Cashier can apply insurance discount, checkout and print receipt", async ({ page }) => {
    // A. Login as cashier
    await page.goto(LOGIN_URL);
    await page.fill('input[type="email"]', CASHIER_EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/cashier/);
    await expect(page.locator("text=Quầy thu ngân")).toBeVisible();

    // B. Select pending bill
    await page.click("text=Thanh toán");
    await expect(page.locator("text=Chi tiết hóa đơn viện phí")).toBeVisible();

    // C. Verify auto calculations and apply discounts
    const subtotalText = await page.textContent(".bill-subtotal");
    expect(subtotalText).not.toBeNull();

    await page.fill('input[name="discountAmount"]', "20000"); // 20K discount
    await page.fill('input[name="bhytAmount"]', "50000"); // 50K insurance

    // Verify method selection and checkout
    await page.selectOption("select#paymentMethod", "TRANSFER");
    await page.click("text=Xác nhận thanh toán");
    await expect(page.locator("text=Thanh toán hóa đơn thành công")).toBeVisible();

    // D. Print check
    const printButton = page.locator("text=In hóa đơn");
    await expect(printButton).toBeVisible();
  });
});
