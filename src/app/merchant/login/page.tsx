"use client";

import { useActionState, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Store,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { loginAction, type ActionState } from "@/actions/auth";
import { toast } from "@/components/ui/sonner";

const initialState: ActionState = {
  ok: false,
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const registeredParam = searchParams.get("registered");
  const registeredEmail = searchParams.get("email");

  const [emailInput, setEmailInput] = useState(registeredEmail || "");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  // Toast saat baru mendaftar atau saat diarahkan oleh sistem
  useEffect(() => {
    if (registeredParam) {
      toast.success(
        "Pendaftaran berhasil! Akun lapak Anda aktif. Silakan masukkan kata sandi untuk masuk.",
        {
          id: "reg-success",
          duration: 6000,
        }
      );
    } else if (redirectParam) {
      toast.info("Silakan masuk terlebih dahulu untuk mengakses halaman tujuan Anda.", {
        id: "redirect-info",
      });
    }
  }, [registeredParam, redirectParam]);

  // Handler status login
  useEffect(() => {
    if (state.ok) {
      toast.success(state.message || "Login berhasil! Mengarahkan ke dashboard...", {
        id: "login-status",
      });
      const destination = redirectParam || state.redirectTo || "/merchant/dashboard";
      const timer = setTimeout(() => {
        router.push(destination);
        router.refresh();
      }, 700);
      return () => clearTimeout(timer);
    } else if (state.message) {
      toast.error(state.message, { id: "login-status" });
    }
  }, [state.ok, state.message, state.redirectTo, redirectParam, router]);

  return (
    <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e6f6fc] text-[#0284c7]">
          <Store className="h-6 w-6 text-[#0284c7]" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Portal Masuk JejakLapak
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Masuk dengan akun terdaftar. Sistem otomatis menyesuaikan dashboard sesuai hak akses akun Anda.
        </p>
      </div>

      {/* Banner informasi jika baru mendaftar */}
      {registeredParam && (
        <div className="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200/90 p-3.5 text-xs text-emerald-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-emerald-900">Pendaftaran Berhasil!</p>
            <p className="text-emerald-700 leading-relaxed">
              Akun lapak Anda telah aktif. Masukkan kata sandi akun Anda di bawah untuk masuk ke Dashboard.
            </p>
          </div>
        </div>
      )}

      {/* Banner error jika login gagal */}
      {state.message && !state.ok && (
        <div className="flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200/90 p-3.5 text-xs text-rose-800">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-rose-900">Gagal Masuk</p>
            <p className="text-rose-700 leading-relaxed">{state.message}</p>
          </div>
        </div>
      )}

      <form action={formAction} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Email Pengguna</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="email"
              name="email"
              placeholder="nama@email.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#0284c7] focus:outline-none focus:ring-1 focus:ring-[#0284c7] transition"
            />
          </div>
          {state.errors?.email && (
            <p className="mt-1 text-[11px] text-rose-600 font-medium">{state.errors.email[0]}</p>
          )}
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Kata Sandi</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 pl-9 pr-10 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#0284c7] focus:outline-none focus:ring-1 focus:ring-[#0284c7] transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              tabIndex={-1}
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {state.errors?.password && (
            <p className="mt-1 text-[11px] text-rose-600 font-medium">{state.errors.password[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending || state.ok}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#60C1E5] hover:bg-[#4eb3d8] py-3 text-xs font-bold text-slate-900 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-slate-900" />
              <span>Memverifikasi Akun...</span>
            </>
          ) : (
            <>
              <span>Masuk ke Akun</span>
              <ArrowRight className="h-4 w-4 text-slate-900" />
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
        Belum mendaftarkan lapakmu?{" "}
        <Link href="/merchant/register" className="font-bold text-[#0284c7] hover:underline">
          Daftar Usaha Baru
        </Link>
      </div>
    </div>
  );
}

export default function MerchantLoginPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#f4f8fb] py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-slate-400 text-sm">Memuat form login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
