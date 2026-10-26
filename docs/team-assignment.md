# Phân công thành viên

Phân công các màn hình nghiệp vụ của ParcelPulse theo vai trò:

## Quân — Người nhận (3 màn hình)

| Màn hình | Tệp | Công việc chính |
| --- | --- | --- |
| Trang chủ | `page/index.html` | Điểm vào và điều hướng các chức năng demo. |
| Theo dõi kiện hàng | `page/track-parcel.html` | Tra cứu trạng thái kiện hàng. |
| Tùy chọn giao nhận | `page/delivery-preferences.html` | Cập nhật lựa chọn giao nhận demo. |

## Quỳnh — Nhân viên giao hàng (3 màn hình)

| Màn hình | Tệp | Công việc chính |
| --- | --- | --- |
| Tuyến giao hôm nay | `page/driver-route-stops.html` | Xem và cập nhật các điểm giao trên tuyến. |
| Chi tiết điểm giao | `page/driver-stop-detail.html` | Xem thông tin điểm giao và xác nhận bàn giao demo. |
| Tạo ngoại lệ | `page/driver-exception-create.html` | Gửi ngoại lệ giao hàng cho điều phối viên xử lý. |

## Hưng — Điều phối viên và Quản trị viên (6 màn hình)

### Điều phối viên (3 màn hình)

| Màn hình | Tệp | Công việc chính |
| --- | --- | --- |
| Tổng quan điều hành | `page/dispatcher-overview.html` | Theo dõi KPI và tình hình vận hành demo. |
| Hàng đợi ngoại lệ | `page/dispatcher-exceptions.html` | Xem, xác nhận hoặc bỏ qua ngoại lệ tài xế gửi. |
| Phân công lại | `page/dispatcher-reassign.html` | Chọn điểm giao và tài xế để phân công lại. |

### Quản trị viên (3 màn hình)

| Màn hình | Tệp | Công việc chính |
| --- | --- | --- |
| Quản lý trạng thái | `page/admin-status-management.html` | Quản lý trạng thái và xem dữ liệu nghiệp vụ được chia sẻ. |
| Quản lý người dùng | `page/admin-user-management.html` | Quản lý tài khoản demo. |
| Báo cáo logistics | `page/admin-logistics-report.html` | Xem báo cáo demo và xuất CSV. |

## Ghi chú

Các trang đăng nhập, đăng ký, quên mật khẩu, cài đặt và phản hồi giao hàng là màn hình hỗ trợ/chung, không nằm trong 12 màn hình nghiệp vụ được phân công ở trên.
