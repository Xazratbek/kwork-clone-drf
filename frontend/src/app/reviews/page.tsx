"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Loader2, MessageSquare, Calendar } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface Review {
  id: string;
  rating: number;
  comment: string;
  buyer_username?: string;
  seller_username?: string;
  created_at: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={14} className={s <= rating ? "fill-brand text-brand" : "text-muted-foreground"} />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.reviews()
      .then((data) => {
        setReviews(Array.isArray(data) ? data : (data as Record<string, unknown>).results || []);
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
          <h1 className="mb-6 text-3xl font-black text-white sm:text-4xl">Sharhlar</h1>

          {loading ? (
            <div className="grid place-items-center py-20"><Loader2 size={28} className="animate-spin text-brand" /></div>
          ) : reviews.length === 0 ? (
            <div className="grid place-items-center rounded-xl border border-white/10 bg-white/[0.02] py-20 text-center">
              <Star size={48} className="mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Hali sharh yo'q.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {reviews.map((r, i) => (
                <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-brand/20 text-xs font-bold text-brand">
                        {(r.buyer_username as string)?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{r.buyer_username as string}</span>
                        <StarRating rating={r.rating} />
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("uz-UZ")}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{r.comment}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
