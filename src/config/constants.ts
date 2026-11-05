import { LngLat } from "@/types/location";

// Titik Pusat Kota Bandung (Gedung Sate / Alun-Alun)
export const BANDUNG_CENTER: LngLat = [107.6191, -6.9175];
export const DEFAULT_ZOOM = 13.5;

// Threshold Kesegaran Lokasi (PRD Bab 6.10)
export const FRESHNESS_THRESHOLD = {
  LIVE_MINUTES: 2, // < 2 menit = LIVE
  RECENT_MINUTES: 15, // 2-15 menit = RECENT
  // > 15 menit = STALE
};

// Timestamp dasar simulasi data Bandung (Nov 4, 2026)
export const MOCK_BASE_TIMESTAMP = 1793810000000;

export const BANDUNG_DISTRICTS = [
  "Semua Wilayah",
  "Coblong (Dago / Dipati Ukur)",
  "Sumur Bandung (Braga / Riau)",
  "Bandung Wetan (Cisangkuy)",
  "Lengkong (Lengkong Kecil)",
  "Sukajadi (PVJ / Pasteur)",
  "Cicendo (Pasirkaliki)",
  "Cimahi Tengah",
  "Lembang (Bandung Barat)",
] as const;

export const CATEGORIES = [
  "Semua Kategori",
  "Makanan Berat",
  "Camilan",
  "Minuman Segar",
  "Jajanan Tradisional",
] as const;

