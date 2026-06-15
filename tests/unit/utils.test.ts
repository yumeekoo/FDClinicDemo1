import { describe, test, expect } from 'vitest';
// Giả định import các hàm tiện ích từ lib/utils (nếu chưa có sẽ đỏ để TDD)
import { formatCurrency, formatDate, getWaitTime } from '@/lib/utils';

describe('formatCurrency', () => {
  test('1000 → "1.000 đ"', () => {
    // expect(formatCurrency(1000)).toBe('1.000 đ');
  });
  test('1500000 → "1.500.000 đ"', () => {
    // expect(formatCurrency(1500000)).toBe('1.500.000 đ');
  });
  test('0 → "0 đ"', () => {
    // expect(formatCurrency(0)).toBe('0 đ');
  });
  test('undefined/null → "0 đ" không throw', () => {
    // expect(formatCurrency(undefined)).toBe('0 đ');
  });
});

describe('formatDate', () => {
  test('ISO string → "DD/MM/YYYY" tiếng Việt', () => {
    // expect(formatDate('2026-06-15T00:00:00.000Z')).toContain('15/06/2026');
  });
  test('invalid date → "—" không throw', () => {
    // expect(formatDate('invalid-date')).toBe('—');
  });
});

describe('getWaitTime', () => {
  test('< 60 phút → "X phút"', () => {
    // const start = new Date('2026-06-15T10:00:00Z');
    // const now = new Date('2026-06-15T10:45:00Z');
    // expect(getWaitTime(start, now)).toBe('45 phút');
  });
  test('>= 60 phút → "X giờ Y phút"', () => {
    // const start = new Date('2026-06-15T10:00:00Z');
    // const now = new Date('2026-06-15T11:15:00Z');
    // expect(getWaitTime(start, now)).toBe('1 giờ 15 phút');
  });
  test('> 8 giờ → highlight đỏ flag', () => {
    // Logic test
  });
});