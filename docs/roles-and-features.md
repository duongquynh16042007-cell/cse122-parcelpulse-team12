# Vai trò và chức năng

ParcelPulse có bốn vai trò nghiệp vụ. Trang chủ và xác thực là khu vực dùng chung, không phải vai trò nghiệp vụ. Các trang cho cả bốn vai trò đều có trong snapshot hiện tại của `mergebranch`. Pulse AI là tiện ích mô phỏng, không phải vai trò.

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
- Xem bản ghi chờ xử lý do Người nhận, Nhân viên giao hàng hoặc Điều phối viên tạo; tìm kiếm/lọc, duyệt, hủy hoặc lưu trữ ngay trong trang quản lý trạng thái.
- Truy cập trang Cài đặt dùng chung.

**Màn hình:** `page/admin-status-management.html` (có hàng đợi bản ghi liên vai trò), `page/admin-user-management.html`, `page/admin-logistics-report.html`. Trang Cài đặt dùng chung: `page/settings.html`.

## Khu vực dùng chung

- `page/index.html`: trang chủ và điểm vào chung.
- `page/login.html`, `page/register.html`, `page/forgot-password.html`: biểu mẫu xác thực mô phỏng.
- `page/settings.html`: hồ sơ và tùy chọn demo dùng chung theo vai trò.

## Lưu ý về dữ liệu

Toàn bộ chức năng nghiệp vụ hiện là mock phía trình duyệt. Các bản ghi liên vai trò được ghi vào `parcelpulse.sharedRecords` trong `localStorage`, nên các trang cùng origin trên cùng trình duyệt có thể đọc chung và trang quản trị phản ánh thay đổi. Dữ liệu không được gửi đến backend hoặc API logistics, cũng không đồng bộ sang thiết bị/trình duyệt khác.
