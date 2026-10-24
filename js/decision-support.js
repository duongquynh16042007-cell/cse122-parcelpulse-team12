/* Local, rule-based decision support for dispatcher screens. This is not an AI API. */
document.addEventListener("DOMContentLoaded", () => {
  const read = (key, fallback) => {
    try {
      const value = localStorage.getItem(`parcelpulse.${key}`);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  };
  const write = (key, value) => {
    try {
      localStorage.setItem(`parcelpulse.${key}`, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  };
  const toast = (message) => window.ParcelPulseRolePages?.toast(message);

  document.querySelectorAll("[data-ai-feature]").forEach((panel) => {
    const feature = panel.dataset.aiFeature;
    const $ = (selector) => panel.querySelector(selector);
    const input = $(`[data-ai-input]`);
    const state = $(`[data-ai-state]`);
    const output = $(`[data-ai-output]`);
    const run = $(`[data-ai-run]`);
    const save = $(`[data-ai-save]`);
    let suggestion = null;
    let accepted = false;
    let generation = 0;

    const propose = () => {
      const context = input.value.trim();
      if (feature === "overview") {
        const alerts = [...document.querySelectorAll('section[aria-labelledby="alert-title"] .rows li')].map((item) => item.textContent.trim());
        if (context.length < 8 && alerts.length === 0) return { error: "Thêm ngữ cảnh hoặc cảnh báo để có cơ sở phân tích." };
        return { title: "Ưu tiên rà soát ngoại lệ khẩn và các điểm gần SLA trước; xác minh cảnh báo tại Long Biên/Hà Đông.", confidence: 72, factors: ["Bối cảnh ghi nhận 12 ngoại lệ cần xử lý.", "Cảnh báo mẫu nêu tuyến Long Biên có ETA rủi ro và Hà Đông thiếu tài xế.", "Đây là gợi ý từ dữ liệu tĩnh; cần kiểm tra hệ thống vận hành thật."], apply: "Ghi nhận tóm tắt ưu tiên điều hành." };
      }
      if (feature === "exception") {
        const id = document.querySelector("#exception-detail-id")?.textContent.trim();
        const type = document.querySelector("#exception-detail-type")?.textContent.trim();
        const row = id && document.querySelector(`tr[data-id="${CSS.escape(id)}"]`);
        if (!id || !row) return { error: "Chọn một ngoại lệ trong bảng trước khi phân tích." };
        const urgent = row.dataset.pri === "urgent";
        const near = row.dataset.sla === "near";
        const text = `${urgent || near ? "Ưu tiên xác minh ngay" : "Đối chiếu thêm trước khi đóng"} ngoại lệ ${id} (${type}). Kiểm tra bằng chứng với tài xế rồi mới xác nhận xử lý.`;
        return { title: text, confidence: urgent && near ? 84 : 68, factors: [`Mã ngoại lệ: ${id}; loại: ${type}.`, `Mức ưu tiên: ${row.dataset.pri}; SLA: ${near ? "sắp đến hạn" : "chưa sát hạn"}.`, context ? `Ghi chú điều hành: ${context}` : "Chưa có ghi chú bổ sung; kết quả chỉ dựa trên dữ liệu bảng."], apply: "Xác nhận ngoại lệ đang mở" };
      }
      const stops = [...document.querySelectorAll("#stops .stop input:checked")].map((checkbox) => checkbox.closest(".stop"));
      if (!stops.length) return { error: "Chọn ít nhất một điểm dừng trước khi đề xuất tài xế." };
      const drivers = [...document.querySelectorAll("#drivers .driver")].filter((driver) => !driver.hidden);
      if (!drivers.length) return { error: "Không có tài xế khả dụng theo bộ lọc hiện tại." };
      const preferred = drivers
        .map((driver) => ({ driver, free: Number(driver.dataset.free), eta: Number(driver.dataset.eta) }))
        .filter(({ free }) => free >= stops.length)
        .sort((a, b) => a.eta - b.eta || b.free - a.free)[0];
      if (!preferred) return { error: "Không đủ dữ liệu về tài xế còn chỗ cho số điểm đã chọn. Bỏ bớt điểm hoặc đổi bộ lọc." };
      return { title: `Ưu tiên ${preferred.driver.dataset.name} cho ${stops.length} điểm dừng đã chọn.`, confidence: 80, factors: [`Còn chỗ nhận ${preferred.free} điểm; đang chọn ${stops.length}.`, `ETA tăng khoảng ${preferred.eta} phút.`, `Gợi ý dựa trên tải/ETA mẫu, chưa tính giao thông trực tiếp.${context ? ` Ràng buộc: ${context}` : ""}`], apply: preferred.driver.dataset.name, driver: preferred.driver.dataset.name };
    };

    const render = (result) => {
      suggestion = result;
      accepted = false;
      output.hidden = false;
      state.textContent = result.error ? `Chưa thể đề xuất: ${result.error}` : "Đã phân tích dữ liệu mẫu. Hãy kiểm tra lý do và tự quyết định.";
      state.dataset.tone = result.error ? "error" : "success";
      $(`[data-ai-summary]`).textContent = result.error || result.title;
      $(`[data-ai-confidence]`).textContent = result.error ? "Độ tin cậy: chưa đủ dữ liệu" : `Mức phù hợp tham khảo: ${result.confidence}% · Không phải xác suất AI đã hiệu chuẩn.`;
      const list = $(`[data-ai-factors]`);
      list.replaceChildren(...(result.factors || []).map((factor) => {
        const li = document.createElement("li");
        li.textContent = factor;
        return li;
      }));
      $(`[data-ai-edit]`).value = result.error ? "" : result.title;
      save.disabled = true;
      save.textContent = feature === "route" ? "Áp dụng gợi ý" : feature === "overview" ? "Lưu gợi ý" : "Lưu/áp dụng";
      [...panel.querySelectorAll("[data-ai-accept], [data-ai-edit-action], [data-ai-reject], [data-ai-regenerate]")].forEach((button) => { button.disabled = Boolean(result.error); });
    };

    run.addEventListener("click", () => {
      const token = ++generation;
      output.hidden = true;
      state.textContent = "Đang phân tích dữ liệu mẫu…";
      state.dataset.tone = "loading";
      run.disabled = true;
      window.setTimeout(() => {
        run.disabled = false;
        if (token === generation) render(propose());
      }, 350);
    });
    $(`[data-ai-accept]`).addEventListener("click", () => {
      if (!suggestion || suggestion.error) return;
      accepted = true;
      save.disabled = false;
      state.textContent = "Đã chấp nhận bản xem trước; chưa ghi vào ứng dụng cho đến khi bấm Lưu/áp dụng.";
    });
    $(`[data-ai-edit-action]`).addEventListener("click", () => {
      if (!suggestion || suggestion.error) return;
      $(`[data-ai-edit]`).focus();
      state.textContent = "Sửa nội dung gợi ý, sau đó bấm Chấp nhận và Lưu/áp dụng.";
    });
    $(`[data-ai-reject]`).addEventListener("click", () => {
      accepted = false;
      save.disabled = true;
      state.textContent = "Đã từ chối gợi ý; chưa có dữ liệu nào thay đổi.";
    });
    $(`[data-ai-regenerate]`).addEventListener("click", () => run.click());
    save.addEventListener("click", () => {
      if (!accepted || !suggestion || suggestion.error) return;
      const note = $(`[data-ai-edit]`).value.trim();
      if (!note) {
        state.textContent = "Gợi ý đang trống. Hãy nhập nội dung trước khi lưu.";
        return;
      }
      let applied = true;
      if (feature === "exception") {
        const confirm = document.querySelector("#exception-confirm");
        const id = document.querySelector("#exception-detail-id")?.textContent.trim();
        if (!confirm || !id) applied = false;
        else {
          confirm.click();
          applied = read("exceptionDecisions", {})[id]?.status === "confirmed";
        }
      } else if (feature === "route") {
        const driver = [...document.querySelectorAll("#drivers .driver")].find((item) => item.dataset.name === suggestion.driver);
        if (!driver) applied = false;
        else {
          driver.querySelector("input[type=radio]").checked = true;
          driver.querySelector("input[type=radio]").dispatchEvent(new Event("change", { bubbles: true }));
          applied = write("assignmentDraft", {
            stopIds: [...document.querySelectorAll("#stops .stop input:checked")].map((checkbox) => checkbox.closest(".stop").querySelector(".meta b").textContent.trim()),
            driver: suggestion.driver,
            savedAt: new Date().toISOString(),
          });
        }
      }
      if (!applied) {
        state.textContent = "Không thể áp dụng do phần tử mục tiêu không còn trên màn hình. Hãy phân tích lại.";
        state.dataset.tone = "error";
        return;
      }
      const activity = read("decisionSupport", []);
      activity.unshift({ feature, note, savedAt: new Date().toISOString() });
      if (!write("decisionSupport", activity.slice(0, 30))) {
        state.textContent = "Trình duyệt không cho phép lưu localStorage. Gợi ý chưa được ghi bền.";
        state.dataset.tone = "error";
        return;
      }
      accepted = false;
      save.disabled = true;
      state.textContent = "Đã lưu gợi ý vào dữ liệu demo cục bộ.";
      state.dataset.tone = "success";
      toast("Đã lưu gợi ý nghiệp vụ vào trình duyệt.");
    });
  });
});
