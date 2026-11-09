"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Compass,
  Menu,
  X,
  House,
  Info,
  CircleHelp,
  Store,
  LayoutDashboard,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";

interface AuthUserData {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "MERCHANT" | "ADMIN";
  merchantName?: string;
  merchantSlug?: string;
}

const NAV_ITEMS = [
  { label: "Beranda", href: "/#beranda", icon: House },
  { label: "Tentang Kami", href: "/#tentang-kami", icon: Info },
  { label: "Cara Kerja", href: "/#cara-kerja", icon: CircleHelp },
  { label: "Untuk Pedagang UMKM", short: "Untuk Pedagang", href: "/#untuk-pedagang", icon: Store },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUserData | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let activeController: AbortController | null = null;
    const supabase = createClient();

    const loadUser = () => {
      activeController?.abort();
      const controller = new AbortController();
      activeController = controller;

      fetch("/api/auth/me", { cache: "no-store", signal: controller.signal })
        .then((res) => (res.ok ? res.json() : { user: null }))
        .then((json) => {
          if (isMounted) {
            setCurrentUser(json.user || null);
          }
        })
        .catch((err) => {
          if (err instanceof Error && err.name === "AbortError") {
            return;
          }
          if (isMounted) {
            setCurrentUser(null);
          }
        });
    };

    loadUser();

    const handleAuthChanged = () => {
      loadUser();
    };

    window.addEventListener("jejaklapak-auth-changed", handleAuthChanged);
    window.addEventListener("focus", handleAuthChanged);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "INITIAL_SESSION") {
        return;
      }
      if (event === "SIGNED_OUT" && isMounted) {
        setCurrentUser(null);
      }
      loadUser();
    });

    return () => {
      isMounted = false;
      activeController?.abort();
      window.removeEventListener("jejaklapak-auth-changed", handleAuthChanged);
      window.removeEventListener("focus", handleAuthChanged);
      subscription.unsubscribe();
    };
  }, [pathname]);

  const goTo = (href: string) => {
    setMenuOpen(false);
    window.setTimeout(() => router.push(href), 200);
  };

  // Jangan render navbar pada area dashboard pedagang karena sepenuhnya menggunakan sidebar
  const isMerchantDashboardPage =
    pathname.startsWith("/merchant/dashboard") ||
    pathname.startsWith("/merchant/menu") ||
    pathname.startsWith("/merchant/profile") ||
    pathname.startsWith("/merchant/schedule");

  if (isMerchantDashboardPage) {
    return null;
  }

  const dashboardHref =
    currentUser?.role === "ADMIN" ? "/admin/dashboard" : "/merchant/dashboard";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#dce9ff] bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8 lg:grid lg:grid-cols-[auto_1fr_auto]">
        {/* Brand */}
        <Link href="/" className="flex items-center group shrink-0 lg:justify-self-start">
          <Image
            src="/logo.png"
            alt="JejakLapak"
            width={145}
            height={36}
            style={{ width: "auto" }}
            className="h-8 sm:h-9 object-contain transition-transform group-hover:scale-[1.02]"
            priority
          />
        </Link>

        {/* Menu desktop */}
        <nav className="hidden md:flex items-center gap-1 ml-4 lg:ml-0 lg:gap-2 lg:justify-self-center">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#3f4850] hover:bg-[#eff4ff] hover:text-[#006194] transition-colors"
            >
              {"short" in item ? item.short : item.label}
            </Link>
          ))}
        </nav>

        {/* Aksi */}
        <div className="ml-auto lg:ml-0 flex items-center gap-2 lg:justify-self-end">
          {currentUser ? (
            <Link
              href={dashboardHref}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff] hover:bg-[#dce9ff] transition"
            >
              <div className="h-7 w-7 rounded-lg bg-[#cce5ff] text-[#006194] flex items-center justify-center font-bold text-xs uppercase">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-xs font-bold text-[#0d1c2e] line-clamp-1 max-w-[120px]">
                  {currentUser.name}
                </span>
                <span className="text-[10px] font-medium text-[#006781] uppercase tracking-wider">
                  {currentUser.role === "ADMIN" ? "Admin" : "Dashboard"}
                </span>
              </div>
            </Link>
          ) : (
            <Link
              href="/merchant/login"
              className="hidden sm:inline-flex h-10 items-center justify-center rounded-lg border border-[#bfc7d2]/40 px-4 text-sm font-medium text-[#3f4850] hover:bg-[#eff4ff] hover:text-[#006194] transition-colors"
            >
              Masuk Pedagang
            </Link>
          )}

          <Link
            href="/explore"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#006194] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#007bb9] active:scale-[0.98]"
          >
            <Compass className="h-4 w-4" />
            <span className="sm:hidden">Peta Live</span>
            <span className="hidden sm:inline">Buka Peta Live</span>
          </Link>

          {/* Tombol menu (mobile) */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Buka menu"
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#bfc7d2]/40 text-[#0d1c2e] hover:bg-[#eff4ff] transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Menu mobile: turun dari atas */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="top"
          showCloseButton={false}
          className="md:hidden gap-0 p-0 bg-white rounded-b-2xl border-[#dce9ff] shadow-xl"
        >
          <SheetTitle className="sr-only">Menu navigasi</SheetTitle>
          <SheetDescription className="sr-only">
            Tautan ke bagian-bagian JejakLapak
          </SheetDescription>

          <div className="flex h-16 items-center justify-between px-4 border-b border-[#dce9ff]">
            <Image
              src="/logo.png"
              alt="JejakLapak"
              width={145}
              height={36}
              style={{ width: "auto" }}
              className="h-8 object-contain"
            />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Tutup menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[#0d1c2e] hover:bg-[#eff4ff] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-col p-3">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(href);
                }}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-semibold text-[#0d1c2e] hover:bg-[#eff4ff] transition-colors"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e6eeff] text-[#006194]">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-2 border-t border-[#dce9ff] p-4">
            <Link
              href="/explore"
              onClick={(e) => {
                e.preventDefault();
                goTo("/explore");
              }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#006194] text-sm font-semibold text-white hover:bg-[#007bb9] transition-colors"
            >
              <Compass className="h-4 w-4" />
              Buka Peta Live
            </Link>

            {currentUser ? (
              <Link
                href={dashboardHref}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(dashboardHref);
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#bfc7d2]/60 text-sm font-semibold text-[#0d1c2e] hover:bg-[#eff4ff] transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-[#006194]" />
                {currentUser.role === "ADMIN" ? "Dashboard Admin" : "Dashboard Pedagang"}
              </Link>
            ) : (
              <Link
                href="/merchant/login"
                onClick={(e) => {
                  e.preventDefault();
                  goTo("/merchant/login");
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#bfc7d2]/60 text-sm font-semibold text-[#0d1c2e] hover:bg-[#eff4ff] transition-colors"
              >
                <Store className="h-4 w-4 text-[#006194]" />
                Masuk Pedagang
              </Link>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}