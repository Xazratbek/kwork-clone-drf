"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Wallet as WalletIcon, ArrowDownToLine, ArrowUpFromLine, Loader2, Clock, CheckCircle, XCircle, CreditCard } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { api } from "@/lib/api";

interface WalletData {
  balance: string;
  escrow_balance: string;
}

interface Transaction {
  id: string;
  amount: string;
  type: string;
  description: string;
  created_at: string;
}

interface Withdrawal {
  id: string;
  amount: string;
  method: string;
  status: string;
  created_at: string;
}

const txColors: Record<string, string> = {
  deposit: "text-green-400",
  withdrawal: "text-red-400",
  refund: "text-blue-400",
  payment_sent: "text-red-400",
  payment_received: "text-green-400",
  escrow_hold: "text-amber-400",
  escrow_release: "text-green-400",
};

const statusColors: Record<string, string> = {
  pending: "border-amber-400/30 bg-amber-500/10 text-amber-400",
  approved: "border-green-400/30 bg-green-500/10 text-green-400",
  processing: "border-blue-400/30 bg-blue-500/10 text-blue-400",
  completed: "border-green-400/30 bg-green-500/10 text-green-400",
  failed: "border-red-400/30 bg-red-500/10 text-red-400",
  cancelled: "border-red-400/30 bg-red-500/10 text-red-400",
};

export default function WalletPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("bank_transfer");
  const [withdrawPhone, setWithdrawPhone] = useState("");
  const [withdrawBusy, setWithdrawBusy] = useState(false);

  const loadWallet = async () => {
    try {
      const w = await api.wallet();
      setWallet(w);
      const tx = await api.walletTransactions();
      setTransactions(Array.isArray(tx) ? tx : (tx as Record<string, unknown>).results || []);
      const wr = await api.withdrawalRequests();
      setWithdrawals(Array.isArray(wr) ? wr : (wr as Record<string, unknown>).results || []);
    } catch {
      // Wallet not created yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    setWithdrawBusy(true);
    try {
      await api.createWithdrawal({ amount: withdrawAmount, method: withdrawMethod, phone_number: withdrawPhone });
      toast("Pul yechish so'rovi yuborildi.", "success");
      setWithdrawAmount("");
      setWithdrawPhone("");
      loadWallet();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Xatolik", "error");
    } finally {
      setWithdrawBusy(false);
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
            <WalletIcon size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Hamyoni ko'rish uchun tizimga kiring.</p>
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
        <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
          <h1 className="mb-6 text-3xl font-black text-white sm:text-4xl">Hamyon</h1>

          {loading ? (
            <div className="grid place-items-center py-20"><Loader2 size={28} className="animate-spin text-brand" /></div>
          ) : (
            <>
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs text-muted-foreground">Balans</p>
                  <p className="mt-1 text-3xl font-black text-brand">${wallet?.balance || "0.00"}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs text-muted-foreground">Escrow</p>
                  <p className="mt-1 text-3xl font-black text-amber-400">${wallet?.escrow_balance || "0.00"}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs text-muted-foreground">Jami tranzaksiyalar</p>
                  <p className="mt-1 text-3xl font-black text-white">{transactions.length}</p>
                </motion.div>
              </div>

              <Tabs defaultValue="transactions">
                <TabsList className="border-white/10 bg-white/[0.04]">
                  <TabsTrigger value="transactions" className="data-[state=active]:bg-brand data-[state=active]:text-[#07110f]">Tranzaksiyalar</TabsTrigger>
                  <TabsTrigger value="withdrawals" className="data-[state=active]:bg-brand data-[state=active]:text-[#07110f]">Pul yechish</TabsTrigger>
                  <TabsTrigger value="withdraw" className="data-[state=active]:bg-brand data-[state=active]:text-[#07110f]">Yechish so'rovi</TabsTrigger>
                </TabsList>

                <TabsContent value="transactions" className="mt-4">
                  <div className="grid gap-2">
                    {transactions.length === 0 ? (
                      <div className="grid place-items-center rounded-xl border border-white/10 bg-white/[0.02] py-12 text-center">
                        <p className="text-muted-foreground">Hali tranzaksiya yo'q.</p>
                      </div>
                    ) : transactions.map((tx, i) => (
                      <motion.div key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <div>
                          <p className="text-sm font-semibold text-white">{tx.description || tx.type}</p>
                          <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString("uz-UZ")}</p>
                        </div>
                        <span className={`text-lg font-bold ${txColors[tx.type] || "text-white"}`}>
                          {tx.type.includes("received") || tx.type === "deposit" || tx.type === "refund" ? "+" : "-"}${tx.amount}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="withdrawals" className="mt-4">
                  <div className="grid gap-2">
                    {withdrawals.length === 0 ? (
                      <div className="grid place-items-center rounded-xl border border-white/10 bg-white/[0.02] py-12 text-center">
                        <p className="text-muted-foreground">Hali pul yechish so'rovi yo'q.</p>
                      </div>
                    ) : withdrawals.map((w, i) => (
                      <motion.div key={w.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <div>
                          <p className="text-sm font-semibold text-white">${w.amount} — {w.method}</p>
                          <p className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleDateString("uz-UZ")}</p>
                        </div>
                        <Badge variant="outline" className={`text-[10px] ${statusColors[w.status] || ""}`}>{w.status}</Badge>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="withdraw" className="mt-4">
                  <div className="max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                    <h2 className="mb-4 text-lg font-bold text-white">Pul yechish</h2>
                    <form onSubmit={handleWithdraw} className="grid gap-3">
                      <Input type="number" step="0.01" min="0.01" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Miqdor ($)" required className="border-white/10 bg-white/[0.06] text-white placeholder:text-muted-foreground focus:border-brand/50" />
                      <select value={withdrawMethod} onChange={(e) => setWithdrawMethod(e.target.value)}
                        className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white outline-none focus:border-brand/50">
                        <option value="bank_transfer">Bank o'tkazmasi</option>
                        <option value="payme">Payme</option>
                        <option value="click">Click</option>
                      </select>
                      <Input value={withdrawPhone} onChange={(e) => setWithdrawPhone(e.target.value)}
                        placeholder="Telefon raqami" className="border-white/10 bg-white/[0.06] text-white placeholder:text-muted-foreground focus:border-brand/50" />
                      <Button type="submit" disabled={withdrawBusy} className="w-full bg-brand text-[#07110f] hover:bg-brand/90 font-bold gap-2">
                        {withdrawBusy && <Loader2 size={16} className="animate-spin" />}
                        Pul yechish
                      </Button>
                    </form>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
