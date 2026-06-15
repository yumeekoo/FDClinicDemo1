import { describe, test, expect } from 'vitest';

describe('generatePatientCode', () => {
  test('format đúng BN-YYYYMMDD-XXXX', () => {});
  test('unique mỗi lần call trong cùng millisecond', () => {});
  test('không chứa ký tự đặc biệt', () => {});
});

describe('deduplicatePatients', () => {
  test('tìm duplicate theo SĐT chính xác', () => {});
  test('tìm duplicate theo CCCD chính xác', () => {});
  test('tìm fuzzy match theo tên + ngày sinh', () => {});
  test('không false positive khi SĐT khác nhau', () => {});
  test('handle undefined/null phone gracefully', () => {});
  test('handle CCCD format 9 số lẫn 12 số', () => {});
});

describe('crossBranchLookup', () => {
  test('trả về patient khi có ở chi nhánh khác', () => {});
  test('trả về null khi không tìm thấy ở đâu', () => {});
  test('không trả về patient đã soft-deleted', () => {});
  test('ưu tiên primary_branch_id trước', () => {});
});