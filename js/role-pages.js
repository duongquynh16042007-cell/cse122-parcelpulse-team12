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
