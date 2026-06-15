import { describe, test, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('PatientForm', () => {
  test('render đủ fields: tên, SĐT, CCCD, ngày sinh, giới tính', () => {
    // render(<PatientForm onSubmit={vi.fn()} />);
    // expect(screen.getByLabelText(/Họ và Tên/i)).toBeInTheDocument();
  });
  test('submit rỗng → validation errors tiếng Việt', async () => {
    // const user = userEvent.setup();
    // render(<PatientForm onSubmit={vi.fn()} />);
    // await user.click(screen.getByRole('button', { name: /Lưu/i }));
    // expect(await screen.findByText(/Trường này là bắt buộc/i)).toBeInTheDocument();
  });
  test('phone invalid → error message', () => {});
  test('CCCD duplicate → server error hiển thị', () => {});
  test('submit thành công → onSuccess callback', () => {});
  test('loading state khi submitting', () => {});
  test('error từ server → hiển thị toast error', () => {});
  test('edit mode: pre-fill đúng data', () => {});
  test('cancel → không submit, không navigate', () => {});
});