"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { loginAction, type ActionState } from "@/actions/auth";

const initialState: ActionState = {
  ok: false,
};

export default function MerchantLoginPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state.ok) {
      const timer = setTimeout(() => {
        router.push("/merchant/dashboard");
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [state.ok, router]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <Store className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Portal Masuk Pedagang
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Kelola status sesi berjualan dan lokasi gerobakmu secara real-time.
          </p>
        </div>

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

        <form action={formAction} className="mt-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Pedagang</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                name="email"
                defaultValue="budi.pedagang@gmail.com"
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
                defaultValue="Password123!"
                required
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2.5 text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            {state.errors?.password && (
              <p className="mt-1 text-[11px] text-rose-600">{state.errors.password[0]}</p>
            )}
          </div>

          <div className="rounded-lg bg-emerald-50/60 p-3 text-[11px] text-emerald-900 border border-emerald-100">
            <strong>Koneksi Auth Supabase & Prisma Aktif:</strong> Akun demo sudah terisi (Budi Santoso). Tekan tombol di bawah untuk masuk ke dashboard.
          </div>

          <button
            type="submit"
            disabled={isPending || state.ok}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition disabled:opacity-50"
          >
            {isPending ? "Memverifikasi..." : "Masuk ke Dashboard Pedagang"}
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
    </div>
  );
}
