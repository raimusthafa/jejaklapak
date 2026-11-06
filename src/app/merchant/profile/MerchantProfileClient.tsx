"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MOCK_MERCHANTS } from "@/data/mock/merchants";
import { Merchant } from "@/types/merchant";
import { updateMerchantProfileAction } from "@/actions/merchant";
import { MerchantCategory } from "@/types/merchant";
import { CATEGORIES, BANDUNG_DISTRICTS } from "@/config/constants";
import { ArrowLeft, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { AuthUser } from "@/server/auth";

export default function MerchantProfileClient({
  user,
  initialMerchant,
}: {
  user?: AuthUser;
  initialMerchant?: Merchant | null;
}) {
  const current = initialMerchant || MOCK_MERCHANTS[0];

  const [merchantId, setMerchantId] = useState(initialMerchant?.id || user?.merchantId || current.id);
  const [name, setName] = useState(initialMerchant?.name || user?.merchantName || current.name);
  const [description, setDescription] = useState(initialMerchant?.description || current.description);
  const [category, setCategory] = useState<MerchantCategory>(initialMerchant?.category || current.category);
  const [phone, setPhone] = useState(initialMerchant?.phone || user?.phone || current.phone);
  const [address, setAddress] = useState(initialMerchant?.location.addressHint || current.location.addressHint);
  const [district, setDistrict] = useState(initialMerchant?.district || current.district);
  const [operatingArea, setOperatingArea] = useState(initialMerchant?.operatingArea || current.operatingArea);
  const [iconEmoji, setIconEmoji] = useState(initialMerchant?.iconEmoji || current.iconEmoji || "🍲");

  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function fetchMerchantData() {
      try {
        const res = await fetch("/api/merchants");
        if (res.ok) {
          const json = await res.json();
          if (json.ok && Array.isArray(json.data) && json.data.length > 0) {
            const found =
              json.data.find(
                (m: Merchant) =>
                  (user?.merchantSlug && m.slug === user.merchantSlug) ||
                  (user?.merchantId && m.id === user.merchantId) ||
                  m.slug === "cuanki-batagor-serayu-keliling"
              ) || json.data[0];
            setMerchantId(found.id);
            setName(found.name);
            setDescription(found.description);
            setCategory(found.category);
            setPhone(found.phone);
            setAddress(found.location.addressHint);
            setDistrict(found.district);
            setOperatingArea(found.operatingArea);
            setIconEmoji(found.iconEmoji || "🍲");
          }
        }
      } catch (err) {
        console.warn("Could not load merchant profile from API:", err);
      }
    }
    fetchMerchantData();
  }, [user?.merchantId, user?.merchantSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("phone", phone);
    formData.append("address", address);
    formData.append("district", district);
    formData.append("operatingArea", operatingArea);

    const result = await updateMerchantProfileAction(merchantId, formData);
    setIsPending(false);

    if (result.ok) {
      setIsSuccess(true);
      setMessage(result.message || "Profil berhasil diperbarui!");
      setTimeout(() => setMessage(null), 3500);
    } else {
      setIsSuccess(false);
      setMessage(result.message || "Gagal memperbarui profil.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8fb] pb-16">
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <Link
            href="/merchant/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0284c7] transition"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard Pedagang
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Kelola Profil Usaha</h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Perbarui identitas pedagang, kategori, dan area rute berkeliling di database Supabase/Prisma.
            </p>
          </div>

          {message && (
            <div
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border ${
                isSuccess
                  ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                  : "text-rose-700 bg-rose-50 border-rose-200"
              }`}
            >
              {isSuccess ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {message}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5 text-xs">
          {/* Avatar / Icon Emoji */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl border border-slate-200 shadow-inner">
              <span>{iconEmoji}</span>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ikon Gerobak / Usaha (Emoji)</label>
              <input
                type="text"
                value={iconEmoji}
                onChange={(e) => setIconEmoji(e.target.value)}
                maxLength={4}
                className="w-24 rounded-lg border border-slate-200 px-3 py-1.5 text-center text-sm font-bold focus:border-emerald-600 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 block mt-1">Pilih emoji makanan yang merepresentasikan tokomu</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Usaha / Gerobak</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Kuliner</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MerchantCategory)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
              >
                {CATEGORIES.filter((c) => c !== "Semua Kategori").map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi & Tagline Usaha</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp Aktif</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kecamatan Pangkalan</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
              >
                {BANDUNG_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alamat Pangkalan / Dapur</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Area / Rute Keliling Utama</label>
              <input
                type="text"
                required
                value={operatingArea}
                onChange={(e) => setOperatingArea(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl bg-[#60C1E5] hover:bg-[#4eb3d8] px-5 py-2.5 text-xs font-bold text-slate-900 shadow-sm transition disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isPending ? "Menyimpan ke Server..." : "Simpan Perubahan Profil"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
