# ParcelPulse — Hệ thống mô phỏng giao nhận

ParcelPulse là bản demo giao diện HTML, CSS và JavaScript cho quy trình giao nhận. Nhánh này có các màn hình cho **Người nhận, Nhân viên giao hàng, Điều phối viên và Quản trị viên**, cùng trang công khai, xác thực và Cài đặt dùng chung. Dữ liệu là dữ liệu mẫu lưu cục bộ trên trình duyệt; dự án chưa có backend hoặc API logistics thật.

## Cấu trúc thư mục

```text
git/
├── README.md
├── docs/                         # Tài liệu dự án
├── css/
│   ├── base.css                  # Kiểu và thành phần dùng chung
│   ├── profile.css               # Hồ sơ dùng chung
│   ├── home.css                  # Trang chủ
│   ├── auth.css                  # Giao diện xác thực
│   ├── login.css                 # Đăng nhập
│   ├── register.css              # Đăng ký
│   ├── forgot-password.css       # Khôi phục mật khẩu
│   ├── recipient.css             # Giao diện Người nhận
│   ├── recipient-app.css         # Khung ứng dụng Người nhận
│   ├── track-parcel.css          # Theo dõi kiện hàng
│   ├── delivery-preferences.css  # Tùy chọn giao nhận
│   ├── delivery-feedback.css     # Phản hồi giao hàng
│   ├── driver.css                # Nhân viên giao hàng
│   ├── dispatcher.css            # Điều phối viên
│   ├── admin.css                 # Quản trị viên
│   ├── assistant.css             # Tiện ích trợ lý mô phỏng
│   └── settings.css              # Cài đặt
├── js/
│   ├── home.js                   # Tương tác trang chủ
│   ├── auth.js                   # Đăng nhập, đăng ký, khôi phục demo
│   ├── role-pages.js             # Tiện ích và tương tác dùng chung
│   ├── recipient-pages.js        # Chức năng Người nhận
│   ├── driver-pages.js           # Chức năng Nhân viên giao hàng
│   ├── dispatcher.js             # Chức năng Điều phối viên
│   ├── admin-pages.js            # Chức năng Quản trị viên
│   ├── assistant.js              # Tiện ích trợ lý mô phỏng
│   └── settings-page.js          # Cài đặt dùng chung
└── page/                         # Tất cả trang HTML
    ├── index.html
    ├── login.html
    ├── register.html
    ├── forgot-password.html
    ├── track-parcel.html
    ├── delivery-preferences.html
    ├── delivery-feedback.html
    ├── driver-route-stops.html
    ├── driver-stop-detail.html
    ├── driver-exception-create.html
    ├── settings.html
    ├── dispatcher-overview.html
    ├── dispatcher-exceptions.html
    ├── dispatcher-reassign.html
    ├── admin-status-management.html
    ├── admin-user-management.html
    └── admin-logistics-report.html
```

## Vai trò và màn hình

### Khu vực công khai và xác thực

- [`page/index.html`](page/index.html): trang chủ, điểm vào các khu vực và tra cứu demo.
- [`page/login.html`](page/login.html): chọn vai trò và mô phỏng đăng nhập.
- [`page/register.html`](page/register.html): biểu mẫu đăng ký demo.
- [`page/forgot-password.html`](page/forgot-password.html): mô phỏng yêu cầu khôi phục tài khoản.

### Người nhận

- [`page/track-parcel.html`](page/track-parcel.html): tra cứu kiện hàng và lịch sử trạng thái mẫu.
- [`page/delivery-preferences.html`](page/delivery-preferences.html): cập nhật tùy chọn nhận hàng demo.
- [`page/delivery-feedback.html`](page/delivery-feedback.html): gửi đánh giá và phản hồi demo.

### Nhân viên giao hàng

- [`page/driver-route-stops.html`](page/driver-route-stops.html): xem, tìm kiếm, lọc và cập nhật điểm giao mẫu.
- [`page/driver-stop-detail.html`](page/driver-stop-detail.html): xem chi tiết điểm giao và mô phỏng xác nhận bàn giao.
- [`page/driver-exception-create.html`](page/driver-exception-create.html): tạo ngoại lệ giao nhận demo.

### Điều phối viên

- [`page/dispatcher-overview.html`](page/dispatcher-overview.html): KPI, biểu đồ và cảnh báo vận hành mẫu.
- [`page/dispatcher-exceptions.html`](page/dispatcher-exceptions.html): tìm/lọc ngoại lệ và mô phỏng quyết định xử lý.
- [`page/dispatcher-reassign.html`](page/dispatcher-reassign.html): mô phỏng phân công lại điểm giao/tài xế.

### Quản trị viên

- [`page/admin-status-management.html`](page/admin-status-management.html): quản lý trạng thái giao nhận mẫu.
- [`page/admin-user-management.html`](page/admin-user-management.html): tìm/lọc và quản lý tài khoản demo.
- [`page/admin-logistics-report.html`](page/admin-logistics-report.html): báo cáo dữ liệu mẫu và tải CSV được tạo trên trình duyệt.

### Cài đặt dùng chung

- [`page/settings.html`](page/settings.html): hồ sơ và tùy chọn mô phỏng; nhận vai trò qua URL hoặc phiên demo.

## Chạy thử

Mở thư mục dự án trong VS Code, chạy Live Server và truy cập `page/index.html`. Có thể mở trực tiếp từng trang trong danh sách trên. Không cần cài thư viện hoặc chạy bước build.

## Công nghệ và giới hạn

- HTML5, CSS thuần và JavaScript thuần; không sử dụng framework giao diện.
- Một số dữ liệu demo được lưu bằng `localStorage` hoặc `sessionStorage` trên trình duyệt hiện tại.
- Đăng nhập, giao nhận, điều phối, quản trị, cài đặt và trợ lý (nếu hiển thị) chỉ mô phỏng; không có backend, API logistics thật hoặc đồng bộ dữ liệu.
- Báo cáo CSV được tạo ngay trong trình duyệt. Ảnh được chọn trong biểu mẫu không được tải lên máy chủ.

## Tài liệu dự án

Các tài liệu bổ sung nằm trong `docs/`, gồm đề xuất dự án, vai trò và chức năng, danh sách màn hình, phân công nhóm và báo cáo sử dụng AI.

## Liên kết dự án

- [Chạy thử demo](https://duongquynh16042007-cell.github.io/cse122-parcelpulse-team12/page/index.html)
- [Figma](https://www.figma.com/design/pLIUo9jzEtocX72oPxVQ3p/Untitled?node-id=0-1&t=zDJNyxMIUbNaoNGI-1)
- [YouTube — Playlist 1](https://www.youtube.com/playlist?list=PLdwaB8kTRTB0)
- [YouTube — Playlist 2](https://www.youtube.com/playlist?list=PLM1LbaS3zgUg)
- [GitHub](https://github.com/duongquynh16042007-cell/cse122-parcelpulse-team12)
