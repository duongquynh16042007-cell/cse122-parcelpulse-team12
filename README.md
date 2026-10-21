# ParcelPulse — Phần sinh viên 2

ParcelPulse là giao diện mô phỏng theo dõi giao hàng và xử lý ngoại lệ.

**Sinh viên 2** phụ trách luồng **Nhân viên giao hàng** gồm 3 màn hình.

Toàn bộ trang chạy phía trình duyệt bằng HTML/CSS/JavaScript, không có backend.

## Phạm vi màn hình

| STT | Màn hình               | Tệp                                  | Đối tượng sử dụng   |
| --- | ---------------------- | ------------------------------------ | ------------------- |
| 1   | Tuyến giao hôm nay     | `pages/driver-route-stops.html`      | Nhân viên giao hàng |
| 2   | Chi tiết điểm giao     | `pages/driver-stop-detail.html`      | Nhân viên giao hàng |
| 3   | Tạo ngoại lệ giao hàng | `pages/driver-exception-create.html` | Nhân viên giao hàng |

## Màn hình 1 — Tuyến giao hôm nay (`driver-route-stops.html`)

**Mục đích:** Xem danh sách điểm giao được phân công trong ngày, tìm kiếm, lọc và cập nhật trạng thái giao.

### Chức năng chính

- Thống kê tuyến: tổng điểm trên tuyến, đã hoàn tất, còn lại, quãng đường ước tính.
- Tìm kiếm điểm giao theo mã đơn hoặc địa chỉ.
- Lọc điểm giao theo trạng thái: Tất cả, Còn lại, Đã giao, Ngoại lệ.
- Đánh dấu **Đã giao** hoặc **Hoàn tác** cho từng điểm dừng; số liệu thống kê cập nhật lại.
- Điều hướng sang màn hình chi tiết điểm giao.

## Màn hình 2 — Chi tiết điểm giao (`driver-stop-detail.html`)

**Mục đích:** Xem thông tin điểm giao, hướng dẫn bàn giao và xác nhận giao hàng thành công.

### Chức năng chính

- Hiển thị điểm dừng đang chọn, ETA, mã vận đơn, địa chỉ, người nhận và chỉ dẫn giao.
- Hiển thị quy trình bàn giao dạng timeline 3 bước.
- Form **Xác nhận giao thành công**: nhập tên người nhận, mã xác nhận 6 chữ số (mã demo `482910`) và ảnh bằng chứng (không bắt buộc).
- Kiểm tra dữ liệu nhập trước khi lưu; ảnh chỉ được chọn trên thiết bị, không tải lên máy chủ.

## Màn hình 3 — Tạo ngoại lệ giao hàng (`driver-exception-create.html`)

**Mục đích:** Ghi nhận một ngoại lệ (trường hợp giao không thành công) cho điểm dừng đang giao.

### Chức năng chính

- Chọn điểm dừng và chọn loại ngoại lệ.
- Nhập mô tả ngoại lệ (tối thiểu 8, tối đa 400 ký tự).
- Đính kèm ảnh bằng chứng (tùy chọn, chỉ nhận tệp ảnh).
- Gợi ý phân loại ngoại lệ bằng AI dựa trên nội dung mô tả, có nút **Gợi ý phân loại** và **Dùng gợi ý**.
- Lưu ngoại lệ vào `localStorage` và hiển thị mã ngoại lệ sau khi lưu.

## Các tệp chính

Ba trang cùng dùng chung hai file CSS và một file JavaScript:

- `pages/driver-route-stops.html` — danh sách điểm giao của tuyến.
- `pages/driver-stop-detail.html` — chi tiết điểm giao và xác nhận bàn giao.
- `pages/driver-exception-create.html` — tạo ngoại lệ giao hàng.
- `css/dispatcher.css` — biến thiết kế, khung ứng dụng hai cột (sidebar + nội dung), chip, nút, thông báo nổi (toast) và responsive.
- `css/role-pages.css` — bố cục dạng portal (lưới thẻ, dải thẻ số liệu, danh sách điểm dừng, biểu mẫu, timeline).
- `js/dispatcher.js` — xử lý chung cho tài xế: bảng hồ sơ/cài đặt, tìm kiếm – lọc – đánh dấu đã giao, xác nhận bàn giao và phân loại ngoại lệ.

## Chạy thử

1. Mở thư mục `CODE` trong VS Code.
2. Chạy **Live Server**.
3. Mở `pages/driver-route-stops.html`.
4. Thử các thao tác:

- **Tuyến giao:** tìm kiếm/lọc điểm giao; bấm **Đã giao** rồi **Hoàn tác**.
- **Chi tiết điểm giao:** nhập mã demo `482910` để xác nhận giao thành công.
- **Tạo ngoại lệ:** chọn loại ngoại lệ, nhập mô tả và xem gợi ý phân loại AI.

## Thiết kế và trình bày

- Figma: https://www.figma.com/design/pLIUo9jzEtocX72oPxVQ3p/Untitled?node-id=0-1&t=EPEoUSwKIyWGywfV-0
- Video trình bày: https://www.youtube.com/playlist?list=PLFuFhj5IUmMU
- GitHub: https://github.com/duongquynh16042007-cell/cse122-parcelpulse-team12

## Giới hạn bản demo

Đây là các trang mô phỏng phía trình duyệt. Ngoại lệ và trạng thái giao chỉ dùng dữ liệu mẫu lưu trong `localStorage` của thiết bị hiện tại; dữ liệu đó **không** đồng bộ với backend.
