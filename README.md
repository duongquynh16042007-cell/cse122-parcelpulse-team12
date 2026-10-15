# ParcelPulse

ParcelPulse là giao diện mô phỏng theo dõi giao hàng và xử lý ngoại lệ cho người nhận.

## Phạm vi sinh viên 1

- Theo dõi đơn hàng: [recipient-track-parcel.html](../pages/recipient-track-parcel.html)
- Tùy chọn đơn hàng của khách hàng: [recipient-delivery-preferences.html](../pages/recipient-delivery-preferences.html)
- Phản hồi giao hàng: [recipient-delivery-feedback.html](../pages/recipient-delivery-feedback.html)
- Danh sách màn hình và người phụ trách: [screen-list.md](../screen-list.md)
- Luồng người nhận: [user-flow.md](../docs/user-flow.md)

Mỗi trang giữ HTML, CSS và JavaScript riêng. Các màn hình người nhận dùng chung
`../css/recipient-app.css`; dữ liệu vận đơn mẫu nằm tại `../data/parcels.json`.

## Chạy thử

Mở thư mục gốc dự án bằng VS Code và chạy `index.html` bằng Live Server.
Không mở trực tiếp bằng `file://`, vì trang theo dõi tải dữ liệu từ tệp JSON qua HTTP.

Tài khoản demo: `demo@parcelpulse.vn` / `Parcel123`.

## Dữ liệu demo

- Tra cứu vận đơn: `PP1001` đến `PP1005` (đang giao, trễ thời tiết, đã giao, chờ lấy bưu cục, trễ do địa chỉ).
  Trong đó `PP1001`–`PP1004` đứng tên khách hàng demo `Minh Anh`; `PP1005` là đơn của khách khác
  nên không xuất hiện trong màn hình tùy chọn đơn hàng của Minh Anh.
- Màn hình Tùy chọn đơn hàng chỉ liệt kê đơn hàng đứng tên khách đăng nhập. Nếu tài khoản đăng nhập
  chưa có đơn hàng riêng trong dữ liệu mẫu (ví dụ tài khoản mới đăng ký), màn hình tự gắn bộ đơn hàng
  demo `PP1001`–`PP1004` đứng tên tài khoản đó và hiển thị thông báo rõ ràng, để trang không bao giờ
  rơi vào trạng thái trống.
- Tùy chọn đơn hàng lưu riêng theo từng đơn hàng và từng tài khoản (localStorage phiên bản 3, khóa theo
  email phiên đăng nhập); phản hồi và giải thích ETA cũng lưu trong `localStorage` của trình duyệt hiện tại.
- Giải thích ETA là luồng mô phỏng dựa trên dữ liệu JSON, không gọi dịch vụ AI thật.
- Đăng nhập là luồng minh họa phía trình duyệt, không dùng cho xác thực thật.
