// Xử lý biểu mẫu tra cứu trên trang chủ.
document.addEventListener("DOMContentLoaded", () => {
  // Chỉ chạy nếu đang ở trang index (có form tracking)
  const trackingForm = document.getElementById("guestTrackingForm");

  if (trackingForm) {
    const codeInput = document.getElementById("track-code");
    const phoneInput = document.getElementById("track-phone");
    const statusEl = document.getElementById("trackingStatus");

    // Format số điện thoại khi nhập
    phoneInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[^\d\s\+\-]/g, "");
    });

    trackingForm.addEventListener("submit", (event) => {
      event.preventDefault();
      statusEl.textContent = "";
      statusEl.className = "status"; // Reset class

      const code = codeInput.value.trim();
      const phone = phoneInput.value.trim();
      let hasError = false;

      // Validation đơn giản
      if (!code) {
        showFieldError(codeInput, "Vui lòng nhập mã vận đơn.");
        hasError = true;
      }

      if (!phone) {
        showFieldError(phoneInput, "Vui lòng nhập số điện thoại.");
        hasError = true;
      } else if (!/^[0-9+\s-]{9,15}$/.test(phone)) {
        showFieldError(phoneInput, "Số điện thoại không hợp lệ (9-15 ký tự).");
        hasError = true;
      }

      if (hasError) {
        statusEl.textContent = "Vui lòng kiểm tra lại thông tin nhập vào.";
        statusEl.classList.add("status--error");
        return;
      }

      // Giả lập gọi API
      statusEl.textContent = "Đang tra cứu dữ liệu...";
      trackingForm.querySelector("button").disabled = true;

      setTimeout(() => {
        trackingForm.querySelector("button").disabled = false;

        // Demo: Giả lập tìm thấy hoặc không tìm thấy
        if (code.toUpperCase().startsWith("PP-")) {
          statusEl.textContent = `✅ Tìm thấy kiện hàng ${code}. Đang chuyển hướng đến trang chi tiết...`;
          statusEl.style.borderColor = "var(--success)";
          statusEl.style.color = "var(--success)";
          // window.location.href = `tracking-detail.html?code=${code}`;
        } else {
          statusEl.textContent =
            "❌ Không tìm thấy kiện hàng với thông tin này. Vui lòng kiểm tra lại mã hoặc liên hệ nhân viên giao hàng.";
          statusEl.classList.add("status--error");
        }
      }, 1500);
    });

    function showFieldError(input, message) {
      input.style.borderColor = "var(--err)";
      input.setAttribute("aria-invalid", "true");

      // Tạo thông báo lỗi nhỏ dưới input nếu chưa có
      let errEl = input.parentElement.nextElementSibling;
      if (!errEl || !errEl.classList.contains("err-msg")) {
        errEl = document.createElement("p");
        errEl.className = "err-msg";
        errEl.style.color = "var(--err)";
        errEl.style.fontSize = "11.5px";
        errEl.style.margin = "4px 0 0 4px";
        input.parentElement.after(errEl);
      }
      errEl.textContent = message;
    }

    // Xóa lỗi khi người dùng bắt đầu gõ lại
    [codeInput, phoneInput].forEach((input) => {
      input.addEventListener("input", () => {
        input.style.borderColor = "";
        input.removeAttribute("aria-invalid");
        const errEl = input.parentElement.nextElementSibling;
        if (errEl && errEl.classList.contains("err-msg")) {
          errEl.remove();
        }
        statusEl.textContent = "";
        statusEl.className = "status";
      });
    });
  }
});
