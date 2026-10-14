# ParcelPulse — Quản lý người dùng

## Thông tin trang

- **Đề tài:** ParcelPulse — hệ thống hỗ trợ vận hành giao nhận.
- **Trang thực hiện:** Quản lý người dùng (`page/admin-user-management.html`).
- **Đối tượng sử dụng:** Quản trị viên.
- **Mục đích:** Theo dõi và quản lý các tài khoản demo, vai trò và trạng thái hoạt động trong hệ thống.

## Chức năng chính

- Hiển thị tổng số tài khoản và thống kê theo trạng thái.
- Tìm kiếm theo mã, họ tên hoặc email.
- Lọc danh sách theo vai trò và trạng thái tài khoản.
- Thêm tài khoản demo và chỉnh sửa thông tin tài khoản.
- Kiểm tra email trùng trước khi lưu.
- Tạm khóa tài khoản hoặc mở khóa tài khoản đã bị khóa.
- Hiển thị thông báo sau khi lưu; thông báo tự ẩn sau 5 giây.
- Lưu dữ liệu tài khoản trên thiết bị bằng `localStorage`.

## Công nghệ sử dụng

- **HTML:** cấu trúc trang bằng `header`, `main`, `nav`, `section`, `article`, `form` và bảng dữ liệu; các trường biểu mẫu có `label` tương ứng.
- **CSS:** CSS thuần, Flexbox và Grid; giao diện hỗ trợ sáng/tối và bố cục thích ứng theo kích thước màn hình.
- **JavaScript:** thao tác DOM, sự kiện `input`/`change`/`click`/`submit`, tìm kiếm, lọc, kiểm tra dữ liệu, render bảng và lưu dữ liệu demo.

## Chạy thử

1. Mở thư mục dự án trong VS Code.
2. Chạy **Live Server**.
3. Mở `page/admin-user-management.html`.
4. Thử tìm kiếm hoặc lọc tài khoản; chọn **Sửa**, **Tạm khóa/Mở khóa** hoặc **Thêm người dùng** để kiểm tra các thao tác.

Các tệp chính của trang:

```text
page/admin-user-management.html
css/base.css
css/role-pages.css
css/admin.css
js/role-pages.js
js/admin-pages.js
```

## Thiết kế và trình bày

- **Figma:** https://www.figma.com/design/pLIUo9jzEtocX72oPxVQ3p/Untitled?node-id=5-7482&t=UCFXMcgkEBsRAGQ7-1
- **Video trình bày:** https://youtube.com/playlist?list=PLM1LbaS3zgUg&si=tz0hVTSPk16U53kZ
- **GitHub:** https://github.com/duongquynh16042007-cell/cse122-parcelpulse-team12

## Giới hạn bản demo

Đây là trang mô phỏng phía trình duyệt. Tài khoản và thao tác quản lý chỉ dùng dữ liệu mẫu được lưu trong `localStorage`; không tạo tài khoản thật, không cấp quyền truy cập, không gửi email và không kết nối backend.
