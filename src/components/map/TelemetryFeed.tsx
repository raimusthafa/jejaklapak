"use client";

import { useState } from "react";
import { Merchant } from "@/types/merchant";
import { ChevronDown, ChevronUp, BatteryCharging, Radio, CloudCheck } from "lucide-react";

interface TelemetryFeedProps {
  selectedMerchant?: Merchant | null;
  isSimulating: boolean;
  lastSyncTime?: Date | null;
}

export function TelemetryFeed({
  selectedMerchant,
  isSimulating,
  lastSyncTime,
}: TelemetryFeedProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!selectedMerchant) return null;

  const loc = selectedMerchant.location;

  return (
    <div className="absolute bottom-4 left-4 z-20 max-w-sm rounded-xl border border-slate-200 bg-white/95 p-2.5 shadow-lg backdrop-blur-md text-xs">
      <div
        className="flex items-center justify-between gap-3 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span className="font-bold text-slate-800">Telemetri WebGL GPS</span>
          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
            60 FPS GPU
          </span>
        </div>
        <button
          type="button"
          className="text-slate-500 hover:text-slate-800"
          aria-label={isOpen ? "Tutup telemetri feed" : "Buka telemetri feed"}
        >
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5 text-slate-600 font-mono text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Sumber Data:</span>
            <span
              className={`inline-flex items-center gap-1 font-semibold text-[10px] px-1.5 py-0.5 rounded border ${
                isSimulating
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
            >
              {isSimulating ? (
                <>
                  <Radio className="h-3 w-3" /> Simulasi Demo
                </>
              ) : (
                <>
                  <CloudCheck className="h-3 w-3" /> GPS Supabase Live
                </>
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Merchant:</span>
            <span className="font-semibold text-slate-900 truncate max-w-[180px]">
              {selectedMerchant.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Koordinat:</span>
            <span className="text-slate-900">
              {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Heading & Speed:</span>
            <span className="text-slate-900">
              {loc.heading ?? 0}° | {loc.speedKmh ? `${loc.speedKmh.toFixed(1)} km/h` : "Mangkal (0 km/h)"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Akurasi GPS:</span>
            <span className="text-slate-900">±{loc.accuracyMeters}m (Presisi Tinggi)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Perangkat:</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <BatteryCharging className="h-3 w-3" /> {loc.batteryLevel ?? 90}%
            </span>
          </div>
          {lastSyncTime && (
            <div className="flex justify-between text-[10px] text-slate-600 pt-1 border-t border-slate-100">
              <span>Sinkronisasi Terakhir:</span>
              <span>{lastSyncTime.toLocaleTimeString("id-ID")}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

