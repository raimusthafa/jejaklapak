"use client";

import { useState } from "react";
import { BASEMAPS } from "@/config/basemaps";
import {
  Radio,
  Navigation,
  Compass,
  Play,
  Pause,
  FastForward,
  Check,
  ChevronDown,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MapControlsProps {
  activeBasemap: string;
  onSelectBasemap: (id: string) => void;
  is3D: boolean;
  onToggle3D: () => void;
  followCamera: boolean;
  onToggleFollowCamera: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  simulationSpeed: number;
  onChangeSpeed: (speed: number) => void;
  onRequestUserLocation: () => void;
  isLocating?: boolean;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

export function MapControls({
  activeBasemap,
  onSelectBasemap,
  is3D,
  onToggle3D,
  isSimulating,
  onToggleSimulation,
  simulationSpeed,
  onChangeSpeed,
  onRequestUserLocation,
  isLocating = false,
  onZoomIn,
  onZoomOut,
}: MapControlsProps) {
  const [showMoreBasemaps, setShowMoreBasemaps] = useState(false);
  const currentBasemap = BASEMAPS[activeBasemap] || BASEMAPS["esri-street"];

  return (
    <>
      {/* ── Top Floating Map Controls HUD ── */}
      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-30 select-none">
        {/* Telemetry Pill Left */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Radius Pill */}
          <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-slate-200/70 flex items-center gap-2 text-slate-900">
            <Radio className="h-4 w-4 text-[#006194]" />
            <span className="text-xs font-semibold">Radius: 1.5 Km</span>
          </div>

          {/* Latency Pill */}
          <div className="hidden sm:flex bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-slate-200/70 items-center gap-1.5 text-slate-800">
            <span className="w-2 h-2 rounded-full bg-[#006781] animate-pulse" />
            <span className="text-xs text-slate-600 font-medium">Latensi: 0.4 dtk</span>
          </div>
        </div>

        {/* Basemap Switcher Right — Satu pilihan saja + dropdown */}
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur p-1 rounded-lg shadow-sm border border-slate-200/70 pointer-events-auto relative">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreBasemaps(!showMoreBasemaps)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold bg-[#006194] text-white shadow-xs hover:bg-[#007bb9] transition-colors"
              title="Ganti Jenis Peta"
            >
              <Layers className="h-3.5 w-3.5 shrink-0" />
              <span className="max-w-[120px] truncate">{currentBasemap.name}</span>
              <ChevronDown
                className={cn(
                  "h-3 w-3 shrink-0 transition-transform",
                  showMoreBasemaps && "rotate-180"
                )}
              />
            </button>

            {showMoreBasemaps && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-40">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                  Pilihan Peta Bebas API Key
                </div>
                {Object.values(BASEMAPS)
                  .filter((b, idx, arr) => arr.findIndex((x) => x.name === b.name) === idx)
                  .map((b) => {
                    const isActive =
                      activeBasemap === b.id ||
                      (b.id === "esri-satellite" && activeBasemap === "esri-imagery");
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          onSelectBasemap(b.id);
                          setShowMoreBasemaps(false);
                        }}
                        className={cn(
                          "w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between",
                          isActive
                            ? "bg-[#eff4ff] text-[#006194] font-bold"
                            : "text-slate-700 hover:bg-slate-50"
                        )}
                      >
                        <div>
                          <div>{b.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal leading-tight">
                            {b.description}
                          </div>
                        </div>
                        {isActive && <Check className="h-3.5 w-3.5 text-[#006194] shrink-0 ml-1.5" />}
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Posisi Saya */}
          <button
            type="button"
            onClick={onRequestUserLocation}
            disabled={isLocating}
            className={cn(
              "w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors ml-0.5",
              isLocating && "animate-pulse text-[#006194]"
            )}
            title="Posisi Saya (GPS Browser)"
          >
            <Navigation className="h-4 w-4 text-[#006194]" />
          </button>
        </div>
      </div>

      {/* ── Bottom Map Status Controls HUD ── */}
      <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-end justify-between pointer-events-none z-30 select-none">
        {/* Map Legend & Scale Left */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-slate-200/70 flex items-center gap-3 text-slate-800 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006194]" />
              <span>Gerak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#994100]" />
              <span>Ngetem</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>Standby</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono border-l border-slate-200 pl-2">
              1:5.000
            </span>
          </div>
        </div>

        {/* Zoom & Compass Controls Right */}
        <div className="flex flex-col gap-1.5 pointer-events-auto items-end">
          {/* Zoom In + */}
          <button
            type="button"
            onClick={onZoomIn}
            className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-800 hover:bg-slate-50 transition-colors font-bold text-lg border border-slate-200/70"
            title="Perbesar Peta"
          >
            +
          </button>

          {/* Zoom Out − */}
          <button
            type="button"
            onClick={onZoomOut}
            className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-800 hover:bg-slate-50 transition-colors font-bold text-lg border border-slate-200/70"
            title="Perkecil Peta"
          >
            −
          </button>

          {/* 3D / Compass Toggle */}
          <button
            type="button"
            onClick={onToggle3D}
            className={cn(
              "w-9 h-9 rounded-lg shadow-sm flex items-center justify-center transition-colors border border-slate-200/70",
              is3D
                ? "bg-[#006194] text-white hover:bg-[#007bb9]"
                : "bg-white text-[#006194] hover:bg-slate-50"
            )}
            title={is3D ? "Mode 2D (Tampak Atas)" : "Mode 3D (Kemiringan 45°)"}
          >
            <Compass className="h-4 w-4" />
          </button>

          {/* Simulation Controls Bar (Compact) */}
          <div className="flex items-center gap-1 bg-white/95 p-1 rounded-lg shadow-sm border border-slate-200/70 mt-1">
            <button
              type="button"
              onClick={onToggleSimulation}
              className={cn(
                "w-7 h-7 rounded flex items-center justify-center transition-colors",
                isSimulating
                  ? "bg-[#eff4ff] text-[#006194]"
                  : "text-slate-600 hover:bg-slate-100"
              )}
              title={isSimulating ? "Jeda Simulasi GPS" : "Jalankan Simulasi GPS"}
            >
              {isSimulating ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => onChangeSpeed(simulationSpeed === 1 ? 3 : 1)}
              className="px-1.5 py-0.5 rounded text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-0.5"
              title="Kecepatan Simulasi"
            >
              <FastForward className="h-3 w-3 text-slate-400" />
              {simulationSpeed}x
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
