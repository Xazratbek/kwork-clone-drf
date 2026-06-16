"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Check, User, Store } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const { user, loading, reloadUser } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleBecomeSeller(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.becomeSeller({ display_name: displayName, bio });
      await reloadUser();
      toast("Sotuvchi profili faollashtirildi!", "success");
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
            <p className="text-muted-foreground mb-4">Profilni ko&apos;rish uchun tizimga kiring.</p>
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
          <h1 className="mb-6 text-3xl font-black text-white sm:text-4xl">Profil</h1>

          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-brand/20 text-xl font-bold text-brand">
                    {(user.username as string)?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{user.username as string}</h2>
                    <p className="text-sm text-muted-foreground">{user.email as string}</p>
                    <div className="mt-1 flex gap-2">
                      <Badge variant="outline" className={`text-[10px] ${user.is_seller ? "border-brand/30 bg-brand/10 text-brand" : "border-white/15 text-muted-foreground"}`}>
                        {user.is_seller ? "Sotuvchi" : "Xaridor"}
                      </Badge>
                      {user.city && (
                        <Badge variant="outline" className="border-white/15 text-[10px] text-muted-foreground">
                          {user.city as string}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="mb-3 text-sm font-bold text-white">Hisob ma&apos;lumotlari</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="text-white">{user.email as string}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Username</span>
                    <span className="text-white">{user.username as string}</span>
                  </div>
                  {user.city && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shahar</span>
                      <span className="text-white">{user.city as string}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {!user.is_seller && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Store size={18} className="text-brand" />
                    <h2 className="text-lg font-bold text-white">Sotuvchi bo&apos;lish</h2>
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Sotuvchi profilini faollashtiring va o&apos;z xizmatlaringizni joylashtiring.
                  </p>
                  <form onSubmit={handleBecomeSeller} className="grid gap-3">
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ko&apos;rinishdagi nom"
                      className="border-white/10 bg-white/[0.06] text-white placeholder:text-muted-foreground focus:border-brand/50"
                    />
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Qisqa o&apos;z haqida"
                      className="min-h-[80px] border-white/10 bg-white/[0.06] text-white placeholder:text-muted-foreground focus:border-brand/50"
                    />
                    <Button type="submit" disabled={busy} className="w-full bg-brand text-[#07110f] hover:bg-brand/90 font-bold gap-2">
                      {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={15} />}
                      Sotuvchi profilini faollashtirish
                    </Button>
                  </form>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
