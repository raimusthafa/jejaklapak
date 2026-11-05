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

export function useMerchantLocationTracker({
  merchantId,
  isActive,
  intervalMs = 15000,
  minDistanceMeters = 5,
}: TrackerOptions) {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [lastSentAt, setLastSentAt] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const lastCoordsRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const lastSentTimeRef = useRef<number>(0);
  const watchIdRef = useRef<number | null>(null);

  const isTracking = isActive && !gpsError;

  // Fungsi pengiriman koordinat ke server
  const sendLocation = useCallback(
    async (lat: number, lng: number, acc = 10) => {
      try {
        await reportMerchantLocationAction(merchantId, lat, lng, acc);
        const timestampIso = new Date().toISOString();
        setLastSentAt(timestampIso);
        lastSentTimeRef.current = Date.now();
        lastCoordsRef.current = { latitude: lat, longitude: lng };
      } catch (err) {
        console.error("Gagal mengirim koordinat GPS pedagang:", err);
      }
    },
    [merchantId]
  );

  // Set manual coordinates jika GPS ditolak atau device tanpa sensor
  const setManualCoords = useCallback(
    async (lat: number, lng: number) => {
      setCoords({ latitude: lat, longitude: lng });
      setAccuracy(5);
      setGpsError(null);
      await sendLocation(lat, lng, 5);
    },
    [sendLocation]
  );

  useEffect(() => {
    if (!isActive) {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      return;
    }

    // Watch position perubahan lokasi fisik
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy: acc, speed: spd, heading: hdg } = pos.coords;
        setCoords({ latitude, longitude });
        setAccuracy(acc);
        setSpeed(spd);
        setHeading(hdg);
        setGpsError(null);

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
          sendLocation(latitude, longitude, acc);
        }
      },
      (err) => {
        let msg = "Tidak dapat mengakses GPS.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Izin akses lokasi ditolak. Anda dapat memilih titik lokasi pangkalan secara manual.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "Informasi posisi GPS tidak tersedia pada perangkat ini.";
        } else if (err.code === err.TIMEOUT) {
          msg = "Permintaan posisi GPS melebihi batas waktu (timeout).";
        }
        setGpsError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 5000,
      }
    );

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isActive, intervalMs, minDistanceMeters, sendLocation]);

  return {
    coords,
    accuracy,
    speed,
    heading,
    lastSentAt,
    isTracking,
    gpsError,
    setManualCoords,
    sendCurrentLocation: () => {
      if (coords) {
        sendLocation(coords.latitude, coords.longitude, accuracy ?? 10);
      }
    },
  };
}
