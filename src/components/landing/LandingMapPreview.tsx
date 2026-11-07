"use client";

import { useEffect, useRef, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import { setWorkerUrl } from "maplibre-gl";
import { BASEMAPS, DEFAULT_BASEMAP } from "@/config/basemaps";

// Set worker URL once at module load time (client-side only)
if (typeof window !== "undefined") {
  try {
    setWorkerUrl("/maplibre-gl-worker.mjs");
  } catch (e) {
    console.warn("setWorkerUrl notice:", e);
  }
}

export interface LandingMapPreviewProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  /** Expose imperative zoom controls to parent via this callback */
  onReady?: (api: { zoomIn: () => void; zoomOut: () => void }) => void;
}

const PREVIEW_VENDORS = [
  {
    id: "cuanki",
    name: "Cuanki Serayu",
    coords: [107.627, -6.901] as [number, number],
    color: "#006781",
    dot: "#006781",
  },
  {
    id: "cilor",
    name: "Cilor & Batagor Ade",
    coords: [107.618, -6.892] as [number, number],
    color: "#994100",
    dot: "#994100",
  },
];

function buildRasterStyle(basemapKey: string): maplibregl.StyleSpecification {
  const basemap = BASEMAPS[basemapKey] ?? BASEMAPS[DEFAULT_BASEMAP];
  return {
    version: 8,
    sources: {
      "basemap-tiles": {
        type: "raster",
        tiles: basemap.tiles,
        tileSize: 256,
        maxzoom: basemap.maxzoom,
        attribution: basemap.attribution,
      },
    },
    layers: [
      {
        id: "basemap-layer",
        type: "raster",
        source: "basemap-tiles",
        minzoom: 0,
        maxzoom: 22,
      },
    ],
  };
}

function createCalloutEl(name: string, dotColor: string): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.style.cssText =
    "display:flex;flex-direction:column;align-items:center;cursor:default;";

  const pill = document.createElement("div");
  pill.style.cssText = `
    display:flex;align-items:center;gap:6px;
    background:white;padding:4px 10px;
    border-radius:9999px;
    box-shadow:0 2px 8px rgba(0,0,0,0.14);
    border:1px solid rgba(0,0,0,0.08);
    white-space:nowrap;
  `;

  const dot = document.createElement("span");
  dot.style.cssText = `
    width:9px;height:9px;border-radius:50%;
    background:${dotColor};flex-shrink:0;
  `;

  const label = document.createElement("span");
  label.textContent = name;
  label.style.cssText =
    "font-size:12px;font-weight:600;color:#0d1c2e;font-family:'Plus Jakarta Sans',sans-serif;";

  pill.appendChild(dot);
  pill.appendChild(label);

  // Triangle pointer
  const tri = document.createElement("div");
  tri.style.cssText = `
    width:10px;height:10px;
    background:white;
    transform:rotate(45deg);
    margin-top:-5px;
    box-shadow:1px 1px 2px rgba(0,0,0,0.08);
  `;

  wrapper.appendChild(pill);
  wrapper.appendChild(tri);
  return wrapper;
}

export default function LandingMapPreview({ onReady }: LandingMapPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn({ duration: 300 });
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut({ duration: 300 });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildRasterStyle(DEFAULT_BASEMAP),
      center: [107.6225, -6.896] as [number, number], // slightly north of center to show more area
      zoom: 14,
      interactive: false, // preview only — disable pan/scroll
      attributionControl: false,
    });

    map.on("error", (e) => {
      console.warn("[LandingMapPreview] map error:", e);
    });

    map.on("load", () => {
      map.resize();

      // Add vendor callout markers
      PREVIEW_VENDORS.forEach((vendor) => {
        const el = createCalloutEl(vendor.name, vendor.dot);
        new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat(vendor.coords)
          .addTo(map);
      });
    });

    // Resize when container changes size
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);

    // Initial resize ticks
    const t1 = setTimeout(() => map.resize(), 100);
    const t2 = setTimeout(() => map.resize(), 500);

    mapRef.current = map;

    // Expose zoom API to parent
    onReady?.({ zoomIn: () => map.zoomIn({ duration: 300 }), zoomOut: () => map.zoomOut({ duration: 300 }) });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Expose zoom handlers when ref changes (re-mount)
  useEffect(() => {
    if (!mapRef.current) return;
    onReady?.({ zoomIn: handleZoomIn, zoomOut: handleZoomOut });
  }, [handleZoomIn, handleZoomOut, onReady]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
}

