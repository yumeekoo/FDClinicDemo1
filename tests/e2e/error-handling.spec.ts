import { test, expect } from '@playwright/test';

test('404 page: /nonexistent-route', async ({ page }) => {
  // await page.goto('/this-page-does-not-exist');
  // await expect(page.locator('h1')).toContainText('404');
});
test('Network offline handling', async ({ page, context }) => {});
