"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, Check, Loader2, Package, CreditCard, MessageSquare, AlertTriangle, Settings } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  related_order_id?: number;
  created_at: string;
}

const typeIcons: Record<string, typeof Bell> = {
  order_update: Package,
  payment_confirmation: CreditCard,
  review_request: Check,
  message: MessageSquare,
  dispute_update: AlertTriangle,
  withdrawal_status: CreditCard,
  system: Bell,
};

const typeColors: Record<string, string> = {
  order_update: "text-blue-400",
  payment_confirmation: "text-green-400",
  review_request: "text-amber-400",
  message: "text-purple-400",
  dispute_update: "text-red-400",
  withdrawal_status: "text-cyan-400",
  system: "text-muted-foreground",
};

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const payload = await api.notifications();
      const data = Array.isArray(payload) ? payload : (payload as Record<string, unknown>).results || [];
      setNotifications(data as Notification[]);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  async function markAsRead(id: string) {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    } catch {}
  }

  async function markAllRead() {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {}
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
            <Bell size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Bildirishnomalarni ko'rish uchun tizimga kiring.</p>
            <Link href="/auth?mode=login">
              <Button className="bg-brand text-[#07110f] hover:bg-brand/90 font-bold">Tizimga kirish</Button>
            </Link>
          </div>
        </main>
      </>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 lg:px-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-white sm:text-4xl">Bildirishnomalar</h1>
              {unreadCount > 0 && (
                <p className="mt-1 text-sm text-muted-foreground">{unreadCount} ta o'qilmagan</p>
              )}
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllRead} className="border-white/15 text-white hover:bg-white/5 gap-2">
                <Check size={14} /> Barchasini o'qilgan qilish
              </Button>
            )}
          </div>

          {loading ? (
            <div className="grid place-items-center py-20">
              <Loader2 size={28} className="animate-spin text-brand" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="grid place-items-center rounded-xl border border-white/10 bg-white/[0.02] py-20 text-center">
              <Bell size={48} className="mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Hali bildirishnoma yo'q.</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {notifications.map((n, i) => {
                const Icon = typeIcons[n.type] || Bell;
                const iconColor = typeColors[n.type] || "text-muted-foreground";
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`flex items-start gap-3 rounded-xl border p-4 transition cursor-pointer ${
                      n.is_read
                        ? "border-white/10 bg-white/[0.02] opacity-70"
                        : "border-brand/20 bg-brand/[0.03]"
                    }`}
                    onClick={() => !n.is_read && markAsRead(n.id)}
                  >
                    <div className={`mt-0.5 shrink-0 ${iconColor}`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold ${n.is_read ? "text-muted-foreground" : "text-white"}`}>{n.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {new Date(n.created_at).toLocaleDateString("uz-UZ")}
                      </p>
                    </div>
                    {!n.is_read && (
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
