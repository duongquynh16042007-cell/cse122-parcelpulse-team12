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
  window.ParcelPulseRolePages = Object.freeze({
    $,
    $$,
    read,
    write,
    toast,
    announce,
  });

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
        <div><h2 id="ai-chat-title">Trợ lý AI ParcelPulse</h2><p><span></span>Đang trực tuyến · mô phỏng cục bộ</p></div>
        <button class="ai-chat__close" type="button" aria-label="Đóng trợ lý AI">×</button>
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
          <label class="sr-only" for="ai-chat-input">Nhập câu hỏi cho trợ lý</label>
          <textarea id="ai-chat-input" rows="1" maxlength="500" placeholder="Hỏi trợ lý: khi nào đơn đến, vì sao trễ..." required></textarea>
          <button type="submit" aria-label="Gửi tin nhắn">➤</button>
        </form>
      </div>
    `;
    $(".ai-chat__bubble--assistant", chat).textContent =
      `Xin chào ${profileName}! Mình là trợ lý AI của ParcelPulse. Mình có thể giải thích ETA, phân loại ngoại lệ và gợi ý hành động tiếp theo dựa trên dữ liệu mẫu trong phiên này.`;
    const launcher = document.createElement("button");
    launcher.className = "ai-chat-launcher";
    launcher.type = "button";
    launcher.setAttribute("aria-haspopup", "dialog");
    launcher.setAttribute("aria-label", "Mở Trợ lý AI");
    launcher.innerHTML = '<span aria-hidden="true">✦</span> Trợ lý AI';
    document.body.append(chat, launcher);

