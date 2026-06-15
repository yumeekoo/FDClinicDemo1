import { test, expect } from '@playwright/test';

test('Dashboard Page - Visual Snapshot', async ({ page }) => {
  // await page.goto('/admin');
  // await expect(page).toHaveScreenshot('dashboard-baseline.png', { fullPage: true });
});

test('Patient Form - Visual Snapshot', async ({ page }) => {
  // await page.goto('/reception');
  // await page.click('button:has-text("Tạo mới")');
  // await expect(page.locator('.patient-form-modal')).toHaveScreenshot('patient-form-modal.png');
});
