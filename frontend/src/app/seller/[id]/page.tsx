"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Loader2, MapPin, Calendar, Package, MessageSquare } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { KworkCard, type Kwork } from "@/components/kwork-card";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface SellerData {
  id: string;
  username: string;
  email?: string;
  city?: string;
  is_seller: boolean;
  seller_profile?: {
    display_name: string;
    bio: string;
    rating: string;
    completed_orders: number;
  };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  buyer_username?: string;
  created_at: string;
}

export default function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = params;
  const { user } = useAuth();
  const [seller, setSeller] = useState<SellerData | null>(null);
  const [kworks, setKworks] = useState<Kwork[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.sellerProfile(id).catch(() => null),
      api.kworks({ seller: id }).catch(() => []),
      api.sellerReviews(id).catch(() => []),
    ]).then(([s, k, r]) => {
      setSeller(s);
      setKworks(Array.isArray(k) ? k : (k as Record<string, unknown>).results || (k as Record<string, unknown>).data || []);
      setReviews(Array.isArray(r) ? r : (r as Record<string, unknown>).results || []);
    }).finally(() => setLoading(false));
  }, [id]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : seller?.seller_profile?.rating || "0";

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
          {loading ? (
            <div className="grid place-items-center py-20"><Loader2 size={28} className="animate-spin text-brand" /></div>
          ) : !seller ? (
            <div className="grid place-items-center rounded-xl border border-white/10 bg-white/[0.02] py-20 text-center">
              <p className="text-muted-foreground">Sotuvchi topilmadi.</p>
            </div>
          ) : (
            <>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-start gap-5">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-brand/20 text-2xl font-bold text-brand">
                      {seller.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-2xl font-black text-white">{seller.seller_profile?.display_name || seller.username}</h1>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Star size={14} className="text-brand" /> {avgRating}</span>
                      {seller.city && <span className="flex items-center gap-1"><MapPin size={14} /> {seller.city}</span>}
                      <span className="flex items-center gap-1"><Package size={14} /> {seller.seller_profile?.completed_orders || 0} buyurtma</span>
                    </div>
                    {seller.seller_profile?.bio && (
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{seller.seller_profile.bio}</p>
                    )}
                  </div>
                </div>
              </motion.div>

              {kworks.length > 0 && (
                <div className="mb-8">
                  <h2 className="mb-4 text-xl font-bold text-white">Xizmatlar</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {kworks.map((k, i) => <KworkCard key={k.id} kwork={k} index={i} />)}
                  </div>
                </div>
              )}

              {reviews.length > 0 && (
                <div>
                  <h2 className="mb-4 text-xl font-bold text-white">Sharhlar ({reviews.length})</h2>
                  <div className="grid gap-3">
                    {reviews.map((r, i) => (
                      <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{r.buyer_username}</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={12} className={s <= r.rating ? "fill-brand text-brand" : "text-muted-foreground"} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("uz-UZ")}</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
