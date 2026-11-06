"use client";

import { useActionState, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Store, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { loginAction, type ActionState } from "@/actions/auth";

const initialState: ActionState = {
  ok: false,
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [emailInput, setEmailInput] = useState("budi.pedagang@gmail.com");
  const [passwordInput, setPasswordInput] = useState("Password123!");
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state.ok) {
      const destination = redirectParam || state.redirectTo || "/merchant/dashboard";
      const timer = setTimeout(() => {
        router.push(destination);
        router.refresh();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [state.ok, state.redirectTo, redirectParam, router]);

  const setRoleDemo = (role: "MERCHANT" | "ADMIN") => {
    if (role === "ADMIN") {
      setEmailInput("admin@jejaklapak.id");
      setPasswordInput("AdminJejak123!");
    } else {
      setEmailInput("budi.pedagang@gmail.com");
      setPasswordInput("Password123!");
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
          <Store className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Portal Masuk JejakLapak
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          Masuk sebagai Pedagang untuk kelola lapak & GPS, atau Admin untuk verifikasi.
        </p>
      </div>

      {/* Role Switcher Demo Buttons */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl text-xs">
        <button
          type="button"
          onClick={() => setRoleDemo("MERCHANT")}
          className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition ${
            emailInput.includes("pedagang")
              ? "bg-white text-emerald-800 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Store className="h-3.5 w-3.5" />
          Pedagang
        </button>
        <button
          type="button"
          onClick={() => setRoleDemo("ADMIN")}
          className={`py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition ${
            emailInput.includes("admin")
              ? "bg-white text-emerald-800 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Admin
        </button>
      </div>

      {redirectParam && (
        <div className="rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800 border border-amber-200 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>Silakan masuk terlebih dahulu untuk mengakses halaman tujuan Anda.</span>
        </div>
      )}

      {state.message && !state.ok && (
        <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{state.message}</span>
        </div>
      )}

      {state.ok && (
        <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{state.message || "Login berhasil! Mengarahkan..."}</span>
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
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2.5 text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>
          {state.errors?.email && (
            <p className="mt-1 text-[11px] text-rose-600">{state.errors.email[0]}</p>
          )}
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Kata Sandi</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="password"
              name="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2.5 text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>
          {state.errors?.password && (
            <p className="mt-1 text-[11px] text-rose-600">{state.errors.password[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending || state.ok}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition disabled:opacity-50"
        >
          {isPending ? "Memverifikasi Akun..." : "Masuk ke Dashboard"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
        Belum mendaftarkan lapakmu?{" "}
        <Link href="/merchant/register" className="font-bold text-emerald-700 hover:underline">
          Daftar Usaha Baru
        </Link>
      </div>
    </div>
  );
}

export default function MerchantLoginPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-slate-400 text-sm">Memuat form login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
