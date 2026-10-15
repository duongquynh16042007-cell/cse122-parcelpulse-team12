const items = {
  trackingCode: document.getElementById('trackingCode'),
  trackBtn: document.getElementById('trackBtn'),
  formMessage: document.getElementById('formMessage'),
  empty: document.getElementById('empty'),
  emptyTitle: document.getElementById('emptyTitle'),
  emptyCopy: document.getElementById('emptyCopy'),
  loading: document.getElementById('loading'),
  errorState: document.getElementById('errorState'),
  errorMessage: document.getElementById('errorMessage'),
  retryBtn: document.getElementById('retryBtn'),
  result: document.getElementById('result'),
  parcelId: document.getElementById('parcelId'),
  statusTag: document.getElementById('statusTag'),
  progressBar: document.getElementById('progressBar'),
  recipientName: document.getElementById('recipientName'),
  address: document.getElementById('address'),
  eta: document.getElementById('eta'),
  exceptionBox: document.getElementById('exceptionBox'),
  timeline: document.getElementById('timeline'),
  aiBtn: document.getElementById('aiBtn'),
  aiState: document.getElementById('aiState'),
  aiResult: document.getElementById('aiResult'),
  aiConfidence: document.getElementById('aiConfidence'),
  aiExplanation: document.getElementById('aiExplanation'),
  aiReason: document.getElementById('aiReason'),
  aiFailure: document.getElementById('aiFailure'),
  acceptAiBtn: document.getElementById('acceptAiBtn'),
  retryAiBtn: document.getElementById('retryAiBtn'),
  aiFactors: document.getElementById('aiFactors'),
  aiSuggestion: document.getElementById('aiSuggestion'),
  aiSavedMessage: document.getElementById('aiSavedMessage'),
  etaActionBtn: document.getElementById('etaActionBtn'),
  etaActionNote: document.getElementById('etaActionNote')
};

let currentParcel = null;
let currentParcelIsOwn = false;
let latestSearchCode = '';
let latestAnalysis = null;

const auth = window.ParcelPulseAuth;
const session = auth ? auth.getSession() : null;
const sessionName = session && session.name ? String(session.name).trim() : '';
const DEMO_OWNER = 'Minh Anh';

const FALLBACK_PARCELS = [
  {
    id: 'PP1001',
    recipient: 'Minh Anh',
    address: 'Số 14, Đường Trần Hưng Đạo, Quận 1, TP.HCM',
    status: 'Đang trên đường',
    eta: 'Hôm nay, 18:30',
    exception: '',
    timeline: [
      { title: 'Đơn hàng đã được tạo', date: '08:00, 25/09/2026', state: 'done' },
      { title: 'Đóng gói hoàn tất', date: '09:15, 25/09/2026', state: 'done' },
      { title: 'Đang vận chuyển từ kho trung tâm', date: '11:20, 25/09/2026', state: 'done' },
      { title: 'Xe giao hàng đang đến khu vực bạn', date: '17:45, 25/09/2026', state: 'pending' },
      { title: 'Giao hàng thành công', date: 'Dự kiến 18:30', state: 'pending' }
    ]
  },
  {
    id: 'PP1002',
    recipient: 'Minh Anh',
    address: '88/2, Lê Lợi, Phường 4, Quận 3, TP.HCM',
    status: 'Giao trễ 1 giờ',
    eta: 'Ngày mai, 09:00',
    exception: 'Đường giao hàng đang tắc nghẽn do điều kiện thời tiết, đội giao hàng sẽ điều chỉnh lộ trình và cập nhật lại ETA.',
    timeline: [
      { title: 'Đơn hàng đã được tạo', date: '07:30, 26/09/2026', state: 'done' },
      { title: 'Đóng gói xong', date: '08:20, 26/09/2026', state: 'done' },
      { title: 'Rời kho trung tâm', date: '09:10, 26/09/2026', state: 'done' },
      { title: 'Bị chậm do giao thông', date: '12:30, 26/09/2026', state: 'warning' },
      { title: 'Dự kiến giao lại', date: 'Ngày mai, 09:00', state: 'pending' }
    ]
  },
  {
    id: 'PP1003',
    recipient: 'Minh Anh',
    address: '36/18 Bùi Xương Trạch, Phường Khương Đình, Quận Thanh Xuân, TP. Hà Nội',
    status: 'Đã giao thành công',
    eta: 'Đã giao lúc 11:20, 25/09/2026',
    exception: '',
    timeline: [
      { title: 'Đơn hàng đã được tạo', date: '07:50, 24/09/2026', state: 'done' },
      { title: 'Đóng gói hoàn tất', date: '09:05, 24/09/2026', state: 'done' },
      { title: 'Rời kho trung tâm', date: '10:40, 24/09/2026', state: 'done' },
      { title: 'Giao hàng thành công', date: '11:20, 25/09/2026', state: 'done' }
    ]
  },
  {
    id: 'PP1004',
    recipient: 'Minh Anh',
    address: '129 Nguyễn Thị Thập, Phường Tân Phú, Quận 7, TP.HCM',
    status: 'Chờ lấy hàng tại bưu cục',
    eta: 'Hôm nay, trước 20:00',
    exception: '',
    timeline: [
      { title: 'Đơn hàng đã được tạo', date: '08:10, 25/09/2026', state: 'done' },
      { title: 'Đóng gói hoàn tất', date: '09:30, 25/09/2026', state: 'done' },
      { title: 'Vận chuyển đến bưu cục Quận 7', date: '13:15, 25/09/2026', state: 'done' },
      { title: 'Hàng sẵn sàng tại bưu cục', date: '14:05, 25/09/2026', state: 'done' },
      { title: 'Bạn đến lấy hoặc yêu cầu giao lại', date: 'Trước 20:00 hôm nay', state: 'pending' }
    ]
  },
  {
    id: 'PP1005',
    recipient: 'Đỗ Hải Đăng',
    address: '5/47 Thành Thái, Phường 14, Quận 10, TP.HCM',
    status: 'Giao trễ 3 giờ',
    eta: 'Hôm nay, 14:00',
    exception: 'Không liên hệ được người nhận và địa chỉ thiếu số nhà; tài xế đang chờ tổng đài xác nhận lại địa chỉ trước khi giao tiếp.',
    timeline: [
      { title: 'Đơn hàng đã được tạo', date: '07:20, 26/09/2026', state: 'done' },
      { title: 'Đóng gói xong', date: '08:05, 26/09/2026', state: 'done' },
      { title: 'Rời kho trung tâm', date: '09:00, 26/09/2026', state: 'done' },
      { title: 'Không liên hệ được người nhận', date: '11:45, 26/09/2026', state: 'warning' },
      { title: 'Chờ xác nhận địa chỉ mới', date: 'Dự kiến 14:00', state: 'pending' }
    ]
  }
];

function setMessage(message, type = '') {
  items.formMessage.textContent = message;
  items.formMessage.className = `app-message${type ? ` ${type}` : ''}`;
}

function showLoading() {
  items.result.classList.add('hidden');
  items.empty.classList.add('hidden');
  items.errorState.classList.add('hidden');
  items.loading.classList.remove('hidden');
  items.trackingCode.disabled = true;
  items.trackBtn.disabled = true;
}

function hideLoading() {
  items.loading.classList.add('hidden');
  items.trackingCode.disabled = false;
  items.trackBtn.disabled = !items.trackingCode.value.trim();
}

async function loadParcels() {
  try {
    const response = await fetch('../data/parcels.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Không tải được dữ liệu vận đơn (HTTP ${response.status}).`);
    }

    const parcels = await response.json();
    if (!Array.isArray(parcels)) {
      throw new Error('Dữ liệu vận đơn không đúng định dạng.');
    }

    return parcels;
  } catch (error) {
    return FALLBACK_PARCELS;
  }
}

function isValidParcel(parcel) {
  return parcel
    && typeof parcel.id === 'string'
    && typeof parcel.recipient === 'string'
    && typeof parcel.address === 'string'
    && typeof parcel.status === 'string'
    && typeof parcel.eta === 'string'
    && Array.isArray(parcel.timeline)
    && parcel.timeline.every((event) =>
      typeof event.title === 'string'
      && typeof event.date === 'string'
      && ['done', 'pending', 'warning'].includes(event.state)
    );
}

function normalizeName(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

function isOwnParcel(parcel, allParcels) {
  if (!sessionName || !parcel) {
    return false;
  }
  if (normalizeName(parcel.recipient) === normalizeName(sessionName)) {
    return true;
  }
  // Tài khoản chưa có đơn riêng trong dữ liệu mẫu: bộ đơn demo đứng tên
  // Minh Anh được coi là của người đăng nhập (giống trang Tùy chọn đơn hàng).
  const hasOwnOrders = Array.isArray(allParcels)
    && allParcels.some((item) => normalizeName(item.recipient) === normalizeName(sessionName));
  return !hasOwnOrders && normalizeName(parcel.recipient) === normalizeName(DEMO_OWNER);
}

function renderTimeline(timeline) {
  items.timeline.innerHTML = '';

  timeline.forEach((event) => {
    const entry = document.createElement('li');
    entry.className = `timeline-item ${event.state}`;

    const dot = document.createElement('span');
    dot.className = 'timeline-dot';
    dot.setAttribute('aria-hidden', 'true');

    const content = document.createElement('div');
    content.className = 'timeline-content';

    const title = document.createElement('strong');
    title.textContent = event.title;

    const date = document.createElement('time');
    date.textContent = event.date;

    content.append(title, date);
    entry.append(dot, content);
    items.timeline.append(entry);
  });
}

function resetAiPanel() {
  latestAnalysis = null;
  items.aiBtn.disabled = false;
  items.aiBtn.textContent = 'Phân tích đơn hàng';
  items.aiState.textContent = 'Sẵn sàng phân tích dữ liệu đơn hàng.';
  items.aiState.className = 'ai-status';
  items.aiResult.classList.add('hidden');
  items.aiConfidence.textContent = '';
  items.aiExplanation.textContent = '';
  items.aiReason.textContent = '';
  items.aiFailure.textContent = '';
  items.aiFailure.classList.add('hidden');
  if (items.aiFactors) {
    items.aiFactors.innerHTML = '';
    items.aiFactors.classList.add('hidden');
  }
  if (items.aiSuggestion) {
    items.aiSuggestion.textContent = '';
    items.aiSuggestion.classList.add('hidden');
  }
  items.aiSavedMessage.textContent = '';
  items.aiSavedMessage.className = 'app-message success';
}

function showParcel(parcel, isOwnOrder = true) {
  currentParcel = parcel;
  currentParcelIsOwn = isOwnOrder;
  items.empty.classList.add('hidden');
  items.errorState.classList.add('hidden');
  items.result.classList.remove('hidden');
  setMessage('');

  items.parcelId.textContent = parcel.id;
  items.recipientName.textContent = parcel.recipient;
  items.address.textContent = parcel.address;
  items.eta.textContent = parcel.eta;
  items.statusTag.textContent = parcel.status;
  items.statusTag.className = 'app-tag';

  const isDelayed = /trễ|delay/i.test(parcel.status);
  if (isDelayed) {
    items.statusTag.classList.add('warning');
    items.progressBar.classList.add('delayed');
  } else {
    items.progressBar.classList.remove('delayed');
  }

  if (parcel.exception) {
    items.exceptionBox.textContent = parcel.exception;
    items.exceptionBox.classList.remove('hidden');
  } else {
    items.exceptionBox.textContent = '';
    items.exceptionBox.classList.add('hidden');
  }

  if (items.etaActionBtn && items.etaActionNote) {
    items.etaActionBtn.classList.toggle('hidden', !isOwnOrder);
    if (isOwnOrder) {
      items.etaActionNote.textContent = '';
      items.etaActionNote.classList.add('hidden');
    } else {
      items.etaActionNote.textContent = `Đơn hàng đứng tên ${parcel.recipient}, không thuộc tài khoản ${sessionName || 'của bạn'}, nên bạn chỉ xem được trạng thái mà không thể mở tùy chọn cho đơn này.`;
      items.etaActionNote.classList.remove('hidden');
    }
  }

  renderTimeline(parcel.timeline);
  try {
    sessionStorage.setItem('parcelpulse-last-parcel', JSON.stringify(parcel));
  } catch (error) {
    /* trình duyệt chặn lưu phiên thì bỏ qua */
  }
  items.aiBtn.disabled = false;
  resetAiPanel();
}

function showNotFound(code) {
  currentParcel = null;
  items.result.classList.add('hidden');
  items.errorState.classList.add('hidden');
  items.loading.classList.add('hidden');
  items.empty.classList.remove('hidden');
  items.emptyTitle.textContent = 'Không tìm thấy đơn hàng';
  items.emptyCopy.textContent = `Không có vận đơn “${code}”. Kiểm tra lại mã hoặc thử PP1001 – PP1005.`;
  setMessage('Không tìm thấy mã vận đơn.', 'error');
}

function restoreEmptyState() {
  items.emptyTitle.textContent = 'Nhập mã để bắt đầu tra cứu';
  items.emptyCopy.innerHTML = 'Thử <strong>PP1001</strong> đến <strong>PP1005</strong> để xem dữ liệu minh họa.';
}

function showLoadError(error) {
  currentParcel = null;
  items.result.classList.add('hidden');
  items.empty.classList.add('hidden');
  items.errorMessage.textContent = error.message === 'Failed to fetch'
    ? 'Không thể kết nối đến dữ liệu vận đơn. Kiểm tra máy chủ hoặc thử lại.'
    : error.message;
  items.errorState.classList.remove('hidden');
  setMessage('Không thể tra cứu lúc này. Vui lòng thử lại.', 'error');
}

async function handleTrack() {
  const code = items.trackingCode.value.trim().toUpperCase();
  if (!code) {
    setMessage('Vui lòng nhập mã đơn hàng.', 'error');
    items.trackingCode.focus();
    return;
  }

  latestSearchCode = code;
  restoreEmptyState();
  setMessage('');
  showLoading();

  try {
    const parcels = await loadParcels();
    const parcel = parcels.find((item) => item.id.toUpperCase() === code);
    hideLoading();

    if (!parcel) {
      showNotFound(code);
      return;
    }

    if (!isValidParcel(parcel)) {
      throw new Error('Dữ liệu vận đơn bị thiếu hoặc không hợp lệ.');
    }

    showParcel(parcel, isOwnParcel(parcel, parcels));
  } catch (error) {
    hideLoading();
    showLoadError(error instanceof Error ? error : new Error('Đã xảy ra lỗi khi tải dữ liệu.'));
  }
}

function wait(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function analyzeEta() {
  if (!currentParcel) {
    items.aiState.textContent = 'Vui lòng tra cứu đơn hàng trước khi phân tích.';
    return;
  }

  items.aiBtn.disabled = true;
  items.aiBtn.textContent = 'Đang phân tích...';
  items.aiState.textContent = 'Đang đối chiếu ETA với dữ liệu đơn hàng.';
  items.aiState.className = 'ai-status loading';
  items.aiResult.classList.add('hidden');
  items.aiSavedMessage.textContent = '';

  await wait(650);

  const parcel = currentParcel;
  const timeline = Array.isArray(parcel.timeline) ? parcel.timeline : [];
  const doneCount = timeline.filter((event) => event.state === 'done').length;
  const warningCount = timeline.filter((event) => event.state === 'warning').length;
  const progress = timeline.length ? Math.round((doneCount / timeline.length) * 100) : 0;
  const exception = typeof parcel.exception === 'string' ? parcel.exception.trim() : '';
  const hasException = exception !== '';
  const isDelayed = /trễ|delay/i.test(parcel.status);
  const confidence = Math.min(94, Math.max(45, Math.round(52 + progress * 0.28 + (hasException ? -9 : 13) - warningCount * 4)));

  const factors = [
    `Hoàn tất ${progress}% chặng (${doneCount}/${timeline.length})`,
    `Trạng thái: ${parcel.status}`,
    hasException ? 'Ngoại lệ đang mở' : 'Không có ngoại lệ',
    warningCount ? `${warningCount} cảnh báo timeline` : 'Timeline ổn định'
  ];

  latestAnalysis = {
    parcelId: parcel.id,
    confidence: `Độ tin cậy ${confidence}% · bản mô phỏng`,
    explanation: `ETA hiện tại của ${parcel.id} là ${parcel.eta}. Mô hình mô phỏng đối chiếu ${progress}% chặng đã hoàn tất với trạng thái "${parcel.status}"${hasException ? ' và phát hiện ngoại lệ đang mở có thể khiến ETA dịch thêm 30–90 phút.' : '; không có ngoại lệ nào đang mở nên ETA nhiều khả năng giữ nguyên.'}`,
    reason: hasException
      ? `Yếu tố được ghi nhận: ${exception}`
      : 'Lịch sử hiện chưa ghi nhận nguyên nhân chậm hoặc tín hiệu giao thông liên quan.',
    suggestion: hasException || isDelayed
      ? 'Gợi ý hành động: cân nhắc đổi khung giờ hoặc điểm nhận trong Tuỳ chọn đơn hàng để tránh vùng đang tắc.'
      : 'Gợi ý hành động: giữ nguyên lịch nhận; hệ thống sẽ nhắc bạn trước giờ giao 30 phút.',
    limitation: hasException
      ? ''
      : 'Không đủ dữ liệu để đề xuất ETA mới. Hãy giữ thời gian dự kiến hiện tại hoặc chọn khung giao hàng thủ công.'
  };

  items.aiConfidence.textContent = latestAnalysis.confidence;
  items.aiExplanation.textContent = latestAnalysis.explanation;
  items.aiReason.textContent = latestAnalysis.reason;
  if (items.aiSuggestion) {
    items.aiSuggestion.textContent = latestAnalysis.suggestion;
    items.aiSuggestion.classList.remove('hidden');
  }
  if (items.aiFactors) {
    items.aiFactors.innerHTML = '';
    factors.forEach((factor) => {
      const chip = document.createElement('span');
      chip.textContent = factor;
      items.aiFactors.appendChild(chip);
    });
    items.aiFactors.classList.remove('hidden');
  }
  items.aiFailure.textContent = latestAnalysis.limitation;
  items.aiFailure.classList.toggle('hidden', !latestAnalysis.limitation);
  items.acceptAiBtn.disabled = Boolean(latestAnalysis.limitation);
  items.aiResult.classList.remove('hidden');
  items.aiState.textContent = `Đã hoàn tất phân tích mô phỏng · độ tin cậy ${confidence}%.`;
  items.aiState.className = 'ai-status';
  items.aiBtn.disabled = false;
  items.aiBtn.textContent = 'Phân tích lại';
}

function saveAnalysis() {
  if (!latestAnalysis || latestAnalysis.limitation) {
    return;
  }

  try {
    localStorage.setItem(`parcelpulse-ai-eta-${latestAnalysis.parcelId}`, JSON.stringify({
      ...latestAnalysis,
      acceptedAt: new Date().toISOString()
    }));
    items.aiSavedMessage.textContent = 'Đã lưu giải thích vào trình duyệt này.';
    items.aiSavedMessage.className = 'app-message success';
  } catch (error) {
    items.aiSavedMessage.textContent = 'Không thể lưu giải thích trên trình duyệt này. Bạn có thể tiếp tục chọn khung giao thủ công.';
    items.aiSavedMessage.className = 'app-message error';
  }
}

items.trackBtn.addEventListener('click', handleTrack);
if (items.etaActionBtn) items.etaActionBtn.addEventListener('click', (event) => {
  if (!currentParcel || !currentParcelIsOwn) {
    event.preventDefault();
    return;
  }
  try {
    sessionStorage.setItem('parcelpulse-pref-target', currentParcel.id);
  } catch (error) {
    /* trình duyệt chặn lưu phiên thì bỏ qua mã chuyển trang */
  }
});
items.trackingCode.addEventListener('input', () => {
  items.trackBtn.disabled = !items.trackingCode.value.trim();
});
items.trackingCode.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    handleTrack();
  }
});
items.retryBtn.addEventListener('click', () => {
  items.trackingCode.value = latestSearchCode;
  handleTrack();
});
items.aiBtn.addEventListener('click', analyzeEta);
items.retryAiBtn.addEventListener('click', analyzeEta);
items.acceptAiBtn.addEventListener('click', saveAnalysis);

restoreEmptyState();
items.trackBtn.disabled = !items.trackingCode.value.trim();

const autoTrackCode = sessionStorage.getItem('parcelpulse-autotrack');
if (autoTrackCode) {
  sessionStorage.removeItem('parcelpulse-autotrack');
  items.trackingCode.value = autoTrackCode;
  items.trackBtn.disabled = false;
  handleTrack();
}
