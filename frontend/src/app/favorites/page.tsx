"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Heart, Trash2 } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { KworkCard, type Kwork } from "@/components/kwork-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { api } from "@/lib/api";

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<Kwork[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    try {
      const payload = await api.kworks({ favorites: true });
      const data = Array.isArray(payload) ? payload : (payload as Record<string, unknown>).results || (payload as Record<string, unknown>).data || [];
      setFavorites(data as Kwork[]);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

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
            <Heart size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Sevimlilarni ko'rish uchun tizimga kiring.</p>
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
          <h1 className="mb-6 text-3xl font-black text-white sm:text-4xl">Sevimlilar</h1>
          {loading ? (
            <div className="grid place-items-center py-20">
              <Loader2 size={28} className="animate-spin text-brand" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="grid place-items-center rounded-xl border border-white/10 bg-white/[0.02] py-20 text-center">
              <Heart size={48} className="mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Hali sevimlilar yo'q.</p>
              <Link href="/catalog" className="mt-4">
                <Button variant="outline" className="border-white/15 text-white hover:bg-white/5">Katalogga o'tish</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {favorites.map((item, i) => (
                <KworkCard key={item.id} kwork={item} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
