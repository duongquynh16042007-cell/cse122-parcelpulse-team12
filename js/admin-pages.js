/* ParcelPulse role-specific interactions. */
document.addEventListener("DOMContentLoaded", () => {
  const { $, $$, read, write, toast, announce } = window.ParcelPulseRolePages;

  /* ===== Admin: status taxonomy ===== */
  const statusBody = $("#status-body");
  if (statusBody) {
    const defaults = [
      {
        code: "PENDING",
        name: "Chờ lấy hàng",
        category: "Đang chờ",
        flow: "Đang xử lý",
        locked: true,
      },
      {
        code: "PICKED_UP",
        name: "Đã lấy hàng",
        category: "Đang vận chuyển",
        flow: "Đang vận chuyển",
        locked: true,
      },
      {
        code: "IN_TRANSIT",
        name: "Đang giao",
        category: "Đang vận chuyển",
        flow: "Đang giao",
        locked: true,
      },
      {
        code: "DELIVERED",
        name: "Giao thành công",
        category: "Hoàn thành",
        flow: "Kết thúc",
        locked: true,
      },
      {
        code: "DELIVERY_EXCEPTION",
        name: "Cần xử lý ngoại lệ",
        category: "Ngoại lệ",
        flow: "Chờ điều phối",
        locked: true,
      },
      {
        code: "CANCELLED",
        name: "Đã hủy",
        category: "Đã hủy",
        flow: "Kết thúc",
        locked: true,
      },
    ];
    const statuses = read("statuses", defaults);
    const editor = $("#status-editor");
    const form = $("#status-form");
    const query = $("#status-search");
    let editingCode = null;

    const addCell = (row, value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
      return cell;
    };

    const render = () => {
      statusBody.replaceChildren();
      const term = query.value.trim().toLowerCase();
      const matches = statuses.filter((item) =>
        `${item.code} ${item.name} ${item.category}`
          .toLowerCase()
          .includes(term),
      );
      $("#status-empty").hidden = matches.length > 0;
      matches.forEach((item) => {
        const row = document.createElement("tr");
        addCell(row, item.code);
        addCell(row, item.name);
        addCell(row, item.category);
        addCell(row, item.flow);
        const actions = document.createElement("td");
        actions.className = "row-actions";
        const edit = document.createElement("button");
        edit.type = "button";
        edit.className = "btn";
        edit.textContent = "Sửa";
        edit.addEventListener("click", () => openEditor(item));
        actions.append(edit);
        const archive = document.createElement("button");
        archive.type = "button";
        archive.className = "btn";
        archive.textContent = item.locked ? "Đang dùng" : "Lưu trữ";
        archive.disabled = item.locked;
        archive.setAttribute(
          "aria-label",
          item.locked
            ? `Không thể lưu trữ ${item.name}`
            : `Lưu trữ ${item.name}`,
        );
        archive.addEventListener("click", () => {
          if (item.locked) return;
          statuses.splice(statuses.indexOf(item), 1);
          write("statuses", statuses);
          render();
          toast(`Đã lưu trữ trạng thái ${item.name}.`);
        });
        actions.append(archive);
        row.append(actions);
        statusBody.append(row);
      });
      $("#status-total").textContent = String(statuses.length);
    };

    const openEditor = (item) => {
      editingCode = item?.code || null;
      $("#status-editor-title").textContent = item
        ? "Chỉnh sửa trạng thái"
        : "Tạo trạng thái mới";
      $("#status-code").value = item?.code || "";
      $("#status-code").readOnly = Boolean(item);
      $("#status-name").value = item?.name || "";
      $("#status-category").value = item?.category || "Đang chờ";
      $("#status-flow").value = item?.flow || "";
      editor.hidden = false;
      $("#status-name").focus();
    };

    $("#add-status").addEventListener("click", () => openEditor(null));
    $("#cancel-status").addEventListener("click", () => {
      editor.hidden = true;
      form.reset();
      editingCode = null;
    });
    query.addEventListener("input", render);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const code = $("#status-code").value.trim().toUpperCase();
      const name = $("#status-name").value.trim();
      const flow = $("#status-flow").value.trim();
      if (!name || !flow) {
        announce(
          $("#status-form-message"),
          "Nhập tên trạng thái và bước chuyển tiếp trước khi lưu.",
          "error",
        );
        return;
      }
      if (!/^[A-Z][A-Z0-9_]{2,31}$/.test(code)) {
        announce(
          $("#status-form-message"),
          "Mã cần 3–32 ký tự, bắt đầu bằng chữ và chỉ gồm A–Z, 0–9, dấu gạch dưới.",
          "error",
        );
        return;
      }
      if (statuses.some((item) => item.code === code && code !== editingCode)) {
        announce(
          $("#status-form-message"),
          "Mã trạng thái đã tồn tại.",
          "error",
        );
        return;
      }
      const item = statuses.find((row) => row.code === editingCode);
      if (item)
        Object.assign(item, {
          name,
          category: $("#status-category").value,
          flow,
        });
      else
        statuses.push({
          code,
          name,
          category: $("#status-category").value,
          flow,
          locked: false,
        });
      write("statuses", statuses);
      editor.hidden = true;
      form.reset();
      editingCode = null;
      announce(
        $("#status-page-message"),
        `Đã lưu taxonomy trạng thái ${name} trên thiết bị này.`,
        "success",
      );
      render();
    });
    render();
  }

  /* ===== Admin: user lifecycle ===== */
  const userBody = $("#user-body");
  if (userBody) {
    const defaults = [
      {
        id: "USR-001",
        name: "Minh Anh",
        email: "minhanh@parcelpulse.demo",
        role: "dispatcher",
        status: "active",
      },
      {
        id: "USR-002",
        name: "Quốc Huy",
        email: "quochuy@parcelpulse.demo",
        role: "driver",
        status: "active",
      },
      {
        id: "USR-003",
        name: "Thu Hà",
        email: "thuha@parcelpulse.demo",
        role: "recipient",
        status: "pending",
      },
      {
        id: "USR-004",
        name: "Gia Bảo",
        email: "giabao@parcelpulse.demo",
        role: "driver",
        status: "suspended",
      },
    ];
    const users = read("users", defaults);
    const form = $("#user-form");
    const editor = $("#user-editor");
    let editingId = null;
    let filter = "all";
    let pageMessageTimer;

    const roleLabels = {
      recipient: "Người nhận",
      driver: "Nhân viên giao hàng",
      dispatcher: "Điều phối viên",
      admin: "Quản trị viên",
    };
    const statusLabels = {
      active: ["Đang hoạt động", "green"],
      pending: ["Chờ kích hoạt", "amber"],
      suspended: ["Tạm khóa", "red"],
    };

    const render = () => {
      const term = $("#user-search").value.trim().toLowerCase();
      const roleFilter = $("#user-role-filter").value;
      const matches = users.filter((user) => {
        const matchesQuery = `${user.id} ${user.name} ${user.email}`
          .toLowerCase()
          .includes(term);
        const matchesState = filter === "all" || user.status === filter;
        const matchesRole = !roleFilter || user.role === roleFilter;
        return matchesQuery && matchesState && matchesRole;
      });
      userBody.replaceChildren();
      matches.forEach((user) => {
        const row = document.createElement("tr");
        [user.id, user.name, user.email, roleLabels[user.role]].forEach(
          (text) => {
            const cell = document.createElement("td");
            cell.textContent = text;
            row.append(cell);
          },
        );
        const state = document.createElement("td");
        const badge = document.createElement("span");
        const [label, color] = statusLabels[user.status];
        badge.className = `chip ${color}`;
        badge.textContent = label;
        state.append(badge);
        row.append(state);
        const actions = document.createElement("td");
        actions.className = "row-actions";
        const edit = document.createElement("button");
        edit.type = "button";
        edit.className = "btn";
        edit.textContent = "Sửa";
        edit.addEventListener("click", () => openEditor(user));
        actions.append(edit);
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "btn";
        toggle.textContent =
          user.status === "suspended" ? "Mở khóa" : "Tạm khóa";
        toggle.addEventListener("click", () => {
          user.status = user.status === "suspended" ? "active" : "suspended";
          write("users", users);
          render();
          toast(`${user.name}: ${statusLabels[user.status][0].toLowerCase()}.`);
        });
        actions.append(toggle);
        row.append(actions);
        userBody.append(row);
      });
      $("#user-empty").hidden = matches.length > 0;
      $("#users-total").textContent = String(users.length);
      $("#users-active").textContent = String(
        users.filter((user) => user.status === "active").length,
      );
      $("#users-pending").textContent = String(
        users.filter((user) => user.status === "pending").length,
      );
      $("#users-suspended").textContent = String(
        users.filter((user) => user.status === "suspended").length,
      );
    };

    const openEditor = (user) => {
      editingId = user?.id || null;
      $("#user-editor-title").textContent = user
        ? "Chỉnh sửa người dùng"
        : "Thêm người dùng";
      $("#user-name").value = user?.name || "";
      $("#user-email").value = user?.email || "";
      $("#user-role").value = user?.role || "recipient";
      $("#user-status").value = user?.status || "pending";
      editor.hidden = false;
      $("#user-name").focus();
    };

    $("#add-user").addEventListener("click", () => openEditor(null));
    $("#cancel-user").addEventListener("click", () => {
      editor.hidden = true;
      form.reset();
      editingId = null;
    });
    $("#user-search").addEventListener("input", render);
    $("#user-role-filter").addEventListener("change", render);
    $$("[data-user-filter]").forEach((button) =>
      button.addEventListener("click", () => {
        filter = button.dataset.userFilter;
        $$("[data-user-filter]").forEach((item) =>
          item.setAttribute("aria-pressed", String(item === button)),
        );
        render();
      }),
    );
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const email = $("#user-email").value.trim().toLowerCase();
      if (
        users.some(
          (user) => user.email.toLowerCase() === email && user.id !== editingId,
        )
      ) {
        announce(
          $("#user-form-message"),
          "Địa chỉ email này đã được sử dụng trong dữ liệu demo.",
          "error",
        );
        return;
      }
      const data = {
        name: $("#user-name").value.trim(),
        email,
        role: $("#user-role").value,
        status: $("#user-status").value,
      };
      const existing = users.find((user) => user.id === editingId);
      if (existing) Object.assign(existing, data);
      else
        users.push({
          id: `USR-${String(Date.now()).slice(-6)}`,
          ...data,
        });
      write("users", users);
      editor.hidden = true;
      form.reset();
      editingId = null;
      announce(
        $("#user-page-message"),
        "Đã lưu thông tin người dùng trong dữ liệu demo.",
        "success",
      );
      clearTimeout(pageMessageTimer);
      pageMessageTimer = setTimeout(() => {
        announce($("#user-page-message"), "");
      }, 5000);
      render();
    });
    render();
  }

  /* ===== Admin: logistics report and CSV export ===== */
  const report = $("#logistics-report");
  if (report) {
    const series = {
      7: {
        delivered: "10.842",
        onTime: "96,1%",
        exceptions: "3,8%",
        avgTime: "1,4 ngày",
        centers: [
          ["Hà Nội 02", 96.1, "4.860"],
          ["Hà Nội 05", 94.4, "3.214"],
          ["Hà Đông", 91.7, "1.876"],
          ["Long Biên", 97.2, "892"],
        ],
      },
      30: {
        delivered: "42.680",
        onTime: "95,4%",
        exceptions: "4,2%",
        avgTime: "1,6 ngày",
        centers: [
          ["Hà Nội 02", 96.3, "18.420"],
          ["Hà Nội 05", 94.1, "12.260"],
          ["Hà Đông", 91.4, "7.108"],
          ["Long Biên", 97.2, "4.892"],
        ],
      },
      90: {
        delivered: "126.420",
        onTime: "94,8%",
        exceptions: "4,6%",
        avgTime: "1,7 ngày",
        centers: [
          ["Hà Nội 02", 95.9, "54.840"],
          ["Hà Nội 05", 93.7, "36.810"],
          ["Hà Đông", 90.8, "22.460"],
          ["Long Biên", 96.6, "12.310"],
        ],
      },
    };

    const renderReport = () => {
      const days = $("#report-range").value;
      const data = series[days];
      $("#report-period-label").textContent =
        `Trong ${days} ngày gần nhất · Dữ liệu mẫu`;
      $("#report-delivered").textContent = data.delivered;
      $("#report-ontime").textContent = data.onTime;
      $("#report-exceptions").textContent = data.exceptions;
      $("#report-average-time").textContent = data.avgTime;
      $("#report-center-rows").replaceChildren();
      data.centers.forEach(([name, value, volume]) => {
        const row = document.createElement("tr");
        [name, `${value.toLocaleString("vi-VN")}%`, volume].forEach((text) => {
          const cell = document.createElement("td");
          cell.textContent = text;
          row.append(cell);
        });
        $("#report-center-rows").append(row);
      });
      $("#report-bars").replaceChildren();
      data.centers.forEach(([name, value]) => {
        const line = document.createElement("div");
        line.className = "report-bar-row";
        const label = document.createElement("span");
        label.textContent = name;
        const track = document.createElement("div");
        track.className = "report-bar-track";
        track.setAttribute("aria-label", `${name}: ${value}% giao đúng hẹn`);
        const fill = document.createElement("div");
        fill.className = "report-bar-fill";
        fill.style.width = `${value}%`;
        track.append(fill);
        const score = document.createElement("strong");
        score.textContent = `${value}%`;
        line.append(label, track, score);
        $("#report-bars").append(line);
      });
    };

    $("#report-range").addEventListener("change", renderReport);
    $("#export-report").addEventListener("click", () => {
      const days = $("#report-range").value;
      const data = series[days];
      const rows = [
        ["Chỉ số", "Giá trị", "Khoảng thời gian"],
        ["Kiện đã giao", data.delivered, `${days} ngày`],
        ["Tỷ lệ đúng hẹn", data.onTime, `${days} ngày`],
        ["Tỷ lệ ngoại lệ", data.exceptions, `${days} ngày`],
        ["Thời gian giao trung bình", data.avgTime, `${days} ngày`],
        [],
        ["Trung tâm", "Tỷ lệ giao đúng hẹn", "Số kiện"],
        ...data.centers,
      ];
      const csv = `\uFEFF${rows
        .map((row) =>
          row
            .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
            .join(","),
        )
        .join("\r\n")}`;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(
        new Blob([csv], { type: "text/csv;charset=utf-8" }),
      );
      link.download = `parcelpulse-report-${days}-days.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast("Đã tải báo cáo CSV mẫu xuống thiết bị.");
    });
    $("#save-report").addEventListener("click", () => {
      const days = $("#report-range").value;
      const saved = read("savedReports", []);
      saved.unshift({ days, savedAt: new Date().toISOString() });
      write("savedReports", saved.slice(0, 10));
      announce(
        $("#report-status"),
        `Đã lưu bộ lọc báo cáo ${days} ngày trên thiết bị này.`,
        "success",
      );
    });
    renderReport();
  }
});
