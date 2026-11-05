"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MOCK_MERCHANTS } from "@/data/mock/merchants";
import { DaySchedule, Merchant } from "@/types/merchant";
import { updateMerchantSchedulesAction } from "@/actions/merchant";
import { ArrowLeft, Save, CheckCircle2, AlertCircle } from "lucide-react";

export default function MerchantSchedulePage() {
  const current = MOCK_MERCHANTS[0];
  const [merchantId, setMerchantId] = useState(current.id);
  const [schedule, setSchedule] = useState<DaySchedule[]>(current.schedule);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function fetchSchedules() {
      try {
        const res = await fetch("/api/merchants");
        if (res.ok) {
          const json = await res.json();
          if (json.ok && Array.isArray(json.data) && json.data.length > 0) {
            const found =
              json.data.find(
                (m: Merchant) => m.slug === "cuanki-batagor-serayu-keliling"
              ) || json.data[0];
            setMerchantId(found.id);
            if (found.schedule && found.schedule.length > 0) {
              setSchedule(found.schedule);
            }
          }
        }
      } catch (err) {
        console.warn("Could not load schedules from API:", err);
      }
    }
    fetchSchedules();
  }, []);

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
    setMessage(null);

    const payload = schedule.map((s) => ({
      dayOfWeek: s.dayOfWeek,
      isOpen: s.isOpen,
      startTime: s.startTime,
      endTime: s.endTime,
    }));

    const result = await updateMerchantSchedulesAction(merchantId, payload);
    setIsPending(false);

    if (result.ok) {
      setIsSuccess(true);
      setMessage(result.message || "Jadwal mingguan berhasil disimpan!");
      setTimeout(() => setMessage(null), 3500);
    } else {
      setIsSuccess(false);
      setMessage(result.message || "Gagal menyimpan jadwal.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <Link
            href="/merchant/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition"
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

          {message && (
            <div
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border ${
                isSuccess
                  ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                  : "text-rose-700 bg-rose-50 border-rose-200"
              }`}
            >
              {isSuccess ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {message}
            </div>
          )}
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
              className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isPending ? "Menyimpan ke Server..." : "Simpan Jadwal Mingguan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
