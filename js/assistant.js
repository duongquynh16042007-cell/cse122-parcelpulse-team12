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
    }
    if (action.intent) {
      ask(INTENT_QUESTIONS[action.intent] || action.label);
    }
  }

  const INTENT_QUESTIONS = {
    eta: 'Vì sao đơn hàng đến trễ và ETA được ước tính như thế nào?',
    exception: 'Đơn hàng đang gặp ngoại lệ gì và được phân loại ra sao?',
    next: 'Tôi nên làm gì tiếp theo với đơn hàng hiện tại?'
  };

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function describeProgress(parcel) {
    const timeline = Array.isArray(parcel.timeline) ? parcel.timeline : [];
    const done = timeline.filter((event) => event.state === 'done').length;
    return timeline.length ? `${done}/${timeline.length} mốc đã hoàn tất` : 'chưa có mốc tiến trình';
  }

  function classifyException(exceptionText) {
    const text = normalize(exceptionText);
    if (!text) {
      return { label: 'Không có ngoại lệ', detail: 'Hệ thống chưa ghi nhận ngoại lệ nào cho đơn này.' };
    }
    if (text.includes('thoi tiet') || text.includes('mua') || text.includes('bao')) {
      return { label: 'Thời tiết xấu', detail: 'Ngoại lệ thuộc nhóm thời tiết; ETA thường dịch 30–90 phút và tự cập nhật khi tuyến ổn định lại.' };
    }
    if (text.includes('tac nghen') || text.includes('giao thong')) {
      return { label: 'Tắc nghẽn giao thông', detail: 'Ngoại lệ thuộc nhóm vận hành tuyến; tài xế sẽ đổi lộ trình và ETA được tính lại theo quãng đường còn lại.' };
    }
    if (text.includes('dia chi') || text.includes('so nha')) {
      return { label: 'Địa chỉ chưa đầy đủ', detail: 'Cần xác nhận lại địa chỉ trước khi giao; bạn nên bổ sung số nhà trong Tùy chọn đơn hàng.' };
    }
    if (text.includes('lien he')) {
      return { label: 'Không liên hệ được người nhận', detail: 'Tài xế đang chờ tổng đài xác nhận; hãy giữ điện thoại hoạt động và kiểm tra mục tùy chọn giao hàng.' };
    }
    return { label: 'Ngoại lệ khác', detail: 'Ngoại lệ chưa thuộc nhóm phân loại sẵn; hồ sơ được chuyển cho điều phối viên xử lý thủ công.' };
  }

  function buildAnswer(question) {
    const q = normalize(question);
    const parcel = getLastParcel();
    const prefs = getPreferences();
    const feedback = getFeedback();
    const session = getSession();
    const name = session && session.name ? session.name : '';

    if (/^(chao|xin chao|hi|hello)/.test(q)) {
      return {
        text: `Chào${name ? ` ${name}` : ''}! Bạn có thể hỏi mình về ETA, ngoại lệ vận chuyển hoặc hành động tiếp theo cho đơn hàng vừa tra cứu trong phiên này.`
      };
    }

    if (!parcel && (q.includes('eta') || q.includes('tre') || q.includes('ngoai le') || q.includes('tiep theo'))) {
      return {
        text: 'Mình chưa thấy đơn nào được tra cứu trong phiên này. Bạn hãy tra cứu mã vận đơn (ví dụ PP1001 – PP1005) ở trang Theo dõi đơn hàng rồi quay lại hỏi mình nhé.',
        actions: [{ label: 'Mở trang tra cứu', href: 'recipient-track-parcel.html' }]
      };
    }

    if (q.includes('ngoai le') || q.includes('phan loai') || q.includes('su co')) {
      const info = classifyException(parcel.exception || '');
      return {
        confidence: info.label,
        text: parcel.exception
          ? `Đơn ${parcel.id} đang có ngoại lệ: ${parcel.exception} Phân loại: ${info.label}. ${info.detail}`
          : `Đơn ${parcel.id} không có ngoại lệ đang mở. ${info.detail}`,
        actions: [{ label: `Xem đơn ${parcel.id}`, track: parcel.id }]
      };
    }

    if (q.includes('tiep theo') || q.includes('nen lam') || q.includes('lam gi')) {
      const isDelayed = /trễ|delay/i.test(parcel.status || '');
      return {
        text: isDelayed
          ? `Đơn ${parcel.id} đang trễ (${parcel.status}). Gợi ý: xem lại ngoại lệ, cân nhắc đổi khung giờ hoặc điểm nhận trong Tùy chọn đơn hàng để tránh tuyến đang tắc.`
          : `Đơn ${parcel.id} đang ổn định (${parcel.status}, ${describeProgress(parcel)}). Gợi ý: giữ nguyên lịch nhận; hệ thống sẽ nhắc bạn trước giờ giao.`,
        actions: [
          { label: `Xem đơn ${parcel.id}`, track: parcel.id },
          { label: 'Tùy chọn đơn hàng', href: 'recipient-delivery-preferences.html' }
        ]
      };
    }

    if (q.includes('eta') || q.includes('tre') || q.includes('muon') || q.includes('khi nao') || q.includes('bao lau')) {
      return {
        confidence: 'Phân tích mô phỏng',
        text: `ETA của ${parcel.id} là ${parcel.eta} (trạng thái: ${parcel.status}, ${describeProgress(parcel)}). ${parcel.exception ? 'Đơn đang có ngoại lệ mở nên ETA có thể dịch thêm 30–90 phút.' : 'Không có ngoại lệ đang mở nên ETA nhiều khả năng giữ nguyên.'}`,
        actions: [{ label: `Xem đơn ${parcel.id}`, track: parcel.id }]
      };
    }

    if (q.includes('tuy chon') || q.includes('khung gio') || q.includes('thoi gian nhan')) {
      return {
        text: prefs
          ? 'Bạn đã lưu tùy chọn giao hàng trên trình duyệt này. Có thể xem hoặc chỉnh lại khung giờ và điểm nhận trong trang Tùy chọn đơn hàng.'
          : 'Bạn chưa lưu tùy chọn giao hàng nào trên trình duyệt này. Vào trang Tùy chọn đơn hàng để chọn khung giờ và điểm nhận nhé.',
        actions: [{ label: 'Tùy chọn đơn hàng', href: 'recipient-delivery-preferences.html' }]
      };
    }

    if (q.includes('danh gia') || q.includes('phan hoi') || q.includes('feedback')) {
      return {
        text: feedback
          ? 'Cảm ơn bạn đã gửi phản hồi giao hàng! Phản hồi được lưu trên trình duyệt này và dùng để cải thiện chất lượng giao vận.'
          : 'Sau khi nhận hàng, bạn có thể gửi đánh giá sao và nhận xét để hệ thống cải thiện chất lượng giao vận.',
        actions: [{ label: 'Gửi phản hồi', href: 'recipient-delivery-feedback.html' }]
      };
    }

    return {
      text: 'Mình là trợ lý mô phỏng cục bộ của ParcelPulse. Mình có thể giải thích ETA, phân loại ngoại lệ vận chuyển và gợi ý hành động tiếp theo dựa trên đơn hàng bạn vừa tra cứu trong phiên này.',
      chips: ['Giải thích ETA', 'Phân loại ngoại lệ', 'Hành động tiếp theo'],
      actions: [
        { label: 'Giải thích ETA', intent: 'eta' },
        { label: 'Phân loại ngoại lệ', intent: 'exception' },
        { label: 'Hành động tiếp theo', intent: 'next' }
      ]
    };
  }

  async function ask(text) {
    const question = String(text || '').trim();
    if (!question) {
      return;
    }
    addUser(question);
    const typing = addTyping();
    await wait(650);
    typing.remove();
    addBot(buildAnswer(question));
  }

  function sendFromInput() {
    const text = input.value;
    input.value = '';
    ask(text);
  }

  launcher.addEventListener('click', () => {
    if (isOpen()) {
      close();
    } else {
      open();
    }
  });
  closeBtn.addEventListener('click', close);
  sendBtn.addEventListener('click', sendFromInput);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      sendFromInput();
    }
  });
  panel.querySelectorAll('[data-quick]').forEach((button) => {
    button.addEventListener('click', () => {
      ask(INTENT_QUESTIONS[button.dataset.quick] || button.textContent);
    });
  });
})();
