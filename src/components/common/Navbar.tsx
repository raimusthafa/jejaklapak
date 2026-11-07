"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Compass,
  LogOut,
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#dce9ff] bg-white/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center group">
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

        {/* Action Buttons Only */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href={currentUser.role === "ADMIN" ? "/admin/dashboard" : "/merchant/dashboard"}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff] hover:bg-[#dce9ff] transition"
              >
                <div className="h-7 w-7 rounded-lg bg-[#cce5ff] text-[#006194] flex items-center justify-center font-bold text-xs uppercase">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-[#0d1c2e] line-clamp-1 max-w-[120px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] font-medium text-[#006781] uppercase tracking-wider">
                    {currentUser.role === "ADMIN" ? "Admin" : "Dashboard"}
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#3f4850] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition border border-transparent"
                title="Keluar dari akun"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{isLoggingOut ? "Keluar..." : "Keluar"}</span>
              </button>

              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#006194] px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-[#007bb9]"
              >
                <Compass className="h-4 w-4" />
                <span>Buka Peta Live</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/merchant/login"
                className="inline-flex items-center justify-center rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-[#3f4850] hover:bg-[#eff4ff] hover:text-[#006194] transition border border-[#bfc7d2]/40"
              >
                Masuk Pedagang
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#006194] px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-[#007bb9]"
              >
                <Compass className="h-4 w-4" />
                <span>Buka Peta Live</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
