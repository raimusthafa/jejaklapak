"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Compass, Store, ShieldCheck } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  const isMerchantDashboardPage =
    pathname.startsWith("/merchant/dashboard") ||
    pathname.startsWith("/merchant/menu") ||
    pathname.startsWith("/merchant/profile") ||
    pathname.startsWith("/merchant/schedule");

  // Jangan render footer pada halaman /explore dan area dashboard pedagang
  if (pathname === "/explore" || isMerchantDashboardPage) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 bg-white shrink-0">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-700 text-white">
                <MapPin className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-slate-900">JejakLapak</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                v1.0 (Bandung Raya)
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              Platform pelacak keberadaan pedagang UMKM keliling, pedagang kaki lima, dan gerobak kuliner berpindah di wilayah Bandung Raya.
            </p>
            <p className="text-xs text-slate-600">
              Cakupan operasional: Kota Bandung, Kota Cimahi, Kab. Bandung, & Kab. Bandung Barat.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 tracking-wider uppercase mb-3">
              Navigasi
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/explore" className="hover:text-emerald-700 flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5" /> Peta Eksplorasi
                </Link>
              </li>
              <li>
                <Link href="/merchant/dashboard" className="hover:text-emerald-700 flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5" /> Dashboard Pedagang
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-emerald-700 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> Moderasi Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Map Attribution & Tech */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 tracking-wider uppercase mb-3">
              Lisensi & Peta
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Peta didukung oleh <strong>MapLibre GL JS</strong> (WebGL 60 FPS) dengan ubin data dari{" "}
              <strong>OpenStreetMap contributors</strong> & <strong>Esri</strong>.
            </p>
            <p className="text-xs text-slate-600 mt-2">
              100% Bebas API Key & Tanpa Watermark komersial.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
          <p>© 2026 JejakLapak. Know where they sell, know when they&apos;re there.</p>
          <p className="text-slate-600">Fase Validasi Frontend v1.0</p>
        </div>
      </div>
    </footer>
  );
}
