const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const STORAGE_KEY = "kwork_mvp_auth";

let authState = loadAuth();
let refreshPromise = null;
let refreshTimer = null;

function loadAuth() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function saveAuth(next) {
  authState = next;
  if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  else localStorage.removeItem(STORAGE_KEY);
  scheduleRefresh();
  window.dispatchEvent(new CustomEvent("auth:changed", { detail: authState }));
}

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function accessExpiresInMs() {
  if (!authState?.access) return 0;
  const decoded = decodeJwt(authState.access);
  if (!decoded?.exp) return 0;
  return decoded.exp * 1000 - Date.now();
}

function scheduleRefresh() {
  if (refreshTimer) window.clearTimeout(refreshTimer);
  if (!authState?.refresh || !authState?.access) return;
  const due = Math.max(accessExpiresInMs() - 60_000, 15_000);
  refreshTimer = window.setTimeout(() => {
    refreshAccess().catch(() => saveAuth(null));
  }, due);
}

async function refreshAccess() {
  if (!authState?.refresh) throw new Error("Refresh token missing");
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: authState.refresh }),
    })
      .then(async (response) => {
        const data = await parseResponse(response);
        const next = { ...authState, access: data.access, refresh: data.refresh || authState.refresh };
        saveAuth(next);
        return next.access;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function parseResponse(response) {
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : await response.text();
  if (!response.ok) {
    const message = formatApiError(data) || `HTTP ${response.status}`;
    throw new Error(message);
  }
  return data;
}

function formatApiError(data) {
  if (typeof data === "string") return data;
  if (!data || typeof data !== "object") return "";
  if (data.detail || data.message) return data.detail || data.message;
  if (Array.isArray(data.non_field_errors)) return data.non_field_errors.join(" ");
  const firstField = Object.entries(data).find(([, value]) => Array.isArray(value) || typeof value === "string");
  if (!firstField) return JSON.stringify(data);
  const [field, value] = firstField;
  const text = Array.isArray(value) ? value.join(" ") : value;
  return field === "non_field_errors" ? text : `${field}: ${text}`;
}

async function request(path, options = {}, retry = true) {
  if (authState?.access && accessExpiresInMs() < 10_000) await refreshAccess();

  const headers = new Headers(options.headers || {});
  const isForm = options.body instanceof FormData;
  if (!isForm && options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (authState?.access) headers.set("Authorization", `Bearer ${authState.access}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (response.status === 401 && retry && authState?.refresh) {
    await refreshAccess();
    return request(path, options, false);
  }
  return parseResponse(response);
}

function queryString(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export const auth = {
  get: () => authState,
  set: saveAuth,
  logout: () => saveAuth(null),
  init: scheduleRefresh,
  onChange(callback) {
    const handler = (event) => callback(event.detail);
    window.addEventListener("auth:changed", handler);
    return () => window.removeEventListener("auth:changed", handler);
  },
};

export const api = {
  baseUrl: API_BASE_URL,
  mediaUrl(path) {
    if (!path) return "";
    if (/^https?:\/\//.test(path)) return path;
    return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  },
  login(payload) {
    return request("/api/auth/login/", { method: "POST", body: JSON.stringify(payload) }).then((data) => {
      saveAuth(data);
      return data;
    });
  },
  signup(payload) {
    return request("/api/auth/signup/", { method: "POST", body: JSON.stringify(payload) }).then((data) => {
      saveAuth(data);
      return data;
    });
  },
  verifyEmail(token) {
    return request("/api/auth/verify-email/", { method: "POST", body: JSON.stringify({ token }) });
  },
  resendVerification(email) {
    return request("/api/auth/resend-verification/", { method: "POST", body: JSON.stringify({ email }) });
  },
  me() {
    return request("/api/auth/me/");
  },
  becomeSeller(payload) {
    return request("/api/auth/become-seller/", { method: "POST", body: JSON.stringify(payload) });
  },
  categories() {
    return request("/categories/category-list/");
  },
  kworks(params = {}) {
    return request(`/kworks/${queryString(params)}`);
  },
  kwork(id) {
    return request(`/kworks/kwork/${id}/`);
  },
  createKwork(payload) {
    return request("/kworks/kwork/create/", { method: "POST", body: JSON.stringify(payload) });
  },
  updateKwork(id, payload) {
    return request(`/kworks/kwork/update/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });
  },
  myKworks(params = {}) {
    return request(`/kworks/my/${queryString(params)}`);
  },
  pauseKwork(id) {
    return request(`/kworks/kwork/pause/${id}/`, { method: "POST" });
  },
  activateKwork(id) {
    return request(`/kworks/kwork/activate/${id}/`, { method: "POST" });
  },
  deleteKwork(id) {
    return request(`/kworks/kwork/${id}/delete/`, { method: "POST" });
  },
  orders() {
    return request("/orders/");
  },
  createOrder(kworkId, payload) {
    return request(`/orders/kworks/${kworkId}/order/`, { method: "POST", body: JSON.stringify(payload) });
  },
  updateOrder(orderId, payload) {
    return request(`/orders/${orderId}/`, { method: "PATCH", body: JSON.stringify(payload) });
  },
  confirmOrder(orderId, status) {
    return request(`/orders/${orderId}/confirm/`, { method: "POST", body: JSON.stringify({ status }) });
  },
  deliverOrder(orderId, payload) {
    return request(`/orders/${orderId}/deliver/`, { method: "POST", body: JSON.stringify(payload) });
  },
};

auth.init();
