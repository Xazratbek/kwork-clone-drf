import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeDollarSign,
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Code2,
  Filter,
  Grid2X2,
  Headphones,
  Heart,
  Loader2,
  LogOut,
  Menu,
  PackageCheck,
  Palette,
  Search,
  Send,
  Sparkles,
  TrendingUp,
  Languages,
  UserRound,
  X,
} from "lucide-react";
import { api, auth } from "./api";

const navItems = ["Design", "Development & IT", "Writing", "SEO", "Marketing", "Audio & Video", "Business"];

const categoryShowcase = [
  { title: "SEO & Web Traffic", aliases: ["SEO", "Traffic"], Icon: TrendingUp, tone: "blue" },
  { title: "Digital Marketing & SMM", aliases: ["Marketing", "SMM", "Digital"], Icon: Sparkles, tone: "orange" },
  { title: "Development & IT", aliases: ["Development", "Programming", "IT"], Icon: Code2, tone: "green" },
  { title: "Design", aliases: ["Design"], Icon: Palette, tone: "pink" },
  { title: "Business & Lifestyle", aliases: ["Business", "Lifestyle"], Icon: BadgeDollarSign, tone: "amber" },
  { title: "Writing & Translations", aliases: ["Writing", "Translation"], Icon: Languages, tone: "teal" },
  { title: "Audio & Video", aliases: ["Audio", "Video"], Icon: Headphones, tone: "cyan" },
];

function categoryMatches(category, showcase) {
  const name = category?.name?.toLowerCase() || "";
  return showcase.aliases.some((alias) => name.includes(alias.toLowerCase()));
}

const fallbackThumbs = [
  "linear-gradient(135deg, #15392f 0%, #d7ff64 100%)",
  "linear-gradient(135deg, #341d14 0%, #ffb84d 100%)",
  "linear-gradient(135deg, #102039 0%, #64d7ff 100%)",
  "linear-gradient(135deg, #2d1938 0%, #ff6f91 100%)",
  "linear-gradient(135deg, #19271c 0%, #69f0ae 100%)",
];

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function flattenCategories(categories) {
  return categories.flatMap((category) => [category, ...(category.children || [])]);
}

function normalizeList(payload) {
  if (Array.isArray(payload)) return { count: payload.length, data: payload, next: null, previous: null };
  return {
    count: payload.kwork_count || payload.count || payload.data?.length || 0,
    data: payload.data || payload.results || [],
    next: payload.next || null,
    previous: payload.previous || null,
  };
}

function KworkImage({ kwork, index = 0 }) {
  if (kwork.image) {
    return <img src={api.mediaUrl(kwork.image)} alt={kwork.title} />;
  }
  return (
    <div className="generated-thumb" style={{ background: fallbackThumbs[index % fallbackThumbs.length] }}>
      <span>{kwork.title?.slice(0, 2) || "KW"}</span>
    </div>
  );
}

function Header({ user, onAuth, onRoute, route, search, setSearch, onSearch }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-main">
        <button className="brand" onClick={() => onRoute("home")} aria-label="Kwork MVP home">
          <span className="brand-mark">K</span>
          <span>Kwork<span>forge</span></span>
        </button>

        <form className="top-search" onSubmit={onSearch}>
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder='Try "telegram bot" or "logo"' />
          <button type="submit">Search</button>
        </form>

        <nav className="header-actions">
          {user ? (
            <>
              <button className={route === "orders" ? "active-link" : ""} onClick={() => onRoute("orders")}>Orders</button>
              <button className={route === "studio" ? "active-link" : ""} onClick={() => onRoute("studio")}>Studio</button>
              <button className="user-chip" onClick={() => onRoute("profile")}><UserRound size={16} /> {user.username}</button>
              <button className="icon-button" onClick={() => auth.logout()} aria-label="Log out"><LogOut size={18} /></button>
            </>
          ) : (
            <>
              <button onClick={() => onAuth("login")}>Sign in</button>
              <button className="solid-small" onClick={() => onAuth("signup")}>Join free</button>
            </>
          )}
        </nav>

        <button className="mobile-menu" onClick={() => setOpen(true)} aria-label="Open menu"><Menu /></button>
      </div>
      <div className="category-rail">
        {navItems.map((item) => (
          <button key={item} onClick={() => onRoute("catalog", { search: item })}>{item}</button>
        ))}
      </div>
      {open && (
        <div className="drawer">
          <button className="drawer-close" onClick={() => setOpen(false)}><X /></button>
          {navItems.map((item) => <button key={item} onClick={() => { onRoute("catalog", { search: item }); setOpen(false); }}>{item}</button>)}
          {user ? <button onClick={() => { onRoute("orders"); setOpen(false); }}>Orders</button> : <button onClick={() => { onAuth("login"); setOpen(false); }}>Sign in</button>}
        </div>
      )}
    </header>
  );
}

function Landing({ categories, featured, onRoute, onAuth }) {
  const showcaseCategories = categoryShowcase.map((item) => ({
    ...item,
    category: categories.find((category) => categoryMatches(category, item)),
  }));

  return (
    <main>
      <section className="hero-section reveal">
        <div className="hero-copy">
          <h1>Freelance xizmatlarni tez top, buyurtma ber, natijani kuzat.</h1>
          <p>Minglab freelance xizmatlari ichidan keraklisini tanlang, xavfsiz buyurtma bering va ish jarayonini bir joyda kuzating.</p>
          <div className="hero-actions">
            <button className="primary-cta" onClick={() => onRoute("catalog")}>Browse marketplace <ArrowRight size={18} /></button>
            <button className="ghost-cta" onClick={() => onAuth("signup")}>Start as buyer</button>
          </div>
        </div>
        <div className="hero-board" aria-label="Marketplace preview">
          <div className="board-search"><Search size={18} /> logo design, web app, bot</div>
          {featured.slice(0, 4).map((item, index) => (
            <article className="mini-card" key={item.id || index}>
              <KworkImage kwork={item} index={index} />
              <div>
                <strong>{item.title}</strong>
                <span>from ${item.price_minor || "10.00"} · {item.delivery_days || 1} days</span>
              </div>
            </article>
          ))}
          {!featured.length && [0, 1, 2, 3].map((item) => (
            <article className="mini-card" key={item}>
              <KworkImage kwork={{ title: "Service draft" }} index={item} />
              <div><strong>Professional service package</strong><span>from $10.00 · 2 days</span></div>
            </article>
          ))}
        </div>
      </section>

      <section className="section reveal">
        <div className="section-heading">
          <h2>Explore growing catalog</h2>
          <button onClick={() => onRoute("catalog")}>Open all <ArrowRight size={16} /></button>
        </div>
        <div className="category-grid category-showcase">
          {showcaseCategories.map(({ title, Icon, tone, category }) => (
            <button
              className={`category-card category-card-${tone}`}
              key={title}
              onClick={() => onRoute("catalog", category ? { category: category.id } : { search: title })}
            >
              <span className="category-icon"><Icon size={54} strokeWidth={2.4} /></span>
              <strong>{category?.name || title}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="how-section reveal">
        {[
          ["Find", "Search services, category, price, delivery days.", Search],
          ["Order", "Send requirements from kwork detail page.", BriefcaseBusiness],
          ["Deliver", "Seller accepts, rejects, or delivers from studio flow.", PackageCheck],
        ].map(([title, text, Icon]) => (
          <article key={title}>
            <Icon />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

function FilterPanel({ categories, filters, setFilters, apply, reset }) {
  return (
    <aside className="filter-panel">
      <div className="panel-title"><Filter size={18} /> Filters</div>
      <label>
        Category
        <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>
          <option value="">All categories</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </label>
      <label>
        Search
        <input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="title or description" />
      </label>
      <div className="split-fields">
        <label>Min price<input type="number" value={filters.price_min} onChange={(event) => setFilters({ ...filters, price_min: event.target.value })} /></label>
        <label>Max price<input type="number" value={filters.price_max} onChange={(event) => setFilters({ ...filters, price_max: event.target.value })} /></label>
      </div>
      <div className="split-fields">
        <label>Currency
          <select value={filters.currency} onChange={(event) => setFilters({ ...filters, currency: event.target.value })}>
            <option value="">Any</option>
            <option value="USD">USD</option>
            <option value="UZS">UZS</option>
          </select>
        </label>
        <label>Page<input type="number" min="1" value={filters.page} onChange={(event) => setFilters({ ...filters, page: event.target.value })} /></label>
      </div>
      <button className="primary-wide" onClick={apply}>Apply filters</button>
      <button className="text-button" onClick={reset}>Reset</button>
    </aside>
  );
}

function KworkCard({ kwork, index, onOpen }) {
  return (
    <article className="kwork-card" onClick={() => onOpen(kwork.id)}>
      <div className="thumb-wrap">
        <KworkImage kwork={kwork} index={index} />
        <button className="heart" onClick={(event) => event.stopPropagation()}><Heart size={18} /></button>
      </div>
      <div className="kwork-body">
        <h3>{kwork.title}</h3>
        <div className="seller-line">
          <span className="avatar-dot">{kwork.seller?.username?.[0] || "S"}</span>
          <span>{kwork.seller?.username || "verified seller"}</span>
          <span className="rating">Top rated</span>
        </div>
        <div className="price-row">
          <span><Clock3 size={15} /> {kwork.delivery_days || 1} days</span>
          <strong>${kwork.price_minor || "10.00"}</strong>
        </div>
      </div>
    </article>
  );
}

function Catalog({ categories, state, setState, onOpen }) {
  const [filters, setFilters] = useState(state.filters);

  useEffect(() => setFilters(state.filters), [state.filters]);

  const apply = () => setState((prev) => ({ ...prev, filters: { ...filters, page: filters.page || 1 } }));
  const reset = () => setState((prev) => ({ ...prev, filters: { search: "", category: "", price_min: "", price_max: "", currency: "", page: 1 } }));

  return (
    <main className="catalog-shell reveal">
      <FilterPanel categories={categories} filters={filters} setFilters={setFilters} apply={apply} reset={reset} />
      <section className="catalog-main">
        <div className="catalog-toolbar">
          <div>
            <h1>Marketplace services</h1>
            <p>{state.count} services available through current API.</p>
          </div>
          <div className="view-pill"><Grid2X2 size={16} /> Grid</div>
        </div>
        {state.loading ? <Loading /> : (
          <>
            <div className="kwork-grid">
              {state.items.map((item, index) => <KworkCard key={item.id} kwork={item} index={index} onOpen={onOpen} />)}
            </div>
            {!state.items.length && <Empty title="No services found" text="Change filters or seed backend data." />}
            <div className="pagination">
              <button disabled={!state.previous} onClick={() => setState((prev) => ({ ...prev, filters: { ...prev.filters, page: Math.max(1, Number(prev.filters.page || 1) - 1) } }))}><ChevronLeft size={16} /> Previous</button>
              <span>Page {state.filters.page || 1}</span>
              <button disabled={!state.next} onClick={() => setState((prev) => ({ ...prev, filters: { ...prev.filters, page: Number(prev.filters.page || 1) + 1 } }))}>Next <ChevronRight size={16} /></button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function Detail({ detail, loading, user, onAuth, onBack, onOrder }) {
  const [requirements, setRequirements] = useState("");
  if (loading) return <Loading />;
  if (!detail) return <Empty title="Kwork not found" text="Open another service from catalog." />;

  return (
    <main className="detail-layout reveal">
      <button className="text-button back-button" onClick={onBack}><ChevronLeft size={16} /> Back to catalog</button>
      <section className="detail-hero">
        <div className="detail-media"><KworkImage kwork={detail} /></div>
        <div className="detail-copy">
          <h1>{detail.title}</h1>
          <p>{detail.description}</p>
          <div className="detail-meta">
            <span>{detail.category?.name || "Category"}</span>
            <span>{detail.delivery_days} days delivery</span>
            <span>{detail.currency || "USD"}</span>
          </div>
        </div>
        <aside className="order-box">
          <span>Starting at</span>
          <strong>${detail.price_minor}</strong>
          <textarea value={requirements} onChange={(event) => setRequirements(event.target.value)} placeholder="Describe what you need..." />
          <button className="primary-wide" onClick={() => user ? onOrder(requirements) : onAuth("login")}>Order now <Send size={16} /></button>
        </aside>
      </section>
    </main>
  );
}

function Studio({ categories, myKworks, reloadMyKworks }) {
  const [form, setForm] = useState({ title: "", slug: "", description: "", price_minor: "10.00", currency: "USD", delivery_days: 2, category: "", status: "active" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const payload = { ...form, slug: form.slug || slugify(form.title) };
      await api.createKwork(payload);
      setMessage("Kwork created.");
      setForm({ ...form, title: "", slug: "", description: "" });
      reloadMyKworks();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function action(id, type) {
    if (type === "pause") await api.pauseKwork(id);
    if (type === "activate") await api.activateKwork(id);
    if (type === "delete") await api.deleteKwork(id);
    reloadMyKworks();
  }

  return (
    <main className="studio-layout reveal">
      <section className="studio-form">
        <h1>Seller studio</h1>
        <p>Create and manage kworks using existing seller endpoints.</p>
        <form onSubmit={submit}>
          <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Service title" />
          <textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" />
          <select required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
            <option value="">Choose category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <div className="split-fields">
            <input value={form.price_minor} onChange={(event) => setForm({ ...form, price_minor: event.target.value })} placeholder="Price" />
            <input type="number" value={form.delivery_days} onChange={(event) => setForm({ ...form, delivery_days: event.target.value })} placeholder="Days" />
          </div>
          <button className="primary-wide" disabled={busy}>{busy ? <Loader2 className="spin" /> : <Sparkles size={16} />} Publish kwork</button>
          {message && <p className="form-message">{message}</p>}
        </form>
      </section>
      <section className="studio-list">
        <h2>My kworks</h2>
        {(myKworks.data || []).map((item, index) => (
          <article className="studio-row" key={item.id}>
            <KworkImage kwork={item} index={index} />
            <div><strong>{item.title}</strong><span>${item.price_minor} · {item.delivery_days} days</span></div>
            <button onClick={() => action(item.id, "pause")}>Pause</button>
            <button onClick={() => action(item.id, "activate")}>Activate</button>
            <button onClick={() => action(item.id, "delete")}>Delete</button>
          </article>
        ))}
        {!myKworks.data?.length && <Empty title="No seller kworks yet" text="Create first service from form." />}
      </section>
    </main>
  );
}

function Orders({ orders, reloadOrders }) {
  const [delivery, setDelivery] = useState({});
  async function setStatus(order, status) {
    await api.confirmOrder(order.id, status);
    reloadOrders();
  }
  async function deliver(order) {
    const orderId = order.id;
    await api.deliverOrder(orderId, { order_id: orderId, message: delivery[orderId] || "Delivery ready." });
    reloadOrders();
  }
  return (
    <main className="orders-page reveal">
      <h1>Orders</h1>
      <div className="orders-grid">
        {orders.map((order, index) => (
          <article className="order-card" key={`${order.title_snapshot}-${index}`}>
            <div className="order-top"><strong>{order.title_snapshot}</strong><span>{order.status}</span></div>
            <p>{order.requirements || "No requirements"}</p>
            <small>{order.buyer_username} → {order.seller_username}</small>
            <div className="order-actions">
              <button onClick={() => setStatus(order, "in_progress")}>Accept</button>
              <button onClick={() => setStatus(order, "rejected")}>Reject</button>
            </div>
            <textarea value={delivery[order.id] || ""} onChange={(event) => setDelivery({ ...delivery, [order.id]: event.target.value })} placeholder="Delivery message" />
            <button className="primary-wide" onClick={() => deliver(order)}>Deliver</button>
          </article>
        ))}
      </div>
      {!orders.length && <Empty title="No orders yet" text="Create order from kwork detail page." />}
    </main>
  );
}

function AuthModal({ mode, setMode, onClose }) {
  const [form, setForm] = useState({ email: "", login: "", password: "", username: "", first_name: "", last_name: "", city: "" });
  const [error, setError] = useState("");
  const isSignup = mode === "signup";

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      if (isSignup) await api.signup({ email: form.email, password: form.password, username: form.username, first_name: form.first_name, last_name: form.last_name, city: form.city });
      else await api.login({ login: form.login || form.email, password: form.password });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="modal-backdrop">
      <form className="auth-modal" onSubmit={submit}>
        <button type="button" className="drawer-close" onClick={onClose}><X /></button>
        <h2>{isSignup ? "Create account" : "Sign in"}</h2>
        <p>{isSignup ? "Ro'yxatdan o'ting va emailingizga kelgan tasdiqlash linki orqali hisobingizni faollashtiring." : "Hisobingizga kirish uchun email yoki loginingizni kiriting."}</p>
        {isSignup && <input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} placeholder="Username" />}
        <input required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email or login" />
        {isSignup && (
          <div className="split-fields">
            <input value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} placeholder="First name" />
            <input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="City" />
          </div>
        )}
        <input required type="password" minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Password" />
        {error && <p className="error">{error}</p>}
        <button className="primary-wide">{isSignup ? "Join marketplace" : "Sign in"}</button>
        <button type="button" className="text-button" onClick={() => setMode(isSignup ? "login" : "signup")}>
          {isSignup ? "Already have account?" : "Create new account"}
        </button>
      </form>
    </div>
  );
}

function Profile({ user, reloadUser }) {
  const [form, setForm] = useState({ display_name: user?.username || "", bio: "" });
  const [message, setMessage] = useState("");
  async function becomeSeller(event) {
    event.preventDefault();
    try {
      await api.becomeSeller(form);
      await reloadUser();
      setMessage("Seller profile enabled.");
    } catch (error) {
      setMessage(error.message);
    }
  }
  return (
    <main className="profile-page reveal">
      <h1>Account</h1>
      <div className="profile-card">
        <p><strong>{user?.username}</strong> · {user?.email}</p>
        <p>{user?.is_seller ? "Seller mode active" : "Buyer account"}</p>
      </div>
      <form className="seller-form" onSubmit={becomeSeller}>
        <h2>Become seller</h2>
        <input value={form.display_name} onChange={(event) => setForm({ ...form, display_name: event.target.value })} placeholder="Display name" />
        <textarea value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} placeholder="Short bio" />
        <button className="primary-wide"><Check size={16} /> Enable seller profile</button>
        {message && <p className="form-message">{message}</p>}
      </form>
    </main>
  );
}

function Loading() {
  return <div className="loading"><Loader2 className="spin" /> Loading API data...</div>;
}

function VerifyEmailPage({ reloadUser, onRoute }) {
  const [state, setState] = useState({ loading: true, error: "", message: "" });
  const token = new URLSearchParams(window.location.search).get("token");

  useEffect(() => {
    let active = true;

    async function verify() {
      if (!token) {
        setState({ loading: false, error: "Tasdiqlash tokeni topilmadi.", message: "" });
        return;
      }

      try {
        const response = await api.verifyEmail(token);
        if (!active) return;
        await reloadUser();
        setState({ loading: false, error: "", message: response.detail || "Email muvaffaqiyatli tasdiqlandi." });
      } catch (error) {
        if (!active) return;
        setState({ loading: false, error: error.message, message: "" });
      }
    }

    verify();
    return () => { active = false; };
  }, [token]);

  return (
    <main className="verify-page reveal">
      <div className="verify-card">
        {state.loading ? (
          <>
            <Loader2 className="spin" />
            <h1>Email tasdiqlanmoqda...</h1>
            <p>Iltimos, bir necha soniya kuting.</p>
          </>
        ) : state.error ? (
          <>
            <X />
            <h1>Email tasdiqlanmadi</h1>
            <p className="error">{state.error}</p>
            <button className="primary-wide" onClick={() => onRoute("home")}>Bosh sahifaga qaytish</button>
          </>
        ) : (
          <>
            <Check />
            <h1>Email tasdiqlandi</h1>
            <p>{state.message}</p>
            <button className="primary-wide" onClick={() => onRoute("catalog")}>Katalogni ko'rish</button>
          </>
        )}
      </div>
    </main>
  );
}

function Empty({ title, text }) {
  return <div className="empty"><Sparkles /><h3>{title}</h3><p>{text}</p></div>;
}

function initialRoute() {
  const pathRoute = window.location.pathname.replace(/^\/+|\/+$/g, "");
  if (pathRoute === "verify-email") return "verify-email";
  return window.location.hash.replace("#", "") || "home";
}

export default function App() {
  const [route, setRoute] = useState(initialRoute);
  const [user, setUser] = useState(auth.get()?.user || null);
  const [authMode, setAuthMode] = useState(null);
  const [categories, setCategories] = useState([]);
  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);
  const [search, setSearch] = useState("");
  const [catalog, setCatalog] = useState({ loading: true, items: [], count: 0, next: null, previous: null, filters: { search: "", category: "", price_min: "", price_max: "", currency: "", page: 1 } });
  const [detail, setDetail] = useState({ loading: false, data: null });
  const [myKworks, setMyKworks] = useState({ data: [] });
  const [orders, setOrders] = useState([]);

  const loadUser = async () => {
    if (!auth.get()?.access) return setUser(null);
    try {
      const me = await api.me();
      setUser(me);
    } catch {
      auth.logout();
      setUser(null);
    }
  };

  const loadKworks = async () => {
    setCatalog((prev) => ({ ...prev, loading: true }));
    try {
      const payload = await api.kworks(catalog.filters);
      const normalized = normalizeList(payload);
      setCatalog((prev) => ({ ...prev, loading: false, ...normalized, items: normalized.data }));
    } catch (error) {
      setCatalog((prev) => ({ ...prev, loading: false, error: error.message, items: [] }));
    }
  };

  const loadMyKworks = async () => {
    if (!auth.get()?.access) return;
    try {
      setMyKworks(normalizeList(await api.myKworks()));
    } catch {
      setMyKworks({ data: [] });
    }
  };

  const loadOrders = async () => {
    if (!auth.get()?.access) return;
    try {
      const payload = await api.orders();
      setOrders(Array.isArray(payload) ? payload : []);
    } catch {
      setOrders([]);
    }
  };

  useEffect(() => {
    api.categories().then(setCategories).catch(() => setCategories([]));
    loadUser();
    const off = auth.onChange((next) => {
      setUser(next?.user || null);
      loadUser();
      loadMyKworks();
      loadOrders();
    });
    return off;
  }, []);

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.replace("#", "") || "home");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => { loadKworks(); }, [catalog.filters]);
  useEffect(() => { if (route === "studio") loadMyKworks(); if (route === "orders") loadOrders(); }, [route]);

  function go(nextRoute, params = {}) {
    if (params.search !== undefined) setSearch(params.search);
    if (nextRoute === "catalog") {
      setCatalog((prev) => ({ ...prev, filters: { ...prev.filters, ...params, page: 1 } }));
    }
    if (nextRoute === "verify-email") {
      window.history.pushState(null, "", "/verify-email");
    } else {
      if (window.location.pathname !== "/") window.history.pushState(null, "", "/");
      window.location.hash = nextRoute;
    }
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function openDetail(id) {
    setDetail({ loading: true, data: null });
    setRoute("detail");
    try {
      setDetail({ loading: false, data: await api.kwork(id) });
    } catch {
      setDetail({ loading: false, data: null });
    }
  }

  async function createOrder(requirements) {
    await api.createOrder(detail.data.id, { kwork: detail.data.id, requirements });
    await loadOrders();
    setRoute("orders");
  }

  function submitSearch(event) {
    event.preventDefault();
    setCatalog((prev) => ({ ...prev, filters: { ...prev.filters, search, page: 1 } }));
    setRoute("catalog");
  }

  return (
    <>
      <Header user={user} route={route} onAuth={setAuthMode} onRoute={go} search={search} setSearch={setSearch} onSearch={submitSearch} />
      {route === "home" && <Landing categories={categories} featured={catalog.items} onRoute={go} onAuth={setAuthMode} />}
      {route === "catalog" && <Catalog categories={flatCategories} state={catalog} setState={setCatalog} onOpen={openDetail} />}
      {route === "detail" && <Detail detail={detail.data} loading={detail.loading} user={user} onAuth={setAuthMode} onBack={() => go("catalog")} onOrder={createOrder} />}
      {route === "studio" && <Studio categories={flatCategories} myKworks={myKworks} reloadMyKworks={loadMyKworks} />}
      {route === "orders" && <Orders orders={orders} reloadOrders={loadOrders} />}
      {route === "profile" && <Profile user={user} reloadUser={loadUser} />}
      {route === "verify-email" && <VerifyEmailPage reloadUser={loadUser} onRoute={go} />}
      <footer className="footer">
        <span>Kworkforge MVP</span>
        <span>Auth · Catalog · Seller Studio · Orders</span>
      </footer>
      {authMode && <AuthModal mode={authMode} setMode={setAuthMode} onClose={() => setAuthMode(null)} />}
    </>
  );
}
