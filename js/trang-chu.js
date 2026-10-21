// Trang chủ ParcelPulse.
document.addEventListener("DOMContentLoaded", () => {
  const trackingForm = document.getElementById("trackingForm");
  if (!trackingForm) return;

  const codeInput = document.getElementById("trackingCode");
  const phoneInput = document.getElementById("phoneNumber");
  const otpGroup = document.getElementById("guestOtpGroup");
  const otpInput = document.getElementById("guestOtp");
  const submitButton = trackingForm.querySelector('[type="submit"]');
  const status = document.getElementById("guestTrackStatus");
  let awaitingOtp = false;

  const clearFieldError = (input) => {
    input.removeAttribute("aria-invalid");
    const error = input.closest(".form-group").querySelector(".err-msg");
    error?.remove();
  };

  const showFieldError = (input, message) => {
    input.setAttribute("aria-invalid", "true");
    let error = input.closest(".form-group").querySelector(".err-msg");
    if (!error) {
      error = document.createElement("p");
      error.className = "err-msg";
      error.setAttribute("role", "alert");
      input.closest(".form-group").append(error);
    }
    error.textContent = message;
  };

  const resetVerification = () => {
    if (!awaitingOtp) return;
    awaitingOtp = false;
    otpInput.value = "";
    otpInput.disabled = true;
    otpInput.required = false;
    otpGroup.hidden = true;
    submitButton.childNodes[0].nodeValue = "Gửi mã xác minh ";
    status.textContent = "";
    delete status.dataset.tone;
  };

  [codeInput, phoneInput].forEach((input) => {
    input.addEventListener("input", () => {
      resetVerification();
      clearFieldError(input);
      status.textContent = "";
      delete status.dataset.tone;
    });
  });
  otpInput.addEventListener("input", () => clearFieldError(otpInput));

  phoneInput.addEventListener("input", () => {
    phoneInput.value = phoneInput.value.replace(/[^\d\s()+.-]/g, "");
  });

  trackingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearFieldError(codeInput);
    clearFieldError(phoneInput);
    clearFieldError(otpInput);
    status.textContent = "";
    delete status.dataset.tone;

    if (!awaitingOtp) {
      const code = codeInput.value.trim().toUpperCase();
      const digits = phoneInput.value.replace(/\D/g, "");
      let valid = true;

      if (!/^(?:PPVN|PTVN)-[A-Z0-9-]{6,20}$/.test(code)) {
        showFieldError(
          codeInput,
          "Nhập mã vận đơn hợp lệ, ví dụ PPVN-4829-1024.",
        );
        valid = false;
      }
      if (digits.length < 9 || digits.length > 15) {
        showFieldError(phoneInput, "Nhập số điện thoại gồm 9 đến 15 chữ số.");
        valid = false;
      }
      if (!valid) {
        status.textContent =
          "Vui lòng kiểm tra lại mã vận đơn và số điện thoại.";
        status.dataset.tone = "error";
        trackingForm.querySelector('[aria-invalid="true"]').focus();
        return;
      }
      if (code !== "PPVN-4829-1024") {
        status.textContent =
          "Không tìm thấy kiện hàng trong dữ liệu mẫu. Thử mã PPVN-4829-1024.";
        status.dataset.tone = "error";
        return;
      }

      awaitingOtp = true;
      otpGroup.hidden = false;
      otpInput.disabled = false;
      otpInput.required = true;
      submitButton.childNodes[0].nodeValue = "Xác minh và xem kiện hàng ";
      status.textContent =
        "Đã tìm thấy kiện mẫu. Mã xác minh dùng thử: 123456. Bản demo không gửi SMS thật.";
      status.dataset.tone = "success";
      otpInput.focus();
      return;
    }

    if (!/^\d{6}$/.test(otpInput.value.trim())) {
      showFieldError(otpInput, "Nhập mã xác minh gồm đúng 6 chữ số.");
      status.textContent = "Mã xác minh chưa hợp lệ.";
      status.dataset.tone = "error";
      otpInput.focus();
      return;
    }
    if (otpInput.value.trim() !== "123456") {
      showFieldError(otpInput, "Mã xác minh không khớp. Kiểm tra lại mã demo.");
      status.textContent = "Không thể xác minh mã này.";
      status.dataset.tone = "error";
      otpInput.focus();
      return;
    }

    status.textContent =
      "Xác minh thành công trong bản demo. Đang mở hành trình...";
    status.dataset.tone = "success";
    window.location.href = `theo-doi-kien-hang.html?code=${encodeURIComponent(
      codeInput.value.trim().toUpperCase(),
    )}`;
  });
});
