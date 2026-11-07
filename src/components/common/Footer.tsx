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
    <footer className="w-full bg-white border-t border-[#dce9ff] py-12 shrink-0">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#006194] text-white">
                <MapPin className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-[#0d1c2e]">JejakLapak</span>
            </div>
            <p className="text-xs text-[#3f4850] leading-relaxed">
              Infrastruktur pemetaan real-time pedagang UMKM keliling di koridor metropolitan Bandung Raya. Menghubungkan pembeli dengan gerobak terdekat secara presisi.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#0d1c2e] mb-3">Navigasi Cepat</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link className="text-[#3f4850] hover:text-[#006194] transition" href="/explore">
                  Radar Lapak Aktif
                </Link>
              </li>
              <li>
                <Link className="text-[#3f4850] hover:text-[#006194] transition" href="/explore">
                  Kategori Kuliner &amp; Jasa
                </Link>
              </li>
              <li>
                <Link className="text-[#3f4850] hover:text-[#006194] transition" href="/#cara-kerja">
                  Panduan Pengguna (Cara Kerja)
                </Link>
              </li>
              <li>
                <Link className="text-[#3f4850] hover:text-[#006194] transition" href="/#daftar-mitra">
                  Registrasi Lapak Mandiri
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#0d1c2e] mb-3">Koridor Wilayah</h4>
            <ul className="space-y-2 text-xs text-[#3f4850]">
              <li>Kota Bandung (Pusat, Dago &amp; Dipatiukur)</li>
              <li>Bandung Wetan &amp; Cibiru</li>
              <li>Cimahi &amp; Padalarang</li>
              <li>Bandung Selatan &amp; Soreang</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#0d1c2e] mb-3">Data &amp; Kemitraan</h4>
            <p className="text-xs text-[#3f4850] mb-2 leading-relaxed">
              Pemberdayaan ekonomi mikro melalui digitalisasi GPS terbuka dan geolokasi presisi.
            </p>
            <p className="text-xs font-semibold text-[#006194]">Kontak: halo@jejaklapak.id</p>
          </div>
        </div>

        <div className="border-t border-[#dce9ff] pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#3f4850]">
          <div>© 2026 JejakLapak. Hak cipta dilindungi undang-undang.</div>
          <div className="text-center md:text-right">
            Didukung oleh MapLibre GL • Data Peta © OpenStreetMap contributors • ESRI Geographic Systems
          </div>
        </div>
      </div>
    </footer>
  );
}
