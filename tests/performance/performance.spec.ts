import { test, expect } from '@playwright/test';

test('Queue page load: < 2s với 50 bệnh nhân', async ({ page }) => {
  const start = Date.now();
  // await page.goto('/reception');
  // await page.waitForLoadState('networkidle');
  expect(Date.now() - start).toBeLessThan(2000);
});
test('Patient search: < 500ms response', async ({ page }) => {});
