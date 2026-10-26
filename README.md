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
│   ├── assistant.css             # Giao diện pulse-ai
│   ├── profile.css               # Ngăn hồ sơ người dùng
│   └── settings.css              # Giao diện trang Cài đặt
├── js/
│   ├── role-pages.js             # pulse-ai, hồ sơ và tiện ích dùng chung
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
| Tuyến giao hôm nay | [`page/driver-route-stops.html`](page/driver-route-stops.html) | Xem 5 điểm dừng mẫu, tìm kiếm theo nội dung điểm giao, lọc trạng thái và đánh dấu đã giao hoặc hoàn tác. Số điểm hoàn tất và còn lại được cập nhật; quãng đường 12,4 km là số liệu mẫu. |
| Chi tiết điểm giao | [`page/driver-stop-detail.html`](page/driver-stop-detail.html) | Xem thông tin kiện hàng mẫu, nhập tên người nhận và mã gồm 6 chữ số để ghi nhận giao thành công. Mã `482910` là ví dụ hiển thị trên trang; bản demo chỉ kiểm tra đủ 6 chữ số. |
| Tạo ngoại lệ | [`page/driver-exception-create.html`](page/driver-exception-create.html) | Chọn điểm dừng và loại ngoại lệ, nhập mô tả (8–400 ký tự), chọn ảnh tùy chọn và lưu ngoại lệ mẫu. Mã ngoại lệ được tạo sau khi gửi. |
| Cài đặt | [`page/settings.html`](page/settings.html) | Chỉnh sửa tên và số điện thoại, tùy chọn thông báo, giao diện sáng/tối/theo hệ thống, ngôn ngữ và trạng thái xác thực hai bước mô phỏng. Email chỉ đọc. |

Các trạng thái giao hàng và ngoại lệ được lưu trong `localStorage` của trình duyệt. pulse-ai xuất hiện trên các trang nghiệp vụ; đây là mô phỏng theo từ khóa, có thể trả lời về ETA, gợi ý loại ngoại lệ hoặc bước tiếp theo. Gợi ý ngoại lệ không tự chọn loại hay gửi biểu mẫu.

## Vai trò trong trang Cài đặt

Trang Cài đặt nhận vai trò từ tham số URL `role` hoặc phiên demo đã lưu. Có thể mở trực tiếp bằng các URL như:

- `page/settings.html?role=driver`
- `page/settings.html?role=recipient`
- `page/settings.html?role=dispatcher`
- `page/settings.html?role=admin`

Trang không có bộ chọn vai trò. Trong thư mục hiện tại chỉ có các trang của nhân viên giao hàng và trang Cài đặt; các trang người nhận, điều phối viên và quản trị viên được tham chiếu trong menu nhưng chưa có ở đây.

## Cách chạy

1. Mở thư mục `CODE` trong VS Code.
2. Dùng tiện ích **Live Server** để mở `page/driver-route-stops.html` (cổng `5501` được cấu hình trong `.vscode/settings.json`). Không cần cài thư viện hay chạy lệnh build.
3. Dùng menu trong trang để chuyển giữa Tuyến giao, Điểm giao, Ngoại lệ và Cài đặt.

Một số thao tác để xem thử:

- Trên Tuyến giao, tìm kiếm điểm dừng, đổi bộ lọc, rồi bấm **Đã giao** hoặc **Hoàn tác**.
- Trên Chi tiết điểm giao, nhập tên người nhận và một mã 6 chữ số, chẳng hạn `482910`.
- Trên Tạo ngoại lệ, chọn loại, nhập mô tả từ 8 ký tự trở lên rồi gửi biểu mẫu.
- Trên Cài đặt, thay đổi tên, số điện thoại, thông báo hoặc giao diện rồi bấm **Lưu thay đổi**.
- Mở pulse-ai bằng nút nổi để thử các câu hỏi gợi ý.

## Giới hạn bản demo

- Không có đăng nhập thật, backend hoặc đồng bộ dữ liệu. Tùy chọn, trạng thái giao và ngoại lệ được lưu cục bộ theo trình duyệt và địa chỉ trang đang chạy.
- Ảnh bằng chứng chỉ được chọn trên thiết bị; ứng dụng không tải ảnh lên máy chủ. Ảnh đại diện trong Cài đặt cũng chỉ được chọn để minh họa, không được tải lên hay lưu làm hồ sơ.
- pulse-ai chạy bằng quy tắc và từ khóa trong JavaScript, không gọi dịch vụ AI hoặc dữ liệu vận chuyển trực tiếp.
- Tùy chọn xác thực hai bước chỉ đổi trạng thái hiển thị; chức năng đổi mật khẩu chỉ hiện thông báo demo. Tiếng Anh chưa được hỗ trợ.

## Tài liệu và liên kết nhóm

- Figma: https://www.figma.com/design/pLIUo9jzEtocX72oPxVQ3p/Untitled?node-id=0-1&t=EPEoUSwKIyWGywfV-0
- Video trình bày: https://www.youtube.com/playlist?list=PLFuFhj5IUmMU
- GitHub: https://github.com/duongquynh16042007-cell/cse122-parcelpulse-team12
