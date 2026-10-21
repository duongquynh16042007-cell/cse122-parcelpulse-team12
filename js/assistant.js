(function () {
  const auth = window.ParcelPulseAuth;
  const LAST_PARCEL_KEY = 'parcelpulse-last-parcel';

  function readJson(storage, key) {
    try {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  const normalize = (text) => String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');

  const getLastParcel = () => readJson(sessionStorage, LAST_PARCEL_KEY);
  const getPreferences = () => readJson(localStorage, 'parcelpulse-delivery-preferences');
  const getFeedback = () => readJson(localStorage, 'parcelpulse-delivery-feedback');
  const getSession = () => (auth ? auth.getSession() : null);

  const panel = document.createElement('div');
  panel.className = 'ai-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Trợ lý AI ParcelPulse');
  panel.innerHTML = `
    <div class="ai-panel-head">
      <span class="ai-head-icon" aria-hidden="true">✦</span>
      <div>
        <strong>Trợ lý AI ParcelPulse</strong>
        <span>Đang trực tuyến · mô phỏng cục bộ</span>
      </div>
      <button class="ai-close" type="button" aria-label="Đóng trợ lý">✕</button>
    </div>
    <div class="ai-messages" aria-live="polite"></div>
    <div class="ai-footer">
      <div class="ai-quick">
        <button type="button" data-quick="eta">Giải thích ETA</button>
        <button type="button" data-quick="exception">Phân loại ngoại lệ</button>
        <button type="button" data-quick="next">Hành động tiếp theo</button>
      </div>
      <div class="ai-input-row">
        <input id="aiInput" type="text" placeholder="Hỏi trợ lý: khi nào đơn đến, vì sao trễ..." aria-label="Nhập câu hỏi cho trợ lý">
        <button class="ai-send" type="button" aria-label="Gửi câu hỏi">➤</button>
      </div>
    </div>`;
  document.body.appendChild(panel);

  const launcher = document.createElement('button');
  launcher.className = 'ai-launcher';
  launcher.type = 'button';
  launcher.innerHTML = '<span class="ai-launcher-icon" aria-hidden="true">✦</span> Trợ lý AI';
  document.body.appendChild(launcher);

  const messagesBox = panel.querySelector('.ai-messages');
  const input = panel.querySelector('#aiInput');
  const sendBtn = panel.querySelector('.ai-send');
  const closeBtn = panel.querySelector('.ai-close');

  function isOpen() {
    return panel.classList.contains('open');
  }

  function open() {
    panel.classList.add('open');
    window.setTimeout(() => input.focus(), 220);
    if (!messagesBox.childElementCount) {
      const session = getSession();
      addBot({
        text: `Xin chào${session && session.name ? ` ${session.name}` : ''}! Mình là trợ lý AI của ParcelPulse. Mình có thể giải thích ETA, phân loại ngoại lệ vận chuyển và gợi ý hành động tiếp theo dựa trên dữ liệu đơn hàng trong phiên này.`
      });
    }
  }

  function close() {
    panel.classList.remove('open');
  }

  function scrollDown() {
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  function addUser(text) {
    const bubble = document.createElement('div');
    bubble.className = 'ai-msg user';
    const p = document.createElement('p');
    p.textContent = text;
    bubble.appendChild(p);
    messagesBox.appendChild(bubble);
    scrollDown();
  }

  function addBot(payload) {
    const bubble = document.createElement('div');
    bubble.className = 'ai-msg bot';
    if (payload.confidence) {
      const conf = document.createElement('span');
      conf.className = 'ai-conf';
      conf.textContent = payload.confidence;
      bubble.appendChild(conf);
    }
    const p = document.createElement('p');
    p.textContent = payload.text;
    bubble.appendChild(p);
    if (payload.chips && payload.chips.length) {
      const chips = document.createElement('div');
      chips.className = 'ai-chips';
      payload.chips.forEach((chip) => {
        const item = document.createElement('span');
        item.textContent = chip;
        chips.appendChild(item);
      });
      bubble.appendChild(chips);
    }
    if (payload.actions && payload.actions.length) {
      const actions = document.createElement('div');
      actions.className = 'ai-msg-actions';
      payload.actions.forEach((action) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = action.label;
        button.addEventListener('click', () => runAction(action));
        actions.appendChild(button);
      });
      bubble.appendChild(actions);
    }
    messagesBox.appendChild(bubble);
    scrollDown();
    return bubble;
  }

  function addTyping() {
    const bubble = document.createElement('div');
    bubble.className = 'ai-msg bot';
    bubble.innerHTML = '<span class="ai-typing" aria-label="Trợ lý đang nhập"><i></i><i></i><i></i></span>';
    messagesBox.appendChild(bubble);
    scrollDown();
    return bubble;
  }

  function runAction(action) {
    if (action.href) {
      window.location.href = action.href;
      return;
    }
    if (action.track) {
      const codeInput = document.getElementById('trackingCode');
      const trackBtn = document.getElementById('trackBtn');
      if (codeInput && trackBtn) {
        codeInput.value = action.track;
        trackBtn.disabled = false;
        trackBtn.click();
        close();
      } else {
        sessionStorage.setItem('parcelpulse-autotrack', action.track);
        window.location.href = 'recipient-track-parcel.html';
      }
      return;
