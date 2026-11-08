"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Compass,
  Store,
  Navigation,
  Eye,
  Plus,
  Minus,
  Bike,
  ArrowRight,
} from "lucide-react";

const LandingMapPreview = dynamic(
  () => import("@/components/landing/LandingMapPreview"),
  { ssr: false }
);

const feed = [
  {
    name: "Cuanki & Batagor Serayu",
    place: "Jl. Serayu No. 2, Cihapit",
    dist: "120 m",
    status: "Live, 1 mnt lalu",
    live: true,
    q: "Cuanki",
  },
  {
    name: "Cilor & Batagor Mang Ade",
    place: "Halte Dipatiukur, Coblong",
    dist: "350 m",
    status: "Live, 3 mnt lalu",
    live: true,
    q: "Batagor",
  },
  {
    name: "Es Cendol Asli Elizabeth",
    place: "Jl. Inhoftank & Otista",
    dist: "1,2 km",
    status: "Live, 5 mnt lalu",
    live: true,
    q: "Cendol",
  },
  {
    name: "Roti Lauw Legendaris",
    place: "Braga Pendek, Sumur Bandung",
    dist: "600 m",
    status: "Istirahat makan siang",
    live: false,
    q: "Roti",
  },
];

const techPoints = [
  {
    title: "Ringan di HP murah",
    body: "Peta jalan di browser dan dibuat hemat data, jadi tetap lancar di sinyal pas-pasan.",
  },
  {
    title: "Selalu ada jamnya",
    body: "Tiap titik menampilkan kapan terakhir diperbarui. Kalau sudah lama, kamu tahu itu data lama.",
  },
  {
    title: "Tanpa potongan",
    body: "Tidak ada komisi dan tidak ada biaya daftar. Hasil jualan sepenuhnya tetap milik pedagang.",
  },
];

const steps = [
  {
    title: "Buka petanya",
    body: "Lewat browser di HP, tidak perlu pasang aplikasi. Peta langsung menyesuaikan dengan posisimu.",
  },
  {
    title: "Lihat siapa yang sedang keliling",
    body: "Pedagang yang aktif ditandai LIVE. Yang sedang berhenti atau istirahat juga kelihatan, lengkap dengan waktu pembaruan terakhirnya.",
  },
  {
    title: "Samperin",
    body: "Pilih yang paling dekat, lalu jalan ke sana. Kalau gerobaknya sudah pindah, cek lagi di peta.",
  },
];

const aboutPoints = [
  {
    lead: "Gratis.",
    text: "Tidak ada biaya daftar, tidak ada potongan komisi.",
  },
  {
    lead: "Ada jamnya.",
    text: "Tiap posisi menampilkan kapan terakhir diperbarui, jadi tidak ada penanda basi.",
  },
  {
    lead: "Untuk Bandung.",
    text: "Dibuat untuk warga dan pedagang di sini, bukan untuk mengambil untung dari mereka.",
  },
];

const merchantPoints = [
  "Gratis, tanpa komisi dari setiap pesanan",
  "Ganti status Standby atau Keliling dari HP, cukup sekali ketuk",
  "Posisi gerobakmu kelihatan di peta oleh pembeli di sekitar",
  "Ikut dipromosikan lewat grup komunitas JejakLapak",
];

export default function HomePage() {

  const mapApiRef = useRef<{ zoomIn: () => void; zoomOut: () => void } | null>(null);

  const handleMapReady = useCallback(
    (api: { zoomIn: () => void; zoomOut: () => void }) => {
      mapApiRef.current = api;
    },
    []
  );

  return (
    <div className="flex flex-col w-full bg-[#f8f9ff] text-[#0d1c2e] antialiased overflow-x-hidden">
      {/* 2. Hero Section with Dual Spatial Layout */}
      <section id="beranda" className="w-full py-8 lg:py-12 px-4 lg:px-8 bg-[#f8f9ff] scroll-mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Narrative Column */}
          <div className="lg:col-span-6 flex flex-col items-start gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e6eeff] text-[#006194] text-xs font-semibold tracking-wide">
              <Compass className="h-4 w-4 text-[#006194] shrink-0" />
              <span>Know where they sell, know when they&apos;re there.</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0d1c2e] tracking-tight leading-[1.15]">
              Temukan &amp; Pantau <br className="hidden sm:inline" />
              <span className="text-[#006194] whitespace-nowrap underline decoration-[#79d8fd] decoration-2 sm:decoration-4 underline-offset-4 sm:underline-offset-8">
                UMKM Keliling
              </span>{" "}
              Favoritmu di Bandung
            </h1>

            <p className="text-base sm:text-lg text-[#3f4850] max-w-xl leading-relaxed">
              Infrastruktur pemetaan gerobak jajanan, pikulan kuliner, dan jasa keliling secara real-time. Lacak posisi GPS presisi pedagang legendaris tanpa rasa penasaran.
            </p>

            {/* CTA Cluster */}
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
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
          </div>

          {/* Right Interactive Map Preview (Real MapLibre) */}
          <div className="lg:col-span-6 relative">
            <div className="rounded-2xl bg-white p-3 sm:p-4 shadow-xl border border-[#dce9ff] relative overflow-hidden">
              {/* Real MapLibre Map Canvas */}
              <div className="relative w-full h-[320px] sm:h-[380px] rounded-xl overflow-hidden border border-[#bfc7d2]/40">
                {/* MapLibre fills this container absolutely */}
                <LandingMapPreview onReady={handleMapReady} />

                {/* Bottom gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#233144]/60 via-transparent to-transparent pointer-events-none z-10" />

                {/* Floating Map Controls HUD — top left */}
                <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
                  <div className="px-3 py-1 rounded-md bg-white/95 backdrop-blur-sm text-[#0d1c2e] text-[11px] sm:text-xs font-semibold shadow-sm flex items-center gap-1.5 border border-[#bfc7d2]/40">
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
                <div className="absolute bottom-3 inset-x-3 z-20 bg-white/95 backdrop-blur-md rounded-xl p-2.5 sm:p-3 shadow-lg flex items-center justify-between gap-2 border border-[#bfc7d2]/30">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-lg bg-[#baeaff] flex items-center justify-center">
                      <Bike className="h-5 w-5 text-[#006781]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[#0d1c2e] truncate">4 Gerobak Bergerak Terdekat</div>
                      <div className="text-xs text-[#3f4850] truncate">Radius 800 meter dari lokasi Anda</div>
                    </div>
                  </div>
                  <Link
                    href="/explore"
                    className="shrink-0 px-3.5 py-1.5 rounded-md bg-[#006781] text-white text-xs font-semibold hover:bg-[#005e77] transition-colors"
                  >
                    Buka
                  </Link>
                </div>
              </div>

              {/* Bottom Live Feeds Simulation Ribbon */}
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left text-xs text-[#3f4850]">
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

      {/* 3. Daftar pedagang aktif (contoh tampilan) */}
      <section className="w-full py-12 lg:py-16 px-4 lg:px-8 bg-[#eff4ff] border-t border-b border-[#dce9ff]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="max-w-xl">
              <span className="text-xs text-[#006194] uppercase tracking-widest font-bold">
                Sedang keliling
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0d1c2e] mt-2 leading-tight tracking-tight">
                Siapa yang lagi di dekatmu
              </h2>
              <p className="text-sm sm:text-base text-[#3f4850] mt-3 leading-relaxed">
                Contoh tampilan daftar pedagang aktif. Posisinya datang langsung dari HP masing-masing pedagang.
              </p>
            </div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#006194] hover:text-[#007bb9] transition-colors shrink-0"
            >
              Lihat semua di peta
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <ul className="mt-8 bg-white rounded-2xl border border-[#dce9ff] divide-y divide-[#dce9ff] px-4 sm:px-6">
            {feed.map((v) => (
              <li key={v.name} className="flex items-center gap-3 sm:gap-5 py-4">
                <span
                  aria-hidden="true"
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${v.live ? "bg-[#006781] animate-pulse" : "bg-[#c05400]"
                    }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[#0d1c2e] truncate">{v.name}</p>
                  <p className="text-xs sm:text-sm text-[#3f4850] truncate">{v.place}</p>
                  <p className="text-xs text-[#3f4850] mt-0.5 sm:hidden">
                    {v.dist} • {v.status}
                  </p>
                </div>
                <div className="hidden sm:block text-right text-sm shrink-0">
                  <p className="font-semibold text-[#0d1c2e]">{v.dist}</p>
                  <p className={v.live ? "text-[#006781]" : "text-[#994100]"}>{v.status}</p>
                </div>
                <Link
                  href={`/explore?q=${v.q}`}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${v.live
                    ? "bg-[#006194] hover:bg-[#007bb9] text-white"
                    : "bg-[#e6eeff] hover:bg-[#dce9ff] text-[#0d1c2e]"
                    }`}
                >
                  {v.live ? (
                    <Navigation className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5 text-[#006194]" />
                  )}
                  <span>{v.live ? "Lacak" : "Detail"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* About Us */}
      <section id="tentang-kami" className="w-full py-14 lg:py-20 px-4 lg:px-8 bg-white scroll-mt-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          <div className="lg:col-span-5">
            <span className="text-xs text-[#006194] uppercase tracking-widest font-bold">
              Tentang kami
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0d1c2e] mt-2 leading-tight tracking-tight">
              Tukang cuanki itu lewat jam berapa, ya?
            </h2>
          </div>

          <div className="lg:col-span-7">
            <p className="text-base sm:text-lg text-[#0d1c2e] leading-relaxed">
              Hampir semua orang Bandung punya satu pedagang keliling yang selalu dicari: cuanki yang biasa lewat depan kos, cendol yang mangkal di bawah pohon. Masalahnya, mereka tidak punya alamat tetap, dan kita tidak punya cara untuk tahu mereka hari ini lewat atau tidak.
            </p>
            <p className="text-base sm:text-lg text-[#3f4850] leading-relaxed mt-4">
              JejakLapak menaruh mereka di peta. Pedagang mengabari posisinya dari HP, pembeli tinggal melihat siapa yang sedang ada di dekatnya. Itu saja.
            </p>

            <dl className="mt-8 border-t border-[#dce9ff] divide-y divide-[#dce9ff]">
              {aboutPoints.map((p) => (
                <div
                  key={p.lead}
                  className="py-4 flex flex-col sm:flex-row sm:gap-6"
                >
                  <dt className="sm:w-40 shrink-0 font-bold text-[#006194]">{p.lead}</dt>
                  <dd className="text-sm sm:text-base text-[#3f4850] leading-relaxed mt-1 sm:mt-0">
                    {p.text}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* 4. Cara Kerja */}
      <section id="cara-kerja" className="w-full py-14 lg:py-20 px-4 lg:px-8 bg-[#f8f9ff] scroll-mt-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <span className="text-xs text-[#006194] uppercase tracking-widest font-bold">
                Cara kerja
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0d1c2e] mt-2 leading-tight tracking-tight">
                Dari buka peta sampai ketemu gerobaknya
              </h2>
              <p className="text-sm sm:text-base text-[#3f4850] mt-3 leading-relaxed">
                Cuma tiga langkah.
              </p>
              <Link
                href="/explore"
                className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#006194] hover:bg-[#007bb9] text-white font-semibold text-sm transition-colors"
              >
                <Compass className="h-4 w-4" />
                <span>Coba sekarang</span>
              </Link>
            </div>
          </div>

          <ol className="lg:col-span-8 flex flex-col">
            {steps.map((s, i) => (
              <li key={s.title} className="relative pl-14 sm:pl-16 pb-10 last:pb-0">
                {i < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[19px] sm:left-[23px] top-11 bottom-0 w-px bg-[#bfc7d2]"
                  />
                )}
                <span className="absolute left-0 top-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-[#006194] text-[#006194] flex items-center justify-center font-bold text-base sm:text-lg">
                  {i + 1}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#0d1c2e] pt-1.5 sm:pt-2.5">
                  {s.title}
                </h3>
                <p className="text-sm sm:text-base text-[#3f4850] mt-1.5 leading-relaxed max-w-xl">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 5. Kenapa enteng dipakai di jalan */}
      <section className="w-full py-14 lg:py-20 px-4 lg:px-8 bg-[#e6eeff]/60 border-t border-b border-[#dce9ff]">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <span className="text-xs text-[#006194] uppercase tracking-widest font-bold">
              Di balik layar
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0d1c2e] mt-2 leading-tight tracking-tight">
              Dibuat supaya enteng dipakai di pinggir jalan
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {techPoints.map((t) => (
              <div key={t.title} className="border-t-2 border-[#006194] pt-4">
                <h3 className="text-lg font-bold text-[#0d1c2e]">{t.title}</h3>
                <p className="text-sm sm:text-base text-[#3f4850] mt-2 leading-relaxed">
                  {t.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Untuk Pedagang UMKM */}
      <section id="untuk-pedagang" className="w-full py-14 lg:py-20 px-4 lg:px-8 bg-[#f8f9ff] scroll-mt-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Foto pedagang — kiri */}
          <div className="lg:col-span-5">
            <Image
              src="/untukPedagang.png"
              alt="Pedagang bakso keliling berdiri di samping gerobaknya"
              width={604}
              height={659}
              sizes="(min-width: 1024px) 40vw, 80vw"
              className="w-full h-auto max-w-[280px] sm:max-w-sm lg:max-w-md mx-auto"
            />
          </div>

          {/* Teks — kanan */}
          <div className="lg:col-span-7">
            <span className="text-xs text-[#006194] uppercase tracking-widest font-bold">
              Untuk pedagang
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0d1c2e] mt-2 leading-tight tracking-tight">
              Biar pelangganmu tahu kamu lagi di mana
            </h2>
            <p className="text-base sm:text-lg text-[#3f4850] mt-4 leading-relaxed max-w-xl">
              Sudah jualan keliling bertahun-tahun, tapi pembeli baru sering tidak tahu harus mencari ke mana. Daftarkan lapakmu, nyalakan lokasi dari HP, dan biar peta yang bantu.
            </p>

            <ul className="mt-6 flex flex-col gap-3">
              {merchantPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm sm:text-base text-[#0d1c2e]">
                  <span
                    aria-hidden="true"
                    className="mt-2 w-2 h-2 rounded-full bg-[#c05400] shrink-0"
                  />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/merchant/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#006194] hover:bg-[#007bb9] text-white font-semibold text-sm transition-colors"
              >
                Daftarkan Lapak
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/merchant/login"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-lg border border-[#bfc7d2] text-[#0d1c2e] font-semibold text-sm hover:bg-[#e6eeff] transition-colors"
              >
                Sudah punya akun? Masuk
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}