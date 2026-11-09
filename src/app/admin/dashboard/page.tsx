import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/server/auth";
import { getAdminMerchants } from "@/server/merchants";
import type { AdminMerchantRecord } from "@/types/merchant";
import AdminDashboardClient from "./AdminDashboardClient";

export const instant = false;

async function AdminDashboardLoader() {
  await connection();
  const adminUser = await requireAdmin();

  let initialMerchants: AdminMerchantRecord[] = [];
  let initialError: string | null = null;

  try {
    initialMerchants = await getAdminMerchants();
  } catch (err) {
    initialError =
      err instanceof Error
        ? err.message
        : "Gagal mengambil data pedagang dari PostgreSQL.";
  }

  return (
    <AdminDashboardClient
      adminUser={adminUser}
      initialMerchants={initialMerchants}
      initialError={initialError}
    />
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f9ff] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between rounded-xl border border-[#dce9ff] bg-white px-5 py-4">
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#0d1c2e]">Panel Moderasi Admin</p>
                <p className="text-xs text-[#3f4850]">
                  Memuat daftar pedagang langsung dari PostgreSQL...
                </p>
              </div>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#006194] border-t-transparent" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 animate-pulse">
              <div className="h-28 rounded-xl bg-white border border-[#dce9ff]" />
              <div className="h-28 rounded-xl bg-white border border-[#dce9ff]" />
              <div className="h-28 rounded-xl bg-white border border-[#dce9ff]" />
              <div className="h-28 rounded-xl bg-white border border-[#dce9ff]" />
            </div>
            <div className="h-80 rounded-xl bg-white border border-[#dce9ff] animate-pulse" />
          </div>
        </div>
      }
    >
      <AdminDashboardLoader />
    </Suspense>
  );
}
