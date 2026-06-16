"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Menu,
  LogOut,
  User,
  Package,
  Palette,
  ChevronDown,
  Bell,
  Heart,
  MessageSquare,
  FolderOpen,
  Wallet,
  Star,
  Settings,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navCategories = [
  "Design",
  "Development & IT",
  "Writing",
  "SEO",
  "Marketing",
  "Audio & Video",
  "Business",
];

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07110f]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-black text-white">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand text-sm font-black text-[#07110f]">
            K
          </span>
          <span className="text-lg">
            Kwork<span className="text-brand">forge</span>
          </span>
        </Link>

        <form
          className="hidden flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 md:flex"
          onSubmit={(e) => {
            e.preventDefault();
            if (search.trim()) {
              window.location.href = `/catalog?search=${encodeURIComponent(search.trim())}`;
            }
          }}
        >
          <Search size={16} className="text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Try "telegram bot" or "logo"'
          />
        </form>

        <nav className="hidden items-center gap-1.5 lg:flex">
          {user ? (
            <>
              <Link href="/orders">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white gap-1.5">
                  <Package size={14} /> Buyurtmalar
                </Button>
              </Link>
              <Link href="/chat">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white gap-1.5">
                  <MessageSquare size={14} /> Xabarlar
                </Button>
              </Link>
              <Link href="/studio">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white gap-1.5">
                  <Palette size={14} /> Studio
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:text-white cursor-pointer transition outline-none">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-brand text-[10px] font-bold text-[#07110f]">
                      {(user.username as string)?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {user.username as string}
                  <ChevronDown size={14} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 border-white/10 bg-[#101915]">
                  <DropdownMenuItem render={<Link href="/profile" className="cursor-pointer gap-2" />}>
                    <User size={15} /> Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/favorites" className="cursor-pointer gap-2" />}>
                    <Heart size={15} /> Sevimlilar
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/notifications" className="cursor-pointer gap-2" />}>
                    <Bell size={15} /> Bildirishnomalar
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/wallet" className="cursor-pointer gap-2" />}>
                    <Wallet size={15} /> Hamyon
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/offers" className="cursor-pointer gap-2" />}>
                    <Star size={15} /> Takliflar
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/projects" className="cursor-pointer gap-2" />}>
                    <FolderOpen size={15} /> Loyihalar
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/settings" className="cursor-pointer gap-2" />}>
                    <User size={15} /> Sozlamalar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="cursor-pointer gap-2 text-red-400">
                    <LogOut size={15} /> Chiqish
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/auth?mode=login">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                  Kirish
                </Button>
              </Link>
              <Link href="/auth?mode=signup">
                <Button size="sm" className="bg-brand text-[#07110f] hover:bg-brand/90">
                  Ro&apos;yxatdan o&apos;tish
                </Button>
              </Link>
            </>
          )}
        </nav>

        <Sheet>
          <SheetTrigger className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg text-white cursor-pointer hover:bg-white/10 transition outline-none">
            <Menu size={20} />
          </SheetTrigger>
          <SheetContent side="right" className="w-80 border-white/10 bg-[#0d1713] p-0">
            <div className="flex flex-col gap-2 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-lg font-black text-white">
                  Kwork<span className="text-brand">forge</span>
                </span>
              </div>
              <form
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (search.trim()) {
                    window.location.href = `/catalog?search=${encodeURIComponent(search.trim())}`;
                  }
                }}
              >
                <Search size={16} className="text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Qidirish..."
                />
              </form>
              <div className="mt-2 flex flex-col gap-1">
                {navCategories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/catalog?search=${encodeURIComponent(cat)}`}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-white/[0.06] hover:text-white"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
              <div className="mt-4 flex flex-col gap-1 border-t border-white/10 pt-4">
                {user ? (
                  <>
                    <Link href="/orders">
                      <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white gap-2">
                        <Package size={15} /> Buyurtmalar
                      </Button>
                    </Link>
                    <Link href="/chat">
                      <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white gap-2">
                        <MessageSquare size={15} /> Xabarlar
                      </Button>
                    </Link>
                    <Link href="/studio">
                      <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white gap-2">
                        <Palette size={15} /> Studio
                      </Button>
                    </Link>
                    <Link href="/favorites">
                      <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white gap-2">
                        <Heart size={15} /> Sevimlilar
                      </Button>
                    </Link>
                    <Link href="/notifications">
                      <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white gap-2">
                        <Bell size={15} /> Bildirishnomalar
                      </Button>
                    </Link>
                    <Link href="/wallet">
                      <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white gap-2">
                        <Wallet size={15} /> Hamyon
                      </Button>
                    </Link>
                    <Link href="/offers">
                      <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white gap-2">
                        <Star size={15} /> Takliflar
                      </Button>
                    </Link>
                    <Link href="/projects">
                      <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white gap-2">
                        <FolderOpen size={15} /> Loyihalar
                      </Button>
                    </Link>
                    <Link href="/profile">
                      <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white gap-2">
                        <User size={15} /> Profil
                      </Button>
                    </Link>
                    <Link href="/settings">
                      <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-white gap-2">
                        <Settings size={15} /> Sozlamalar
                      </Button>
                    </Link>
                    <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 gap-2" onClick={logout}>
                      <LogOut size={15} /> Chiqish
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth?mode=login" className="w-full">
                      <Button variant="ghost" className="w-full text-muted-foreground hover:text-white">Kirish</Button>
                    </Link>
                    <Link href="/auth?mode=signup" className="w-full">
                      <Button className="w-full bg-brand text-[#07110f] hover:bg-brand/90">Ro&apos;yxatdan o&apos;tish</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 lg:px-6">
        {navCategories.map((item) => (
          <Link
            key={item}
            href={`/catalog?search=${encodeURIComponent(item)}`}
            className="shrink-0 rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-brand/50 hover:text-brand"
          >
            {item}
          </Link>
        ))}
      </div>
    </header>
  );
}
