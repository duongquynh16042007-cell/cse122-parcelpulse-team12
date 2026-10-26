/* Shared, local-only interactions for all role screens. */
const rolePagesScriptUrl = document.currentScript && document.currentScript.src;
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
  window.ParcelPulseRolePages = Object.freeze({
    $,
    $$,
    read,
    write,
    toast,
    announce,
  });
  const assistantScript = document.createElement("script");
  assistantScript.src = new URL(
    "pulse-ai.js",
    rolePagesScriptUrl || document.baseURI,
  ).href;
  assistantScript.async = true;
  assistantScript.dataset.parcelpulseAssistant = "true";
  document.head.append(assistantScript);

  const assistantRoleElement = $(".role-chip");
  if (assistantRoleElement) {
    const roleLabels = {
      recipient: "Người nhận",
      driver: "Nhân viên giao hàng",
      dispatcher: "Điều phối viên",
      admin: "Quản trị viên",
    };
    const accountByLabel = Object.fromEntries(
      Object.entries(roleLabels).map(([role, label]) => [label, role]),
    );
    const role =
      accountByLabel[assistantRoleElement.textContent.trim()] || "recipient";
    const profile = read(`profile.${role}`, {});
    const session = read("demoSession", null);
    const profileName =
      profile.name ||
      (session?.role === role
        ? session.name
        : $(".user strong")?.textContent.trim()) ||
      "bạn";
    const chat = document.createElement("dialog");
    chat.className = "ai-chat";
    chat.setAttribute("aria-labelledby", "ai-chat-title");
    chat.innerHTML = `
      <header class="ai-chat__header">
        <span class="ai-chat__sparkle" aria-hidden="true">✦</span>
        <div><h2 id="ai-chat-title">pulse-ai · ParcelPulse</h2><p><span></span>Đang trực tuyến · mô phỏng cục bộ</p></div>
        <button class="ai-chat__close" type="button" aria-label="Đóng pulse-ai">×</button>
      </header>
      <div class="ai-chat__messages" role="log" aria-live="polite" aria-relevant="additions">
        <p class="ai-chat__bubble ai-chat__bubble--assistant"></p>
      </div>
      <div class="ai-chat__composer">
        <div class="ai-chat__suggestions" aria-label="Câu hỏi gợi ý">
          <button type="button" data-ai-prompt="Giải thích ETA">Giải thích ETA</button>
          <button type="button" data-ai-prompt="Phân loại ngoại lệ">Phân loại ngoại lệ</button>
          <button type="button" data-ai-prompt="Hành động tiếp theo">Hành động tiếp theo</button>
        </div>
        <form class="ai-chat__form">
          <label class="sr-only" for="ai-chat-input">Nhập câu hỏi cho pulse-ai</label>
          <textarea id="ai-chat-input" rows="1" maxlength="500" placeholder="Hỏi pulse-ai: khi nào đơn đến, vì sao trễ..." required></textarea>
          <button type="submit" aria-label="Gửi tin nhắn">➤</button>
        </form>
      </div>
    `;
    $(".ai-chat__bubble--assistant", chat).textContent =
      `Xin chào ${profileName}! Mình là pulse-ai của ParcelPulse. Mình có thể giải thích ETA, phân loại ngoại lệ và gợi ý hành động tiếp theo dựa trên dữ liệu mẫu trong phiên này.`;
    const launcher = document.createElement("button");
    launcher.className = "ai-chat-launcher";
    launcher.type = "button";
    launcher.setAttribute("aria-haspopup", "dialog");
    launcher.setAttribute("aria-label", "Mở pulse-ai");
    launcher.innerHTML = '<span aria-hidden="true">✦</span> pulse-ai';
    document.body.append(chat, launcher);

    const messages = $(".ai-chat__messages", chat);
    const input = $("#ai-chat-input", chat);
    const closeChat = () => {
      chat.close();
      launcher.focus();
    };
    const addMessage = (text, type) => {
      const bubble = document.createElement("p");
      bubble.className = `ai-chat__bubble ai-chat__bubble--${type}`;
      bubble.textContent = text;
      messages.append(bubble);
      messages.scrollTop = messages.scrollHeight;
    };
    const replyTo = (question) => {
      const normalized = question.toLocaleLowerCase("vi");
      if (
        normalized.includes("eta") ||
        normalized.includes("đến") ||
        normalized.includes("trễ")
      ) {
        if (role === "recipient") {
          return "Kiện mẫu PPVN-4829-1024 đang được giao, ETA hiển thị là 14:10–14:35. Đây là khoảng thời gian ước tính trên trang, có thể thay đổi theo tiến trình thực tế; bản demo không nhận dữ liệu giao thông trực tiếp.";
        }
        return "ETA phụ thuộc vào tiến trình tuyến và thông tin mới nhất của kiện. Hãy kiểm tra mã kiện và cập nhật trên trang điều hành; trợ lý demo không kết nối dữ liệu vị trí trực tiếp.";
      }
      if (
        normalized.includes("ngoại lệ") ||
        normalized.includes("phân loại") ||
        normalized.includes("không liên hệ") ||
        normalized.includes("địa chỉ")
      ) {
        const note =
          $("#exception-note")?.value.trim().toLocaleLowerCase("vi") || "";
        const selectedException =
          role === "dispatcher" ? $('#ex-body tr[aria-current="true"]') : null;
        const suggestions = [
          [
            "Không liên hệ được",
            ["không nghe", "không liên lạc", "không liên hệ", "không gọi"],
          ],
          ["Địa chỉ không hợp lệ", ["địa chỉ", "sai số nhà", "không tìm thấy"]],
          ["Khách đổi lịch", ["đổi lịch", "hẹn lại", "ngày mai"]],
          ["Kiện hàng hư hỏng", ["hư", "móp", "vỡ", "ướt"]],
          ["Xe gặp sự cố", ["xe", "lốp", "hỏng", "cứu hộ"]],
        ];
        if (selectedException) {
          const id = $("strong", selectedException)?.textContent.trim();
          const type = $(".t-type", selectedException)?.textContent.trim();
          return `Ngoại lệ ${id} hiện được ghi nhận là “${type}”. Hãy mở chi tiết để kiểm tra ghi chú và xác nhận hoặc sửa loại thủ công.`;
        }
        if (note.length >= 12) {
          const match = suggestions.find(([, terms]) =>
            terms.some((term) => note.includes(term)),
          );
          if (match)
            return `Theo mô tả hiện tại, có thể cân nhắc loại “${match[0]}”. Đây chỉ là gợi ý mô phỏng; vui lòng kiểm tra hiện trường và xác nhận thủ công trước khi gửi.`;
          return "Mô tả hiện tại chưa đủ dấu hiệu để gợi ý một loại ngoại lệ. Hãy bổ sung sự việc, thời điểm và cách liên hệ đã thử, hoặc tự chọn loại phù hợp.";
        }
        return "Hãy ghi rõ sự việc, thời điểm và cách xử lý đã thử trong phần mô tả ngoại lệ. Trợ lý chỉ đưa gợi ý để bạn kiểm tra, không tự gửi hay xác nhận ngoại lệ.";
      }
      if (
        normalized.includes("hành động") ||
        normalized.includes("tiếp theo") ||
        normalized.includes("nên làm") ||
        normalized.includes("làm gì")
      ) {
        if (role === "recipient") {
          return "Bạn có thể xem lịch sử hành trình để kiểm tra cập nhật gần nhất. Nếu cần đổi cách nhận, hãy cập nhật tùy chọn giao trước thời hạn hiển thị trên trang.";
        }
        if (role === "driver") {
          return "Hãy kiểm tra mã kiện và điểm giao, ghi nhận đầy đủ tình huống nếu có ngoại lệ, rồi xác nhận thông tin trước khi gửi cho điều phối viên.";
        }
        if (role === "dispatcher") {
          return "Ưu tiên các ngoại lệ đang cần xử lý, xác minh thông tin kiện và tài xế, sau đó cập nhật quyết định trên trang điều hành.";
        }
        return "Kiểm tra thông tin và trạng thái trên trang quản trị trước khi thực hiện thay đổi. Các dữ liệu hiện tại chỉ là dữ liệu mẫu.";
      }
      return "Mình có thể hỗ trợ giải thích ETA, gợi ý phân loại ngoại lệ hoặc đề xuất bước tiếp theo. Đây là mô phỏng cục bộ, không kết nối dịch vụ AI hay dữ liệu trực tiếp.";
    };

    launcher.addEventListener("click", () => {
      chat.showModal();
      input.focus();
    });
    $(".ai-chat__close", chat).addEventListener("click", closeChat);
    chat.addEventListener("click", (event) => {
      if (event.target === chat) closeChat();
    });
    $$("[data-ai-prompt]", chat).forEach((button) => {
      button.addEventListener("click", () => {
        const prompt = button.dataset.aiPrompt;
        addMessage(prompt, "user");
        addMessage(replyTo(prompt), "assistant");
      });
    });
    $(".ai-chat__form", chat).addEventListener("submit", (event) => {
      event.preventDefault();
      const question = input.value.trim();
      if (!question) return;
      addMessage(question, "user");
      addMessage(replyTo(question), "assistant");
      input.value = "";
      input.focus();
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        $(".ai-chat__form", chat).requestSubmit();
      }
    });
    chat.addEventListener("close", () => launcher.focus());
  }

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
