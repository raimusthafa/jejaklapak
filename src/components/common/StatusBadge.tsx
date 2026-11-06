"use client";

import { useState, useEffect } from "react";
import { PauseCircle, StopCircle, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateFreshness } from "@/services/mock/merchantService";

export type SellingStatus = "ACTIVE" | "PAUSED" | "ENDED";
export type FreshnessStatus = "LIVE" | "RECENT" | "STALE";

interface StatusBadgeProps {
  status: SellingStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  if (status === "ACTIVE") {
    return (
      <span
        suppressHydrationWarning
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200",
          className
        )}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
        </span>
        Sedang Berjualan
      </span>
    );
  }

  if (status === "PAUSED") {
    return (
      <span
        suppressHydrationWarning
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200",
          className
        )}
      >
        <PauseCircle className="h-3.5 w-3.5 text-amber-600" />
        Sedang Istirahat
      </span>
    );
  }

  return (
    <span
      suppressHydrationWarning
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200",
        className
      )}
    >
      <StopCircle className="h-3.5 w-3.5 text-slate-400" />
      Sesi Berakhir
    </span>
  );
}

interface FreshnessBadgeProps {
  freshness?: FreshnessStatus;
  capturedAt?: string;
  className?: string;
}

export function FreshnessBadge({
  freshness: initialFreshness = "LIVE",
  capturedAt,
  className,
}: FreshnessBadgeProps) {
  const [currentTimestamp, setCurrentTimestamp] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentTimestamp(Date.now());
    }, 0);
    const id = setInterval(() => {
      setCurrentTimestamp(Date.now());
    }, 30000);
    return () => {
      clearTimeout(timer);
      clearInterval(id);
    };
  }, []);

  // During SSR and initial client hydration, strictly use initialFreshness
  // Once mounted on client, calculate live freshness based on current time
  const activeFreshness: FreshnessStatus =
    currentTimestamp !== null && capturedAt
      ? calculateFreshness(capturedAt, currentTimestamp)
      : initialFreshness;

  if (activeFreshness === "LIVE") {
    return (
      <span
        suppressHydrationWarning
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200",
          className
        )}
        title={capturedAt ? `Diperbarui pada ${capturedAt}` : undefined}
      >
        <Clock className="h-3 w-3 text-emerald-600" />
        Lokasi Terkini (&lt; 2 mnt)
      </span>
    );
  }

  if (activeFreshness === "RECENT") {
    return (
      <span
        suppressHydrationWarning
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200",
          className
        )}
        title={capturedAt ? `Diperbarui pada ${capturedAt}` : undefined}
      >
        <Clock className="h-3 w-3 text-blue-500" />
        Baru Diperbarui (2-15 mnt)
      </span>
    );
  }

  return (
    <span
      suppressHydrationWarning
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200",
        className
      )}
      title="Posisi gerobak mungkin sudah berpindah karena pembaruan lokasi melebihi 15 menit."
    >
      <AlertTriangle className="h-3 w-3 text-rose-500" />
      Lokasi Kedaluwarsa (&gt; 15 mnt)
    </span>
  );
}

