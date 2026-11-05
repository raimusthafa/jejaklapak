"use client";

import dynamic from "next/dynamic";
import { MaplibreViewProps } from "./MaplibreView";
import { Loader2, MapPin } from "lucide-react";

const MaplibreViewDynamic = dynamic(() => import("./MaplibreView"), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-full min-h-[450px] flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500">
      <div className="flex flex-col items-center gap-3 p-6 text-center max-w-sm">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
          <MapPin className="h-6 w-6 animate-pulse" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Menyiapkan Mesin Peta WebGL</h3>
          <p className="text-xs text-slate-600 mt-1">
            Memuat tile ubin Bandung Raya bebas API key & akselerasi GPU 60 FPS...
          </p>
        </div>
        <Loader2 className="h-5 w-5 animate-spin text-emerald-700 mt-2" />
      </div>
    </div>
  ),
});

export function MaplibreContainer(props: MaplibreViewProps) {
  return <MaplibreViewDynamic {...props} />;
}

