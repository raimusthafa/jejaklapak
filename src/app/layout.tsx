import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#006194",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "JejakLapak — Pelacak UMKM & Pedagang Keliling Bandung Raya",
  description:
    "Temukan lokasi terkini, jadwal buka, dan rute gerobak pedagang UMKM keliling di sekitarmu secara real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={cn("h-full", "font-sans", plusJakartaSans.variable)}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans min-h-screen flex flex-col bg-[#f8f9ff] text-[#0d1c2e] antialiased selection:bg-[#cce5ff] selection:text-[#001d31]">
        <Suspense fallback={<div className="h-16 border-b border-[#dce9ff] bg-white" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
