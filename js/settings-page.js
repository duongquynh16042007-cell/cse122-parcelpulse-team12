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
      sessionData = sessionRole === role ? session : null;
      profile.name = profile.name || sessionName || "Minh Anh";

      nameInput.value = profile.name;
      phoneInput.value = profile.phone;
      emailInput.value = roleInfo.email;
      $("#account-name").textContent = profile.name;
      $("#settings-side-name").textContent = profile.name;
      $("#avatar-initials").textContent = initialsOf(profile.name);
      $$("[data-setting]").forEach((input) => {
        input.checked =
          input.dataset.setting in settings.notifications
            ? settings.notifications[input.dataset.setting]
            : settings[input.dataset.setting] === true;
      });
      $("#language").value = settings.language;
      setThemeButtons(settings.theme);
      applyTheme(settings.theme);
      document.getElementById("settings-app").dataset.density = settings.compact
        ? "compact"
        : "comfortable";
      syncTwoFactorState();
      showMessage(formMessage, "");
      showMessage(securityMessage, "");
    } catch {
      showMessage(
        formMessage,
        "Không thể đọc cài đặt đã lưu. Hãy kiểm tra bộ nhớ trình duyệt.",
        "error",
      );
    }
  };

  $("#change-avatar").addEventListener("click", () => avatarInput.click());
  avatarInput.addEventListener("change", () => {
    const [file] = avatarInput.files || [];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      showMessage(
        formMessage,
        "Ảnh đại diện cần có định dạng JPG hoặc PNG.",
        "error",
      );
      avatarInput.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showMessage(
        formMessage,
        "Ảnh đại diện không được vượt quá 2 MB.",
        "error",
      );
      avatarInput.value = "";
      return;
    }
    showMessage(
      formMessage,
      `Demo: đã chọn ảnh "${file.name}". Ảnh chưa được tải lên máy chủ.`,
    );
  });

  $$("[data-theme-option]").forEach((button) => {
    button.addEventListener("click", () => {
      settings.theme = button.dataset.themeOption;
      setThemeButtons(settings.theme);
      applyTheme(settings.theme);
    });
  });

  $("#two-factor-state")
    .closest(".setting-row")
    .addEventListener("change", syncTwoFactorState);
  $("#change-password").addEventListener("click", () => {
    showMessage(
      securityMessage,
      "Demo: hướng dẫn đổi mật khẩu sẽ được gửi tới email đã xác minh của bạn.",
      "success",
    );
  });
  $("#language").addEventListener("change", () => {
    if ($("#language").value !== "vi") {
      showMessage(
        formMessage,
        "Bản demo hiện hỗ trợ Tiếng Việt. Các ngôn ngữ khác sẽ sớm ra mắt.",
      );
    } else {
      showMessage(formMessage, "");
    }
  });

  $("#cancel-settings").addEventListener("click", loadSettings);
  $("#save-settings").addEventListener("click", () => {
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const phoneDigits = phone.replace(/\D/g, "");
    if (name.length < 2) {
      nameInput.setAttribute("aria-invalid", "true");
      showMessage(formMessage, "Nhập họ tên gồm ít nhất 2 ký tự.", "error");
      nameInput.focus();
      return;
    }
    if (phone && (phoneDigits.length < 9 || phoneDigits.length > 15)) {
      phoneInput.setAttribute("aria-invalid", "true");
      showMessage(
        formMessage,
        "Nhập số điện thoại từ 9 đến 15 chữ số.",
        "error",
      );
      phoneInput.focus();
      return;
    }
    nameInput.removeAttribute("aria-invalid");
    phoneInput.removeAttribute("aria-invalid");

    const nextSettings = {
      notifications: {
        delivery: $('[data-setting="delivery"]').checked,
        exception: $('[data-setting="exception"]').checked,
        ai: $('[data-setting="ai"]').checked,
        news: $('[data-setting="news"]').checked,
      },
      twoFactor: $('[data-setting="twoFactor"]').checked,
      theme: settings.theme,
      language: $("#language").value,
      compact: settings.compact,
    };
    const nextProfile = { name, phone };
    try {
      localStorage.setItem(settingsKey, JSON.stringify(nextSettings));
      localStorage.setItem(
        legacySettingsKey,
        JSON.stringify({
          notifications:
            nextSettings.notifications.delivery ||
            nextSettings.notifications.exception ||
            nextSettings.notifications.ai ||
            nextSettings.notifications.news,
          compact: nextSettings.compact,
        }),
      );
      localStorage.setItem(profileKey, JSON.stringify(nextProfile));
      if (sessionData) {
        localStorage.setItem(
          "parcelpulse.demoSession",
          JSON.stringify({ ...sessionData, name, phone }),
        );
        sessionData = { ...sessionData, name, phone };
      }
      settings = nextSettings;
      profile = nextProfile;
      $("#settings-side-name").textContent = name;
      $("#account-name").textContent = name;
      $("#avatar-initials").textContent = initialsOf(name);
      applyTheme(settings.theme);
      showMessage(
        formMessage,
        "Đã lưu thay đổi trên trình duyệt này.",
        "success",
      );
    } catch {
      showMessage(
        formMessage,
        "Không thể lưu cài đặt trên trình duyệt này.",
        "error",
      );
    }
  });

  $("#logout").addEventListener("click", () => {
    localStorage.removeItem("parcelpulse.demoSession");
    window.location.href = "login.html";
  });

  const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
  colorScheme.addEventListener("change", () => {
    if (settings.theme === "system") applyTheme("system");
  });
  loadSettings();
});
