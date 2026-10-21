# ParcelPulse — Giao diện mô phỏng giao hàng

ParcelPulse là bản giao diện HTML, CSS và JavaScript mô phỏng một số thao tác trong quy trình giao hàng. Phạm vi hiện có gồm ba trang dành cho nhân viên giao hàng và một trang Cài đặt dùng chung. Dữ liệu đều là dữ liệu mẫu chạy trong trình duyệt; dự án không có backend, cơ sở dữ liệu hay bước build.

Đây là phần Sinh viên 2 phụ trách trong dự án nhóm, tập trung vào luồng Nhân viên giao hàng.

## Cấu trúc thư mục

```text
CODE/
├── .vscode/
│   └── settings.json             # Cấu hình Live Server, cổng 5501
├── README.md
├── css/
│   ├── base.css                  # Bố cục và thành phần giao diện dùng chung
│   ├── driver.css                # Giao diện các trang nhân viên giao hàng
│   ├── assistant.css             # Giao diện Trợ lý AI
│   ├── profile.css               # Ngăn hồ sơ người dùng
│   └── settings.css              # Giao diện trang Cài đặt
├── js/
│   ├── role-pages.js             # Trợ lý AI, hồ sơ và tiện ích dùng chung
│   ├── driver-pages.js           # Tương tác tuyến giao, điểm giao, ngoại lệ
│   ├── settings-page.js          # Hồ sơ và tùy chọn trên trang Cài đặt
│   └── assistant.js              # Panel AI độc lập; các trang hiện tại không nạp tệp này
└── pages/
    ├── driver-route-stops.html
    ├── driver-stop-detail.html
    ├── driver-exception-create.html
    └── settings.html
```

## Các trang hiện có

| Trang | Tệp | Chức năng |
| --- | --- | --- |
| Tuyến giao hôm nay | [`pages/driver-route-stops.html`](pages/driver-route-stops.html) | Xem 5 điểm dừng mẫu, tìm kiếm theo nội dung điểm giao, lọc trạng thái và đánh dấu đã giao hoặc hoàn tác. Số điểm hoàn tất và còn lại được cập nhật; quãng đường 12,4 km là số liệu mẫu. |
| Chi tiết điểm giao | [`pages/driver-stop-detail.html`](pages/driver-stop-detail.html) | Xem thông tin kiện hàng mẫu, nhập tên người nhận và mã gồm 6 chữ số để ghi nhận giao thành công. Mã `482910` là ví dụ hiển thị trên trang; bản demo chỉ kiểm tra đủ 6 chữ số. |
| Tạo ngoại lệ | [`pages/driver-exception-create.html`](pages/driver-exception-create.html) | Chọn điểm dừng và loại ngoại lệ, nhập mô tả (8–400 ký tự), chọn ảnh tùy chọn và lưu ngoại lệ mẫu. Mã ngoại lệ được tạo sau khi gửi. |
| Cài đặt | [`pages/settings.html`](pages/settings.html) | Chỉnh sửa tên và số điện thoại, tùy chọn thông báo, giao diện sáng/tối/theo hệ thống, ngôn ngữ và trạng thái xác thực hai bước mô phỏng. Email chỉ đọc. |

Các trạng thái giao hàng và ngoại lệ được lưu trong `localStorage` của trình duyệt. Trợ lý AI xuất hiện trên các trang nghiệp vụ; đây là mô phỏng theo từ khóa, có thể trả lời về ETA, gợi ý loại ngoại lệ hoặc bước tiếp theo. Gợi ý ngoại lệ không tự chọn loại hay gửi biểu mẫu.

## Vai trò trong trang Cài đặt

Trang Cài đặt nhận vai trò từ tham số URL `role` hoặc phiên demo đã lưu. Có thể mở trực tiếp bằng các URL như:

- `pages/settings.html?role=driver`
- `pages/settings.html?role=recipient`
- `pages/settings.html?role=dispatcher`
- `pages/settings.html?role=admin`

Trang không có bộ chọn vai trò. Trong thư mục hiện tại chỉ có các trang của nhân viên giao hàng và trang Cài đặt; các trang người nhận, điều phối viên và quản trị viên được tham chiếu trong menu nhưng chưa có ở đây.

