# BTL-12: ParcelPulse – Theo dõi giao hàng và xử lý ngoại lệ

---

## 1. Giới thiệu & Vai trò Người nhận (SV1)

**ParcelPulse** giải quyết bài toán giao hàng chặng cuối (Last-mile delivery) với trọng tâm là **xử lý ngoại lệ** (đổi giờ, đổi địa chỉ, khiếu nại). 

Trong dự án, **Sinh viên 1 (SV1)** đảm nhiệm lát cắt dọc hoàn chỉnh cho vai trò **Người nhận** và **Hệ thống điều hướng dùng chung**:
- **Mục tiêu:** Tra cứu hành trình bưu kiện, chủ động thay đổi địa điểm/thời gian nhận hàng khi có việc bận, xem dự báo AI-ETA và gửi đánh giá dịch vụ.
- **Trách nhiệm chéo:** Xây dựng hệ thống giao diện (CSS base/theme), thanh điều hướng nhất quán (`sidebar`) và kiểm tra tính hợp lệ của biểu mẫu (form validation).

---

## 2. Bảng kiểm kê màn hình (Screen Inventory - SV1)

| Màn hình | Tệp mã nguồn | CRUD | Trạng thái bao phủ | Tính năng AI / Tương tác chính |
|---|---|:---:|---|---|
| **Theo dõi kiện hàng** | `page/track-parcel.html` | R | Bình thường, Đang tải, Rỗng, Lỗi | **AI-2:** Dự báo & giải thích thời gian giao (ETA Explainability) |
| **Tùy chọn giao nhận** | `page/delivery-preferences.html` | C/R/U | Form nhập, Đang lưu, Thành công | Đổi giao tận nhà / bưu cục, chọn khung giờ, lưu LocalStorage |
| **Phản hồi giao hàng** | `page/delivery-feedback.html` | C/R | Đánh giá sao, Thông báo lỗi/thành công | Chấm điểm sao, chọn lý do lỗi, gửi góp ý xử lý ngoại lệ |
| **Trang chủ** *(dùng chung)* | `page/index.html` | R | Responsive Desktop/Mobile | Banner giới thiệu, tra cứu nhanh, điều hướng toàn trang |
| **Đăng nhập / Đăng ký** *(dùng chung)* | `page/login.html`<br>`page/register.html` | C/R | Validation hợp lệ, Quản lý phiên | Lưu phiên `demoSession`, phân quyền chuyển hướng |
| **Quên mật khẩu** *(dùng chung)* | `page/forgot-password.html` | U | Kiểm tra email, Gửi thông báo | Thông báo gửi mã khôi phục tài khoản demo |

---

## 3. Luồng nghiệp vụ & Trải nghiệm AI (Người nhận)

```text
Trang chủ / Đăng nhập
  └─► Tra cứu kiện hàng (track-parcel.html)
        ├─ Nhập mã vận đơn (Regex: PPVN-XXXX-XXXX)
        ├─ Xem tiến độ bưu kiện & AI-2 ETA (giải thích tác động thời tiết, lộ trình)
        │
        ├─► Tùy chọn giao nhận (delivery-preferences.html)
        │     ├─ Đổi địa chỉ nhận nhà ◄► Bưu cục/Tủ Locker
        │     └─ Chọn khung giờ & lưu tùy chọn vào LocalStorage
        │
        └─► Đánh giá giao hàng (delivery-feedback.html)
              └─ Chấm sao (1–5 sao), chọn lý do, gửi phản hồi ngoại lệ
```

> **Tính năng AI-2 (ETA Explainability):** Ước tính khung giờ giao (VD: `14:10–14:35`) và giải thích nguyên nhân (tuyến xe CG-14, thời tiết, tải bưu cục). Cho phép người dùng chủ động bấm *Tùy chọn giao hàng* để dời lịch nếu không thuận tiện.

---

## 4. Công nghệ & Cấu trúc thư mục

- **Công nghệ:** HTML5 Semantic, CSS3 (Variables, Flexbox, Grid, Responsive), JavaScript ES6+ (DOM, LocalStorage).
- **Cấu trúc tệp của SV1:**
  - `page/`: `track-parcel.html`, `delivery-preferences.html`, `delivery-feedback.html`, `index.html`, `login.html`, `register.html`, `forgot-password.html`.
  - `css/`: `base.css`, `recipient-app.css`, `track-parcel.css`, `delivery-preferences.css`, `delivery-feedback.css`, `auth.css`, `home.css`.
  - `js/`: `recipient-pages.js` (xử lý chính cho Người nhận), `role-pages.js` (tiện ích DOM & LocalStorage), `auth.js`, `home.js`.

---

## 5. Hướng dẫn chạy thử (Demo)

1. Mở thư mục dự án trong **VS Code**.
2. Nhấp chuột phải vào `page/index.html` hoặc `page/track-parcel.html` $\rightarrow$ chọn **Open with Live Server**.
3. **Mã bưu kiện thử nghiệm:** `PPVN-4829-1024` (thử nhập mã sai để kiểm tra thông báo lỗi validation).
4. Thử chuyển đổi giữa nhận tận nhà và bưu cục tại trang Tùy chọn, sau đó lưu để kiểm tra dữ liệu trong `localStorage`.

---

## 6. Liên kết minh chứng

- **Repository:** [cse122-parcelpulse-team12](https://github.com/duongquynh16042007-cell/cse122-parcelpulse-team12)
- **Nhánh làm việc:** [feat/Quan](https://github.com/duongquynh16042007-cell/cse122-parcelpulse-team12/tree/feat/Quan)
- **Thiết kế Figma:** [Figma Design - Nhóm 12](https://www.figma.com/design/pLIUo9jzEtocX72oPxVQ3p/Untitled?node-id=0-1&p=f&t=lJXTZd1maof5g9lg-0)
- **Video Cuối kì:** [YouTube Playlist - Demo](https://www.youtube.com/playlist?list=PLQj4UhvHFinY)
- **Video Quá trình:** [YouTube Playlist - Video OBS](https://www.youtube.com/playlist?list=PLSSXUdIVUU9k)
  - `SV1-01-track-parcel.mp4`: Màn hình Tra cứu bưu kiện & AI-ETA
  - `SV1-02-delivery-preferences.mp4`: Màn hình Tùy chọn giao nhận
  - `SV1-03-delivery-feedback.mp4`: Màn hình Phản hồi & Đánh giá sao
  - `SV1-04-shared-navigation.mp4`: Giao diện dùng chung & Điều hướng

---

## 7. Khai báo sử dụng AI 

- **Công cụ:** ChatGPT, Claude, Gemini.
- **Câu lệnh chính:** Tạo khung HTML semantic cho timeline vận đơn, gợi ý regex kiểm tra mã bưu kiện, hàm chuyển đổi radio mode trong form.
- **AI sinh ra:** Khung HTML mẫu và đoạn mã kiểm tra chuỗi regex.
- **Sinh viên chỉnh sửa:** Tích hợp BEM class, viết lại toàn bộ logic vào `recipient-pages.js`, kết nối `localStorage`, bổ sung thuộc tính Accessibility (`aria-live`, `aria-invalid`) và xử lý responsive.
- **Kiểm chứng & Bài học:** Kiểm tra qua DevTools Console/Elements; thành thạo cách tổ chức mã Frontend dạng module và quản lý luồng dữ liệu Người nhận.
