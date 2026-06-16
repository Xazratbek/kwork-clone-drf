const API_BASE_URL = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL) || "http://127.0.0.1:8000";

let authState: AuthState | null = null;
let refreshPromise: Promise<string> | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

export interface AuthState {
  access: string;
  refresh: string;
  user?: Record<string, unknown>;
}

function loadAuth(): AuthState | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("kwork_mvp_auth") || "null");
  } catch {
    return null;
  }
}

function saveAuth(next: AuthState | null) {
  authState = next;
  if (typeof window === "undefined") return;
  if (next) localStorage.setItem("kwork_mvp_auth", JSON.stringify(next));
  else localStorage.removeItem("kwork_mvp_auth");
  scheduleRefresh();
  window.dispatchEvent(new CustomEvent("auth:changed", { detail: authState }));
}

function decodeJwt(token: string) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function accessExpiresInMs(): number {
  if (!authState?.access) return 0;
  const decoded = decodeJwt(authState.access);
  if (!decoded?.exp) return 0;
  return decoded.exp * 1000 - Date.now();
}

function scheduleRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer);
  if (!authState?.refresh || !authState?.access) return;
  const due = Math.max(accessExpiresInMs() - 60_000, 15_000);
  refreshTimer = setTimeout(() => {
    refreshAccess().catch(() => saveAuth(null));
  }, due);
}

async function refreshAccess(): Promise<string> {
  if (!authState?.refresh) throw new Error("Refresh token missing");
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: authState.refresh }),
    })
      .then(async (response) => {
        const data = await parseResponse(response);
        const next = { ...authState!, access: data.access, refresh: data.refresh || authState!.refresh };
        saveAuth(next);
        return next.access;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function parseResponse(response: Response) {
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : await response.text();
  if (!response.ok) {
    const message = formatApiError(data) || `HTTP ${response.status}`;
    throw new Error(message);
  }
  return data;
}

function formatApiError(data: unknown): string {
  if (typeof data === "string") return data;
  if (!data || typeof data !== "object") return "";
  const obj = data as Record<string, unknown>;
  if (obj.detail || obj.message) return (obj.detail || obj.message) as string;
  if (Array.isArray(obj.non_field_errors)) return obj.non_field_errors.join(" ");
  const firstField = Object.entries(obj).find(([, value]) => Array.isArray(value) || typeof value === "string");
  if (!firstField) return JSON.stringify(data);
  const [field, value] = firstField;
  const text = Array.isArray(value) ? value.join(" ") : value;
  return field === "non_field_errors" ? text : `${field}: ${text}`;
}

async function request(path: string, options: RequestInit = {}, retry = true) {
  if (typeof window !== "undefined" && !authState) authState = loadAuth();
  if (authState?.access && accessExpiresInMs() < 10_000) await refreshAccess();

  const headers = new Headers(options.headers as HeadersInit | undefined);
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

function queryString(params: Record<string, unknown>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  });
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export const auth = {
  get: () => authState ?? loadAuth(),
  set: saveAuth,
  logout: () => saveAuth(null),
  init: scheduleRefresh,
  onChange(callback: (state: AuthState | null) => void) {
    const handler = (event: Event) => callback((event as CustomEvent).detail);
    window.addEventListener("auth:changed", handler);
    return () => window.removeEventListener("auth:changed", handler);
  },
};

export const api = {
  baseUrl: API_BASE_URL,
  mediaUrl(path: string | null | undefined): string {
    if (!path) return "";
    if (/^https?:\/\//.test(path)) return path;
    return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  },
  login(payload: { login: string; password: string }) {
    return request("/api/auth/login/", { method: "POST", body: JSON.stringify(payload) }).then((data) => {
      saveAuth(data);
      return data;
    });
  },
  signup(payload: Record<string, string>) {
    return request("/api/auth/signup/", { method: "POST", body: JSON.stringify(payload) }).then((data) => {
      saveAuth(data);
      return data;
    });
  },
  verifyEmail(token: string) {
    return request("/api/auth/verify-email/", { method: "POST", body: JSON.stringify({ token }) });
  },
  resendVerification(email: string) {
    return request("/api/auth/resend-verification/", { method: "POST", body: JSON.stringify({ email }) });
  },
  me() {
    return request("/api/auth/me/");
  },
  becomeSeller(payload: { display_name: string; bio: string }) {
    return request("/api/auth/become-seller/", { method: "POST", body: JSON.stringify(payload) });
  },
  categories() {
    return request("/categories/category-list/");
  },
  kworks(params: Record<string, unknown> = {}) {
    return request(`/kworks/${queryString(params)}`);
  },
  kwork(id: string) {
    return request(`/kworks/kwork/${id}/`);
  },
  createKwork(payload: Record<string, unknown>) {
    return request("/kworks/kwork/create/", { method: "POST", body: JSON.stringify(payload) });
  },
  updateKwork(id: string, payload: Record<string, unknown>) {
    return request(`/kworks/kwork/update/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });
  },
  myKworks(params: Record<string, unknown> = {}) {
    return request(`/kworks/my/${queryString(params)}`);
  },
  pauseKwork(id: string) {
    return request(`/kworks/kwork/pause/${id}/`, { method: "POST" });
  },
  activateKwork(id: string) {
    return request(`/kworks/kwork/activate/${id}/`, { method: "POST" });
  },
  deleteKwork(id: string) {
    return request(`/kworks/kwork/${id}/delete/`, { method: "POST" });
  },
  orders() {
    return request("/orders/");
  },
  createOrder(kworkId: string, payload: Record<string, unknown>) {
    return request(`/orders/kworks/${kworkId}/order/`, { method: "POST", body: JSON.stringify(payload) });
  },
  updateOrder(orderId: string, payload: Record<string, unknown>) {
    return request(`/orders/${orderId}/`, { method: "PATCH", body: JSON.stringify(payload) });
  },
  confirmOrder(orderId: string, status: string) {
    return request(`/orders/${orderId}/confirm/`, { method: "POST", body: JSON.stringify({ status }) });
  },
  deliverOrder(orderId: string, payload: Record<string, unknown>) {
    return request(`/orders/${orderId}/deliver/`, { method: "POST", body: JSON.stringify(payload) });
  },

  // Messages
  orderMessages(orderId: string) {
    return request(`/orders/${orderId}/messages/`);
  },
  sendMessage(orderId: string, payload: { body: string; file?: File }) {
    return request(`/orders/${orderId}/messages/`, { method: "POST", body: JSON.stringify(payload) });
  },

  // Notifications
  notifications() {
    return request("/notifications/");
  },
  markNotificationRead(id: string) {
    return request(`/notifications/${id}/read/`, { method: "POST" });
  },
  markAllNotificationsRead() {
    return request("/notifications/read-all/", { method: "POST" });
  },

  // Reviews
  reviews() {
    return request("/reviews/");
  },
  sellerReviews(sellerId: string) {
    return request(`/reviews/?seller=${sellerId}`);
  },
  createReview(orderId: string, payload: { rating: number; comment: string }) {
    return request(`/orders/${orderId}/review/`, { method: "POST", body: JSON.stringify(payload) });
  },

  // Wallet
  wallet() {
    return request("/wallets/");
  },
  walletTransactions() {
    return request("/wallets/transactions/");
  },
  withdrawalRequests() {
    return request("/wallets/withdrawals/");
  },
  createWithdrawal(payload: { amount: string; method: string; phone_number?: string; bank_account?: string }) {
    return request("/wallets/withdrawals/create/", { method: "POST", body: JSON.stringify(payload) });
  },

  // Payments
  createPayment(orderId: string, payload: { provider: string }) {
    return request(`/orders/${orderId}/pay/`, { method: "POST", body: JSON.stringify(payload) });
  },

  // Favorites
  favorites() {
    return request("/kworks/favorites/");
  },
  addFavorite(kworkId: string) {
    return request(`/kworks/kwork/${kworkId}/favorite/`, { method: "POST" });
  },
  removeFavorite(kworkId: string) {
    return request(`/kworks/kwork/${kworkId}/favorite/`, { method: "DELETE" });
  },

  // Offers
  sentOffers() {
    return request("/offers/sent/");
  },
  receivedOffers() {
    return request("/offers/received/");
  },
  createOffer(payload: { buyer: string; title: string; description: string; price: string; delivery_days: number }) {
    return request("/offers/create/", { method: "POST", body: JSON.stringify(payload) });
  },
  offerAction(offerId: string, action: "accept" | "reject") {
    return request(`/offers/${offerId}/${action}/`, { method: "POST" });
  },

  // Projects (Exchange)
  projects() {
    return request("/exchange/projects/");
  },
  createProject(payload: { title: string; description: string; budget: string; deadline?: string }) {
    return request("/exchange/projects/create/", { method: "POST", body: JSON.stringify(payload) });
  },
  myBids() {
    return request("/exchange/bids/my/");
  },
  createBid(projectId: string, payload: { amount: string; delivery_days: number; message: string }) {
    return request(`/exchange/projects/${projectId}/bid/`, { method: "POST", body: JSON.stringify(payload) });
  },

  // Seller profile
  sellerProfile(id: string) {
    return request(`/api/auth/seller/${id}/`);
  },

  // Profile — MeView supports GET + PATCH at /api/auth/me/
  updateProfile(payload: Record<string, string>) {
    return request("/api/auth/me/", { method: "PATCH", body: JSON.stringify(payload) });
  },

  // Password reset — backend hali yo'q, keyinroq qo'shiladi
  forgotPassword(email: string) {
    return request("/api/auth/resend-verification/", { method: "POST", body: JSON.stringify({ email }) });
  },
};
