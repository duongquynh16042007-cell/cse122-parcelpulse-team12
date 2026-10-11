const loginForm = document.getElementById('loginForm');
const DEMO_EMAIL = 'demo@parcelpulse.vn';
const DEMO_PASSWORD = 'Parcel123';

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const message = document.getElementById('loginMessage');

    message.textContent = '';
    message.className = 'form-message';

    if (!email || !password) {
      message.textContent = 'Vui lòng nhập email và mật khẩu.';
      return;
    }

    if (!document.getElementById('email').checkValidity()) {
      message.textContent = 'Vui lòng nhập email hợp lệ.';
      return;
    }

    if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      message.textContent = 'Email hoặc mật khẩu chưa chính xác. Hãy thử tài khoản dùng thử bên dưới.';
      return;
    }

    sessionStorage.setItem('parcelpulse-authenticated', 'true');
    message.textContent = 'Đăng nhập thành công trong bản demo. Trang theo dõi đơn hàng sẽ được bổ sung sau.';
    message.classList.add('success');
  });
}

document.querySelectorAll('[data-password-toggle]').forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const input = document.getElementById(toggle.dataset.passwordToggle);
    const shouldShow = input.type === 'password';
    input.type = shouldShow ? 'text' : 'password';
    toggle.setAttribute('aria-pressed', String(shouldShow));
    toggle.setAttribute('aria-label', shouldShow ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
  });
});
