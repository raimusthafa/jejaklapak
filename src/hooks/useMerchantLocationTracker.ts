"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { reportMerchantLocationAction } from "@/actions/location";

interface TrackerOptions {
  merchantId: string;
  isActive: boolean;
  intervalMs?: number; // interval pengiriman ke backend (default: 15 detik)
  minDistanceMeters?: number; // ambang pergerakan minimum (default: 5 meter)
}

function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface LocationSyncResult {
  ok: boolean;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  capturedAt?: string;
  message?: string;
}

function formatGeolocationError(err: GeolocationPositionError): string {
  if (err.code === err.PERMISSION_DENIED) {
    return "Izin akses lokasi ditolak oleh browser. Aktifkan izin lokasi atau gunakan Ubah Manual.";
  }
  if (err.code === err.POSITION_UNAVAILABLE) {
    return "Informasi posisi GPS tidak tersedia pada perangkat ini.";
  }
  if (err.code === err.TIMEOUT) {
    return "Permintaan posisi GPS melebihi batas waktu (timeout).";
  }
  return "Tidak dapat mengakses GPS perangkat.";
}

export function useMerchantLocationTracker({
  merchantId,
  isActive,
  intervalMs = 15000,
  minDistanceMeters = 5,
}: TrackerOptions) {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [browserCoords, setBrowserCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [lastSentAt, setLastSentAt] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const lastCoordsRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const lastBrowserCoordsRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const lastSentTimeRef = useRef<number>(0);
  const watchIdRef = useRef<number | null>(null);
  const hasManualOverrideRef = useRef(false);

  const isTracking = isActive && !gpsError;

  // Fungsi pengiriman koordinat ke server
  const sendLocation = useCallback(
    async (lat: number, lng: number, acc = 10): Promise<LocationSyncResult> => {
      try {
        const res = await reportMerchantLocationAction(merchantId, lat, lng, acc);
        if (!res?.ok) {
          return {
            ok: false,
            message: res?.message || "Gagal menyimpan koordinat lokasi ke server.",
          };
        }
        const timestampIso = new Date().toISOString();
        setLastSentAt(timestampIso);
        lastSentTimeRef.current = Date.now();
        lastCoordsRef.current = { latitude: lat, longitude: lng };
        return {
          ok: true,
          latitude: lat,
          longitude: lng,
          accuracy: acc,
          capturedAt: timestampIso,
        };
      } catch (err) {
        console.error("Gagal mengirim koordinat GPS pedagang:", err);
        return {
          ok: false,
          message: "Terjadi kesalahan jaringan saat mengirim lokasi GPS.",
        };
      }
    },
    [merchantId]
  );

  // Set manual coordinates jika GPS ditolak atau pedagang memilih titik pangkalan manual
  const setManualCoords = useCallback(
    async (lat: number, lng: number): Promise<LocationSyncResult> => {
      hasManualOverrideRef.current = true;
      setCoords({ latitude: lat, longitude: lng });
      setAccuracy(5);
      setGpsError(null);
      return await sendLocation(lat, lng, 5);
    },
    [sendLocation]
  );

  // Ambil lokasi perangkat saat halaman dibuka agar marker "Lokasi Saya" sesuai GPS nyata
  useEffect(() => {
    let cancelled = false;

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      const timer = setTimeout(() => {
        if (!cancelled) {
          setGpsError("Browser Anda tidak mendukung layanan lokasi GPS.");
        }
      }, 0);
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        const { latitude, longitude, accuracy: acc, speed: spd, heading: hdg } = pos.coords;
        const nextBrowserCoords = { latitude, longitude };
        lastBrowserCoordsRef.current = nextBrowserCoords;
        setBrowserCoords(nextBrowserCoords);
        setGpsError(null);

        if (!hasManualOverrideRef.current) {
          setAccuracy(acc);
          setSpeed(spd);
          setHeading(hdg);
        }
      },
      (err) => {
        if (cancelled) return;
        setGpsError(formatGeolocationError(err));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  // Pelacakan real-time ke backend hanya berjalan ketika status berjualan ACTIVE
  useEffect(() => {
    if (!isActive) {
      if (watchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }

    // Watch position perubahan lokasi fisik
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy: acc, speed: spd, heading: hdg } = pos.coords;

        // Perbarui lokasi saya hanya jika belum ada atau berpindah minimal minDistanceMeters (hindari map flyTo berulang akibat jitter GPS)
        const prevBrowser = lastBrowserCoordsRef.current;
        const movedFromBrowser = prevBrowser
          ? calculateDistanceMeters(prevBrowser.latitude, prevBrowser.longitude, latitude, longitude)
          : 9999;

        if (!prevBrowser || movedFromBrowser >= minDistanceMeters) {
          const nextBrowserCoords = { latitude, longitude };
          lastBrowserCoordsRef.current = nextBrowserCoords;
          setBrowserCoords(nextBrowserCoords);
        }

        setGpsError(null);

        if (hasManualOverrideRef.current) {
          return;
        }

        setCoords({ latitude, longitude });
        setAccuracy(acc);
        setSpeed(spd);
        setHeading(hdg);

        const now = Date.now();
        const timeDiff = now - lastSentTimeRef.current;

        // Hitung jarak dari titik terakhir yang dikirim
        let distance = 9999;
        if (lastCoordsRef.current) {
          distance = calculateDistanceMeters(
            lastCoordsRef.current.latitude,
            lastCoordsRef.current.longitude,
            latitude,
            longitude
          );
        }

        // Kirim update jika:
        // 1. Belum pernah kirim, atau
        // 2. Berpindah sejauh > minDistanceMeters, atau
        // 3. Sudah lewat waktu intervalMs (heartbeat)
        if (!lastCoordsRef.current || distance >= minDistanceMeters || timeDiff >= intervalMs) {
          void sendLocation(latitude, longitude, acc);
        }
      },
      (err) => {
        setGpsError(formatGeolocationError(err));
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );

    return () => {
      if (watchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isActive, intervalMs, minDistanceMeters, sendLocation]);

  // Ambil koordinat GPS terbaru langsung dari perangkat lalu kirim ke database
  const sendCurrentLocation = useCallback(async (): Promise<LocationSyncResult> => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      const msg = "Browser Anda tidak mendukung layanan lokasi GPS.";
      setGpsError(msg);
      return { ok: false, message: msg };
    }

    return await new Promise<LocationSyncResult>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude, accuracy: acc, speed: spd, heading: hdg } = pos.coords;
          hasManualOverrideRef.current = false;

          const nextCoords = { latitude, longitude };
          lastBrowserCoordsRef.current = nextCoords;
          setBrowserCoords(nextCoords);
          setCoords(nextCoords);
          setAccuracy(acc);
          setSpeed(spd);
          setHeading(hdg);
          setGpsError(null);

          const syncRes = await sendLocation(latitude, longitude, acc);
          resolve(syncRes);
        },
        (err) => {
          const msg = formatGeolocationError(err);
          setGpsError(msg);
          resolve({ ok: false, message: msg });
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });
  }, [sendLocation]);

  return {
    coords,
    browserCoords,
    accuracy,
    speed,
    heading,
    lastSentAt,
    isTracking,
    gpsError,
    setManualCoords,
    sendCurrentLocation,
  };
}
