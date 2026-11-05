import Link from "next/link";
import { MOCK_MERCHANTS } from "@/data/mock/merchants";
import { calculateFreshness } from "@/services/mock/merchantService";
import { StatusBadge, FreshnessBadge } from "@/components/common/StatusBadge";
import {
  Compass,
  MapPin,
  ArrowRight,
  Store,
} from "lucide-react";

export default function HomePage() {
  // Ambil 6 pedagang unggulan untuk preview
  const featuredVendors = MOCK_MERCHANTS.slice(0, 6);

  return (
    <div className="flex flex-col">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Pelacak UMKM Keliling Bandung Raya
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.15]">
              Know where they sell,{" "}
              <span className="text-emerald-700 underline decoration-emerald-300 decoration-wavy decoration-2">
                know when they&apos;re there.
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Temukan cuanki, batagor, tahu gejrot, hingga es cendol gerobak keliling di sekitarmu
              dengan posisi geografis terkini, jadwal operasional pasti, dan timestamp lokasi transparan.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 transition"
              >
                <Compass className="h-4 w-4" />
                Jelajahi Pedagang di Peta
              </Link>
              <Link
                href="/merchant/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <Store className="h-4 w-4 text-slate-500" />
                Portal Pedagang
              </Link>
            </div>

            {/* Micro stats banner */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-100 pt-6 max-w-lg text-xs text-slate-600">
              <div>
                <span className="block text-xl font-extrabold text-slate-900">60 FPS</span>
                <span>Peta GPU WebGL</span>
              </div>
              <div>
                <span className="block text-xl font-extrabold text-slate-900">Bandung</span>
                <span>Cimahi & Raya</span>
              </div>
              <div>
                <span className="block text-xl font-extrabold text-slate-900">Rp 0</span>
                <span>Bebas Biaya Lisensi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Cara Kerja JejakLapak */}
      <section className="border-b border-slate-200 bg-slate-50/60 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Bagaimana JejakLapak Bekerja?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Menghubungkan pembeli langsung dengan UMKM gerobak yang berpindah lokasi.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-bold mb-4">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900">Buka Peta Interaktif</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Akses peta Bandung Raya tanpa login. Lihat marker gerobak yang aktif di sekitar Dipati Ukur, Cisangkuy, Lengkong, hingga Cimahi.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 font-bold mb-4">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900">Cek Kesegaran & Status</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Tiap gerobak dilengkapi indikator status <em>Sedang Berjualan</em> dan label timestamp lokasi (Live &lt; 2 menit, Recent, atau Stale).
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 font-bold mb-4">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900">Kunjungi atau Panggil</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Lihat rute navigasi langsung, hubungi via WhatsApp, atau gunakan fitur &ldquo;Panggil Gerobak&rdquo; agar pedagang mampir ke titik kumpulmu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Preview Pedagang Terkini di Bandung Raya */}
      <section className="py-14 sm:py-20 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Lapak Pilihan Hari Ini
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl mt-1">
                Pedagang UMKM di Sekitar Bandung
              </h2>
            </div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              Buka Semua di Peta <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredVendors.map((vendor) => {
              const freshness = calculateFreshness(vendor.location.capturedAt);
              return (
                <div
                  key={vendor.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-2xl border border-slate-200">
                        {vendor.iconEmoji || "🍲"}
                      </span>
                      <StatusBadge status={vendor.sellingStatus} />
                    </div>

                    <h3 className="mt-3 font-bold text-base text-slate-900">{vendor.name}</h3>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2">{vendor.tagline}</p>

                    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{vendor.location.addressHint}</span>
                    </div>

                    <div className="mt-2">
                      <FreshnessBadge freshness={freshness} />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-slate-600 uppercase">
                      {vendor.category}
                    </span>
                    <Link
                      href={`/merchant/${vendor.slug}`}
                      className="font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      Detail & Menu →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Merchant CTA Banner */}
      <section className="bg-emerald-900 text-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Punya Usaha Gerobak atau Jajanan Keliling di Bandung?
            </h2>
            <p className="mt-3 text-sm text-emerald-100 leading-relaxed">
              Daftarkan usahamu gratis. Bagikan lokasi tempatmu berjualan setiap hari agar pelanggan
              setia dan pembeli baru tidak perlu bingung mencari gerobakmu.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/merchant/register"
                className="rounded-xl bg-white px-5 py-3 text-xs font-bold text-emerald-900 shadow-sm hover:bg-emerald-50 transition"
              >
                Daftar Sebagai Pedagang
              </Link>
              <Link
                href="/merchant/dashboard"
                className="rounded-xl border border-emerald-700 bg-emerald-800/80 px-5 py-3 text-xs font-semibold text-white hover:bg-emerald-800 transition"
              >
                Coba Demo Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
