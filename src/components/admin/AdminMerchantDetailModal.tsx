"use client";

import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  ExternalLink,
  Utensils,
  Calendar,
  Navigation,
  Route,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AdminMerchantModerationControls } from "./AdminMerchantModerationControls";
import type {
  AdminMerchantRecord,
  SellingStatus,
  VerificationStatus,
} from "@/types/merchant";

interface AdminMerchantDetailModalProps {
  merchant: AdminMerchantRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isActionPending: boolean;
  onUpdateVerification: (id: string, status: VerificationStatus) => void;
  onUpdateSession: (id: string, status: SellingStatus) => void;
}

function formatJakartaDate(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function VerificationPill({ status }: { status: VerificationStatus }) {
  if (status === "VERIFIED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" /> Terverifikasi
      </span>
    );
  }
  if (status === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
        <Clock className="h-3.5 w-3.5" /> Menunggu
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
      <XCircle className="h-3.5 w-3.5" /> Ditolak
    </span>
  );
}

export function AdminMerchantDetailModal({
  merchant,
  open,
  onOpenChange,
  isActionPending,
  onUpdateVerification,
  onUpdateSession,
}: AdminMerchantDetailModalProps) {
  const mapsUrl =
    merchant &&
    merchant.hasLocation &&
    merchant.latitude !== null &&
    merchant.longitude !== null
      ? `https://www.google.com/maps/search/?api=1&query=${merchant.latitude},${merchant.longitude}`
      : null;

  const waPhone = merchant
    ? merchant.phone.replace(/\D/g, "").replace(/^0/, "62")
    : "";
  const waUrl = waPhone.length >= 9 ? `https://wa.me/${waPhone}` : null;

  return (
    <Dialog open={open && Boolean(merchant)} onOpenChange={onOpenChange}>
      {merchant && (
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-4xl bg-white p-0 border border-[#dce9ff] gap-0"
        >
        <DialogHeader className="shrink-0 border-b border-[#dce9ff] bg-[#f8f9ff] px-5 sm:px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#dce9ff] bg-white text-2xl">
                <span aria-hidden="true">{merchant.iconEmoji}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="min-w-0">
                    <DialogTitle className="text-base sm:text-lg font-bold text-[#0d1c2e] leading-snug">
                      {merchant.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-[#3f4850] mt-0.5">
                      {merchant.category} · {merchant.district}, {merchant.city}
                    </DialogDescription>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <StatusBadge status={merchant.sellingStatus} />
                    <VerificationPill status={merchant.verificationStatus} />
                  </div>
                </div>
              </div>
            </div>

            <DialogClose
              aria-label="Tutup modal"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#3f4850] hover:bg-[#eff4ff] hover:text-[#0d1c2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006194] transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs text-[#3f4850]">
          <AdminMerchantModerationControls
            merchant={merchant}
            isActionPending={isActionPending}
            onUpdateVerification={onUpdateVerification}
            onUpdateSession={onUpdateSession}
          />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-start">
            {/* Kolom Kiri: Pemilik, Kontak & Lokasi */}
            <div className="md:col-span-5 space-y-4">
              <section className="rounded-xl border border-[#dce9ff] bg-white p-4 space-y-2.5">
                <h3 className="text-xs font-bold text-[#0d1c2e]">
                  Pemilik &amp; Kontak Akun
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#0d1c2e]">
                    <User className="h-3.5 w-3.5 text-[#006194] shrink-0" />
                    <span className="font-semibold">{merchant.ownerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-[#006194] shrink-0" />
                    <span className="break-all">
                      {merchant.ownerEmail || "Email tidak tersedia"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-[#006194] shrink-0" />
                      <span className="tabular-nums font-medium text-[#0d1c2e]">
                        {merchant.phone}
                      </span>
                    </div>
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-[#dce9ff] bg-[#eff4ff] px-2 py-1 text-[11px] font-semibold text-[#006194] hover:bg-[#dce9ff] transition shrink-0"
                      >
                        WhatsApp <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-[#eff4ff] text-[11px] text-[#3f4850]">
                    <Clock className="h-3.5 w-3.5 text-[#006194] shrink-0" />
                    <span>
                      Terdaftar: {formatJakartaDate(merchant.createdAt)} WIB
                    </span>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-[#dce9ff] bg-white p-4 space-y-3">
                <h3 className="text-xs font-bold text-[#0d1c2e] flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#006194]" /> Posisi
                  &amp; Area Keliling
                </h3>
                <div className="space-y-1.5">
                  <p className="font-semibold text-[#0d1c2e] leading-snug">
                    {merchant.address}
                  </p>
                  <p>
                    {merchant.district}, {merchant.city}
                  </p>
                  <div className="flex items-start gap-1.5 pt-0.5">
                    <Route className="h-3.5 w-3.5 text-[#006194] shrink-0 mt-0.5" />
                    <p>
                      Rute keliling:{" "}
                      <span className="font-semibold text-[#0d1c2e]">
                        {merchant.operatingArea}
                      </span>
                    </p>
                  </div>
                  {merchant.description && (
                    <p className="pt-1.5 text-[#3f4850] leading-relaxed border-t border-[#eff4ff]">
                      {merchant.description}
                    </p>
                  )}
                </div>

                <div className="pt-2.5 border-t border-[#dce9ff]">
                  {merchant.hasLocation &&
                  merchant.latitude !== null &&
                  merchant.longitude !== null ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-[#0d1c2e] tabular-nums">
                          {merchant.latitude.toFixed(5)},{" "}
                          {merchant.longitude.toFixed(5)}
                          {merchant.accuracyMeters
                            ? ` (±${Math.round(merchant.accuracyMeters)}m)`
                            : ""}
                        </p>
                        {merchant.lastLocationAt && (
                          <p className="text-[11px] text-[#3f4850] mt-0.5">
                            Update GPS: {formatJakartaDate(merchant.lastLocationAt)}{" "}
                            WIB
                          </p>
                        )}
                      </div>
                      {mapsUrl && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-[#dce9ff] bg-[#eff4ff] px-2.5 py-1.5 text-[11px] font-semibold text-[#006194] hover:bg-[#dce9ff] transition shrink-0"
                        >
                          <Navigation className="h-3 w-3" /> Cek Titik
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500">
                      Belum ada rekaman koordinat GPS di database untuk pedagang
                      ini.
                    </p>
                  )}
                </div>
              </section>
            </div>

            {/* Kolom Kanan: Daftar Menu & Jadwal Operasional */}
            <div className="md:col-span-7 space-y-4">
              <section className="rounded-xl border border-[#dce9ff] bg-white p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-[#0d1c2e] flex items-center gap-1.5">
                    <Utensils className="h-3.5 w-3.5 text-[#006194]" /> Daftar
                    Menu ({merchant.menuCount})
                  </h3>
                </div>
                {merchant.menu.length === 0 ? (
                  <p className="text-[11px] text-slate-500 py-1">
                    Pedagang belum menambahkan menu apa pun.
                  </p>
                ) : (
                  <ul className="max-h-64 overflow-y-auto divide-y divide-[#eff4ff] rounded-lg border border-[#dce9ff]">
                    {merchant.menu.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-3 px-3.5 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-[#0d1c2e] truncate">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-[#3f4850] tabular-nums">
                            Rp {item.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                            item.isAvailable
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {item.isAvailable ? "Tersedia" : "Habis"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="rounded-xl border border-[#dce9ff] bg-white p-4 space-y-2.5">
                <h3 className="text-xs font-bold text-[#0d1c2e] flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#006194]" /> Jadwal
                  Operasional ({merchant.schedule.length} Hari)
                </h3>
                {merchant.schedule.length === 0 ? (
                  <p className="text-[11px] text-slate-500 py-1">
                    Belum ada jadwal operasional yang disimpan.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {merchant.schedule.map((sc) => (
                      <div
                        key={sc.dayOfWeek}
                        className="flex items-center justify-between gap-2 rounded-lg border border-[#dce9ff] bg-[#f8f9ff]/60 px-3 py-2"
                      >
                        <span className="font-semibold text-[#0d1c2e]">
                          {sc.dayName}
                        </span>
                        {sc.isOpen ? (
                          <span className="tabular-nums text-[11px] text-[#3f4850]">
                            {sc.startTime} - {sc.endTime} WIB
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Libur
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-[#dce9ff] bg-[#f8f9ff] px-5 sm:px-6 py-3 flex-row items-center justify-between sm:justify-between gap-3">
          <Link
            href={`/merchant/${merchant.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006194] hover:underline"
          >
            Buka Halaman Publik <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-[#bfc7d2]/80 bg-white px-4 text-xs font-semibold text-[#0d1c2e] hover:bg-[#eff4ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006194] transition cursor-pointer shrink-0"
          >
            Tutup
          </button>
        </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
