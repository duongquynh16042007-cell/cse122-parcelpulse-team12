document.addEventListener("DOMContentLoaded", () => {
  // =========================================================================
  // PHẦN 1: LOGIC CHO TRANG ĐĂNG NHẬP (Login)
  // =========================================================================
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    const identity = document.getElementById("identity");
    const password = document.getElementById("password");
    const roleInput = document.getElementById("role");
    const identityError = document.getElementById("identityError");
    const passwordError = document.getElementById("passwordError");
    const formAlert = document.getElementById("formAlert");
    const togglePassword = document.getElementById("togglePassword");
    const roleButtons = document.querySelectorAll(".role-option");

    // Chọn vai trò đăng nhập
    roleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        roleButtons.forEach((item) => {
          item.classList.remove("active");
          item.setAttribute("aria-pressed", "false");
        });
        button.classList.add("active");
        button.setAttribute("aria-pressed", "true");
        roleInput.value = button.dataset.role;
      });
    });

    // Hiện / ẩn mật khẩu
    if (togglePassword) {
      togglePassword.addEventListener("click", () => {
        const isPassword = password.type === "password";
        password.type = isPassword ? "text" : "password";
        togglePassword.textContent = isPassword ? "Ẩn" : "Hiện";
        togglePassword.setAttribute(
          "aria-label",
          isPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu",
        );
      });
    }

    // Xóa trạng thái lỗi khi người dùng bắt đầu sửa
    identity.addEventListener("input", () =>
      clearFieldError(identity, identityError),
    );
    password.addEventListener("input", () =>
      clearFieldError(password, passwordError),
    );

    function clearFieldError(input, message) {
      input.classList.remove("invalid");
      input.removeAttribute("aria-invalid");
      message.textContent = "";
      hideAlert();
    }

    function showFieldError(input, messageElement, message) {
      input.classList.add("invalid");
      input.setAttribute("aria-invalid", "true");
      messageElement.textContent = message;
    }

    function hideAlert() {
      formAlert.textContent = "";
      formAlert.className = "form-alert";
    }

    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      clearFieldError(identity, identityError);
      clearFieldError(password, passwordError);
      let isValid = true;

      const identityValue = identity.value.trim();
      const passwordValue = password.value;

      if (identityValue === "") {
        showFieldError(
          identity,
          identityError,
          "Vui lòng nhập email hoặc số điện thoại.",
        );
        isValid = false;
      } else {
        const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identityValue);
        const looksLikePhone = /^[0-9+\s()-]{9,15}$/.test(identityValue);
        if (!looksLikeEmail && !looksLikePhone) {
          showFieldError(
            identity,
            identityError,
            "Nhập email hợp lệ hoặc số điện thoại từ 9–15 chữ số.",
          );
          isValid = false;
        }
      }

      if (passwordValue.trim() === "") {
        showFieldError(password, passwordError, "Vui lòng nhập mật khẩu.");
        isValid = false;
      } else if (passwordValue.length < 6) {
        showFieldError(
          password,
          passwordError,
          "Mật khẩu phải có ít nhất 6 ký tự.",
        );
        isValid = false;
      }

      if (!isValid) {
        formAlert.textContent = "Vui lòng kiểm tra lại thông tin đăng nhập.";
        formAlert.className = "form-alert error show";
        const firstInvalid = loginForm.querySelector(".invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const roleNames = {
        driver: "Nhân viên giao hàng",
        dispatcher: "Điều phối viên",
        admin: "Quản trị viên",
      };

      formAlert.textContent = `Thông tin hợp lệ cho vai trò ${roleNames[roleInput.value]}. Đây là bản demo giao diện; chưa xác thực tài khoản với máy chủ.`;
      formAlert.className = "form-alert success show";
    });

    const forgotLink = document.getElementById("forgotLink");
    if (forgotLink) {
      forgotLink.addEventListener("click", (event) => {
        event.preventDefault();
        formAlert.textContent =
          "Chức năng quên mật khẩu sẽ được kết nối khi xây dựng trang khôi phục mật khẩu.";
        formAlert.className = "form-alert success show";
      });
    }

    const registerLink = document.getElementById("registerLink");
    if (registerLink) {
      registerLink.addEventListener("click", (event) => {
        event.preventDefault();
        formAlert.textContent =
          "Trang đăng ký sẽ được xây dựng ở bước tiếp theo.";
        formAlert.className = "form-alert success show";
      });
    }
  }

  // =========================================================================
  // PHẦN 2: LOGIC CHO TRANG QUÊN MẬT KHẨU (Forgot Password) - ĐÃ THÊM
  // =========================================================================
  const forgotForm = document.querySelector('[data-form="forgot"]');

  if (forgotForm) {
    const tabs = document.querySelectorAll(".tab");
    const panes = document.querySelectorAll("[data-pane]");

    // Xử lý chuyển đổi tab Email / Số điện thoại
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.tab;

        // Cập nhật trạng thái của các tab
        tabs.forEach((t) => {
          t.setAttribute("aria-selected", "false");
          t.classList.remove("active"); // Nếu bạn có class active trong CSS
        });
        tab.setAttribute("aria-selected", "true");
        tab.classList.add("active");

        // Hiển thị/Ẩn ô input tương ứng
        panes.forEach((pane) => {
          if (pane.dataset.pane === target) {
            pane.hidden = false;
          } else {
            pane.hidden = true;
          }
        });
      });
    });

    // Xử lý submit form quên mật khẩu (Demo)
    forgotForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const statusEl = document.getElementById("status");
      const activeTab = document.querySelector('.tab[aria-selected="true"]')
        .dataset.tab;
      const inputValue =
        activeTab === "email"
          ? document.getElementById("rec-email").value
          : document.getElementById("rec-phone").value;

      if (!inputValue.trim()) {
        statusEl.textContent = `Vui lòng nhập ${activeTab === "email" ? "email" : "số điện thoại"}.`;
        statusEl.style.color = "red";
        return;
      }

      statusEl.textContent = `Đã gửi liên kết khôi phục đến ${activeTab === "email" ? "email" : "SĐT"} của bạn (Demo).`;
      statusEl.style.color = "green";
    });
  }
});
