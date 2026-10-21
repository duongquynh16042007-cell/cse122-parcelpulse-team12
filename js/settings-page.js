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
  const avatarInput = $("#avatar-input");
  let settings = structuredClone(defaults);
  let profile = { name: "Minh Anh", phone: roleInfo.phone };
  let sessionData = session;

  $("#settings-brand").href = roleInfo.landing;
  $("#settings-role").textContent = roleInfo.label;
  $("#settings-side-role").textContent = roleInfo.label;
  $("#settings-eyebrow").textContent = `${roleInfo.label} · Tài khoản cá nhân`;
  $("#settings-navigation").innerHTML = roleInfo.links
    .map(
      ([icon, label, href]) => {
        const iconMarkup = recipientIcons[icon]
          ? `<svg class="nav-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${recipientIcons[icon]}</svg>`
          : `<span class="nav-icon" aria-hidden="true">${icon}</span>`;
        return `<a class="nav-item--icon" href="${href}">${iconMarkup}${label}</a>`;
      },
    )
    .join("");
  $(".settings-trigger").href =
    `settings.html?role=${encodeURIComponent(role)}`;

  const showMessage = (element, text, tone = "") => {
    element.textContent = text;
    if (tone) element.dataset.tone = tone;
    else delete element.dataset.tone;
  };

  const readJson = (key, fallback) => {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  };

  const initialsOf = (name) => {
    const parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (parts.length === 0) return "PP";
    return `${parts[0][0]}${parts.length > 1 ? parts[parts.length - 1][0] : parts[0][1] || ""}`.toUpperCase();
  };

  const resolvedTheme = (theme) => {
    if (theme !== "system") return theme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = resolvedTheme(theme);
  };

  const setThemeButtons = (theme) => {
    $$("[data-theme-option]").forEach((button) => {
      const selected = button.dataset.themeOption === theme;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  };

  const syncTwoFactorState = () => {
    $("#two-factor-state").textContent = $('[data-setting="twoFactor"]').checked
      ? "Đang bật"
      : "Đang tắt";
  };

  const loadSettings = () => {
    try {
      const legacy = readJson(legacySettingsKey, {});
      const stored = readJson(settingsKey, {});
      settings = {
        ...structuredClone(defaults),
        ...legacy,
        ...stored,
        notifications: {
          ...defaults.notifications,
          ...(stored.notifications || {}),
        },
      };
      const sessionName =
        sessionRole === role && typeof session?.name === "string"
          ? session.name.trim()
          : "";
      profile = {
        name: sessionName || "Minh Anh",
        phone: roleInfo.phone,
        ...readJson(profileKey, {}),
      };
