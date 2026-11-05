"use client";

import { useState } from "react";
import { Merchant } from "@/types/merchant";
import { LngLat } from "@/types/location";
import { BellRing, X, MapPin, Clock, CheckCircle2 } from "lucide-react";

interface CallVendorModalProps {
  merchant: Merchant | null;
  userLocation: LngLat | null;
  onClose: () => void;
  onConfirmCall: (route: LngLat[]) => void;
}

export function CallVendorModal({
  merchant,
  userLocation,
  onClose,
  onConfirmCall,
}: CallVendorModalProps) {
  const [note, setNote] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!merchant) return null;

  // Default titik pemanggil jika GPS browser belum aktif (misal area Cisangkuy)
  const defaultPickup: LngLat = userLocation || [107.6255, -6.9045];
  const pickupAddress = userLocation
    ? "Lokasi GPS Akurat Anda"
    : "Jl. Cisangkuy No. 18 (Titik Temu Simulasi)";

  // Simulasi kalkulasi jarak & ETA
  const vendorLng = merchant.location.longitude;
  const vendorLat = merchant.location.latitude;
  const distanceKm = (
    Math.sqrt(
      Math.pow((vendorLng - defaultPickup[0]) * 111, 2) +
        Math.pow((vendorLat - defaultPickup[1]) * 111, 2)
    )
  ).toFixed(1);

  const etaMinutes = Math.max(5, Math.round(Number(distanceKm) * 8 + 3));

  const handleConfirm = () => {
    // Buat koordinat rute garis putus-putus
    const midPoint: LngLat = [
      (vendorLng + defaultPickup[0]) / 2 + 0.001,
      (vendorLat + defaultPickup[1]) / 2,
    ];
    const generatedRoute: LngLat[] = [
      [vendorLng, vendorLat],
      midPoint,
      defaultPickup,
    ];

    setIsSuccess(true);
    setTimeout(() => {
      onConfirmCall(generatedRoute);
      setIsSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Panggilan Terkirim!</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Pedagang telah menerima sinyal panggilan Anda. Rute panduan estimasi waktu kedatangan ({etaMinutes} mnt) telah ditampilkan di peta.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                <BellRing className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Panggil Gerobak Mampir</h3>
                <p className="text-xs text-slate-500">Minta pedagang menghampiri titik lokasi Anda</p>
              </div>
            </div>

            {/* Vendor info */}
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Pedagang:</span>
                <span className="font-bold text-slate-800">{merchant.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Posisi Gerobak:</span>
                <span className="text-slate-700 truncate max-w-[200px]">
                  {merchant.location.addressHint}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                <span className="text-slate-500 font-medium">Jarak Estimasi:</span>
                <span className="font-semibold text-slate-800">{distanceKm} km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Perkiraan Waktu Tiba (ETA):</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> ~{etaMinutes} Menit
                </span>
              </div>
            </div>

            {/* Destination Point */}
            <div className="rounded-xl border border-slate-200 p-3 bg-white space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Titik Jemput Pemesan
              </label>
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <MapPin className="h-4 w-4 text-emerald-700 shrink-0" />
                <span className="font-medium">{pickupAddress}</span>
              </div>
            </div>

            {/* Customer Note */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Catatan Patokan / Pesanan (Opsional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Misal: Depan pagar hitam rumah no 12, pesan 2 porsi"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            {/* Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="w-2/3 rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition"
              >
                Kirim Panggilan Gerobak
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

