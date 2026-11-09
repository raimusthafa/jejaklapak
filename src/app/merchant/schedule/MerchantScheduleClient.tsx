"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DaySchedule, Merchant, SellingStatus } from "@/types/merchant";
import { updateMerchantSchedulesAction } from "@/actions/merchant";
import { ArrowLeft, Save, PanelLeft } from "lucide-react";
import { AuthUser } from "@/server/auth";
import { MerchantSidebar } from "@/components/merchant/MerchantSidebar";
import { toast } from "@/components/ui/sonner";

const DEFAULT_SCHEDULES: DaySchedule[] = [
  { dayOfWeek: 1, dayName: "Senin", isOpen: true, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 2, dayName: "Selasa", isOpen: true, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 3, dayName: "Rabu", isOpen: true, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 4, dayName: "Kamis", isOpen: true, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 5, dayName: "Jumat", isOpen: true, startTime: "09:00", endTime: "17:00" },
  { dayOfWeek: 6, dayName: "Sabtu", isOpen: true, startTime: "08:00", endTime: "18:00" },
  { dayOfWeek: 0, dayName: "Minggu", isOpen: true, startTime: "08:00", endTime: "18:00" },
];

export default function MerchantScheduleClient({
  user,
  initialMerchant,
  initialSchedules,
}: {
  user?: AuthUser;
  initialMerchant?: Merchant | null;
  initialSchedules?: DaySchedule[];
}) {
  const [merchantId, setMerchantId] = useState(
    initialMerchant?.id || user?.merchantId || "merchant-new"
  );
  const [merchantMeta, setMerchantMeta] = useState<{
    name: string;
    slug?: string;
    photoUrl?: string | null;
    sellingStatus: SellingStatus;
  }>({
    name: initialMerchant?.name || user?.merchantName || "Lapak Saya",
    slug: initialMerchant?.slug || user?.merchantSlug,
    photoUrl: initialMerchant?.image ?? user?.merchantImage ?? null,
    sellingStatus: initialMerchant?.sellingStatus || "ENDED",
  });
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    initialSchedules && initialSchedules.length > 0 ? initialSchedules : DEFAULT_SCHEDULES
  );
  const [isPending, setIsPending] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    async function fetchSchedules() {
      const targetId = initialMerchant?.id || user?.merchantId || user?.merchantSlug;
      if (!targetId) return;

      try {
        const res = await fetch(`/api/merchants/${encodeURIComponent(targetId)}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          if (json.ok && json.data) {
            setMerchantId(json.data.id);
            setMerchantMeta((prev) => ({
              name: json.data.name || "Lapak Saya",
              slug: json.data.slug,
              photoUrl: json.data.image !== undefined ? json.data.image : prev.photoUrl,
              sellingStatus: json.data.sellingStatus || "ENDED",
            }));
            if (json.data.schedule && json.data.schedule.length > 0) {
              setSchedule(json.data.schedule);
            }
          }
        }
      } catch (err) {
        console.warn("Could not load schedules from API:", err);
      }
    }
    fetchSchedules();
  }, [initialMerchant?.id, user?.merchantId, user?.merchantSlug]);

  const handleToggleDay = (dayOfWeek: number) => {
    setSchedule((prev) =>
      prev.map((s) => (s.dayOfWeek === dayOfWeek ? { ...s, isOpen: !s.isOpen } : s))
    );
  };

  const handleTimeChange = (
    dayOfWeek: number,
    field: "startTime" | "endTime",
    val: string
  ) => {
    setSchedule((prev) =>
      prev.map((s) => (s.dayOfWeek === dayOfWeek ? { ...s, [field]: val } : s))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    const payload = schedule.map((s) => ({
      dayOfWeek: s.dayOfWeek,
      isOpen: s.isOpen,
      startTime: s.startTime,
      endTime: s.endTime,
    }));

    const result = await updateMerchantSchedulesAction(merchantId, payload);
    setIsPending(false);

    if (result.ok) {
      toast.success(result.message || "Jadwal mingguan berhasil disimpan!");
    } else {
      toast.error(result.message || "Gagal menyimpan jadwal.");
    }
  };

  const codeTracker = `BDG-${merchantId.slice(-4).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-[#f4f8fb] text-slate-800 flex">
      {/* Merchant Sidebar */}
      <MerchantSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        merchantName={merchantMeta.name}
        merchantSlug={merchantMeta.slug}
        photoUrl={merchantMeta.photoUrl}
        sellingStatus={merchantMeta.sellingStatus}
        trackerCode={codeTracker}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16">
        <div className="bg-white border-b border-slate-200">
          <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                title="Buka Menu Sidebar"
                className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl shadow-xs border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50 hover:text-[#006194] transition-colors cursor-pointer shrink-0"
              >
                <PanelLeft className="h-4 w-4 text-[#006194]" />
                <span className="hidden sm:inline">Menu Sidebar</span>
              </button>
            )}

            <Link
              href="/merchant/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#006194] transition"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard Pedagang
            </Link>
          </div>
        </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Jadwal Operasional Mingguan
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Atur hari dan jam rencana berjualan rutin agar pelanggan dapat mengetahui ritme tokomu.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 text-xs">
          <div className="divide-y divide-slate-100">
            {schedule.map((day) => (
              <div
                key={day.dayOfWeek}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Day name & toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`day-${day.dayOfWeek}`}
                    checked={day.isOpen}
                    onChange={() => handleToggleDay(day.dayOfWeek)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label
                    htmlFor={`day-${day.dayOfWeek}`}
                    className="font-bold text-slate-900 w-24 cursor-pointer"
                  >
                    {day.dayName}
                  </label>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      day.isOpen
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {day.isOpen ? "Buka" : "Libur"}
                  </span>
                </div>

                {/* Time range picker */}
                {day.isOpen ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={day.startTime}
                      onChange={(e) => handleTimeChange(day.dayOfWeek, "startTime", e.target.value)}
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                    <span className="text-slate-400">s/d</span>
                    <input
                      type="time"
                      value={day.endTime}
                      onChange={(e) => handleTimeChange(day.dayOfWeek, "endTime", e.target.value)}
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                ) : (
                  <span className="text-slate-400 italic text-[11px]">Tutup sepanjang hari</span>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl bg-[#006194] hover:bg-[#004d77] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isPending ? "Menyimpan ke Server..." : "Simpan Jadwal Mingguan"}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}
