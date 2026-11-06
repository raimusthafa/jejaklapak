"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MOCK_MERCHANTS } from "@/data/mock/merchants";
import { merchantService, calculateFreshness } from "@/services/mock/merchantService";
import { toggleSellingSessionAction } from "@/actions/merchant";
import { useMerchantLocationTracker } from "@/hooks/useMerchantLocationTracker";
import { Merchant, SellingStatus } from "@/types/merchant";
import { StatusBadge, FreshnessBadge } from "@/components/common/StatusBadge";
import {
  Play,
  Pause,
  StopCircle,
  MapPin,
  Calendar,
  Store,
  Clock,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Radio,
  Send,
  Info,
} from "lucide-react";
import { AuthUser } from "@/server/auth";

export default function MerchantDashboardClient({ user }: { user?: AuthUser }) {
  const [merchant, setMerchant] = useState(MOCK_MERCHANTS[0]);
  const [status, setStatus] = useState<SellingStatus>(merchant.sellingStatus);
  const [lastCapturedAt, setLastCapturedAt] = useState(merchant.location.capturedAt);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualLat, setManualLat] = useState(merchant.location.latitude.toString());
  const [manualLng, setManualLng] = useState(merchant.location.longitude.toString());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  // Sync merchant with live database on mount
  useEffect(() => {
    async function loadMerchantData() {
      try {
        const res = await fetch("/api/merchants");
        if (res.ok) {
          const json = await res.json();
          if (json.ok && Array.isArray(json.data) && json.data.length > 0) {
            const found =
              json.data.find(
                (m: Merchant) =>
                  (user?.merchantSlug && m.slug === user.merchantSlug) ||
                  (user?.merchantId && m.id === user.merchantId) ||
                  m.slug === "cuanki-batagor-serayu-keliling"
              ) || json.data[0];
            setMerchant(found);
            setStatus(found.sellingStatus);
            setLastCapturedAt(found.location.capturedAt);
            setManualLat(found.location.latitude.toString());
            setManualLng(found.location.longitude.toString());
          }
        }
      } catch (err) {
        console.warn("Could not fetch live merchant data:", err);
      }
    }
    loadMerchantData();
  }, [user?.merchantId, user?.merchantSlug]);

  // Hook Pelacak GPS Otomatis (Fase 3)
  const {
    coords: liveCoords,
    accuracy: liveAccuracy,
    speed: liveSpeed,
    heading: liveHeading,
    lastSentAt: liveLastSentAt,
    isTracking,
    gpsError: trackerGpsError,
    setManualCoords,
    sendCurrentLocation,
  } = useMerchantLocationTracker({
    merchantId: merchant.id,
    isActive: status === "ACTIVE",
    intervalMs: 15000, // broadcast setiap 15 detik
    minDistanceMeters: 5, // atau setiap berpindah 5 meter
  });

  const activeCapturedAt = liveLastSentAt || lastCapturedAt;
  const freshness = calculateFreshness(activeCapturedAt);

  const displayLat = liveCoords ? liveCoords.latitude : merchant.location.latitude;
  const displayLng = liveCoords ? liveCoords.longitude : merchant.location.longitude;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStartSession = async () => {
    setIsPending(true);
    const res = await toggleSellingSessionAction(merchant.id, "START");
    setIsPending(false);

    if (res.ok) {
      setStatus("ACTIVE");
      const nowIso = new Date().toISOString();
      setLastCapturedAt(nowIso);
      merchantService.updateSessionStatus(merchant.id, "ACTIVE");
      showToast("Sesi berjualan AKTIF! Pelacakan GPS perangkat kini otomatis memancarkan sinyal ke peta pelanggan.");
    }
  };

  const handlePauseSession = async () => {
    setIsPending(true);
    const res = await toggleSellingSessionAction(merchant.id, "PAUSE");
    setIsPending(false);

    if (res.ok) {
      setStatus("PAUSED");
      const nowIso = new Date().toISOString();
      setLastCapturedAt(nowIso);
      merchantService.updateSessionStatus(merchant.id, "PAUSED");
      showToast("Sesi berjualan dijeda (Istirahat). Pelanggan dapat melihat status istirahat.");
    }
  };

  const handleResumeSession = async () => {
    setIsPending(true);
    const res = await toggleSellingSessionAction(merchant.id, "RESUME");
    setIsPending(false);

    if (res.ok) {
      setStatus("ACTIVE");
      const nowIso = new Date().toISOString();
      setLastCapturedAt(nowIso);
      merchantService.updateSessionStatus(merchant.id, "ACTIVE");
      showToast("Sesi berjualan dilanjutkan kembali.");
    }
  };

  const handleEndSession = async () => {
    setIsPending(true);
    const res = await toggleSellingSessionAction(merchant.id, "END");
    setIsPending(false);

    if (res.ok) {
      setStatus("ENDED");
      const nowIso = new Date().toISOString();
      setLastCapturedAt(nowIso);
      merchantService.updateSessionStatus(merchant.id, "ENDED");
      setShowEndModal(false);
      showToast("Sesi berjualan telah diakhiri untuk hari ini.");
    }
  };

  const handleSaveManualCoords = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      showToast("Koordinat tidak valid! Harap masukkan angka latitude & longitude yang benar.");
      return;
    }

    await setManualCoords(lat, lng);
    setShowManualModal(false);
    showToast("Titik lokasi gerobak berhasil diperbarui secara manual ke database!");
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-3 text-xs shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl border border-slate-200 shadow-inner">
                <span>{merchant.iconEmoji || "🍲"}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900">{merchant.name}</h1>
                  <StatusBadge status={status} />
                  {isTracking && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                      <Radio className="h-3 w-3" />
                      GPS Live
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Pemilik: <span className="font-semibold text-slate-800">{user?.name || merchant.ownerName}</span> • {merchant.district}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/merchant/profile"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition"
              >
                <Settings className="h-3.5 w-3.5 text-slate-500" /> Profil
              </Link>
              <Link
                href="/merchant/schedule"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition"
              >
                <Calendar className="h-3.5 w-3.5 text-slate-500" /> Jadwal
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        {/* Tracker Warning / Error if GPS denied */}
        {trackerGpsError && status === "ACTIVE" && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Akses GPS Browser Belum Diizinkan</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  {trackerGpsError} Anda dapat mengatur koordinat pangkalan secara manual agar gerobak tetap tampil di peta.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowManualModal(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-800 transition shrink-0"
            >
              <MapPin className="h-3.5 w-3.5" />
              Tentukan Titik Manual
            </button>
          </div>
        )}

        {/* Session Control Hero Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Panel Kontrol Sesi Berjualan (Real-time Telemetri)
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  {status === "ACTIVE" && "Gerobak Sedang Berkeliling Aktif"}
                  {status === "PAUSED" && "Sesi Dijeda — Sedang Istirahat"}
                  {status === "ENDED" && "Lapak Tutup — Belum Memulai Sesi"}
                </h2>
                <p className="text-xs text-slate-600 mt-1 max-w-xl">
                  {status === "ACTIVE" &&
                    "Lokasi GPS gerobak Anda kini terpancar otomatis setiap 15 detik atau saat berpindah > 5 meter. Pastikan tab browser tetap terbuka."}
                  {status === "PAUSED" &&
                    "Pelanggan dapat melihat gerobak Anda sedang istirahat sejenak dan posisi terakhir tetap tercatat di peta."}
                  {status === "ENDED" &&
                    "Tekan 'Mulai Berjualan' saat Anda siap mendorong gerobak atau mulai mangkal untuk memancarkan sinyal ke pelanggan."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {status === "ENDED" && (
                  <button
                    type="button"
                    onClick={handleStartSession}
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition disabled:opacity-50"
                  >
                    <Play className="h-4 w-4 fill-white" />
                    {isPending ? "Memproses..." : "Mulai Berjualan Hari Ini"}
                  </button>
                )}

                {status === "ACTIVE" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        sendCurrentLocation();
                        showToast("Sinyal lokasi GPS berhasil dipancarkan ke database!");
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 px-3.5 py-3 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
                      title="Pancarkan koordinat terkini ke database sekarang"
                    >
                      <Send className="h-3.5 w-3.5 text-emerald-700" />
                      Pancarkan Sinyal Sekarang
                    </button>
                    <button
                      type="button"
                      onClick={handlePauseSession}
                      disabled={isPending}
                      className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition disabled:opacity-50"
                    >
                      <Pause className="h-4 w-4" />
                      Jeda (Istirahat)
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEndModal(true)}
                      disabled={isPending}
                      className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition disabled:opacity-50"
                    >
                      <StopCircle className="h-4 w-4" />
                      Akhiri Sesi
                    </button>
                  </>
                )}

                {status === "PAUSED" && (
                  <>
                    <button
                      type="button"
                      onClick={handleResumeSession}
                      disabled={isPending}
                      className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition disabled:opacity-50"
                    >
                      <Play className="h-4 w-4 fill-white" />
                      Lanjutkan Berjualan
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEndModal(true)}
                      disabled={isPending}
                      className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition disabled:opacity-50"
                    >
                      <StopCircle className="h-4 w-4" />
                      Akhiri Sesi
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Live Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-4 w-4 text-emerald-700" />
                    <span className="text-xs font-semibold">Titik Lokasi Terkini</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowManualModal(true)}
                    className="text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    Ubah Manual
                  </button>
                </div>
                <div className="text-sm font-bold text-slate-900 font-mono">
                  {displayLat.toFixed(5)}, {displayLng.toFixed(5)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {liveAccuracy ? `Akurasi GPS: ±${Math.round(liveAccuracy)}m` : merchant.location.addressHint}
                  {liveSpeed !== null && liveSpeed > 0 && ` • ${((liveSpeed * 3.6).toFixed(1))} km/h`}
                  {liveHeading !== null && ` • Arah: ${Math.round(liveHeading)}°`}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-semibold">Kesegaran Sinyal GPS</span>
                </div>
                <div className="flex items-center gap-2">
                  <FreshnessBadge freshness={freshness} />
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {status === "ACTIVE"
                    ? "Broadcast aktif ke Supabase PostgreSQL"
                    : "Sinyal diperbarui saat sesi aktif"}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <Store className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-semibold">Status Profil Lapak</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Terverifikasi JejakLapak</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Kategori: {merchant.category}
                </div>
              </div>
            </div>

            {/* PRD Transparency Banner regarding background tracking */}
            <div className="mt-4 rounded-xl bg-slate-100/70 p-3 text-[11px] text-slate-600 border border-slate-200/60 flex items-start gap-2">
              <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
              <span>
                <strong>Ketentuan Privasi & Perangkat:</strong> Pelacakan lokasi berlangsung aman menggunakan Geolocation API browser dan hanya mengirim sinyal saat sesi berstatus <strong>ACTIVE</strong> dengan tab tetap terbuka. Kami tidak melacak posisi Anda saat sesi diakhiri atau browser ditutup.
              </span>
            </div>
          </div>
        </div>

        {/* Quick Links & Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Navigation className="h-4 w-4 text-emerald-700" />
              Area Keliling & Rute Pangkalan
            </h3>
            <p className="text-xs text-slate-600">
              Pelanggan melihat rute dan pangkalan pedagang di informasi detail pedagang:
            </p>
            <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-2 border border-slate-100">
              <div>
                <span className="text-slate-500 block text-[11px]">Pangkalan Dapur:</span>
                <span className="font-semibold text-slate-900">{merchant.location.addressHint}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Cakupan Area Keliling:</span>
                <span className="font-semibold text-slate-900">{merchant.operatingArea}</span>
              </div>
            </div>
            <Link
              href="/merchant/profile"
              className="inline-block text-xs font-semibold text-emerald-700 hover:underline"
            >
              Ubah Alamat atau Rute →
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-600" />
              Jadwal Buka Rutin
            </h3>
            <p className="text-xs text-slate-600">
              Jadwal mingguan Anda membantu pembeli merencanakan kunjungan atau panggilan:
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              {merchant.schedule.slice(0, 4).map((s) => (
                <div key={s.dayOfWeek} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                  <span className="font-semibold text-slate-700">{s.dayName}</span>
                  <span className={s.isOpen ? "text-emerald-700 font-bold" : "text-slate-400"}>
                    {s.isOpen ? `${s.startTime}-${s.endTime}` : "Libur"}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/merchant/schedule"
              className="inline-block text-xs font-semibold text-emerald-700 hover:underline"
            >
              Kelola Jadwal Lengkap 7 Hari →
            </Link>
          </div>
        </div>
      </div>

      {/* Manual Location Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Atur Titik Lokasi Manual</h3>
              <p className="text-xs text-slate-600 mt-1">
                Gunakan fitur ini jika sensor GPS perangkat tidak aktif atau Anda ingin mematok titik mangkal tertentu di Bandung Raya.
              </p>
            </div>

            <form onSubmit={handleSaveManualCoords} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Latitude</label>
                <input
                  type="text"
                  required
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  placeholder="-6.9032"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Longitude</label>
                <input
                  type="text"
                  required
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  placeholder="107.6231"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {/* Preset Shortcuts */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Shortcut Titik Populer:</span>
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => { setManualLat("-6.9032"); setManualLng("107.6231"); }}
                    className="px-2 py-1 rounded bg-slate-100 text-[10px] font-medium hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    Taman Lansia
                  </button>
                  <button
                    type="button"
                    onClick={() => { setManualLat("-6.8885"); setManualLng("107.6145"); }}
                    className="px-2 py-1 rounded bg-slate-100 text-[10px] font-medium hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    Dipati Ukur / Unpad
                  </button>
                  <button
                    type="button"
                    onClick={() => { setManualLat("-6.9288"); setManualLng("107.6185"); }}
                    className="px-2 py-1 rounded bg-slate-100 text-[10px] font-medium hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    Lengkong Kecil
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition"
                >
                  Simpan & Pancarkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal to End Session */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Akhiri Sesi Berjualan Hari Ini?</h3>
              <p className="text-xs text-slate-600 mt-1">
                Pin gerobak Anda akan berubah menjadi status &quot;TUTUP&quot; di peta publik pelanggan dan pelacakan GPS akan dihentikan.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleEndSession}
                disabled={isPending}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition disabled:opacity-50"
              >
                {isPending ? "Memproses..." : "Ya, Akhiri Sesi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
