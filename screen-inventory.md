# ParcelPulse - Screen Inventory

Danh mục màn hình được kiểm kê từ nhánh `feat/Hung`. Phạm vi hiện tại gồm hai vai trò: **Điều hành** và **Quản trị viên**.

## Phạm vi

- Có 6 trang HTML tĩnh, mỗi trang tương ứng một màn hình.
- Điều hướng dùng liên kết giữa các file HTML, không dùng router của SPA.
- Các trang là bản demo chạy phía trình duyệt. Dữ liệu ban đầu là dữ liệu mẫu; một số thay đổi được lưu trong `localStorage` của trình duyệt hiện tại.
- Không có màn hình đăng nhập thật, backend, API nghiệp vụ hoặc phân quyền phía máy chủ trong phạm vi này.

## Danh mục màn hình

| ID | Vai trò | Màn hình | Tệp | Mục đích và chức năng chính | Dữ liệu / kết quả |
|---|---|---|---|---|---|
| DSP-01 | Điều hành | Tổng quan điều hành | [page/dispatcher-overview.html](page/dispatcher-overview.html) | Theo dõi các chỉ số vận hành; xem biểu đồ sản lượng theo giờ; chuyển dữ liệu hiển thị giữa hôm nay và hôm qua; nhận biết thời điểm cao điểm. | KPI và chuỗi số liệu được khai báo sẵn trong JavaScript. Chuyển phạm vi chỉ cập nhật giao diện. |
| DSP-02 | Điều hành | Hàng đợi ngoại lệ | [page/dispatcher-exceptions.html](page/dispatcher-exceptions.html) | Tìm kiếm ngoại lệ; lọc theo mức ưu tiên, SLA và loại; chọn một dòng để xem chi tiết; xác nhận, chỉnh loại hoặc bỏ qua ngoại lệ. | Danh sách và mô tả là dữ liệu mẫu. Quyết định được lưu vào `localStorage` dưới khóa `parcelpulse.exceptionDecisions`. |
| DSP-03 | Điều hành | Phân công lại | [page/dispatcher-reassign.html](page/dispatcher-reassign.html) | Chọn một hoặc nhiều điểm dừng; lọc tài xế theo số điểm còn trống; xem tổng kiện, quãng đường, ETA và SLA ước tính; lưu nháp hoặc xác nhận phân công. | Điểm dừng và tài xế là dữ liệu mẫu. Nháp dùng khóa `parcelpulse.assignmentDraft`; phân công đã xác nhận dùng `parcelpulse.assignments` trên trình duyệt. |
| ADM-01 | Quản trị viên | Quản lý trạng thái | [page/admin-status-management.html](page/admin-status-management.html) | Xem và tìm trạng thái; tạo, sửa hoặc lưu trữ trạng thái. Các trạng thái mặc định được khóa để tránh lưu trữ. | Danh sách mặc định được khai báo trong JavaScript; thay đổi demo lưu cục bộ dưới khóa `parcelpulse.statuses`. |
| ADM-02 | Quản trị viên | Quản lý người dùng | [page/admin-user-management.html](page/admin-user-management.html) | Xem/tìm/lọc người dùng theo trạng thái và vai trò; thêm, sửa, tạm khóa/mở khóa hoặc xóa tài khoản demo; kiểm tra email trùng và dữ liệu biểu mẫu. | Hồ sơ là dữ liệu mẫu; thay đổi demo lưu cục bộ dưới khóa `parcelpulse.users`. Không tạo hoặc khóa tài khoản thật. |
| ADM-03 | Quản trị viên | Báo cáo logistics | [page/admin-logistics-report.html](page/admin-logistics-report.html) | Chọn kỳ 7, 30 hoặc 90 ngày; xem KPI, bảng theo trung tâm và biểu đồ; tải báo cáo CSV; lưu lựa chọn kỳ báo cáo. | Số liệu được khai báo sẵn trong JavaScript. CSV được tạo ngay trong trình duyệt; lựa chọn đã lưu dùng khóa `parcelpulse.savedReports`. |

## Tính năng AI số 3: Copilot dùng chung

Copilot xuất hiện trên cả sáu màn hình bằng nút **AI Copilot** ở góc dưới. Trợ lý đọc ngữ cảnh DOM và dữ liệu mẫu của trang hiện tại, đưa đề xuất thành các nút hành động, rồi gọi lại thao tác CRUD đã có. Người dùng vẫn xem lại và xác nhận trước khi duyệt/bỏ qua ngoại lệ, kích hoạt tài khoản hoặc lưu trữ trạng thái.

| Ngữ cảnh | Đề xuất Copilot | Hành động sau khi người dùng chọn |
|---|---|---|
| Hàng đợi ngoại lệ | Xếp ngoại lệ ưu tiên khẩn/gần SLA lên trước. | Mở chi tiết, duyệt, cập nhật loại hoặc bỏ qua qua luồng hiện có. |
| Phân công lại | Xếp tài xế theo số điểm còn trống rồi ETA mẫu. | Chọn tài xế gợi ý; lưu nháp nếu đã chọn điểm. Người dùng tự kiểm tra và xác nhận điều chuyển. |
| Tổng quan điều hành | Tóm tắt số liệu mẫu và liên kết tới hàng đợi/phân công. | Mở màn liên quan để xử lý. |
| Quản lý trạng thái | Tìm trạng thái tùy chỉnh có thể sửa/lưu trữ; mã mặc định bị khóa. | Mở biểu mẫu sửa hoặc yêu cầu xác nhận lưu trữ. |
| Quản lý người dùng | Tìm người dùng đang chờ kích hoạt. | Chuẩn bị form duyệt hoặc yêu cầu xác nhận rồi gửi form cập nhật trạng thái. |
| Báo cáo logistics | Tóm tắt KPI mẫu của kỳ đang chọn. | Tải CSV mẫu hoặc lưu kỳ báo cáo. |

Copilot hiện là bản demo suy luận theo quy tắc trong `js/copilot.js`; không gọi mô hình AI hay API từ xa. Đây là công cụ giao diện dùng chung, không phải vai trò người dùng độc lập.

## Thành phần dùng chung

| Thành phần | Có trên | Chức năng |
|---|---|---|
| Thanh điều hướng vai trò | Cả 6 trang | Mở các màn hình cùng vai trò và cung cấp liên kết demo để chuyển sang vai trò còn lại. Đây là điều hướng giao diện, không phải kiểm soát quyền truy cập. |
| Hồ sơ và cài đặt | Cả 6 trang khi nạp `js/role-pages.js` | Mở hộp thoại hồ sơ demo; đổi tùy chọn thông báo và giao diện gọn; áp dụng giao diện sáng/tối theo cài đặt. Thông tin được lưu cục bộ. |
| AI Copilot | Cả 6 trang khi nạp `js/copilot.js` và `css/copilot.css` | Phân tích màn hình, đề xuất việc cần xử lý và gọi các luồng cập nhật hiện có sau thao tác xác nhận của người dùng. Bản demo chạy theo luật cục bộ, không kết nối LLM/API. |
| Thông báo thao tác | Các trang có node `#toast` | Hiển thị phản hồi ngắn sau thao tác; có thể bị tắt trong tùy chọn hồ sơ. |

## Điều hướng màn hình

```text
Điều hành
├── DSP-01 Tổng quan điều hành
├── DSP-02 Hàng đợi ngoại lệ
└── DSP-03 Phân công lại

Quản trị viên
├── ADM-01 Quản lý trạng thái
├── ADM-02 Quản lý người dùng
└── ADM-03 Báo cáo logistics

Thanh điều hướng trên mỗi trang cho phép mở các trang cùng vai trò;
liên kết chuyển vai trò mở trang đầu mối của vai trò còn lại.
```

## Ngoài phạm vi màn hình

- Đăng nhập, đăng ký và khôi phục mật khẩu.
- Vai trò tài xế, người nhận hoặc vai trò AI độc lập (Copilot là công cụ dùng chung).
- API/backend, cơ sở dữ liệu dùng chung, xác thực và phân quyền phía máy chủ.
- Triển khai website công khai (Live Deployment URL).
