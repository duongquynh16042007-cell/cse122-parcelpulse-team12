/* Shared, local-only interactions for recipient, driver, and admin screens. */
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

  /* ===== Shared profile and settings drawer ===== */
  const settingsTrigger = $("[data-open-profile]");
  const roleElement = $(".role-chip");
  if (settingsTrigger && roleElement) {
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
    const profileName =
      session?.role === role
        ? session.name
        : $(".user strong")?.textContent.trim();
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
    $("[data-profile-name]", dialog).textContent = profileName || "Minh Anh";
    $("[data-profile-role]", dialog).textContent = roleLabels[role];
    $("[data-profile-email]", dialog).textContent = profileDefaults[role].email;
    $("[data-profile-phone]", dialog).textContent = profileDefaults[role].phone;

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
    settingsTrigger.addEventListener("click", openDialog);
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

  /* ===== Recipient: parcel tracking ===== */
  const trackForm = $("#parcel-track-form");
  if (trackForm) {
    const input = $("#parcel-code");
    const status = $("#track-status");
    const parcelCode = new URLSearchParams(location.search).get("code");
    if (parcelCode) input.value = parcelCode.toUpperCase();

    trackForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const code = input.value.trim().toUpperCase();
      if (!/^(?:PP|PPVN|PTVN)-[A-Z0-9-]{6,20}$/.test(code)) {
        announce(
          status,
          "Nhập mã hợp lệ, ví dụ PPVN-4829-1024. Bản demo chỉ tra cứu dữ liệu mẫu.",
          "error",
        );
        input.setAttribute("aria-invalid", "true");
        input.focus();
        return;
      }

      input.removeAttribute("aria-invalid");
      const isSample = code === "PPVN-4829-1024";
      $$(".track-result").forEach((result) => {
        result.hidden = !isSample;
      });
      announce(
        status,
        isSample
          ? "Đã tìm thấy kiện hàng trong dữ liệu demo."
          : "Không tìm thấy kiện hàng mẫu. Thử mã PPVN-4829-1024.",
        isSample ? "success" : "error",
      );
    });

    const explain = $("#eta-explain");
    if (explain) {
      explain.addEventListener("click", () => {
        const result = $("#eta-result");
        const failed = explain.dataset.attempted === "true";
        explain.dataset.attempted = String(!failed);
        if (failed) {
          announce(
            result,
            "ETA ước tính 14:10–14:35. Tuyến hiện chậm khoảng 8 phút do lưu lượng tại Cầu Giấy; thời gian có thể thay đổi.",
            "success",
          );
          explain.textContent = "Giải thích ETA";
        } else {
          announce(
            result,
            "Chưa đủ dữ liệu giao thông mới nhất để AI giải thích ETA. Bạn có thể thử lại hoặc tiếp tục xem lịch sử giao hàng.",
            "error",
          );
          explain.textContent = "Thử lại giải thích";
        }
      });
    }
  }

  /* ===== Recipient: delivery preferences ===== */
  const preferencesForm = $("#preferences-form");
  if (preferencesForm) {
    const modeInputs = $$('input[name="delivery-mode"]', preferencesForm);
    const homeFields = $("#home-address-fields");
    const pickupFields = $("#pickup-location-fields");
    const stored = read("deliveryPreferences", null);

    if (stored) {
      if (stored.mode) {
        const selected = modeInputs.find(
          (input) => input.value === stored.mode,
        );
        if (selected) selected.checked = true;
      }
      if ($("#delivery-window") && stored.window)
        $("#delivery-window").value = stored.window;
      if ($("#delivery-address") && stored.address)
        $("#delivery-address").value = stored.address;
      if ($("#pickup-location") && stored.pickup)
        $("#pickup-location").value = stored.pickup;
      if ($("#delivery-note") && stored.note)
        $("#delivery-note").value = stored.note;
    }

    const updateMode = () => {
      const mode = modeInputs.find((input) => input.checked)?.value;
      homeFields.hidden = mode !== "home";
      pickupFields.hidden = mode !== "pickup";
      $("#delivery-address").required = mode === "home";
      $("#pickup-location").required = mode === "pickup";
    };
    modeInputs.forEach((input) => input.addEventListener("change", updateMode));
    updateMode();

    preferencesForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const mode = modeInputs.find((input) => input.checked)?.value;
      if (!mode) {
        announce($("#preferences-status"), "Chọn cách nhận hàng.", "error");
        return;
      }
      const details =
        mode === "home"
          ? $("#delivery-address").value.trim()
          : $("#pickup-location").value;
      if (!details) {
        announce(
          $("#preferences-status"),
          "Hoàn tất địa chỉ hoặc điểm nhận hàng trước khi lưu.",
          "error",
        );
        return;
      }
      write("deliveryPreferences", {
        mode,
        window: $("#delivery-window").value,
        address: mode === "home" ? details : "",
        pickup: mode === "pickup" ? details : "",
        note: $("#delivery-note").value.trim(),
      });
      announce(
        $("#preferences-status"),
        "Đã lưu tùy chọn trên thiết bị này (dữ liệu demo, chưa gửi đến đơn vị vận chuyển).",
        "success",
      );
    });
  }

  /* ===== Recipient: feedback ===== */
  const feedbackForm = $("#feedback-form");
  if (feedbackForm) {
    feedbackForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const rating = $('input[name="rating"]:checked', feedbackForm);
      const comment = $("#feedback-comment").value.trim();
      if (!rating) {
        announce($("#feedback-status"), "Chọn số sao trước khi gửi.", "error");
        $('input[name="rating"]', feedbackForm).focus();
        return;
      }
      if (
        !comment &&
        !$('input[name="feedback-reason"]:checked', feedbackForm)
      ) {
        announce(
          $("#feedback-status"),
          "Chọn lý do hoặc nhập góp ý để chúng tôi hiểu phản hồi của bạn.",
          "error",
        );
        return;
      }

      const feedback = read("feedback", []);
      feedback.unshift({
        parcel: "PPVN-4829-1024",
        rating: Number(rating.value),
        reason:
          $('input[name="feedback-reason"]:checked', feedbackForm)?.value || "",
        comment,
        createdAt: new Date().toISOString(),
      });
      write("feedback", feedback.slice(0, 20));
      announce(
        $("#feedback-status"),
        "Cảm ơn bạn! Phản hồi đã được lưu trong bản demo trên thiết bị này.",
        "success",
      );
      feedbackForm.reset();
    });
  }

  /* ===== Driver: route and stops ===== */
  const routeStops = $$(".route-stop");
  if (routeStops.length) {
    const filters = $$("[data-stop-filter]");
    const search = $("#stop-search");
    const completed = new Set(read("completedStops", []));
    const exceptions = new Set(
      read("driverExceptions", []).map((item) => item.stop),
    );
    let activeFilter = "all";

    routeStops.forEach((stop) => {
      if (completed.has(stop.dataset.stop)) stop.dataset.status = "completed";
      else if (exceptions.has(stop.dataset.stop))
        stop.dataset.status = "exception";
    });

    const renderStops = () => {
      let visibleCount = 0;
      routeStops.forEach((stop) => {
        const status = stop.dataset.status;
        const matchesFilter =
          activeFilter === "all" ||
          (activeFilter === "pending" && status !== "completed") ||
          status === activeFilter;
        const matchesSearch = stop.textContent
          .toLowerCase()
          .includes((search?.value || "").trim().toLowerCase());
        stop.hidden = !matchesFilter || !matchesSearch;
        if (!stop.hidden) visibleCount += 1;
        const label = $(".stop-state", stop);
        const completeButton = $("[data-stop-complete]", stop);
        label.textContent =
          status === "completed"
            ? "Đã giao"
            : status === "exception"
              ? "Có ngoại lệ"
              : "Chờ giao";
        label.classList.toggle("green", status === "completed");
        label.classList.toggle("amber", status === "exception");
        completeButton.textContent =
          status === "completed" ? "Hoàn tác" : "Đã giao";
        completeButton.classList.toggle("primary", status !== "completed");
        stop.classList.toggle("is-complete", status === "completed");
      });
      $("#stops-empty").hidden = visibleCount > 0;
      $("#stop-count").textContent =
        activeFilter === "all"
          ? `${visibleCount} điểm dừng`
          : `${visibleCount} điểm phù hợp`;
      $("#route-done-count").textContent = String(
        routeStops.filter((stop) => stop.dataset.status === "completed").length,
      );
      $("#route-pending-count").textContent = String(
        routeStops.filter((stop) => stop.dataset.status !== "completed").length,
      );
    };

    filters.forEach((button) =>
      button.addEventListener("click", () => {
        activeFilter = button.dataset.stopFilter;
        filters.forEach((item) =>
          item.setAttribute("aria-pressed", String(item === button)),
        );
        renderStops();
      }),
    );
    search?.addEventListener("input", renderStops);

    routeStops.forEach((stop) => {
      const completeButton = $("[data-stop-complete]", stop);
      completeButton?.addEventListener("click", () => {
        stop.dataset.status =
          stop.dataset.status === "completed" ? "pending" : "completed";
        const completedStops = read("completedStops", []);
        const isComplete = stop.dataset.status === "completed";
        write(
          "completedStops",
          isComplete
            ? [...new Set([...completedStops, stop.dataset.stop])]
            : completedStops.filter((id) => id !== stop.dataset.stop),
        );
        renderStops();
        toast(
          stop.dataset.status === "completed"
            ? `Đã cập nhật ${stop.dataset.stop} thành đã giao.`
            : `Đã mở lại ${stop.dataset.stop}.`,
        );
      });
    });
    renderStops();
  }

  /* ===== Driver: delivery proof ===== */
  const proofForm = $("#delivery-proof-form");
  if (proofForm) {
    const stopId =
      new URLSearchParams(location.search).get("stop") || "STP-10462";
    $("#detail-stop-id").textContent = stopId;
    $("#stop-route-link").href =
      `driver-route-stops.html#${encodeURIComponent(stopId)}`;

    $("#start-navigation").addEventListener("click", () =>
      toast("Đã mở hướng dẫn tuyến mẫu trong bản demo."),
    );

    proofForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = $("#recipient-name").value.trim();
      const code = $("#handover-code").value.trim();
      const error = $("#proof-error");
      if (!name) {
        announce(error, "Nhập tên người nhận.", "error");
        $("#recipient-name").focus();
        return;
      }
      if (!/^\d{6}$/.test(code)) {
        announce(error, "Mã bàn giao demo gồm 6 chữ số.", "error");
        $("#handover-code").focus();
        return;
      }

      const completed = read("completedStops", []);
      if (!completed.includes(stopId)) completed.push(stopId);
      write("completedStops", completed);
      announce(
        $("#proof-status"),
        `Đã ghi nhận giao kiện ${stopId} trong bản demo. Không gửi bằng chứng ra máy chủ.`,
        "success",
      );
      error.textContent = "";
      $("#stop-detail-state").textContent = "Đã giao";
      $("#stop-detail-state").className = "chip green";
    });
  }

  /* ===== Driver: create an exception with a manual fallback ===== */
  const exceptionForm = $("#exception-form");
  if (exceptionForm) {
    const note = $("#exception-note");
    const category = $("#exception-category");
    const aiStatus = $("#classification-status");
    const suggestions = {
      "Không liên hệ được": [
        "không nghe",
        "không liên lạc",
        "không liên hệ",
        "không gọi",
      ],
      "Địa chỉ không hợp lệ": ["địa chỉ", "sai số nhà", "không tìm thấy"],
      "Khách đổi lịch": ["đổi lịch", "hẹn lại", "ngày mai"],
      "Kiện hàng hư hỏng": ["hư", "móp", "vỡ", "ướt"],
      "Xe gặp sự cố": ["xe", "lốp", "hỏng", "cứu hộ"],
    };
    const suggest = $("#classify-exception");
    suggest.addEventListener("click", () => {
      const text = note.value.trim().toLowerCase();
      if (text.length < 12) {
        announce(
          aiStatus,
          "Chưa đủ dữ liệu để AI gợi ý. Bổ sung mô tả hoặc tự chọn loại ngoại lệ.",
          "error",
        );
        return;
      }
      const match = Object.entries(suggestions).find(([, terms]) =>
        terms.some((term) => text.includes(term)),
      );
      if (!match) {
        delete suggest.dataset.value;
        announce(
          aiStatus,
          "AI chưa chắc chắn về phân loại này. Hãy chọn loại thủ công hoặc chỉnh sửa mô tả.",
          "error",
        );
        return;
      }
      suggest.dataset.value = match[0];
      announce(
        aiStatus,
        `Gợi ý: ${match[0]} · Tin cậy 84%. Kiểm tra lại trước khi áp dụng.`,
        "success",
      );
    });

    $("#apply-classification").addEventListener("click", () => {
      if (!suggest.dataset.value) {
        toast("Chưa có đề xuất. Bạn vẫn có thể chọn loại thủ công.");
        category.focus();
        return;
      }
      category.value = suggest.dataset.value;
      toast("Đã áp dụng phân loại gợi ý. Bạn có thể sửa trước khi gửi.");
    });

    exceptionForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!category.value) {
        announce(
          $("#exception-status"),
          "Chọn loại ngoại lệ hoặc nhập mô tả rồi dùng gợi ý trước khi gửi.",
          "error",
        );
        category.focus();
        return;
      }
      if (note.value.trim().length < 8) {
        announce(
          $("#exception-status"),
          "Mô tả sự cố cần ít nhất 8 ký tự.",
          "error",
        );
        note.focus();
        return;
      }
      const exceptions = read("driverExceptions", []);
      const id = `EX-DEMO-${String(Date.now()).slice(-5)}`;
      exceptions.unshift({
        id,
        stop: $("#exception-stop").value,
        category: category.value,
        note: note.value.trim(),
        createdAt: new Date().toISOString(),
      });
      write("driverExceptions", exceptions.slice(0, 20));
      announce(
        $("#exception-status"),
        `Đã tạo ngoại lệ ${id} trong dữ liệu demo và giữ nguyên quyền chỉnh sửa trước khi xử lý.`,
        "success",
      );
      exceptionForm.reset();
      delete suggest.dataset.value;
      aiStatus.textContent = "";
      $("#exception-evidence-name").textContent = "Chưa chọn ảnh.";
    });

    $("#exception-evidence").addEventListener("change", (event) => {
      const file = event.target.files[0];
      $("#exception-evidence-name").textContent = file
        ? `Đã chọn ${file.name}. Ảnh chỉ được giữ trên thiết bị khi xem trước.`
        : "Chưa chọn ảnh.";
      if (file && !file.type.startsWith("image/")) {
        event.target.value = "";
        $("#exception-evidence-name").textContent =
          "Tệp không phải ảnh. Chọn JPG, PNG hoặc ảnh phù hợp.";
      }
    });
  }

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
