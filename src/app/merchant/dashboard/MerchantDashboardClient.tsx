"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { merchantService, calculateFreshness } from "@/services/mock/merchantService";
import { toggleSellingSessionAction, toggleMenuItemAvailabilityAction } from "@/actions/merchant";
import { useMerchantLocationTracker } from "@/hooks/useMerchantLocationTracker";
import { Merchant, SellingStatus } from "@/types/merchant";
import MaplibreView from "@/components/map/MaplibreView";
import {
  Pause,
  MapPin,
  Store,
  CheckCircle2,
  Navigation,
  RefreshCw,
  UtensilsCrossed,
  Power,
  X,
  PanelLeft,
  ChevronDown,
  Share2,
  ExternalLink,
} from "lucide-react";
import { AuthUser } from "@/server/auth";
import { MerchantSidebar } from "@/components/merchant/MerchantSidebar";
import { toast } from "@/components/ui/sonner";

export default function MerchantDashboardClient({
  user,
  initialMerchant,
}: {
  user?: AuthUser;
  initialMerchant?: Merchant | null;
}) {
  const fallbackMerchant: Merchant = {
    id: user?.merchantId || user?.id || "merchant-new",
    ownerId: user?.id || "",
    ownerName: user?.name || "Mitra Pedagang",
    name: user?.merchantName || "Lapak Saya",
    slug: user?.merchantSlug || "lapak-saya",
    tagline: "",
    description: "",
    category: "Makanan Berat",
    image: "",
    phone: user?.phone || "",
    district: "Kota Bandung",
    city: "Bandung",
    operatingArea: "Kota Bandung",
    verificationStatus: "PENDING",
    sellingStatus: "ENDED",
    location: {
      id: user?.merchantId || user?.id || "merchant-new",
      merchantId: user?.merchantId || user?.id || "merchant-new",
      latitude: -6.9175,
      longitude: 107.6191,
      accuracyMeters: 10,
      heading: 0,
      speedKmh: 0,
      batteryLevel: 100,
      addressHint: "Kota Bandung",
      district: "Kota Bandung",
      city: "Bandung",
      capturedAt: new Date().toISOString(),
    },
    schedule: [],
    breadcrumbs: [],
    menu: [],
    createdAt: new Date().toISOString(),
  };

  const defaultMerchant = initialMerchant || fallbackMerchant;
  const [merchant, setMerchant] = useState<Merchant>(defaultMerchant);
  const [status, setStatus] = useState<SellingStatus>(defaultMerchant.sellingStatus);
  const [lastCapturedAt, setLastCapturedAt] = useState(defaultMerchant.location.capturedAt);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualLat, setManualLat] = useState(defaultMerchant.location.latitude.toString());
  const [manualLng, setManualLng] = useState(defaultMerchant.location.longitude.toString());
  const [isPending, setIsPending] = useState(false);
  const [isRefreshingGps, setIsRefreshingGps] = useState(false);

  // Sync merchant with live database on mount
  useEffect(() => {
    async function loadMerchantData() {
      const targetId = user?.merchantId || user?.merchantSlug;
      if (!targetId) return;

      try {
        const res = await fetch(`/api/merchants/${encodeURIComponent(targetId)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.ok && json.data) {
            setMerchant(json.data);
            setStatus(json.data.sellingStatus);
            setLastCapturedAt(json.data.location.capturedAt);
            setManualLat(json.data.location.latitude.toString());
            setManualLng(json.data.location.longitude.toString());
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

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    if (type === "error") {
      toast.error(msg);
    } else if (type === "info") {
      toast.info(msg);
    } else {
      toast.success(msg);
    }
  };

  const handleSelectStatus = async (targetStatus: SellingStatus) => {
    setShowStatusDropdown(false);
    if (targetStatus === status) return;

    if (targetStatus === "ENDED") {
      setShowEndModal(true);
      return;
    }

    setIsPending(true);
    if (targetStatus === "ACTIVE") {
      const actionType = status === "PAUSED" ? "RESUME" : "START";
      const res = await toggleSellingSessionAction(merchant.id, actionType);
      setIsPending(false);
      if (res.ok) {
        setStatus("ACTIVE");
        const nowIso = new Date().toISOString();
        setLastCapturedAt(nowIso);
        merchantService.updateSessionStatus(merchant.id, "ACTIVE");
        showToast("Status berhasil diubah: Sedang Berjualan (Lokasi memancar di peta)");
      }
    } else if (targetStatus === "PAUSED") {
      const res = await toggleSellingSessionAction(merchant.id, "PAUSE");
      setIsPending(false);
      if (res.ok) {
        setStatus("PAUSED");
        const nowIso = new Date().toISOString();
        setLastCapturedAt(nowIso);
        merchantService.updateSessionStatus(merchant.id, "PAUSED");
        showToast("Status berhasil diubah: Sedang Istirahat");
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
      showToast("Status berhasil diubah: Tidak Aktif (Sesi jualan ditutup)");
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

  const codeTracker = `BDG-${merchant.id.substring(merchant.id.length - 4).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-[#f4f8fb] font-sans text-slate-800 antialiased flex">
      {/* Merchant Sidebar */}
      <MerchantSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        merchantName={merchant.name}
        merchantSlug={merchant.slug}
        photoUrl={merchant.image}
        sellingStatus={status}
        trackerCode={codeTracker}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20">
        {/* 1. Top Header Pedagang */}
        <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200 z-30 px-4 sm:px-8 py-3 shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            {/* Sisi Kiri: Tombol Buka Sidebar (muncul HANYA ketika sidebar tertutup, tiru maps) */}
            <div className="flex items-center gap-3">
              {!isSidebarOpen && (
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Buka Menu Sidebar"
                  className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl shadow-xs border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50 hover:text-[#006194] transition-colors cursor-pointer"
                >
                  <PanelLeft className="h-4 w-4 text-[#006194]" />
                  <span>Menu Sidebar</span>
                </button>
              )}
            </div>

            {/* Sisi Kanan: Single Status Dropdown (Ramah Layar HP / Mobile Friendly) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStatusDropdown((prev) => !prev)}
                disabled={isPending}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer ${
                  status === "ACTIVE"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : status === "PAUSED"
                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                    : "bg-slate-700 hover:bg-slate-800 text-white"
                }`}
              >
                {status === "ACTIVE" ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span>Sedang Berjualan</span>
                  </>
                ) : status === "PAUSED" ? (
                  <>
                    <Pause className="h-3 w-3" />
                    <span>Sedang Istirahat</span>
                  </>
                ) : (
                  <>
                    <Power className="h-3 w-3" />
                    <span>Tidak Aktif</span>
                  </>
                )}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${
                    showStatusDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Status Dropdown Menu Card */}
              {showStatusDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowStatusDropdown(false)}
                  />
                  <div className="absolute right-0 top-[calc(100%+8px)] w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-40 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                      Pilih Status Jualan Anda
                    </div>

                    {/* Opsi 1: Sedang Berjualan */}
                    <button
                      type="button"
                      onClick={() => handleSelectStatus("ACTIVE")}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-start gap-2.5 cursor-pointer ${
                        status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-950 border border-emerald-200 font-bold"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0 animate-pulse" />
                      <div>
                        <div className="font-bold text-slate-900">Sedang Berjualan</div>
                        <p className="text-[11px] text-slate-500 font-normal leading-tight mt-0.5">
                          Lokasi gerobak memancar live ke calon pembeli di peta
                        </p>
                      </div>
                    </button>

                    {/* Opsi 2: Sedang Istirahat */}
                    <button
                      type="button"
                      onClick={() => handleSelectStatus("PAUSED")}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-start gap-2.5 cursor-pointer ${
                        status === "PAUSED"
                          ? "bg-amber-50 text-amber-950 border border-amber-200 font-bold"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <Pause className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">Sedang Istirahat</div>
                        <p className="text-[11px] text-slate-500 font-normal leading-tight mt-0.5">
                          Jeda makan / ibadah sejenak, pembeli tahu lapak sedang jeda
                        </p>
                      </div>
                    </button>

                    {/* Opsi 3: Tidak Aktif */}
                    <button
                      type="button"
                      onClick={() => handleSelectStatus("ENDED")}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-start gap-2.5 cursor-pointer ${
                        status === "ENDED"
                          ? "bg-slate-100 text-slate-900 border border-slate-300 font-bold"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <Power className="h-3.5 w-3.5 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">Tidak Aktif</div>
                        <p className="text-[11px] text-slate-500 font-normal leading-tight mt-0.5">
                          Tutup jualan hari ini dan matikan siaran lokasi di peta
                        </p>
                      </div>
                    </button>
                  </div>
                </>
              )}
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

          {/* Card 2: Wilayah Operasional Terdaftar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Wilayah Operasional
              </span>
              <div className="text-lg font-bold text-slate-900 leading-snug line-clamp-1">
                {merchant.operatingArea || merchant.district || "Kota Bandung"}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Kecamatan {merchant.district || "Bandung Wetan"}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-[#006194] flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
          </div>

          {/* Card 3: Menu Siap Saji */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7]">
                Menu Siap Saji
              </span>
              <div className="text-2xl font-black text-slate-900 leading-none">
                {merchant.menu.filter((m) => m.isAvailable ?? true).length}{" "}
                <span className="text-sm font-semibold text-slate-500">
                  / {merchant.menu.length} Varian
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {merchant.menu.filter((m) => m.isAvailable ?? true).length > 0
                  ? "Varian menu aktif & siap dipesan warga"
                  : "Semua varian menu ditandai habis"}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center shrink-0">
              <UtensilsCrossed className="h-5 w-5" />
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
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#006194] hover:bg-[#004d77] text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
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
                selectedMerchantId={null}
                onSelectMerchant={() => {}}
                userLocation={[displayLng, displayLat]}
              />

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
                      onClick={() => handleToggleMenuItemStock(menuItem.id, menuItem.isAvailable ?? true)}
                      className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                        (menuItem.isAvailable ?? true)
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                      }`}
                    >
                      {(menuItem.isAvailable ?? true) ? "Tersedia" : "Habis"}
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

            {/* 2. Tautan & Promosi Lapak */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-[#0284c7]" />
                    Promosikan Lapak Anda
                  </h3>
                  <p className="text-xs text-slate-500">
                    Bagikan tautan peta live ke pelanggan atau grup WhatsApp
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100 space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pelanggan dapat memantau rute dan posisi gerobak Anda secara langsung melalui peta publik JejakLapak tanpa perlu menginstal aplikasi.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <Link
                    href={`/explore?merchant=${merchant.slug || merchant.id}`}
                    target="_blank"
                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#006194] hover:bg-[#004d77] text-white text-xs font-bold transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Lihat di Peta Pembeli
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        const url = `${window.location.origin}/explore?merchant=${merchant.slug || merchant.id}`;
                        navigator.clipboard?.writeText(url);
                        showToast("Tautan lapak berhasil disalin ke clipboard!");
                      }
                    }}
                    className="w-full sm:w-auto py-2 px-3 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Salin Tautan
                  </button>
                </div>
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
                  className="rounded-xl bg-[#006194] hover:bg-[#004d77] px-4 py-2 text-xs font-bold text-white transition"
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
              <h3 className="text-lg font-bold text-slate-900">Ubah Status Menjadi Tidak Aktif?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Sesi jualan hari ini akan ditutup dan pin gerobak Anda tidak lagi muncul sebagai aktif di peta pembeli.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handleEndSession}
                disabled={isPending}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isPending ? "Memproses..." : "Ya, Ubah Menjadi Tidak Aktif"}
              </button>
              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}