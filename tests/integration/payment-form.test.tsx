import { describe, test, expect } from 'vitest';

describe('PaymentForm', () => {
  test('hiển thị line items đầy đủ', () => {});
  test('subtotal + discount → total tính đúng', () => {});
  test('discount > subtotal → không cho submit', () => {});
  test('chọn CASH → không cần transaction_id', () => {});
  test('chọn MOMO/VNPAY → cần transaction_id', () => {});
  test('submit → payment record + invoice tạo', () => {});
  test('payment fail → inventory KHÔNG bị trừ', () => {});
  test('payment success → trigger inventory deduction', () => {});
});