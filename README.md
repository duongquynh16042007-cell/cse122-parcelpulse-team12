# ParcelPulse — Hệ thống vận hành giao nhận

ParcelPulse là bản demo giao diện cho quy trình giao nhận, tập trung vào hai vai trò theo phạm vi hiện tại của dự án: **Điều hành** và **Quản trị viên**. Giao diện dùng dữ liệu mẫu; thay đổi lưu cục bộ trên trình duyệt.

## Vai trò và màn hình

### Điều hành

- [Tổng quan điều hành](page/dispatcher-overview.html): KPI, biểu đồ sản lượng và cảnh báo.
- [Hàng đợi ngoại lệ](page/dispatcher-exceptions.html): tìm kiếm, lọc, xem chi tiết và cập nhật quyết định xử lý.
- [Phân công lại](page/dispatcher-reassign.html): chọn điểm dừng/tài xế, so sánh tải và ETA, lưu nháp hoặc xác nhận điều chuyển.

### Quản trị viên

- [Quản lý trạng thái](page/admin-status-management.html): tìm, tạo, sửa, lưu trữ trạng thái; trạng thái mặc định được khóa.
- [Quản lý người dùng](page/admin-user-management.html): tìm/lọc, tạo, sửa, khóa/mở khóa và xóa tài khoản demo.
- [Báo cáo logistics](page/admin-logistics-report.html): chọn kỳ báo cáo, xem số liệu, lưu lựa chọn và tải CSV.

## Chạy dự án

Mở thư mục bằng VS Code, chạy Live Server rồi vào `page/dispatcher-overview.html`. Các trang quản trị có thể mở từ `page/admin-status-management.html`. Không cần cài thư viện ngoài.

## Cấu trúc

```text
page/   Sáu trang HTML theo hai vai trò
css/    Token và kiểu dùng chung, điều hành, quản trị, hồ sơ
js/     Tương tác điều hành, quản trị và hồ sơ
```

## Công nghệ và dữ liệu

- HTML5 ngữ nghĩa, CSS thuần với design tokens, JavaScript thuần thao tác DOM.
- `localStorage` lưu cài đặt, người dùng/trạng thái demo, quyết định ngoại lệ và nháp/phân công trên trình duyệt hiện tại.
- Trang quản lý người dùng có 15 hồ sơ demo; hàng đợi ngoại lệ hiện gồm 5 hồ sơ mẫu.
- CSV được tạo ở phía trình duyệt.

Barem đính kèm khuyến nghị nhiều vai trò hơn; phạm vi hiện tại giữ hai vai trò theo yêu cầu trước đó. Nhóm cần xác nhận phạm vi này với giảng viên và tự bổ sung minh chứng Task, PR/reviewer, deploy và OBS thực tế nếu được yêu cầu. Playlist YouTube bên dưới là tài liệu tham khảo.

## Giới hạn

Đây là bản demo phía trình duyệt: không có backend, API, đăng nhập thật, phân quyền máy chủ hay đồng bộ giữa thiết bị. Dữ liệu có thể bị xóa khi xóa dữ liệu trình duyệt. Các số liệu hiển thị là minh họa, không dùng cho quyết định vận hành thật.

## Liên kết

- [Figma](https://www.figma.com/design/pLIUo9jzEtocX72oPxVQ3p/Untitled?node-id=0-1&t=zDJNyxMIUbNaoNGI-1)
- [YouTube — Playlist 1](https://www.youtube.com/playlist?list=PLdwaB8kTRTB0)
- [YouTube — Playlist 2](https://www.youtube.com/playlist?list=PLM1LbaS3zgUg)
- [GitHub](https://github.com/duongquynh16042007-cell/cse122-parcelpulse-team12.git)
