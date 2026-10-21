/* ParcelPulse role-specific interactions. */
document.addEventListener("DOMContentLoaded", () => {
  const { $, $$, read, write, toast, announce } = window.ParcelPulseRolePages;

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
