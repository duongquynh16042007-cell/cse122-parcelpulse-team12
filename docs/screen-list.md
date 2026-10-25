# Danh sách màn hình

Danh sách các trang HTML hiện có trên nhánh `mergebranch`, được nhóm theo vai trò và khu vực sử dụng.

| Vai trò/khu vực | Màn hình | Tệp | Nội dung chính |
| --- | --- | --- | --- |
| Công khai | Trang chủ | `page/index.html` | Giới thiệu hệ thống và mở các luồng chức năng. |
| Xác thực | Đăng nhập/đăng ký/quên mật khẩu | `page/login.html`, `page/register.html`, `page/forgot-password.html` | Biểu mẫu xác thực mô phỏng. |
| Người nhận | Theo dõi kiện hàng | `page/track-parcel.html` | Tra cứu dữ liệu mẫu và xem trạng thái. |
| Người nhận | Tùy chọn giao nhận | `page/delivery-preferences.html` | Chỉnh lựa chọn nhận hàng demo. |
| Người nhận | Phản hồi giao hàng | `page/delivery-feedback.html` | Gửi đánh giá/phản hồi mẫu. |
| Nhân viên giao hàng | Tuyến giao | `page/driver-route-stops.html` | Xem, tìm kiếm, lọc và cập nhật điểm giao mẫu. |
| Nhân viên giao hàng | Chi tiết điểm giao | `page/driver-stop-detail.html` | Xem thông tin và mô phỏng xác nhận bàn giao. |
| Nhân viên giao hàng | Tạo ngoại lệ | `page/driver-exception-create.html` | Nhập thông tin và lưu ngoại lệ demo. |
| Dùng chung | Cài đặt | `page/settings.html` | Hồ sơ và tùy chọn mô phỏng theo vai trò. |
| Điều phối viên | Tổng quan, ngoại lệ, phân công lại | `page/dispatcher-overview.html`, `page/dispatcher-exceptions.html`, `page/dispatcher-reassign.html` | KPI, xử lý ngoại lệ và điều phối tuyến demo. |
| Quản trị viên | Trạng thái, người dùng, báo cáo | `page/admin-status-management.html`, `page/admin-user-management.html`, `page/admin-logistics-report.html` | Quản lý dữ liệu demo và tạo CSV trên trình duyệt. |

## Cách chạy

Mở dự án trong VS Code, chạy Live Server và truy cập `page/index.html`. Có thể mở trực tiếp các đường dẫn ở cột Tệp.

## Giới hạn

Danh sách mô tả các trang hiện có trong repository. Dữ liệu hiển thị là dữ liệu demo; chưa có backend hoặc API logistics thật.
