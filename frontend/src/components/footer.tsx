import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#07110f]">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-black text-white">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm font-black text-[#07110f]">
                K
              </span>
              Kwork<span className="text-brand">forge</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Freelance xizmatlar markazi. Minglab xizmatlar ichidan keraklisini toping.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-bold text-white">Xizmatlar</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/catalog" className="hover:text-brand transition">Barcha xizmatlar</Link></li>
              <li><Link href="/catalog?search=Design" className="hover:text-brand transition">Dizayn</Link></li>
              <li><Link href="/catalog?search=Development" className="hover:text-brand transition">Dasturlash</Link></li>
              <li><Link href="/catalog?search=Marketing" className="hover:text-brand transition">Marketing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-bold text-white">Sotuvchilar uchun</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/studio" className="hover:text-brand transition">Studio</Link></li>
              <li><Link href="/auth?mode=signup" className="hover:text-brand transition">Sotuvchi bo&apos;lish</Link></li>
              <li><Link href="/orders" className="hover:text-brand transition">Buyurtmalar</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-bold text-white">Yordam</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="hover:text-brand transition cursor-pointer">FAQ</span></li>
              <li><span className="hover:text-brand transition cursor-pointer">Qo&apos;llab-quvvatlash</span></li>
              <li><span className="hover:text-brand transition cursor-pointer">Maxfiylik siyosati</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-muted-foreground sm:flex-row">
          <span>&copy; {new Date().getFullYear()} Kworkforge. Barcha huquqlar himoyalangan.</span>
          <span className="flex items-center gap-1">
            <Heart size={12} className="text-red-400" /> O&apos;zbekiston bilan yaratilgan
          </span>
        </div>
      </div>
    </footer>
  );
}
