"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FolderOpen, Loader2, Plus, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { api } from "@/lib/api";

interface Project {
  id: string;
  title: string;
  description: string;
  budget: string;
  deadline?: string;
  status: string;
  bids_count?: number;
  created_at: string;
}

interface Bid {
  id: string;
  project_title?: string;
  amount: string;
  delivery_days: number;
  message: string;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  open: "border-green-400/30 bg-green-500/10 text-green-400",
  in_progress: "border-amber-400/30 bg-amber-500/10 text-amber-400",
  completed: "border-blue-400/30 bg-blue-500/10 text-blue-400",
  canceled: "border-red-400/30 bg-red-500/10 text-red-400",
  pending: "border-amber-400/30 bg-amber-500/10 text-amber-400",
  accepted: "border-green-400/30 bg-green-500/10 text-green-400",
  rejected: "border-red-400/30 bg-red-500/10 text-red-400",
  withdrawn: "border-muted-foreground/30 bg-muted/10 text-muted-foreground",
};

export default function ProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [myBids, setMyBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", budget: "", deadline: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([
      api.projects().catch(() => []),
      api.myBids().catch(() => []),
    ]).then(([p, b]) => {
      setProjects(Array.isArray(p) ? p : (p as Record<string, unknown>).results || []);
      setMyBids(Array.isArray(b) ? b : (b as Record<string, unknown>).results || []);
    }).finally(() => setLoading(false));
  }, []);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.createProject(form);
      toast("Loyiha yaratildi!", "success");
      setShowCreate(false);
      setForm({ title: "", description: "", budget: "", deadline: "" });
      const p = await api.projects();
      setProjects(Array.isArray(p) ? p : (p as Record<string, unknown>).results || []);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Xatolik", "error");
    } finally {
      setBusy(false);
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
            <FolderOpen size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Loyihalarni ko'rish uchun tizimga kiring.</p>
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
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-black text-white sm:text-4xl">Loyihalar</h1>
            <Button onClick={() => setShowCreate(!showCreate)} className="bg-brand text-[#07110f] hover:bg-brand/90 font-bold gap-2">
              <Plus size={16} /> Yangi loyiha
            </Button>
          </div>

          {showCreate && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="mb-3 text-lg font-bold text-white">Yangi loyiha yaratish</h2>
              <form onSubmit={createProject} className="grid gap-3">
                <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Loyiha nomi" className="border-white/10 bg-white/[0.06] text-white placeholder:text-muted-foreground focus:border-brand/50" />
                <Textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Batafsil tavsif" className="min-h-[80px] border-white/10 bg-white/[0.06] text-white placeholder:text-muted-foreground focus:border-brand/50" />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" step="0.01" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    placeholder="Byudjet ($)" className="border-white/10 bg-white/[0.06] text-white placeholder:text-muted-foreground focus:border-brand/50" />
                  <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="border-white/10 bg-white/[0.06] text-white placeholder:text-muted-foreground focus:border-brand/50" />
                </div>
                <Button type="submit" disabled={busy} className="bg-brand text-[#07110f] hover:bg-brand/90 font-bold gap-2">
                  {busy && <Loader2 size={16} className="animate-spin" />} Yaratish
                </Button>
              </form>
            </motion.div>
          )}

          {loading ? (
            <div className="grid place-items-center py-20"><Loader2 size={28} className="animate-spin text-brand" /></div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.length === 0 ? (
                <div className="col-span-2 grid place-items-center rounded-xl border border-white/10 bg-white/[0.02] py-20 text-center">
                  <FolderOpen size={48} className="mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Hali loyiha yo'q.</p>
                </div>
              ) : projects.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-white">{p.title}</h3>
                    <Badge variant="outline" className={`shrink-0 text-[10px] ${statusColors[p.status] || ""}`}>{p.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><DollarSign size={12} /> ${p.budget}</span>
                    {p.deadline && <span className="flex items-center gap-1"><Clock size={12} /> {new Date(p.deadline).toLocaleDateString("uz-UZ")}</span>}
                  </div>
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
