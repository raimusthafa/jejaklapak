import { CulinaryZone } from "@/types/location";

export const MOCK_CULINARY_ZONES: CulinaryZone[] = [
  {
    id: "zone-dipatiukur",
    name: "Sentra Kuliner Dipati Ukur",
    description: "Kawasan kuliner mahasiswa dan UMKM gerobak sekitar Unpad & ITHB",
    district: "Coblong",
    vendorCountEstimate: 24,
    color: "#16a34a",
    coordinates: [
      [107.6165, -6.8925],
      [107.6195, -6.8922],
      [107.6202, -6.8975],
      [107.6171, -6.8978],
      [107.6165, -6.8925],
    ],
  },
  {
    id: "zone-cisangkuy",
    name: "Zona Hijau Kuliner Cisangkuy",
    description: "Kawasan binaan pedagang gerobak taman Gedung Sate dan Cisangkuy",
    district: "Bandung Wetan",
    vendorCountEstimate: 18,
    color: "#2563eb",
    coordinates: [
      [107.6212, -6.9015],
      [107.6255, -6.9012],
      [107.6251, -6.9062],
      [107.6210, -6.9059],
      [107.6212, -6.9015],
    ],
  },
  {
    id: "zone-lengkong",
    name: "Night Street Food Lengkong Kecil",
    description: "Sentra kuliner malam kaki lima jalan Lengkong Kecil",
    district: "Lengkong",
    vendorCountEstimate: 32,
    color: "#ea580c",
    coordinates: [
      [107.6115, -6.9242],
      [107.6152, -6.9240],
      [107.6149, -6.9275],
      [107.6112, -6.9272],
      [107.6115, -6.9242],
    ],
  },
];

