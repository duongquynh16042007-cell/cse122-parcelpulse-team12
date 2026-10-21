# ParcelPulse

ParcelPulse là giao diện demo cho quy trình giao nhận bưu kiện. Thư mục này gồm trang chủ và luồng xác thực dùng chung cho nhóm, cùng các chức năng dành cho người nhận.

## Chạy dự án

Mở thư mục dự án bằng VS Code, bật Live Server và truy cập `page/index.html`. Các trang HTML khác có thể mở từ liên kết trên giao diện hoặc bằng đường dẫn tương ứng trong thư mục `page/`.

## Trang dùng chung

- `page/index.html`: giới thiệu ParcelPulse, tra cứu/nhận hàng dành cho khách và điều hướng đến đăng nhập, đăng ký.
- `page/login.html`: đăng nhập demo, cho phép chọn người nhận, nhân viên giao hàng, điều phối viên hoặc quản trị viên.
- `page/register.html`: biểu mẫu đăng ký tài khoản demo.
- `page/forgot-password.html`: biểu mẫu khôi phục quyền truy cập demo.

## Chức năng người nhận

- `page/track-parcel.html`: nhập mã để xem trạng thái và hành trình minh họa.
- `page/delivery-preferences.html`: chọn hình thức, thời gian và địa điểm nhận hàng.
- `page/delivery-feedback.html`: gửi đánh giá và góp ý về giao hàng.

## Cấu trúc mã nguồn

- `page/`: các trang HTML.
- `css/`: kiểu dáng dùng chung và theo từng trang.
- `js/`: tương tác dùng chung, xác thực demo và chức năng theo vai trò.

Các trang đăng nhập, đăng ký và khôi phục mật khẩu dùng `css/auth.css` và `js/auth.js`. Mỗi file HTML, CSS và JavaScript có ghi chú ngắn về chức năng.

## Ghép phần của nhóm

- Trang người nhận liên kết đến `page/settings.html?role=recipient`; ghép trang cài đặt và tài nguyên từ thành viên phụ trách.
- Ghép các màn hình của nhân viên giao hàng, điều phối viên, quản trị viên và trợ lý AI từ các thành viên tương ứng. Cập nhật các liên kết khi thống nhất tên tệp.
- Sau khi ghép, kiểm tra các đường dẫn tương đối đến trang HTML, CSS và JavaScript.

Đăng nhập, đăng ký, khôi phục mật khẩu và dữ liệu hiện tại chỉ là demo phía trình duyệt; dự án chưa kết nối máy chủ hoặc cơ sở dữ liệu.