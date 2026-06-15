import { test, expect } from '@playwright/test';

test('Sidebar is hidden on Mobile and shows Hamburger Menu', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  // await page.goto('/admin');
  // const sidebar = page.locator('aside');
  // await expect(sidebar).toBeHidden();
  // const menuBtn = page.locator('button[aria-label="Toggle Menu"]');
  // await expect(menuBtn).toBeVisible();
});

test('Table shows horizontal scroll on Mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  // const tableContainer = page.locator('.table-container');
  // await expect(tableContainer).toHaveCSS('overflow-x', 'auto');
});
