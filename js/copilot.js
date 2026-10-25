/* ParcelPulse Copilot demo.
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
    launcher.innerHTML = '<span aria-hidden="true">✦</span> AI Copilot';

    const panel = document.createElement("section");
    panel.className = "copilot-panel";
    panel.id = "copilot-panel";
    panel.dataset.copilotRoot = "true";
    panel.hidden = true;
    panel.setAttribute("aria-label", "Trợ lý AI vận hành ParcelPulse");
    panel.innerHTML = `
      <header class="copilot-header">
        <div class="copilot-mark" aria-hidden="true">✦</div>
        <div class="copilot-heading">
          <strong>ParcelPulse Copilot</strong>
          <span>Tính năng AI số 3 · ${escapeHTML(roleName)} · demo</span>
        </div>
        <button class="copilot-close" type="button" aria-label="Đóng trợ lý">×</button>
      </header>
      <p class="copilot-disclaimer">Copilot phân tích dữ liệu mẫu bằng quy tắc cục bộ, chưa kết nối mô hình AI/API. Hãy xem lại đề xuất trước khi duyệt.</p>
      <div class="copilot-messages" id="copilot-messages" role="log" aria-live="polite" aria-relevant="additions text"></div>
      <div class="copilot-quick-actions" aria-label="Câu lệnh gợi ý">
        <button type="button" data-copilot-prompt="Phân tích màn hình này">Phân tích màn hình</button>
        <button type="button" data-copilot-prompt="Tìm việc cần duyệt">Tìm việc cần duyệt</button>
      </div>
      <form class="copilot-form" id="copilot-form">
        <label class="sr-only" for="copilot-input">Hỏi AI Copilot</label>
        <input id="copilot-input" name="prompt" maxlength="240" autocomplete="off" placeholder="Hỏi về việc cần xử lý..." />
        <button type="submit" aria-label="Gửi câu hỏi">Gửi</button>
      </form>`;

    document.body.append(launcher, panel);

    const messages = panel.querySelector("#copilot-messages");
    const input = panel.querySelector("#copilot-input");
    const form = panel.querySelector("#copilot-form");
    const closeButton = panel.querySelector(".copilot-close");

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

    function ask(prompt) {
      const question = prompt.trim();
      if (!question) return;
      addMessage("user", question);
      input.value = "";
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
        text: `Tổng quan hiện dùng số liệu mẫu${subtitle ? `: ${subtitle}` : ""}${peak ? `. Cột cao nhất ${peak}` : ""}. Copilot không tự coi đây là số liệu thời gian thực. Nếu cần xử lý ngoại lệ, hãy mở hàng đợi và kiểm tra SLA.`,
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
          text: "Biểu mẫu trạng thái đang mở. Copilot có thể hủy phần nhập hiện tại; dữ liệu chưa lưu sẽ bị bỏ.",
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
          text: `Tìm thấy ${id} (${name}) đang chờ kích hoạt. Kiểm tra danh tính và vai trò ngoài bản demo trước khi duyệt. Copilot không thể xác minh người thật từ dữ liệu mẫu.`,
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
