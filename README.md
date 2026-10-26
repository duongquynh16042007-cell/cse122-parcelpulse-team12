# ParcelPulse — Hệ thống mô phỏng giao nhận

ParcelPulse là ứng dụng web demo mô phỏng quy trình giao nhận với bốn vai trò: **Người nhận, Nhân viên giao hàng, Điều phối viên và Quản trị viên**. Dự án dùng HTML, CSS và JavaScript thuần; chưa có backend hoặc API logistics thật. Dữ liệu nghiệp vụ được lưu trong `localStorage` của trình duyệt.

## Chức năng theo vai trò

### Người nhận

| Màn hình | Tệp | Chức năng |
| --- | --- | --- |
| Trang chủ | [`page/index.html`](page/index.html) | Điểm vào ứng dụng và điều hướng đến các chức năng demo. |
| Theo dõi kiện hàng | [`page/track-parcel.html`](page/track-parcel.html) | Tra cứu trạng thái kiện hàng mẫu. |
| Tùy chọn giao nhận | [`page/delivery-preferences.html`](page/delivery-preferences.html) | Lưu lựa chọn giao hàng demo. |
| Phản hồi giao hàng | [`page/delivery-feedback.html`](page/delivery-feedback.html) | Gửi phản hồi mẫu sau giao hàng. |

### Nhân viên giao hàng

| Màn hình | Tệp | Chức năng |
| --- | --- | --- |
| Tuyến giao hôm nay | [`page/driver-route-stops.html`](page/driver-route-stops.html) | Xem, tìm, lọc và cập nhật điểm giao. Các mục được điều phối lại sẽ xuất hiện trên tuyến nếu tên tài xế được phân công trùng tên nhân viên đang dùng. |
| Chi tiết điểm giao | [`page/driver-stop-detail.html`](page/driver-stop-detail.html) | Xem chi tiết điểm giao và mô phỏng xác nhận bàn giao bằng tên người nhận cùng mã 6 chữ số. |
| Tạo ngoại lệ | [`page/driver-exception-create.html`](page/driver-exception-create.html) | Gửi ngoại lệ gồm điểm dừng, loại và mô tả; thông báo cho biết ngoại lệ đã gửi cho nhân viên điều hành và đang chờ xác nhận. |

### Điều phối viên

| Màn hình | Tệp | Chức năng |
| --- | --- | --- |
| Tổng quan điều hành | [`page/dispatcher-overview.html`](page/dispatcher-overview.html) | Xem KPI, biểu đồ sản lượng và cảnh báo demo. |
| Hàng đợi ngoại lệ | [`page/dispatcher-exceptions.html`](page/dispatcher-exceptions.html) | Nhận ngoại lệ do tài xế gửi, tìm/lọc, xem chi tiết, sửa loại, xác nhận hoặc bỏ qua. Xác nhận chuyển ngoại lệ sang danh sách phân công lại; bỏ qua sẽ xóa khỏi luồng xử lý. |
| Phân công lại | [`page/dispatcher-reassign.html`](page/dispatcher-reassign.html) | Chọn điểm cần chuyển và tài xế khả dụng, xem tóm tắt, lưu nháp hoặc xác nhận phân công. Khi tên tài xế khớp nhân viên giao hàng, công việc được nối vào tuyến của nhân viên đó. |

### Quản trị viên

| Màn hình | Tệp | Chức năng |
| --- | --- | --- |
| Quản lý trạng thái | [`page/admin-status-management.html`](page/admin-status-management.html) | Tạo, sửa, lưu trữ trạng thái demo và xem các bản ghi nghiệp vụ được chia sẻ từ những vai trò khác. |
| Quản lý người dùng | [`page/admin-user-management.html`](page/admin-user-management.html) | Tìm/lọc, tạo, sửa, khóa/mở khóa và xóa tài khoản demo. |
| Báo cáo logistics | [`page/admin-logistics-report.html`](page/admin-logistics-report.html) | Xem chỉ số demo theo kỳ, lưu lựa chọn và tải CSV được tạo trên trình duyệt. |

### Xác thực và cài đặt

- [`page/login.html`](page/login.html), [`page/register.html`](page/register.html), [`page/forgot-password.html`](page/forgot-password.html): mô phỏng đăng nhập, đăng ký và khôi phục tài khoản; không xác thực với máy chủ.
- [`page/settings.html`](page/settings.html): hồ sơ và tùy chọn giao diện dùng chung; vai trò được chọn qua tham số URL như `?role=driver` hoặc `?role=dispatcher`.

## Luồng dữ liệu liên vai trò

1. Nhân viên giao hàng gửi ngoại lệ. Ứng dụng lưu dữ liệu demo vào `parcelpulse.driverExceptions` và bản ghi chia sẻ `parcelpulse.sharedRecords`.
2. Điều phối viên mở **Hàng đợi ngoại lệ**. Trang đọc ngoại lệ từ các khóa trên cùng trình duyệt và cùng origin; nếu trang đang mở ở tab khác, thay đổi được nhận qua sự kiện `storage`.
3. Khi điều phối viên **xác nhận**, ngoại lệ rời hàng đợi và được lưu trong `parcelpulse.reassignStops` để xuất hiện ở **Phân công lại**. Khi **bỏ qua**, ngoại lệ bị loại khỏi hàng đợi và không chuyển sang phân công.
4. Điều phối viên chọn tài xế và xác nhận phân công. Bản ghi `parcelpulse.assignments` lưu tên tài xế cùng các điểm giao liên quan.
5. Tuyến giao chỉ nhận công việc nếu tên tài xế trong bản phân công trùng tên nhân viên giao hàng hiện tại. Với dữ liệu demo mặc định, **Minh Anh** có trong danh sách tài xế khả dụng để minh họa việc khớp tên.

Dữ liệu chỉ chia sẻ giữa các trang chạy trên **cùng trình duyệt và cùng origin** (ví dụ cùng địa chỉ Live Server). Dữ liệu không đồng bộ giữa máy tính, trình duyệt hoặc origin khác nhau.

## Cấu trúc thư mục

```text
git/
├── README.md
├── docs/
│   ├── ai-usage-report.md
│   ├── roles-and-features.md
│   ├── screen-list.md
│   └── team-assignment.md
├── css/                 # Kiểu dùng chung và theo từng khu vực
├── js/                  # Tương tác DOM và xử lý dữ liệu demo
└── page/                # Các màn hình HTML của ứng dụng
```

Một số tệp JavaScript chính:

- `js/role-pages.js`: tiện ích dùng chung, hồ sơ và bản ghi liên vai trò.
- `js/driver-pages.js`: tuyến giao, xác nhận bàn giao và gửi ngoại lệ.
- `js/dispatcher.js`: tổng quan, hàng đợi ngoại lệ và phân công lại.
- `js/admin-pages.js`: màn hình quản trị và đọc dữ liệu được chia sẻ.
- `js/pulse-ai.js`: tương tác Pulse AI theo quy tắc cục bộ.

## Pulse AI

Pulse AI hỗ trợ các màn hình nghiệp vụ được tích hợp bằng cách phân tích dữ liệu demo và quy tắc JavaScript. Công cụ có thể giải thích ETA, gợi ý xử lý ngoại lệ hoặc đề xuất thao tác để người dùng xem lại. Pulse AI không gọi mô hình AI, API từ xa, GPS hoặc dữ liệu vận tải trực tiếp; các thao tác quan trọng cần người dùng xác nhận.

## Công nghệ và giới hạn

- HTML5, CSS thuần với design tokens và JavaScript thuần thao tác DOM; không dùng Bootstrap hoặc framework giao diện.
- `localStorage` lưu dữ liệu demo, nháp, quyết định ngoại lệ và phân công trên trình duyệt hiện tại.
- Không có backend, API logistics thật, xác thực tài khoản thật hoặc đồng bộ dữ liệu giữa thiết bị.
- CSV được tạo ngay trên trình duyệt. Tệp ảnh được chọn trong biểu mẫu không được tải lên máy chủ.

## Chạy dự án

1. Mở thư mục dự án trong VS Code.
2. Chạy Live Server từ thư mục dự án.
3. Mở [`page/index.html`](page/index.html) hoặc vào trực tiếp màn hình cần xem.

Dự án không cần cài thư viện hoặc chạy bước build.

## Tài liệu và liên kết

- [Vai trò và chức năng](docs/roles-and-features.md)
- [Danh sách màn hình](docs/screen-list.md)
- [Phân công thành viên](docs/team-assignment.md)
- [Báo cáo sử dụng AI](docs/ai-usage-report.md)
- [Bản demo triển khai](https://duongquynh16042007-cell.github.io/cse122-parcelpulse-team12/page/index.html)
- [Figma](https://www.figma.com/design/pLIUo9jzEtocX72oPxVQ3p/Untitled?node-id=0-1&t=zDJNyxMIUbNaoNGI-1)
- [YouTube]
- [Hung](https://www.youtube.com/playlist?list=PLM1LbaS3zgUg)
- [Quan](https://www.youtube.com/playlist?list=PLQj4UhvHFinY)
- [Quynh](https://www.youtube.com/playlist?list=PLFuFhj5IUmMU)
- [trello](https://trello.com/b/LKDknIdj/nhom-12-n%E1%BB%81n-t%E1%BA%A3ng-web)
- [GitHub](https://github.com/duongquynh16042007-cell/cse122-parcelpulse-team12)
