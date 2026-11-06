"use client";

import { useState } from "react";
import Link from "next/link";
import { merchantService } from "@/services/mock/merchantService";
import { Merchant, VerificationStatus, SellingStatus } from "@/types/merchant";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AuthUser } from "@/server/auth";
import {
  ShieldCheck,
  Store,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  ExternalLink,
  Power,
  RefreshCw,
} from "lucide-react";

interface AdminDashboardClientProps {
  adminUser?: AuthUser;
}

export default function AdminDashboardClient({ adminUser }: AdminDashboardClientProps) {
  const [merchants, setMerchants] = useState<Merchant[]>(() => merchantService.getAll());
  const [search, setSearch] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleVerify = (id: string, status: VerificationStatus) => {
    const updated = merchantService.setVerificationStatus(id, status);
    if (updated) {
      setMerchants(merchantService.getAll());
      showToast(
        status === "VERIFIED"
          ? "Merchant berhasil diverifikasi!"
          : "Status verifikasi merchant diperbarui."
      );
    }
  };

  const handleToggleActive = (id: string, currentStatus: SellingStatus) => {
    const nextStatus = currentStatus === "ACTIVE" ? "ENDED" : "ACTIVE";
    const updated = merchantService.updateSessionStatus(id, nextStatus);
    if (updated) {
      setMerchants(merchantService.getAll());
      showToast(`Status aktivitas merchant diubah menjadi ${nextStatus}.`);
    }
  };

  const handleReset = () => {
    merchantService.resetDefaults();
    setMerchants(merchantService.getAll());
    showToast("Data mock admin di-reset ke nilai bawaan.");
  };

  // Metrics
  const totalCount = merchants.length;
  const activeCount = merchants.filter((m) => m.sellingStatus === "ACTIVE").length;
  const verifiedCount = merchants.filter((m) => m.verificationStatus === "VERIFIED").length;
  const pendingCount = merchants.filter((m) => m.verificationStatus === "PENDING").length;

  const filtered = merchants.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.ownerName.toLowerCase().includes(q) ||
      m.district.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-3 text-xs shadow-xl border border-slate-700 animate-in fade-in">
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Panel Moderasi Admin
                </h1>
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                  Role: {adminUser?.role || "ADMIN"}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Kelola validasi pedagang dan pantau aktivitas UMKM keliling Bandung Raya. Terautentikasi sebagai {adminUser?.email || "Admin"}.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            Reset Data Simulasi
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Total Merchant</span>
              <Store className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 mt-2">{totalCount}</p>
            <span className="text-[11px] text-slate-600">Pedagang terdaftar di platform</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Sedang Berjualan</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-2xl font-extrabold text-emerald-700 mt-2">{activeCount}</p>
            <span className="text-[11px] text-slate-600">Gerobak live di peta saat ini</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Terverifikasi</span>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 mt-2">{verifiedCount}</p>
            <span className="text-[11px] text-slate-600">Profil usaha sah terkonfirmasi</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Menunggu Verifikasi</span>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-extrabold text-amber-700 mt-2">{pendingCount}</p>
            <span className="text-[11px] text-slate-600">Menunggu review kurasi data</span>
          </div>
        </div>

        {/* Search & Moderation Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari pedagang, pemilik, wilayah..."
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-600">
              Menampilkan {filtered.length} pedagang
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-100">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="py-3 px-4">Pedagang & Pemilik</th>
                  <th className="py-3 px-4">Kategori & Wilayah</th>
                  <th className="py-3 px-4">Status Sesi</th>
                  <th className="py-3 px-4">Verifikasi Akun</th>
                  <th className="py-3 px-4 text-right">Aksi Moderasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl shrink-0">{m.iconEmoji || "🍲"}</span>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {m.name}
                            <Link
                              href={`/merchant/${m.slug}`}
                              target="_blank"
                              className="text-slate-400 hover:text-emerald-700"
                              title="Buka Halaman Merchant"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                          <span className="text-[11px] text-slate-600">Pemilik: {m.ownerName}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{m.category}</div>
                      <div className="text-[11px] text-slate-600">{m.district}</div>
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={m.sellingStatus} />
                    </td>

                    <td className="py-3 px-4">
                      {m.verificationStatus === "VERIFIED" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="h-3 w-3" /> Terverifikasi
                        </span>
                      ) : m.verificationStatus === "PENDING" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertCircle className="h-3 w-3" /> Menunggu
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="h-3 w-3" /> Ditolak
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {m.verificationStatus !== "VERIFIED" ? (
                          <button
                            type="button"
                            onClick={() => handleVerify(m.id, "VERIFIED")}
                            className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200"
                          >
                            Verifikasi
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleVerify(m.id, "REJECTED")}
                            className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-200 transition"
                          >
                            Tolak
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggleActive(m.id, m.sellingStatus)}
                          className={`rounded-lg p-1.5 transition ${
                            m.sellingStatus === "ACTIVE"
                              ? "text-rose-600 hover:bg-rose-50"
                              : "text-emerald-700 hover:bg-emerald-50"
                          }`}
                          title={
                            m.sellingStatus === "ACTIVE"
                              ? "Nonaktifkan Sesi Gerobak"
                              : "Aktifkan Sesi Gerobak"
                          }
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

