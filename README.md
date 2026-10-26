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
│   ├── pulse-ai.css              # Giao diện Pulse AI
│   └── settings.css              # Cài đặt
├── js/
│   ├── home.js                   # Tương tác trang chủ
│   ├── auth.js                   # Đăng nhập, đăng ký, khôi phục demo
│   ├── role-pages.js             # Tiện ích và tương tác dùng chung
│   ├── recipient-pages.js        # Chức năng Người nhận
│   ├── driver-pages.js           # Chức năng Nhân viên giao hàng
│   ├── dispatcher.js             # Chức năng Điều phối viên
│   ├── admin-pages.js            # Chức năng Quản trị viên
│   ├── pulse-ai.js               # Trợ lý Pulse AI
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

- [Quản lý trạng thái](page/admin-status-management.html): tìm, tạo, sửa, lưu trữ trạng thái; trạng thái mặc định được khóa; xem và duyệt các bản ghi do Điều hành tạo.
- [Quản lý người dùng](page/admin-user-management.html): tìm/lọc, tạo, sửa, khóa/mở khóa và xóa tài khoản demo.
- [Báo cáo logistics](page/admin-logistics-report.html): chọn kỳ báo cáo, xem số liệu, lưu lựa chọn và tải CSV.

### Pulse AI

- Có trên các màn hình Điều hành và Quản trị viên qua nút **Pulse AI**.
- Đưa ra gợi ý theo dữ liệu demo và quy tắc cục bộ; người dùng xem lại trước khi xác nhận thao tác.
- Không gọi mô hình AI hoặc API từ xa.

## Chạy dự án

- Có trên các màn hình Điều phối viên và Quản trị viên; mở bằng nút **Pulse AI** ở góc dưới.
- Phân tích ngữ cảnh của màn đang mở, tìm ngoại lệ ưu tiên, gợi ý tài xế, duyệt người dùng chờ kích hoạt, cập nhật trạng thái hoặc lưu trữ trạng thái tùy chỉnh.
- Pulse AI yêu cầu người dùng xem lại và xác nhận các thao tác quan trọng; thao tác được chuyển qua các luồng CRUD hiện có.
- Đây là bản demo dùng quy tắc cục bộ và dữ liệu mẫu. Không gọi mô hình AI hoặc API từ xa; không xác minh danh tính, không tự quyết định vận hành thật.

### Nhân viên giao hàng

- [`page/driver-route-stops.html`](page/driver-route-stops.html): xem, tìm kiếm, lọc và cập nhật điểm giao mẫu.
- [`page/driver-stop-detail.html`](page/driver-stop-detail.html): xem chi tiết điểm giao và mô phỏng xác nhận bàn giao.
- [`page/driver-exception-create.html`](page/driver-exception-create.html): tạo ngoại lệ giao nhận demo.

### Điều phối viên

| Trang | Tệp | Chức năng |
| --- | --- | --- |
| Tuyến giao hôm nay | [`page/driver-route-stops.html`](page/driver-route-stops.html) | Xem 5 điểm dừng mẫu, tìm kiếm theo nội dung điểm giao, lọc trạng thái và đánh dấu đã giao hoặc hoàn tác. Số điểm hoàn tất và còn lại được cập nhật; quãng đường 12,4 km là số liệu mẫu. |
| Chi tiết điểm giao | [`page/driver-stop-detail.html`](page/driver-stop-detail.html) | Xem thông tin kiện hàng mẫu, nhập tên người nhận và mã gồm 6 chữ số để ghi nhận giao thành công. Mã `482910` là ví dụ hiển thị trên trang; bản demo chỉ kiểm tra đủ 6 chữ số. |
| Tạo ngoại lệ | [`page/driver-exception-create.html`](page/driver-exception-create.html) | Chọn điểm dừng và loại ngoại lệ, nhập mô tả (8–400 ký tự), chọn ảnh tùy chọn và lưu ngoại lệ mẫu. Mã ngoại lệ được tạo sau khi gửi. |
| Cài đặt | [`page/settings.html`](page/settings.html) | Chỉnh sửa tên và số điện thoại, tùy chọn thông báo, giao diện sáng/tối/theo hệ thống, ngôn ngữ và trạng thái xác thực hai bước mô phỏng. Email chỉ đọc. |

Các trạng thái giao hàng và ngoại lệ được lưu trong `localStorage` của trình duyệt. pulse-ai xuất hiện trên các trang nghiệp vụ; đây là mô phỏng theo từ khóa, có thể trả lời về ETA, gợi ý loại ngoại lệ hoặc bước tiếp theo. Gợi ý ngoại lệ không tự chọn loại hay gửi biểu mẫu.
- [`page/dispatcher-overview.html`](page/dispatcher-overview.html): KPI, biểu đồ và cảnh báo vận hành mẫu.
- [`page/dispatcher-exceptions.html`](page/dispatcher-exceptions.html): tìm/lọc ngoại lệ và mô phỏng quyết định xử lý.
- [`page/dispatcher-reassign.html`](page/dispatcher-reassign.html): mô phỏng phân công lại điểm giao/tài xế.

### Quản trị viên

- [`page/admin-status-management.html`](page/admin-status-management.html): quản lý trạng thái giao nhận mẫu.
- [`page/admin-user-management.html`](page/admin-user-management.html): tìm/lọc và quản lý tài khoản demo.
- [`page/admin-status-management.html`](page/admin-status-management.html): ngoài quản lý trạng thái, trang này hiển thị hàng đợi dữ liệu từ các vai trò; quản trị viên có thể lọc, duyệt, hủy hoặc lưu trữ.
- [`page/admin-logistics-report.html`](page/admin-logistics-report.html): báo cáo dữ liệu mẫu và tải CSV được tạo trên trình duyệt.

### Cài đặt dùng chung

- `page/settings.html?role=driver`
- `page/settings.html?role=recipient`
- `page/settings.html?role=dispatcher`
- `page/settings.html?role=admin`
- [`page/settings.html`](page/settings.html): hồ sơ và tùy chọn mô phỏng; nhận vai trò qua URL hoặc phiên demo.

## Chạy thử

Mở thư mục dự án trong VS Code, chạy Live Server và truy cập `page/index.html`. Có thể mở trực tiếp từng trang trong danh sách trên. Không cần cài thư viện hoặc chạy bước build.

- HTML5 ngữ nghĩa, CSS thuần với design tokens, JavaScript thuần thao tác DOM.
- Pulse AI demo chạy bằng JavaScript phía trình duyệt; chưa tích hợp LLM/backend.
- `localStorage` lưu cài đặt, người dùng/trạng thái demo, quyết định ngoại lệ và nháp/phân công trên trình duyệt hiện tại.
- Quyết định ngoại lệ và phân công của Điều hành được thêm vào hàng đợi chung; Quản trị viên xem trong trang Quản lý trạng thái. Dùng cùng trình duyệt và cùng origin để chia sẻ dữ liệu.
- Trang quản lý người dùng có 15 hồ sơ demo; hàng đợi ngoại lệ hiện gồm 5 hồ sơ mẫu.
- CSV được tạo ở phía trình duyệt.

## Công nghệ và giới hạn

- Trên Tuyến giao, tìm kiếm điểm dừng, đổi bộ lọc, rồi bấm **Đã giao** hoặc **Hoàn tác**.
- Trên Chi tiết điểm giao, nhập tên người nhận và một mã 6 chữ số, chẳng hạn `482910`.
- Trên Tạo ngoại lệ, chọn loại, nhập mô tả từ 8 ký tự trở lên rồi gửi biểu mẫu.
- Trên Cài đặt, thay đổi tên, số điện thoại, thông báo hoặc giao diện rồi bấm **Lưu thay đổi**.
- Mở pulse-ai bằng nút nổi để thử các câu hỏi gợi ý.
- HTML5, CSS thuần và JavaScript thuần; không sử dụng framework giao diện.
- Dữ liệu liên vai trò dùng `localStorage` trên cùng trình duyệt và cùng origin (ví dụ cùng địa chỉ Live Server); dữ liệu không đồng bộ giữa thiết bị hoặc trình duyệt khác.
- Đăng nhập, giao nhận, điều phối, quản trị, cài đặt và trợ lý (nếu hiển thị) chỉ mô phỏng; không có backend, API logistics thật hoặc đồng bộ dữ liệu.
- Báo cáo CSV được tạo ngay trong trình duyệt. Ảnh được chọn trong biểu mẫu không được tải lên máy chủ.

## Tài liệu dự án

- Không có đăng nhập thật, backend hoặc đồng bộ dữ liệu. Tùy chọn, trạng thái giao và ngoại lệ được lưu cục bộ theo trình duyệt và địa chỉ trang đang chạy.
- Ảnh bằng chứng chỉ được chọn trên thiết bị; ứng dụng không tải ảnh lên máy chủ. Ảnh đại diện trong Cài đặt cũng chỉ được chọn để minh họa, không được tải lên hay lưu làm hồ sơ.
- pulse-ai chạy bằng quy tắc và từ khóa trong JavaScript, không gọi dịch vụ AI hoặc dữ liệu vận chuyển trực tiếp.
- Tùy chọn xác thực hai bước chỉ đổi trạng thái hiển thị; chức năng đổi mật khẩu chỉ hiện thông báo demo. Tiếng Anh chưa được hỗ trợ.
Các tài liệu bổ sung nằm trong `docs/`, gồm đề xuất dự án, vai trò và chức năng, danh sách màn hình, phân công nhóm và báo cáo sử dụng AI.

## Liên kết dự án

- [Chạy thử demo](https://duongquynh16042007-cell.github.io/cse122-parcelpulse-team12/page/index.html)
- [Figma](https://www.figma.com/design/pLIUo9jzEtocX72oPxVQ3p/Untitled?node-id=0-1&t=zDJNyxMIUbNaoNGI-1)
- [YouTube — Playlist 1](https://www.youtube.com/playlist?list=PLdwaB8kTRTB0)
- [YouTube — Playlist 2](https://www.youtube.com/playlist?list=PLM1LbaS3zgUg)
- [GitHub](https://github.com/duongquynh16042007-cell/cse122-parcelpulse-team12)
