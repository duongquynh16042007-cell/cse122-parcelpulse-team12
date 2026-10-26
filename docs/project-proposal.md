# Đề xuất dự án ParcelPulse

## 1. Tên dự án

**ParcelPulse — Giao nhận cho cả nhóm**

## 2. Bối cảnh

Quy trình giao nhận liên quan đến nhiều nhóm người dùng: người nhận cần theo dõi kiện hàng, nhân viên giao hàng cần xử lý tuyến và điểm giao, điều phối viên cần theo dõi hoạt động, còn quản trị viên cần quản lý dữ liệu vận hành. ParcelPulse mô phỏng các luồng giao diện này trong một ứng dụng web thống nhất.

## 3. Mục tiêu

- Minh họa hành trình giao nhận qua các màn hình phù hợp với từng vai trò.
- Thực hành HTML, CSS và JavaScript thuần, bao gồm thao tác DOM và lưu dữ liệu demo trong trình duyệt.
- Tổ chức các trang theo vai trò và cung cấp điểm vào chung từ trang chủ.

## 4. Phạm vi

Dự án có trang công khai và xác thực demo, cùng giao diện cho Người nhận, Nhân viên giao hàng, Điều phối viên và Quản trị viên. Một số tùy chọn có thể được lưu cục bộ bằng `localStorage` hoặc `sessionStorage`; báo cáo CSV được tạo trên trình duyệt.

Đây là prototype giao diện. Dự án không có backend, cơ sở dữ liệu dùng chung, xác thực thật hay API logistics. Các số liệu, tài khoản, kiện hàng và thao tác nghiệp vụ đều là dữ liệu minh họa.

## 5. Đối tượng sử dụng

- Khách truy cập trang chủ.
- Người nhận hàng.
- Nhân viên giao hàng.
- Điều phối viên.
- Quản trị viên.

## 6. Công nghệ dự kiến/đang sử dụng

- HTML5 để xây dựng cấu trúc trang.
- CSS thuần để tạo bố cục và giao diện responsive.
- JavaScript thuần để xử lý tương tác, cập nhật DOM và lưu dữ liệu demo trên thiết bị.
- Live Server để chạy các trang tĩnh trong quá trình phát triển.

## 7. Kết quả bàn giao

- Các trang HTML trong thư mục `page/`.
- Kiểu giao diện trong `css/`.
- Tương tác phía trình duyệt trong `js/`.
- Tài liệu dự án, chức năng, danh sách màn hình và phân công nhóm.

## 8. Giới hạn và hướng phát triển

Để triển khai thành hệ thống dùng thật, cần bổ sung backend, cơ sở dữ liệu, xác thực và phân quyền phía máy chủ, API cho kiện hàng/tuyến giao, kiểm tra bảo mật và quy trình triển khai. Những phần đó nằm ngoài prototype hiện tại.
