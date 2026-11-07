"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Store,
  User,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  MapPin,
  Navigation,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Megaphone,
} from "lucide-react";
import { CATEGORIES, BANDUNG_DISTRICTS } from "@/config/constants";
import { registerMerchantAction, type ActionState } from "@/actions/auth";
import { toast } from "@/components/ui/sonner";

const initialState: ActionState = {
  ok: false,
};

export default function MerchantRegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#f8f9ff] py-10 lg:py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl rounded-3xl bg-[#dce9ff] p-6 lg:p-12 shadow-sm border border-[#bfc7d2]/40 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Banner Info Column */}
        <div className="lg:col-span-5 flex flex-col items-start gap-5">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <Image
              src="/logo.png"
              alt="JejakLapak"
              width={160}
              height={40}
              style={{ width: "auto" }}
              className="h-9 object-contain"
              priority
            />
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#baeaff] text-[#001f29] text-xs font-semibold border border-[#79d8fd]">
            <Megaphone className="h-3.5 w-3.5 text-[#006781]" />
            Program Mitra Gerobak Bandung
          </span>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0d1c2e] leading-tight">
            Punya Gerobak Keliling di Bandung? Daftarkan Lapak Anda Sekarang.
          </h1>

          <p className="text-sm sm:text-base text-[#3f4850] leading-relaxed">
            Tingkatkan omzet harian dengan membagikan posisi Anda kepada ribuan penikmat kuliner di sekitar rute jalan Anda. Pendaftaran cepat hanya butuh nomor WhatsApp aktif.
          </p>

          <div className="space-y-3 text-xs sm:text-sm text-[#3f4850] w-full">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-[#006781] shrink-0" />
              <span>100% Gratis selamanya tanpa potongan transaksi</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-[#006781] shrink-0" />
              <span>Tinggal nyalakan tombol pelacak di HP sederhana saat jualan</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-[#006781] shrink-0" />
              <span>Diberikan stiker QR JejakLapak resmi untuk ditempel di gerobak</span>
            </div>
          </div>

          <div className="w-full mt-4 p-4 rounded-2xl bg-white/70 border border-[#bfc7d2]/40 text-xs text-[#3f4850]">
            Sudah memiliki akun lapak?{" "}
            <Link href="/merchant/login" className="font-bold text-[#006194] hover:underline">
              Masuk ke Sini
            </Link>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7 w-full">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#bfc7d2]/40">
            <h2 className="text-xl font-bold text-[#0d1c2e]">Form Pendaftaran Mitra Mandiri</h2>
            <p className="text-xs text-[#3f4850] mt-1 mb-6">
              Lengkapi data usaha Anda untuk langsung mulai membagikan lokasi di peta Bandung Raya.
            </p>

            {/* Error banner dari server */}
            {state.message && !state.ok && (
              <div className="mb-5 flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 animate-in fade-in">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-rose-900">Pendaftaran Belum Lengkap</p>
                  <p className="text-rose-700 leading-relaxed">{state.message}</p>
                </div>
              </div>
            )}

            {state.ok ? (
              <div className="py-10 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eff4ff] text-[#006194]">
                  <CheckCircle2 className="h-8 w-8 text-[#006194]" />
                </div>
                <h3 className="text-lg font-bold text-[#0d1c2e]">Registrasi Berhasil!</h3>
                <p className="text-xs text-[#3f4850]">
                  {state.message || "Selamat datang di JejakLapak. Mengarahkan Anda ke portal login..."}
                </p>
              </div>
            ) : (
              <form action={formAction} className="space-y-4 text-xs">
                {/* 1. Nama Pemilik & Nama Lapak */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#0d1c2e] mb-1">
                      Nama Pemilik Usaha
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#707881]" />
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="Contoh: Mang Asep"
                        className={`w-full rounded-lg bg-[#eff4ff] border pl-9 pr-3 py-2.5 text-xs sm:text-sm text-[#0d1c2e] placeholder:text-[#3f4850]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006194] transition ${
                          state.errors?.name
                            ? "border-rose-400 focus:ring-rose-500"
                            : "border-[#dce9ff]"
                        }`}
                      />
                    </div>
                    {state.errors?.name && (
                      <p className="mt-1 text-[11px] text-rose-600 font-medium">
                        {state.errors.name[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0d1c2e] mb-1">
                      Nama Lapak / Dagangan
                    </label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#707881]" />
                      <input
                        type="text"
                        name="merchantName"
                        required
                        placeholder="Contoh: Cuanki Serayu Keliling"
                        className={`w-full rounded-lg bg-[#eff4ff] border pl-9 pr-3 py-2.5 text-xs sm:text-sm text-[#0d1c2e] placeholder:text-[#3f4850]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006194] transition ${
                          state.errors?.merchantName
                            ? "border-rose-400 focus:ring-rose-500"
                            : "border-[#dce9ff]"
                        }`}
                      />
                    </div>
                    {state.errors?.merchantName && (
                      <p className="mt-1 text-[11px] text-rose-600 font-medium">
                        {state.errors.merchantName[0]}
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Kategori & WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#0d1c2e] mb-1">
                      Kategori Jualan
                    </label>
                    <select
                      name="category"
                      required
                      defaultValue=""
                      className={`w-full rounded-lg bg-[#eff4ff] border px-3 py-2.5 text-xs sm:text-sm text-[#0d1c2e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006194] transition ${
                        state.errors?.category
                          ? "border-rose-400 focus:ring-rose-500"
                          : "border-[#dce9ff]"
                      }`}
                    >
                      <option value="" disabled>
                        Pilih Kategori Kuliner
                      </option>
                      {CATEGORIES.filter((c) => c !== "Semua Kategori").map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {state.errors?.category && (
                      <p className="mt-1 text-[11px] text-rose-600 font-medium">
                        {state.errors.category[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0d1c2e] mb-1">
                      Nomor WhatsApp
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#707881]" />
                      <input
                        type="tel"
                        name="phone"
                        required
                        placeholder="08xxxxxxxxxx"
                        className={`w-full rounded-lg bg-[#eff4ff] border pl-9 pr-3 py-2.5 text-xs sm:text-sm text-[#0d1c2e] placeholder:text-[#3f4850]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006194] transition ${
                          state.errors?.phone
                            ? "border-rose-400 focus:ring-rose-500"
                            : "border-[#dce9ff]"
                        }`}
                      />
                    </div>
                    {state.errors?.phone && (
                      <p className="mt-1 text-[11px] text-rose-600 font-medium">
                        {state.errors.phone[0]}
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Kecamatan & Alamat Standby */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#0d1c2e] mb-1">
                      Kecamatan Basis
                    </label>
                    <select
                      name="district"
                      required
                      defaultValue=""
                      className={`w-full rounded-lg bg-[#eff4ff] border px-3 py-2.5 text-xs sm:text-sm text-[#0d1c2e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006194] transition ${
                        state.errors?.district
                          ? "border-rose-400 focus:ring-rose-500"
                          : "border-[#dce9ff]"
                      }`}
                    >
                      <option value="" disabled>
                        Pilih Wilayah
                      </option>
                      {BANDUNG_DISTRICTS.filter((d) => d !== "Semua Wilayah").map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                    {state.errors?.district && (
                      <p className="mt-1 text-[11px] text-rose-600 font-medium">
                        {state.errors.district[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0d1c2e] mb-1">
                      Alamat Pangkalan / Standby
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#707881]" />
                      <input
                        type="text"
                        name="address"
                        required
                        placeholder="Depan Kampus ITB Jl. Ganesha"
                        className={`w-full rounded-lg bg-[#eff4ff] border pl-9 pr-3 py-2.5 text-xs sm:text-sm text-[#0d1c2e] placeholder:text-[#3f4850]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006194] transition ${
                          state.errors?.address
                            ? "border-rose-400 focus:ring-rose-500"
                            : "border-[#dce9ff]"
                        }`}
                      />
                    </div>
                    {state.errors?.address && (
                      <p className="mt-1 text-[11px] text-rose-600 font-medium">
                        {state.errors.address[0]}
                      </p>
                    )}
                  </div>
                </div>

                {/* 4. Rute Keliling Utama */}
                <div>
                  <label className="block font-semibold text-[#0d1c2e] mb-1">
                    Area / Rute Keliling Utama
                  </label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#707881]" />
                    <input
                      type="text"
                      name="operatingArea"
                      required
                      placeholder="Contoh: Dago Atas, Simpang Dago, s/d Dipatiukur"
                      className={`w-full rounded-lg bg-[#eff4ff] border pl-9 pr-3 py-2.5 text-xs sm:text-sm text-[#0d1c2e] placeholder:text-[#3f4850]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006194] transition ${
                        state.errors?.operatingArea
                          ? "border-rose-400 focus:ring-rose-500"
                          : "border-[#dce9ff]"
                      }`}
                    />
                  </div>
                  {state.errors?.operatingArea && (
                    <p className="mt-1 text-[11px] text-rose-600 font-medium">
                      {state.errors.operatingArea[0]}
                    </p>
                  )}
                </div>

                {/* 5. Email & Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#0d1c2e] mb-1">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#707881]" />
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="lapak@gmail.com"
                        className={`w-full rounded-lg bg-[#eff4ff] border pl-9 pr-3 py-2.5 text-xs sm:text-sm text-[#0d1c2e] placeholder:text-[#3f4850]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006194] transition ${
                          state.errors?.email
                            ? "border-rose-400 focus:ring-rose-500"
                            : "border-[#dce9ff]"
                        }`}
                      />
                    </div>
                    {state.errors?.email && (
                      <p className="mt-1 text-[11px] text-rose-600 font-medium">
                        {state.errors.email[0]}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-[#0d1c2e]">
                        Kata Sandi Akun
                      </label>
                      <span className="text-[11px] text-[#707881]">Min. 6 karakter</span>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#707881]" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        placeholder="••••••••"
                        className={`w-full rounded-lg bg-[#eff4ff] border pl-9 pr-10 py-2.5 text-xs sm:text-sm text-[#0d1c2e] placeholder:text-[#3f4850]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006194] transition ${
                          state.errors?.password
                            ? "border-rose-400 focus:ring-rose-500"
                            : "border-[#dce9ff]"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#707881] hover:text-[#0d1c2e] transition"
                        tabIndex={-1}
                        aria-label={showPassword ? "Sembunyikan sandi" : "Lihat sandi"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {state.errors?.password && (
                      <p className="mt-1 text-[11px] text-rose-600 font-medium">
                        {state.errors.password[0]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 rounded border-[#bfc7d2] text-[#006194] focus:ring-[#006194] mt-0.5"
                  />
                  <label htmlFor="terms" className="text-[#3f4850] text-[11px] leading-tight">
                    Saya menyetujui bahwa informasi lokasi gerobak yang saya bagikan hanya akan digunakan untuk keperluan keterbukaan posisi bagi calon pelanggan di Bandung Raya.
                  </label>
                </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#006194] hover:bg-[#004d77] py-3 text-xs font-bold text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Mendaftarkan Usaha...</span>
                </>
              ) : (
                "Daftar & Masuk Dashboard"
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Sudah memiliki akun?{" "}
          <Link href="/merchant/login" className="font-bold text-[#006194] hover:underline">
            Masuk ke Sini
          </Link>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
