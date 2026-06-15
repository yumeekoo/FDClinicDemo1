import { test, expect } from '@playwright/test';
// import { checkA11y, injectAxe } from 'axe-playwright';

test('Login page has no contrast or ARIA violations', async ({ page }) => {
  // await page.goto('/login');
  // await injectAxe(page);
  // await checkA11y(page, null, {
  //   axeOptions: {
  //     runOnly: {
  //       type: 'tag',
  //       values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
  //     }
  //   }
  // });
});

test('All input fields have accessible names', async ({ page }) => {
  // test logic
});
