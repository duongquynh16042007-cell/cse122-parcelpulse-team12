# ParcelPulse — Hệ thống vận hành giao nhận

ParcelPulse là bản demo giao diện HTML, CSS và JavaScript cho quy trình giao nhận. Nhánh `mergebranch` hiện có khu vực công khai/xác thực, Người nhận, Điều hành và Quản trị viên. Một số vai trò khác được hiển thị trong luồng đăng nhập; trạng thái trang tương ứng được ghi rõ bên dưới.

## Cấu trúc thư mục

```text
git/
├── README.md
├── css/
│   ├── base.css                    # Kiểu và biến dùng chung
│   ├── profile.css                 # Hồ sơ và cài đặt dùng chung
│   ├── home.css                    # Trang chủ
│   ├── auth.css                    # Giao diện xác thực
│   ├── login.css                   # Đăng nhập
│   ├── register.css                # Đăng ký
│   ├── forgot-password.css         # Khôi phục mật khẩu
│   ├── recipient.css               # Kiểu Người nhận
│   ├── recipient-app.css           # Khung ứng dụng Người nhận
│   ├── track-parcel.css            # Theo dõi đơn hàng
│   ├── delivery-preferences.css    # Tùy chọn giao nhận
│   ├── delivery-feedback.css       # Phản hồi giao hàng
│   ├── dispatcher.css              # Giao diện Điều hành
│   └── admin.css                   # Giao diện Quản trị viên
├── js/
│   ├── home.js                     # Tương tác trang chủ
│   ├── auth.js                     # Đăng nhập, đăng ký, khôi phục
│   ├── role-pages.js               # Hồ sơ và tương tác dùng chung
│   ├── recipient-pages.js          # Chức năng Người nhận
│   ├── dispatcher.js               # Chức năng Điều hành
│   └── admin-pages.js              # Chức năng Quản trị viên
└── page/
    ├── index.html
    ├── login.html
    ├── register.html
    ├── forgot-password.html
    ├── track-parcel.html
    ├── delivery-preferences.html
    ├── delivery-feedback.html
    ├── dispatcher-overview.html
    ├── dispatcher-exceptions.html
    ├── dispatcher-reassign.html
    ├── admin-status-management.html
    ├── admin-user-management.html
    └── admin-logistics-report.html
```

## Các trang hiện có

| Khu vực/Vai trò | Trang               | Tệp                                                                      | Chức năng                                                                                                                       |
| --------------- | ------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Công khai       | Trang chủ           | [`page/index.html`](page/index.html)                                     | Điểm vào chung, theo dõi kiện hàng và mở luồng đăng nhập/đăng ký.                                                               |
| Xác thực        | Đăng nhập           | [`page/login.html`](page/login.html)                                     | Chọn vai trò và nhập thông tin tài khoản demo.                                                                                  |
| Xác thực        | Đăng ký             | [`page/register.html`](page/register.html)                               | Nhập thông tin và chọn vai trò cho tài khoản demo.                                                                              |
| Xác thực        | Quên mật khẩu       | [`page/forgot-password.html`](page/forgot-password.html)                 | Mô phỏng yêu cầu khôi phục tài khoản.                                                                                           |
| Người nhận      | Theo dõi kiện hàng  | [`page/track-parcel.html`](page/track-parcel.html)                       | Tra cứu trạng thái và lịch sử giao hàng.                                                                                        |
| Người nhận      | Tùy chọn giao nhận  | [`page/delivery-preferences.html`](page/delivery-preferences.html)       | Cập nhật lựa chọn thời gian/địa điểm nhận hàng.                                                                                 |
| Người nhận      | Phản hồi giao hàng  | [`page/delivery-feedback.html`](page/delivery-feedback.html)             | Gửi đánh giá và phản hồi cho đơn hàng.                                                                                          |
| Tài xế          | Chưa có trang riêng | —                                                                        | Vai trò có trong form xác thực, nhưng `page/driver-route-stops.html` được nhắc làm trang đích mà hiện không có trong nhánh này. |
| Điều hành       | Tổng quan điều hành | [`page/dispatcher-overview.html`](page/dispatcher-overview.html)         | Xem KPI, biểu đồ sản lượng và cảnh báo vận hành.                                                                                |
| Điều hành       | Hàng đợi ngoại lệ   | [`page/dispatcher-exceptions.html`](page/dispatcher-exceptions.html)     | Tìm/lọc ngoại lệ, xem chi tiết và cập nhật quyết định xử lý.                                                                    |
| Điều hành       | Phân công lại       | [`page/dispatcher-reassign.html`](page/dispatcher-reassign.html)         | Chọn điểm dừng/tài xế, xem tải và ETA, lưu nháp hoặc xác nhận điều chuyển.                                                      |
| Quản trị viên   | Quản lý trạng thái  | [`page/admin-status-management.html`](page/admin-status-management.html) | Tìm, thêm, sửa và lưu trữ trạng thái giao nhận.                                                                                 |
| Quản trị viên   | Quản lý người dùng  | [`page/admin-user-management.html`](page/admin-user-management.html)     | Tìm/lọc, thêm, sửa, khóa/mở khóa và xóa tài khoản demo.                                                                         |
| Quản trị viên   | Báo cáo logistics   | [`page/admin-logistics-report.html`](page/admin-logistics-report.html)   | Chọn kỳ báo cáo, xem số liệu, lưu lựa chọn và tải CSV.                                                                          |

## Chạy dự án

Mở thư mục trong VS Code, chạy Live Server và truy cập `page/index.html` để vào trang chủ. Có thể mở trực tiếp từng trang trong bảng trên. Dự án không cần cài thư viện ngoài.

## Công nghệ và dữ liệu

- HTML5, CSS thuần với biến giao diện dùng chung, JavaScript thuần thao tác DOM.
- `localStorage` lưu một số cài đặt và dữ liệu demo trên trình duyệt hiện tại.
- Báo cáo CSV được tạo ngay trên trình duyệt.
- Bản hiện tại không có backend, API thật, xác thực tài khoản thật hoặc đồng bộ dữ liệu giữa các thiết bị.
- Gemini, Codex, Claude, Mimo...

## Ghi chú về các trang còn thiếu

- `js/auth.js` điều hướng vai trò Tài xế tới `page/driver-route-stops.html`, nhưng file đó chưa có trong nhánh `mergebranch`.
- Các trang Người nhận có liên kết tới `page/settings.html?role=recipient`, nhưng `page/settings.html` chưa có trong nhánh này.

## Liên kết dự án

- [Figma](https://www.figma.com/design/pLIUo9jzEtocX72oPxVQ3p/Untitled?node-id=0-1&t=zDJNyxMIUbNaoNGI-1)
- [YouTube — Playlist 1](https://www.youtube.com/playlist?list=PLdwaB8kTRTB0)
- [YouTube — Playlist 2](https://www.youtube.com/playlist?list=PLM1LbaS3zgUg)
- [GitHub](https://github.com/duongquynh16042007-cell/cse122-parcelpulse-team12.git)
