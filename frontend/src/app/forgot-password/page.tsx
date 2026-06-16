"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Mail, ArrowLeft, KeyRound } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/toast-context";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
      toast("Parol tiklash linki yuborildi.", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Xatolik", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1 grid place-items-center py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md px-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-brand/10">
              <KeyRound size={24} className="text-brand" />
            </div>
            <h1 className="text-2xl font-black text-white">Parolni tiklash</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Email manzilingizni kiriting, biz sizga parolni tiklash linkini yuboramiz.
            </p>

            {sent ? (
              <div className="mt-6">
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-green-500/10 text-green-400">
                  <Mail size={24} />
                </div>
                <p className="text-sm text-muted-foreground">Link yuborildi! Email pochtangizni tekshiring.</p>
                <Link href="/auth?mode=login" className="mt-4 inline-block">
                  <Button variant="ghost" className="text-muted-foreground hover:text-white gap-2">
                    <ArrowLeft size={14} /> Kirish sahifasiga qaytish
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 grid gap-3">
                <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="border-white/10 bg-white/[0.06] text-white placeholder:text-muted-foreground focus:border-brand/50" />
                <Button type="submit" disabled={busy} className="w-full bg-brand text-[#07110f] hover:bg-brand/90 font-bold gap-2">
                  {busy && <Loader2 size={16} className="animate-spin" />}
                  Link yuborish
                </Button>
                <Link href="/auth?mode=login">
                  <Button variant="ghost" type="button" className="w-full text-muted-foreground hover:text-white gap-2">
                    <ArrowLeft size={14} /> Kirish sahifasiga qaytish
                  </Button>
                </Link>
              </form>
            )}
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
