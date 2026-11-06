"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Store,
  Calendar,
  ExternalLink,
  Compass,
  LogOut,
  PanelLeftClose,
  X,
  MapPin,
  Pause,
  Power,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { SellingStatus } from "@/types/merchant";
import { AuthUser } from "@/server/auth";

interface MerchantSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user?: AuthUser;
  merchantName?: string;
  merchantSlug?: string;
  iconEmoji?: string;
  sellingStatus?: SellingStatus;
  trackerCode?: string;
}

export function MerchantSidebar({
  isOpen,
  onClose,
  user,
  merchantName = "Lapak Pedagang",
  merchantSlug,
  iconEmoji = "🍲",
  sellingStatus = "ACTIVE",
  trackerCode = "BDG-0100",
}: MerchantSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (!confirm("Apakah Anda yakin ingin keluar dari akun pedagang?")) return;
    setIsLoggingOut(true);
    try {
      await logoutAction();
      router.push("/merchant/login");
    } catch (err) {
      console.error("Gagal logout:", err);
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    {
      href: "/merchant/dashboard",
      label: "Dashboard Lapak",
      icon: LayoutDashboard,
      badge: sellingStatus === "ACTIVE" ? "Live" : undefined,
    },
    {
      href: "/merchant/menu",
      label: "Kelola Menu & Stok",
      icon: UtensilsCrossed,
    },
    {
      href: "/merchant/profile",
      label: "Profil Usaha",
      icon: Store,
    },
    {
      href: "/merchant/schedule",
      label: "Jadwal Operasional",
      icon: Calendar,
    },
  ];

  const quickLinks = [
    ...(merchantSlug
      ? [
          {
            href: `/merchant/${merchantSlug}`,
            label: "Lihat Lapak Publik",
            icon: ExternalLink,
            isExternal: true,
          },
        ]
      : []),
    {
      href: "/explore",
      label: "Peta Eksplorasi",
      icon: Compass,
      isExternal: false,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-white border-r border-slate-200/90 shadow-sm flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 ${
          isOpen
            ? "w-72 translate-x-0"
            : "-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-none"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* 1. Header Sidebar */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <Link
              href="/merchant/dashboard"
              className="flex items-center gap-2.5 group"
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-[#60C1E5] text-slate-900 flex items-center justify-center font-black shadow-xs group-hover:scale-105 transition-transform">
                <MapPin className="h-4 w-4 text-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-slate-900">JejakLapak</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#e6f6fc] text-[#0284c7]">
                    Mitra
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Area Pedagang</p>
              </div>
            </Link>

            {/* Close Toggle Button */}
            <button
              type="button"
              onClick={onClose}
              title="Tutup Menu Sidebar"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <PanelLeftClose className="h-4 w-4 hidden lg:block" />
              <X className="h-4 w-4 lg:hidden" />
            </button>
          </div>

          {/* 2. Mini Lapak Card */}
          <div className="p-4 mx-3 my-3 rounded-2xl bg-[#f4f8fb] border border-slate-200/70 space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-1 bg-white rounded-xl shadow-xs border border-slate-100">
                {iconEmoji}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-xs font-bold text-slate-900 truncate">{merchantName}</h2>
                <p className="text-[11px] text-slate-500 font-medium">#{trackerCode}</p>
              </div>
            </div>

            {/* Status Live Pill */}
            <div className="pt-1 border-t border-slate-200/50 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Status Lapak
              </span>
              <div className="flex items-center gap-1.5">
                {sellingStatus === "ACTIVE" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Aktif
                  </span>
                ) : sellingStatus === "PAUSED" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    <Pause className="h-2.5 w-2.5" />
                    Istirahat
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                    <Power className="h-2.5 w-2.5" />
                    Tutup
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 3. Navigation Links */}
          <div className="px-3 py-2 space-y-6 flex-1">
            {/* Group: Menu Utama */}
            <div className="space-y-1">
              <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Menu Utama
              </div>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#e6f6fc] text-[#0284c7] font-bold shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? "text-[#0284c7]" : "text-slate-400"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Group: Link Cepat & Publik */}
            <div className="space-y-1">
              <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Akses Publik
              </div>
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={item.isExternal ? "_blank" : undefined}
                    rel={item.isExternal ? "noopener noreferrer" : undefined}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                      <span>{item.label}</span>
                    </div>
                    {item.isExternal && (
                      <span className="text-[10px] text-slate-400 font-normal">Baru ↗</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 4. Footer User Info & Logout */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/70 space-y-2">
            <div className="flex items-center gap-2.5 px-2 py-1">
              <div className="w-8 h-8 rounded-xl bg-[#60C1E5] text-slate-900 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                {(user?.name || merchantName).charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {user?.name || "Pemilik Lapak"}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || "pedagang@jejaklapak.id"}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{isLoggingOut ? "Sedang Keluar..." : "Keluar dari Lapak"}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

