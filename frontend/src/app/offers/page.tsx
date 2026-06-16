"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { api } from "@/lib/api";

interface Offer {
  id: string;
  title: string;
  description: string;
  price: string;
  delivery_days: number;
  status: string;
  seller_username?: string;
  buyer_username?: string;
  expires_at?: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "border-amber-400/30 bg-amber-500/10 text-amber-400",
  accepted: "border-green-400/30 bg-green-500/10 text-green-400",
  rejected: "border-red-400/30 bg-red-500/10 text-red-400",
  expired: "border-muted-foreground/30 bg-muted/10 text-muted-foreground",
  canceled: "border-red-400/30 bg-red-500/10 text-red-400",
};

export default function OffersPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [sentOffers, setSentOffers] = useState<Offer[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.sentOffers().catch(() => []),
      api.receivedOffers().catch(() => []),
    ]).then(([s, r]) => {
      setSentOffers(Array.isArray(s) ? s : (s as Record<string, unknown>).results || []);
      setReceivedOffers(Array.isArray(r) ? r : (r as Record<string, unknown>).results || []);
    }).finally(() => setLoading(false));
  }, []);

  async function handleOfferAction(offerId: string, action: "accept" | "reject") {
    try {
      await api.offerAction(offerId, action);
      toast(action === "accept" ? "Taklif qabul qilindi!" : "Taklif rad etildi.", "success");
      setReceivedOffers((prev) => prev.map((o) => o.id === offerId ? { ...o, status: action === "accept" ? "accepted" : "rejected" } : o));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Xatolik", "error");
    }
  }

  if (authLoading) {
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
            <AlertCircle size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Takliflarni ko'rish uchun tizimga kiring.</p>
            <Link href="/auth?mode=login"><Button className="bg-brand text-[#07110f] hover:bg-brand/90 font-bold">Tizimga kirish</Button></Link>
          </div>
        </main>
      </>
    );
  }

  function renderOffers(offers: Offer[], isSent: boolean) {
    if (offers.length === 0) {
      return (
        <div className="grid place-items-center rounded-xl border border-white/10 bg-white/[0.02] py-12 text-center">
          <p className="text-muted-foreground">Hali taklif yo'q.</p>
        </div>
      );
    }
    return (
      <div className="grid gap-3">
        {offers.map((o, i) => (
          <motion.div key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white">{o.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {isSent ? `→ ${o.buyer_username}` : `← ${o.seller_username}`}
                </p>
              </div>
              <Badge variant="outline" className={`text-[10px] ${statusColors[o.status] || ""}`}>{o.status}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{o.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><DollarSign size={12} /> ${o.price}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {o.delivery_days} kun</span>
              </div>
              {!isSent && o.status === "pending" && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 border-green-500/30 text-green-400 hover:bg-green-500/10 gap-1 text-xs" onClick={() => handleOfferAction(o.id, "accept")}>
                    <CheckCircle size={12} /> Qabul
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1 text-xs" onClick={() => handleOfferAction(o.id, "reject")}>
                    <XCircle size={12} /> Rad
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
          <h1 className="mb-6 text-3xl font-black text-white sm:text-4xl">Takliflar</h1>

          {loading ? (
            <div className="grid place-items-center py-20"><Loader2 size={28} className="animate-spin text-brand" /></div>
          ) : (
            <Tabs defaultValue="received">
              <TabsList className="border-white/10 bg-white/[0.04]">
                <TabsTrigger value="received" className="data-[state=active]:bg-brand data-[state=active]:text-[#07110f]">Kiritilgan ({receivedOffers.length})</TabsTrigger>
                <TabsTrigger value="sent" className="data-[state=active]:bg-brand data-[state=active]:text-[#07110f]">Yuborilgan ({sentOffers.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="received" className="mt-4">{renderOffers(receivedOffers, false)}</TabsContent>
              <TabsContent value="sent" className="mt-4">{renderOffers(sentOffers, true)}</TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
