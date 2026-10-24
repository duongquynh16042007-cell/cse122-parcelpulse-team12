# ParcelPulse — Đề xuất sản phẩm

## Bối cảnh

ParcelPulse là bản demo giao diện cho hoạt động giao nhận. Nhân viên điều hành theo dõi ngoại lệ và điều chuyển điểm giao; quản trị viên quản lý danh mục trạng thái, tài khoản demo và báo cáo. Dự án hiện chạy hoàn toàn trên trình duyệt, chưa có máy chủ hay dữ liệu vận hành trực tiếp.

## Phạm vi vai trò

- **Điều hành:** theo dõi hoạt động trong ngày, xử lý ngoại lệ, điều chuyển điểm giao.
- **Quản trị viên:** quản lý trạng thái giao nhận, người dùng demo, báo cáo logistics.

Phạm vi giữ hai vai trò theo yêu cầu của chủ dự án. Bare m đề xuất từ ba vai trò trở lên; đây là chênh lệch phạm vi cần được giảng viên xác nhận, không tự thêm vai trò ngoài yêu cầu.

## Vấn đề và mục tiêu

- **P1:** Điều hành cần nhìn thấy điểm nghẽn và ngoại lệ ưu tiên mà không phải tìm qua nhiều bảng.
- **P2:** Điều hành cần ghi nhận quyết định xử lý để giữ lại sau khi tải lại trang.
- **P3:** Khi thiếu tài xế, điều hành cần so sánh tải, quãng đường và thời gian dự kiến trước khi điều chuyển.
- **P4:** Quản trị viên cần quản lý danh mục và tài khoản demo nhất quán, có xác nhận và thông báo kết quả.

## Nguyên tắc dữ liệu

Các thay đổi giao diện được lưu vào `localStorage` trên trình duyệt hiện tại. Dữ liệu này chỉ phục vụ demo, không đồng bộ thiết bị, không thay thế API, xác thực hay cơ sở dữ liệu thật. CSV báo cáo được tạo ở phía trình duyệt từ dữ liệu mẫu.

Danh sách tài khoản quản trị có 15 hồ sơ minh họa với tên miền `.demo`; đây không phải danh sách nhân viên hoặc khách hàng thật. Hàng đợi ngoại lệ hiện chỉ có 5 hồ sơ mẫu.

## Gợi ý nghiệp vụ có giải thích

Các gợi ý trong ba màn hình điều hành là mô phỏng quy tắc cục bộ, không gọi mô hình AI/API. Chúng trình bày đầu vào, trạng thái phân tích, kết quả, lý do/độ tin cậy, quyền sửa/chấp nhận/từ chối/tạo lại và lưu quyết định trong trình duyệt. Khi dữ liệu thiếu hoặc không có lựa chọn phù hợp, giao diện phải nêu rõ chưa đủ cơ sở và không tự áp dụng.

## Phạm vi còn cần nhóm hoàn thiện

Figma desktop/mobile và sitemap đã có đường dẫn trong README nhưng cần kiểm tra quyền xem và độ đầy đủ. Nhóm cần tự bổ sung Task ID, người phụ trách, PR/reviewer, link deploy công khai, video OBS có người trình bày cho từng màn hình, và xác nhận của giảng viên về phạm vi hai vai trò. Không ghi nhận các minh chứng này là hoàn thành nếu chưa có thật.
