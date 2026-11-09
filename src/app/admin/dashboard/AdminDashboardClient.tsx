"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ExternalLink,
  Power,
  RefreshCw,
  LogOut,
  Eye,
  AlertTriangle,
  Loader2,
  MapPin,
  Store,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/common/StatusBadge";
import { toast } from "@/components/ui/sonner";
import {
  refreshAdminMerchantsAction,
  verifyMerchantAction,
  toggleMerchantSessionAction,
} from "@/actions/admin";
import {
  AdminMetrics,
  type MetricQuickFilter,
} from "@/components/admin/AdminMetrics";
import { AdminMerchantDetailModal } from "@/components/admin/AdminMerchantDetailModal";
import type { AuthUser } from "@/server/auth";
import type {
  AdminMerchantRecord,
  SellingStatus,
  VerificationStatus,
} from "@/types/merchant";

interface AdminDashboardClientProps {
  adminUser: AuthUser;
  initialMerchants: AdminMerchantRecord[];
  initialError?: string | null;
}

type VerificationFilter = "ALL" | VerificationStatus;
type SessionFilter = "ALL" | SellingStatus;

export default function AdminDashboardClient({
  adminUser,
  initialMerchants,
  initialError = null,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [merchants, setMerchants] =
    useState<AdminMerchantRecord[]>(initialMerchants);
  const [prevInitialMerchants, setPrevInitialMerchants] =
    useState<AdminMerchantRecord[]>(initialMerchants);
  const [loadError, setLoadError] = useState<string | null>(initialError);
  const [search, setSearch] = useState("");
  const [verificationFilter, setVerificationFilter] =
    useState<VerificationFilter>("ALL");
  const [sessionFilter, setSessionFilter] = useState<SessionFilter>("ALL");
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(
    null
  );
  const [pendingMerchantId, setPendingMerchantId] = useState<string | null>(
    null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (prevInitialMerchants !== initialMerchants) {
    setPrevInitialMerchants(initialMerchants);
    setMerchants(initialMerchants);
  }

  const selectedMerchant = useMemo(
    () => merchants.find((m) => m.id === selectedMerchantId) ?? null,
    [merchants, selectedMerchantId]
  );

  const metrics = useMemo(() => {
    let activeCount = 0;
    let pausedCount = 0;
    let verifiedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;

    for (const m of merchants) {
      if (m.sellingStatus === "ACTIVE") activeCount += 1;
      if (m.sellingStatus === "PAUSED") pausedCount += 1;
      if (m.verificationStatus === "VERIFIED") verifiedCount += 1;
      else if (m.verificationStatus === "PENDING") pendingCount += 1;
      else if (m.verificationStatus === "REJECTED") rejectedCount += 1;
    }

    return {
      totalCount: merchants.length,
      activeCount,
      pausedCount,
      verifiedCount,
      pendingCount,
      rejectedCount,
    };
  }, [merchants]);

  const activeQuickFilter: MetricQuickFilter = useMemo(() => {
    if (sessionFilter === "ACTIVE" && verificationFilter === "ALL") {
      return "ACTIVE_SESSION";
    }
    if (verificationFilter === "VERIFIED" && sessionFilter === "ALL") {
      return "VERIFIED";
    }
    if (verificationFilter === "PENDING" && sessionFilter === "ALL") {
      return "PENDING";
    }
    if (verificationFilter === "ALL" && sessionFilter === "ALL") {
      return "ALL";
    }
    return "ALL";
  }, [verificationFilter, sessionFilter]);

  const handleSelectQuickFilter = (filter: MetricQuickFilter) => {
    if (filter === "ALL") {
      setVerificationFilter("ALL");
      setSessionFilter("ALL");
    } else if (filter === "ACTIVE_SESSION") {
      setVerificationFilter("ALL");
      setSessionFilter("ACTIVE");
    } else if (filter === "VERIFIED") {
      setVerificationFilter("VERIFIED");
      setSessionFilter("ALL");
    } else if (filter === "PENDING") {
      setVerificationFilter("PENDING");
      setSessionFilter("ALL");
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return merchants.filter((m) => {
      if (
        verificationFilter !== "ALL" &&
        m.verificationStatus !== verificationFilter
      ) {
        return false;
      }
      if (sessionFilter !== "ALL" && m.sellingStatus !== sessionFilter) {
        return false;
      }
      if (!q) return true;

      return (
        m.name.toLowerCase().includes(q) ||
        m.ownerName.toLowerCase().includes(q) ||
        m.ownerEmail.toLowerCase().includes(q) ||
        m.district.toLowerCase().includes(q) ||
        m.operatingArea.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q)
      );
    });
  }, [merchants, search, verificationFilter, sessionFilter]);

  const hasActiveFilters =
    search.trim() !== "" ||
    verificationFilter !== "ALL" ||
    sessionFilter !== "ALL";

  const handleResetFilters = () => {
    setSearch("");
    setVerificationFilter("ALL");
    setSessionFilter("ALL");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await refreshAdminMerchantsAction();
      if (!res.ok || !res.data) {
        const msg = res.message || "Gagal memuat ulang data pedagang.";
        setLoadError(msg);
        toast.error(msg);
        return;
      }
      setLoadError(null);
      setMerchants(res.data);
      toast.success(res.message || "Data pedagang diperbarui.");
    } catch {
      const msg = "Koneksi ke server gagal saat memuat ulang data.";
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleVerify = async (
    id: string,
    nextStatus: VerificationStatus
  ) => {
    setPendingMerchantId(id);
    try {
      const res = await verifyMerchantAction(id, nextStatus);
      if (!res.ok || !res.data) {
        toast.error(res.message || "Gagal memperbarui status verifikasi.");
        return;
      }
      const updated = res.data;
      setMerchants((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
      toast.success(res.message || "Status verifikasi diperbarui.");
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan verifikasi.");
    } finally {
      setPendingMerchantId(null);
    }
  };

  const handleUpdateSession = async (
    id: string,
    targetStatus: SellingStatus
  ) => {
    setPendingMerchantId(id);
    try {
      const res = await toggleMerchantSessionAction(id, targetStatus);
      if (!res.ok || !res.data) {
        toast.error(res.message || "Gagal memperbarui status sesi.");
        return;
      }
      const updated = res.data;
      setMerchants((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
      toast.success(res.message || "Status sesi diperbarui.");
    } catch {
      toast.error("Terjadi kesalahan saat mengubah status sesi.");
    } finally {
      setPendingMerchantId(null);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!res.ok) {
        throw new Error(`Logout gagal (${res.status})`);
      }

      try {
        const supabase = createClient();
        await supabase.auth.signOut({ scope: "local" });
      } catch {
        // Abaikan jika local session client sudah bersih
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("jejaklapak-auth-changed"));
      }

      router.replace("/merchant/login");
    } catch {
      toast.error("Gagal keluar dari akun admin. Silakan coba lagi.");
      setIsLoggingOut(false);
    }
  };

  const verificationTabs: Array<{
    key: VerificationFilter;
    label: string;
    count: number;
  }> = [
    { key: "ALL", label: "Semua", count: metrics.totalCount },
    { key: "PENDING", label: "Menunggu", count: metrics.pendingCount },
    { key: "VERIFIED", label: "Terverifikasi", count: metrics.verifiedCount },
    { key: "REJECTED", label: "Ditolak", count: metrics.rejectedCount },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9ff] pb-16">
      {/* Header */}
      <div className="bg-white border-b border-[#dce9ff]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#006194] text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#0d1c2e] tracking-tight">
                  Panel Moderasi Admin
                </h1>
                <span className="rounded-md bg-[#eff4ff] px-2 py-0.5 text-[11px] font-semibold text-[#006194] border border-[#dce9ff]">
                  {adminUser.role}
                </span>
              </div>
              <p className="text-xs text-[#3f4850] mt-0.5">
                Data langsung dari PostgreSQL · Masuk sebagai{" "}
                <span className="font-semibold text-[#0d1c2e]">
                  {adminUser.email}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#bfc7d2]/60 bg-white px-3.5 text-xs font-semibold text-[#0d1c2e] hover:bg-[#eff4ff] transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-[#006194] ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
              {isRefreshing ? "Memuat..." : "Muat Ulang"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              {isLoggingOut ? "Keluar..." : "Keluar"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Error state bila gagal koneksi database */}
        {loadError && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-xs text-rose-800">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-900">
                  Gagal memuat data dari database
                </p>
                <p className="mt-0.5 text-rose-700">{loadError}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-rose-300 bg-white px-3 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition shrink-0 cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Metric Cards */}
        <AdminMetrics
          totalCount={metrics.totalCount}
          activeCount={metrics.activeCount}
          pausedCount={metrics.pausedCount}
          verifiedCount={metrics.verifiedCount}
          pendingCount={metrics.pendingCount}
          rejectedCount={metrics.rejectedCount}
          activeQuickFilter={activeQuickFilter}
          onSelectQuickFilter={handleSelectQuickFilter}
        />

        {/* Search, Filter & Moderation Table */}
        <div className="rounded-xl border border-[#dce9ff] bg-white overflow-hidden">
          <div className="p-4 border-b border-[#dce9ff] space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Filter Pills Verifikasi */}
              <div className="flex flex-wrap items-center gap-1.5">
                {verificationTabs.map((tab) => {
                  const isActive = verificationFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setVerificationFilter(tab.key)}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition cursor-pointer ${
                        isActive
                          ? "bg-[#006194] text-white"
                          : "border border-[#dce9ff] bg-[#f8f9ff] text-[#3f4850] hover:bg-[#eff4ff] hover:text-[#006194]"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-white text-[#0d1c2e] border border-[#dce9ff]"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search & Session Filter */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari usaha, pemilik, email, wilayah..."
                    aria-label="Cari pedagang"
                    className="h-9 w-full rounded-lg border border-[#bfc7d2]/70 pl-9 pr-3 text-xs text-[#0d1c2e] placeholder:text-slate-400 focus:border-[#006194] focus:outline-none focus:ring-1 focus:ring-[#006194]"
                  />
                </div>

                <select
                  value={sessionFilter}
                  onChange={(e) =>
                    setSessionFilter(e.target.value as SessionFilter)
                  }
                  aria-label="Filter status sesi"
                  className="h-9 rounded-lg border border-[#bfc7d2]/70 bg-white px-3 text-xs font-medium text-[#0d1c2e] focus:border-[#006194] focus:outline-none focus:ring-1 focus:ring-[#006194]"
                >
                  <option value="ALL">Semua Sesi</option>
                  <option value="ACTIVE">Sedang Berjualan</option>
                  <option value="PAUSED">Sedang Istirahat</option>
                  <option value="ENDED">Sesi Berakhir</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#3f4850]">
              <span>
                Menampilkan{" "}
                <strong className="text-[#0d1c2e] tabular-nums">
                  {filtered.length}
                </strong>{" "}
                dari{" "}
                <strong className="text-[#0d1c2e] tabular-nums">
                  {merchants.length}
                </strong>{" "}
                pedagang terdaftar
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="font-semibold text-[#006194] hover:underline cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* Empty State */}
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center space-y-3">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[#dce9ff] bg-[#eff4ff] text-[#006194]">
                <Store className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#0d1c2e]">
                  {merchants.length === 0
                    ? "Belum ada pedagang terdaftar di database"
                    : "Tidak ada pedagang yang sesuai filter"}
                </p>
                <p className="text-xs text-[#3f4850] max-w-md mx-auto">
                  {merchants.length === 0
                    ? "Pedagang yang mendaftar melalui /merchant/register akan otomatis muncul di sini untuk diverifikasi."
                    : "Coba ubah kata kunci pencarian atau reset filter status untuk melihat pedagang lain."}
                </p>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex h-9 items-center rounded-lg bg-[#006194] px-4 text-xs font-semibold text-white hover:bg-[#004b73] transition cursor-pointer"
                >
                  Tampilkan Semua Pedagang
                </button>
              )}
            </div>
          ) : (
            <>
            <div className="lg:hidden divide-y divide-[#eff4ff]">
              {filtered.map((m) => {
                const isRowPending = pendingMerchantId === m.id;
                const nextSessionStatus: SellingStatus =
                  m.sellingStatus === "ENDED" ? "ACTIVE" : "ENDED";

                return (
                  <div
                    key={m.id}
                    className={`p-4 space-y-3 transition-colors ${
                      m.verificationStatus === "PENDING"
                        ? "bg-amber-50/35"
                        : "bg-white"
                    } ${isRowPending ? "opacity-70" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span
                          className="text-xl shrink-0 mt-0.5"
                          aria-hidden="true"
                        >
                          {m.iconEmoji}
                        </span>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedMerchantId(m.id)}
                              className="font-bold text-xs text-[#0d1c2e] hover:text-[#006194] text-left cursor-pointer"
                            >
                              {m.name}
                            </button>
                            <Link
                              href={`/merchant/${m.slug}`}
                              target="_blank"
                              className="text-slate-400 hover:text-[#006194] shrink-0"
                              title="Buka Halaman Publik Lapak"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                          <p className="text-[11px] font-medium text-[#0d1c2e]">
                            {m.ownerName}
                          </p>
                          <p className="text-[11px] text-[#3f4850] break-all">
                            {m.ownerEmail || m.phone}
                          </p>
                        </div>
                      </div>

                      {m.verificationStatus === "VERIFIED" ? (
                        <span className="inline-flex shrink-0 items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" /> Terverifikasi
                        </span>
                      ) : m.verificationStatus === "PENDING" ? (
                        <span className="inline-flex shrink-0 items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="h-3 w-3" /> Menunggu
                        </span>
                      ) : (
                        <span className="inline-flex shrink-0 items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="h-3 w-3" /> Ditolak
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#3f4850]">
                      <StatusBadge status={m.sellingStatus} />
                      <span>
                        {m.category} · {m.district}
                      </span>
                      <span className="tabular-nums">{m.menuCount} menu</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedMerchantId(m.id)}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#dce9ff] bg-white px-2.5 text-[11px] font-semibold text-[#0d1c2e] hover:bg-[#eff4ff] hover:text-[#006194] transition cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Detail
                      </button>

                      {m.verificationStatus !== "VERIFIED" && (
                        <button
                          type="button"
                          disabled={isRowPending}
                          onClick={() => handleVerify(m.id, "VERIFIED")}
                          title="Setujui (ACC) agar tampil di peta publik"
                          className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#006194] px-2.5 text-[11px] font-semibold text-white hover:bg-[#004b73] transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
                        >
                          {isRowPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3" />
                          )}
                          Setujui (ACC)
                        </button>
                      )}

                      {m.verificationStatus !== "REJECTED" && (
                        <button
                          type="button"
                          disabled={isRowPending}
                          onClick={() => handleVerify(m.id, "REJECTED")}
                          title="Tolak pengajuan lapak ini"
                          className="inline-flex h-8 items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
                        >
                          <XCircle className="h-3 w-3" />
                          Tolak
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={
                          isRowPending ||
                          (m.sellingStatus === "ENDED" &&
                            m.verificationStatus === "REJECTED")
                        }
                        onClick={() =>
                          handleUpdateSession(m.id, nextSessionStatus)
                        }
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:opacity-40 cursor-pointer ml-auto ${
                          m.sellingStatus === "ENDED"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "border-slate-200 bg-white text-rose-600 hover:bg-rose-50"
                        }`}
                        aria-label={
                          m.sellingStatus === "ENDED"
                            ? `Aktifkan sesi ${m.name}`
                            : `Akhiri sesi ${m.name}`
                        }
                      >
                        <Power className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-xs text-[#3f4850] divide-y divide-[#eff4ff]">
                <thead className="bg-[#f8f9ff] text-[11px] font-bold uppercase tracking-wider text-[#3f4850]">
                  <tr>
                    <th className="py-3 px-4">Lapak &amp; Pemilik</th>
                    <th className="py-3 px-4">Kategori &amp; Wilayah</th>
                    <th className="py-3 px-4">Status Sesi &amp; Data</th>
                    <th className="py-3 px-4">Verifikasi</th>
                    <th className="py-3 px-4 text-right">Aksi Moderasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eff4ff]">
                  {filtered.map((m) => {
                    const isRowPending = pendingMerchantId === m.id;
                    const nextSessionStatus: SellingStatus =
                      m.sellingStatus === "ENDED" ? "ACTIVE" : "ENDED";

                    return (
                      <tr
                        key={m.id}
                        className={`transition-colors ${
                          m.verificationStatus === "PENDING"
                            ? "bg-amber-50/35 hover:bg-amber-50/60"
                            : "hover:bg-[#f8f9ff]"
                        } ${isRowPending ? "opacity-70" : ""}`}
                      >
                        {/* Lapak & Pemilik */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex items-start gap-2.5">
                            <span
                              className="text-xl shrink-0 mt-0.5"
                              aria-hidden="true"
                            >
                              {m.iconEmoji}
                            </span>
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedMerchantId(m.id)}
                                  className="font-bold text-[#0d1c2e] hover:text-[#006194] text-left cursor-pointer"
                                >
                                  {m.name}
                                </button>
                                <Link
                                  href={`/merchant/${m.slug}`}
                                  target="_blank"
                                  className="text-slate-400 hover:text-[#006194] shrink-0"
                                  title="Buka Halaman Publik Lapak"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Link>
                              </div>
                              <p className="text-[11px] font-medium text-[#0d1c2e]">
                                {m.ownerName}
                              </p>
                              <p className="text-[11px] text-[#3f4850] break-all">
                                {m.ownerEmail || m.phone}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Kategori & Wilayah */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-semibold text-[#0d1c2e]">
                            {m.category}
                          </div>
                          <div className="text-[11px] text-[#3f4850]">
                            {m.district}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            Rute: {m.operatingArea}
                          </div>
                        </td>

                        {/* Status Sesi & Data */}
                        <td className="py-3.5 px-4 align-top space-y-1.5">
                          <StatusBadge status={m.sellingStatus} />
                          <div className="flex items-center gap-2 text-[11px] text-[#3f4850]">
                            <span className="tabular-nums">
                              {m.menuCount} menu
                            </span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-[#006194]" />
                              {m.hasLocation ? "GPS tercatat" : "Belum ada GPS"}
                            </span>
                          </div>
                        </td>

                        {/* Verifikasi */}
                        <td className="py-3.5 px-4 align-top">
                          {m.verificationStatus === "VERIFIED" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3" /> Terverifikasi
                            </span>
                          ) : m.verificationStatus === "PENDING" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="h-3 w-3" /> Menunggu
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="h-3 w-3" /> Ditolak
                            </span>
                          )}
                        </td>

                        {/* Aksi Moderasi */}
                        <td className="py-3.5 px-4 text-right align-top">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedMerchantId(m.id)}
                              className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#dce9ff] bg-white px-2.5 text-[11px] font-semibold text-[#0d1c2e] hover:bg-[#eff4ff] hover:text-[#006194] transition cursor-pointer"
                              title="Lihat Detail Lapak & Menu"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Detail
                            </button>

                            {m.verificationStatus !== "VERIFIED" && (
                              <button
                                type="button"
                                disabled={isRowPending}
                                onClick={() => handleVerify(m.id, "VERIFIED")}
                                title="Setujui (ACC) agar tampil di peta publik"
                                className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#006194] px-2.5 text-[11px] font-semibold text-white hover:bg-[#004b73] transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
                              >
                                {isRowPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3 w-3" />
                                )}
                                Setujui (ACC)
                              </button>
                            )}

                            {m.verificationStatus !== "REJECTED" && (
                              <button
                                type="button"
                                disabled={isRowPending}
                                onClick={() => handleVerify(m.id, "REJECTED")}
                                title="Tolak pengajuan lapak ini"
                                className="inline-flex h-8 items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
                              >
                                <XCircle className="h-3 w-3" />
                                Tolak
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={
                                isRowPending ||
                                (m.sellingStatus === "ENDED" &&
                                  m.verificationStatus === "REJECTED")
                              }
                              onClick={() =>
                                handleUpdateSession(m.id, nextSessionStatus)
                              }
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:opacity-40 cursor-pointer ${
                                m.sellingStatus === "ENDED"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "border-slate-200 bg-white text-rose-600 hover:bg-rose-50"
                              }`}
                              title={
                                m.sellingStatus === "ENDED" &&
                                m.verificationStatus === "REJECTED"
                                  ? "Verifikasi lapak terlebih dahulu untuk mengaktifkan sesi"
                                  : m.sellingStatus === "ENDED"
                                  ? "Aktifkan Sesi Berjualan"
                                  : "Akhiri Sesi Berjualan"
                              }
                              aria-label={
                                m.sellingStatus === "ENDED"
                                  ? `Aktifkan sesi ${m.name}`
                                  : `Akhiri sesi ${m.name}`
                              }
                            >
                              <Power className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>
      </div>

      <AdminMerchantDetailModal
        merchant={selectedMerchant}
        open={Boolean(selectedMerchant)}
        onOpenChange={(open) => {
          if (!open) setSelectedMerchantId(null);
        }}
        isActionPending={
          Boolean(selectedMerchant) &&
          pendingMerchantId === selectedMerchant?.id
        }
        onUpdateVerification={handleVerify}
        onUpdateSession={handleUpdateSession}
      />
    </div>
  );
}
