import { test, expect } from '@playwright/test';

const ALL_ROLES = ['ADMIN', 'RECEPTION', 'DOCTOR'];
const protectedRoutes = [
  { path: '/admin', allowedRoles: ['ADMIN'] },
];

for (const route of protectedRoutes) {
  for (const role of ALL_ROLES) {
    test(`${role} truy cập ${route.path}`, async ({ page }) => {});
  }
}
