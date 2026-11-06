"use client";

import { useActionState, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Store, Lock, Mail, ArrowRight } from "lucide-react";
import { loginAction, type ActionState } from "@/actions/auth";
import { toast } from "@/components/ui/sonner";

const initialState: ActionState = {
  ok: false,
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (redirectParam) {
      toast.info("Silakan masuk terlebih dahulu untuk mengakses halaman tujuan Anda.", {
        id: "redirect-info",
      });
    }
  }, [redirectParam]);

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
              type="password"
              name="password"
              placeholder="••••••••"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-[#0284c7] focus:outline-none focus:ring-1 focus:ring-[#0284c7] transition"
            />
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
          {isPending ? "Memverifikasi Akun..." : "Masuk ke Akun"}
          <ArrowRight className="h-4 w-4 text-slate-900" />
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
