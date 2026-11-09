import Link from "next/link";
import { notFound } from "next/navigation";
import { merchantService, calculateFreshness } from "@/services/mock/merchantService";
import { getMerchantByIdOrSlug } from "@/server/merchants";
import { StatusBadge, FreshnessBadge } from "@/components/common/StatusBadge";
import {
  MapPin,
  MessageCircle,
  Navigation,
  ArrowLeft,
  Calendar,
  Utensils,
  CheckCircle2,
} from "lucide-react";
import { MerchantAvatar } from "@/components/common/MerchantAvatar";

export function generateStaticParams() {
  return merchantService.getAll().map((m) => ({
    slug: m.slug,
  }));
}

export const instant = false;

export default async function MerchantDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const merchant = (await getMerchantByIdOrSlug(slug)) || merchantService.getBySlug(slug);

  if (!merchant) {
    notFound();
  }

  const freshness = calculateFreshness(merchant.location.capturedAt);
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${merchant.location.latitude},${merchant.location.longitude}`;
  const whatsappUrl = `https://wa.me/62${merchant.phone.replace(/^0/, "")}?text=${encodeURIComponent(
    `Halo ${merchant.ownerName}, saya melihat profil ${merchant.name} di JejakLapak. Apakah sedang berjualan hari ini?`
  )}`;

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* 1. Header Back Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Peta Eksplorasi
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        {/* 2. Top Profile Hero Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <MerchantAvatar image={merchant.image} name={merchant.name} className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl shadow-inner" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    {merchant.name}
                  </h1>
                  {merchant.verificationStatus === "VERIFIED" && (
                    <span
                      title="Pedagang Terverifikasi JejakLapak"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"
                    >
                      <CheckCircle2 className="h-3 w-3" /> Terverifikasi
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Pemilik: <strong>{merchant.ownerName}</strong> • {merchant.category}
                </p>
                <p className="text-xs text-slate-500 pt-1 leading-relaxed max-w-xl">
                  {merchant.description}
                </p>
              </div>
            </div>

            {/* Status & Freshness Badges */}
            <div className="flex flex-col sm:items-end gap-2 shrink-0">
              <StatusBadge status={merchant.sellingStatus} />
              <FreshnessBadge freshness={freshness} capturedAt={merchant.location.capturedAt} />
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition"
            >
              <MessageCircle className="h-4 w-4" /> Hubungi via WhatsApp
            </a>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <Navigation className="h-4 w-4 text-blue-600" /> Buka Navigasi Rute
            </a>
          </div>
        </div>

        {/* 3. Location & Schedule Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Posisi Terkini */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-700" /> Posisi Terakhir Gerobak
            </h2>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2">
              <p className="text-sm font-bold text-slate-900">{merchant.location.addressHint}</p>
              <p className="text-xs text-slate-600">
                Kecamatan: {merchant.location.district}, {merchant.location.city}
              </p>
              <p className="text-xs text-slate-500">
                Area Berkeliling: <strong>{merchant.operatingArea}</strong>
              </p>
              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-200">
                Koordinat: {merchant.location.latitude.toFixed(5)}, {merchant.location.longitude.toFixed(5)}
              </div>
            </div>

            <div className="text-xs text-slate-500 leading-relaxed">
              *Informasi lokasi gerobak diperbarui berdasarkan sinyal sesi pedagang. Selalu periksa label kesegaran waktu sebelum berkunjung.
            </div>
          </div>

          {/* Jadwal Operasional Mingguan */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-700" /> Jadwal Buka Mingguan
            </h2>

            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden text-xs">
              {merchant.schedule.map((sc) => (
                <div
                  key={sc.dayOfWeek}
                  className="flex items-center justify-between p-2.5 hover:bg-slate-50"
                >
                  <span className="font-semibold text-slate-700">{sc.dayName}</span>
                  {sc.isOpen ? (
                    <span className="font-medium text-slate-900">
                      {sc.startTime} - {sc.endTime} WIB
                    </span>
                  ) : (
                    <span className="font-medium text-slate-400">Libur</span>
                  )}
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400">
              Jadwal operasional merupakan informasi rencana rutin dan dapat berubah sewaktu-waktu sesuai kondisi cuaca di lapangan.
            </p>
          </div>
        </div>

        {/* 4. Menu & Daftar Produk */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Utensils className="h-4 w-4 text-emerald-700" /> Daftar Menu & Harga
            </h2>
            <span className="text-xs text-slate-400">{merchant.menu.length} Pilihan Menu</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {merchant.menu.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{item.name}</h3>
                    {item.isPopular && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded shrink-0">
                        Favorit
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Harga:</span>
                  <span className="text-sm font-extrabold text-emerald-800">
                    Rp {item.price.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}