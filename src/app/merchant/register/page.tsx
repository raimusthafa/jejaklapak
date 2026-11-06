"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, User, Mail, Phone, Lock, CheckCircle2, MapPin, Navigation } from "lucide-react";
import { CATEGORIES, BANDUNG_DISTRICTS } from "@/config/constants";
import { registerMerchantAction, type ActionState } from "@/actions/auth";
import { toast } from "@/components/ui/sonner";

const initialState: ActionState = {
  ok: false,
};

export default function MerchantRegisterPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registerMerchantAction, initialState);

  useEffect(() => {
    if (state.ok) {
      toast.success(state.message || "Registrasi berhasil! Mengarahkan Anda ke portal login...", {
        id: "register-status",
      });
      const timer = setTimeout(() => {
        router.push(state.redirectTo || "/merchant/login");
      }, 1200);
      return () => clearTimeout(timer);
    } else if (state.message) {
      toast.error(state.message, { id: "register-status" });
    }
  }, [state.ok, state.message, state.redirectTo, router]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#f4f8fb] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl space-y-6 bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e6f6fc] text-[#0284c7]">
            <Store className="h-6 w-6 text-[#0284c7]" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Daftarkan Lapak Kelilingmu
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Bantu pembeli di Bandung Raya menemukan keberadaan gerobakmu setiap hari.
          </p>
        </div>

        {state.ok ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e6f6fc] text-[#0284c7]">
              <CheckCircle2 className="h-8 w-8 text-[#0284c7]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Registrasi Berhasil!</h3>
            <p className="text-xs text-slate-600">
              {state.message || "Selamat datang di JejakLapak. Mengarahkan Anda ke Halaman Masuk..."}
            </p>
          </div>
        ) : (
          <form action={formAction} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Pemilik Usaha</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Contoh: Mang Asep"
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#0284c7] focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                  />
                </div>
                {state.errors?.name && <p className="mt-1 text-[11px] text-rose-600 font-medium">{state.errors.name[0]}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lapak / Dagangan</label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="merchantName"
                    required
                    placeholder="Contoh: Cuanki Serayu Keliling"
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#0284c7] focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                  />
                </div>
                {state.errors?.merchantName && <p className="mt-1 text-[11px] text-rose-600 font-medium">{state.errors.merchantName[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="nama@email.com"
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#0284c7] focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                  />
                </div>
                {state.errors?.email && <p className="mt-1 text-[11px] text-rose-600 font-medium">{state.errors.email[0]}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="081234567890"
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#0284c7] focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                  />
                </div>
                {state.errors?.phone && <p className="mt-1 text-[11px] text-rose-600 font-medium">{state.errors.phone[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Jualan</label>
                <select
                  name="category"
                  required
                  defaultValue=""
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:border-[#0284c7] focus:outline-none focus:ring-1 focus:ring-[#0284c7] bg-white"
                >
                  <option value="" disabled>Pilih Kategori</option>
                  {CATEGORIES.filter((c) => c !== "Semua Kategori").map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {state.errors?.category && <p className="mt-1 text-[11px] text-rose-600 font-medium">{state.errors.category[0]}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kecamatan Basis</label>
                <select
                  name="district"
                  required
                  defaultValue=""
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:border-[#0284c7] focus:outline-none focus:ring-1 focus:ring-[#0284c7] bg-white"
                >
                  <option value="" disabled>Pilih Wilayah</option>
                  {BANDUNG_DISTRICTS.filter((d) => d !== "Semua Wilayah").map((dist) => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
                {state.errors?.district && <p className="mt-1 text-[11px] text-rose-600 font-medium">{state.errors.district[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Pangkalan / Standby</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="Depan Kampus ITB Jl. Ganesha"
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#0284c7] focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rute Keliling</label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="operatingArea"
                    required
                    placeholder="Riau, Gandapura, Cisangkuy"
                    className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#0284c7] focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kata Sandi Akun</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Minimal 6 karakter"
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#0284c7] focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                />
              </div>
              {state.errors?.password && <p className="mt-1 text-[11px] text-rose-600 font-medium">{state.errors.password[0]}</p>}
            </div>

            <div className="flex items-start gap-2 pt-2">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 rounded border-slate-300 text-[#0284c7] focus:ring-[#0284c7] mt-0.5"
              />
              <label htmlFor="terms" className="text-slate-500 text-[11px] leading-tight">
                Saya menyetujui bahwa informasi lokasi gerobak yang saya bagikan hanya akan digunakan untuk keperluan keterbukaan posisi bagi calon pelanggan di Bandung Raya.
              </label>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center rounded-xl bg-[#60C1E5] hover:bg-[#4eb3d8] py-3 text-xs font-bold text-slate-900 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Mendaftarkan Usaha..." : "Daftar & Masuk Dashboard"}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Sudah memiliki akun?{" "}
          <Link href="/merchant/login" className="font-bold text-[#0284c7] hover:underline">
            Masuk ke Sini
          </Link>
        </div>
      </div>
    </div>
  );
}
