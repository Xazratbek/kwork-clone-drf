"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Filter, Grid2X2, Loader2, SlidersHorizontal } from "lucide-react";
import { KworkCard, type Kwork } from "@/components/kwork-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { api } from "@/lib/api";

interface Category {
  id: string;
  name: string;
  slug: string;
  children?: Category[];
}

function normalizeList(payload: unknown): { count: number; data: Kwork[]; next: string | null; previous: string | null } {
  if (Array.isArray(payload)) return { count: payload.length, data: payload as Kwork[], next: null, previous: null };
  const obj = payload as Record<string, unknown>;
  return {
    count: (obj.kwork_count as number) || (obj.count as number) || ((obj.data as unknown[])?.length ?? 0),
    data: (obj.data as Kwork[]) || (obj.results as Kwork[]) || [],
    next: (obj.next as string) || null,
    previous: (obj.previous as string) || null,
  };
}

export function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Kwork[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [priceMin, setPriceMin] = useState(searchParams.get("price_min") || "");
  const [priceMax, setPriceMax] = useState(searchParams.get("price_max") || "");
  const [currency, setCurrency] = useState(searchParams.get("currency") || "");
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));

  const flatCategories = categories.flatMap((c) => [c, ...(c.children || [])]);

  const loadKworks = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (priceMin) params.price_min = priceMin;
      if (priceMax) params.price_max = priceMax;
      if (currency) params.currency = currency;
      if (page > 1) params.page = page;

      const payload = await api.kworks(params);
      const normalized = normalizeList(payload);
      setItems(normalized.data);
      setCount(normalized.count);
      setNext(normalized.next);
      setPrevious(normalized.previous);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, priceMin, priceMax, currency, page]);

  useEffect(() => {
    api.categories().then((cats) => {
      setCategories(cats);
      const searchTerm = searchParams.get("search") || "";
      const categoryId = searchParams.get("category") || "";
      if (searchTerm && !categoryId && Array.isArray(cats)) {
        const flat = cats.flatMap((c: Category) => [c, ...(c.children || [])]);
        const match = flat.find((c: Category) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (match) {
          setCategory(match.id);
          setSearch("");
        }
      }
    }).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    loadKworks();
  }, [loadKworks]);

  function applyFilters() {
    setPage(1);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (priceMin) params.set("price_min", priceMin);
    if (priceMax) params.set("price_max", priceMax);
    if (currency) params.set("currency", currency);
    router.push(`/catalog?${params.toString()}`);
  }

  function resetFilters() {
    setSearch("");
    setCategory("");
    setPriceMin("");
    setPriceMax("");
    setCurrency("");
    setPage(1);
    router.push("/catalog");
  }

  const filterContent = (
    <div className="grid gap-4">
      <div className="flex items-center gap-2 font-bold text-white">
        <Filter size={16} /> Filtrlar
      </div>
      <div className="grid gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">Kategoriya</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white outline-none focus:border-brand/50"
        >
          <option value="">Barcha kategoriyalar</option>
          {flatCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">Qidirish</label>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sarlavha yoki tavsif"
          className="border-white/10 bg-white/[0.06] text-white placeholder:text-muted-foreground focus:border-brand/50"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="grid gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Min narx</label>
          <Input
            type="number"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            placeholder="0"
            className="border-white/10 bg-white/[0.06] text-white placeholder:text-muted-foreground focus:border-brand/50"
          />
        </div>
        <div className="grid gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Max narx</label>
          <Input
            type="number"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder="1000"
            className="border-white/10 bg-white/[0.06] text-white placeholder:text-muted-foreground focus:border-brand/50"
          />
        </div>
      </div>
      <div className="grid gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">Valyuta</label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white outline-none focus:border-brand/50"
        >
          <option value="">Barchasi</option>
          <option value="USD">USD</option>
          <option value="UZS">UZS</option>
        </select>
      </div>
      <Button onClick={applyFilters} className="w-full bg-brand text-[#07110f] hover:bg-brand/90 font-bold">
        Qo'llash
      </Button>
      <Button onClick={resetFilters} variant="ghost" className="w-full text-muted-foreground hover:text-white">
        Tiklash
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white sm:text-4xl">Xizmatlar</h1>
          <p className="mt-1 text-sm text-muted-foreground">{count} ta xizmat topildi</p>
        </div>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger className="lg:hidden inline-flex h-8 items-center gap-2 rounded-md border border-white/15 bg-transparent px-3 text-xs font-semibold text-white cursor-pointer hover:bg-white/5 transition outline-none">
              <SlidersHorizontal size={14} /> Filtrlar
            </SheetTrigger>
            <SheetContent side="left" className="w-80 border-white/10 bg-[#0d1713] p-5">
              {filterContent}
            </SheetContent>
          </Sheet>
          <div className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-muted-foreground lg:flex">
            <Grid2X2 size={14} /> Grid
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="sticky top-32 hidden self-start lg:block">
          {filterContent}
        </aside>

        <section>
          {loading ? (
            <div className="grid place-items-center py-20">
              <Loader2 size={28} className="animate-spin text-brand" />
            </div>
          ) : items.length === 0 ? (
            <div className="grid place-items-center rounded-xl border border-white/10 bg-white/[0.02] py-20 text-center">
              <p className="text-muted-foreground">Hech qanday xizmat topilmadi. Filtrlarni o'zgartiring.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item, i) => (
                  <KworkCard key={item.id} kwork={item} index={i} />
                ))}
              </div>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!previous}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="border-white/15 text-white hover:bg-white/5 disabled:opacity-40"
                >
                  <ChevronLeft size={14} /> Oldingi
                </Button>
                <span className="text-sm text-muted-foreground">Sahifa {page}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!next}
                  onClick={() => setPage((p) => p + 1)}
                  className="border-white/15 text-white hover:bg-white/5 disabled:opacity-40"
                >
                  Keyingi <ChevronRight size={14} />
                </Button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
