"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Pause, Play, Trash2, Plus } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { KworkImage, formatMoney, type Kwork } from "@/components/kwork-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { api } from "@/lib/api";

interface Category {
  id: string;
  name: string;
  children?: Category[];
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function StudioPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [myKworks, setMyKworks] = useState<Kwork[]>([]);
  const [loadingKworks, setLoadingKworks] = useState(true);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    price_minor: "10.00",
    currency: "USD",
    delivery_days: 2,
    category: "",
    status: "active",
  });

  const flatCategories = categories.flatMap((c) => [c, ...(c.children || [])]);

  const loadMyKworks = async () => {
    if (!api.get?.access) return;
    try {
      const payload = await api.myKworks();
      const data = Array.isArray(payload) ? payload : (payload as Record<string, unknown>).results || (payload as Record<string, unknown>).data || [];
      setMyKworks(data as Kwork[]);
    } catch {
      setMyKworks([]);
    } finally {
      setLoadingKworks(false);
    }
  };

  useEffect(() => {
    api.categories().then(setCategories).catch(() => {});
    loadMyKworks();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form, slug: form.slug || slugify(form.title) };
      await api.createKwork(payload);
      toast("Xizmat muvaffaqiyatli yaratildi!", "success");
      setForm({ ...form, title: "", slug: "", description: "" });
      loadMyKworks();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Xatolik", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleAction(id: string, type: "pause" | "activate" | "delete") {
    try {
      if (type === "pause") await api.pauseKwork(id);
      if (type === "activate") await api.activateKwork(id);
      if (type === "delete") await api.deleteKwork(id);
      toast("Amal bajarildi", "success");
      loadMyKworks();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Xatolik", "error");
    }
  }

  if (authLoading) {
    return (
      <>
        <Header />
        <main className="flex-1 grid place-items-center">
          <Loader2 size={28} className="animate-spin text-brand" />
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="flex-1 grid place-items-center py-20">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Sotuvchi studiyasiga kirish uchun tizimga kiring.</p>
            <Link href="/auth?mode=login">
              <Button className="bg-brand text-[#07110f] hover:bg-brand/90 font-bold">Tizimga kirish</Button>
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          <h1 className="mb-6 text-3xl font-black text-white sm:text-4xl">Sotuvchi studiyasi</h1>
          <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <h2 className="mb-4 text-lg font-bold text-white">Yangi xizmat yaratish</h2>
              <form onSubmit={handleSubmit} className="grid gap-3">
                <Input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Xizmat sarlavhasi"
                  className="border-white/10 bg-white/[0.06] text-white placeholder:text-muted-foreground focus:border-brand/50"
                />
                <Textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Batafsil tavsif"
                  className="min-h-[120px] border-white/10 bg-white/[0.06] text-white placeholder:text-muted-foreground focus:border-brand/50"
                />
                <select
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white outline-none focus:border-brand/50"
                >
                  <option value="">Kategoriyani tanlang</option>
                  {flatCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={form.price_minor}
                    onChange={(e) => setForm({ ...form, price_minor: e.target.value })}
                    placeholder="Narx"
                    className="border-white/10 bg-white/[0.06] text-white placeholder:text-muted-foreground focus:border-brand/50"
                  />
                  <Input
                    type="number"
                    value={form.delivery_days}
                    onChange={(e) => setForm({ ...form, delivery_days: Number(e.target.value) })}
                    placeholder="Kunlar"
                    className="border-white/10 bg-white/[0.06] text-white placeholder:text-muted-foreground focus:border-brand/50"
                  />
                </div>
                <Button type="submit" disabled={busy} className="w-full bg-brand text-[#07110f] hover:bg-brand/90 font-bold gap-2">
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={15} />}
                  Xizmatni joylashtirish
                </Button>
              </form>
            </motion.div>

            <div>
              <h2 className="mb-4 text-lg font-bold text-white">Mening xizmatlarim</h2>
              {loadingKworks ? (
                <div className="grid place-items-center py-10">
                  <Loader2 size={24} className="animate-spin text-brand" />
                </div>
              ) : myKworks.length === 0 ? (
                <div className="grid place-items-center rounded-xl border border-white/10 bg-white/[0.02] py-12 text-center">
                  <p className="text-muted-foreground">Hali xizmat yo&apos;q. Formadan foydalanib yarating.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {myKworks.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
                    >
                      <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-900">
                        <KworkImage kwork={item} index={i} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatMoney(item)} &middot; {item.delivery_days} kun
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.status === "active" ? (
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-amber-400" onClick={() => handleAction(item.id, "pause")}>
                            <Pause size={14} />
                          </Button>
                        ) : (
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-green-400" onClick={() => handleAction(item.id, "activate")}>
                            <Play size={14} />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-400" onClick={() => handleAction(item.id, "delete")}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
