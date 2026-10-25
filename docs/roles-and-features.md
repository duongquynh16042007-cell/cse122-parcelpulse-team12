# Vai trò và chức năng

ParcelPulse có bốn vai trò nghiệp vụ. Trang chủ và xác thực là khu vực dùng chung, không phải vai trò nghiệp vụ. Các trang cho cả bốn vai trò đều có trong snapshot hiện tại của `mergebranch`. Trợ lý AI nếu xuất hiện chỉ là tiện ích mô phỏng, không phải vai trò.

## Người nhận

- Theo dõi mã kiện hàng và lịch sử trạng thái mẫu.
- Chọn tùy chọn giao nhận.
- Gửi phản hồi giao hàng demo.
- Chỉnh một số tùy chọn tài khoản trên trang Cài đặt dùng chung.

**Màn hình:** `page/track-parcel.html`, `page/delivery-preferences.html`, `page/delivery-feedback.html`. Trang Cài đặt dùng chung: `page/settings.html`.

## Nhân viên giao hàng

- Xem, tìm kiếm và lọc danh sách điểm giao mẫu.
- Mở chi tiết điểm giao và mô phỏng xác nhận bàn giao.
- Tạo báo cáo ngoại lệ giao nhận demo.
- Truy cập trang Cài đặt dùng chung.

**Màn hình hiện có:** `page/driver-route-stops.html`, `page/driver-stop-detail.html`, `page/driver-exception-create.html`, `page/settings.html`.

## Điều phối viên

- Theo dõi KPI, biểu đồ và cảnh báo mẫu.
- Tìm kiếm/lọc ngoại lệ và mô phỏng cập nhật hướng xử lý.
- Mô phỏng phân công lại điểm giao cho tài xế.
- Truy cập trang Cài đặt dùng chung.

**Màn hình:** `page/dispatcher-overview.html`, `page/dispatcher-exceptions.html`, `page/dispatcher-reassign.html`. Trang Cài đặt dùng chung: `page/settings.html`.

## Quản trị viên

- Tìm, thêm, sửa hoặc lưu trữ trạng thái giao nhận demo.
- Tìm/lọc và mô phỏng quản lý tài khoản người dùng.
- Xem số liệu báo cáo mẫu và tải CSV được tạo trong trình duyệt.
- Truy cập trang Cài đặt dùng chung.

**Màn hình:** `page/admin-status-management.html`, `page/admin-user-management.html`, `page/admin-logistics-report.html`. Trang Cài đặt dùng chung: `page/settings.html`.

## Khu vực dùng chung

- `page/index.html`: trang chủ và điểm vào chung.
- `page/login.html`, `page/register.html`, `page/forgot-password.html`: biểu mẫu xác thực mô phỏng.
- `page/settings.html`: hồ sơ và tùy chọn demo dùng chung theo vai trò.

## Lưu ý về dữ liệu

Toàn bộ chức năng nghiệp vụ hiện là mock phía trình duyệt. Dữ liệu không được gửi đến backend hoặc API logistics; dữ liệu lưu bằng Web Storage chỉ có trên trình duyệt/thiết bị hiện tại.
