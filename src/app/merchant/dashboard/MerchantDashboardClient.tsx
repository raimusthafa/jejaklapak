"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MOCK_MERCHANTS } from "@/data/mock/merchants";
import { merchantService, calculateFreshness } from "@/services/mock/merchantService";
import { toggleSellingSessionAction, toggleMenuItemAvailabilityAction } from "@/actions/merchant";
import { useMerchantLocationTracker } from "@/hooks/useMerchantLocationTracker";
import { Merchant, SellingStatus } from "@/types/merchant";
import MaplibreView from "@/components/map/MaplibreView";
import {
  Play,
  Pause,
  MapPin,
  Store,
  CheckCircle2,
  Navigation,
  Eye,
  Bell,
  RefreshCw,
  UtensilsCrossed,
  TrendingUp,
  Power,
  X,
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
  const [isRefreshingGps, setIsRefreshingGps] = useState(false);

  // Mock incoming customer calls
  const [incomingCalls, setIncomingCalls] = useState([
    {
      id: "call-1",
      name: "Rian Nugraha",
      distance: "±70 meter",
      time: "11:42",
      notes: "Mang mampir ke depan Kantor Pos ya, pesan 3 porsi",
      status: "PENDING" as "PENDING" | "ACCEPTED" | "COMPLETED",
    },
    {
      id: "call-2",
      name: "Siti Maryam",
      distance: "±120 meter",
      time: "11:15",
      notes: "Batagor kuah 2 porsi jangan pedas ya kang",
      status: "COMPLETED" as "PENDING" | "ACCEPTED" | "COMPLETED",
    },
  ]);

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
    lastSentAt: liveLastSentAt,
    setManualCoords,
    sendCurrentLocation,
  } = useMerchantLocationTracker({
    merchantId: merchant.id,
    isActive: status === "ACTIVE",
    intervalMs: 15000,
    minDistanceMeters: 5,
  });

  const activeCapturedAt = liveLastSentAt || lastCapturedAt;
  const freshness = calculateFreshness(activeCapturedAt);

  const displayLat = liveCoords ? liveCoords.latitude : merchant.location.latitude;
  const displayLng = liveCoords ? liveCoords.longitude : merchant.location.longitude;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleStatus = async () => {
    if (status === "ACTIVE") {
      setShowEndModal(true);
    } else {
      setIsPending(true);
      const res = await toggleSellingSessionAction(merchant.id, "START");
      setIsPending(false);

      if (res.ok) {
        setStatus("ACTIVE");
        const nowIso = new Date().toISOString();
        setLastCapturedAt(nowIso);
        merchantService.updateSessionStatus(merchant.id, "ACTIVE");
        showToast("Siaran aktif! Lapak Anda sekarang terlihat oleh pembeli di peta.");
      }
    }
  };

  const handleToggleJeda = async () => {
    setIsPending(true);
    if (status === "PAUSED") {
      const res = await toggleSellingSessionAction(merchant.id, "RESUME");
      setIsPending(false);
      if (res.ok) {
        setStatus("ACTIVE");
        const nowIso = new Date().toISOString();
        setLastCapturedAt(nowIso);
        merchantService.updateSessionStatus(merchant.id, "ACTIVE");
        showToast("Lapak aktif kembali berjualan!");
      }
    } else {
      const res = await toggleSellingSessionAction(merchant.id, "PAUSE");
      setIsPending(false);
      if (res.ok) {
        setStatus("PAUSED");
        const nowIso = new Date().toISOString();
        setLastCapturedAt(nowIso);
        merchantService.updateSessionStatus(merchant.id, "PAUSED");
        showToast("Status berubah: Sedang Istirahat / Sholat.");
      }
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
      showToast("Lapak ditutup. Sampai jumpa besok!");
    }
  };

  const handleRefreshGps = async () => {
    setIsRefreshingGps(true);
    await sendCurrentLocation();
    setTimeout(() => {
      setIsRefreshingGps(false);
      showToast("Titik lokasi GPS berhasil dicocokkan ulang ke satelit!");
    }, 700);
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
    showToast("Titik lokasi pangkalan berhasil diperbarui secara manual!");
  };

  const handleToggleMenuItemStock = async (menuId: string, currentAvailable: boolean) => {
    const nextVal = !currentAvailable;
    // Optimistic
    setMerchant((prev) => ({
      ...prev,
      menu: prev.menu.map((m) => (m.id === menuId ? { ...m, isAvailable: nextVal } : m)),
    }));

    const res = await toggleMenuItemAvailabilityAction(merchant.id, menuId, nextVal);
    if (res.ok) {
      showToast(nextVal ? "Menu ditandai Tersedia." : "Menu ditandai Habis.");
    }
  };

  const handleRespondCall = (callId: string) => {
    setIncomingCalls((prev) =>
      prev.map((c) => (c.id === callId ? { ...c, status: "ACCEPTED" } : c))
    );
    showToast("Pesan terkirim ke pembeli: Anda sedang menuju ke lokasi!");
  };

  const handleCompleteCall = (callId: string) => {
    setIncomingCalls((prev) =>
      prev.map((c) => (c.id === callId ? { ...c, status: "COMPLETED" } : c))
    );
    showToast("Panggilan telah ditandai selesai.");
  };

  const codeTracker = `BDG-${merchant.id.substring(merchant.id.length - 4).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-[#f4f8fb] font-sans text-slate-800 antialiased pb-20">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-3 text-xs shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-[#60C1E5] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Top Header Pedagang (Stitch Design) */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200 z-40 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Identity & Status Indicator */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              {status === "ACTIVE" ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 block animate-ping absolute -top-0.5 -right-0.5"></span>
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 block"></span>
                </>
              ) : status === "PAUSED" ? (
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 block"></span>
              ) : (
                <span className="w-3.5 h-3.5 rounded-full bg-slate-400 block"></span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                  {merchant.name}
                </h1>
                <span className="text-xl">{merchant.iconEmoji || "🍲"}</span>
              </div>
              <p className="text-xs font-semibold text-slate-500">
                ID Lapak: <span className="font-bold text-slate-700">#{codeTracker}</span> • {merchant.category} • Gerobak Keliling
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Main Toggle Siaran Button */}
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={isPending}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all disabled:opacity-50 ${
                status === "ACTIVE"
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-[#60C1E5] hover:bg-[#4eb3d8] text-slate-900"
              }`}
            >
              {status === "ACTIVE" ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Aktif Berjualan</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-slate-900" />
                  <span>Mulai Berjualan</span>
                </>
              )}
            </button>

            {/* Jeda Button */}
            {status !== "ENDED" && (
              <button
                type="button"
                onClick={handleToggleJeda}
                disabled={isPending}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-xs sm:text-sm transition-all disabled:opacity-50 ${
                  status === "PAUSED"
                    ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                }`}
              >
                {status === "PAUSED" ? (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Lanjutkan Jualan</span>
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4" />
                    <span>Jeda Istirahat</span>
                  </>
                )}
              </button>
            )}

            {/* Tutup Lapak Button */}
            {status !== "ENDED" && (
              <button
                type="button"
                onClick={() => setShowEndModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs sm:text-sm transition-all"
              >
                <Power className="h-4 w-4" />
                <span>Tutup Lapak</span>
              </button>
            )}

            <div className="h-7 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

            {/* Owner Profile Link */}
            <Link
              href="/merchant/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition"
              title="Edit Profil Lapak"
            >
              <div className="w-8 h-8 rounded-full bg-[#60C1E5] flex items-center justify-center font-bold text-slate-900 text-xs">
                {(user?.name || merchant.ownerName).charAt(0)}
              </div>
              <div className="flex flex-col text-left hidden lg:flex">
                <span className="font-bold text-xs text-slate-800 line-clamp-1">
                  {user?.name || merchant.ownerName}
                </span>
                <span className="text-[10px] text-[#0284c7] font-semibold">Pengaturan Profil →</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main Container */}
      <main className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
        {/* 3 Status Cards (Stitch Design) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Status GPS & Lokasi Saat Ini */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7] flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    status === "ACTIVE" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                  }`}
                ></span>
                {status === "ACTIVE" ? "Lokasi GPS Terdeteksi" : "Lapak Siaga (Off)"}
              </span>
              <div className="text-base font-bold text-slate-900 leading-snug line-clamp-1">
                {merchant.location.addressHint || "Kota Bandung"}
              </div>
              <p className="text-xs text-slate-500">
                {merchant.district} •{" "}
                <span className="text-slate-700 font-semibold">
                  {freshness === "LIVE"
                    ? "Diperbarui < 2 mnt lalu"
                    : freshness === "RECENT"
                    ? "Diperbarui 5 mnt lalu"
                    : "Pembaruan pangkalan"}
                </span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#e6f6fc] text-[#0284c7] flex items-center justify-center shrink-0">
              <Navigation className="h-5 w-5" />
            </div>
          </div>

          {/* Card 2: Pembeli Melihat Lapak Hari Ini */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Melihat Lapak Hari Ini
              </span>
              <div className="text-2xl font-black text-slate-900 leading-none">
                24 <span className="text-sm font-semibold text-slate-500">Warga</span>
              </div>
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> Ramai di radius 500 meter
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center shrink-0">
              <Eye className="h-5 w-5" />
            </div>
          </div>

          {/* Card 3: Panggilan Bel Masuk */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Panggilan Bel Masuk
              </span>
              <div className="text-2xl font-black text-slate-900 leading-none">
                {incomingCalls.filter((c) => c.status !== "COMPLETED").length}{" "}
                <span className="text-sm font-semibold text-slate-500">Panggilan</span>
              </div>
              <p className="text-xs text-amber-700 font-medium">
                {incomingCalls.some((c) => c.status === "PENDING")
                  ? "1 panggilan menunggu tanggapan Anda!"
                  : "Semua panggilan telah dilayani"}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Bell className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* 3. Main 2-Column Content Grid (12 Columns: 7 Left, 5 Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Peta Posisi Lapak Anda Saat Ini (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#0284c7]" />
                  Peta Posisi Gerobak Anda
                </h2>
                <p className="text-xs text-slate-500">
                  Titik ini yang terlihat oleh calon pembeli di HP mereka secara real-time.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(true)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Ubah Manual
                </button>
                <button
                  type="button"
                  onClick={handleRefreshGps}
                  disabled={isRefreshingGps}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#60C1E5] hover:bg-[#4eb3d8] text-slate-900 font-bold text-xs shadow-xs transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshingGps ? "animate-spin" : ""}`} />
                  Perbarui Titik Lokasi
                </button>
              </div>
            </div>

            {/* Peta Interaktif MapLibre Viewport */}
            <div className="relative w-full h-[420px] rounded-xl overflow-hidden border border-slate-200 shadow-inner">
              <MaplibreView
                merchants={[
                  {
                    ...merchant,
                    location: {
                      ...merchant.location,
                      latitude: displayLat,
                      longitude: displayLng,
                    },
                  },
                ]}
                selectedMerchantId={merchant.id}
                onSelectMerchant={() => {}}
                userLocation={[displayLng, displayLat]}
              />

              {/* Pin Tengah Floating Card Highlight */}
              <div className="absolute top-4 left-4 z-20 pointer-events-none">
                <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-bold shadow-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Lapak Anda di Sini: {displayLat.toFixed(4)}, {displayLng.toFixed(4)}
                </div>
              </div>

              {/* Bottom Floating Telemetry Bar */}
              <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200/90 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-700">
                    {status === "ACTIVE"
                      ? "Sinyal GPS Terbuka & Aktif ke calon pembeli"
                      : "Sesi offline. Aktifkan sesi untuk memancarkan posisi"}
                  </span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Akurasi: ±{Math.round(liveAccuracy || 6)}m
                </span>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Menu Stok & Panggilan Pembeli (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1. Menu & Stok Hari Ini */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <UtensilsCrossed className="h-4 w-4 text-[#0284c7]" />
                    Menu &amp; Stok Hari Ini
                  </h3>
                  <p className="text-xs text-slate-500">
                    Klik tombol jika menu sudah habis terjual
                  </p>
                </div>
                <Link
                  href="/merchant/menu"
                  className="text-xs font-bold text-[#0284c7] hover:underline flex items-center gap-1"
                >
                  Kelola Menu →
                </Link>
              </div>

              <div className="space-y-2.5">
                {merchant.menu.slice(0, 4).map((menuItem) => (
                  <div
                    key={menuItem.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900">{menuItem.name}</div>
                      <div className="text-xs text-slate-500">
                        Rp {menuItem.price.toLocaleString("id-ID")} •{" "}
                        <span className="font-semibold text-slate-700">
                          {menuItem.description || "Siap saji"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleMenuItemStock(menuItem.id, true)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs hover:bg-emerald-200 transition-colors"
                    >
                      Tersedia
                    </button>
                  </div>
                ))}

                {merchant.menu.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-500">
                    Belum ada menu terdaftar.{" "}
                    <Link href="/merchant/menu" className="font-bold text-[#0284c7] underline">
                      Tambah menu pertama
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Daftar Panggilan Pembeli Terkini (Bell Call List) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Bell className="h-4 w-4 text-amber-500" />
                    Panggilan Bel Pembeli
                  </h3>
                  <p className="text-xs text-slate-500">
                    Warga terdekat yang memanggil gerobak Anda
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  {incomingCalls.length} Permintaan
                </span>
              </div>

              <div className="space-y-3">
                {incomingCalls.map((call) => (
                  <div
                    key={call.id}
                    className={`p-3.5 rounded-xl border flex flex-col gap-2.5 transition-all ${
                      call.status === "COMPLETED"
                        ? "bg-slate-50 border-slate-200 opacity-60"
                        : call.status === "ACCEPTED"
                        ? "bg-emerald-50/70 border-emerald-200"
                        : "bg-amber-50/70 border-amber-200"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{call.name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                            {call.distance}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">&quot;{call.notes}&quot;</p>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">{call.time}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                      {call.status === "COMPLETED" ? (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          ✓ Sudah Dilayani
                        </span>
                      ) : call.status === "ACCEPTED" ? (
                        <>
                          <span className="flex-1 text-center py-1.5 px-3 rounded-lg bg-emerald-600 text-white text-xs font-bold">
                            ✓ Sedang Menuju ke Lokasi
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCompleteCall(call.id)}
                            className="py-1.5 px-3 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                          >
                            Selesai
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleRespondCall(call.id)}
                            className="flex-1 py-1.5 px-3 rounded-lg bg-[#60C1E5] hover:bg-[#4eb3d8] text-slate-900 text-xs font-bold transition-colors text-center"
                          >
                            Saya Segera Merapat
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCompleteCall(call.id)}
                            className="py-1.5 px-3 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                          >
                            Selesai
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Manual Koordinat */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Ubah Titik Lokasi Pangkalan Manual</h3>
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualCoords} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Latitude</label>
                <input
                  type="text"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 font-mono focus:border-[#0284c7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Longitude</label>
                <input
                  type="text"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 font-mono focus:border-[#0284c7] focus:outline-none"
                />
              </div>

              {/* Preset Shortcuts */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Shortcut Titik Populer:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setManualLat("-6.9032");
                      setManualLng("107.6231");
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-medium hover:bg-sky-50 hover:text-[#0284c7]"
                  >
                    Taman Lansia
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualLat("-6.8885");
                      setManualLng("107.6145");
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-medium hover:bg-sky-50 hover:text-[#0284c7]"
                  >
                    Dipati Ukur / Unpad
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualLat("-6.9288");
                      setManualLng("107.6185");
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-medium hover:bg-sky-50 hover:text-[#0284c7]"
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
                  className="rounded-xl bg-[#60C1E5] hover:bg-[#4eb3d8] px-4 py-2 text-xs font-bold text-slate-900 transition"
                >
                  Simpan &amp; Pancarkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Tutup Lapak (Stitch Design) */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Akhiri Sesi Berjualan?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Lapak Anda akan ditutup dan pin gerobak tidak lagi muncul sebagai aktif di peta pelanggan.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handleEndSession}
                disabled={isPending}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50"
              >
                {isPending ? "Memproses..." : "Ya, Tutup Lapak Sekarang"}
              </button>
              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all"
              >
                Kembali Lanjut Jualan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
