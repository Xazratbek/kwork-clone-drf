"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, X, Loader2 } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { api } from "@/lib/api";

export default function VerifyEmailPage() {
  const { reloadUser } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [email, setEmail] = useState("");
  const [resendBusy, setResendBusy] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setState("error");
      setErrorMsg("Tasdiqlash tokeni topilmadi.");
      return;
    }
    api.verifyEmail(token)
      .then(async (res) => {
        await reloadUser();
        setState("success");
        toast("Email muvaffaqiyatli tasdiqlandi.", "success");
      })
      .catch((err) => {
        setState("error");
        setErrorMsg(err.message);
        toast(err.message, "error");
      });
  }, []);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setResendBusy(true);
    try {
      const res = await api.resendVerification(email);
      toast(res.detail || "Tasdiqlash linki qayta yuborildi.", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Xatolik", "error");
    } finally {
      setResendBusy(false);
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1 grid place-items-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg px-4"
        >
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            {state === "loading" && (
              <>
                <Loader2 size={48} className="mx-auto mb-4 animate-spin text-brand" />
                <h1 className="text-2xl font-black text-white">Email tasdiqlanmoqda...</h1>
                <p className="mt-2 text-muted-foreground">Iltimos, bir necha soniya kuting.</p>
              </>
            )}
            {state === "error" && (
              <>
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-red-500/10 text-red-400">
                  <X size={24} />
                </div>
                <h1 className="text-2xl font-black text-white">Email tasdiqlanmadi</h1>
                <p className="mt-2 text-sm text-red-400">{errorMsg}</p>
                <form onSubmit={handleResend} className="mt-6 grid gap-3">
                  <p className="text-xs text-muted-foreground">
                    Yangi tasdiqlash linkini olish uchun emailingizni kiriting
                  </p>
                  <Input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="border-white/10 bg-white/[0.06] text-white placeholder:text-muted-foreground focus:border-brand/50"
                  />
                  <Button type="submit" disabled={resendBusy} className="w-full bg-brand text-[#07110f] hover:bg-brand/90 font-bold gap-2">
                    {resendBusy && <Loader2 size={16} className="animate-spin" />}
                    Linkni qayta yuborish
                  </Button>
                </form>
                <Link href="/" className="mt-4 inline-block text-sm text-muted-foreground hover:text-brand transition">
                  Bosh sahifaga qaytish
                </Link>
              </>
            )}
            {state === "success" && (
              <>
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-green-500/10 text-green-400">
                  <Check size={24} />
                </div>
                <h1 className="text-2xl font-black text-white">Email tasdiqlandi</h1>
                <p className="mt-2 text-muted-foreground">Email muvaffaqiyatli tasdiqlandi.</p>
                <Link href="/catalog" className="mt-6 inline-block">
                  <Button className="bg-brand text-[#07110f] hover:bg-brand/90 font-bold">Katalogni ko&apos;rish</Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
