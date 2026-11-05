"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import { setWorkerUrl } from "maplibre-gl";
import { Merchant } from "@/types/merchant";
import { CulinaryZone, LngLat } from "@/types/location";
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
  culinaryZones?: CulinaryZone[];
  activeBasemapId?: string;
  is3D?: boolean;
  followCamera?: boolean;
  userLocation?: LngLat | null;
  calledVendorRoute?: LngLat[] | null;
  zoomAction?: { type: "in" | "out"; id: number } | null;
}

export default function MaplibreView({
  merchants,
  selectedMerchantId,
  onSelectMerchant,
  onOpenDetails,
  onDeselect,
  culinaryZones = [],
  activeBasemapId = DEFAULT_BASEMAP,
  is3D = false,
  followCamera = false,
  userLocation = null,
  calledVendorRoute = null,
  zoomAction = null,
}: MaplibreViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Keep latest prop values in refs so callbacks don't get stale closures
  const culinaryZonesRef = useRef(culinaryZones);
  const selectedMerchantIdRef = useRef(selectedMerchantId);
  const calledVendorRouteRef = useRef(calledVendorRoute);
  const is3DRef = useRef(is3D);

  // Sync refs via layout effects
  useEffect(() => { culinaryZonesRef.current = culinaryZones; });
  useEffect(() => { selectedMerchantIdRef.current = selectedMerchantId; });
  useEffect(() => { calledVendorRouteRef.current = calledVendorRoute; });
  useEffect(() => { is3DRef.current = is3D; });

  // ── GeoJSON helpers ────────────────────────────────────────────────────
  const getZonesGeoJson = useCallback(
    (zones: CulinaryZone[]) => ({
      type: "FeatureCollection" as const,
      features: (zones || []).map((zone) => ({
        type: "Feature" as const,
        properties: { id: zone.id, name: zone.name, color: zone.color },
        geometry: {
          type: "Polygon" as const,
          coordinates: [zone.coordinates],
        },
      })),
    }),
    []
  );

  const getBreadcrumbsGeoJson = useCallback(
    (merchantId: string | null, merchantList: Merchant[]) => {
      if (!merchantId)
        return { type: "FeatureCollection" as const, features: [] };
      const merchant = merchantList.find((m) => m.id === merchantId);
      if (!merchant?.breadcrumbs || merchant.breadcrumbs.length < 2)
        return { type: "FeatureCollection" as const, features: [] };
      return {
        type: "FeatureCollection" as const,
        features: [
          {
            type: "Feature" as const,
            properties: { id: merchant.id, name: merchant.name },
            geometry: {
              type: "LineString" as const,
              coordinates: merchant.breadcrumbs,
            },
          },
        ],
      };
    },
    []
  );

  const getCallRouteGeoJson = useCallback((routeCoords: LngLat[] | null) => {
    if (!routeCoords || routeCoords.length < 2)
      return { type: "FeatureCollection" as const, features: [] };
    return {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          properties: { type: "call-route" },
          geometry: {
            type: "LineString" as const,
            coordinates: routeCoords,
          },
        },
      ],
    };
  }, []);

  // ── Basemap style generator (raster only — GeoJSON added separately) ──
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

  // ── Re-add GeoJSON sources & layers after any style change ───────────
  const addGeoJsonLayers = useCallback(
    (map: maplibregl.Map) => {
      try {
        const layerIds = [
          "culinary-zones-fill",
          "culinary-zones-line",
          "routes-line-casing",
          "routes-line",
          "call-route-line",
        ];
        const sourceIds = ["culinary-zones", "routes-line", "call-vendor-line"];

        layerIds.forEach((id) => {
          if (map.getLayer(id)) map.removeLayer(id);
        });
        sourceIds.forEach((id) => {
          if (map.getSource(id)) map.removeSource(id);
        });

        // Add culinary zones source
        map.addSource("culinary-zones", {
          type: "geojson",
          data: getZonesGeoJson(culinaryZonesRef.current),
        });

        // Add breadcrumb routes source
        map.addSource("routes-line", {
          type: "geojson",
          data: getBreadcrumbsGeoJson(selectedMerchantIdRef.current, []),
        });

        // Add call-vendor route source
        map.addSource("call-vendor-line", {
          type: "geojson",
          data: getCallRouteGeoJson(calledVendorRouteRef.current),
        });

        // Layers
        map.addLayer({
          id: "culinary-zones-fill",
          type: "fill",
          source: "culinary-zones",
          paint: {
            "fill-color": ["get", "color"],
            "fill-opacity": 0.16,
          },
        });

        map.addLayer({
          id: "culinary-zones-line",
          type: "line",
          source: "culinary-zones",
          paint: {
            "line-color": ["get", "color"],
            "line-width": 2,
            "line-dasharray": [2, 2],
          },
        });

        map.addLayer({
          id: "routes-line-casing",
          type: "line",
          source: "routes-line",
          paint: {
            "line-color": "#ffffff",
            "line-width": 6,
            "line-opacity": 0.85,
          },
        });

        map.addLayer({
          id: "routes-line",
          type: "line",
          source: "routes-line",
          paint: {
            "line-color": "#006194",
            "line-width": 3.5,
            "line-dasharray": [1.5, 1.5],
          },
        });

        map.addLayer({
          id: "call-route-line",
          type: "line",
          source: "call-vendor-line",
          paint: {
            "line-color": "#994100",
            "line-width": 4,
            "line-dasharray": [2, 2],
          },
        });

        // Apply current 3D pitch immediately after style loads
        map.easeTo({ pitch: is3DRef.current ? 45 : 0, duration: 0 });
      } catch (err) {
        console.warn("Error adding GeoJSON layers:", err);
      }
    },
    [getZonesGeoJson, getBreadcrumbsGeoJson, getCallRouteGeoJson]
  );

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
      const coords: [number, number] = [
        merchant.location.longitude,
        merchant.location.latitude,
      ];

      const existingMarker = currentMarkerMap.get(merchant.id);

      if (existingMarker) {
        const prevSelected = (existingMarker as unknown as { _isSelected?: boolean })._isSelected;
        if (prevSelected !== isSelected) {
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
          (newMarker as unknown as { _isSelected: boolean })._isSelected = isSelected;
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
        (newMarker as unknown as { _isSelected: boolean })._isSelected = isSelected;
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

  // ── 6. Update GeoJSON sources when selection/route changes ───────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    const routesSource = map.getSource("routes-line") as
      | maplibregl.GeoJSONSource
      | undefined;
    if (routesSource) {
      routesSource.setData(getBreadcrumbsGeoJson(selectedMerchantId, merchants));
    }

    const callRouteSource = map.getSource("call-vendor-line") as
      | maplibregl.GeoJSONSource
      | undefined;
    if (callRouteSource) {
      callRouteSource.setData(getCallRouteGeoJson(calledVendorRoute));
    }
  }, [
    selectedMerchantId,
    calledVendorRoute,
    merchants,
    mapLoaded,
    getBreadcrumbsGeoJson,
    getCallRouteGeoJson,
  ]);

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

    if (followCamera) {
      map.easeTo({ center: targetCoords, duration: 900 });
    } else {
      map.flyTo({
        center: targetCoords,
        zoom: Math.max(map.getZoom(), 15),
        essential: true,
      });
    }
  }, [selectedMerchantId, followCamera, merchants, mapLoaded]);

  // ── 8. User Location Pin ─────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    if (userLocation) {
      if (!userMarkerRef.current) {
        const userEl = document.createElement("div");
        userEl.className = "relative flex items-center justify-center";
        userEl.innerHTML = `
          <span class="absolute h-8 w-8 rounded-full bg-[#006781]/40 animate-ping"></span>
          <div class="h-6 w-6 rounded-full bg-[#006194] border-2 border-white shadow-md flex items-center justify-center text-white text-[11px] font-bold">
            👤
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

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden bg-[#e5ece9]">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
