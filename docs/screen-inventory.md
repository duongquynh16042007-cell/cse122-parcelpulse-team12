# Bảng kiểm kê màn hình

Các ô được ghi “Nhóm bổ sung” cần dữ liệu thật từ nhóm. Branch hiện tại được xác nhận là `feat/Hung`; không suy đoán người phụ trách, mã task, PR, OBS hay deploy.

| Role | Goal | Task | Screen | File | CRUD | States | AI/gợi ý | Assignee | Task ID | Branch | OBS |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Điều hành | Nắm tình hình hôm nay | Xem KPI, biểu đồ, cảnh báo | Tổng quan điều hành | `page/dispatcher-overview.html` | Read | Normal, empty/error cần QA | Tóm tắt cảnh báo theo quy tắc | Nhóm bổ sung | Nhóm bổ sung | `feat/Hung` | Nhóm bổ sung |
| Điều hành | Đóng ngoại lệ đúng hạn | Tìm/lọc, xem chi tiết, cập nhật quyết định | Hàng đợi ngoại lệ | `page/dispatcher-exceptions.html` | Read/Update | Normal, empty; loading/error cần QA | Phân loại rủi ro ngoại lệ | Nhóm bổ sung | Nhóm bổ sung | `feat/Hung` | Nhóm bổ sung |
| Điều hành | Điều chuyển điểm giao có cân nhắc | Chọn điểm/tài xế, xem tác động, xác nhận | Phân công lại | `page/dispatcher-reassign.html` | Read/Update | Normal, empty, thiếu lựa chọn | Gợi ý tài xế theo tải/ETA | Nhóm bổ sung | Nhóm bổ sung | `feat/Hung` | Nhóm bổ sung |
| Quản trị viên | Quản lý luồng trạng thái | Tìm, tạo, sửa, lưu trữ | Quản lý trạng thái | `page/admin-status-management.html` | CRUD | Normal, empty, validation, success/error lưu cần QA | — | Nhóm bổ sung | Nhóm bổ sung | `feat/Hung` | Nhóm bổ sung |
| Quản trị viên | Quản lý tài khoản demo | Tìm/lọc, tạo, sửa, khóa, xóa | Quản lý người dùng | `page/admin-user-management.html` | CRUD | Normal, empty, validation, success/error lưu cần QA | — | Nhóm bổ sung | Nhóm bổ sung | `feat/Hung` | Nhóm bổ sung |
| Quản trị viên | Theo dõi kết quả giao nhận | Chọn kỳ, xem báo cáo, lưu, tải CSV | Báo cáo logistics | `page/admin-logistics-report.html` | Read/Create export | Normal, empty/error cần QA | — | Nhóm bổ sung | Nhóm bổ sung | `feat/Hung` | Nhóm bổ sung |

## Thiết kế và bằng chứng

README hiện liên kết Figma và GitHub. Nhóm cần xác nhận Figma có sitemap, desktop/mobile mockup, component guide và quyền xem. Cần thêm Task ID/assignee/PR review, link deploy, và video OBS có mặt/giọng giải thích cho từng màn hình trước khi đánh dấu các mục này hoàn tất.
