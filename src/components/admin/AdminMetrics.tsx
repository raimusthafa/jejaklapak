"use client";

import { Store, CheckCircle2, Clock, Radio } from "lucide-react";

export type MetricQuickFilter = "ALL" | "ACTIVE_SESSION" | "VERIFIED" | "PENDING";

interface AdminMetricsProps {
  totalCount: number;
  activeCount: number;
  pausedCount: number;
  verifiedCount: number;
  pendingCount: number;
  rejectedCount: number;
  activeQuickFilter: MetricQuickFilter;
  onSelectQuickFilter: (filter: MetricQuickFilter) => void;
}

export function AdminMetrics({
  totalCount,
  activeCount,
  pausedCount,
  verifiedCount,
  pendingCount,
  rejectedCount,
  activeQuickFilter,
  onSelectQuickFilter,
}: AdminMetricsProps) {
  const cards: Array<{
    key: MetricQuickFilter;
    label: string;
    value: number;
    hint: string;
    icon: typeof Store;
    valueClass: string;
    iconClass: string;
    activeRing: string;
  }> = [
    {
      key: "ALL",
      label: "Total Pedagang",
      value: totalCount,
      hint: `${rejectedCount} ditolak / nonaktif`,
      icon: Store,
      valueClass: "text-[#0d1c2e]",
      iconClass: "text-[#006194] bg-[#eff4ff] border-[#dce9ff]",
      activeRing: "border-[#006194] ring-1 ring-[#006194]",
    },
    {
      key: "ACTIVE_SESSION",
      label: "Sedang Berjualan",
      value: activeCount,
      hint: `${pausedCount} sedang istirahat`,
      icon: Radio,
      valueClass: "text-emerald-700",
      iconClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
      activeRing: "border-emerald-600 ring-1 ring-emerald-600",
    },
    {
      key: "VERIFIED",
      label: "Terverifikasi",
      value: verifiedCount,
      hint: "Tampil di peta eksplorasi publik",
      icon: CheckCircle2,
      valueClass: "text-[#0d1c2e]",
      iconClass: "text-[#006194] bg-[#eff4ff] border-[#dce9ff]",
      activeRing: "border-[#006194] ring-1 ring-[#006194]",
    },
    {
      key: "PENDING",
      label: "Menunggu Verifikasi",
      value: pendingCount,
      hint:
        pendingCount > 0
          ? "Perlu peninjauan & persetujuan admin"
          : "Semua pengajuan sudah ditinjau",
      icon: Clock,
      valueClass: pendingCount > 0 ? "text-amber-700" : "text-[#0d1c2e]",
      iconClass:
        pendingCount > 0
          ? "text-amber-700 bg-amber-50 border-amber-200"
          : "text-slate-600 bg-slate-50 border-slate-200",
      activeRing: "border-amber-600 ring-1 ring-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeQuickFilter === card.key;
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onSelectQuickFilter(card.key)}
            aria-pressed={isSelected}
            className={`text-left rounded-xl border bg-white p-4 sm:p-5 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006194] ${
              isSelected
                ? card.activeRing
                : "border-[#dce9ff] hover:border-[#93ccff]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#3f4850]">
                {card.label}
              </span>
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${card.iconClass}`}
              >
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p
              className={`mt-2 text-2xl font-bold tabular-nums tracking-tight ${card.valueClass}`}
            >
              {card.value}
            </p>
            <p className="mt-1 text-[11px] text-[#3f4850]">{card.hint}</p>
          </button>
        );
      })}
    </div>
  );
}

