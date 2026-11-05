import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6 text-center bg-slate-50">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200 text-slate-500 mb-4">
        <Compass className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Halaman Tidak Ditemukan</h1>
      <p className="text-xs text-slate-600 max-w-sm mt-1 mb-6">
        Pedagang atau rute yang Anda cari tidak tersedia atau mungkin telah berpindah lokasi.
      </p>
      <Link
        href="/explore"
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Peta Eksplorasi
      </Link>
    </div>
  );
}

