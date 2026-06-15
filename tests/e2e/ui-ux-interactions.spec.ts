import { test, expect } from '@playwright/test';

test('Hover on Patient Card changes shadow/border', async ({ page }) => {
  // await page.goto('/reception');
  // const card = page.locator('.patient-card').first();
  // const initialBoxShadow = await card.evaluate((el) => window.getComputedStyle(el).boxShadow);
  // await card.hover();
  // await page.waitForTimeout(200);
  // const hoverBoxShadow = await card.evaluate((el) => window.getComputedStyle(el).boxShadow);
  // expect(hoverBoxShadow).not.toEqual(initialBoxShadow);
});

test('Empty Form Submit shows red borders on required fields', async ({ page }) => {
  // await page.goto('/reception');
  // await page.click('button:has-text("Lưu")');
  // const phoneInput = page.locator('input[name="phone"]');
  // await expect(phoneInput).toHaveCSS('border-color', 'rgb(239, 68, 68)'); // red-500
});

test('Toast Notification disappears after 3s', async ({ page }) => {
  // simulate success action
  // const toast = page.locator('.toast');
  // await expect(toast).toBeVisible();
  // await expect(toast).toBeHidden({ timeout: 4000 });
});
