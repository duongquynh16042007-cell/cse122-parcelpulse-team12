# ParcelPulse — Hệ thống vận hành giao nhận

Bản demo giao diện quản lý vận hành giao nhận với hai vai trò: **Điều hành (Điều phối viên)** và **Quản trị viên**. Trang chủ `page/index.html` mở không gian điều hành. Các trang dùng dữ liệu mẫu và lưu thay đổi cục bộ trên trình duyệt.

## Vai trò và chức năng

### Điều hành (Điều phối viên)

- **Tổng quan điều hành** (`page/dispatcher-overview.html`): xem chỉ số vận hành, sản lượng theo giờ, hiệu suất trung tâm và cảnh báo ưu tiên.
- **Hàng đợi ngoại lệ** (`page/dispatcher-exceptions.html`): tìm kiếm, lọc, xem chi tiết và cập nhật quyết định xử lý ngoại lệ.
- **Phân công lại** (`page/dispatcher-reassign.html`): chọn điểm cần chuyển và tài xế, xem tóm tắt thay đổi, lưu nháp hoặc xác nhận phân công.

### Quản trị viên

- **Quản lý trạng thái** (`page/admin-status-management.html`): tìm kiếm, thêm và sửa trạng thái; lưu trữ trạng thái tùy chỉnh. Các trạng thái hệ thống mặc định được bảo vệ.
- **Quản lý người dùng** (`page/admin-user-management.html`): tìm kiếm, lọc, thêm, sửa, khóa/mở khóa và xóa tài khoản demo.
- **Báo cáo logistics** (`page/admin-logistics-report.html`): xem số liệu theo khoảng 7, 30 hoặc 90 ngày, lưu lựa chọn báo cáo và tải CSV mẫu.

### Hồ sơ và cài đặt

Các vai trò dùng chung trang `page/settings.html` để chỉnh sửa thông tin hồ sơ, tùy chọn thông báo, giao diện, ngôn ngữ và cài đặt bảo mật mô phỏng.

## Chạy thử

1. Mở thư mục dự án trong VS Code.
2. Chạy bằng Live Server.
3. Mở `page/index.html` để vào trang tổng quan điều hành. Có thể mở trực tiếp các trang quản trị trong thư mục `page`.

## Công nghệ

- HTML, CSS và JavaScript thuần.
- Dữ liệu demo được lưu bằng `localStorage`; báo cáo CSV được tạo ngay trên trình duyệt.

## Giới hạn

Đây là bản demo phía trình duyệt, không kết nối backend hoặc dữ liệu giao nhận trực tiếp. Các thay đổi chỉ lưu trên thiết bị hiện tại; chức năng xác thực tài khoản và phân quyền máy chủ không có trong bản demo.

## Tệp giao diện chính

- `css/base.css` và `css/profile.css`: kiểu dùng chung.
- `css/dispatcher.css`: giao diện điều hành.
- `css/admin.css`: giao diện quản trị.
- `css/settings.css`: giao diện cài đặt.

