"use client";

import Link from "next/link";
import { Merchant } from "@/types/merchant";
import { calculateFreshness } from "@/services/mock/merchantService";
import {
  X,
  MapPin,
  MessageCircle,
  Navigation,
  Calendar,
  ExternalLink,
  BellRing,
  Star,
  CheckCircle2,
  Gauge,
  Compass,
} from "lucide-react";

interface VendorDetailContentProps {
  merchant: Merchant;
  onClose: () => void;
  onCallVendor: (merchant: Merchant) => void;
  followCamera: boolean;
  onToggleFollowCamera: () => void;
  userDistanceMeters?: number;
}

export function VendorDetailContent({
  merchant,
  onClose,
  onCallVendor,
  followCamera,
  onToggleFollowCamera,
  userDistanceMeters = 120,
}: VendorDetailContentProps) {
  const freshness = calculateFreshness(merchant.location.capturedAt);
  const isMoving = (merchant.location.speedKmh ?? 0) > 1;
  const isLive = merchant.sellingStatus === "ACTIVE";

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${merchant.location.latitude},${merchant.location.longitude}`;
  const whatsappUrl = `https://wa.me/62${merchant.phone.replace(/^0/, "")}?text=${encodeURIComponent(
    `Halo ${merchant.ownerName}, saya melihat gerobak ${merchant.name} di JejakLapak. Apakah sedang berada di ${merchant.location.addressHint}?`
  )}`;

  // Menu price range calculation
  const prices = merchant.menu.map((m) => m.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 10000;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 20000;
  const priceDisplay =
    minPrice === maxPrice
      ? `Rp ${(minPrice / 1000).toFixed(0)}k`
      : `${(minPrice / 1000).toFixed(0)}k-${(maxPrice / 1000).toFixed(0)}k`;

  // Total estimated portions
  const totalPortions = Math.max(18, merchant.menu.length * 12);

  // Formatted distance display
  const distanceText =
    userDistanceMeters < 1000
      ? `${userDistanceMeters}m Dari Anda`
      : `${(userDistanceMeters / 1000).toFixed(1)}km Dari Anda`;

  // Tracker Code
  const cleanId = merchant.id.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase();
  const trackerCode = `BDG-${cleanId || "402"}`;

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* ── Top Header ── */}
      <div className="p-3.5 sm:p-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {isLive ? (
            <span className="px-2 py-0.5 rounded-full bg-[#baeaff] text-[#001f29] text-[11px] font-bold flex items-center gap-1 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006781] animate-ping" />
              {isMoving ? "LIVE BERGERAK" : "LIVE MANGKAL"}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold tracking-wide">
              {merchant.sellingStatus === "PAUSED" ? "ISTIRAHAT" : "STANDBY"}
            </span>
          )}

          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#eff4ff] text-[#006194] flex items-center gap-0.5">
            <CheckCircle2 className="h-3 w-3 text-[#006194]" />
            Terverifikasi
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          title="Tutup Detail"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Cover Photo with Category Overlay */}
        <div className="flex flex-col gap-2.5">
          <div className="relative w-full h-36 rounded-xl overflow-hidden shadow-sm bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                merchant.image ||
                "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80"
              }
              alt={merchant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
              <div>
                <span className="px-2 py-0.5 rounded bg-[#006194] text-white text-[11px] font-semibold shadow-xs">
                  {merchant.category} • Binaan Bandung
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl">{merchant.iconEmoji || "🍲"}</span>
              <h2 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight leading-snug">
                {merchant.name}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              {merchant.tagline || merchant.description}
            </p>

            <div className="flex items-center gap-2.5 mt-2 text-xs">
              <span className="font-bold text-[#006781] flex items-center gap-1">
                <Navigation className="h-3.5 w-3.5 rotate-45" />
                {distanceText}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <Gauge className="h-3.5 w-3.5 text-slate-400" />
                {isMoving
                  ? `${merchant.location.speedKmh?.toFixed(1) || "3.5"} km/j (Mendorong)`
                  : "Mangkal di Lokasi"}
              </span>
            </div>
          </div>
        </div>

        {/* Location Telemetry Callout Card */}
        <div className="p-3 rounded-xl bg-[#eff4ff] flex items-start gap-2.5 border border-[#d5e3fc]/70">
          <div className="w-8 h-8 rounded-lg bg-[#cce5ff] flex items-center justify-center shrink-0 text-[#006194]">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-xs text-slate-900 truncate">
              {merchant.location.addressHint}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {freshness === "LIVE" ? "Diperbarui 45 dtk lalu" : "Diperbarui beberapa menit lalu"}{" "}
              via GPS Tracker Lapak #{trackerCode}
            </div>
          </div>
        </div>

        {/* 3 Quick Metrics Bento Strip */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-lg bg-[#eff4ff] text-center flex flex-col items-center justify-center border border-[#d5e3fc]/60">
            <span className="font-bold text-base text-[#006194] leading-tight">
              {totalPortions}
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">
              Porsi Siap Saji
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#eff4ff] text-center flex flex-col items-center justify-center border border-[#d5e3fc]/60">
            <div className="flex items-center gap-0.5 text-[#994100] font-bold text-base leading-tight">
              <span>4.8</span>
              <Star className="h-3.5 w-3.5 fill-[#994100]" />
            </div>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">
              120+ Ulasan
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#eff4ff] text-center flex flex-col items-center justify-center border border-[#d5e3fc]/60">
            <span className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
              {priceDisplay}
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">
              Ramah Kantong
            </span>
          </div>
        </div>

        {/* 3 Quick Action Interactive Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {/* Arahkan */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-1 rounded-lg bg-[#006194] text-white flex flex-col items-center justify-center gap-1 shadow-xs hover:bg-[#007bb9] transition-all text-center"
          >
            <Navigation className="h-4 w-4" />
            <span className="text-[11px] font-bold">Arahkan</span>
          </a>

          {/* Panggil */}
          <button
            type="button"
            onClick={() => onCallVendor(merchant)}
            className="py-2 px-1 rounded-lg bg-[#eff4ff] text-[#0d1c2e] flex flex-col items-center justify-center gap-1 hover:bg-[#dce9ff] transition-all border border-[#d5e3fc]"
          >
            <BellRing className="h-4 w-4 text-[#006781]" />
            <span className="text-[11px] font-bold">Panggil</span>
          </button>

          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-1 rounded-lg bg-[#eff4ff] text-[#0d1c2e] flex flex-col items-center justify-center gap-1 hover:bg-[#dce9ff] transition-all border border-[#d5e3fc]"
          >
            <MessageCircle className="h-4 w-4 text-[#994100]" />
            <span className="text-[11px] font-bold">WhatsApp</span>
          </a>
        </div>

        {/* Camera Follow Toggle */}
        <button
          type="button"
          onClick={onToggleFollowCamera}
          className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold border transition ${
            followCamera
              ? "bg-[#ffdbca]/70 text-[#994100] border-[#ffb690]"
              : "bg-[#eff4ff] text-[#006194] border-[#d5e3fc] hover:bg-[#dce9ff]"
          }`}
        >
          <Compass className="h-3.5 w-3.5" />
          <span>{followCamera ? "Mode Kunci Kamera Aktif" : "Kunci Kamera ke Gerobak Ini"}</span>
        </button>

        {/* Menu Favorit List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Menu Favorit
            </h3>
            <span className="text-[11px] font-semibold text-[#006781]">
              Tersedia Sekarang
            </span>
          </div>

          <div className="space-y-1.5">
            {merchant.menu.map((item, idx) => (
              <div
                key={item.id}
                className="p-2.5 rounded-lg bg-[#eff4ff] flex items-center justify-between border border-[#d5e3fc]/50"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="w-2 h-2 rounded-full bg-[#006781] shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-slate-900 truncate">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {item.description || (item.isPopular ? "Menu paling laris & rekomendasi" : "Olahan khas autentik")}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-xs text-[#006194]">
                    Rp {item.price.toLocaleString("id-ID")}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Sisa {Math.max(10, 25 - idx * 6)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Route & Schedule Briefing */}
        <div className="p-3 rounded-xl bg-[#eff4ff] space-y-1.5 border border-[#d5e3fc]">
          <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#006194]" />
            Rutinitas {merchant.ownerName}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Berjualan rutin setiap hari operasional di area{" "}
            <strong>{merchant.operatingArea || merchant.location.addressHint}</strong>. Jam operasional pukul 09:00 - 18:00 WIB.
          </p>
        </div>
      </div>

      {/* ── Sticky Footer CTA ── */}
      <div className="p-3.5 sm:p-4 bg-white border-t border-slate-100 flex flex-col gap-2 shrink-0">
        <Link
          href={`/merchant/${merchant.slug}`}
          className="w-full py-2.5 rounded-lg bg-[#006194] text-white text-xs font-bold text-center flex items-center justify-center gap-1 hover:bg-[#007bb9] transition-all shadow-xs"
        >
          Lihat Profil Lengkap & Jadwal Mingguan
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

