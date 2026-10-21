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

  const trackForm = $("#parcel-track-form");
  if (trackForm) {
    const input = $("#parcel-code");
    const status = $("#track-status");
    const results = $$(".track-result");
    const parcelCode = new URLSearchParams(location.search).get("code");
    if (parcelCode) input.value = parcelCode.toUpperCase();

    input.addEventListener("input", () => {
      input.removeAttribute("aria-invalid");
      results.forEach((result) => {
        result.hidden = true;
      });
      announce(status, "");
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

      input.removeAttribute("aria-invalid");
      results.forEach((result) => {
        result.hidden = false;
        $$("[data-parcel-code]", result).forEach((codeElement) => {
          codeElement.textContent = code;
        });
      });
      announce(
        status,
        "Đã hiển thị bản xem trước cho mã này. Trạng thái và hành trình bên dưới là dữ liệu minh họa.",
        "success",
      );
    });
  }

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
      ratingCaption.textContent = "Chọn số sao";
      ratingInputs.forEach((ratingInput) => {
        ratingInput.closest(".rating-option").classList.remove("is-selected");
      });
    });
  }
});
