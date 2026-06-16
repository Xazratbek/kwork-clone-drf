"use client";

import { motion } from "framer-motion";
import { Clock, Heart } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

const fallbackGradients = [
  "linear-gradient(135deg, #15392f 0%, #d7ff64 100%)",
  "linear-gradient(135deg, #341d14 0%, #ffb84d 100%)",
  "linear-gradient(135deg, #102039 0%, #64d7ff 100%)",
  "linear-gradient(135deg, #2d1938 0%, #ff6f91 100%)",
  "linear-gradient(135deg, #19271c 0%, #69f0ae 100%)",
];

export interface Kwork {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  price_minor: string;
  currency?: string;
  delivery_days?: number;
  image?: string | null;
  seller?: { username?: string; id?: string };
  category?: { name?: string; id?: string };
  status?: string;
}

export function formatMoney(kwork: Kwork) {
  const amount = kwork?.price_minor || "0";
  const currency = kwork?.currency || "USD";
  return currency === "USD" ? `$${amount}` : `${amount} ${currency}`;
}

export function KworkImage({ kwork, index = 0 }: { kwork: Kwork; index?: number }) {
  if (kwork.image) {
    return (
      <img
        src={api.mediaUrl(kwork.image)}
        alt={kwork.title}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    );
  }
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: fallbackGradients[index % fallbackGradients.length] }}
    >
      <span className="text-4xl font-black text-white/80">{kwork.title?.slice(0, 2) || "KW"}</span>
    </div>
  );
}

export function KworkCard({ kwork, index = 0 }: { kwork: Kwork; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
    >
      <Link href={`/kwork/${kwork.id}`} className="group block overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-brand/40 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-black/20">
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-900">
          <KworkImage kwork={kwork} index={index} />
          <button
            className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-lg bg-black/60 text-white/80 backdrop-blur-sm transition hover:text-red-400"
            onClick={(e) => e.preventDefault()}
          >
            <Heart size={15} />
          </button>
        </div>
        <div className="p-3.5">
          <h3 className="line-clamp-2 min-h-[2.6rem] text-sm font-semibold leading-snug text-white">
            {kwork.title}
          </h3>
          <div className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/20 text-[10px] font-bold text-brand">
              {kwork.seller?.username?.[0]?.toUpperCase() || "S"}
            </span>
            <span className="truncate">{kwork.seller?.username || "sotuvchi"}</span>
            <Badge variant="secondary" className="ml-auto shrink-0 border-brand/20 bg-brand/10 text-[10px] text-brand">
              Top
            </Badge>
          </div>
          <div className="mt-2.5 flex items-center justify-between border-t border-white/5 pt-2.5">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={12} /> {kwork.delivery_days || 1} kun
            </span>
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                {kwork.currency || "USD"}
              </span>
              <span className="text-base font-bold text-brand">{formatMoney(kwork)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
