"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import { setWorkerUrl } from "maplibre-gl";
import { Merchant } from "@/types/merchant";
import { LngLat } from "@/types/location";
import { BASEMAPS, DEFAULT_BASEMAP } from "@/config/basemaps";
import { BANDUNG_CENTER, DEFAULT_ZOOM } from "@/config/constants";
import { createVendorMarkerElement } from "./VendorMarkerElement";

// Configure MapLibre Web Worker for Next.js / Turbopack
if (typeof window !== "undefined") {
  try {
    setWorkerUrl("/maplibre-gl-worker.mjs");
  } catch (e) {
    console.warn("Notice: setWorkerUrl fallback", e);
  }
}

export interface MaplibreViewProps {
  merchants: Merchant[];
  selectedMerchantId: string | null;
  onSelectMerchant: (merchantId: string) => void;
  onOpenDetails?: (merchant: Merchant) => void;
  onDeselect?: () => void;
  activeBasemapId?: string;
  is3D?: boolean;
  followCamera?: boolean;
  userLocation?: LngLat | null;
  focusLocation?: { coords: LngLat; id: number } | null;
  zoomAction?: { type: "in" | "out"; id: number } | null;
}

export default function MaplibreView({
  merchants,
  selectedMerchantId,
  onSelectMerchant,
  onOpenDetails,
  onDeselect,
  activeBasemapId = DEFAULT_BASEMAP,
  is3D = false,
  followCamera = false,
  userLocation = null,
  focusLocation = null,
  zoomAction = null,
}: MaplibreViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Keep latest 3D prop value in ref
  const is3DRef = useRef(is3D);
  useEffect(() => { is3DRef.current = is3D; });

  // ── Basemap style generator (clean raster map without line overlays) ──
  const generateRasterStyle = useCallback(
    (basemapKey: string): maplibregl.StyleSpecification => {
      const basemap = BASEMAPS[basemapKey] || BASEMAPS[DEFAULT_BASEMAP];
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
    },
    []
  );

  // ── Apply pitch after any style change ─────────────────────────────
  const addGeoJsonLayers = useCallback((map: maplibregl.Map) => {
    try {
      map.easeTo({ pitch: is3DRef.current ? 45 : 0, duration: 0 });
    } catch (err) {
      console.warn("Error applying pitch:", err);
    }
  }, []);

  // ── 1. Initialize Map (once) ─────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: generateRasterStyle(activeBasemapId),
      center: BANDUNG_CENTER,
      zoom: DEFAULT_ZOOM,
      pitch: is3D ? 45 : 0,
      bearing: 0,
      maxPitch: 60,
      attributionControl: false, // Menghilangkan watermark / attribution peta
    });

    map.on("error", (e) => {
      console.warn("MapLibre event error:", e);
    });

    map.on("load", () => {
      addGeoJsonLayers(map);
      map.resize();
      setMapLoaded(true);
    });

    // Auto-resize on container size change
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(mapContainerRef.current);

    // Initial resize ticks
    const t1 = setTimeout(() => map.resize(), 100);
    const t2 = setTimeout(() => map.resize(), 500);

    mapInstanceRef.current = map;

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      setMapLoaded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 2. Basemap Switch — setStyle() + re-add GeoJSON on style.load ────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    const onStyleLoad = () => {
      addGeoJsonLayers(map);
      map.resize();
    };

    map.once("style.load", onStyleLoad);
    map.setStyle(generateRasterStyle(activeBasemapId));

    return () => {
      map.off("style.load", onStyleLoad);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBasemapId]);

  // ── 3. 3D Pitch ───────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;
    map.easeTo({ pitch: is3D ? 45 : 0, duration: 800 });
  }, [is3D, mapLoaded]);

  // ── 4. Zoom Action Trigger ────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || !zoomAction) return;

    if (zoomAction.type === "in") {
      map.zoomIn({ duration: 300 });
    } else if (zoomAction.type === "out") {
      map.zoomOut({ duration: 300 });
    }
  }, [zoomAction, mapLoaded]);

  // ── 5. Markers — GPU update & selection state ────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    const currentMarkerMap = markersRef.current;
    const activeMerchantIds = new Set<string>();

    merchants.forEach((merchant) => {
      activeMerchantIds.add(merchant.id);
      const isSelected = merchant.id === selectedMerchantId;
      const isMoving = (merchant.location.speedKmh ?? 0) > 1 ? 1 : 0;
      const visualKey = `${isSelected}|${merchant.sellingStatus}|${merchant.iconEmoji || "🍲"}|${merchant.name}|${isMoving}`;
      const coords: [number, number] = [
        merchant.location.longitude,
        merchant.location.latitude,
      ];

      const existingMarker = currentMarkerMap.get(merchant.id);

      if (existingMarker) {
        const prevVisualKey = (existingMarker as unknown as { _visualKey?: string })._visualKey;
        if (prevVisualKey !== visualKey) {
          existingMarker.remove();
          const markerEl = createVendorMarkerElement(
            merchant,
            isSelected,
            () => onSelectMerchant(merchant.id),
            () => onOpenDetails?.(merchant),
            () => onDeselect?.()
          );
          const newMarker = new maplibregl.Marker({ element: markerEl })
            .setLngLat(coords)
            .addTo(map);
          (newMarker as unknown as { _visualKey: string })._visualKey = visualKey;
          currentMarkerMap.set(merchant.id, newMarker);
        } else {
          existingMarker.setLngLat(coords);
        }
      } else {
        const markerEl = createVendorMarkerElement(
          merchant,
          isSelected,
          () => onSelectMerchant(merchant.id),
          () => onOpenDetails?.(merchant),
          () => onDeselect?.()
        );
        const newMarker = new maplibregl.Marker({ element: markerEl })
          .setLngLat(coords)
          .addTo(map);
        (newMarker as unknown as { _visualKey: string })._visualKey = visualKey;
        currentMarkerMap.set(merchant.id, newMarker);
      }
    });

    // Cleanup removed merchants
    currentMarkerMap.forEach((marker, id) => {
      if (!activeMerchantIds.has(id)) {
        marker.remove();
        currentMarkerMap.delete(id);
      }
    });
  }, [merchants, selectedMerchantId, mapLoaded, onSelectMerchant, onOpenDetails, onDeselect]);

  // ── 7. Camera pan when merchant selected ─────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || !selectedMerchantId) return;

    const selected = merchants.find((m) => m.id === selectedMerchantId);
    if (!selected) return;

    const targetCoords: [number, number] = [
      selected.location.longitude,
      selected.location.latitude,
    ];

    // Mode kunci kamera (follow camera) dinonaktifkan
    // if (followCamera) {
    //   map.easeTo({ center: targetCoords, duration: 900 });
    // } else {
    map.flyTo({
      center: targetCoords,
      zoom: Math.max(map.getZoom(), 15),
      essential: true,
    });
    // }
  }, [selectedMerchantId, followCamera, merchants, mapLoaded]);

  // ── 8. User Location Pin ─────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    if (userLocation) {
      if (!userMarkerRef.current) {
        const userEl = document.createElement("div");
        userEl.style.zIndex = "5";
        userEl.style.pointerEvents = "none";
        userEl.innerHTML = `
          <span class="absolute h-8 w-8 rounded-full bg-[#006781]/40 animate-ping"></span>
          <div class="h-6 w-6 rounded-full bg-[#006194] border-2 border-white shadow-md flex items-center justify-center">
            <span class="h-2 w-2 rounded-full bg-white"></span>
          </div>
        `;
        userMarkerRef.current = new maplibregl.Marker({ element: userEl })
          .setLngLat(userLocation)
          .addTo(map);
      } else {
        userMarkerRef.current.setLngLat(userLocation);
      }

      map.flyTo({
        center: userLocation,
        zoom: Math.max(map.getZoom(), 15),
        essential: true,
        duration: 1200,
      });
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userLocation, mapLoaded]);

  // ── 9. Focus Camera Pan (manual / GPS refresh action) ────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || !focusLocation) return;

    map.flyTo({
      center: focusLocation.coords,
      zoom: Math.max(map.getZoom(), 15),
      essential: true,
      duration: 1000,
    });
  }, [focusLocation, mapLoaded]);

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden bg-[#e5ece9]">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}