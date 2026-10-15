const SESSION_KEY = 'parcelpulse-session';
const USERS_KEY = 'parcelpulse-users';
const SETTINGS_KEY = 'parcelpulse-settings';
const WELCOME_KEY = 'parcelpulse-welcome';
const DEFAULT_PAGE = 'recipient-track-parcel.html';
const GUEST_PAGE = 'guest-profile.html';
const APP_PAGES = new Set([
  'recipient-track-parcel.html',
  'recipient-delivery-preferences.html',
  'recipient-delivery-feedback.html',
  'recipient-settings.html'
]);
const AUTH_PAGES = new Set(['login.html', 'register.html', 'forgot-password.html']);
const DEMO_USER = {
  name: 'Minh Anh',
  email: 'demo@parcelpulse.vn',
  phone: '0904821024',
  password: 'Parcel123'
};

function readJson(storage, key) {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function getSession() {
  let session = readJson(sessionStorage, SESSION_KEY);
  if (!session) {
    session = readJson(localStorage, SESSION_KEY);
    if (session && session.remember) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  }
  return session && session.email ? session : null;
}

function setSession(profile, remember = false) {
  const session = Object.assign({}, profile, {
    remember: Boolean(remember),
    loggedInAt: new Date().toISOString()
  });
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  if (remember) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
  return session;
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
}

function listUsers() {
  const users = readJson(localStorage, USERS_KEY);
  return Array.isArray(users) ? users : [];
}

function normalizePhone(value) {
  return String(value || '').replace(/[^\d+]/g, '').replace(/^\+84/, '0');
}

function findUser(identifier, password) {
  const contact = String(identifier || '').trim().toLowerCase();
  const phone = normalizePhone(contact);
  return [DEMO_USER].concat(listUsers()).find((user) => {
    const emailMatch = Boolean(user.email) && user.email.toLowerCase() === contact;
    const phoneMatch = phone.length >= 9 && normalizePhone(user.phone) === phone;
    return (emailMatch || phoneMatch) && user.password === password;
  }) || null;
}

function getDestination() {
  const requestedPage = new URLSearchParams(window.location.search).get('next');
  return APP_PAGES.has(requestedPage) ? requestedPage : DEFAULT_PAGE;
}

function applyTheme(theme) {
  const resolved = theme === 'dark'
    ? 'dark'
    : theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', resolved);
}

function initTheme() {
  const settings = readJson(localStorage, SETTINGS_KEY) || {};
  applyTheme(settings.theme || 'light');
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const current = (readJson(localStorage, SETTINGS_KEY) || {}).theme || 'light';
    if (current === 'system') {
      applyTheme('system');
    }
  });
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'app-toast';
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.classList.add('visible'), 10);
  window.setTimeout(() => {
    toast.classList.remove('visible');
    window.setTimeout(() => toast.remove(), 300);
  }, 3400);
}

const currentPage = window.location.pathname.split('/').pop();
const currentSession = getSession();

if (AUTH_PAGES.has(currentPage)) {
  if (currentSession) {
    window.location.replace(getDestination());
  }
} else if (APP_PAGES.has(currentPage)) {
  if (!currentSession) {
    window.location.replace(`login.html?next=${encodeURIComponent(currentPage)}`);
  } else {
    initTheme();
    const nameEl = document.getElementById('sideUserName');
    if (nameEl) {
      nameEl.textContent = currentSession.name || 'Khách ParcelPulse';
    }
    const welcome = sessionStorage.getItem(WELCOME_KEY);
    if (welcome) {
      sessionStorage.removeItem(WELCOME_KEY);
      window.setTimeout(() => showToast(welcome), 350);
    }
  }
}

const logoutButton = document.getElementById('logoutBtn');
if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    clearSession();
    window.location.replace(GUEST_PAGE);
  });
}

window.ParcelPulseAuth = {
  SESSION_KEY,
  USERS_KEY,
  SETTINGS_KEY,
  DEMO_USER,
  DEFAULT_PAGE,
  GUEST_PAGE,
  getSession,
  setSession,
  clearSession,
  listUsers,
  findUser,
  normalizePhone,
  getDestination,
  applyTheme,
  showToast
};
