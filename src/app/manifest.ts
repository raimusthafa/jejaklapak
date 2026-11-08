import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JejakLapak — Pelacak UMKM Bandung",
    short_name: "JejakLapak",
    description: "Pelacak gerobak dan pangkalan kuliner UMKM Bandung Raya real-time",
    start_url: "/explore",
    display: "standalone",
    background_color: "#f8f9ff",
    theme_color: "#006194",
    icons: [
      {
        src: "/favicon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/favicon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}