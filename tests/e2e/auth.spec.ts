import { test, expect } from '@playwright/test';

test('login thành công → redirect đúng dashboard theo role', async ({ page }) => {
  // await page.goto('/login');
  // await page.fill('input[name="email"]', 'admin@clinichub.vn');
  // await page.fill('input[name="password"]', 'Password123!');
  // await page.click('button[type="submit"]');
  // await expect(page).toHaveURL(/.*\/admin/);
});
test('login sai password → error message rõ ràng', async ({ page }) => {});
test('đăng xuất → session xóa, redirect /login', async ({ page }) => {});
