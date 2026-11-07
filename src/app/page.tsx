"use client";

import Link from "next/link";
import { useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Compass,
  Store,
  Navigation,
  Eye,
  Zap,
  Clock,
  Heart,
  Plus,
  Minus,
  ShieldCheck,
  Bike,
} from "lucide-react";

const LandingMapPreview = dynamic(
  () => import("@/components/landing/LandingMapPreview"),
  { ssr: false }
);

export default function HomePage() {

  const mapApiRef = useRef<{ zoomIn: () => void; zoomOut: () => void } | null>(null);

  const handleMapReady = useCallback(
    (api: { zoomIn: () => void; zoomOut: () => void }) => {
      mapApiRef.current = api;
    },
    []
  );

  return (
    <div className="flex flex-col w-full bg-[#f8f9ff] text-[#0d1c2e] antialiased">
      {/* 1. Top Utility Announcement & Telemetry Bar */}
      <section className="w-full bg-[#dce9ff] py-2.5 px-4 lg:px-8 border-b border-[#bfc7d2]/30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-[#3f4850] font-medium">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#79d8fd] text-[#005e77] text-[11px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006781] animate-ping"></span>
              Live Sync
            </span>
            <span className="text-xs sm:text-sm text-[#0d1c2e]">
              Koridor Dago, Dipatiukur, Riau, Braga &amp; Lengkong aktif terpantau
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-[#3f4850]">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-[#006781]" />
              Pembaruan latensi &lt; 8 detik
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#006781]" />
              Data GPS OpenStreetMap
            </span>
          </div>
        </div>
      </section>

      {/* 2. Hero Section with Dual Spatial Layout */}
      <section className="w-full py-12 lg:py-20 px-4 lg:px-8 bg-[#f8f9ff]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Narrative Column */}
          <div className="lg:col-span-6 flex flex-col items-start gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e6eeff] text-[#006194] text-xs font-semibold tracking-wide">
              <Compass className="h-4 w-4 text-[#006194]" />
              <span>Know where they sell, know when they&apos;re there.</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0d1c2e] tracking-tight leading-[1.15]">
              Temukan &amp; Pantau <br className="hidden sm:inline" />
              <span className="text-[#006194] underline decoration-[#79d8fd] decoration-4 underline-offset-8">
                UMKM Keliling
              </span>{" "}
              Favoritmu di Bandung
            </h1>

            <p className="text-base sm:text-lg text-[#3f4850] max-w-xl leading-relaxed">
              Infrastruktur pemetaan gerobak jajanan, pikulan kuliner, dan jasa keliling secara real-time. Lacak posisi GPS presisi pedagang legendaris tanpa rasa penasaran.
            </p>

            {/* CTA Cluster */}
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#006194] hover:bg-[#007bb9] text-white font-semibold text-sm shadow-md transition-all active:scale-[0.98]"
              >
                <Compass className="h-5 w-5" />
                <span>Buka Peta Eksplorasi</span>
              </Link>
              <Link
                href="/merchant/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#e6eeff] hover:bg-[#dce9ff] text-[#0d1c2e] font-semibold text-sm transition-colors border border-[#bfc7d2]/40"
              >
                <Store className="h-5 w-5 text-[#006194]" />
                <span>Daftarkan Lapak Anda</span>
              </Link>
            </div>

            {/* Live Micro-Stats Bar */}
            <div className="w-full mt-4 bg-[#eff4ff] rounded-xl p-4 border border-[#dce9ff]">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-[#006194]">142</span>
                  <span className="text-[11px] font-bold text-[#3f4850] uppercase tracking-wide">
                    Pedagang Aktif
                  </span>
                </div>
                <div className="flex flex-col bg-white/70 rounded-lg py-1 shadow-xs border border-[#bfc7d2]/30">
                  <span className="text-2xl font-bold text-[#006781]">18</span>
                  <span className="text-[11px] font-bold text-[#3f4850] uppercase tracking-wide">
                    Kecamatan Terpantau
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-[#c05400]">100%</span>
                  <span className="text-[11px] font-bold text-[#3f4850] uppercase tracking-wide">
                    Bebas Biaya
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Interactive Map Preview (Real MapLibre) */}
          <div className="lg:col-span-6 relative">
            <div className="rounded-2xl bg-white p-4 shadow-xl border border-[#dce9ff] relative overflow-hidden">
              {/* Real MapLibre Map Canvas */}
              <div className="relative w-full h-[360px] sm:h-[420px] rounded-xl overflow-hidden border border-[#bfc7d2]/40">
                {/* MapLibre fills this container absolutely */}
                <LandingMapPreview onReady={handleMapReady} />

                {/* Bottom gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#233144]/60 via-transparent to-transparent pointer-events-none z-10" />

                {/* Floating Map Controls HUD — top left */}
                <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
                  <div className="px-3 py-1 rounded-md bg-white/95 backdrop-blur-sm text-[#0d1c2e] text-xs font-semibold shadow-sm flex items-center gap-1.5 border border-[#bfc7d2]/40">
                    <span className="w-2 h-2 rounded-full bg-[#006781] animate-pulse" />
                    <span>RADAR AKTIF • KOTA BANDUNG</span>
                  </div>
                </div>

                {/* Zoom buttons — top right */}
                <div className="absolute top-3 right-3 z-20 flex flex-col gap-1">
                  <button
                    aria-label="Zoom in"
                    onClick={() => mapApiRef.current?.zoomIn()}
                    className="w-8 h-8 rounded bg-white text-[#0d1c2e] flex items-center justify-center shadow-sm hover:bg-[#eff4ff] transition border border-[#bfc7d2]/40"
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    aria-label="Zoom out"
                    onClick={() => mapApiRef.current?.zoomOut()}
                    className="w-8 h-8 rounded bg-white text-[#0d1c2e] flex items-center justify-center shadow-sm hover:bg-[#eff4ff] transition border border-[#bfc7d2]/40"
                    type="button"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>

                {/* Bottom Floating Quick Status Pod */}
                <div className="absolute bottom-3 inset-x-3 z-20 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-lg flex items-center justify-between border border-[#bfc7d2]/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#baeaff] flex items-center justify-center">
                      <Bike className="h-5 w-5 text-[#006781]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#0d1c2e]">4 Gerobak Bergerak Terdekat</div>
                      <div className="text-xs text-[#3f4850]">Radius 800 meter dari lokasi Anda</div>
                    </div>
                  </div>
                  <Link
                    href="/explore"
                    className="px-3.5 py-1.5 rounded-md bg-[#006781] text-white text-xs font-semibold hover:bg-[#005e77] transition-colors"
                  >
                    Buka
                  </Link>
                </div>
              </div>

              {/* Bottom Live Feeds Simulation Ribbon */}
              <div className="mt-3 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left text-xs text-[#3f4850]">
                <div className="flex items-center gap-2 bg-[#eff4ff] p-2.5 rounded-lg border border-[#dce9ff]">
                  <span className="w-2 h-2 rounded-full bg-[#006781] shrink-0"></span>
                  <span className="truncate">
                    <strong>Roti Lauw:</strong> Jl. Braga (Standby)
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-[#eff4ff] p-2.5 rounded-lg border border-[#dce9ff]">
                  <span className="w-2 h-2 rounded-full bg-[#006781] shrink-0"></span>
                  <span className="truncate">
                    <strong>Es Cendol E.:</strong> Inhoftank (Keliling)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Live Peddler Feed Stream (Section 6.1 Simulation) */}
      <section className="w-full py-14 px-4 lg:px-8 bg-[#eff4ff] border-t border-b border-[#dce9ff]">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <span className="text-xs text-[#006194] uppercase tracking-widest font-bold">
                Real-time Radar Feed
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0d1c2e] mt-1">
                Lapak Aktif di Koridor Bandung
              </h2>
              <p className="text-sm text-[#3f4850] mt-1">
                Status posisi aktual dari gerobak dan UMKM keliling terverifikasi hari ini.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#baeaff] text-[#001f29] text-xs font-semibold border border-[#79d8fd]">
                Live Stream Auto-Refresh
              </span>
            </div>
          </div>

          {/* Feed Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Cuanki Serayu */}
            <div className="bg-white rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-3 border border-[#dce9ff]">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-[#e6eeff] text-[#3f4850] text-[11px] font-semibold">
                    Kuliner Kuah
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#baeaff] text-[#001f29] text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006781] animate-pulse"></span>
                    LIVE (1 mnt lalu)
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#0d1c2e]">Cuanki &amp; Batagor Serayu</h3>
                <p className="text-xs text-[#3f4850] mt-1">Jl. Serayu No. 2, Cihapit • Posisi Mang Ucup</p>
              </div>
              <div className="pt-2 bg-[#eff4ff] rounded-lg p-2.5 border border-[#dce9ff]/60">
                <div className="flex items-center justify-between text-xs text-[#3f4850]">
                  <span>Jarak: ~120m</span>
                  <span className="text-[#006194] font-bold">Gerobak Standby</span>
                </div>
                <Link
                  href="/explore?q=Cuanki"
                  className="mt-2.5 w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded bg-[#006194] hover:bg-[#007bb9] text-white text-xs font-semibold transition"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Lacak Posisi</span>
                </Link>
              </div>
            </div>

            {/* Card 2: Cilor Mang Ade */}
            <div className="bg-white rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-3 border border-[#dce9ff]">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-[#e6eeff] text-[#3f4850] text-[11px] font-semibold">
                    Jajanan Aci
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#baeaff] text-[#001f29] text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006781] animate-pulse"></span>
                    LIVE (3 mnt lalu)
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#0d1c2e]">Cilor &amp; Batagor Mang Ade</h3>
                <p className="text-xs text-[#3f4850] mt-1">Area Halte Dipatiukur, Coblong</p>
              </div>
              <div className="pt-2 bg-[#eff4ff] rounded-lg p-2.5 border border-[#dce9ff]/60">
                <div className="flex items-center justify-between text-xs text-[#3f4850]">
                  <span>Jarak: ~350m</span>
                  <span className="text-[#006781] font-bold">Bergerak Lambat</span>
                </div>
                <Link
                  href="/explore?q=Batagor"
                  className="mt-2.5 w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded bg-[#006194] hover:bg-[#007bb9] text-white text-xs font-semibold transition"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Lacak Posisi</span>
                </Link>
              </div>
            </div>

            {/* Card 3: Es Cendol Elizabeth */}
            <div className="bg-white rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-3 border border-[#dce9ff]">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-[#e6eeff] text-[#3f4850] text-[11px] font-semibold">
                    Minuman Tradisional
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#baeaff] text-[#001f29] text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006781] animate-pulse"></span>
                    LIVE (5 mnt lalu)
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#0d1c2e]">Es Cendol Asli Elizabeth</h3>
                <p className="text-xs text-[#3f4850] mt-1">Koridor Jl. Inhoftank &amp; Otista</p>
              </div>
              <div className="pt-2 bg-[#eff4ff] rounded-lg p-2.5 border border-[#dce9ff]/60">
                <div className="flex items-center justify-between text-xs text-[#3f4850]">
                  <span>Jarak: ~1.2km</span>
                  <span className="text-[#006194] font-bold">Gerobak Roda 2</span>
                </div>
                <Link
                  href="/explore?q=Cendol"
                  className="mt-2.5 w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded bg-[#006194] hover:bg-[#007bb9] text-white text-xs font-semibold transition"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  <span>Lacak Posisi</span>
                </Link>
              </div>
            </div>

            {/* Card 4: Roti Lauw */}
            <div className="bg-white rounded-xl p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-3 border border-[#dce9ff]">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-[#e6eeff] text-[#3f4850] text-[11px] font-semibold">
                    Kue &amp; Roti
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffdbca] text-[#783200] text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#994100]"></span>
                    PAUSED (Istirahat)
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#0d1c2e]">Roti Lauw Legendaris</h3>
                <p className="text-xs text-[#3f4850] mt-1">Pedestrian Braga Pendek, Sumur Bandung</p>
              </div>
              <div className="pt-2 bg-[#eff4ff] rounded-lg p-2.5 border border-[#dce9ff]/60">
                <div className="flex items-center justify-between text-xs text-[#3f4850]">
                  <span>Jarak: ~600m</span>
                  <span className="text-[#994100] font-bold">Istirahat Makan Siang</span>
                </div>
                <Link
                  href="/explore?q=Roti"
                  className="mt-2.5 w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded bg-[#e6eeff] hover:bg-[#dce9ff] text-[#0d1c2e] text-xs font-semibold transition"
                >
                  <Eye className="h-3.5 w-3.5 text-[#006194]" />
                  <span>Lihat Detail</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bagian 'Cara Kerja' (3 Langkah Ringkas) */}
      <section className="w-full py-16 lg:py-24 px-4 lg:px-8 bg-[#f8f9ff]">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs text-[#006194] uppercase tracking-widest font-bold">
              Sistem Sederhana
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0d1c2e] mt-1">
              Cara Kerja JejakLapak
            </h2>
            <p className="text-sm sm:text-base text-[#3f4850] mt-2">
              Tiga tahap efisien untuk menemukan pedagang keliling di sekitarmu tanpa menunggu tanpa kepastian.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="relative bg-white rounded-2xl p-6 shadow-xs border border-[#dce9ff] flex flex-col items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#cce5ff] text-[#006194] flex items-center justify-center text-xl font-bold">
                01
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0d1c2e]">Buka Peta Bandung Raya</h3>
                <p className="text-sm text-[#3f4850] mt-2 leading-relaxed">
                  Akses peta langsung lewat browser tanpa perlu unduh aplikasi berat. Lokasi GPS otomatis menyesuaikan posisi perangkat Anda.
                </p>
              </div>
              <div className="mt-auto w-full pt-2">
                <span className="inline-flex items-center gap-1.5 text-[#006194] text-xs font-semibold">
                  <Compass className="h-4 w-4" />
                  <span>Navigasi instan</span>
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative bg-white rounded-2xl p-6 shadow-xs border border-[#dce9ff] flex flex-col items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#baeaff] text-[#006781] flex items-center justify-center text-xl font-bold">
                02
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0d1c2e]">Pantau Posisi &amp; Status Terkini</h3>
                <p className="text-sm text-[#3f4850] mt-2 leading-relaxed">
                  Ketahui apakah gerobak sedang aktif meluncur (LIVE), berhenti mangkal, atau sedang jeda beristirahat lewat indikator warna yang jelas.
                </p>
              </div>
              <div className="mt-auto w-full pt-2">
                <span className="inline-flex items-center gap-1.5 text-[#006781] text-xs font-semibold">
                  <Clock className="h-4 w-4" />
                  <span>Data telemetri realtime</span>
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative bg-white rounded-2xl p-6 shadow-xs border border-[#dce9ff] flex flex-col items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#dce9ff] text-[#006194] flex items-center justify-center text-xl font-bold">
                03
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0d1c2e]">Datangi Lapak atau Panggil Gerobak</h3>
                <p className="text-sm text-[#3f4850] mt-2 leading-relaxed">
                  Jalan kaki ke titik pemberhentian terdekat, atau kirim sinyal panggilan langsung saat gerobak melintas di jalan depan rumah Anda.
                </p>
              </div>
              <div className="mt-auto w-full pt-2">
                <span className="inline-flex items-center gap-1.5 text-[#006194] text-xs font-semibold">
                  <Navigation className="h-4 w-4" />
                  <span>Rute jalan kaki otomatis</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bagian 'Keunggulan Teknologi' */}
      <section className="w-full py-16 lg:py-24 px-4 lg:px-8 bg-[#e6eeff]/60 border-t border-b border-[#dce9ff]">
        <div className="max-w-7xl mx-auto flex flex-col gap-10">
          <div className="max-w-xl">
            <span className="text-xs text-[#006194] uppercase tracking-widest font-bold">
              Keunggulan Teknologi
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0d1c2e] mt-1">
              Dibuat Khusus untuk Mobilitas Jalanan
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-xs border border-[#dce9ff] flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#006194] text-white flex items-center justify-center">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-[#0d1c2e]">Peta Cepat Tanpa Lag</h3>
              <p className="text-sm text-[#3f4850] leading-relaxed">
                Didukung arsitektur WebGL rendering ringan yang mulus bahkan di jaringan 3G/4G dan ponsel spesifikasi hemat daya.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-xs border border-[#dce9ff] flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#006781] text-white flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-[#0d1c2e]">Transparansi Timestamp Lokasi</h3>
              <p className="text-sm text-[#3f4850] leading-relaxed">
                Setiap titik mencantumkan menit pembaruan terakhir. Bebas informasi fiktif dan tanpa tipuan penanda lama yang sudah kadaluwarsa.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-xs border border-[#dce9ff] flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#c05400] text-white flex items-center justify-center">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-[#0d1c2e]">Dukungan Penuh Ekonomi UMKM</h3>
              <p className="text-sm text-[#3f4850] leading-relaxed">
                Platform murni nirlaba komersial untuk pedagang kecil. Nol komisi potongan pesanan, menjaga ekosistem gerobak jalanan tetap mandiri.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
