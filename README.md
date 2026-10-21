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
