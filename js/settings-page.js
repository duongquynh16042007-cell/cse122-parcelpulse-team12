document.addEventListener("DOMContentLoaded", () => {
  const roles = {
    recipient: {
      label: "Người nhận",
      landing: "recipient-track-parcel.html",
      email: "minhanh.recipient@parcelpulse.demo",
      phone: "0900000123",
      links: [
        ["parcel", "Kiện hàng", "recipient-track-parcel.html"],
        ["preferences", "Tuỳ chọn", "recipient-delivery-preferences.html"],
        ["feedback", "Phản hồi", "recipient-delivery-feedback.html"],
      ],
    },
    driver: {
      label: "Nhân viên giao hàng",
      landing: "driver-route-stops.html",
      email: "minhanh.driver@parcelpulse.demo",
      phone: "0900000246",
      links: [
        ["➤", "Tuyến giao", "driver-route-stops.html"],
        ["◉", "Điểm giao", "driver-stop-detail.html"],
        ["⚠", "Ngoại lệ", "driver-exception-create.html"],
      ],
    },
    dispatcher: {
      label: "Điều phối viên",
      landing: "dispatcher-overview.html",
      email: "minhanh.dispatcher@parcelpulse.demo",
      phone: "0900000810",
      links: [
        ["▦", "Điều hành", "dispatcher-overview.html"],
        ["☷", "Hàng đợi", "dispatcher-exceptions.html"],
        ["⇄", "Phân công", "dispatcher-reassign.html"],
      ],
    },
    admin: {
      label: "Quản trị viên",
      landing: "admin-status-management.html",
      email: "admin.demo@parcelpulse.demo",
      phone: "0900000000",
      links: [
        ["◷", "Trạng thái", "admin-status-management.html"],
        ["♙", "Người dùng", "admin-user-management.html"],
        ["▤", "Báo cáo logistics", "admin-logistics-report.html"],
      ],
    },
  };
  const defaults = {
    notifications: {
      delivery: true,
      exception: true,
      ai: true,
      news: false,
    },
    twoFactor: true,
    theme: "light",
    language: "vi",
    compact: false,
  };
  const params = new URLSearchParams(window.location.search);
  const storedSession = localStorage.getItem("parcelpulse.demoSession");
  let session = null;
  try {
    session = storedSession ? JSON.parse(storedSession) : null;
  } catch {
    session = null;
  }
  const sessionRole = session && roles[session.role] ? session.role : null;
  const queryRole = params.get("role");
  const role = roles[queryRole] ? queryRole : sessionRole || "recipient";
  const roleInfo = roles[role];
  const recipientIcons = {
    parcel:
      '<path d="M12 3l8 4.2v9.6L12 21l-8-4.2V7.2L12 3Z"/><path d="m4 7.2 8 4.3 8-4.3"/><path d="M12 11.5V21"/>',
    preferences:
      '<path d="M4 7h9.5"/><circle cx="16.8" cy="7" r="2.6"/><path d="M20 17h-9.5"/><circle cx="7.2" cy="17" r="2.6"/>',
    feedback:
      '<path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8L12 4Z"/>',
  };
  const profileKey = `parcelpulse.profile.${role}`;
  const settingsKey = "parcelpulse.settings";
  const legacySettingsKey = "parcelpulse.profileSettings";
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const formMessage = $("#settings-message");
  const securityMessage = $("#security-message");
  const nameInput = $("#display-name");
  const phoneInput = $("#phone");
  const emailInput = $("#email");
