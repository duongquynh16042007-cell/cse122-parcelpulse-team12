// Tương tác cho các trang chức năng người nhận.
document.addEventListener("DOMContentLoaded", () => {
  const { $, $$, read, write, toast, announce } = window.ParcelPulseRolePages;
  const recipientProfile = read("profile.recipient", {});
  const recipientSession = read("demoSession", null);
  const sideUserName = $(".side-user strong");
  if (sideUserName) {
    sideUserName.textContent =
      recipientProfile.name ||
      (recipientSession?.role === "recipient" ? recipientSession.name : "") ||
      sideUserName.textContent.trim() ||
      "Minh Anh";
  }

  // Quản lý mã bưu kiện đang hoạt động (lưu qua LocalStorage và URL query)
  const DEFAULT_PARCEL_CODE = "PPVN-4829-1024";
  const urlParcelCode = new URLSearchParams(location.search).get("code");
  const storedParcelCode = read("trackedParcel", null);
  let activeCode = (urlParcelCode || storedParcelCode || DEFAULT_PARCEL_CODE).trim().toUpperCase();

  // Đồng bộ vào LocalStorage nếu được truyền từ trang khác qua URL
  if (urlParcelCode && urlParcelCode.trim()) {
    write("trackedParcel", activeCode);
  }

  // Cập nhật tất cả các vị trí hiển thị mã đơn hàng trên trang hiện tại
  const updateParcelCodeDisplay = (code) => {
    $$("[data-parcel-code]").forEach((el) => {
      el.textContent = code;
    });

    // Cập nhật các liên kết điều hướng nội bộ để luôn giữ mã đơn hàng khi chuyển trang
    $$("a[href*='track-parcel.html'], a[href*='delivery-preferences.html'], a[href*='delivery-feedback.html']").forEach((link) => {
      try {
        const href = link.getAttribute("href");
        if (!href) return;
        const [path] = href.split("?");
        link.setAttribute("href", `${path}?code=${encodeURIComponent(code)}`);
      } catch (e) {}
    });
  };

  updateParcelCodeDisplay(activeCode);

  // Xử lý trang Tra cứu kiện hàng
  const trackForm = $("#parcel-track-form");
  if (trackForm) {
    const input = $("#parcel-code");
    const status = $("#track-status");
    const results = $$(".track-result");

    // Hàm hiển thị kết quả và lưu trạng thái
    const displayTrackingResult = (code, announcementText, tone = "success") => {
      input.value = code;
      input.removeAttribute("aria-invalid");
      results.forEach((result) => {
        result.hidden = false;
      });
      activeCode = code;
      write("trackedParcel", code);
      updateParcelCodeDisplay(code);

      // Cập nhật URL không reload để lưu lại lịch sử duyệt
      try {
        const url = new URL(location);
        url.searchParams.set("code", code);
        history.replaceState(null, "", url);
      } catch (e) {}

      if (announcementText) {
        announce(status, announcementText, tone);
      }
    };

    // Khi mở trang: tự động khôi phục mã đã tìm kiếm trước đó, không bị mất kết quả
    if (activeCode) {
      const message = urlParcelCode
        ? `Đã hiển thị thông tin bưu kiện ${activeCode}.`
        : (storedParcelCode
            ? `Đang lưu và hiển thị bưu kiện đã tra cứu: ${activeCode}.`
            : "");
      displayTrackingResult(activeCode, message);
    }

    // Cho phép bấm vào mã thử nghiệm để tự động điền và tra cứu ngay
    const demoHint = $(".demo-hint strong");
    if (demoHint) {
      demoHint.style.cursor = "pointer";
      demoHint.title = "Bấm để tra cứu mã mẫu này";
      demoHint.addEventListener("click", () => {
        displayTrackingResult(demoHint.textContent.trim().toUpperCase(), "Đang tra cứu mã mẫu...");
      });
    }

    input.addEventListener("input", () => {
      input.removeAttribute("aria-invalid");
      if (status) announce(status, "");
    });

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

      displayTrackingResult(
        code,
        `Đã hiển thị thông tin cho mã ${code}. Trạng thái sẽ được lưu khi chuyển sang các tác vụ khác.`,
        "success",
      );
    });
  }

  // Xử lý trang Tùy chọn giao nhận
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
        parcel: activeCode,
        mode,
        window: $("#delivery-window").value,
        address: mode === "home" ? details : "",
        pickup: mode === "pickup" ? details : "",
        note: $("#delivery-note").value.trim(),
      });
      announce(
        $("#preferences-status"),
        `Đã lưu tùy chọn cho đơn hàng ${activeCode} trên thiết bị này.`,
        "success",
      );
    });
  }

  // Xử lý trang Đánh giá và phản hồi
  const feedbackForm = $("#feedback-form");
  if (feedbackForm) {
    const ratingCaptions = {
      1: "Rất chưa hài lòng",
      2: "Chưa hài lòng",
      3: "Bình thường",
      4: "Hài lòng",
      5: "Rất hài lòng",
    };
    const ratingInputs = $$('input[name="rating"]', feedbackForm);
    const ratingCaption = $("#rating-caption");
    ratingInputs.forEach((input) => {
      input.addEventListener("change", () => {
        const selectedRating = Number(input.value);
        ratingCaption.textContent = ratingCaptions[selectedRating];
        ratingInputs.forEach((ratingInput) => {
          ratingInput.closest(".rating-option").classList.toggle(
            "is-selected",
            Number(ratingInput.value) <= selectedRating,
          );
        });
      });
    });

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
        parcel: activeCode,
        rating: Number(rating.value),
        reason:
          $('input[name="feedback-reason"]:checked', feedbackForm)?.value || "",
        comment,
        createdAt: new Date().toISOString(),
      });
      write("feedback", feedback.slice(0, 20));
      announce(
        $("#feedback-status"),
        `Cảm ơn bạn! Phản hồi cho đơn hàng ${activeCode} đã được lưu trên thiết bị này.`,
        "success",
      );
      feedbackForm.reset();
      ratingCaption.textContent = "Chọn số sao";
      ratingInputs.forEach((ratingInput) => {
        ratingInput.closest(".rating-option").classList.remove("is-selected");
      });
    });
  }
});
