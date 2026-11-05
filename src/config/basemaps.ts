export interface BasemapConfig {
  id: string;
  name: string;
  description: string;
  tiles: string[];
  maxzoom: number; // Kritis: batas GPU tile overscaling untuk cegah error "Map data not yet available"
  attribution: string;
  isDark?: boolean;
}

export const BASEMAPS: Record<string, BasemapConfig> = {
  "esri-street": {
    id: "esri-street",
    name: "ESRI Street",
    description: "Tampilan jalan modern & tajam (Default)",
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    ],
    maxzoom: 19,
    attribution: "Tiles © Esri — Source: Esri, DeLorme, NAVTEQ, USGS, Intermap",
  },
  "osm-standard": {
    id: "osm-standard",
    name: "OSM Street",
    description: "Peta jalan resmi komunitas OpenStreetMap",
    tiles: [
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    ],
    maxzoom: 19,
    attribution: "© OpenStreetMap contributors",
  },
  "osm-hot": {
    id: "osm-hot",
    name: "OSM Humanitarian",
    description: "Detail jalan OpenStreetMap",
    tiles: [
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    ],
    maxzoom: 19,
    attribution: "© OpenStreetMap contributors",
  },
  "esri-satellite": {
    id: "esri-satellite",
    name: "ESRI Satelit",
    description: "Foto udara resolusi tinggi permukaan nyata",
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    ],
    maxzoom: 19,
    attribution: "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye",
  },
  "esri-imagery": {
    id: "esri-imagery",
    name: "ESRI Satelit",
    description: "Foto udara resolusi tinggi permukaan nyata",
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    ],
    maxzoom: 19,
    attribution: "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye",
  },
  "esri-dark": {
    id: "esri-dark",
    name: "ESRI Dark Canvas",
    description: "Mode malam monokrom bersih tanpa watermark",
    tiles: [
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    ],
    maxzoom: 16,
    attribution: "Tiles © Esri — Esri, DeLorme, NAVTEQ",
    isDark: true,
  },
};

export const DEFAULT_BASEMAP = "esri-street";
