/* ParcelPulse Pulse AI demo.
   Local rule-based assistance only; no remote AI model or API is called. */
(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector("[data-copilot-root]")) return;

    const roleName =
      document.querySelector(".role-chip")?.textContent.trim() || "ParcelPulse";
    const pageName = window.location.pathname.split("/").pop() || "";
    const launcher = document.createElement("button");
    launcher.className = "copilot-launcher";
    launcher.type = "button";
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-controls", "copilot-panel");
    launcher.innerHTML = '<span aria-hidden="true">✦</span> Pulse AI';

    const panel = document.createElement("section");
    panel.className = "copilot-panel";
    panel.id = "copilot-panel";
    panel.dataset.copilotRoot = "true";
    panel.hidden = true;
    panel.setAttribute("aria-label", "Pulse AI vận hành ParcelPulse");
    panel.innerHTML = `
      <header class="copilot-header">
        <div class="copilot-mark" aria-hidden="true">✦</div>
        <div class="copilot-heading">
          <strong>Pulse AI</strong>
          <span>Tính năng AI số 3 · ${escapeHTML(roleName)} · demo</span>
        </div>
        <button class="copilot-close" type="button" aria-label="Đóng trợ lý">×</button>
      </header>
      <p class="copilot-disclaimer">Pulse AI phân tích dữ liệu mẫu bằng quy tắc cục bộ, chưa kết nối mô hình AI/API. Hãy xem lại đề xuất trước khi duyệt.</p>
      <div class="copilot-mode-switch" role="tablist" aria-label="Chế độ Pulse AI">
        <button type="button" role="tab" aria-selected="true" class="is-active" data-ai-mode="chat">Trợ lý vận hành</button>
        <button id="eta-mode-tab" type="button" role="tab" aria-selected="false" data-ai-mode="eta">AI-2 · Giải thích ETA</button>
      </div>
      <div class="copilot-workspace">
        <div class="copilot-chat-view" id="copilot-chat-view">
          <div class="copilot-messages" id="copilot-messages" role="log" aria-live="polite" aria-relevant="additions text"></div>
          <div class="copilot-quick-actions" aria-label="Câu lệnh gợi ý">
            <button type="button" data-copilot-prompt="Phân tích màn hình này">Phân tích màn hình</button>
            <button type="button" data-copilot-prompt="Tìm việc cần duyệt">Tìm việc cần duyệt</button>
            <button type="button" data-copilot-prompt="Giải thích ETA">Giải thích ETA</button>
          </div>
          <form class="copilot-form" id="copilot-form">
            <label class="sr-only" for="copilot-input">Hỏi Pulse AI</label>
            <input id="copilot-input" name="prompt" maxlength="240" autocomplete="off" placeholder="Hỏi về việc cần xử lý..." />
            <button type="submit" aria-label="Gửi câu hỏi">Gửi</button>
          </form>
        </div>
        <section class="eta-workflow" id="eta-workflow" role="tabpanel" aria-labelledby="eta-mode-tab" hidden>
          <div class="eta-workflow-scroll">
            <div class="eta-title-row"><div><p class="eta-eyebrow">AI-2 · ETA EXPLAINABILITY</p><h2>Ước tính thời gian đến</h2></div><span class="eta-mock-badge">Mô phỏng</span></div>
            <p class="eta-intro">Nhập thông tin tuyến. Pulse AI sẽ tính ETA theo quy tắc mẫu và nêu rõ yếu tố ảnh hưởng.</p>
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
              <form id="eta-edit-form" class="eta-edit-form" hidden>
                <label>Giờ đến đề xuất<input id="eta-edit-time" type="time" required /></label>
                <label>Ghi chú điều chỉnh<textarea id="eta-edit-note" rows="2" maxlength="240" placeholder="Giải thích lý do sửa ETA..."></textarea></label>
                <div class="eta-form-actions"><button class="copilot-action" type="submit">Áp dụng sửa</button><button class="copilot-action copilot-action--secondary" id="eta-cancel-edit" type="button">Bỏ sửa</button></div>
              </form>
              <p class="eta-decision" id="eta-decision" role="status" aria-live="polite" hidden></p>
              <div class="eta-decision-actions" aria-label="Xử lý kết quả ETA">
                <button class="copilot-action" id="eta-accept" type="button">Chấp nhận</button>
                <button class="copilot-action copilot-action--secondary" id="eta-edit" type="button">Sửa</button>
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
    const etaForm = panel.querySelector("#eta-input-form");
    const etaResult = panel.querySelector("#eta-result");
    const etaProcessing = panel.querySelector("#eta-processing");
    const etaEditForm = panel.querySelector("#eta-edit-form");

    if (!["Điều phối viên", "Quản trị viên"].includes(roleName)) return;

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
        actions.forEach(({ label, run, secondary = false }) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = secondary
            ? "copilot-action copilot-action--secondary"
            : "copilot-action";
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
      chatView.hidden = showEta;
      etaView.hidden = !showEta;
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
      }
    }

    function loadEtaSample() {
      const parcelId = panel.querySelector("#eta-parcel-id").value.trim().toUpperCase();
      const sample = etaSamples[parcelId];
      const notice = panel.querySelector("#eta-decision");
      if (!sample) {
        notice.hidden = false;
        notice.textContent = "Không có mã này trong JSON mẫu. Nhập các thông tin tuyến thủ công rồi bấm Phân tích ETA.";
        return;
      }
      Object.entries(sample).forEach(([key, value]) => {
        const field = etaForm.elements.namedItem(key);
        if (field) field.value = value;
      });
      panel.querySelector("#eta-json-preview").textContent = JSON.stringify(sample, null, 2);
      notice.hidden = false;
      notice.textContent = `Đã nạp JSON mẫu cho ${sample.parcelId}. Bạn có thể sửa dữ liệu trước khi phân tích.`;
    }

    function readEtaInputs() {
      return {
        parcelId: panel.querySelector("#eta-parcel-id").value.trim().toUpperCase(),
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
      const statusMinutes = { out_for_delivery: 0, sorting: 12, handoff: 5 }[input.status];
      const retryMinutes = etaRevision ? (etaRevision % 3) * 2 : 0;
      const totalMinutes = driveMinutes + trafficMinutes + weatherMinutes + loadMinutes + statusMinutes + retryMinutes;
      const arrival = new Date(Date.now() + totalMinutes * 60_000);
      const etaTime = new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(arrival);
      const confidence = Math.max(65, 92 - (input.distanceKm > 80 ? 14 : input.distanceKm > 40 ? 8 : 0));

      return {
        id: `ETA-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        parcelId: input.parcelId,
        input,
        etaTime,
        totalMinutes,
        confidence,
        decision: "pending",
        reasons: [
          ["Thời gian di chuyển", `${input.distanceKm} km, giả định tốc độ trung bình 25 km/h`, driveMinutes],
          ["Giao thông", etaFieldNames.traffic[input.traffic], trafficMinutes],
          ["Thời tiết", etaFieldNames.weather[input.weather], weatherMinutes],
          ["Tải tuyến", etaFieldNames.routeLoad[input.routeLoad], loadMinutes],
          ["Trạng thái kiện", etaFieldNames.status[input.status], statusMinutes],
          ...(retryMinutes ? [["Điều chỉnh khi tạo lại", "Biên độ mô phỏng của lần chạy lại", retryMinutes]] : []),
        ],
        createdAt: new Date().toISOString(),
      };
    }

    function renderEtaResult() {
      if (!currentEta) return;
      panel.querySelector("#eta-result-time").textContent = currentEta.etaTime;
      panel.querySelector("#eta-confidence").textContent = `Tin cậy mô phỏng ${currentEta.confidence}%`;
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
        localStorage.setItem("parcelpulse.etaEstimates", JSON.stringify(estimates.slice(0, 100)));
        renderEtaResult();
      } catch {
        currentEta.decisionMessage = "Không lưu được trên thiết bị này. Kiểm tra quyền lưu localStorage.";
        renderEtaResult();
      }
    }

    panel.querySelectorAll("[data-ai-mode]").forEach((button) => {
      button.addEventListener("click", () => setAiMode(button.dataset.aiMode));
    });
    panel.querySelector("#eta-use-sample").addEventListener("click", loadEtaSample);
    etaForm.addEventListener("submit", (event) => {
      event.preventDefault();
      etaRevision = 0;
      runEtaAnalysis();
    });
    panel.querySelector("#eta-accept").addEventListener("click", () => {
      if (!currentEta || !window.confirm(`Chấp nhận ETA ${currentEta.etaTime} cho kiện ${currentEta.parcelId}?`)) return;
      currentEta.decision = "accepted";
      currentEta.acceptedAt = new Date().toISOString();
      persistEta(`Đã chấp nhận ETA ${currentEta.etaTime} trong dữ liệu demo.`);
    });
    panel.querySelector("#eta-edit").addEventListener("click", () => {
      if (!currentEta) return;
      panel.querySelector("#eta-edit-time").value = currentEta.etaTime;
      etaEditForm.hidden = false;
      panel.querySelector("#eta-edit-time").focus();
    });
    etaEditForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!currentEta) return;
      currentEta.etaTime = panel.querySelector("#eta-edit-time").value;
      currentEta.editNote = panel.querySelector("#eta-edit-note").value.trim();
      currentEta.decision = "edited";
      etaEditForm.hidden = true;
      persistEta(`Đã sửa ETA thành ${currentEta.etaTime}${currentEta.editNote ? ` · ${currentEta.editNote}` : ""}.`);
    });
    panel.querySelector("#eta-cancel-edit").addEventListener("click", () => {
      etaEditForm.hidden = true;
    });
    panel.querySelector("#eta-reject").addEventListener("click", () => {
      if (!currentEta || !window.confirm(`Từ chối đề xuất ETA cho kiện ${currentEta.parcelId}?`)) return;
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

    function ask(prompt) {
      const question = prompt.trim();
      if (!question) return;
      addMessage("user", question);
      input.value = "";
      if (/eta|thời gian đến|khi nào đến|bao giờ đến/.test(question.toLocaleLowerCase("vi-VN"))) {
        setAiMode("eta");
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
        text: `Tổng quan hiện dùng số liệu mẫu${subtitle ? `: ${subtitle}` : ""}${peak ? `. Cột cao nhất ${peak}` : ""}. Pulse AI không tự coi đây là số liệu thời gian thực. Nếu cần xử lý ngoại lệ, hãy mở hàng đợi và kiểm tra SLA.`,
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
          text: "Biểu mẫu trạng thái đang mở. Pulse AI có thể hủy phần nhập hiện tại; dữ liệu chưa lưu sẽ bị bỏ.",
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
          text: `Tìm thấy ${id} (${name}) đang chờ kích hoạt. Kiểm tra danh tính và vai trò ngoài bản demo trước khi duyệt. Pulse AI không thể xác minh người thật từ dữ liệu mẫu.`,
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
  });

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
