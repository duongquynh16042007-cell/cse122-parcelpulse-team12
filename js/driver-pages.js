/* ParcelPulse role-specific interactions. */
document.addEventListener("DOMContentLoaded", () => {
  const {
    $, $$, read, write, toast, announce, registerSharedRecord,
  } = window.ParcelPulseRolePages;

  /* ===== Driver: route and stops ===== */
  let routeStops = $$(".route-stop");
  if (routeStops.length) {
    const filters = $$("[data-stop-filter]");
    const search = $("#stop-search");
    const completed = new Set(read("completedStops", []));
    const exceptions = new Set(
      read("driverExceptions", []).map((item) => item.stop),
    );
    const routeDriverName = (
      $(".user strong")?.textContent || read("profile.driver", {}).name || ""
    ).trim();
    const assignments = read("assignments", []);
    const assignedStops = (Array.isArray(assignments) ? assignments : [])
      .filter(
        (assignment) =>
          String(assignment.driver || "").trim().toLocaleLowerCase("vi") ===
          routeDriverName.toLocaleLowerCase("vi"),
      )
      .flatMap((assignment) =>
        (Array.isArray(assignment.routeStops) ? assignment.routeStops : []).map(
          (stop) => ({ ...stop, assignmentId: assignment.id }),
        ),
      );

    assignedStops.forEach((assignment) => {
      if (!assignment.stopId) return;
      let routeStop = routeStops.find(
        (stop) => stop.dataset.stop === assignment.stopId,
      );
      if (!routeStop) {
        routeStop = document.createElement("article");
        routeStop.className = "route-stop";
        routeStop.id = assignment.stopId;
        routeStop.dataset.stop = assignment.stopId;
        routeStop.dataset.status = "pending";
        const avatar = document.createElement("span");
        avatar.className = "avatar";
        avatar.setAttribute("aria-hidden", "true");
        avatar.textContent = "↻";
        const content = document.createElement("div");
        const title = document.createElement("strong");
        title.textContent = `${assignment.stopId}${assignment.parcelId ? ` · ${assignment.parcelId}` : ""}`;
        const source = document.createElement("small");
        source.textContent = "Điểm được điều phối phân công lại";
        content.append(title, source);
        routeStop.append(avatar, content);
        const actions = document.createElement("div");
        actions.className = "stop-actions";
        const state = document.createElement("span");
        state.className = "chip stop-state";
        const detail = document.createElement("a");
        detail.className = "btn";
        detail.href = `driver-stop-detail.html?stop=${encodeURIComponent(assignment.stopId)}`;
        detail.textContent = "Chi tiết";
        const complete = document.createElement("button");
        complete.className = "btn primary";
        complete.type = "button";
        complete.dataset.stopComplete = "";
        complete.textContent = "Đã giao";
        actions.append(state, detail, complete);
        routeStop.append(actions);
        $(".route-list")?.append(routeStop);
      } else {
        routeStop.dataset.status = "pending";
      }

      const content = routeStop.children[1];
      const noteKey = `${assignment.assignmentId}:${assignment.exceptionId || assignment.stopId}`;
      const alreadyShown = [...content.querySelectorAll("[data-route-assignment]")].some(
        (note) => note.dataset.routeAssignment === noteKey,
      );
      if (!alreadyShown) {
        const note = document.createElement("small");
        note.dataset.routeAssignment = noteKey;
        note.textContent = assignment.exceptionId
          ? `Phân công lại từ ngoại lệ ${assignment.exceptionId}${assignment.type ? ` · ${assignment.type}` : ""}`
          : "Được điều phối phân công lại";
        content.append(note);
        routeStop.dataset.status = "pending";
      }
    });
    routeStops = $$(".route-stop");
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
        label.textContent =
          status === "completed"
            ? "Đã giao"
            : status === "exception"
              ? "Có ngoại lệ"
              : "Chờ giao";
        label.classList.toggle("green", status === "completed");
        label.classList.toggle("amber", status === "exception");
        stop.classList.toggle("is-complete", status === "completed");
        const completeButton = $("[data-stop-complete]", stop);
        if (completeButton) {
          const isComplete = status === "completed";
          completeButton.textContent = isComplete ? "Hoàn tác" : "Đã giao";
          completeButton.classList.toggle("primary", !isComplete);
        }
      });
      $("#stops-empty").hidden = visibleCount > 0;
      $("#stop-count").textContent =
        activeFilter === "all"
          ? `${visibleCount} điểm dừng`
          : `${visibleCount} điểm phù hợp`;
      $("#route-done-count").textContent = String(
        routeStops.filter((stop) => stop.dataset.status === "completed").length,
      );
      $("#route-total-count").textContent = String(routeStops.length);
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
        registerSharedRecord({
          id: `driver-stop:${stop.dataset.stop}`,
          sourceRole: "Nhân viên giao hàng",
          sourceType: "Cập nhật điểm giao",
          reference: stop.dataset.stop,
          title: `${isComplete ? "Xác nhận đã giao" : "Mở lại"} ${stop.dataset.stop}`,
          summary: isComplete
            ? "Nhân viên giao hàng đã đánh dấu điểm giao hoàn tất; chờ quản trị viên đối soát."
            : "Điểm giao đã được mở lại trong dữ liệu demo.",
          status: isComplete ? "pending" : "cancelled",
          payload: { stop: stop.dataset.stop, completed: isComplete },
        });
        renderStops();
        toast(
          stop.dataset.status === "completed"
            ? `Đã cập nhật ${stop.dataset.stop} thành đã giao.`
            : `Đã mở lại ${stop.dataset.stop}.`,
        );
      });
    });
    window.addEventListener("storage", (event) => {
      if (event.key === "parcelpulse.assignments") window.location.reload();
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
      registerSharedRecord({
        id: `driver-proof:${stopId}`,
        sourceRole: "Nhân viên giao hàng",
        sourceType: "Bằng chứng bàn giao",
        reference: stopId,
        title: `Xác nhận bàn giao ${stopId}`,
        summary: `Đã ghi nhận người nhận ${name}. Mã bàn giao được kiểm tra trong bản demo và không lưu vào hồ sơ quản trị.`,
        status: "pending",
        payload: { stop: stopId, recipientName: name, verified: true },
      });
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
    exceptionForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!category.value) {
        announce(
          $("#exception-status"),
          "Chọn loại ngoại lệ trước khi gửi.",
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
      const storedExceptions = read("driverExceptions", []);
      const exceptions = Array.isArray(storedExceptions) ? storedExceptions : [];
      const id = `EX-DEMO-${String(Date.now()).slice(-5)}`;
      const stopSelect = $("#exception-stop");
      const stop = stopSelect.value;
      const parcel = stopSelect.selectedOptions[0]?.textContent.split("·").pop().trim() || "";
      const exception = {
        id,
        stop,
        parcel,
        category: category.value,
        note: note.value.trim(),
        createdAt: new Date().toISOString(),
      };
      exceptions.unshift(exception);
      try {
        write("driverExceptions", exceptions.slice(0, 20));
      } catch {
        announce(
          $("#exception-status"),
          "Không lưu được ngoại lệ trên trình duyệt này. Hãy kiểm tra quyền lưu rồi thử lại.",
          "error",
        );
        return;
      }
      try {
        registerSharedRecord({
          id: `driver-exception:${id}`,
          sourceRole: "Nhân viên giao hàng",
          sourceType: "Ngoại lệ giao hàng",
          reference: stop,
          title: `${category.value} tại ${stop}`,
          summary: note.value.trim(),
          status: "pending",
          payload: { exceptionId: id, stop, parcel, category: category.value },
          createdAt: exception.createdAt,
        });
      } catch {
        // Dispatcher can still read the saved driverExceptions record directly.
      }
      announce(
        $("#exception-status"),
        `Đã gửi ngoại lệ ${id} cho nhân viên điều hành. Vui lòng chờ xác nhận.`,
        "success",
      );
      exceptionForm.reset();
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
});
