"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Package, CheckCircle, XCircle, Truck, MessageSquare } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { api } from "@/lib/api";

interface Order {
  id: string;
  title_snapshot: string;
  price_minor: string;
  currency: string;
  requirements: string;
  status: string;
  buyer_username?: string;
  seller_username?: string;
  created_at?: string;
}

const statusColors: Record<string, string> = {
  new: "border-blue-400/30 bg-blue-500/10 text-blue-400",
  in_progress: "border-amber-400/30 bg-amber-500/10 text-amber-400",
  delivered: "border-purple-400/30 bg-purple-500/10 text-purple-400",
  completed: "border-green-400/30 bg-green-500/10 text-green-400",
  canceled: "border-red-400/30 bg-red-500/10 text-red-400",
  rejected: "border-red-400/30 bg-red-500/10 text-red-400",
};

const statusLabels: Record<string, string> = {
  new: "Yangi",
  in_progress: "Jarayonda",
  delivered: "Yetkazildi",
  completed: "Tugallangan",
  canceled: "Bekor qilindi",
  rejected: "Rad etildi",
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<Record<string, string>>({});

  const loadOrders = async () => {
    try {
      const payload = await api.orders();
      setOrders(Array.isArray(payload) ? payload : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleConfirm(orderId: string, status: string) {
    try {
      await api.confirmOrder(orderId, status);
      toast("Buyurtma holati yangilandi", "success");
      loadOrders();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Xatolik", "error");
    }
  }

  async function handleDeliver(orderId: string) {
    try {
      await api.deliverOrder(orderId, { order_id: orderId, message: deliveries[orderId] || "Yetkazildi." });
      toast("Yetkazish muvaffaqiyatli!", "success");
      loadOrders();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Xatolik", "error");
    }
  }

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
            <Package size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Buyurtmalarni ko&apos;rish uchun tizimga kiring.</p>
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
          <h1 className="mb-6 text-3xl font-black text-white sm:text-4xl">Buyurtmalar</h1>

          {loading ? (
            <div className="grid place-items-center py-20">
              <Loader2 size={28} className="animate-spin text-brand" />
            </div>
          ) : orders.length === 0 ? (
            <div className="grid place-items-center rounded-xl border border-white/10 bg-white/[0.02] py-20 text-center">
              <Package size={48} className="mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Hali buyurtma yo&apos;q. Katalogdan xizmat topib buyurtma bering.</p>
              <Link href="/catalog" className="mt-4">
                <Button variant="outline" className="border-white/15 text-white hover:bg-white/5">Katalogga o&apos;tish</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {orders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white line-clamp-1">{order.title_snapshot}</h3>
                    <Badge variant="outline" className={`shrink-0 text-[10px] ${statusColors[order.status] || ""}`}>
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {order.requirements || "Talablar ko&apos;rsatilmagan"}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{order.buyer_username} → {order.seller_username}</span>
                    <span className="font-bold text-brand">${order.price_minor}</span>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="flex gap-2">
                    {order.status === "new" && (
                      <>
                        <Button size="sm" variant="outline" className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10 gap-1" onClick={() => handleConfirm(order.id, "in_progress")}>
                          <CheckCircle size={13} /> Qabul qilish
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1" onClick={() => handleConfirm(order.id, "rejected")}>
                          <XCircle size={13} /> Rad etish
                        </Button>
                      </>
                    )}
                    {order.status === "in_progress" && (
                      <Button size="sm" variant="outline" className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10 gap-1" onClick={() => handleConfirm(order.id, "delivered")}>
                        <Truck size={13} /> Yetkazish
                      </Button>
                    )}
                  </div>

                  {order.status === "in_progress" && (
                    <>
                      <Textarea
                        value={deliveries[order.id] || ""}
                        onChange={(e) => setDeliveries({ ...deliveries, [order.id]: e.target.value })}
                        placeholder="Yetkazish xabari..."
                        className="min-h-[60px] border-white/10 bg-white/[0.06] text-white placeholder:text-muted-foreground focus:border-brand/50 text-xs"
                      />
                      <Button size="sm" className="w-full bg-brand text-[#07110f] hover:bg-brand/90 font-bold gap-1" onClick={() => handleDeliver(order.id)}>
                        <Truck size={13} /> Yetkazish
                      </Button>
                    </>
                  )}
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
