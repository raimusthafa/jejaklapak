"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, User, Mail, Phone, Lock, CheckCircle2, AlertCircle, MapPin, Navigation } from "lucide-react";
import { CATEGORIES, BANDUNG_DISTRICTS } from "@/config/constants";
import { registerMerchantAction, type ActionState } from "@/actions/auth";

const initialState: ActionState = {
  ok: false,
};

export default function MerchantRegisterPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registerMerchantAction, initialState);

  useEffect(() => {
    if (state.ok) {
      const timer = setTimeout(() => {
        router.push(state.redirectTo || "/merchant/login");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [state.ok, state.redirectTo, router]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <Store className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Daftarkan Lapak Kelilingmu
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Bantu pembeli di Bandung Raya menemukan keberadaan gerobakmu setiap hari.
          </p>
        </div>

        {state.message && !state.ok && (
          <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{state.message}</span>
          </div>
        )}

        {state.ok ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Registrasi Berhasil!</h3>
            <p className="text-xs text-slate-600">
              {state.message || "Selamat datang di JejakLapak. Mengarahkan Anda ke Dashboard Pedagang..."}
            </p>
          </div>
        ) : (
          <form action={formAction} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Pemilik Usaha</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Contoh: Asep Sunandar"
                    className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                {state.errors?.name && <p className="mt-1 text-[11px] text-rose-600">{state.errors.name[0]}</p>}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Usaha / Gerobak</label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="merchantName"
                    required
                    placeholder="Contoh: Batagor Cisangkuy"
                    className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                {state.errors?.merchantName && <p className="mt-1 text-[11px] text-rose-600">{state.errors.merchantName[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Usaha</label>
                <select
                  name="category"
                  defaultValue="Makanan Berat"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
                >
                  {CATEGORIES.filter((c) => c !== "Semua Kategori").map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kecamatan Utama</label>
                <select
                  name="district"
                  defaultValue="Bandung Wetan (Cisangkuy)"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
                >
                  {BANDUNG_DISTRICTS.filter((d: string) => d !== "Semua Wilayah").map((d: string) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Aktif</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="nama@email.com"
                    className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                {state.errors?.email && <p className="mt-1 text-[11px] text-rose-600">{state.errors.email[0]}</p>}
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
                    className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                {state.errors?.phone && <p className="mt-1 text-[11px] text-rose-600">{state.errors.phone[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Pangkalan / Dapur</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="Jl. Cimanuk No. 12"
                    className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rute / Area Keliling</label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="operatingArea"
                    required
                    placeholder="Riau, Gandapura, Cisangkuy"
                    className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
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
                  className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
              {state.errors?.password && <p className="mt-1 text-[11px] text-rose-600">{state.errors.password[0]}</p>}
            </div>

            <div className="flex items-start gap-2 pt-2">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-0.5"
              />
              <label htmlFor="terms" className="text-slate-600 text-[11px] leading-tight">
                Saya menyetujui bahwa informasi lokasi gerobak yang saya bagikan hanya akan digunakan untuk keperluan keterbukaan posisi bagi calon pelanggan di Bandung Raya.
              </label>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center rounded-xl bg-emerald-700 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition disabled:opacity-50"
            >
              {isPending ? "Mendaftarkan Usaha..." : "Daftar & Masuk Dashboard"}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
          Sudah memiliki akun?{" "}
          <Link href="/merchant/login" className="font-bold text-emerald-700 hover:underline">
            Masuk ke Sini
          </Link>
        </div>
      </div>
    </div>
  );
}
