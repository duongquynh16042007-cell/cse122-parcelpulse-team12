// Xử lý đăng nhập, đăng ký và khôi phục mật khẩu.
document.addEventListener("DOMContentLoaded", () => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const loginForm = document.querySelector('[data-form="login"]');

  if (loginForm) {
    const identifier = loginForm.querySelector("#identifier");
    const password = loginForm.querySelector("#password");
    const identifierError = loginForm.querySelector("#identifier-err");
    const passwordError = loginForm.querySelector("#password-err");
    const status = loginForm.querySelector("#status");
    const requestedRole = new URLSearchParams(location.search).get("role");
    const requestedRoleInput = requestedRole
      ? loginForm.querySelector('input[name="role"][value="' + requestedRole + '"]')
      : null;
    if (requestedRoleInput) requestedRoleInput.checked = true;
    const togglePassword = loginForm.querySelector(".eye");

    const clearStatus = () => {
      status.textContent = "";
      status.classList.remove("status--error");
    };

    const clearFieldError = (input, error) => {
      input.removeAttribute("aria-invalid");
      error.textContent = "";
      clearStatus();
    };

    const showFieldError = (input, error, message) => {
      input.setAttribute("aria-invalid", "true");
      error.textContent = message;
    };

    identifier.addEventListener("input", () =>
      clearFieldError(identifier, identifierError),
    );
    password.addEventListener("input", () =>
      clearFieldError(password, passwordError),
    );
    loginForm
      .querySelectorAll('input[name="role"]')
      .forEach((role) => role.addEventListener("change", clearStatus));

    if (togglePassword) {
      togglePassword.addEventListener("click", () => {
        const isPassword = password.type === "password";
        password.type = isPassword ? "text" : "password";
        togglePassword.setAttribute(
          "aria-label",
          isPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu",
        );
        togglePassword.setAttribute("aria-pressed", String(isPassword));

        const icon = togglePassword.querySelector(".ico");
        if (icon) {
          icon.classList.toggle("i-eye", !isPassword);
          icon.classList.toggle("i-eyeoff", isPassword);
        }
      });
    }

    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();

      clearFieldError(identifier, identifierError);
      clearFieldError(password, passwordError);
      let isValid = true;
      const identifierValue = identifier.value.trim();
      const phoneDigits = identifierValue.replace(/\D/g, "");
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifierValue);
      const isPhone =
        /^[+]?[0-9\s().-]+$/.test(identifierValue) &&
        phoneDigits.length >= 9 &&
        phoneDigits.length <= 15;

      if (!identifierValue) {
        showFieldError(
          identifier,
          identifierError,
          "Vui lòng nhập email hoặc số điện thoại.",
        );
        isValid = false;
      } else if (!isEmail && !isPhone) {
        showFieldError(
          identifier,
          identifierError,
          "Nhập email hợp lệ hoặc số điện thoại từ 9–15 chữ số.",
        );
        isValid = false;
      }

      if (!password.value.trim()) {
        showFieldError(password, passwordError, "Vui lòng nhập mật khẩu.");
        isValid = false;
      }

      if (!isValid) {
        status.textContent = "Vui lòng kiểm tra lại thông tin đăng nhập.";
        status.classList.add("status--error");
        loginForm.querySelector('[aria-invalid="true"]').focus();
        return;
      }

      const roleNames = {
        recipient: "Người nhận",
        driver: "Nhân viên giao hàng",
        dispatcher: "Điều phối viên",
        admin: "Quản trị viên",
      };
      const rolePages = {
        recipient: "theo-doi-kien-hang.html",
        driver: "driver-route-stops.html",
        dispatcher: "dispatcher-overview.html",
        admin: "admin-status-management.html",
      };
      const selectedRole = loginForm.querySelector(
        'input[name="role"]:checked',
      ).value;

      status.textContent = `Thông tin hợp lệ cho vai trò ${roleNames[selectedRole]}. Đây là bản demo; hệ thống chưa xác thực tài khoản.`;
      status.classList.remove("status--error");
      const entry = document.createElement("a");
      entry.href = rolePages[selectedRole];
      entry.textContent = " Mở không gian demo";
      entry.addEventListener("click", () => {
        localStorage.setItem(
          "parcelpulse.demoSession",
          JSON.stringify({
            role: selectedRole,
            name: "Minh Anh",
          }),
        );
      });
      status.append(entry);
    });
  }

  const registerForm = document.querySelector('[data-form="register"]');
  if (registerForm) {
    const fields = [
      {
        input: $("#name"),
        error: $("#name-err"),
        validate: (value) =>
          value.trim().length >= 2 ? "" : "Nhập họ tên gồm ít nhất 2 ký tự.",
      },
      {
        input: $("#email"),
        error: $("#email-err"),
        validate: (value) =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
            ? ""
            : "Nhập địa chỉ email hợp lệ.",
      },
      {
        input: $("#phone"),
        error: $("#phone-err"),
        validate: (value) => {
          const digits = value.replace(/\D/g, "");
          return digits.length >= 9 && digits.length <= 15
            ? ""
            : "Nhập số điện thoại từ 9 đến 15 chữ số.";
        },
      },
      {
        input: $("#password"),
        error: $("#password-err"),
        validate: (value) =>
          value.length >= 8 ? "" : "Mật khẩu cần ít nhất 8 ký tự.",
      },
      {
        input: $("#confirm"),
        error: $("#confirm-err"),
        validate: (value) =>
          value && value === $("#password").value
            ? ""
            : "Mật khẩu xác nhận chưa khớp.",
      },
    ];
    const terms = $("#terms");
    const termsError = $("#terms-err");
    const status = $("#status");
    const adminNote = $("#admin-note");

    registerForm.querySelectorAll(".eye").forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const input = toggle
          .closest(".control")
          .querySelector('input[type="password"], input[type="text"]');
        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        toggle.setAttribute(
          "aria-label",
          isPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu",
        );
        toggle.setAttribute("aria-pressed", String(isPassword));
      });
    });

    registerForm.querySelectorAll('input[name="role"]').forEach((input) => {
      input.addEventListener("change", () => {
        adminNote.hidden = input.value !== "admin" || !input.checked;
        status.textContent = "";
      });
    });
    fields.forEach(({ input, error }) => {
      input.addEventListener("input", () => {
        input.removeAttribute("aria-invalid");
        error.textContent = "";
        status.textContent = "";
      });
    });
    terms.addEventListener("change", () => {
      terms.removeAttribute("aria-invalid");
      termsError.textContent = "";
    });

    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      let firstInvalid = null;
      fields.forEach(({ input, error, validate }) => {
        const message = validate(input.value);
        error.textContent = message;
        if (message) {
          input.setAttribute("aria-invalid", "true");
          if (!firstInvalid) firstInvalid = input;
        } else input.removeAttribute("aria-invalid");
      });

      termsError.textContent = terms.checked
        ? ""
        : "Bạn cần đồng ý với điều khoản để tiếp tục.";
      if (!terms.checked) {
        terms.setAttribute("aria-invalid", "true");
        if (!firstInvalid) firstInvalid = terms;
      } else terms.removeAttribute("aria-invalid");

      if (firstInvalid) {
        status.textContent = "Vui lòng kiểm tra lại thông tin đăng ký.";
        status.classList.add("status--error");
        firstInvalid.focus();
        return;
      }

      const role = registerForm.querySelector(
        'input[name="role"]:checked',
      ).value;
      status.textContent =
        role === "admin"
          ? "Thông tin hợp lệ. Yêu cầu quản trị cần được duyệt; bản demo chưa tạo tài khoản thật."
          : "Thông tin hợp lệ. Bản demo chưa tạo tài khoản thật.";
      status.classList.remove("status--error");
    });
  }

  const forgotForm = document.querySelector('[data-form="forgot"]');

  if (forgotForm) {
    const tabs = document.querySelectorAll(".tab");
    const panes = document.querySelectorAll("[data-pane]");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.tab;

        const statusEl = $("#status");
        statusEl.textContent = "";
        tabs.forEach((t) => {
          t.setAttribute("aria-selected", "false");
          t.classList.remove("active");
        });
        tab.setAttribute("aria-selected", "true");
        tab.classList.add("active");

        panes.forEach((pane) => {
          if (pane.dataset.pane === target) {
            pane.hidden = false;
            pane.querySelector("input").disabled = false;
          } else {
            pane.hidden = true;
            pane.querySelector("input").disabled = true;
          }
        });
      });
    });

    const activeTab = () => $('.tab[aria-selected="true"]').dataset.tab;
    const fields = {
      email: $("#rec-email"),
      phone: $("#rec-phone"),
    };
    const statusEl = $("#status");
    Object.values(fields).forEach((input) => {
      input.addEventListener("input", () => {
        input.removeAttribute("aria-invalid");
        $(`#${input.id}-err`).textContent = "";
        statusEl.textContent = "";
      });
    });

    forgotForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const method = activeTab();
      const input = fields[method];
      const value = input.value.trim();
      const isValid =
        method === "email"
          ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          : /^\+?[0-9\s().-]+$/.test(value) &&
            value.replace(/\D/g, "").length >= 9 &&
            value.replace(/\D/g, "").length <= 15;
      const error = $(`#${input.id}-err`);
      if (!isValid) {
        error.textContent =
          method === "email"
            ? "Nhập email hợp lệ để tiếp tục."
            : "Nhập số điện thoại gồm 9 đến 15 chữ số.";
        input.setAttribute("aria-invalid", "true");
        statusEl.textContent = "Thông tin khôi phục chưa hợp lệ.";
        statusEl.classList.add("status--error");
        input.focus();
        return;
      }

      input.removeAttribute("aria-invalid");
      error.textContent = "";
      statusEl.textContent = `Thông tin hợp lệ. Bản demo chưa gửi email, SMS hoặc liên kết khôi phục thật.`;
      statusEl.classList.remove("status--error");
    });
  }
});
