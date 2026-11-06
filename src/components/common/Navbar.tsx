"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  MapPin,
  Menu,
  X,
  Store,
  ShieldCheck,
  Compass,
  LogOut,
  Calendar,
  User as UserIcon,
  UtensilsCrossed,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logoutAction } from "@/actions/auth";

interface AuthUserData {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "MERCHANT" | "ADMIN";
  merchantName?: string;
  merchantSlug?: string;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUserData | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    const loadUser = () => {
      fetch("/api/auth/me")
        .then((res) => (res.ok ? res.json() : { user: null }))
        .then((json) => {
          if (isMounted) {
            setCurrentUser(json.user || null);
          }
        })
        .catch(() => {
          if (isMounted) {
            setCurrentUser(null);
          }
        });
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutAction();
      setCurrentUser(null);
      router.push("/merchant/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
      setMobileMenuOpen(false);
    }
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

  // Nav links dinamis berdasarkan autentikasi dan role
  const navLinks = [
    { href: "/explore", label: "Peta Eksplorasi", icon: Compass },
    ...(currentUser?.role === "MERCHANT"
      ? [
          { href: "/merchant/dashboard", label: "Dashboard Lapak", icon: Store },
          { href: "/merchant/menu", label: "Menu", icon: UtensilsCrossed },
          { href: "/merchant/profile", label: "Profil", icon: UserIcon },
          { href: "/merchant/schedule", label: "Jadwal", icon: Calendar },
        ]
      : []),
    ...(currentUser?.role === "ADMIN"
      ? [{ href: "/admin/dashboard", label: "Panel Admin", icon: ShieldCheck }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-sm transition-transform group-hover:scale-105">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-slate-900">
                JejakLapak
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                Bandung Raya
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-slate-100 text-slate-900 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? "text-emerald-700" : "text-slate-400"
                  }`}
                />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop User Section */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[120px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] font-medium text-emerald-700 uppercase tracking-wider">
                    {currentUser.role === "ADMIN" ? "Admin Platform" : "Pedagang"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition border border-transparent hover:border-rose-100"
                title="Keluar dari akun"
              >
                <LogOut className="h-3.5 w-3.5" />
                {isLoggingOut ? "Keluar..." : "Keluar"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/merchant/login"
                className="inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                Masuk Pedagang
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
              >
                Buka Peta Live
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus:outline-none"
          aria-expanded={mobileMenuOpen}
          aria-label="Buka menu navigasi"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 pt-2 pb-5 md:hidden space-y-1">
          {currentUser && (
            <div className="p-3 mb-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm uppercase">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[10px] text-emerald-700 uppercase font-semibold">
                    {currentUser.role === "ADMIN" ? "Admin Platform" : "Pedagang"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="p-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1 font-semibold"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          )}

          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-base font-medium rounded-lg ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800 font-semibold"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? "text-emerald-700" : "text-slate-400"
                  }`}
                />
                {link.label}
              </Link>
            );
          })}

          {!currentUser && (
            <div className="pt-3 border-t border-slate-100 mt-2 space-y-2">
              <Link
                href="/merchant/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center rounded-lg border border-slate-200 py-2.5 text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Masuk Pedagang
              </Link>
              <Link
                href="/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center rounded-lg bg-emerald-700 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-emerald-800"
              >
                Buka Peta Live
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
