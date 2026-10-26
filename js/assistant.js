/* ParcelPulse pulse-ai demo.
   Local rule-based assistance only; no remote AI model or API is called. */
(() => {
  "use strict";

  const assistantScriptUrl =
    document.currentScript && document.currentScript.src;
  if (assistantScriptUrl && document.head) {
    const cssUrl = new URL("../css/assistant.css", assistantScriptUrl).href;
    const exists = Array.from(
      document.querySelectorAll('link[rel="stylesheet"]'),
    ).some((link) => link.href === cssUrl);
    if (!exists) {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = cssUrl;
      document.head.append(css);
    }
  }
  const initialize = () => {
    if (document.querySelector("[data-copilot-root]")) return;
    document.querySelector(".ai-chat")?.remove();
    document.querySelector(".ai-chat-launcher")?.remove();

    const roleName =
      document.querySelector(".role-chip")?.textContent.trim() || "ParcelPulse";
    const pageName = window.location.pathname.split("/").pop() || "";
    const supportedRole = [
      "Điều phối viên",
      "Quản trị viên",
      "Nhân viên giao hàng",
      "Tài xế",
    ].includes(roleName);
    if (!supportedRole) return;
    const launcher = document.createElement("button");
    launcher.className = "copilot-launcher";
    launcher.type = "button";
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-controls", "copilot-panel");
    launcher.innerHTML = '<span aria-hidden="true">✦</span> pulse-ai';

    const panel = document.createElement("section");
    panel.className = "copilot-panel";
    panel.id = "copilot-panel";
    panel.dataset.copilotRoot = "true";
    panel.dataset.role = roleName.includes("Điều phối")
      ? "dispatcher"
      : roleName.includes("Quản trị")
        ? "admin"
        : "driver";
    panel.hidden = true;
    panel.setAttribute("aria-label", "pulse-ai vận hành ParcelPulse");
    panel.innerHTML = `
      <header class="copilot-header">
        <div class="copilot-mark" aria-hidden="true">✦</div>
        <div class="copilot-heading">
          <strong>pulse-ai</strong>
          <span>Tính năng AI số 3 · ${escapeHTML(roleName)} · demo</span>
        </div>
        <button class="copilot-close" type="button" aria-label="Đóng trợ lý">×</button>
      </header>
      <p class="copilot-disclaimer">pulse-ai phân tích dữ liệu mẫu bằng quy tắc cục bộ, chưa kết nối mô hình AI/API. Hãy xem lại đề xuất trước khi duyệt.</p>
      <div class="copilot-mode-switch" role="tablist" aria-label="Chế độ pulse-ai">
        <button type="button" role="tab" aria-selected="true" class="is-active" data-ai-mode="chat">Trợ lý vận hành</button>
        <button type="button" role="tab" aria-selected="false" data-ai-mode="exception">Ngoại lệ · NBA</button>
        <button id="eta-mode-tab" type="button" role="tab" aria-selected="false" data-ai-mode="eta">AI-2 · Giải thích ETA</button>
      </div>
      <div class="copilot-workspace">
        <div class="copilot-chat-view" id="copilot-chat-view">
          <div class="copilot-messages" id="copilot-messages" role="log" aria-live="polite" aria-relevant="additions text"></div>
          <div class="copilot-quick-actions" aria-label="Câu lệnh gợi ý">
            <button type="button" data-copilot-prompt="Phân tích màn hình này">Phân tích màn hình</button>
            <button type="button" data-copilot-prompt="Tìm việc cần duyệt">Tìm việc cần duyệt</button>
            <button type="button" data-copilot-prompt="Giải thích ETA">Giải thích ETA</button>
            <button type="button" data-copilot-mode="exception" data-exception-task="classify">Phân loại ghi chú</button>
            <button type="button" data-copilot-mode="exception" data-exception-task="action">Gợi ý hành động</button>
          </div>
          <form class="copilot-form" id="copilot-form">
            <label class="sr-only" for="copilot-input">Hỏi pulse-ai</label>
            <input id="copilot-input" name="prompt" maxlength="240" autocomplete="off" placeholder="Hỏi về việc cần xử lý..." />
            <button type="submit" aria-label="Gửi câu hỏi">Gửi</button>
          </form>
        </div>
        <section class="exception-workflow" id="exception-workflow" role="tabpanel" aria-label="Phân loại ngoại lệ và gợi ý hành động" hidden>
          <div class="exception-workflow-scroll">
            <div class="eta-title-row"><div><p class="eta-eyebrow">AI-1 · EXCEPTION CLASSIFIER / NEXT BEST ACTION</p><h2 data-ex-title>Phân loại ngoại lệ</h2></div><span class="eta-mock-badge">Mô phỏng cục bộ</span></div>
            <p class="eta-intro">Nhập ghi chú hoặc chọn ngoại lệ để pulse-ai phân loại và đề xuất bước xử lý.</p>
            <div class="exception-task-tabs" role="tablist" aria-label="Chọn tính năng ngoại lệ"><button type="button" class="is-active" aria-selected="true" data-ex-task="classify">Exception Classifier</button><button type="button" aria-selected="false" data-ex-task="action">Next Best Action</button></div>
            <section class="exception-input-card"><h3>Thông tin đầu vào</h3><form class="exception-input-form" id="exception-ai-form">
              <div class="exception-field-grid"><label data-ex-scope-label>Phạm vi<select id="ex-scope" name="scope"></select></label><label>Loại ngoại lệ<select id="ex-category" name="category"></select></label><label class="ex-full">Ghi chú tình huống<textarea id="ex-note" name="note" rows="3" maxlength="400" placeholder="Mô tả việc đã xảy ra, thời điểm và các liên hệ đã thử."></textarea></label></div>
              <p class="ex-help" data-ex-help>Dấu hiệu trong ghi chú được đối chiếu với các loại ngoại lệ mẫu.</p>
              <div class="ex-demo-actions"><button type="button" data-ex-demo="missing">Ca thiếu dữ liệu</button><button type="button" data-ex-demo="conflict">Ca mâu thuẫn</button></div>
              <div class="ex-form-actions"><small>Dữ liệu demo được lưu cục bộ trên thiết bị này.</small><button class="copilot-action" type="submit" data-ex-analyze>Phân tích</button></div>
            </form></section>
            <div class="exception-processing" id="ex-processing" role="status" aria-live="polite" hidden><span class="eta-spinner" aria-hidden="true"></span><span data-ex-progress>Đang đọc ghi chú...</span></div>
            <section class="exception-result" id="ex-result" aria-live="polite" hidden>
              <div class="ex-result-head"><div><p class="eta-eyebrow" data-ex-kind>EXCEPTION CLASSIFIER</p><h3 data-ex-result-title></h3></div><span class="ex-confidence" data-ex-confidence></span></div>
              <p class="ex-result-summary" data-ex-summary></p><ol class="ex-plan" data-ex-plan hidden></ol>
              <p class="ex-warning" data-ex-warning hidden></p>
              <div class="ex-low-actions" data-ex-low-actions hidden><strong>Cần thêm thông tin hoặc chuyên viên xác nhận</strong><div><button type="button" data-ex-supplement>Bổ sung thông tin</button><button type="button" data-ex-retry>Thử lại</button><button type="button" data-ex-manual>Chuyển sang nhập thủ công</button></div></div>
              <div class="ex-controls" aria-label="Quyết định với đề xuất"><button class="copilot-action" type="button" data-ex-accept>Chấp nhận</button><button class="copilot-action copilot-action--secondary" type="button" data-ex-reject>Từ chối</button><button class="copilot-action copilot-action--secondary" type="button" data-ex-regenerate>Tạo lại</button><button class="copilot-action copilot-action--secondary" type="button" data-ex-save>Lưu</button></div><p class="ex-status" data-ex-status role="status" aria-live="polite"></p>
            </section>
            <section class="exception-history"><div class="eta-title-row"><h3>Đề xuất đã lưu</h3><span data-ex-history-count>0</span></div><ul class="ex-history-list" data-ex-history></ul></section><p class="eta-disclaimer">Phân loại và Next Best Action dùng quy tắc JavaScript, không gọi API LLM. Hãy kiểm tra mọi kết quả trước khi áp dụng.</p>
          </div>
        </section>
        <section class="eta-workflow" id="eta-workflow" role="tabpanel" aria-labelledby="eta-mode-tab" hidden>
          <div class="eta-workflow-scroll">
            <div class="eta-title-row"><div><p class="eta-eyebrow">AI-2 · ETA EXPLAINABILITY</p><h2>Ước tính thời gian đến</h2></div><span class="eta-mock-badge">Mô phỏng</span></div>
            <p class="eta-intro">Nhập thông tin tuyến. pulse-ai sẽ tính ETA theo quy tắc mẫu và nêu rõ yếu tố ảnh hưởng.</p>
            <form class="eta-input-form" id="eta-input-form">
              <label>Mã kiện<input id="eta-parcel-id" name="parcelId" value="PPVN-4829-1024" maxlength="32" required /></label>
              <div class="eta-field-grid">
                <label>Quãng đường (km)<input id="eta-distance" name="distanceKm" type="number" min="0.1" max="500" step="0.1" required /></label>
                <label>Trạng thái kiện<select id="eta-status" name="status"><option value="out_for_delivery">Đang giao</option><option value="sorting">Đang phân loại</option><option value="handoff">Chờ bàn giao</option></select></label>
                <label>Tình hình giao thông<select id="eta-traffic" name="traffic"><option value="low">Thông thoáng</option><option value="medium">Đông vừa</option><option value="high">Ùn tắc</option></select></label>
                <label>Thời tiết<select id="eta-weather" name="weather"><option value="clear">Trời khô ráo</option><option value="rain">Mưa</option><option value="storm">Mưa lớn</option></select></label>
                <label class="eta-full-field">Tải tuyến<select id="eta-load" name="routeLoad"><option value="low">Thấp</option><option value="medium">Vừa</option><option value="high">Cao</option></select></label>
              </div>
              <div class="eta-form-actions"><button class="copilot-action copilot-action--secondary" id="eta-use-sample" type="button">Nạp mẫu JSON</button><button class="copilot-action" type="submit">Phân tích ETA</button></div>
              <details class="eta-json-details"><summary>Xem JSON giả lập được dùng</summary><pre id="eta-json-preview">Chọn “Nạp mẫu JSON” để xem dữ liệu mẫu.</pre></details>
            </form>
            <div class="eta-processing" id="eta-processing" role="status" aria-live="polite" hidden><span class="eta-spinner" aria-hidden="true"></span><span>Đang xử lý dữ liệu tuyến và tính ETA...</span></div>
            <section class="eta-result" id="eta-result" aria-live="polite" hidden>
              <div class="eta-result-heading"><div><p class="eta-eyebrow">KẾT QUẢ ĐỀ XUẤT</p><strong id="eta-result-time">--:--</strong></div><span id="eta-confidence" class="eta-confidence"></span></div>
              <p class="eta-result-copy" id="eta-result-summary"></p>
              <h3>Yếu tố ảnh hưởng</h3><ul class="eta-reason-list" id="eta-reasons"></ul>
              <p class="eta-decision" id="eta-decision" role="status" aria-live="polite" hidden></p>
              <div class="eta-decision-actions" aria-label="Xử lý kết quả ETA">
                <button class="copilot-action" id="eta-accept" type="button">Chấp nhận</button>
                <button class="copilot-action copilot-action--secondary" id="eta-reject" type="button">Từ chối</button>
                <button class="copilot-action copilot-action--secondary" id="eta-regenerate" type="button">Tạo lại</button>
                <button class="copilot-action copilot-action--secondary" id="eta-save" type="button">Lưu</button>
              </div>
            </section>
            <p class="eta-disclaimer">ETA chỉ là ước tính từ JSON giả lập và quy tắc JavaScript; không dùng GPS, dữ liệu giao thông trực tiếp hoặc API thật.</p>
          </div>
        </section>
      </div>`;

    document.body.append(launcher, panel);

    const messages = panel.querySelector("#copilot-messages");
    const input = panel.querySelector("#copilot-input");
    const form = panel.querySelector("#copilot-form");
    const closeButton = panel.querySelector(".copilot-close");
    const chatView = panel.querySelector("#copilot-chat-view");
    const etaView = panel.querySelector("#eta-workflow");
    const exceptionView = panel.querySelector("#exception-workflow");
    const etaForm = panel.querySelector("#eta-input-form");
    const etaResult = panel.querySelector("#eta-result");
    const etaProcessing = panel.querySelector("#eta-processing");
    const exForm = panel.querySelector("#exception-ai-form");
    const exScope = panel.querySelector("#ex-scope");
    const exCategory = panel.querySelector("#ex-category");
    const exNote = panel.querySelector("#ex-note");
    const exResult = panel.querySelector("#ex-result");
    const exProcessing = panel.querySelector("#ex-processing");
    let currentException = null;
    let exceptionTask = "classify";
    let exceptionRevision = 0;
    let lastExceptionInputSignature = "";
    let exceptionPlanRegeneration = 0;

    const etaSamples = {
      "PPVN-4829-1024": {
        parcelId: "PPVN-4829-1024",
        distanceKm: 8.4,
        status: "out_for_delivery",
        traffic: "medium",
        weather: "rain",
        routeLoad: "medium",
      },
      "PPVN-7730-3308": {
        parcelId: "PPVN-7730-3308",
        distanceKm: 17.2,
        status: "sorting",
        traffic: "high",
        weather: "clear",
        routeLoad: "high",
      },
    };
    const etaFieldNames = {
      status: {
        out_for_delivery: "Đang giao",
        sorting: "Đang phân loại",
        handoff: "Chờ bàn giao",
      },
      traffic: { low: "Thông thoáng", medium: "Đông vừa", high: "Ùn tắc" },
      weather: { clear: "Trời khô ráo", rain: "Mưa", storm: "Mưa lớn" },
      routeLoad: { low: "Thấp", medium: "Vừa", high: "Cao" },
    };
    let currentEta = null;
    let etaRevision = 0;
    let etaTimer = null;

    function openPanel() {
      panel.hidden = false;
      launcher.setAttribute("aria-expanded", "true");
      input.focus();
    }

    function closePanel() {
      panel.hidden = true;
      launcher.setAttribute("aria-expanded", "false");
      launcher.focus();
    }

    launcher.addEventListener("click", () =>
      panel.hidden ? openPanel() : closePanel(),
    );
    closeButton.addEventListener("click", closePanel);
    panel.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closePanel();
    });

    function addMessage(kind, text, actions = []) {
      const message = document.createElement("article");
      message.className = `copilot-message copilot-message--${kind}`;
      const content = document.createElement("p");
      content.textContent = text;
      message.append(content);

      if (actions.length) {
        const actionList = document.createElement("div");
        actionList.className = "copilot-actions";
        actions.forEach(({ label, run }) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "copilot-action copilot-action--secondary";
          button.textContent = label;
          button.addEventListener("click", run);
          actionList.append(button);
        });
        message.append(actionList);
      }

      messages.append(message);
      messages.scrollTop = messages.scrollHeight;
    }

    function readLocal(key, fallback) {
      try {
        const value = localStorage.getItem(`parcelpulse.${key}`);
        return value === null ? fallback : JSON.parse(value);
      } catch {
        return fallback;
      }
    }

    function setAiMode(mode) {
      const showEta = mode === "eta";
      const showException = mode === "exception";
      chatView.hidden = showEta || showException;
      etaView.hidden = !showEta;
      exceptionView.hidden = !showException;
      panel.querySelectorAll("[data-ai-mode]").forEach((button) => {
        const selected = button.dataset.aiMode === mode;
        button.setAttribute("aria-selected", String(selected));
        button.classList.toggle("is-active", selected);
      });
      if (showEta) {
        if (!etaForm.dataset.initialized) {
          loadEtaSample();
          etaForm.dataset.initialized = "true";
        }
        panel.querySelector("#eta-parcel-id").focus();
      } else if (showException) {
        exNote.focus();
      } else {
        input.focus();
      }
    }
    function loadEtaSample() {
      const parcelId = panel
        .querySelector("#eta-parcel-id")
        .value.trim()
        .toUpperCase();
      const sample = etaSamples[parcelId];
      const notice = panel.querySelector("#eta-decision");
      if (!sample) {
        notice.hidden = false;
        notice.textContent =
          "Không có mã này trong JSON mẫu. Nhập các thông tin tuyến thủ công rồi bấm Phân tích ETA.";
        return;
      }
      Object.entries(sample).forEach(([key, value]) => {
        const field = etaForm.elements.namedItem(key);
        if (field) field.value = value;
      });
      panel.querySelector("#eta-json-preview").textContent = JSON.stringify(
        sample,
        null,
        2,
      );
      notice.hidden = false;
      notice.textContent = `Đã nạp JSON mẫu cho ${sample.parcelId}. Bạn có thể sửa dữ liệu trước khi phân tích.`;
    }

    function readEtaInputs() {
      return {
        parcelId: panel
          .querySelector("#eta-parcel-id")
          .value.trim()
          .toUpperCase(),
        distanceKm: Number(panel.querySelector("#eta-distance").value),
        status: panel.querySelector("#eta-status").value,
        traffic: panel.querySelector("#eta-traffic").value,
        weather: panel.querySelector("#eta-weather").value,
        routeLoad: panel.querySelector("#eta-load").value,
      };
    }

    function calculateEta(input) {
      const driveMinutes = Math.ceil((input.distanceKm / 25) * 60);
      const trafficMinutes = { low: 0, medium: 8, high: 20 }[input.traffic];
      const weatherMinutes = { clear: 0, rain: 10, storm: 24 }[input.weather];
      const loadMinutes = { low: 0, medium: 8, high: 16 }[input.routeLoad];
      const statusMinutes = { out_for_delivery: 0, sorting: 12, handoff: 5 }[
        input.status
      ];
      const retryMinutes = etaRevision ? (etaRevision % 3) * 2 : 0;
      const totalMinutes =
        driveMinutes +
        trafficMinutes +
        weatherMinutes +
        loadMinutes +
        statusMinutes +
        retryMinutes;
      const arrival = new Date(Date.now() + totalMinutes * 60_000);
      const etaTime = new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(arrival);
      const confidence = Math.max(
        65,
        92 - (input.distanceKm > 80 ? 14 : input.distanceKm > 40 ? 8 : 0),
      );

      return {
        id: `ETA-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        parcelId: input.parcelId,
        input,
        etaTime,
        totalMinutes,
        confidence,
        decision: "pending",
        reasons: [
          [
            "Thời gian di chuyển",
            `${input.distanceKm} km, giả định tốc độ trung bình 25 km/h`,
            driveMinutes,
          ],
          ["Giao thông", etaFieldNames.traffic[input.traffic], trafficMinutes],
          ["Thời tiết", etaFieldNames.weather[input.weather], weatherMinutes],
          ["Tải tuyến", etaFieldNames.routeLoad[input.routeLoad], loadMinutes],
          [
            "Trạng thái kiện",
            etaFieldNames.status[input.status],
            statusMinutes,
          ],
          ...(retryMinutes
            ? [
                [
                  "Điều chỉnh khi tạo lại",
                  "Biên độ mô phỏng của lần chạy lại",
                  retryMinutes,
                ],
              ]
            : []),
        ],
        createdAt: new Date().toISOString(),
      };
    }

    function renderEtaResult() {
      if (!currentEta) return;
      panel.querySelector("#eta-result-time").textContent = currentEta.etaTime;
      panel.querySelector("#eta-confidence").textContent =
        `Tin cậy mô phỏng ${currentEta.confidence}%`;
      panel.querySelector("#eta-result-summary").textContent =
        `Kiện ${currentEta.parcelId} dự kiến đến lúc ${currentEta.etaTime} (khoảng ${currentEta.totalMinutes} phút từ thời điểm phân tích).`;
      const reasons = panel.querySelector("#eta-reasons");
      reasons.replaceChildren();
      currentEta.reasons.forEach(([title, description, minutes]) => {
        const item = document.createElement("li");
        const strong = document.createElement("strong");
        strong.textContent = `${title}: `;
        const detail = document.createElement("span");
        detail.textContent = `${description} · +${minutes} phút`;
        item.append(strong, detail);
        reasons.append(item);
      });
      const decision = panel.querySelector("#eta-decision");
      decision.hidden = !currentEta.decisionMessage;
      decision.textContent = currentEta.decisionMessage || "";
      etaResult.hidden = false;
    }

    function runEtaAnalysis() {
      if (!etaForm.reportValidity()) return;
      window.clearTimeout(etaTimer);
      const input = readEtaInputs();
      etaResult.hidden = true;
      etaProcessing.hidden = false;
      etaProcessing.setAttribute("aria-busy", "true");
      etaForm.querySelector('[type="submit"]').disabled = true;
      etaTimer = window.setTimeout(() => {
        currentEta = calculateEta(input);
        etaProcessing.hidden = true;
        etaProcessing.removeAttribute("aria-busy");
        etaForm.querySelector('[type="submit"]').disabled = false;
        renderEtaResult();
      }, 650);
    }

    function persistEta(message) {
      if (!currentEta) return;
      currentEta.decisionMessage = message;
      const saved = readLocal("etaEstimates", []);
      const estimates = Array.isArray(saved) ? saved : [];
      const index = estimates.findIndex((item) => item.id === currentEta.id);
      if (index >= 0) estimates[index] = currentEta;
      else estimates.unshift(currentEta);
      try {
        localStorage.setItem(
          "parcelpulse.etaEstimates",
          JSON.stringify(estimates.slice(0, 100)),
        );
        renderEtaResult();
      } catch {
        currentEta.decisionMessage =
          "Không lưu được trên thiết bị này. Kiểm tra quyền lưu localStorage.";
        renderEtaResult();
      }
    }

    panel.querySelectorAll("[data-ai-mode]").forEach((button) => {
      button.addEventListener("click", () => setAiMode(button.dataset.aiMode));
    });
    panel
      .querySelector("#eta-use-sample")
      .addEventListener("click", loadEtaSample);
    etaForm.addEventListener("submit", (event) => {
      event.preventDefault();
      etaRevision = 0;
      runEtaAnalysis();
    });
    panel.querySelector("#eta-accept").addEventListener("click", () => {
      if (
        !currentEta ||
        !window.confirm(
          `Chấp nhận ETA ${currentEta.etaTime} cho kiện ${currentEta.parcelId}?`,
        )
      )
        return;
      currentEta.decision = "accepted";
      currentEta.acceptedAt = new Date().toISOString();
      persistEta(`Đã chấp nhận ETA ${currentEta.etaTime} trong dữ liệu demo.`);
    });
    panel.querySelector("#eta-reject").addEventListener("click", () => {
      if (
        !currentEta ||
        !window.confirm(`Từ chối đề xuất ETA cho kiện ${currentEta.parcelId}?`)
      )
        return;
      currentEta.decision = "rejected";
      currentEta.rejectedAt = new Date().toISOString();
      persistEta("Đã từ chối đề xuất trong dữ liệu demo.");
    });
    panel.querySelector("#eta-regenerate").addEventListener("click", () => {
      if (!currentEta) return;
      etaRevision += 1;
      runEtaAnalysis();
    });
    panel.querySelector("#eta-save").addEventListener("click", () => {
      if (!currentEta) return;
      currentEta.savedAt = new Date().toISOString();
      persistEta("Đã lưu kết quả ETA vào localStorage của trình duyệt này.");
    });

    const exceptionTypes = [
      {
        label: "Không liên hệ được",
        words: [
          "khong nghe may",
          "khong bat may",
          "khong lien he",
          "khong lien lac",
          "tat may",
          "khong tra loi",
          "chua nghe may",
        ],
      },
      {
        label: "Địa chỉ không hợp lệ",
        words: [
          "dia chi sai",
          "sai dia chi",
          "dia chi",
          "sai so nha",
          "thieu so nha",
          "khong tim thay dia chi",
        ],
      },
      {
        label: "Khách đổi lịch",
        words: [
          "doi lich",
          "doi ngay",
          "hen lai",
          "ngay mai",
          "giao lai",
          "doi thoi gian",
        ],
      },
      {
        label: "Kiện hàng hư hỏng",
        words: [
          "hu hong",
          "mop",
          "vo kien",
          "be vo",
          "bi rach",
          "bi uot",
          "thung rach",
        ],
      },
      {
        label: "Xe gặp sự cố",
        words: [
          "xe gap su co",
          "hong xe",
          "lo lop",
          "no lop",
          "chet may",
          "cuu ho",
          "tai nan",
        ],
      },
      { label: "Loại khác", words: [] },
    ];
    const exceptionActions = {
      "Không liên hệ được": [
        "Gọi lại sau 5–10 phút và ghi thời điểm/kết quả.",
        "Nếu vẫn không liên lạc được, báo Điều hành để chốt lần giao tiếp theo.",
        "Giữ kiện hàng an toàn; không để hàng ngoài cửa khi chưa xác nhận.",
      ],
      "Địa chỉ không hợp lệ": [
        "Tạm dừng giao và xác minh địa chỉ với người nhận.",
        "Đối chiếu số nhà, tòa nhà và hướng dẫn vào khu vực.",
        "Báo Điều hành nếu cần cập nhật địa chỉ hoặc đổi lộ trình.",
      ],
      "Khách đổi lịch": [
        "Xác nhận ngày và khung giờ giao mới.",
        "Ghi nội dung hẹn và cập nhật kế hoạch giao.",
        "Giữ kiện hàng theo quy trình trong lúc chờ lịch mới.",
      ],
      "Kiện hàng hư hỏng": [
        "Tạm dừng bàn giao và chụp ảnh hiện trạng.",
        "Giữ nguyên bao bì; không mở hoặc tự sửa kiện.",
        "Báo Điều hành để quyết định hướng xử lý.",
      ],
      "Xe gặp sự cố": [
        "Dừng xe ở vị trí an toàn và báo Điều hành.",
        "Gọi hỗ trợ phương tiện theo quy trình.",
        "Cập nhật ETA hoặc đề nghị đổi tài xế nếu tuyến bị ảnh hưởng.",
      ],
      "Loại khác": [
        "Ghi sự việc, thời điểm và các bước đã thử.",
        "Liên hệ Điều hành để xác nhận cách xử lý.",
        "Chờ xác nhận trước khi đổi trạng thái kiện.",
      ],
    };
    const alternativeExceptionActions = {
      "Không liên hệ được": [
        [
          "Kiểm tra lại số liên hệ trên hồ sơ và thử gọi thêm một lần.",
          "Ghi lại giờ gọi và kết quả; chờ 5–10 phút trước lần liên hệ tiếp theo.",
          "Nếu vẫn không kết nối, báo Điều hành để quyết định lần giao tiếp theo; không để kiện ngoài cửa.",
        ],
        [
          "Gửi thông báo theo kênh đã được đơn vị cho phép.",
          "Giữ kiện hàng an toàn trong khi chờ người nhận phản hồi.",
          "Báo Điều hành nếu hết khung giờ giao mà chưa xác nhận được người nhận.",
        ],
      ],
      "Địa chỉ không hợp lệ": [
        [
          "Đối chiếu địa chỉ trên nhãn kiện với thông tin giao hàng.",
          "Liên hệ người nhận để xác minh số nhà, tòa nhà hoặc mốc gần nhất.",
          "Chỉ cập nhật địa chỉ sau khi được xác nhận; báo Điều hành nếu cần đổi tuyến.",
        ],
        [
          "Tạm dừng tại vị trí an toàn và không tự đoán địa chỉ thay thế.",
          "Ghi lại phần địa chỉ còn thiếu và thông tin người nhận xác nhận.",
          "Chuyển thông tin cho Điều hành để xác nhận hướng đi tiếp theo.",
        ],
      ],
      "Khách đổi lịch": [
        [
          "Xác nhận lại ngày và khung giờ người nhận có thể nhận hàng.",
          "Ghi nội dung hẹn mới vào hồ sơ giao.",
          "Báo Điều hành để cập nhật lịch hoặc tuyến theo quy trình.",
        ],
        [
          "Kiểm tra kiện hàng và giữ ở nơi an toàn trong lúc chờ lịch mới.",
          "Nhắc lại khung giờ dự kiến với người nhận để tránh hiểu nhầm.",
          "Chỉ tiếp tục giao khi lịch mới đã được xác nhận.",
        ],
      ],
      "Kiện hàng hư hỏng": [
        [
          "Dừng bàn giao và chụp ảnh rõ các mặt bị ảnh hưởng.",
          "Giữ nguyên bao bì và không tự mở kiện.",
          "Báo Điều hành để hướng dẫn lập biên bản hoặc chuyển xử lý.",
        ],
        [
          "Đặt kiện ở vị trí an toàn, hạn chế va chạm thêm.",
          "Ghi thời điểm phát hiện và mô tả tình trạng bên ngoài.",
          "Chờ Điều hành xác nhận trước khi giao, hoàn trả hoặc đổi trạng thái.",
        ],
      ],
      "Xe gặp sự cố": [
        [
          "Đưa xe vào vị trí an toàn và bật cảnh báo nếu cần.",
          "Thông báo Điều hành vị trí và tình trạng phương tiện.",
          "Chỉ tiếp tục tuyến sau khi phương tiện được kiểm tra hoặc có phương án thay thế.",
        ],
        [
          "Gọi hỗ trợ phương tiện theo quy trình của đơn vị.",
          "Báo Điều hành các điểm giao có nguy cơ trễ.",
          "Chờ xác nhận trước khi đổi tài xế hoặc điều chỉnh tuyến.",
        ],
      ],
      "Loại khác": [
        [
          "Ghi rõ sự việc, thời điểm và các bước đã thực hiện.",
          "Giữ lại thông tin hoặc bằng chứng liên quan.",
          "Hỏi Điều hành trước khi đổi trạng thái hoặc tự xử lý ngoài quy trình.",
        ],
        [
          "Tạm dừng thao tác có thể làm thay đổi tình trạng kiện.",
          "Bổ sung thông tin còn thiếu vào ghi chú ngoại lệ.",
          "Chuyển tình huống cho Điều hành xác nhận hướng xử lý.",
        ],
      ],
    };

    function normalizeVi(value) {
      return String(value || "")
        .toLocaleLowerCase("vi-VN")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/\s+/g, " ")
        .trim();
    }

    function confidenceLabel(value) {
      if (value < 60) return "Tin cậy thấp";
      if (value < 80) return "Tin cậy trung bình";
      return "Tin cậy cao";
    }

    function writeLocal(key, value) {
      try {
        localStorage.setItem("parcelpulse." + key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    }

    function upsertLocal(key, record) {
      const current = readLocal(key, []);
      const rows = Array.isArray(current) ? current : [];
      return writeLocal(
        key,
        [record]
          .concat(rows.filter((item) => !item || item.id !== record.id))
          .slice(0, 100),
      );
    }

    function makeLocalId(prefix) {
      return (
        prefix +
        "-" +
        Date.now().toString(36).toUpperCase() +
        "-" +
        Math.random().toString(36).slice(2, 6).toUpperCase()
      );
    }

    function getExceptionScopes() {
      const options = [];
      const rows = [...document.querySelectorAll("#ex-body tr[data-id]")];
      if (rows.length) {
        rows.forEach((row) =>
          options.push({
            id: row.dataset.id,
            label:
              row.dataset.id +
              " · " +
              (row.querySelector(".t-type")?.textContent.trim() || "Ngoại lệ"),
          }),
        );
      } else if (roleName.includes("Quản trị")) {
        if (document.querySelector("#logistics-report"))
          options.push({ id: "logistics-report", label: "Báo cáo logistics" });
        if (document.querySelector("#status-body"))
          options.push({ id: "status-taxonomy", label: "Taxonomy trạng thái" });
        if (document.querySelector("#user-body"))
          options.push({ id: "user-directory", label: "Danh sách người dùng" });
        if (!options.length)
          options.push({ id: "admin-workspace", label: "Khu vực quản trị" });
      } else if (roleName.includes("Điều phối")) {
        options.push({
          id: "dispatcher-workspace",
          label: document.querySelector("#stops")
            ? "Phân công tuyến"
            : "Tổng quan điều hành",
        });
      } else {
        const nativeStop = document.querySelector("#exception-stop");
        if (nativeStop)
          [...nativeStop.options]
            .filter((option) => option.value)
            .forEach((option) =>
              options.push({
                id: option.value,
                label: option.textContent.trim(),
              }),
            );
        document
          .querySelectorAll(".route-stop[data-stop]")
          .forEach((item) =>
            options.push({ id: item.dataset.stop, label: item.dataset.stop }),
          );
        if (!options.length)
          ["STP-10462", "STP-10463", "STP-10469"].forEach((id) =>
            options.push({ id, label: id }),
          );
      }
      const unique = new Map(options.map((item) => [item.id, item]));
      return [...unique.values()];
    }

    function addSelectOption(select, value, label) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.append(option);
    }

    function refreshExceptionContext() {
      const row = [...document.querySelectorAll("#ex-body tr[data-id]")].find(
        (item) => item.dataset.id === exScope.value,
      );
      if (!row) return;
      if (row.getAttribute("aria-current") !== "true") row.click();
      const type =
        document.querySelector("#exception-detail-type")?.textContent.trim() ||
        "";
      const note =
        document.querySelector("#exception-detail-note")?.textContent.trim() ||
        document.querySelector("#exception-detail-text")?.textContent.trim() ||
        "";
      if (
        type &&
        [...exCategory.options].some((option) => option.value === type)
      )
        exCategory.value = type;
      exNote.value = note;
    }

    function initializeExceptionInputs() {
      const scopeLabel = panel.querySelector("[data-ex-scope-label]");
      scopeLabel.childNodes[0].textContent = roleName.includes("Điều phối")
        ? "Ngoại lệ đang xử lý "
        : roleName.includes("Quản trị")
          ? "Phạm vi quản trị "
          : "Điểm dừng / kiện hàng ";
      addSelectOption(exScope, "", "Chọn phạm vi / hồ sơ");
      const scopes = getExceptionScopes();
      scopes.forEach((scope) =>
        addSelectOption(exScope, scope.id, scope.label),
      );
      addSelectOption(exCategory, "", "Chọn loại ngoại lệ");
      exceptionTypes.forEach((type) =>
        addSelectOption(exCategory, type.label, type.label),
      );
      const selectedId =
        document.querySelector("#exception-detail-id")?.textContent.trim() ||
        document.querySelector("#exception-stop")?.value ||
        scopes[0]?.id ||
        "";
      if (scopes.some((item) => item.id === selectedId))
        exScope.value = selectedId;
      const nativeCategory = document.querySelector("#exception-category");
      const nativeNote = document.querySelector("#exception-note");
      if (
        nativeCategory &&
        exCategory.querySelector('option[value="' + nativeCategory.value + '"]')
      )
        exCategory.value = nativeCategory.value;
      if (nativeNote) exNote.value = nativeNote.value;
      if (roleName.includes("Điều phối")) refreshExceptionContext();
      renderExceptionHistory();
    }

    function setExceptionTask(task) {
      exceptionRevision += 1;
      exceptionTask = task;
      currentException = null;
      exResult.hidden = true;
      exProcessing.hidden = true;
      panel.querySelector("[data-ex-title]").textContent =
        task === "classify"
          ? "Phân loại ngoại lệ"
          : "Gợi ý hành động tiếp theo";
      panel.querySelector("[data-ex-help]").textContent =
        task === "classify"
          ? "Dấu hiệu trong ghi chú được đối chiếu với các loại ngoại lệ mẫu."
          : "Chọn loại ngoại lệ để lập kế hoạch xử lý theo ưu tiên và quy tắc an toàn.";
      panel.querySelectorAll("[data-ex-task]").forEach((button) => {
        const selected = button.dataset.exTask === task;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-selected", String(selected));
      });
    }

    function findExceptionMatches(note) {
      const normalized = normalizeVi(note);
      return exceptionTypes
        .filter(
          (type) =>
            type.label !== "Loại khác" &&
            type.words.some((word) => normalized.includes(word)),
        )
        .map((type) => ({
          label: type.label,
          terms: type.words.filter((word) => normalized.includes(word)),
        }));
    }

    const exceptionEvidenceRules = [
      {
        label: "Không liên hệ được",
        positive: [
          { phrase: "chua nghe may", weight: 4, display: "chưa nghe máy" },
          { phrase: "khong nghe may", weight: 4, display: "không nghe máy" },
          { phrase: "khong bat may", weight: 4, display: "không bắt máy" },
          {
            phrase: "khong lien lac duoc",
            weight: 4,
            display: "không liên lạc được",
          },
          {
            phrase: "khong lien he duoc",
            weight: 4,
            display: "không liên hệ được",
          },
          {
            phrase: "khong tra loi dien thoai",
            weight: 4,
            display: "không trả lời điện thoại",
          },
          { phrase: "khong tra loi", weight: 3, display: "không trả lời" },
          { phrase: "tat may", weight: 3, display: "tắt máy" },
          { phrase: "goi khong duoc", weight: 3, display: "gọi không được" },
        ],
        negative: [],
      },
      {
        label: "Địa chỉ không hợp lệ",
        positive: [
          {
            phrase: "dia chi khong hop le",
            weight: 4,
            display: "địa chỉ không hợp lệ",
          },
          {
            phrase: "khong tim thay dia chi",
            weight: 4,
            display: "không tìm thấy địa chỉ",
          },
          {
            phrase: "khong tim duoc dia chi",
            weight: 4,
            display: "không tìm được địa chỉ",
          },
          { phrase: "sai so nha", weight: 4, display: "sai số nhà" },
          { phrase: "thieu so nha", weight: 4, display: "thiếu số nhà" },
          { phrase: "sai dia chi", weight: 4, display: "sai địa chỉ" },
          { phrase: "dia chi sai", weight: 4, display: "địa chỉ sai" },
          {
            phrase: "dia chi co ve sai",
            weight: 2,
            display: "địa chỉ có vẻ sai",
          },
          { phrase: "dia chi", weight: 0.5, display: "có nhắc đến địa chỉ" },
        ],
        negative: [
          { phrase: "so nha da dung", weight: 4, display: "số nhà đã đúng" },
          { phrase: "dia chi da dung", weight: 4, display: "địa chỉ đã đúng" },
          {
            phrase: "dia chi chinh xac",
            weight: 4,
            display: "địa chỉ chính xác",
          },
          { phrase: "dia chi dung", weight: 3, display: "địa chỉ đúng" },
          {
            phrase: "khong sai dia chi",
            weight: 4,
            display: "không sai địa chỉ",
          },
        ],
      },
      {
        label: "Khách đổi lịch",
        positive: [
          { phrase: "doi lich", weight: 4, display: "đổi lịch" },
          { phrase: "doi ngay", weight: 4, display: "đổi ngày" },
          { phrase: "hen lai", weight: 3, display: "hẹn lại" },
          { phrase: "ngay mai", weight: 2, display: "ngày mai" },
          { phrase: "giao lai", weight: 2, display: "giao lại" },
          { phrase: "doi thoi gian", weight: 4, display: "đổi thời gian" },
        ],
        negative: [],
      },
      {
        label: "Kiện hàng hư hỏng",
        positive: [
          { phrase: "hu hong", weight: 4, display: "hư hỏng" },
          { phrase: "mop", weight: 3, display: "móp" },
          { phrase: "vo kien", weight: 4, display: "vỡ kiện" },
          { phrase: "be vo", weight: 4, display: "bể vỡ" },
          { phrase: "bi rach", weight: 4, display: "bị rách" },
          { phrase: "bi uot", weight: 4, display: "bị ướt" },
          { phrase: "thung rach", weight: 4, display: "thùng rách" },
        ],
        negative: [],
      },
      {
        label: "Xe gặp sự cố",
        positive: [
          { phrase: "xe gap su co", weight: 4, display: "xe gặp sự cố" },
          { phrase: "hong xe", weight: 4, display: "hỏng xe" },
          { phrase: "lo lop", weight: 4, display: "lốp xe" },
          { phrase: "no lop", weight: 4, display: "nổ lốp" },
          { phrase: "chet may", weight: 4, display: "chết máy" },
          { phrase: "cuu ho", weight: 4, display: "cứu hộ" },
          { phrase: "tai nan", weight: 5, display: "tai nạn" },
        ],
        negative: [],
      },
    ];

    function analyzeExceptionEvidence(note, selectedCategory = "") {
      const normalized = normalizeVi(note);
      const analyses = exceptionEvidenceRules
        .map((rule) => {
          const matchedPositive = rule.positive.filter((signal) =>
            normalized.includes(signal.phrase),
          );
          const negative = rule.negative.filter((signal) =>
            normalized.includes(signal.phrase),
          );
          const positive = matchedPositive.filter(
            (signal) =>
              !rule.positive.some(
                (specific) =>
                  specific.phrase.length > signal.phrase.length &&
                  specific.phrase.includes(signal.phrase) &&
                  normalized.includes(specific.phrase),
              ),
          );
          const rawScore =
            positive.reduce((sum, signal) => sum + signal.weight, 0) -
            negative.reduce((sum, signal) => sum + signal.weight, 0);
          return {
            label: rule.label,
            positive,
            negative,
            rawScore,
            score:
              rawScore +
              (selectedCategory === rule.label && positive.length ? 0.25 : 0),
          };
        })
        .filter((item) => item.positive.length || item.negative.length);
      return analyses.sort((a, b) => b.score - a.score);
    }

    function classifyException(input) {
      const note = String(input.note || "").trim();
      const analyses = analyzeExceptionEvidence(note, input.category);
      if (!note)
        return {
          task: "classification",
          state: "missing",
          category: "",
          confidence: 0,
          title: "Chưa có ghi chú để phân loại",
          summary: "Nhập mô tả tình huống để pulse-ai đối chiếu dấu hiệu.",
          reason: "Không có dữ liệu đầu vào nên chưa thể đưa ra nhóm ngoại lệ.",
          reasons: [
            "Bổ sung việc đã xảy ra, thời điểm và cách liên hệ đã thử.",
          ],
          criteria: [],
          note,
        };
      const candidates = analyses.filter(
        (item) => item.positive.length && item.score > 0,
      );
      if (!candidates.length) {
        const category = input.category || "";
        return {
          task: "classification",
          state: "uncertain",
          category,
          confidence: 38,
          title: "Chưa đủ dấu hiệu để phân loại",
          summary: category
            ? `Ghi chú chưa có dấu hiệu xác nhận “${category}”. AI không tự suy đoán; hãy bổ sung sự việc cụ thể hoặc chuyển sang nhập thủ công.`
            : "Ghi chú chưa có dấu hiệu đủ rõ thuộc một nhóm ngoại lệ. Bổ sung sự việc cụ thể, thời điểm và kết quả liên hệ.",
          reason:
            "Không tìm thấy bằng chứng tích cực khớp với nhóm ngoại lệ. Việc chọn loại ở biểu mẫu chưa đủ để xác nhận nội dung ghi chú.",
          reasons: analyses
            .flatMap((item) =>
              item.negative.map(
                (signal) =>
                  `Dấu hiệu ngược với ${item.label}: “${signal.display}”.`,
              ),
            )
            .concat("Chưa có cụm mô tả sự cố đủ cụ thể."),
          criteria: ["Không có dấu hiệu ngoại lệ tích cực đủ mạnh"],
          note,
        };
      }

      const best = candidates[0];
      const runnerUp = candidates[1];
      const selectedMismatch = Boolean(
        input.category && input.category !== best.label,
      );
      const multiSignal = Boolean(runnerUp && runnerUp.score >= 1.5);
      const opposingEvidence = analyses.flatMap((item) =>
        item.negative.map((signal) => ({ label: item.label, signal })),
      );
      const contradictory = opposingEvidence.length > 0;
      let confidence =
        best.score >= 5 && (!runnerUp || best.score - runnerUp.score >= 3)
          ? 92
          : best.score >= 3
            ? 82
            : 68;
      if (multiSignal) confidence = Math.min(confidence, 68);
      if (contradictory) confidence = Math.min(confidence, 62);
      if (selectedMismatch) confidence = Math.min(confidence, 58);
      const uncertain = confidence < 70;
      const supporting = best.positive
        .map((signal) => `“${signal.display}”`)
        .join(", ");
      const contrary = opposingEvidence
        .map(
          (item) =>
            `“${item.signal.display}” làm giảm khả năng “${item.label}”`,
        )
        .join("; ");
      const competing = runnerUp
        ? ` Ghi chú cũng nhắc đến ${runnerUp.label.toLocaleLowerCase("vi-VN")} (${runnerUp.positive.map((signal) => `“${signal.display}”`).join(", ")}).`
        : "";
      let summary = `Dấu hiệu chính ${supporting} khớp với “${best.label}”.`;
      if (contrary) summary += ` Dữ kiện ngược chiều: ${contrary}.`;
      if (competing) summary += competing;
      if (selectedMismatch)
        summary += ` Bạn đang chọn “${input.category}”, nhưng bằng chứng trong ghi chú nghiêng về “${best.label}”; cần xác nhận trước khi áp dụng.`;
      else if (uncertain && !contrary && !multiSignal)
        summary += " Dấu hiệu còn yếu nên cần xác nhận trước khi áp dụng.";
      const criteria = best.positive.map(
        (signal) => `Dấu hiệu ủng hộ ${best.label}: ${signal.display}`,
      );
      opposingEvidence.forEach((item) =>
        criteria.push(
          `Dấu hiệu ngược với ${item.label}: ${item.signal.display}`,
        ),
      );
      if (runnerUp)
        runnerUp.positive.forEach((signal) =>
          criteria.push(`Dấu hiệu khác (${runnerUp.label}): ${signal.display}`),
        );
      if (input.category)
        criteria.push(
          selectedMismatch
            ? `Loại đã chọn (${input.category}) không trùng kết luận sơ bộ`
            : "Loại đang chọn trùng kết luận sơ bộ",
        );
      const reasons = candidates.flatMap((item) =>
        item.positive.map(
          (signal) =>
            `${item.label}: “${signal.display}” (mức khớp ${signal.weight}).`,
        ),
      );
      opposingEvidence.forEach((item) =>
        reasons.push(
          `Bằng chứng làm giảm khả năng ${item.label}: “${item.signal.display}”.`,
        ),
      );
      if (selectedMismatch)
        reasons.push(
          `Loại biểu mẫu đang chọn là ${input.category}, nhưng dấu hiệu mạnh nhất thuộc ${best.label}.`,
        );
      return {
        task: "classification",
        state: uncertain ? "uncertain" : "ready",
        category: best.label,
        confidence,
        title: uncertain ? `Cần xác nhận · ${best.label}` : best.label,
        summary,
        reason:
          selectedMismatch || contradictory || multiSignal
            ? "Kết luận được chọn theo bằng chứng có trọng số. Có loại do người dùng chọn không khớp hoặc ghi chú chứa dữ kiện cạnh tranh/ngược chiều, nên cần người phụ trách xác nhận trước khi cập nhật."
            : `Các dấu hiệu trong ghi chú ủng hộ ${best.label}; không thấy dữ kiện ngược đáng kể.`,
        reasons,
        criteria,
        note,
      };
    }

    function suggestNextAction(input) {
      const selectedCategory = input.category;
      const note = String(input.note || "").trim();
      const classification = note
        ? classifyException({ note, category: selectedCategory })
        : null;
      const category = classification?.category || selectedCategory;
      const categoryMismatch = Boolean(
        selectedCategory && category && selectedCategory !== category,
      );
      if (!selectedCategory)
        return {
          task: "action",
          state: "missing",
          category: "",
          confidence: 0,
          title: "Chưa chọn loại ngoại lệ",
          summary: "Chọn loại ngoại lệ trước khi lập kế hoạch.",
          reason: "Các bước xử lý phụ thuộc vào loại tình huống.",
          reasons: ["Chọn loại ngoại lệ ở phần đầu vào."],
          criteria: [],
          plan: [],
          note,
        };
      let confidence = note ? classification.confidence || 38 : 54;
      let state = "ready";
      let reason =
        "Kế hoạch được chọn theo quy tắc an toàn mẫu cho loại ngoại lệ.";
      const reasons = [
        "Loại ngoại lệ người dùng chọn: " + selectedCategory + ".",
      ];
      if (category === "Loại khác") {
        confidence = 61;
        state = "uncertain";
        reason =
          "Chưa có quy trình riêng cho loại này; chỉ đưa ra các bước an toàn chung.";
        reasons.push("Cần chuyên viên kiểm tra trước khi đổi trạng thái kiện.");
      } else if (categoryMismatch) {
        confidence = Math.min(confidence, 58);
        state = "uncertain";
        reason = `Loại được chọn là ${selectedCategory}, nhưng phân tích ghi chú nghiêng về ${category}. Kế hoạch hiển thị theo dấu hiệu tìm được; hãy xác nhận loại sự cố trước khi áp dụng.`;
        reasons.push(classification.summary);
      } else if (classification && classification.state === "uncertain") {
        state = "uncertain";
        reason = `Ghi chú còn dấu hiệu chưa rõ. ${classification.summary}`;
        reasons.push(...classification.reasons.slice(0, 3));
      } else if (classification && classification.category === category) {
        reasons.push(...classification.reasons.slice(0, 2));
      } else {
        confidence = Math.min(confidence, 54);
        state = "uncertain";
        reason =
          "Chưa có ghi chú để đối chiếu loại ngoại lệ. Chỉ hiển thị các bước an toàn chung; hãy xác nhận sự việc trước khi áp dụng.";
        reasons.push("Chưa có ghi chú bổ sung để đối chiếu.");
      }
      if (roleName.includes("Điều phối"))
        reasons.push(
          "Luồng Điều hành: đối chiếu SLA và ghi chú tài xế cho " +
            (input.scope || "ngoại lệ đang chọn") +
            ".",
        );
      if (roleName.includes("Quản trị"))
        reasons.push(
          "Phạm vi quản trị: " +
            (exScope.options[exScope.selectedIndex]?.textContent ||
              "đang chọn") +
            ".",
        );
      return {
        task: "action",
        state,
        category,
        confidence,
        title:
          state === "uncertain"
            ? "Cần chuyên viên xác nhận kế hoạch"
            : "Kế hoạch xử lý · " + category,
        summary:
          classification?.summary ||
          "Thực hiện theo thứ tự dưới đây; kiểm tra bằng chứng trước khi cập nhật trạng thái.",
        reason,
        reasons,
        criteria: [
          categoryMismatch
            ? `Loại được chọn: ${selectedCategory}; kế hoạch tạm theo dấu hiệu: ${category}`
            : "Loại ngoại lệ: " + category,
          note
            ? "Đã phân tích các dấu hiệu trong ghi chú"
            : "Chưa có ghi chú bổ sung",
        ],
        plan: (
          exceptionActions[category] || exceptionActions["Loại khác"]
        ).slice(),
        note,
      };
    }

    function regenerateActionPlan(result) {
      const alternatives = alternativeExceptionActions[result.category] || [];
      if (!alternatives.length) return null;
      const index = (exceptionPlanRegeneration - 1) % alternatives.length;
      result.plan = alternatives[index].slice();
      result.planVariant = index + 1;
      result.planVariantCount = alternatives.length;
      result.title = `Phương án thay thế ${index + 1} · ${result.category}`;
      result.summary = `Phương án xử lý thay thế cho loại ngoại lệ này. Mức tin cậy phản ánh độ khớp của ghi chú đầu vào.`;
      return { number: index + 1, total: alternatives.length };
    }

    function renderException(result) {
      currentException = result;
      exResult.hidden = false;
      exProcessing.hidden = true;
      panel.querySelector("[data-ex-kind]").textContent =
        result.task === "action" ? "NEXT BEST ACTION" : "EXCEPTION CLASSIFIER";
      panel.querySelector("[data-ex-result-title]").textContent = result.title;
      panel.querySelector("[data-ex-summary]").textContent = result.summary;
      const confidence = panel.querySelector("[data-ex-confidence]");
      confidence.textContent = confidenceLabel(result.confidence);
      confidence.dataset.tone = result.confidence < 60 ? "warning" : "good";
      const plan = panel.querySelector("[data-ex-plan]");
      plan.replaceChildren();
      plan.hidden = !result.plan || !result.plan.length;
      (result.plan || []).forEach((step) => {
        const li = document.createElement("li");
        li.textContent = step;
        plan.append(li);
      });
      const warning = panel.querySelector("[data-ex-warning]");
      warning.hidden = result.state === "ready" && result.confidence >= 60;
      warning.textContent =
        result.state === "missing"
          ? "Không đủ dữ liệu để đề xuất. Bổ sung thông tin hoặc chuyển sang nhập thủ công."
          : "AI chưa chắc chắn – cần chuyên viên xác nhận.";
      panel.querySelector("[data-ex-low-actions]").hidden = warning.hidden;
      const unavailable = result.state === "missing" || !result.category;
      panel.querySelector("[data-ex-accept]").disabled = unavailable;
      panel.querySelector("[data-ex-save]").disabled = unavailable;
    }

    async function runExceptionAnalysis(mode = "analyze") {
      const revision = ++exceptionRevision;
      const inputData = {
        scope: exScope.value,
        category: exCategory.value,
        note: exNote.value,
      };
      const inputSignature = JSON.stringify([
        exceptionTask,
        inputData.scope,
        inputData.category,
        inputData.note.trim(),
      ]);
      const sameInput = inputSignature === lastExceptionInputSignature;
      if (mode === "regenerate") {
        if (!sameInput) exceptionPlanRegeneration = 0;
        exceptionPlanRegeneration += 1;
      } else {
        exceptionPlanRegeneration = 0;
      }
      lastExceptionInputSignature = inputSignature;
      currentException = null;
      exResult.hidden = true;
      exProcessing.hidden = false;
      panel.querySelector("[data-ex-status]").textContent = "";
      panel.querySelector("[data-ex-progress]").textContent =
        "Đọc dữ liệu đã chọn...";
      await new Promise((resolve) => window.setTimeout(resolve, 230));
      if (revision !== exceptionRevision) return;
      panel.querySelector("[data-ex-progress]").textContent =
        "Cân trọng số dấu hiệu và dữ kiện ngược chiều...";
      await new Promise((resolve) => window.setTimeout(resolve, 270));
      if (revision !== exceptionRevision) return;
      panel.querySelector("[data-ex-progress]").textContent =
        "Hoàn tất kết quả phân tích...";
      await new Promise((resolve) => window.setTimeout(resolve, 230));
      if (revision !== exceptionRevision) return;
      const result = !inputData.scope
        ? {
            task: exceptionTask === "classify" ? "classification" : "action",
            state: "missing",
            category: "",
            confidence: 0,
            title: "Chưa chọn hồ sơ",
            summary: "Chọn ngoại lệ hoặc phạm vi trước khi phân tích.",
            reason:
              "Cần biết hồ sơ đích để liên kết kết quả vào dữ liệu ứng dụng.",
            reasons: ["Chọn một phạm vi ở phần đầu vào."],
            criteria: [],
            plan: [],
            note: inputData.note,
          }
        : exceptionTask === "classify"
          ? classifyException(inputData)
          : suggestNextAction(inputData);
      const alternative =
        mode === "regenerate" && result.task === "action" && result.category
          ? regenerateActionPlan(result)
          : null;
      renderException(result);
      const status = panel.querySelector("[data-ex-status]");
      if (mode === "regenerate") {
        if (alternative) {
          status.textContent = `Đã tạo phương án thay thế ${alternative.number}/${alternative.total}. Mức tin cậy phản ánh dữ liệu hiện tại; tạo lại kế hoạch không làm thay đổi đánh giá đầu vào.`;
        } else if (result.task === "action" && !result.category) {
          status.textContent =
            "Chưa thể tạo kế hoạch thay thế. Hãy chọn loại ngoại lệ trước.";
        } else if (sameInput) {
          status.textContent =
            "Phân loại dùng bộ quy tắc cố định; cùng đầu vào sẽ cho cùng kết quả. Bổ sung hoặc sửa ghi chú rồi bấm Phân tích để cập nhật.";
        } else {
          status.textContent = "Đã phân tích lại theo nội dung đầu vào mới.";
        }
      } else if (mode === "retry") {
        status.textContent = sameInput
          ? "Đã thử lại với cùng dữ liệu. Quy tắc mô phỏng có thể cho cùng kết quả; hãy bổ sung thông tin nếu độ tin cậy vẫn thấp."
          : "Đã thử lại với dữ liệu mới và cập nhật kết quả.";
      }
    }

    function setDriverFields(record) {
      const stop = document.querySelector("#exception-stop");
      const category = document.querySelector("#exception-category");
      const note = document.querySelector("#exception-note");
      if (stop && record.scope) {
        stop.value = record.scope;
        stop.dispatchEvent(new Event("change", { bubbles: true }));
      }
      if (category && record.category) {
        category.value = record.category;
        category.dispatchEvent(new Event("change", { bubbles: true }));
      }
      if (note) {
        note.value = record.note || "";
        note.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }

    function persistDispatcherException(record) {
      const id = record.scope;
      const row = [...document.querySelectorAll("#ex-body tr[data-id]")].find(
        (item) => item.dataset.id === id,
      );
      if (!row) return true;
      if (row.getAttribute("aria-current") !== "true") row.click();
      if (record.task === "classification") {
        const typeEdit = document.querySelector("#exception-type-edit");
        if (
          typeEdit &&
          [...typeEdit.options].some(
            (option) =>
              option.value === record.category ||
              option.textContent.trim() === record.category,
          )
        ) {
          typeEdit.value = record.category;
          typeEdit.dispatchEvent(new Event("change", { bubbles: true }));
        }
        document.querySelector("#exception-confirm")?.click();
      }
      const decisions = readLocal("exceptionDecisions", {});
      const next =
        decisions && typeof decisions === "object" && !Array.isArray(decisions)
          ? decisions
          : {};
      const old = next[id] || {};
      const metadata = {
        id: record.id,
        category: record.category,
        confidence: record.confidence,
        note: record.note,
        status: record.status,
        updatedAt: record.updatedAt,
      };
      if (record.task === "classification")
        next[id] = Object.assign({}, old, {
          type: record.category,
          status: "confirmed",
          aiClassification: metadata,
        });
      else
        next[id] = Object.assign({}, old, {
          aiNextBestAction: Object.assign({}, metadata, { steps: record.plan }),
        });
      return writeLocal("exceptionDecisions", next);
    }

    function persistExceptionRecord(record) {
      const isAdmin = roleName.includes("Quản trị");
      const isDispatcher = roleName.includes("Điều phối");
      const prefix = isAdmin ? "admin" : isDispatcher ? "dispatcher" : "driver";
      const key =
        prefix +
        (record.task === "action" ? "ActionPlans" : "ExceptionClassifications");
      let saved = upsertLocal(key, record);
      if (isDispatcher) saved = persistDispatcherException(record) && saved;
      else if (isAdmin) {
        saved = upsertLocal("adminAiSuggestions", record) && saved;
        if (record.scope === "logistics-report") {
          const oldReports = readLocal("savedReports", []);
          const reports = Array.isArray(oldReports) ? oldReports : [];
          const report = {
            id: "AI-" + record.id,
            days: Number(document.querySelector("#report-range")?.value || 7),
            savedAt: record.updatedAt,
            source: "assistant",
            aiSuggestionId: record.id,
            aiSummary: record.summary,
            aiRecommendation: record.plan.length
              ? record.plan.slice()
              : record.category,
            confidence: record.confidence,
          };
          saved =
            writeLocal(
              "savedReports",
              [report]
                .concat(
                  reports.filter(
                    (item) => item && item.aiSuggestionId !== record.id,
                  ),
                )
                .slice(0, 10),
            ) && saved;
        }
      } else if (record.task === "classification") {
        setDriverFields(record);
        const draft = {
          id: record.id,
          stop: record.scope,
          category: record.category,
          note: record.note,
          confidence: record.confidence,
          needsReview: record.confidence < 60,
          updatedAt: record.updatedAt,
          source: "assistant",
        };
        saved = writeLocal("driverExceptionDraft", draft) && saved;
      } else {
        const current = readLocal("driverExceptions", []);
        if (Array.isArray(current)) {
          let changed = false;
          const updated = current.map((item) => {
            if (item && item.stop === record.scope) {
              changed = true;
              return Object.assign({}, item, {
                nextActionPlan: {
                  id: record.id,
                  category: record.category,
                  steps: record.plan,
                  confidence: record.confidence,
                  status: record.status,
                  updatedAt: record.updatedAt,
                },
              });
            }
            return item;
          });
          if (changed) saved = writeLocal("driverExceptions", updated) && saved;
        }
      }
      return saved;
    }

    function makeExceptionRecord(status) {
      const result = currentException;
      const now = new Date().toISOString();
      result.id =
        result.id || makeLocalId(result.task === "action" ? "PLAN" : "EX");
      return {
        id: result.id,
        role: panel.dataset.role,
        task: result.task,
        scope: exScope.value,
        category: result.category,
        confidence: result.confidence,
        note: exNote.value.trim(),
        summary:
          (result.task === "action"
            ? "Kế hoạch xử lý · "
            : "Phân loại ngoại lệ · ") + result.category,
        reason: result.reason,
        reasons: result.reasons || [],
        criteria: result.criteria || [],
        plan: result.plan || [],
        status,
        createdAt: result.createdAt || now,
        updatedAt: now,
      };
    }

    function applyExceptionResult(status) {
      if (
        !currentException ||
        !currentException.category ||
        currentException.state === "missing"
      )
        return false;
      const record = makeExceptionRecord(status || "accepted");
      const saved = persistExceptionRecord(record);
      currentException.accepted = true;
      currentException.saved = status === "saved";
      renderExceptionHistory();
      panel.querySelector("[data-ex-warning]").hidden = true;
      panel.querySelector("[data-ex-status]").textContent = saved
        ? record.status === "saved"
          ? "Đã lưu vào dữ liệu ứng dụng."
          : "Đã chấp nhận và áp dụng vào dữ liệu ứng dụng."
        : "Không thể ghi dữ liệu. Kiểm tra localStorage trên thiết bị này.";
      return saved;
    }

    function saveNativeDriverException() {
      if (panel.dataset.role !== "driver") return false;
      const nativeForm = document.querySelector("#exception-form");
      if (
        !nativeForm ||
        exNote.value.trim().length < 8 ||
        !document.querySelector("#exception-category")?.value
      )
        return false;
      const before = readLocal("driverExceptions", []);
      const ids = new Set(
        (Array.isArray(before) ? before : []).map((item) => item && item.id),
      );
      nativeForm.requestSubmit();
      const message =
        document.querySelector("#exception-status")?.textContent || "";
      if (!message.includes("Đã tạo ngoại lệ")) return false;
      const after = readLocal("driverExceptions", []);
      if (Array.isArray(after)) {
        const created = after.find((item) => item && !ids.has(item.id));
        if (created) {
          created.aiAssisted = true;
          created.classificationId = currentException.id;
          writeLocal("driverExceptions", after);
        }
      }
      return true;
    }

    function renderExceptionHistory() {
      const history = panel.querySelector("[data-ex-history]");
      const role = panel.dataset.role;
      const prefix =
        role === "admin"
          ? "admin"
          : role === "dispatcher"
            ? "dispatcher"
            : "driver";
      const plans = readLocal(prefix + "ActionPlans", []);
      const classes = readLocal(prefix + "ExceptionClassifications", []);
      const records = (Array.isArray(plans) ? plans : [])
        .concat(Array.isArray(classes) ? classes : [])
        .filter((item) => item && ["accepted", "saved"].includes(item.status))
        .sort((a, b) =>
          String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")),
        )
        .slice(0, 4);
      history.replaceChildren();
      panel.querySelector("[data-ex-history-count]").textContent = String(
        records.length,
      );
      if (!records.length) {
        const empty = document.createElement("li");
        empty.textContent = "Chưa có đề xuất được lưu.";
        history.append(empty);
        return;
      }
      records.forEach((item) => {
        const row = document.createElement("li");
        const content = document.createElement("div");
        content.className = "ex-history-copy";
        const title = document.createElement("span");
        title.textContent = item.summary || item.category || "Đề xuất AI";
        const detail = document.createElement("small");
        detail.textContent =
          (item.scope || "Chưa chọn phạm vi") +
          " · " +
          (item.status === "saved" ? "Đã lưu" : "Đã chấp nhận");
        content.append(title, detail);
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "ex-history-delete";
        remove.textContent = "Xóa";
        remove.setAttribute(
          "aria-label",
          "Xóa " + (item.summary || item.category || "đề xuất AI"),
        );
        remove.addEventListener("click", () => deleteSavedException(item));
        row.append(content, remove);
        history.append(row);
      });
    }

    function deleteSavedException(record) {
      const label = record.summary || record.category || "đề xuất AI";
      if (
        !window.confirm(
          `Xóa “${label}” khỏi danh sách đề xuất đã lưu? Dữ liệu đã áp dụng vẫn được giữ nguyên.`,
        )
      )
        return;

      const role = panel.dataset.role;
      const prefix =
        role === "admin"
          ? "admin"
          : role === "dispatcher"
            ? "dispatcher"
            : "driver";
      const key =
        prefix +
        (record.task === "action" ? "ActionPlans" : "ExceptionClassifications");
      const stored = readLocal(key, []);
      if (!Array.isArray(stored)) {
        panel.querySelector("[data-ex-status]").textContent =
          "Không thể xóa đề xuất khỏi dữ liệu cục bộ.";
        return;
      }

      const saved = writeLocal(
        key,
        stored.filter((item) => !item || item.id !== record.id),
      );
      if (role === "admin") {
        const suggestions = readLocal("adminAiSuggestions", []);
        if (Array.isArray(suggestions)) {
          writeLocal(
            "adminAiSuggestions",
            suggestions.filter((item) => !item || item.id !== record.id),
          );
        }
      }
      if (!saved) {
        panel.querySelector("[data-ex-status]").textContent =
          "Không thể xóa đề xuất khỏi dữ liệu cục bộ.";
        return;
      }
      renderExceptionHistory();
      panel.querySelector("[data-ex-status]").textContent =
        "Đã xóa đề xuất khỏi danh sách đã lưu. Dữ liệu đã áp dụng vẫn được giữ nguyên.";
    }

    function bindExceptionWorkflow() {
      initializeExceptionInputs();
      exScope.addEventListener("change", refreshExceptionContext);
      panel
        .querySelectorAll("[data-ex-task]")
        .forEach((button) =>
          button.addEventListener("click", () =>
            setExceptionTask(button.dataset.exTask),
          ),
        );
      exForm.addEventListener("submit", (event) => {
        event.preventDefault();
        runExceptionAnalysis();
      });
      panel.querySelectorAll("[data-ex-demo]").forEach((button) =>
        button.addEventListener("click", () => {
          setExceptionTask("classify");
          exCategory.value = "";
          exNote.value =
            button.dataset.exDemo === "conflict"
              ? "Địa chỉ có vẻ sai nhưng người nhận nói số nhà đã đúng; người nhận cũng chưa nghe máy."
              : "";
          if (panel.dataset.role === "driver")
            setDriverFields({
              scope: exScope.value,
              category: "",
              note: exNote.value,
            });
          runExceptionAnalysis();
        }),
      );
      panel
        .querySelector("[data-ex-accept]")
        .addEventListener("click", () => applyExceptionResult("accepted"));
      panel.querySelector("[data-ex-save]").addEventListener("click", () => {
        if (!currentException) return;
        const wasAccepted = currentException.accepted;
        if (!wasAccepted && !applyExceptionResult("accepted")) return;
        const didCreate =
          currentException.task === "classification" &&
          !currentException.nativeCreated
            ? saveNativeDriverException()
            : false;
        if (didCreate) currentException.nativeCreated = true;
        const saved = applyExceptionResult("saved");
        if (saved && didCreate)
          panel.querySelector("[data-ex-status]").textContent =
            "Đã tạo ngoại lệ và lưu dấu AI vào dữ liệu tuyến.";
      });
      panel.querySelector("[data-ex-reject]").addEventListener("click", () => {
        if (!currentException) return;
        const saved = readLocal("aiAssistantDecisions", []);
        const rows = Array.isArray(saved) ? saved : [];
        rows.unshift({
          id: currentException.id || makeLocalId("DEC"),
          role: panel.dataset.role,
          scope: exScope.value,
          task: currentException.task,
          category: currentException.category,
          note: exNote.value.trim(),
          decision: "rejected",
          createdAt: new Date().toISOString(),
        });
        writeLocal("aiAssistantDecisions", rows.slice(0, 30));
        panel.querySelector("[data-ex-status]").textContent =
          "Đã từ chối; đề xuất chưa được áp dụng.";
      });
      panel
        .querySelector("[data-ex-regenerate]")
        .addEventListener("click", () => runExceptionAnalysis("regenerate"));
      panel
        .querySelector("[data-ex-retry]")
        .addEventListener("click", () => runExceptionAnalysis("retry"));
      panel
        .querySelector("[data-ex-supplement]")
        .addEventListener("click", () => exNote.focus());
      panel.querySelector("[data-ex-manual]").addEventListener("click", () => {
        const note = document.querySelector("#exception-note");
        if (panel.dataset.role === "driver" && note) {
          closePanel();
          window.setTimeout(() => note.focus(), 0);
        } else exNote.focus();
      });
      panel.querySelectorAll("[data-copilot-mode]").forEach((button) =>
        button.addEventListener("click", () => {
          syncDriverExceptionToAi();
          setExceptionTask(button.dataset.exceptionTask);
          setAiMode(button.dataset.copilotMode);
        }),
      );
      renderExceptionHistory();
    }
    bindExceptionWorkflow();

    function ask(prompt) {
      const question = prompt.trim();
      if (!question) return;
      addMessage("user", question);
      input.value = "";
      const normalizedQuestion = question.toLocaleLowerCase("vi-VN");
      if (
        /eta|thời gian đến|khi nào đến|bao giờ đến/.test(normalizedQuestion)
      ) {
        setAiMode("eta");
        return;
      }
      if (
        /phân loại|classifier|next best action|hành động tiếp theo|gợi ý hành động/.test(
          normalizedQuestion,
        )
      ) {
        setExceptionTask(
          /hành động|action/.test(normalizedQuestion) ? "action" : "classify",
        );
        setAiMode("exception");
        addMessage(
          "assistant",
          "Mình đã mở luồng ngoại lệ. Chọn hồ sơ, kiểm tra ghi chú và bấm Phân tích để xem đề xuất cùng độ tin cậy.",
        );
        return;
      }
      const actions = analyzeCurrentScreen(question);
      if (!actions) {
        addMessage(
          "assistant",
          "Tôi đang ở màn hình “" +
            currentScreenLabel() +
            "”. Tôi có thể tóm tắt màn hình, tìm mục cần duyệt hoặc mở thao tác phù hợp. Các quyết định quan trọng vẫn cần bạn kiểm tra.",
        );
        return;
      }
      addMessage("assistant", actions.text, actions.buttons || []);
    }

    function currentScreenLabel() {
      const title = document.querySelector("main h1")?.textContent.trim();
      return title || pageName;
    }

    function analyzeCurrentScreen(prompt) {
      const normalized = prompt.toLocaleLowerCase("vi-VN");
      const isApproveRequest = /duyệt|phe duyệt|xác nhận|chấp thuận/.test(
        normalized,
      );
      const isUpdateRequest = /cập nhật|sửa|update|đổi trạng thái/.test(
        normalized,
      );
      const isCancelRequest = /hủy|huỷ|bỏ qua|cancel/.test(normalized);
      const isArchiveRequest = /lưu trữ|archive|xóa/.test(normalized);

      if (document.querySelector("#ex-body"))
        return analyzeExceptions(
          isApproveRequest,
          isUpdateRequest,
          isCancelRequest,
        );
      if (document.querySelector(".route-stop[data-stop]"))
        return analyzeDriverRoute(isApproveRequest);
      if (document.querySelector("#delivery-proof-form"))
        return analyzeDriverStopDetail(isApproveRequest);
      if (document.querySelector("#exception-form"))
        return analyzeDriverExceptionForm(isApproveRequest);
      if (document.querySelector("#stops")) return analyzeAssignments();
      if (document.querySelector("#chart")) return analyzeOverview();
      if (document.querySelector("#status-body"))
        return analyzeStatuses(
          isUpdateRequest,
          isArchiveRequest,
          isCancelRequest,
        );
      if (document.querySelector("#user-body"))
        return analyzeUsers(isApproveRequest, isUpdateRequest, isCancelRequest);
      if (document.querySelector("#logistics-report")) return analyzeReport();
      return null;
    }

    function analyzeDriverRoute(isApproveRequest) {
      const allStops = [...document.querySelectorAll(".route-stop[data-stop]")];
      const visibleStops = allStops.filter((stop) => !stop.hidden);
      const stops = visibleStops.length ? visibleStops : allStops;
      const pending = stops.filter((stop) => stop.dataset.status === "pending");
      const exceptions = stops.filter(
        (stop) => stop.dataset.status === "exception",
      );
      const completed = stops.filter(
        (stop) => stop.dataset.status === "completed",
      );
      const nextStop = pending[0] || exceptions[0];
      const activeFilter = document.querySelector(
        '[data-stop-filter][aria-pressed="true"]',
      )?.dataset.stopFilter;
      const hasActiveFilters = Boolean(
        (activeFilter && activeFilter !== "all") ||
        document.querySelector("#stop-search")?.value.trim(),
      );
      const buttons = [];

      if (!visibleStops.length && allStops.length) {
        return {
          text: "Bộ lọc hiện tại không hiển thị điểm dừng nào. Hãy hiện toàn bộ tuyến để pulse-ai có thể tóm tắt các điểm giao.",
          buttons: [{ label: "Hiện toàn bộ tuyến", run: showAllDriverStops }],
        };
      }

      if (isApproveRequest) {
        let text;
        if (exceptions.length) {
          const first = exceptions[0];
          text = `Tuyến giao không có hàng chờ phê duyệt. Có ${exceptions.length} điểm đang có ngoại lệ; ${first.dataset.stop} cần được kiểm tra trước khi tiếp tục giao. Còn ${pending.length} điểm chờ giao và ${completed.length} điểm đã hoàn tất.`;
          buttons.push(
            {
              label: "Lọc điểm có ngoại lệ",
              run: () =>
                document
                  .querySelector('[data-stop-filter="exception"]')
                  ?.click(),
            },
            {
              label: `Mở ${first.dataset.stop}`,
              run: () => openDriverStop(first),
              secondary: true,
            },
          );
        } else {
          text = `Không có mục chờ duyệt trên tuyến giao của bạn. Hiện có ${pending.length} điểm chờ giao và ${completed.length} điểm đã hoàn tất.`;
          if (nextStop) {
            const eta = [...nextStop.querySelectorAll("small")]
              .map((item) => item.textContent.trim())
              .find((value) => value.includes("ETA"));
            text += ` Điểm tiếp theo là ${nextStop.dataset.stop}${eta ? ` (${eta})` : ""}.`;
            buttons.push({
              label: `Mở điểm tiếp theo ${nextStop.dataset.stop}`,
              run: () => openDriverStop(nextStop),
            });
          }
          if (pending.length)
            buttons.push({
              label: "Lọc điểm còn lại",
              run: () =>
                document.querySelector('[data-stop-filter="pending"]')?.click(),
              secondary: true,
            });
        }
        if (hasActiveFilters)
          buttons.push({
            label: "Hiện toàn bộ tuyến",
            run: showAllDriverStops,
            secondary: true,
          });
        return { text, buttons };
      }

      const nextEta = nextStop ? getStopEta(nextStop) : "";
      const text =
        `Tuyến đang hiển thị ${stops.length} điểm: ${pending.length} điểm chờ giao, ${exceptions.length} điểm có ngoại lệ và ${completed.length} điểm đã hoàn tất.` +
        (nextStop
          ? ` Ưu tiên tiếp theo là ${nextStop.dataset.stop}${nextEta ? ` (${nextEta})` : ""}.`
          : " Không còn điểm cần xử lý trong danh sách này.");
      if (nextStop)
        buttons.push({
          label: `Mở ${nextStop.dataset.stop}`,
          run: () => openDriverStop(nextStop),
        });
      if (exceptions.length)
        buttons.push({
          label: "Lọc điểm có ngoại lệ",
          run: () =>
            document.querySelector('[data-stop-filter="exception"]')?.click(),
          secondary: true,
        });
      if (hasActiveFilters)
        buttons.push({
          label: "Hiện toàn bộ tuyến",
          run: showAllDriverStops,
          secondary: true,
        });
      return { text, buttons };
    }

    function getStopEta(stop) {
      return (
        [...stop.querySelectorAll("small")]
          .map((item) => item.textContent.trim())
          .find((value) => value.includes("ETA")) || ""
      );
    }

    function openDriverStop(stop) {
      const detailLink = stop.querySelector(
        'a[href*="driver-stop-detail.html"]',
      );
      if (detailLink) window.location.href = detailLink.href;
      else stop.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function guideDriverInput(field, instruction) {
      if (!field) return;
      const label = field.closest("label");
      closePanel();
      window.requestAnimationFrame(() => {
        field.scrollIntoView({ behavior: "smooth", block: "center" });
        label?.classList.add("assistant-field-highlight");
        field.focus({ preventScroll: true });
        const status = document.querySelector("#proof-status");
        if (status) {
          status.textContent = instruction;
          delete status.dataset.tone;
        }
        try {
          window.ParcelPulseRolePages?.toast(instruction);
        } catch {
          // Keep the inline form message available if the optional toast fails.
        }
        field.addEventListener(
          "input",
          () => {
            label?.classList.remove("assistant-field-highlight");
            if (status?.textContent === instruction) {
              status.textContent = "";
              delete status.dataset.tone;
            }
          },
          { once: true },
        );
        window.setTimeout(
          () => label?.classList.remove("assistant-field-highlight"),
          5000,
        );
      });
    }

    function submitDeliveryProofFromAssistant(form) {
      closePanel();
      window.requestAnimationFrame(() => {
        form.requestSubmit();
        const status = document.querySelector("#proof-status");
        if (status?.textContent.trim())
          status.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }

    function showAllDriverStops() {
      const search = document.querySelector("#stop-search");
      if (search && search.value) {
        search.value = "";
        search.dispatchEvent(new Event("input", { bubbles: true }));
      }
      document.querySelector('[data-stop-filter="all"]')?.click();
    }

    function analyzeDriverStopDetail(isApproveRequest) {
      const form = document.querySelector("#delivery-proof-form");
      const stopId =
        document.querySelector("#detail-stop-id")?.textContent.trim() ||
        "điểm giao đang chọn";
      const state =
        document.querySelector("#stop-detail-state")?.textContent.trim() ||
        "chưa xác định";
      const details = [...document.querySelectorAll("dl.kv")];
      const readDetail = (label) => {
        const row = details.find(
          (item) => item.querySelector("dt")?.textContent.trim() === label,
        );
        return row?.querySelector("dd")?.textContent.trim() || "";
      };
      const address = readDetail("Địa chỉ");
      const trackingCode = readDetail("Mã vận đơn");
      const instructions = readDetail("Chỉ dẫn");
      const eta =
        document.querySelector(".parcel-highlight small")?.textContent.trim() ||
        "";
      const isComplete = normalizeVi(state).includes("da giao");
      const proofForm = form;
      const recipient = proofForm?.querySelector("#recipient-name");
      const handoverCode = proofForm?.querySelector("#handover-code");
      const validProof = Boolean(
        recipient?.value.trim() &&
        /^\d{6}$/.test(handoverCode?.value.trim() || ""),
      );
      const proofStatus = document
        .querySelector("#proof-status")
        ?.textContent.trim();
      const buttons = [];
      let text;

      if (isApproveRequest) {
        text = isComplete
          ? `Điểm ${stopId} đã được ghi nhận là đã giao. Màn hình chi tiết này không có hàng chờ phê duyệt.`
          : `Màn hình này không có hàng chờ phê duyệt. Điểm ${stopId} đang ở trạng thái “${state}”; bước cần làm là xác minh người nhận rồi ghi nhận kết quả giao.`;
      } else {
        text = `Điểm ${stopId}${trackingCode ? ` · kiện ${trackingCode}` : ""} đang ở trạng thái “${state}”${eta ? ` (${eta})` : ""}.`;
      }
      if (address) text += ` Địa chỉ: ${address}.`;
      if (instructions) text += ` Chỉ dẫn: ${instructions}.`;
      if (proofStatus) text += ` ${proofStatus}`;
      else if (!isComplete)
        text +=
          " Để hoàn tất, nhập tên người nhận và mã xác nhận 6 chữ số rồi bấm “Xác nhận đã giao”.";

      if (!isComplete) {
        if (!recipient?.value.trim())
          buttons.push({
            label: "Nhập tên người nhận",
            run: () =>
              guideDriverInput(recipient, "Vui lòng nhập tên người nhận"),
            secondary: true,
          });
        if (!/^\d{6}$/.test(handoverCode?.value.trim() || ""))
          buttons.push({
            label: "Nhập mã xác nhận",
            run: () =>
              guideDriverInput(
                handoverCode,
                "Vui lòng nhập mã xác nhận gồm 6 chữ số",
              ),
            secondary: true,
          });
        if (validProof) {
          buttons.push({
            label: "Xác nhận đã giao",
            run: () => submitDeliveryProofFromAssistant(proofForm),
          });
        }
      } else {
        const routeLink = document.querySelector("#stop-route-link");
        if (routeLink)
          buttons.push({
            label: "Về danh sách điểm",
            run: () => {
              window.location.href = routeLink.href;
            },
          });
      }
      const navigation = document.querySelector("#start-navigation");
      if (navigation)
        buttons.push({
          label: "Mở hướng dẫn tuyến",
          run: () => navigation.click(),
          secondary: true,
        });
      const exceptionLink = document.querySelector(
        'a[href*="driver-exception-create.html"]',
      );
      if (exceptionLink)
        buttons.push({
          label: "Ghi nhận ngoại lệ",
          run: () => {
            window.location.href = exceptionLink.href;
          },
          secondary: true,
        });
      return { text, buttons };
    }

    function analyzeDriverExceptionForm(isApproveRequest) {
      const form = document.querySelector("#exception-form");
      const stopField = form?.querySelector("#exception-stop");
      const categoryField = form?.querySelector("#exception-category");
      const noteField = form?.querySelector("#exception-note");
      const stopId = stopField?.value || "điểm giao đang chọn";
      const category = categoryField?.value || "";
      const note = noteField?.value.trim() || "";
      const reports = readLocal("driverExceptions", []);
      const existing = (Array.isArray(reports) ? reports : []).filter(
        (item) => item?.stop === stopId,
      );
      const classification = note
        ? classifyException({ note, category })
        : null;
      const statusMessage = document
        .querySelector("#exception-status")
        ?.textContent.trim();
      const buttons = [];
      let text;

      if (isApproveRequest) {
        text = existing.length
          ? `Đã có ${existing.length} báo cáo ngoại lệ được lưu cục bộ cho ${stopId}. Trang này là biểu mẫu tạo báo cáo, không phải hàng chờ phê duyệt; dữ liệu demo chưa gửi lên máy chủ.`
          : `Chưa có báo cáo ngoại lệ nào được ghi nhận cho ${stopId}. Trang này dùng để tạo báo cáo mới; khi gửi, dữ liệu demo sẽ được lưu cục bộ, chưa gửi lên máy chủ.`;
      } else {
        text =
          `Biểu mẫu ngoại lệ đang chọn điểm ${stopId}.` +
          (category
            ? ` Loại đang chọn: ${category}.`
            : " Chưa chọn loại ngoại lệ.") +
          (note
            ? ` Đã nhập mô tả ${note.length} ký tự.`
            : " Chưa nhập mô tả tình huống.");
        if (classification) {
          text += classification.category
            ? ` Phân loại sơ bộ: ${classification.category}, ${confidenceLabel(classification.confidence).toLocaleLowerCase("vi-VN")}.`
            : " Chưa đủ ghi chú để phân loại.";
        }
        if (existing.length)
          text += ` Đã có ${existing.length} báo cáo ngoại lệ cho điểm này.`;
      }
      if (statusMessage) text += ` ${statusMessage}`;

      if (!category)
        buttons.push({
          label: "Chọn loại ngoại lệ",
          run: () => categoryField?.focus(),
        });
      if (note.length < 8)
        buttons.push({
          label: "Bổ sung mô tả",
          run: () => noteField?.focus(),
          secondary: true,
        });
      if (category && note.length >= 8) {
        buttons.push({
          label: "Ghi nhận ngoại lệ",
          run: () => form.requestSubmit(),
        });
      }
      buttons.push({
        label: "Phân loại ghi chú với AI",
        run: () => openDriverExceptionAi(),
        secondary: true,
      });
      const routeLink = document.querySelector(
        'a[href*="driver-route-stops.html"]',
      );
      if (routeLink)
        buttons.push({
          label: "Về tuyến giao",
          run: () => {
            window.location.href = routeLink.href;
          },
          secondary: true,
        });
      return { text, buttons };
    }

    function syncDriverExceptionToAi() {
      if (panel.dataset.role !== "driver") return;
      const nativeStop = document.querySelector("#exception-stop");
      const nativeCategory = document.querySelector("#exception-category");
      const nativeNote = document.querySelector("#exception-note");
      if (
        nativeStop &&
        [...exScope.options].some((option) => option.value === nativeStop.value)
      )
        exScope.value = nativeStop.value;
      if (
        nativeCategory &&
        [...exCategory.options].some(
          (option) => option.value === nativeCategory.value,
        )
      )
        exCategory.value = nativeCategory.value;
      if (nativeNote) exNote.value = nativeNote.value;
    }

    function openDriverExceptionAi() {
      syncDriverExceptionToAi();
      setExceptionTask("classify");
      setAiMode("exception");
    }

    function analyzeExceptions(approve, update, cancel) {
      const decisions = readLocal("exceptionDecisions", {});
      const rows = [...document.querySelectorAll("#ex-body tr[data-id]")];
      const openRows = rows.filter((row) => {
        const status = decisions[row.dataset.id]?.status;
        return !status || status === "pending";
      });
      const ranked = openRows.sort(
        (a, b) => scoreException(b) - scoreException(a),
      );
      const row =
        ranked[0] ||
        rows.sort((a, b) => scoreException(b) - scoreException(a))[0];

      if (!row)
        return {
          text: "Không tìm thấy ngoại lệ để phân tích. Hãy kiểm tra danh sách trên màn hình.",
        };
      const id = row.dataset.id;
      const type =
        row.querySelector(".t-type")?.textContent.trim() || "chưa phân loại";
      const urgency =
        row.dataset.pri === "urgent"
          ? "khẩn"
          : row.dataset.pri === "high"
            ? "ưu tiên cao"
            : "ưu tiên thường";
      const sla =
        row.dataset.sla === "near"
          ? "đang gần hạn SLA"
          : "chưa được đánh dấu gần hạn SLA";
      const status = decisions[id]?.status;
      const isOpen = !status || status === "pending";
      const text =
        `Đề xuất kiểm tra ${id} (${type}): mức ${urgency}, ${sla}. ` +
        (isOpen
          ? "Đây là mục đang chờ trong dữ liệu mẫu. Mở chi tiết rồi xác nhận, cập nhật loại hoặc bỏ qua sau khi đối chiếu bằng chứng."
          : `Mục này đã có trạng thái “${status}”. Có thể mở lại để kiểm tra lịch sử hiển thị.`);
      const buttons = [{ label: `Mở ${id}`, run: () => selectException(row) }];
      if (isOpen) {
        buttons.push(
          {
            label: "Duyệt ngoại lệ",
            run: () => approveException(row),
            secondary: true,
          },
          {
            label: "Cập nhật loại",
            run: () => editException(row),
            secondary: true,
          },
          {
            label: "Hủy / bỏ qua",
            run: () => dismissException(row),
            secondary: true,
          },
        );
      }
      return { text, buttons };
    }

    function scoreException(row) {
      const priority = { urgent: 30, high: 20, mid: 10 }[row.dataset.pri] || 0;
      return priority + (row.dataset.sla === "near" ? 15 : 0);
    }

    function selectException(row) {
      row.click();
      row.scrollIntoView({ behavior: "smooth", block: "center" });
      addMessage(
        "assistant",
        `Đã mở chi tiết ${row.dataset.id}. Đọc ghi chú/bằng chứng trước khi chọn duyệt, cập nhật hoặc bỏ qua.`,
      );
    }

    function approveException(row) {
      selectException(row);
      if (!window.confirm(`Duyệt ngoại lệ ${row.dataset.id} trong bản demo?`))
        return;
      document.querySelector("#exception-confirm")?.click();
      addMessage(
        "assistant",
        `Đã gửi thao tác duyệt ${row.dataset.id} qua luồng xử lý hiện có.`,
      );
    }

    function editException(row) {
      selectException(row);
      document.querySelector("#exception-edit")?.click();
      const select = document.querySelector("#exception-type-edit");
      select?.focus();
      addMessage(
        "assistant",
        "Chọn loại ngoại lệ trong danh sách mở ra. Thay đổi chỉ được lưu sau khi bạn chọn giá trị.",
      );
    }

    function dismissException(row) {
      selectException(row);
      if (
        !window.confirm(
          `Bỏ qua ngoại lệ ${row.dataset.id}? Hành động chỉ lưu trên trình duyệt này.`,
        )
      )
        return;
      document.querySelector("#exception-dismiss")?.click();
      addMessage(
        "assistant",
        `Đã gửi thao tác bỏ qua ${row.dataset.id} qua luồng xử lý hiện có.`,
      );
    }

    function analyzeAssignments() {
      const stops = [...document.querySelectorAll("#stops .stop")];
      const drivers = [...document.querySelectorAll("#drivers .driver")]
        .filter((item) => !item.hidden)
        .sort(
          (a, b) =>
            Number(b.dataset.free || 0) - Number(a.dataset.free || 0) ||
            Number(a.dataset.eta || 0) - Number(b.dataset.eta || 0),
        );
      if (!stops.length)
        return {
          text: "Không còn điểm dừng mẫu trong danh sách để gợi ý phân công.",
        };
      const driver = drivers[0];
      if (!driver)
        return {
          text: "Không tìm thấy tài xế đang hiển thị. Hãy tắt bộ lọc hoặc kiểm tra danh sách tài xế.",
        };
      const name = driver.dataset.name || driver.textContent.trim();
      const free = Number(driver.dataset.free || 0);
      const eta = Number(driver.dataset.eta || 0);
      return {
        text: `Có ${stops.length} điểm dừng trong danh sách. Theo dữ liệu mẫu, ${name} còn trống ${free} điểm và ETA ước tính ${eta} phút. Tôi xếp tài xế này đầu tiên theo chỗ trống, sau đó theo ETA. Hãy chọn các điểm cần chuyển rồi xác nhận.`,
        buttons: [
          { label: `Chọn ${name}`, run: () => chooseDriver(driver) },
          {
            label: "Lưu nháp",
            run: () => saveAssignmentDraft(),
            secondary: true,
          },
        ],
      };
    }

    function chooseDriver(driver) {
      const input = driver.querySelector("input");
      if (!input)
        return addMessage(
          "assistant",
          "Không tìm thấy ô chọn tài xế trong hàng được đề xuất.",
        );
      input.checked = true;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      driver.scrollIntoView({ behavior: "smooth", block: "center" });
      addMessage(
        "assistant",
        `Đã chọn ${driver.dataset.name || "tài xế"}. Kiểm tra các điểm dừng và số liệu trước khi xác nhận phân công.`,
      );
    }

    function saveAssignmentDraft() {
      const selected = [
        ...document.querySelectorAll("#stops .stop input:checked"),
      ];
      if (!selected.length) {
        addMessage(
          "assistant",
          "Bạn cần chọn ít nhất một điểm dừng trước khi lưu nháp.",
        );
        return;
      }
      if (
        !window.confirm(
          "Lưu nháp phân công vào localStorage của trình duyệt này?",
        )
      )
        return;
      document.querySelector("#draft")?.click();
      addMessage(
        "assistant",
        "Đã yêu cầu lưu nháp qua chức năng phân công hiện có.",
      );
    }

    function analyzeOverview() {
      const subtitle = document.querySelector("#chart-sub")?.textContent.trim();
      const peak = document.querySelector("#chart .bar.peak")?.title;
      return {
        text: `Tổng quan hiện dùng số liệu mẫu${subtitle ? `: ${subtitle}` : ""}${peak ? `. Cột cao nhất ${peak}` : ""}. pulse-ai không tự coi đây là số liệu thời gian thực. Nếu cần xử lý ngoại lệ, hãy mở hàng đợi và kiểm tra SLA.`,
        buttons: [
          {
            label: "Mở hàng đợi ngoại lệ",
            run: () => (window.location.href = "dispatcher-exceptions.html"),
          },
          {
            label: "Mở phân công lại",
            run: () => (window.location.href = "dispatcher-reassign.html"),
            secondary: true,
          },
        ],
      };
    }

    function analyzeStatuses(update, archive, cancel) {
      if (cancel && !document.querySelector("#status-editor")?.hidden) {
        return {
          text: "Biểu mẫu trạng thái đang mở. pulse-ai có thể hủy phần nhập hiện tại; dữ liệu chưa lưu sẽ bị bỏ.",
          buttons: [
            {
              label: "Hủy biểu mẫu",
              run: () => document.querySelector("#cancel-status")?.click(),
            },
          ],
        };
      }
      const rows = [...document.querySelectorAll("#status-body tr")];
      const customRow = rows.find((row) => {
        const button = [...row.querySelectorAll("button")].find((item) =>
          item.textContent.includes("Lưu trữ"),
        );
        return button && !button.disabled;
      });
      const total = rows.length;
      if (!customRow) {
        return {
          text: `Có ${total} trạng thái hiển thị và các mã mẫu đang được khóa. Không có trạng thái tùy chỉnh đủ điều kiện lưu trữ. Bạn có thể tạo trạng thái mới hoặc tìm một mã cần sửa.`,
          buttons: [
            {
              label: "Thêm trạng thái",
              run: () => document.querySelector("#add-status")?.click(),
            },
          ],
        };
      }
      const code =
        customRow.querySelector("td")?.textContent.trim() ||
        "trạng thái tùy chỉnh";
      const buttons = [
        { label: `Cập nhật ${code}`, run: () => editStatus(customRow) },
        {
          label: `Lưu trữ ${code}`,
          run: () => archiveStatus(customRow),
          secondary: true,
        },
      ];
      const intent = archive
        ? "Bạn yêu cầu lưu trữ; mã mặc định được bảo vệ, nên tôi chọn một mã tùy chỉnh đủ điều kiện."
        : update
          ? "Bạn yêu cầu cập nhật; tôi mở biểu mẫu để bạn xem và lưu lại."
          : "Tôi tìm thấy trạng thái tùy chỉnh có thể cập nhật hoặc lưu trữ. Mã mặc định bị khóa để tránh ảnh hưởng luồng nghiệp vụ.";
      return {
        text: `${intent} Mục đề xuất: ${code}. Có ${total} trạng thái đang hiển thị.`,
        buttons,
      };
    }

    function editStatus(row) {
      row.querySelector("button:not([disabled])")?.click();
      document
        .querySelector("#status-editor")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      addMessage(
        "assistant",
        "Biểu mẫu đã mở. Kiểm tra mã, tên, nhóm và bước chuyển tiếp rồi bấm Lưu trạng thái để xác nhận cập nhật.",
      );
    }

    function archiveStatus(row) {
      const code =
        row.querySelector("td")?.textContent.trim() || "trạng thái này";
      if (
        !window.confirm(
          `Lưu trữ ${code}? Hành động chỉ thay đổi dữ liệu demo trên trình duyệt này.`,
        )
      )
        return;
      const button = [...row.querySelectorAll("button")].find(
        (item) => item.textContent.includes("Lưu trữ") && !item.disabled,
      );
      if (!button)
        return addMessage(
          "assistant",
          "Mã này đang bị khóa nên không thể lưu trữ.",
        );
      button.click();
      addMessage(
        "assistant",
        `Đã gửi thao tác lưu trữ ${code} qua chức năng quản lý trạng thái hiện có.`,
      );
    }

    function analyzeUsers(approve, update, cancel) {
      if (cancel && !document.querySelector("#user-editor")?.hidden) {
        return {
          text: "Biểu mẫu người dùng đang mở. Hủy sẽ bỏ các chỉnh sửa chưa lưu.",
          buttons: [
            {
              label: "Hủy biểu mẫu",
              run: () => document.querySelector("#cancel-user")?.click(),
            },
          ],
        };
      }
      const rows = [...document.querySelectorAll("#user-body tr")];
      const pendingRow = rows.find((row) =>
        row.querySelector(".chip")?.textContent.includes("Chờ kích hoạt"),
      );
      if (pendingRow) {
        const cells = pendingRow.querySelectorAll("td");
        const id = cells[0]?.textContent.trim() || "tài khoản chờ";
        const name = cells[1]?.textContent.trim() || "người dùng";
        return {
          text: `Tìm thấy ${id} (${name}) đang chờ kích hoạt. Kiểm tra danh tính và vai trò ngoài bản demo trước khi duyệt. pulse-ai không thể xác minh người thật từ dữ liệu mẫu.`,
          buttons: [
            {
              label: "Mở form duyệt",
              run: () => prepareUserApproval(pendingRow, false),
            },
            {
              label: "Duyệt tài khoản",
              run: () => prepareUserApproval(pendingRow, true),
              secondary: true,
            },
          ],
        };
      }
      if (rows.length) {
        const first = rows[0];
        const id = first.querySelector("td")?.textContent.trim() || "tài khoản";
        return {
          text: `Không tìm thấy tài khoản “Chờ kích hoạt” trong danh sách hiện tại. Có ${rows.length} hàng đang hiển thị. Hãy kiểm tra dữ liệu và bộ lọc; thao tác khóa, sửa hoặc xóa cần người quản trị xác nhận.`,
          buttons: [
            {
              label: `Mở ${id}`,
              run: () => first.querySelector("button")?.click(),
            },
          ],
        };
      }
      return {
        text: "Danh sách đang trống hoặc bị lọc hết. Xóa bộ lọc rồi thử phân tích lại.",
      };
    }

    function prepareUserApproval(row, submit) {
      const editButton = [...row.querySelectorAll("button")].find(
        (button) => button.textContent.trim() === "Sửa",
      );
      editButton?.click();
      const status = document.querySelector("#user-status");
      const form = document.querySelector("#user-form");
      if (!status || !form)
        return addMessage(
          "assistant",
          "Không tìm thấy trường trạng thái hoặc form người dùng.",
        );
      status.value = "active";
      status.dispatchEvent(new Event("change", { bubbles: true }));
      document
        .querySelector("#user-editor")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (!submit) {
        addMessage(
          "assistant",
          "Đã chuẩn bị trạng thái “Đang hoạt động” trong form. Kiểm tra thông tin rồi bấm Lưu để duyệt.",
        );
        return;
      }
      const id = row.querySelector("td")?.textContent.trim() || "tài khoản";
      if (
        !window.confirm(
          `Duyệt ${id} trong dữ liệu demo và đặt trạng thái Đang hoạt động?`,
        )
      )
        return;
      form.requestSubmit();
      addMessage(
        "assistant",
        `Đã gửi yêu cầu duyệt ${id} qua form quản lý hiện có. Kiểm tra thông báo kết quả trên trang.`,
      );
    }

    function analyzeReport() {
      const onTime = document
        .querySelector("#report-ontime")
        ?.textContent.trim();
      const exceptions = document
        .querySelector("#report-exceptions")
        ?.textContent.trim();
      const range = document.querySelector("#report-range")?.value || "7";
      return {
        text: `Báo cáo đang xem kỳ ${range} ngày${onTime ? `, tỷ lệ đúng hẹn ${onTime}` : ""}${exceptions ? `, tỷ lệ ngoại lệ ${exceptions}` : ""}. Đây là dữ liệu tổng hợp mẫu. Hãy so sánh từng trung tâm và kiểm tra nguồn dữ liệu trước khi ra quyết định vận hành.`,
        buttons: [
          {
            label: "Tải CSV mẫu",
            run: () => document.querySelector("#export-report")?.click(),
          },
          {
            label: "Lưu kỳ báo cáo",
            run: () => document.querySelector("#save-report")?.click(),
            secondary: true,
          },
        ],
      };
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      ask(input.value);
    });
    panel.querySelectorAll("[data-copilot-prompt]").forEach((button) => {
      button.addEventListener("click", () => ask(button.dataset.copilotPrompt));
    });

    addMessage(
      "assistant",
      `Xin chào ${roleName}. Tôi có thể phân tích màn hình, tìm việc cần duyệt và mở thao tác cập nhật. Mọi thay đổi quan trọng đều cần bạn xem lại.`,
    );
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }

  function escapeHTML(value) {
    return String(value).replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  }
})();
