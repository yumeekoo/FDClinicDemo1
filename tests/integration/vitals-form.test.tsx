import { describe, test, expect } from 'vitest';

describe('VitalsForm', () => {
  test('blood pressure: systolic > diastolic luôn', () => {});
  test('nhiệt độ < 35 hoặc > 42 → warning highlight', () => {});
  test('SpO2 < 95 → warning highlight', () => {});
  test('BMI tự tính khi nhập cân nặng + chiều cao', () => {});
  test('submit thiếu field bắt buộc → error', () => {});
  test('submit thành công → visit status update', () => {});
});