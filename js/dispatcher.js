/* ParcelPulse — vai trò Điều phối viên
   Một file dùng cho cả 3 trang. Mỗi khối chỉ chạy khi trang có phần tử tương ứng. */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const fmt = (n) =>
  n.toLocaleString("vi-VN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
const readStore = (key, fallback) => {
  try {
    const value = localStorage.getItem(`parcelpulse.${key}`);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
};
const writeStore = (key, value) => {
  try {
    localStorage.setItem(`parcelpulse.${key}`, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

/* ===== Thông báo nổi (toast) ===== */
let toastTimer;
function toast(message) {
  let settings = { notifications: true };
  try {
    settings = JSON.parse(
      localStorage.getItem("parcelpulse.profileSettings") ||
        '{"notifications":true}',
    );
  } catch {
    // A corrupted preference must not prevent the page interaction.
  }
  if (settings.notifications === false) return;
  const el = $("#toast");
  if (!el) return;
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
      stop: "STP-10463",
      parcel: "PTVN-5821-0112",
    },
    "EX-10479": {
      type: "Địa chỉ không hợp lệ",
      text: "Địa chỉ của kiện PTVN-7730-3308 không khớp số nhà trong khu vực LB-08, tài xế không tìm được điểm giao.",
      note: "Ghi chú đề cập 'không có số 42 trong ngõ này'. Địa chỉ đối chiếu bản đồ còn thiếu phường/xã.",
      stop: "STP-10469",
      parcel: "PTVN-7730-3308",
    },
    "EX-10474": {
      type: "Kiện hàng hư hỏng",
      text: "Kiện hàng PTVN-0294-7751 bị hư hỏng trong quá trình vận chuyển, tài xế ghi nhận tại điểm giao HD-03.",
      note: "Ghi chú tài xế đề cập 'hộp bị móp, hàng ướt'. Kiểm tra ảnh bằng chứng và lịch sử tuyến trước khi xử lý.",
      stop: "STP-10492",
      parcel: "PTVN-0294-7751",
    },
    "EX-10468": {
      type: "Khách đổi lịch",
      text: "Người nhận đề nghị dời giao hàng sang khung giờ chiều tại điểm CG-09.",
      note: "Đối chiếu yêu cầu đổi lịch của người nhận với ghi chú của tài xế.",
      stop: "STP-10496",
      parcel: "PTVN-8932-1140",
    },
    "EX-10461": {
      type: "Xe gặp sự cố",
      text: "Xe của tài xế gặp sự cố trên tuyến LB-12, các điểm giao còn lại có nguy cơ trễ.",
      note: "Ghi chú nêu 'xe thủng lốp, chờ cứu hộ'. Liên hệ tài xế để cập nhật tình trạng tuyến.",
      stop: "STP-10462",
      parcel: "PTVN-4481-2026",
    },
  };

  // Đọc cả khóa nghiệp vụ của tài xế và bản ghi chia sẻ cùng origin.
  const driverExceptions = readStore("driverExceptions", []);
  const savedSharedRecords = readStore("sharedRecords", []);
  const sharedDriverExceptions = (Array.isArray(savedSharedRecords) ? savedSharedRecords : [])
    .filter((record) => record.sourceType === "Ngoại lệ giao hàng")
    .map((record) => ({
      id: record.payload?.exceptionId || String(record.id || "").replace(/^driver-exception:/, ""),
      stop: record.payload?.stop || record.reference,
      category: record.payload?.category || record.title,
      note: record.summary,
      createdAt: record.createdAt,
    }));
  const exceptionById = new Map();
  (Array.isArray(driverExceptions) ? driverExceptions : []).forEach((item) => {
    if (item?.id) exceptionById.set(item.id, item);
  });
  sharedDriverExceptions.forEach((item) => {
    if (item.id && !exceptionById.has(item.id)) exceptionById.set(item.id, item);
  });
  [...exceptionById.values()].forEach((item) => {
    if (!item?.id || exBody.querySelector(`tr[data-id="${CSS.escape(item.id)}"]`))
      return;
    const row = document.createElement("tr");
    row.tabIndex = 0;
    row.dataset.id = item.id;
    row.dataset.pri = "high";
    row.dataset.sla = "near";
    const stop = item.stop || item.stopId || "Chưa rõ điểm dừng";
    const cells = [
      item.id,
      item.parcel || item.parcelId || stop,
      item.category || item.type || "Chưa phân loại",
      `${item.route || "Tuyến tài xế"} · ${item.driver || "Tài xế"}`,
      Number.isFinite(Date.parse(item.createdAt || ""))
        ? `${Math.max(0, Math.floor((Date.now() - Date.parse(item.createdAt)) / 60000))} phút`
        : "Mới gửi",
      "Cao",
    ];
    cells.forEach((value, index) => {
      const cell = document.createElement("td");
      if (index === 0) {
        const strong = document.createElement("strong");
        strong.textContent = value;
        cell.append(strong);
      } else if (index === 5) {
        const chip = document.createElement("span");
        chip.className = "chip amber";
        chip.textContent = value;
        cell.append(chip);
      } else {
        if (index === 2) cell.className = "t-type";
        cell.textContent = value;
      }
      row.append(cell);
    });
    exBody.prepend(row);
    EXCEPTION_DETAILS[item.id] = {
      type: item.category || item.type || "Chưa phân loại",
      text: `${item.note || item.description || "Tài xế đã ghi nhận ngoại lệ."} (Điểm dừng: ${stop})`,
      note: "Ngoại lệ do tài xế gửi; kiểm tra thông tin và xác nhận trước khi phân công lại.",
      stop,
      parcel: item.parcel || item.parcelId || "",
    };
  });

  const rows = $$("tr[data-id]", exBody);
  const decisions = readStore("exceptionDecisions", {});
  let currentId = null;

  function enqueueException(id) {
    const details = EXCEPTION_DETAILS[id];
    if (!details?.stop) return true;
    const storedStops = readStore("reassignStops", []);
    const reassignStops = Array.isArray(storedStops) ? storedStops : [];
    if (reassignStops.some((stop) => stop.exceptionId === id)) return true;
    reassignStops.unshift({
      id,
      exceptionId: id,
      stopId: details.stop,
      parcelId: details.parcel || "",
      type: decisions[id]?.type || details.type,
      note: details.text,
      createdAt: new Date().toISOString(),
    });
    return writeStore("reassignStops", reassignStops.slice(0, 100));
  }

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
    const saved = decisions[row.dataset.id];
    if (saved?.status === "confirmed" && enqueueException(row.dataset.id)) {
      row.remove();
      return;
    }
    if (saved?.status === "dismissed") {
      row.remove();
      return;
    }
    if (saved?.type) $(".t-type", row).textContent = saved.type;
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
    if (!writeStore("exceptionDecisions", decisions)) {
      toast("Không thể lưu quyết định. Kiểm tra quyền lưu của trình duyệt.");
      return;
    }
    const details = EXCEPTION_DETAILS[currentId];
    if (status === "confirmed" && !enqueueException(currentId)) {
      toast("Không thể lưu ngoại lệ vào danh sách phân công lại.");
      return;
    }
    if (status === "confirmed") {
      window.ParcelPulseRolePages?.registerSharedRecord({
        id: `dispatcher-exception:${currentId}`,
        sourceRole: "Điều phối viên",
        sourceType: "Quyết định ngoại lệ",
        reference: currentId,
        title: `Đã duyệt ${currentId}`,
        summary: `${decisions[currentId]?.type || details?.type || "Ngoại lệ"}: ${details?.text || ""}`,
        status: "pending",
        payload: { exceptionId: currentId, decision: status },
      });
    } else if (status === "dismissed") {
      const driverItems = readStore("driverExceptions", []);
      if (Array.isArray(driverItems))
        writeStore("driverExceptions", driverItems.filter((item) => item.id !== currentId));
      const reassignItems = readStore("reassignStops", []);
      if (Array.isArray(reassignItems))
        writeStore("reassignStops", reassignItems.filter((item) => item.exceptionId !== currentId));
      const sharedRecords = readStore("sharedRecords", []);
      if (Array.isArray(sharedRecords)) {
        writeStore("sharedRecords", sharedRecords.filter((record) =>
          record.id !== `dispatcher-exception:${currentId}` &&
          record.id !== `driver-exception:${currentId}`));
        window.dispatchEvent(new CustomEvent("parcelpulse:records-changed"));
      }
    }

    const removedId = currentId;
    rows.find((row) => row.dataset.id === removedId)?.remove();
    const nextRow = rows.find((row) => row.isConnected && !row.hidden);
    if (nextRow) selectRow(nextRow);
    else {
      currentId = null;
      $("#exception-detail-id").textContent = "";
      $("#exception-detail-type").textContent = "";
      $("#exception-detail-text").textContent = "Không còn ngoại lệ chờ xử lý.";
      $("#exception-detail-note").textContent = "";
      $("#exception-detail-status").textContent = "Đã xử lý";
      $("#exception-detail-status").className = "chip green";
    }
    applyFilters();
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
    if (!writeStore("exceptionDecisions", decisions)) {
      toast("Không thể lưu chỉnh sửa. Kiểm tra quyền lưu của trình duyệt.");
      return;
    }
    window.ParcelPulseRolePages?.registerSharedRecord({
      id: `dispatcher-exception:${currentId}`,
      sourceRole: "Điều phối viên",
      sourceType: "Cập nhật loại ngoại lệ",
      reference: currentId,
      title: `Cập nhật ngoại lệ ${currentId}`,
      summary: `${typeEdit.value}: ${EXCEPTION_DETAILS[currentId]?.text || ""}`,
      status: "pending",
      payload: { exceptionId: currentId, type: typeEdit.value },
    });
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
    '<td class="empty" colspan="6"><p>Không có ngoại lệ phù hợp. Thử đổi từ khóa hoặc bỏ bộ lọc.</p><button class="btn" type="button" data-clear-exception-filters>Xóa bộ lọc</button></td>';
  emptyRow.hidden = true;
  exBody.append(emptyRow);

  function applyFilters() {
    let shown = 0;
    rows.forEach((row) => {
      if (!row.isConnected) return;
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
    const remaining = rows.filter((row) => row.isConnected).length;
    $("#count").textContent = `Hiển thị ${shown} trong ${remaining} ngoại lệ chờ xử lý${quick !== "all" || query || typeFilter ? " khớp bộ lọc" : ""}`;
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

  $("[data-clear-exception-filters]").addEventListener("click", () => {
    quick = "all";
    query = "";
    typeFilter = "";
    $("#q").value = "";
    typeSelect.value = "";
    $$('[data-filter="all"]').forEach((button) => button.setAttribute("aria-pressed", "true"));
    $$('[data-filter]:not([data-filter="all"])').forEach((button) => button.setAttribute("aria-pressed", "false"));
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

  // Một trang dữ liệu mẫu hiện có; vô hiệu hóa nút trang chưa có dữ liệu.
  $$(".pager .page, .pager .step").forEach((btn) => {
    const current = btn.textContent.trim() === "1";
    btn.disabled = !current;
    if (!current) btn.title = "Trang này chưa có dữ liệu mẫu";
  });

  const initialRow = $('tr[aria-current="true"]') || rows.find((row) => row.isConnected);
  if (initialRow) selectRow(initialRow);
  else {
    $("#exception-detail-id").textContent = "";
    $("#exception-detail-type").textContent = "";
    $("#exception-detail-text").textContent = "Không còn ngoại lệ chờ xử lý.";
    $("#exception-detail-note").textContent = "";
    $("#exception-detail-status").textContent = "Đã xử lý";
    $("#exception-detail-status").className = "chip green";
  }
}

/* ===== Trang Phân công lại ===== */
const stopsBox = $("#stops");
if (stopsBox) {
  const driversBox = $("#drivers");
  const stops = () => $$(".stop", stopsBox);
  const stopId = (stop) => $(".meta b", stop)?.textContent.trim();
  const checkedStops = () => stops().filter((s) => $("input", s).checked);
  const drivers = () => $$(".driver", driversBox);
  const pickedDriver = () => drivers().find((d) => $("input", d).checked);

  // Ngoại lệ đã duyệt xuất hiện thành mục có thể phân công.
  const reassignItems = readStore("reassignStops", []);
  (Array.isArray(reassignItems) ? reassignItems : []).forEach((item) => {
    if (!item?.exceptionId || stopsBox.querySelector(`[data-exception-id="${CSS.escape(item.exceptionId)}"]`))
      return;
    const stop = document.createElement("label");
    stop.className = "stop";
    stop.dataset.kien = item.parcelId ? "1" : "0";
    stop.dataset.km = "0";
    stop.dataset.exceptionId = item.exceptionId;
    stop.dataset.stopId = item.stopId || "";
    stop.dataset.parcelId = item.parcelId || "";
    stop.dataset.exceptionType = item.type || "";
    stop.dataset.exceptionNote = item.note || "";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    const meta = document.createElement("span");
    meta.className = "meta";
    const ref = document.createElement("b");
    ref.textContent = item.exceptionId;
    meta.append(ref, ` ${item.stopId || "Điểm dừng chưa rõ"} · ${item.type || "Ngoại lệ đã xác nhận"}`);
    if (item.parcelId) meta.append(document.createElement("br"), `Kiện hàng ${item.parcelId}`);
    const time = document.createElement("time");
    time.textContent = "Ngoại lệ";
    stop.append(checkbox, meta, time);
    stopsBox.prepend(stop);
  });

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

  const completed = readStore("assignments", []);
  stops().forEach((stop) => {
    if (completed.some((assignment) => assignment.stopIds?.includes(stopId(stop)))) stop.remove();
  });
  const draft = readStore("assignmentDraft", null);
  if (draft) {
    stops().forEach((stop) => {
      if (draft.stopIds?.includes(stopId(stop))) $("input", stop).checked = true;
    });
    const driver = drivers().find((item) => item.dataset.name === draft.driver);
    if (driver) $("input", driver).checked = true;
  }

  $("#draft").addEventListener("click", () => {
    const selected = checkedStops();
    if (!selected.length) {
      toast("Chọn ít nhất một điểm dừng trước khi lưu nháp.");
      return;
    }
    const driver = pickedDriver();
    const saved = writeStore("assignmentDraft", {
      stopIds: selected.map(stopId),
      driver: driver?.dataset.name || "",
      savedAt: new Date().toISOString(),
    });
    if (!saved) {
      toast("Không thể lưu nháp. Kiểm tra quyền lưu của trình duyệt.");
      return;
    }
    toast("Đã lưu nháp phân công vào trình duyệt.");
  });

  // --- Xác nhận: chuyển các điểm đã chọn đi và gỡ chúng khỏi danh sách ---
  $("#confirm").addEventListener("click", () => {
    const selected = checkedStops();
    const driver = pickedDriver();
    if (!selected.length || !driver) return;
    const assignments = readStore("assignments", []);
    const assignment = {
      id: `ASG-${Date.now()}`,
      stopIds: selected.map(stopId),
      exceptionIds: selected.map((stop) => stop.dataset.exceptionId).filter(Boolean),
      routeStops: selected.map((stop) => ({
        stopId: stop.dataset.stopId || stopId(stop),
        exceptionId: stop.dataset.exceptionId || "",
        parcelId: stop.dataset.parcelId || "",
        type: stop.dataset.exceptionType || "",
        note: stop.dataset.exceptionNote || "",
      })),
      driver: driver.dataset.name,
      assignedAt: new Date().toISOString(),
    };
    assignments.push(assignment);
    if (!writeStore("assignments", assignments)) {
      toast("Không thể lưu phân công; danh sách chưa được cập nhật.");
      return;
    }
    window.ParcelPulseRolePages?.registerSharedRecord({
      id: `dispatcher-assignment:${assignment.id}`,
      sourceRole: "Điều phối viên",
      sourceType: "Phân công lại điểm giao",
      reference: assignment.stopIds.join(", "),
      title: `Phân ${assignment.stopIds.length} điểm cho ${assignment.driver}`,
      summary: `Điểm giao: ${assignment.stopIds.join(", ")}`,
      status: "pending",
      payload: assignment,
      createdAt: assignment.assignedAt,
    });
    selected.forEach((s) => s.remove());
    try { localStorage.removeItem("parcelpulse.assignmentDraft"); } catch { /* Storage may be unavailable. */ }
    toast(`Đã chuyển ${selected.length} điểm cho ${driver.dataset.name}`);
    update();
  });

  update();
}

window.addEventListener("storage", (event) => {
  if (
    ["parcelpulse.driverExceptions", "parcelpulse.sharedRecords"].includes(event.key) &&
    $("#ex-body")
  )
    window.location.reload();
  if (
    ["parcelpulse.reassignStops", "parcelpulse.assignments"].includes(event.key) &&
    $("#stops")
  )
    window.location.reload();
});
