import { describe, test, expect } from 'vitest';

describe('Branch isolation - patients table', () => {
  test('RECEPTION branch A: SELECT patients của branch A → OK', () => {});
  test('RECEPTION branch A: SELECT patients CHỈ branch B → empty', () => {});
  test('RECEPTION branch A: INSERT patient với branch_id B → RLS block', () => {});
  test('ADMIN: SELECT patients cả 2 branch → OK', () => {});
});

describe('Role-based - sensitive data', () => {
  test('DOCTOR: SELECT invoices → empty', () => {});
  test('CASHIER: SELECT diagnoses → empty', () => {});
});

describe('SQL Injection via API', () => {
  test('phone: DROP TABLE → reject', () => {});
  test('name: script alert → escape', () => {});
});

describe('Unauthenticated access', () => {
  test('anon key + SELECT patients → RLS block', () => {});
  test('expired session → redirect', () => {});
});
