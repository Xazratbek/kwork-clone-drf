"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Save, User } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const { user, loading, reloadUser } = useAuth();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    city: "",
    phone: "",
  });

  const [initialized, setInitialized] = useState(false);

  // Form ni user ma'lumotlari bilan to'ldirish
  if (user && !initialized) {
    setForm({
      username: (user.username as string) || "",
      email: (user.email as string) || "",
      first_name: (user.first_name as string) || "",
      last_name: (user.last_name as string) || "",
      city: (user.city as string) || "",
      phone: (user.phone as string) || "",
    });
    setInitialized(true);
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.updateProfile(form);
      await reloadUser();
      toast("Profil yangilandi!", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Xatolik", "error");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 grid place-items-center"><Loader2 size={28} className="animate-spin text-brand" /></main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="flex-1 grid place-items-center py-20">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Sozlamalarni ko'rish uchun tizimga kiring.</p>
            <Link href="/auth?mode=login"><Button className="bg-brand text-[#07110f] hover:bg-brand/90 font-bold">Tizimga kirish</Button></Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-8 lg:px-6">
          <h1 className="mb-6 text-3xl font-black text-white sm:text-4xl">Sozlamalar</h1>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-brand/20 text-lg font-bold text-brand">
                {(user.username as string)?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-bold text-white">{user.username as string}</p>
                <p className="text-xs text-muted-foreground">{user.email as string}</p>
              </div>
            </div>

            <form onSubmit={saveProfile} className="grid gap-3">
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Username</label>
                <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="border-white/10 bg-white/[0.06] text-white focus:border-brand/50" />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Email</label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="border-white/10 bg-white/[0.06] text-white focus:border-brand/50" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Ism</label>
                  <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    className="border-white/10 bg-white/[0.06] text-white focus:border-brand/50" />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Familiya</label>
                  <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    className="border-white/10 bg-white/[0.06] text-white focus:border-brand/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Shahar</label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="border-white/10 bg-white/[0.06] text-white focus:border-brand/50" />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Telefon</label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="border-white/10 bg-white/[0.06] text-white focus:border-brand/50" />
                </div>
              </div>
              <Button type="submit" disabled={busy} className="mt-2 bg-brand text-[#07110f] hover:bg-brand/90 font-bold gap-2">
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={15} />} Saqlash
              </Button>
            </form>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
