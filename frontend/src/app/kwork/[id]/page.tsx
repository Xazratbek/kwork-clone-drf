"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, Clock, Send, Loader2, Shield, Star } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { KworkImage, formatMoney, type Kwork } from "@/components/kwork-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { api } from "@/lib/api";

export default function KworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const { toast } = useToast();
  const [kwork, setKwork] = useState<Kwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [requirements, setRequirements] = useState("");
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.kwork(id)
      .then(setKwork)
      .catch(() => setKwork(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleOrder() {
    if (!user) {
      window.location.href = "/auth?mode=login";
      return;
    }
    if (!kwork) return;
    setOrdering(true);
    try {
      await api.createOrder(kwork.id, { kwork: kwork.id, requirements });
      toast("Buyurtma muvaffaqiyatli yaratildi!", "success");
      window.location.href = "/orders";
    } catch (err) {
      toast(err instanceof Error ? err.message : "Xatolik yuz berdi", "error");
    } finally {
      setOrdering(false);
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
          <Link href="/catalog" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition">
            <ChevronLeft size={14} /> Katalogni qaytish
          </Link>

          {loading ? (
            <div className="grid place-items-center py-20">
              <Loader2 size={28} className="animate-spin text-brand" />
            </div>
          ) : !kwork ? (
            <div className="grid place-items-center rounded-xl border border-white/10 bg-white/[0.02] py-20 text-center">
              <p className="text-muted-foreground">Xizmat topilmadi.</p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                  <div className="aspect-video bg-neutral-900">
                    <KworkImage kwork={kwork} />
                  </div>
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">{kwork.title}</h1>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {kwork.category?.name && (
                      <Badge variant="secondary" className="border-white/10 bg-white/[0.06] text-muted-foreground">
                        {kwork.category.name}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="border-brand/20 bg-brand/10 text-brand">
                      <Clock size={11} className="mr-1" /> {kwork.delivery_days || 1} kun
                    </Badge>
                    <Badge variant="secondary" className="border-white/10 bg-white/[0.06] text-muted-foreground">
                      {kwork.currency || "USD"}
                    </Badge>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div>
                  <h2 className="mb-3 text-lg font-bold text-white">Tavsif</h2>
                  <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">{kwork.description}</p>
                </div>

                {kwork.seller && (
                  <>
                    <Separator className="bg-white/10" />
                    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-brand/20 text-sm font-bold text-brand">
                        {(kwork.seller.username as string)?.[0]?.toUpperCase() || "S"}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{kwork.seller.username as string}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Star size={12} className="text-brand" /> Sotuvchi
                          <Shield size={12} className="text-green-400" /> Tasdiqlangan
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>

              <motion.aside
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="sticky top-28 self-start"
              >
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Narx</p>
                    <p className="mt-1 text-4xl font-black text-brand">{formatMoney(kwork)}</p>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="grid gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Talablaringiz</label>
                    <Textarea
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      placeholder="Nima kerakligini yozing..."
                      className="min-h-[120px] border-white/10 bg-white/[0.06] text-white placeholder:text-muted-foreground focus:border-brand/50"
                    />
                  </div>
                  <Button
                    onClick={handleOrder}
                    disabled={ordering}
                    className="w-full bg-brand text-[#07110f] hover:bg-brand/90 font-bold gap-2"
                  >
                    {ordering ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                    Buyurtma berish
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Xavfsiz to&apos;lov tizimi bilan himoyalangan
                  </p>
                </div>
              </motion.aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
