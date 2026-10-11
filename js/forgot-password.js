const recoveryForm = document.getElementById('recoveryForm');
const recoveryContact = document.getElementById('recoveryContact');
const recoveryMessage = document.getElementById('recoveryMessage');

function isValidRecoveryContact(value) {
  const contact = value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const phone = contact.replace(/[\s().-]/g, '');
  const vietnamesePhonePattern = /^(?:0\d{9}|\+84\d{9}|84\d{9})$/;

  return emailPattern.test(contact) || vietnamesePhonePattern.test(phone);
}

if (recoveryForm) {
  recoveryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    recoveryMessage.textContent = '';
    recoveryMessage.className = 'form-message';

    const contact = recoveryContact.value.trim();
    if (!contact) {
      recoveryMessage.textContent = 'Vui lòng nhập email hoặc số điện thoại đã đăng ký.';
      recoveryContact.focus();
      return;
    }

    if (!isValidRecoveryContact(contact)) {
      recoveryMessage.textContent = 'Hãy nhập email hợp lệ hoặc số điện thoại gồm 10 số.';
      recoveryContact.focus();
      return;
    }

    recoveryMessage.textContent = 'Nếu thông tin khớp với tài khoản, hướng dẫn khôi phục sẽ được gửi đến bạn. Đây là bản demo nên chưa gửi email hoặc SMS thật.';
    recoveryMessage.classList.add('success');
  });
}
