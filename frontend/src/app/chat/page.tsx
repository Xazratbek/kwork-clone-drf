"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageSquare, Loader2, Send, ArrowLeft, Paperclip } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { api } from "@/lib/api";

interface Message {
  id: string;
  body: string;
  sender: string;
  receiver: string;
  sender_username?: string;
  file?: string;
  created_at: string;
}

interface Order {
  id: string;
  title_snapshot: string;
  status: string;
  buyer_username?: string;
  seller_username?: string;
}

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.orders()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setOrders(list);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  async function selectOrder(order: Order) {
    setSelectedOrder(order);
    try {
      const data = await api.orderMessages(order.id);
      setMessages(Array.isArray(data) ? data : (data as Record<string, unknown>).results || []);
    } catch {
      setMessages([]);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrder || !newMessage.trim()) return;
    setSending(true);
    try {
      await api.sendMessage(selectedOrder.id, { body: newMessage });
      setNewMessage("");
      const data = await api.orderMessages(selectedOrder.id);
      setMessages(Array.isArray(data) ? data : (data as Record<string, unknown>).results || []);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Xatolik", "error");
    } finally {
      setSending(false);
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
            <MessageSquare size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Xabarlarni ko'rish uchun tizimga kiring.</p>
            <Link href="/auth?mode=login"><Button className="bg-brand text-[#07110f] hover:bg-brand/90 font-bold">Tizimga kirish</Button></Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
          <h1 className="mb-6 text-3xl font-black text-white sm:text-4xl">Xabarlar</h1>

          <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground">Buyurtmalar</p>
              {loading ? (
                <div className="grid place-items-center py-8"><Loader2 size={20} className="animate-spin text-brand" /></div>
              ) : orders.length === 0 ? (
                <p className="px-2 py-4 text-xs text-muted-foreground">Buyurtma yo'q.</p>
              ) : (
                <div className="grid gap-1">
                  {orders.map((o) => (
                    <button key={o.id} onClick={() => selectOrder(o)}
                      className={`w-full rounded-lg px-3 py-2.5 text-left transition hover:bg-white/[0.06] ${selectedOrder?.id === o.id ? "bg-brand/10 border border-brand/20" : ""}`}>
                      <p className="text-sm font-semibold text-white line-clamp-1">{o.title_snapshot}</p>
                      <p className="text-xs text-muted-foreground">{o.buyer_username} → {o.seller_username}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03]">
              {!selectedOrder ? (
                <div className="grid flex-1 place-items-center py-20">
                  <MessageSquare size={48} className="mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Buyurtmani tanlang</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground lg:hidden" onClick={() => setSelectedOrder(null)}>
                      <ArrowLeft size={16} />
                    </Button>
                    <div>
                      <p className="text-sm font-semibold text-white">{selectedOrder.title_snapshot}</p>
                      <Badge variant="outline" className="text-[10px] border-white/15 text-muted-foreground">{selectedOrder.status}</Badge>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[500px]">
                    {messages.length === 0 ? (
                      <div className="grid place-items-center py-10">
                        <p className="text-sm text-muted-foreground">Hali xabar yo'q.</p>
                      </div>
                    ) : messages.map((m) => {
                      const isMe = m.sender === (user as Record<string, unknown>).id;
                      return (
                        <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] rounded-xl px-3.5 py-2.5 ${isMe ? "bg-brand text-[#07110f]" : "bg-white/[0.06] text-white"}`}>
                            <p className="text-sm">{m.body}</p>
                            <p className={`mt-1 text-[10px] ${isMe ? "text-[#07110f]/60" : "text-muted-foreground"}`}>
                              {new Date(m.created_at).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-white/10 p-3">
                    <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Xabar yozing..."
                      className="flex-1 border-white/10 bg-white/[0.06] text-white placeholder:text-muted-foreground focus:border-brand/50" />
                    <Button type="submit" disabled={sending || !newMessage.trim()} size="icon" className="bg-brand text-[#07110f] hover:bg-brand/90 shrink-0">
                      <Send size={16} />
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
