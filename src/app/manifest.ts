import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JejakLapak — Pelacak UMKM Bandung",
    short_name: "JejakLapak",
    description: "Pelacak gerobak dan pangkalan kuliner UMKM Bandung Raya real-time",
    start_url: "/explore",
    display: "standalone",
    background_color: "#FCFDFC",
    theme_color: "#15803d",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}

