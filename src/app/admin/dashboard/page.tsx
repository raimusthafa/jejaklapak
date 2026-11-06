import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/server/auth";
import AdminDashboardClient from "./AdminDashboardClient";

export const instant = false;

async function AdminDashboardLoader() {
  await connection();
  const adminUser = await requireAdmin();
  return <AdminDashboardClient adminUser={adminUser} />;
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">
          Memverifikasi hak akses admin...
        </div>
      }
    >
      <AdminDashboardLoader />
    </Suspense>
  );
}
