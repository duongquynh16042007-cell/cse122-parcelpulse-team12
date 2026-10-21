# ParcelPulse

Giao diện demo cho quy trình giao nhận bưu kiện. Thư mục này hợp nhất trang chủ và xác thực dùng chung, các màn hình người nhận, cùng những màn hình nhóm đang phát triển.

## Chạy dự án

Mở thư mục gốc bằng VS Code và chạy bằng Live Server. Điểm vào tiếng Việt là `page/trang-chu.html`; trang chủ demo bổ sung là `page/index.html`. Dùng Live Server để các đường dẫn nội bộ hoạt động đầy đủ.

## Trang chính bằng tiếng Việt

- `page/trang-chu.html`: trang chủ chung, dẫn đến đăng nhập và đăng ký.
- `page/dang-nhap.html`: đăng nhập demo, chọn người nhận, nhân viên giao hàng, điều phối viên hoặc quản trị viên.
- `page/dang-ky.html` và `page/quen-mat-khau.html`: biểu mẫu xác thực demo.
- `page/theo-doi-kien-hang.html`, `page/tuy-chon-giao-nhan.html` và `page/phan-hoi-giao-hang.html`: chức năng dành cho người nhận.

## Các màn hình nhóm bổ sung

- `page/index.html`, `page/login.html`, `page/register.html` và `page/forgot-password.html`: bộ trang demo bổ sung.
- `page/recipient-track-parcel.html`, `page/recipient-delivery-preferences.html` và `page/recipient-delivery-feedback.html`: các màn hình người nhận.
- `page/admin-user-management.html`: màn hình quản lý người dùng; các màn hình quản trị khác có thể được ghép từ nhánh thành viên phụ trách.

Mỗi file HTML, CSS và JavaScript có ghi chú ngắn mô tả chức năng. CSS và JavaScript được chia theo trang hoặc nhóm chức năng để thuận tiện ghép phần.

## Ghép phần của nhóm

- Trang người nhận liên kết tới `page/settings.html?role=recipient`; ghép trang cài đặt và tài nguyên từ thành viên phụ trách.
- Ghép các màn hình nhân viên giao hàng, điều phối viên, quản trị viên và trợ lý AI từ các thành viên tương ứng; cập nhật liên kết sau khi thống nhất tên tệp.
- Kiểm tra đường dẫn tương đối đến CSS, JavaScript và các trang HTML sau khi ghép.

Đăng nhập, đăng ký, khôi phục mật khẩu và dữ liệu hiện tại chỉ là demo phía trình duyệt, chưa kết nối máy chủ hoặc cơ sở dữ liệu.