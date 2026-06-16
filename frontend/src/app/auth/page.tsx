"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff, User, Mail, Lock, MapPin } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login, signup } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<"login" | "signup">(
    (searchParams.get("mode") as "login" | "signup") || "login"
  );
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    login: "",
    password: "",
    username: "",
    first_name: "",
    last_name: "",
    city: "",
  });

  const isSignup = mode === "signup";

  function toggleMode() {
    const next = isSignup ? "login" : "signup";
    setMode(next);
    router.replace(`/auth?mode=${next}`, { scroll: false });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (isSignup) {
        await signup({
          email: form.email,
          password: form.password,
          username: form.username,
          first_name: form.first_name,
          last_name: form.last_name,
          city: form.city,
        });
        toast("Emailingizga tasdiqlash linki yuborildi.", "success");
      } else {
        await login({ login: form.login || form.email, password: form.password });
        toast("Tizimga muvaffaqiyatli kirdingiz.", "success");
      }
      router.push("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Xatolik yuz berdi";
      toast(msg, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-md px-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-brand/10">
            {isSignup ? <User size={24} className="text-brand" /> : <Mail size={24} className="text-brand" />}
          </div>
          <h1 className="text-2xl font-black text-white">
            {isSignup ? "Hisob yaratish" : "Tizimga kirish"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSignup
              ? "Ro'yxatdan o'ting va emailingizga kelgan tasdiqlash linki orqali hisobingizni faollashtiring."
              : "Hisobingizga kirish uchun email yoki loginingizni kiriting."}
          </p>
        </div>

        <motion.form
          key={mode}
          initial={{ opacity: 0, x: isSignup ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          onSubmit={handleSubmit}
          className="grid gap-3"
        >
          {isSignup && (
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Username"
                className="border-white/10 bg-white/[0.06] text-white placeholder:text-muted-foreground focus:border-brand/50 pl-9"
              />
            </div>
          )}
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              className="border-white/10 bg-white/[0.06] text-white placeholder:text-muted-foreground focus:border-brand/50 pl-9"
            />
          </div>
          {isSignup && (
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  placeholder="Ism"
                  className="border-white/10 bg-white/[0.06] text-white placeholder:text-muted-foreground focus:border-brand/50 pl-9"
                />
              </div>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Shahar"
                  className="border-white/10 bg-white/[0.06] text-white placeholder:text-muted-foreground focus:border-brand/50 pl-9"
                />
              </div>
            </div>
          )}
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              required
              type={showPassword ? "text" : "password"}
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Parol"
              className="border-white/10 bg-white/[0.06] text-white placeholder:text-muted-foreground focus:border-brand/50 pl-9 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <Button type="submit" disabled={busy} className="w-full bg-brand text-[#07110f] hover:bg-brand/90 font-bold gap-2 mt-1">
            {busy && <Loader2 size={16} className="animate-spin" />}
            {isSignup ? "Ro'yxatdan o'tish" : "Kirish"}
          </Button>
        </motion.form>

        <div className="mt-5 text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#101915] px-3 text-muted-foreground">yoki</span>
            </div>
          </div>
          <button
            onClick={toggleMode}
            className="text-sm text-muted-foreground hover:text-brand transition"
          >
            {isSignup ? "Hisobingiz bormi? " : "Hisob yo'qmi? "}
            <span className="font-semibold text-brand">{isSignup ? "Kirish" : "Ro'yxatdan o'tish"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <>
      <Header />
      <main className="flex-1 grid place-items-center py-12">
        <Suspense fallback={<Loader2 size={28} className="animate-spin text-brand" />}>
          <AuthForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
