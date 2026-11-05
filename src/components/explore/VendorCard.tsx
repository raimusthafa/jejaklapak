"use client";

import { Merchant } from "@/types/merchant";
import { calculateFreshness } from "@/services/mock/merchantService";
import { Store, Navigation } from "lucide-react";

interface VendorCardProps {
  merchant: Merchant;
  isSelected: boolean;
  onSelect: () => void;
  onOpenDetails: () => void;
  distanceMeters?: number;
}

export function VendorCard({
  merchant,
  isSelected,
  onSelect,
  onOpenDetails,
  distanceMeters = 120,
}: VendorCardProps) {
  const freshness = calculateFreshness(merchant.location.capturedAt);
  const isMoving = (merchant.location.speedKmh ?? 0) > 1;
  const isLive = merchant.sellingStatus === "ACTIVE";
  const isPaused = merchant.sellingStatus === "PAUSED";

  // Price range estimate from menu
  const prices = merchant.menu.map((m) => m.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 10000;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 20000;
  const priceDisplay =
    minPrice === maxPrice
      ? `Rp ${(minPrice / 1000).toFixed(0)}.000 / porsi`
      : `Rp ${(minPrice / 1000).toFixed(0)}k - ${(maxPrice / 1000).toFixed(0)}k`;

  // Time elapsed hint
  const timeHint =
    freshness === "LIVE" ? "1m lalu" : freshness === "RECENT" ? "6m lalu" : "20m lalu";

  const distanceText =
    distanceMeters < 1000 ? `${distanceMeters}m` : `${(distanceMeters / 1000).toFixed(1)}km`;

  return (
    <article
      onClick={() => {
        onSelect();
        onOpenDetails();
      }}
      className={`p-3 rounded-xl transition-all cursor-pointer relative ${
        isSelected
          ? "bg-white shadow-md ring-2 ring-[#79d8fd] border-transparent"
          : "bg-white shadow-xs hover:shadow-sm border border-slate-200/80"
      }`}
    >
      {/* Top right status badge */}
      <div className="absolute top-3 right-3 flex items-center">
        {isLive && !isMoving && (
          <div className="flex items-center gap-1 bg-[#baeaff]/80 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#006781] animate-ping" />
            <span className="text-[10px] text-[#001f29] font-bold tracking-wide">
              LIVE
            </span>
          </div>
        )}

        {isLive && isMoving && (
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#d5e3fc] text-[#006194] font-bold tracking-wide">
            JALAN
          </span>
        )}

        {isPaused && (
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#ffdbca] text-[#994100] font-bold tracking-wide">
            STOP
          </span>
        )}

        {!isLive && !isPaused && (
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#e6eeff] text-[#3f4850] font-bold tracking-wide">
            STANDBY
          </span>
        )}
      </div>

      {/* Main Row */}
      <div className="flex items-start gap-2.5">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-lg bg-[#eff4ff] flex items-center justify-center shrink-0 text-2xl border border-[#d5e3fc]/60">
          <span>{merchant.iconEmoji || "🍲"}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 pr-14">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
            {merchant.name}
          </h2>
          <div className="flex items-center gap-1.5 mt-0.5 text-[#006781]">
            <span className="text-[11px] font-bold flex items-center gap-0.5">
              <Navigation className="h-3 w-3 rotate-45" />
              {distanceText}
            </span>
            <span className="text-slate-300 text-xs">•</span>
            <span className="text-[11px] text-slate-400 font-medium">
              {timeHint}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-box: Storefront address hint + price range */}
      <div className="mt-2.5 pt-1.5 flex items-center justify-between text-slate-600 bg-[#eff4ff]/60 px-2.5 py-1.5 rounded-lg border border-[#d5e3fc]/40">
        <div className="flex items-center gap-1.5 truncate text-[11px] font-medium text-slate-700 min-w-0">
          <Store className="h-3.5 w-3.5 text-[#006781] shrink-0" />
          <span className="truncate">{merchant.location.addressHint}</span>
        </div>
        <div className="text-[11px] font-bold text-slate-900 whitespace-nowrap ml-2 shrink-0">
          {priceDisplay}
        </div>
      </div>
    </article>
  );
}
