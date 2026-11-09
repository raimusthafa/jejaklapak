"use client";

import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Power,
  PauseCircle,
  Loader2,
} from "lucide-react";
import type {
  AdminMerchantRecord,
  SellingStatus,
  VerificationStatus,
} from "@/types/merchant";

interface AdminMerchantModerationControlsProps {
  merchant: AdminMerchantRecord;
  isActionPending: boolean;
  onUpdateVerification: (id: string, status: VerificationStatus) => void;
  onUpdateSession: (id: string, status: SellingStatus) => void;
}

export function AdminMerchantModerationControls({
  merchant,
  isActionPending,
  onUpdateVerification,
  onUpdateSession,
}: AdminMerchantModerationControlsProps) {
  return (
    <section className="rounded-xl border border-[#dce9ff] bg-[#f8f9ff] p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-bold text-[#0d1c2e]">
          Kontrol Moderasi &amp; Sesi
        </h3>
        {isActionPending && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#006194]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Menyimpan...
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-[#3f4850]">
            Status Verifikasi Lapak
          </p>
          <div className="flex flex-wrap gap-2">
            {merchant.verificationStatus !== "VERIFIED" && (
              <button
                type="button"
                disabled={isActionPending}
                onClick={() => onUpdateVerification(merchant.id, "VERIFIED")}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#006194] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#004b73] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006194] focus-visible:ring-offset-1 transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Setujui (ACC)
              </button>
            )}
            {merchant.verificationStatus !== "PENDING" && (
              <button
                type="button"
                disabled={isActionPending}
                onClick={() => onUpdateVerification(merchant.id, "PENDING")}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-1 transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Tandai Menunggu
              </button>
            )}
            {merchant.verificationStatus !== "REJECTED" && (
              <button
                type="button"
                disabled={isActionPending}
                onClick={() => onUpdateVerification(merchant.id, "REJECTED")}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-1 transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                <XCircle className="h-3.5 w-3.5" /> Tolak
              </button>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-[#dce9ff] md:pt-0 md:border-t-0 md:border-l md:pl-4 space-y-2">
          <p className="text-[11px] font-medium text-[#3f4850]">
            Kontrol Sesi Berjualan
          </p>
          <div className="flex flex-wrap gap-2">
            {merchant.sellingStatus !== "ACTIVE" && (
              <button
                type="button"
                disabled={
                  isActionPending ||
                  merchant.verificationStatus === "REJECTED"
                }
                onClick={() => onUpdateSession(merchant.id, "ACTIVE")}
                title={
                  merchant.verificationStatus === "REJECTED"
                    ? "Verifikasi lapak terlebih dahulu untuk mengaktifkan sesi"
                    : "Aktifkan sesi berjualan"
                }
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1 transition disabled:opacity-40 cursor-pointer whitespace-nowrap"
              >
                <Power className="h-3.5 w-3.5" /> Aktifkan Sesi
              </button>
            )}
            {merchant.sellingStatus === "ACTIVE" && (
              <button
                type="button"
                disabled={isActionPending}
                onClick={() => onUpdateSession(merchant.id, "PAUSED")}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-1 transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                <PauseCircle className="h-3.5 w-3.5" /> Jeda Istirahat
              </button>
            )}
            {merchant.sellingStatus !== "ENDED" && (
              <button
                type="button"
                disabled={isActionPending}
                onClick={() => onUpdateSession(merchant.id, "ENDED")}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006194] focus-visible:ring-offset-1 transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                <Power className="h-3.5 w-3.5 text-rose-600" /> Akhiri Sesi
              </button>
            )}
          </div>
          {merchant.verificationStatus === "REJECTED" && (
            <p className="text-[11px] text-rose-700 leading-relaxed">
              Sesi dikunci karena akun berstatus Ditolak. Setujui verifikasi
              terlebih dahulu untuk mengaktifkan sesi.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

