# Luồng người dùng ParcelPulse

## Sơ đồ trang

```text
Điều hành
├── Tổng quan điều hành (dispatcher-overview.html)
├── Hàng đợi ngoại lệ (dispatcher-exceptions.html)
└── Phân công lại (dispatcher-reassign.html)

Quản trị viên
├── Quản lý trạng thái (admin-status-management.html)
├── Quản lý người dùng (admin-user-management.html)
└── Báo cáo logistics (admin-logistics-report.html)
```

## Luồng Điều hành

1. Mở tổng quan → xem KPI, biểu đồ, cảnh báo → chọn khoảng thời gian để đổi biểu đồ.
2. Mở hàng đợi → tìm kiếm/lọc ngoại lệ → chọn hàng để xem chi tiết → xác nhận, bỏ qua hoặc sửa loại → xem kết quả lưu cục bộ.
3. Mở phân công lại → chọn điểm dừng và tài xế → xem tải, km, ETA → lưu nháp hoặc xác nhận chuyển điểm.

## Luồng Quản trị viên

1. Quản lý trạng thái → tìm kiếm → thêm/sửa/lưu trữ trạng thái tùy chỉnh; trạng thái hệ thống mặc định được khóa.
2. Quản lý người dùng → tìm kiếm/lọc → thêm/sửa/khóa/mở khóa/xóa tài khoản demo; biểu mẫu kiểm tra trường bắt buộc và email trùng.
3. Báo cáo → chọn khoảng ngày → xem biểu đồ/bảng → tải CSV hoặc lưu lựa chọn báo cáo.

## Trạng thái giao diện cần có

- **Thông thường:** có dữ liệu và thao tác được.
- **Rỗng:** không có kết quả, có thông điệp và cách xóa bộ lọc/tạo dữ liệu.
- **Đang xử lý:** thao tác gợi ý quy tắc hiển thị tiến trình trước khi ra kết quả.
- **Lỗi/không đủ dữ liệu:** nêu lý do, giữ nguyên dữ liệu hiện tại, cho thử lại hoặc chỉnh đầu vào.
- **Thành công:** thông báo sau khi lưu/cập nhật.

Hiện ứng dụng là demo không gọi API, vì vậy chưa có lỗi mạng thật. Các lỗi cần kiểm chứng bằng mô phỏng trình duyệt và được ghi nhận trong bảng kiểm kê khi đã triển khai.
