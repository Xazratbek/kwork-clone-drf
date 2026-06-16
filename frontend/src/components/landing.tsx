"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Search,
  BriefcaseBusiness,
  PackageCheck,
  Shield,
  Clock,
  Star,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { title: "SEO & Web Traffic", emoji: "🚀", color: "from-blue-500/10 to-blue-600/5", slug: "SEO" },
  { title: "Digital Marketing & SMM", emoji: "💌", color: "from-orange-500/10 to-orange-600/5", slug: "Marketing" },
  { title: "Development & IT", emoji: "💻", color: "from-green-500/10 to-green-600/5", slug: "Development" },
  { title: "Design", emoji: "🎨", color: "from-pink-500/10 to-pink-600/5", slug: "Design" },
  { title: "Business & Lifestyle", emoji: "📊", color: "from-amber-500/10 to-amber-600/5", slug: "Business" },
  { title: "Writing & Translations", emoji: "📝", color: "from-teal-500/10 to-teal-600/5", slug: "Writing" },
  { title: "Audio & Video", emoji: "🎧", color: "from-cyan-500/10 to-cyan-600/5", slug: "Audio" },
];

const steps = [
  { Icon: Search, title: "Toping", desc: "Kerakli xizmatni kategoriya, narx va yetkazish muddati bo'yicha qidirib toping." },
  { Icon: BriefcaseBusiness, title: "Buyurtma bering", desc: "Kwork sahifasidan talablaringizni yozib, xavfsiz buyurtma bering." },
  { Icon: PackageCheck, title: "Natijani oling", desc: "Sotuvchi ishni bajaradi, siz tekshirib qabul qilasiz." },
];

const stats = [
  { value: "10,000+", label: "Xizmatlar" },
  { value: "5,000+", label: "Sotuvchilar" },
  { value: "25,000+", label: "Buyurtmalar" },
  { value: "4.8", label: "O'rtacha baho" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute -right-32 top-20 h-[400px] w-[400px] rounded-full bg-orange-500/10 blur-[100px]" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-6 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand">
              <Sparkles size={12} /> O&apos;zbekistondagi #1 freelance platforma
            </div>
            <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Freelance xizmatlarni
              <span className="text-brand"> tez top</span>,
              <br />buyurtma ber, natijani kuzat.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground lg:text-lg">
              Minglab freelance xizmatlari ichidan keraklisini tanlang, xavfsiz buyurtma bering va ish jarayonini bir joyda kuzating.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/catalog">
                <Button size="lg" className="bg-brand text-[#07110f] hover:bg-brand/90 gap-2 font-bold">
                  Xizmatlarni ko&apos;rish <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/auth?mode=signup">
                <Button size="lg" variant="outline" className="border-white/15 text-white hover:bg-white/5 hover:text-white gap-2 font-bold">
                  Sotuvchi bo&apos;lish
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Shield size={14} className="text-brand" /> Xavfsiz to&apos;lov</span>
              <span className="flex items-center gap-1.5"><Clock size={14} className="text-brand" /> Tez yetkazish</span>
              <span className="flex items-center gap-1.5"><Star size={14} className="text-brand" /> Sifat kafolati</span>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="relative hidden lg:block"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
                <Search size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">logo design, web app, bot...</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { title: "Telegram bot yaratish", price: "$50", days: "3 kun", img: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=400&h=200&fit=crop" },
                  { title: "Logo dizayn", price: "$25", days: "2 kun", img: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=200&fit=crop" },
                  { title: "Veb-sayt yaratish", price: "$120", days: "7 kun", img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=200&fit=crop" },
                  { title: "SEO optimizatsiya", price: "$40", days: "5 kun", img: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&h=200&fit=crop" },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-white/20"
                  >
                    <div className="relative h-24 overflow-hidden">
                      <img src={item.img} alt={item.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-white line-clamp-1">{item.title}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{item.days}</span>
                        <span className="text-sm font-bold text-brand">{item.price}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function LandingCategories() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-white sm:text-4xl">Kategoriyalar</h2>
            <p className="mt-2 text-muted-foreground">O&apos;z sohangizga mos xizmatlarni toping</p>
          </div>
          <Link href="/catalog">
            <Button variant="outline" size="sm" className="border-white/15 text-white hover:bg-white/5 hover:text-white gap-2 font-bold">
              Barchasi <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/catalog?search=${encodeURIComponent(cat.slug)}`}
                className={`group flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-br ${cat.color} p-6 text-center transition hover:-translate-y-1 hover:border-white/20 hover:shadow-xl hover:shadow-black/20`}
              >
                <span className="text-5xl drop-shadow-lg transition group-hover:scale-110">{cat.emoji}</span>
                <span className="text-sm font-bold text-white">{cat.title}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingHowItWorks() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-black text-white sm:text-4xl">Qanday ishlaydi?</h2>
          <p className="mt-2 text-muted-foreground">3 oddiy qadamda xizmatni buyurtma bering</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center"
            >
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-brand">
                <step.Icon size={24} />
              </div>
              <div className="mb-2 text-xs font-bold text-brand">Qadam {i + 1}</div>
              <h3 className="text-lg font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingStats() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center"
            >
              <div className="text-3xl font-black text-brand sm:text-4xl">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingCTA() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-brand/20 bg-gradient-to-br from-brand/10 via-brand/5 to-transparent p-8 text-center sm:p-12"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-brand/10 blur-[80px]" />
          <h2 className="relative text-3xl font-black text-white sm:text-4xl">
            Sotuvchi bo&apos;lib daromad topishni boshlang
          </h2>
          <p className="relative mx-auto mt-3 max-w-lg text-muted-foreground">
            O&apos;z xizmatlaringizni joylashtiring, buyurtmalar qabul qiling va professional sotuvchi sifatida rivojlaning.
          </p>
          <div className="relative mt-6 flex justify-center gap-3">
            <Link href="/auth?mode=signup">
              <Button size="lg" className="bg-brand text-[#07110f] hover:bg-brand/90 font-bold gap-2">
                Hoziroq boshlang <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
