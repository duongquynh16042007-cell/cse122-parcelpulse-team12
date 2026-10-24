/* ParcelPulse — vai trò Điều phối viên
   Một file dùng cho cả 3 trang. Mỗi khối chỉ chạy khi trang có phần tử tương ứng. */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const fmt = (n) =>
  n.toLocaleString("vi-VN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

/* ===== Thông báo nổi (toast) ===== */
let toastTimer;
function toast(message) {
  const settings = JSON.parse(
    localStorage.getItem("parcelpulse.profileSettings") ||
      '{"notifications":true}',
  );
  if (settings.notifications === false) return;
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}

/* ===== Trang Điều hành: biểu đồ cột theo giờ ===== */
const chart = $("#chart");
if (chart) {
  const DATA = {
    today: {
      label: "788 kiện đã nhận đơn hôm nay",
      values: [44, 58, 50, 68, 62, 76, 58, 72, 88, 64, 70, 78],
    },
    yesterday: {
      label: "728 kiện đã nhận đơn hôm qua",
      values: [40, 55, 47, 62, 66, 70, 60, 64, 74, 60, 62, 68],
    },
  };

  // Tạo 12 cột (08:00 → 19:00) một lần, sau đó chỉ đổi chiều cao để có hiệu ứng mượt
  const bars = DATA.today.values.map(() => {
    const bar = document.createElement("div");
    bar.className = "bar";
    chart.append(bar);
    return bar;
  });

  function drawChart(range) {
    const { label, values } = DATA[range];
    const max = Math.max(...values);
    bars.forEach((bar, i) => {
      bar.style.setProperty("--h", `${values[i]}%`);
      bar.classList.toggle("peak", values[i] === max);
      bar.title = `${String(8 + i).padStart(2, "0")}:00 · ${values[i]} kiện`;
    });
    $("#chart-sub").textContent = label;
    chart.setAttribute(
      "aria-label",
      `Biểu đồ cột sản lượng giao theo giờ, cao điểm lúc ${8 + values.indexOf(max)}:00 với ${max} kiện`,
    );
    $$("[data-range]").forEach((btn) =>
      btn.setAttribute("aria-pressed", String(btn.dataset.range === range)),
    );
  }

  $$("[data-range]").forEach((btn) =>
    btn.addEventListener("click", () => drawChart(btn.dataset.range)),
  );
  drawChart("today");
}

/* ===== Trang Hàng đợi ngoại lệ ===== */
const exBody = $("#ex-body");
if (exBody) {
  const TYPES = [
    "Không liên hệ được",
    "Địa chỉ không hợp lệ",
    "Kiện hàng hư hỏng",
    "Khách đổi lịch",
    "Xe gặp sự cố",
  ];
  const STATUS = {
    pending: ["Chờ xử lý", "amber"],
    confirmed: ["Đã xác nhận", "green"],
    edited: ["Đã chỉnh sửa", "indigo"],
    dismissed: ["Đã bỏ qua", "red"],
  };

  const EXCEPTION_DETAILS = {
    "EX-10482": {
      type: "Không liên hệ được",
      text: "Tài xế gọi 3 lần cho người nhận tại điểm giao CG-14 nhưng không có phản hồi.",
      note: "Ghi chú tài xế nêu rõ 3 cuộc gọi nhỡ. Kiểm tra lịch sử liên hệ trước khi quyết định bước tiếp theo.",
    },
    "EX-10479": {
      type: "Địa chỉ không hợp lệ",
      text: "Địa chỉ của kiện PTVN-7730-3308 không khớp số nhà trong khu vực LB-08, tài xế không tìm được điểm giao.",
      note: "Ghi chú đề cập 'không có số 42 trong ngõ này'. Địa chỉ đối chiếu bản đồ còn thiếu phường/xã.",
    },
    "EX-10474": {
      type: "Kiện hàng hư hỏng",
      text: "Kiện hàng PTVN-0294-7751 bị hư hỏng trong quá trình vận chuyển, tài xế ghi nhận tại điểm giao HD-03.",
      note: "Ghi chú tài xế đề cập 'hộp bị móp, hàng ướt'. Kiểm tra ảnh bằng chứng và lịch sử tuyến trước khi xử lý.",
    },
    "EX-10468": {
      type: "Khách đổi lịch",
      text: "Người nhận đề nghị dời giao hàng sang khung giờ chiều tại điểm CG-09.",
      note: "Đối chiếu yêu cầu đổi lịch của người nhận với ghi chú của tài xế.",
    },
    "EX-10461": {
      type: "Xe gặp sự cố",
      text: "Xe của tài xế gặp sự cố trên tuyến LB-12, các điểm giao còn lại có nguy cơ trễ.",
      note: "Ghi chú nêu 'xe thủng lốp, chờ cứu hộ'. Liên hệ tài xế để cập nhật tình trạng tuyến.",
    },
  };

  const rows = $$("tr[data-id]", exBody);
  const decisions = {}; // lưu quyết định của điều phối viên theo mã ngoại lệ
  let currentId = null;

  function renderException(id) {
    currentId = id;
    const data = EXCEPTION_DETAILS[id];
    const decision = decisions[id] || {};
    const [statusText, statusColor] = STATUS[decision.status || "pending"];

    $("#exception-detail-id").textContent = id;
    $("#exception-detail-type").textContent = decision.type || data.type;
    $("#exception-detail-type").hidden = false;
    $("#exception-type-edit").hidden = true;
    $("#exception-detail-text").textContent = data.text;
    $("#exception-detail-note").textContent = data.note;
    $("#exception-detail-status").textContent = statusText;
    $("#exception-detail-status").className = `chip ${statusColor}`;
  }

  function selectRow(row) {
    rows.forEach((r) => r.removeAttribute("aria-current"));
    row.setAttribute("aria-current", "true");
    renderException(row.dataset.id);
  }

  rows.forEach((row) => {
    row.addEventListener("click", () => selectRow(row));
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectRow(row);
      }
    });
  });

  // --- Thao tác xử lý thủ công ---
  const typeEdit = $("#exception-type-edit");
  typeEdit.innerHTML = TYPES.map((t) => `<option>${t}</option>`).join("");

  function decide(status, message) {
    decisions[currentId] = { ...decisions[currentId], status };
    renderException(currentId);
    toast(message);
  }

  $("#exception-confirm").addEventListener("click", () =>
    decide("confirmed", `Đã xác nhận loại ngoại lệ cho ${currentId}`),
  );
  $("#exception-dismiss").addEventListener("click", () =>
    decide("dismissed", `Đã bỏ qua ngoại lệ ${currentId}`),
  );

  $("#exception-edit").addEventListener("click", () => {
    typeEdit.value = $("#exception-detail-type").textContent;
    typeEdit.hidden = !typeEdit.hidden;
    $("#exception-detail-type").hidden = !typeEdit.hidden;
    if (!typeEdit.hidden) typeEdit.focus();
  });

  typeEdit.addEventListener("change", () => {
    decisions[currentId] = { status: "edited", type: typeEdit.value };
    $(`tr[data-id="${currentId}"] .t-type`).textContent = typeEdit.value;
    renderException(currentId);
    toast(`Đã đổi loại của ${currentId} thành "${typeEdit.value}"`);
  });

  // --- Lọc: chip nhanh + ô tìm kiếm + bộ lọc theo loại ---
  let quick = "all";
  let query = "";
  let typeFilter = "";

  const emptyRow = document.createElement("tr");
  emptyRow.innerHTML =
    '<td class="empty" colspan="6">Không có ngoại lệ phù hợp. Thử đổi từ khóa hoặc bỏ bộ lọc.</td>';
  emptyRow.hidden = true;
  exBody.append(emptyRow);

  function applyFilters() {
    let shown = 0;
    rows.forEach((row) => {
      const matchQuick =
        quick === "all" ||
        (quick === "urgent" && row.dataset.pri === "urgent") ||
        (quick === "near" && row.dataset.sla === "near");
      const matchQuery = row.textContent.toLowerCase().includes(query);
      const matchType =
        !typeFilter || $(".t-type", row).textContent === typeFilter;
      const visible = matchQuick && matchQuery && matchType;
      row.hidden = !visible;
      if (visible) shown++;
    });
    emptyRow.hidden = shown > 0;
    $("#count").textContent =
      quick === "all" && !query && !typeFilter
        ? "Hiển thị 1–5 trong 36 ngoại lệ"
        : `Hiển thị ${shown} ngoại lệ khớp bộ lọc ở trang này`;
  }

  $$("[data-filter]").forEach((btn) =>
    btn.addEventListener("click", () => {
      quick = btn.dataset.filter;
      $$("[data-filter]").forEach((b) =>
        b.setAttribute("aria-pressed", String(b === btn)),
      );
      applyFilters();
    }),
  );

  $("#q").addEventListener("input", (e) => {
    query = e.target.value.trim().toLowerCase();
    applyFilters();
  });

  const typeSelect = $("#type-select");
  typeSelect.innerHTML =
    '<option value="">Mọi loại</option>' +
    TYPES.map((t) => `<option>${t}</option>`).join("");
  typeSelect.addEventListener("change", () => {
    typeFilter = typeSelect.value;
    applyFilters();
  });

  $("#filter-toggle").addEventListener("click", (e) => {
    typeSelect.hidden = !typeSelect.hidden;
    e.currentTarget.setAttribute("aria-expanded", String(!typeSelect.hidden));
    if (typeSelect.hidden) {
      typeSelect.value = "";
      typeFilter = "";
      applyFilters();
    } else {
      typeSelect.focus();
    }
  });

  // Phân trang: bản demo chỉ có dữ liệu mẫu ở trang 1
  $$(".pager .page, .pager .step").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (btn.textContent.trim() !== "1")
        toast("Bản demo chỉ có dữ liệu mẫu ở trang 1");
    }),
  );

  selectRow($('tr[aria-current="true"]'));
}

/* ===== Trang Phân công lại ===== */
const stopsBox = $("#stops");
if (stopsBox) {
  const driversBox = $("#drivers");
  const stops = () => $$(".stop", stopsBox);
  const checkedStops = () => stops().filter((s) => $("input", s).checked);
  const drivers = () => $$(".driver", driversBox);
  const pickedDriver = () => drivers().find((d) => $("input", d).checked);

  // Tính lại mọi con số mỗi khi người dùng đổi điểm dừng hoặc tài xế
  function update() {
    const selected = checkedStops();
    const parcels = selected.reduce(
      (sum, s) => sum + Number(s.dataset.kien),
      0,
    );
    const km = selected.reduce((sum, s) => sum + Number(s.dataset.km), 0);
    const driver = pickedDriver();
    const ready = Boolean(driver) && selected.length > 0;

    $("#stops-foot").textContent =
      `Đang chọn ${selected.length} điểm · ${parcels} kiện · ${fmt(km)} km`;
    $("#stops-empty").hidden = stops().length > 0;
    $("#stops-all").setAttribute(
      "aria-pressed",
      String(stops().length > 0 && selected.length === stops().length),
    );

    $("#sum-sub").textContent = ready
      ? `${selected.length} điểm · ${parcels} kiện → ${driver.dataset.name}`
      : "Chọn điểm dừng và tài xế để xem thay đổi";
    $("#sum-eta").textContent = ready ? `+${driver.dataset.eta} phút` : "–";
    $("#sum-km").textContent = ready
      ? `${fmt(Number(driver.dataset.base) + km)} km`
      : "–";
    $("#sum-sla").textContent = ready
      ? `${Number(driver.dataset.eta) <= 10 ? selected.length : Math.max(0, selected.length - 1)}/${selected.length} đúng hẹn`
      : "–";
    $("#confirm").disabled = !ready;
  }

  stopsBox.addEventListener("change", update);
  driversBox.addEventListener("change", update);

  $("#stops-all").addEventListener("click", () => {
    const allChecked = checkedStops().length === stops().length;
    stops().forEach((s) => ($("input", s).checked = !allChecked));
    update();
  });

  // Nút "Lọc": chỉ hiện tài xế còn trống từ 5 điểm dừng
  $("#drivers-filter").addEventListener("click", (e) => {
    const on = e.currentTarget.getAttribute("aria-pressed") !== "true";
    e.currentTarget.setAttribute("aria-pressed", String(on));
    drivers().forEach((d) => (d.hidden = on && Number(d.dataset.free) < 5));
    $("#drivers-sub").textContent = on
      ? "Còn trống từ 5 điểm dừng"
      : "Trong bán kính 6 km";
  });

  $("#draft").addEventListener("click", () => toast("Đã lưu nháp phân công"));

  // --- Xác nhận: chuyển các điểm đã chọn đi và gỡ chúng khỏi danh sách ---
  $("#confirm").addEventListener("click", () => {
    const selected = checkedStops();
    const driver = pickedDriver();
    if (!selected.length || !driver) return;
    selected.forEach((s) => s.remove());
    toast(`Đã chuyển ${selected.length} điểm cho ${driver.dataset.name}`);
    update();
  });

  update();
}
