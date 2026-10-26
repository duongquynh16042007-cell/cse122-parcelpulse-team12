/* Shared, local-only interactions for all role screens. */
document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [
    ...root.querySelectorAll(selector),
  ];
  const read = (key, fallback) => {
    const value = localStorage.getItem(`parcelpulse.${key}`);
    return value === null ? fallback : JSON.parse(value);
  };
  const write = (key, value) =>
    localStorage.setItem(`parcelpulse.${key}`, JSON.stringify(value));
  const toast = (message) => {
    if (
      read("profileSettings", { notifications: true }).notifications === false
    )
      return;
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("show"), 2600);
  };
  const announce = (element, message, tone = "") => {
    element.textContent = message;
    if (tone) element.dataset.tone = tone;
    else delete element.dataset.tone;
  };
  const getSharedRecords = () => {
    const records = read("sharedRecords", []);
    return Array.isArray(records) ? records : [];
  };
  const notifyRecordsChanged = () =>
    window.dispatchEvent(new CustomEvent("parcelpulse:records-changed"));
  const registerSharedRecord = (record) => {
    const records = getSharedRecords();
    const now = new Date().toISOString();
    const id = record.id || `REC-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const previous = records.find((item) => item.id === id);
    const next = {
      id,
      sourceRole: record.sourceRole || "Chưa xác định",
      sourceType: record.sourceType || "Bản ghi nghiệp vụ",
      reference: record.reference || "",
      title: record.title || "Bản ghi mới",
      summary: record.summary || "",
      status: record.status || "pending",
      createdAt: previous?.createdAt || record.createdAt || now,
      updatedAt: now,
      ...record,
      id,
    };
    const index = records.findIndex((item) => item.id === id);
    if (index >= 0) records[index] = next;
    else records.unshift(next);
    write("sharedRecords", records.slice(0, 300));
    notifyRecordsChanged();
    return next;
  };
  const updateSharedRecord = (id, changes) => {
    const records = getSharedRecords();
    const index = records.findIndex((item) => item.id === id);
    if (index < 0) return null;
    records[index] = {
      ...records[index],
      ...changes,
      id,
      updatedAt: new Date().toISOString(),
    };
    write("sharedRecords", records);
    notifyRecordsChanged();
    return records[index];
  };
  window.ParcelPulseRolePages = Object.freeze({
    $,
    $$,
    read,
    write,
    toast,
    announce,
    getSharedRecords,
    registerSharedRecord,
    updateSharedRecord,
  });
  const savedTheme = read("settings", {}).theme;
  if (["light", "dark", "system"].includes(savedTheme)) {
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const applySavedTheme = () => {
      document.documentElement.dataset.theme =
        savedTheme === "system"
          ? colorScheme.matches
            ? "dark"
            : "light"
          : savedTheme;
    };
    applySavedTheme();
    colorScheme.addEventListener("change", () => {
      if (savedTheme === "system") applySavedTheme();
    });
  }

  /* ===== Shared profile and settings drawer ===== */
  const currentPage = window.location.pathname.split("/").pop();
  if (currentPage && currentPage !== "settings.html") {
    $$('a[href*="settings.html"]').forEach((link) => {
      const target = new URL(link.href, window.location.href);
      if (!target.pathname.endsWith("/settings.html")) return;
      target.searchParams.set("return", currentPage);
      link.href = `settings.html?${target.searchParams.toString()}`;
    });
  }

  const settingsTrigger = $("[data-open-profile]");
  const roleElement = $(".role-chip");
  if (roleElement) {
    const roleLabels = {
      recipient: "Người nhận",
      driver: "Nhân viên giao hàng",
      dispatcher: "Điều phối viên",
      admin: "Quản trị viên",
    };
    const accountByLabel = Object.fromEntries(
      Object.entries(roleLabels).map(([role, label]) => [label, role]),
    );
    const role = accountByLabel[roleElement.textContent.trim()] || "recipient";
    const profileDefaults = {
      recipient: {
        email: "minhanh.recipient@parcelpulse.demo",
        phone: "09•• ••• 123",
      },
      driver: {
        email: "minhanh.driver@parcelpulse.demo",
        phone: "09•• ••• 246",
      },
      dispatcher: {
        email: "minhanh.dispatcher@parcelpulse.demo",
        phone: "09•• ••• 810",
      },
      admin: { email: "admin.demo@parcelpulse.demo", phone: "09•• ••• 000" },
    };
    const session = read("demoSession", null);
    const profileKey = `profile.${role}`;
    const savedProfile = read(profileKey, {});
    const profileName =
      savedProfile.name ||
      (session?.role === role
        ? session.name
        : $(".user strong")?.textContent.trim());
    const settings = {
      notifications: true,
      compact: false,
      ...read("profileSettings", {}),
    };
    const dialog = document.createElement("dialog");
    dialog.className = "profile-drawer";
    dialog.setAttribute("aria-labelledby", "profile-drawer-title");
    dialog.innerHTML = `
      <header class="profile-drawer__header">
        <div><p class="eyebrow">Tài khoản demo</p><h2 id="profile-drawer-title">Hồ sơ &amp; cài đặt</h2></div>
        <button class="profile-drawer__close" type="button" aria-label="Đóng cài đặt" data-close-profile>×</button>
      </header>
      <section class="profile-card" aria-label="Thông tin hồ sơ">
        <span class="profile-avatar" aria-hidden="true">MA</span>
        <div><strong data-profile-name></strong><span data-profile-role></span></div>
      </section>
      <dl class="profile-details">
        <div><dt>Email</dt><dd data-profile-email></dd></div>
        <div><dt>Điện thoại</dt><dd data-profile-phone></dd></div>
      </dl>
      <section class="profile-preferences" aria-labelledby="profile-preferences-title">
        <h3 id="profile-preferences-title">Tùy chọn giao diện</h3>
        <label><span><strong>Thông báo trong ứng dụng</strong><small>Hiện thông báo thao tác của bản demo.</small></span><input type="checkbox" data-setting="notifications" /></label>
        <label><span><strong>Giao diện gọn</strong><small>Thu gọn khoảng cách trong khu vực làm việc.</small></span><input type="checkbox" data-setting="compact" /></label>
      </section>
      <p class="profile-drawer__note" role="status" aria-live="polite">Thông tin và tùy chọn chỉ lưu trên thiết bị này; không phải tài khoản thật.</p>
      <button class="profile-logout" type="button" data-profile-logout>Đăng xuất</button>
    `;
    document.body.append(dialog);

    const applyDensity = () => {
      const app = $(".app");
      if (app)
        app.dataset.density = settings.compact ? "compact" : "comfortable";
    };
    const initialsOf = (name) => {
      const parts = String(name || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      if (parts.length === 0) return "PP";
      return `${parts[0][0]}${parts.length > 1 ? parts[parts.length - 1][0] : parts[0][1] || ""}`.toUpperCase();
    };
    const applyProfileName = (name) => {
      if (!name) return;
      const sidebarName = $(".user strong");
      if (sidebarName) sidebarName.textContent = name;
      $("[data-profile-name]", dialog).textContent = name;
      $(".profile-avatar", dialog).textContent = initialsOf(name);
    };
    const updatePreference = (input) => {
      settings[input.dataset.setting] = input.checked;
      write("profileSettings", settings);
      applyDensity();
      const note = $(".profile-drawer__note", dialog);
      note.textContent =
        input.dataset.setting === "notifications"
          ? `Thông báo trong ứng dụng đã ${input.checked ? "bật" : "tắt"}. Tùy chọn được lưu trên thiết bị này.`
          : `Giao diện gọn đã ${input.checked ? "bật" : "tắt"}. Tùy chọn được lưu trên thiết bị này.`;
    };
    $$("[data-setting]", dialog).forEach((input) => {
      input.checked = settings[input.dataset.setting] === true;
      input.addEventListener("change", () => updatePreference(input));
    });
    applyDensity();
    applyProfileName(profileName || "Minh Anh");
    $("[data-profile-role]", dialog).textContent = roleLabels[role];
    $("[data-profile-email]", dialog).textContent = profileDefaults[role].email;
    $("[data-profile-phone]", dialog).textContent = profileDefaults[role].phone;
    window.addEventListener("storage", (event) => {
      if (event.key !== `parcelpulse.${profileKey}` || !event.newValue) return;
      const updatedProfile = JSON.parse(event.newValue);
      applyProfileName(updatedProfile.name);
    });

    const profileCard = $(".user");
    if (profileCard) {
      profileCard.setAttribute("role", "button");
      profileCard.setAttribute("tabindex", "0");
      profileCard.setAttribute("aria-label", "Mở hồ sơ và cài đặt");
    }
    const openDialog = () => {
      dialog.showModal();
      requestAnimationFrame(() => dialog.classList.add("is-open"));
      $("[data-close-profile]", dialog).focus();
    };
    const closeDialog = () => {
      dialog.classList.remove("is-open");
      dialog.close();
    };
    settingsTrigger?.addEventListener("click", openDialog);
    profileCard?.addEventListener("click", openDialog);
    profileCard?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDialog();
      }
    });
    $("[data-close-profile]", dialog).addEventListener("click", closeDialog);
    dialog.addEventListener("close", () => dialog.classList.remove("is-open"));
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog();
      }
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog();
    });
    $("[data-profile-logout]", dialog).addEventListener("click", () => {
      localStorage.removeItem("parcelpulse.demoSession");
      window.location.href = "login.html";
    });
  }
});
