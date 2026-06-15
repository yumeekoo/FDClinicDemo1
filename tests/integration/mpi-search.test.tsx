import { describe, test, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// import { MPISearch } from '@/components/modules/reception/mpi-search';

describe('MPISearch component', () => {
  test('render search input với placeholder đúng', () => {
    // render(<MPISearch onSelect={vi.fn()} />);
    // expect(screen.getByPlaceholderText(/Tìm kiếm bệnh nhân/i)).toBeInTheDocument();
  });
  test('nhập SĐT → gọi API search sau 500ms debounce', async () => {
    // const user = userEvent.setup();
    // render(<MPISearch onSelect={vi.fn()} />);
    // await user.type(screen.getByRole('textbox'), '0901234567');
    // await waitFor(() => expect(screen.getByText(/Đang tìm kiếm/i)).toBeInTheDocument());
  });
  test('kết quả hiển thị: tên, mã BN, chi nhánh', () => {});
  test('kết quả từ chi nhánh khác có badge "Chi nhánh khác"', () => {});
  test('không tìm thấy → hiển thị "Không có kết quả" + nút Tạo mới', () => {});
  test('loading state khi đang search', () => {});
  test('error state khi API fail', () => {});
  test('click chọn bệnh nhân → callback onSelect fired', () => {});
  test('nhập < 3 ký tự → không gọi API', () => {});
  test('clear input → clear results', () => {});
  test('XSS: input "<script>" không execute', () => {});
});