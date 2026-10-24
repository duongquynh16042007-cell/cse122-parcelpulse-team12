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

  // Mã kiện hàng mẫu hợp lệ duy nhất của bản demo
  const VALID_DEMO_CODE = "PPVN-4829-1024";

  // Kiểm tra mã đã tra cứu thành công từ URL hoặc LocalStorage
  const urlParcelCode = new URLSearchParams(location.search).get("code");
  const storedParcelCode = read("trackedParcel", null);

  // Chỉ kích hoạt mã nếu đúng mã mẫu demo hợp lệ
  let activeCode = "";
  if (urlParcelCode && urlParcelCode.trim().toUpperCase() === VALID_DEMO_CODE) {
    activeCode = VALID_DEMO_CODE;
    write("trackedParcel", VALID_DEMO_CODE);
  } else if (storedParcelCode && storedParcelCode.trim().toUpperCase() === VALID_DEMO_CODE) {
    activeCode = VALID_DEMO_CODE;
  }

  // Cập nhật hiển thị mã đơn hàng trên các trang
  const updateParcelCodeDisplay = (code) => {
    const displayCode = code || VALID_DEMO_CODE;
    $$("[data-parcel-code]").forEach((el) => {
      el.textContent = displayCode;
    });

    // Cập nhật các liên kết điều hướng để luôn giữ mã đơn hàng khi chuyển trang
    if (code) {
      $$("a[href*='track-parcel.html'], a[href*='delivery-preferences.html'], a[href*='delivery-feedback.html']").forEach((link) => {
        try {
          const href = link.getAttribute("href");
          if (!href) return;
          const [path] = href.split("?");
          link.setAttribute("href", `${path}?code=${encodeURIComponent(code)}`);
        } catch (e) {}
      });
    }
  };

  // Cập nhật hiển thị ban đầu
  updateParcelCodeDisplay(activeCode);

  // Xử lý trang Tra cứu kiện hàng
  const trackForm = $("#parcel-track-form");
  if (trackForm) {
    const input = $("#parcel-code");
    const status = $("#track-status");
    const results = $$(".track-result");

    // Hàm hiển thị kết quả tra cứu
    const showTrackingResult = (code, announcementText, tone = "success") => {
      input.value = code;
      input.removeAttribute("aria-invalid");
      results.forEach((result) => {
        result.hidden = false;
      });
      activeCode = code;
      write("trackedParcel", code);
      updateParcelCodeDisplay(code);

      // Cập nhật URL mà không reload trang
      try {
        const url = new URL(location);
        url.searchParams.set("code", code);
        history.replaceState(null, "", url);
      } catch (e) {}

      if (announcementText) {
        announce(status, announcementText, tone);
      }
    };

    // Hàm ẩn kết quả tra cứu khi mã chưa hợp lệ
    const hideTrackingResult = (announcementText, tone = "error") => {
      results.forEach((result) => {
        result.hidden = true;
      });
      input.setAttribute("aria-invalid", "true");
      write("trackedParcel", null);

      try {
        const url = new URL(location);
        url.searchParams.delete("code");
        history.replaceState(null, "", url);
      } catch (e) {}

      if (announcementText) {
        announce(status, announcementText, tone);
      }
    };

    // Khi người dùng mới vào trang:
    // - Nếu ĐÃ tra cứu đúng mã trước đó: giữ nguyên kết quả hiển thị (không bị mất khi chuyển sidebar)
    // - Nếu CHƯA tra cứu: chỉ hiển thị thanh nhập mã, ẩn hoàn toàn phần thông tin bên dưới
    if (activeCode === VALID_DEMO_CODE) {
      showTrackingResult(
        VALID_DEMO_CODE,
        urlParcelCode ? `Đang hiển thị thông tin bưu kiện ${VALID_DEMO_CODE}.` : "",
        "success"
      );
    } else {
      input.value = "";
      results.forEach((result) => {
        result.hidden = true;
      });
      announce(status, "");
    }

    // Bấm vào mã mẫu để tự động điền và tra cứu ngay
    const demoHint = $(".demo-hint strong");
    if (demoHint) {
      demoHint.style.cursor = "pointer";
      demoHint.title = "Bấm để tra cứu mã mẫu";
      demoHint.addEventListener("click", () => {
        input.value = VALID_DEMO_CODE;
        showTrackingResult(
          VALID_DEMO_CODE,
          `Đã tìm thấy kiện hàng mẫu ${VALID_DEMO_CODE}.`,
          "success"
        );
      });
    }

    // Khi người dùng đang nhập thì xóa trạng thái lỗi
    input.addEventListener("input", () => {
      input.removeAttribute("aria-invalid");
      announce(status, "");
    });

    // Khi người dùng gửi form tra cứu
    trackForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const code = input.value.trim().toUpperCase();

      // Kiểm tra rỗng
      if (!code) {
        hideTrackingResult("Vui lòng nhập mã vận đơn để tra cứu.", "error");
        input.focus();
        return;
      }

      // Kiểm tra định dạng cơ bản
      if (!/^(?:PP|PPVN|PTVN)-[A-Z0-9-]{6,20}$/.test(code)) {
        hideTrackingResult(
          "Định dạng mã không hợp lệ. Vui lòng thử mã mẫu: " + VALID_DEMO_CODE,
          "error"
        );
        input.focus();
        return;
      }

      // Kiểm tra mã có tồn tại trong hệ thống demo không
      if (code !== VALID_DEMO_CODE) {
        hideTrackingResult(
          `Không tìm thấy kiện hàng "${code}" trong hệ thống. Vui lòng thử mã mẫu: ${VALID_DEMO_CODE}`,
          "error"
        );
        input.focus();
        return;
      }

      // Nhập đúng mã demo: Hiển thị phần thông tin ở dưới và lưu trạng thái
      showTrackingResult(
        code,
        `Đã tìm thấy kiện hàng ${code}. Thông tin hành trình hiển thị bên dưới.`,
        "success"
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
      const currentParcel = activeCode || VALID_DEMO_CODE;
      write("deliveryPreferences", {
        parcel: currentParcel,
        mode,
        window: $("#delivery-window").value,
        address: mode === "home" ? details : "",
        pickup: mode === "pickup" ? details : "",
        note: $("#delivery-note").value.trim(),
      });
      announce(
        $("#preferences-status"),
        `Đã lưu tùy chọn cho đơn hàng ${currentParcel} trên thiết bị này.`,
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

      const currentParcel = activeCode || VALID_DEMO_CODE;
      const feedback = read("feedback", []);
      feedback.unshift({
        parcel: currentParcel,
        rating: Number(rating.value),
        reason:
          $('input[name="feedback-reason"]:checked', feedbackForm)?.value || "",
        comment,
        createdAt: new Date().toISOString(),
      });
      write("feedback", feedback.slice(0, 20));
      announce(
        $("#feedback-status"),
        `Cảm ơn bạn! Phản hồi cho đơn hàng ${currentParcel} đã được lưu trên thiết bị này.`,
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
