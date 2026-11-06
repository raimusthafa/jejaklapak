"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MOCK_MERCHANTS } from "@/data/mock/merchants";
import { Merchant } from "@/types/merchant";
import { updateMerchantProfileAction } from "@/actions/merchant";
import { MerchantCategory } from "@/types/merchant";
import { CATEGORIES, BANDUNG_DISTRICTS } from "@/config/constants";
import { ArrowLeft, Save, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { AuthUser } from "@/server/auth";
import { MerchantSidebar } from "@/components/merchant/MerchantSidebar";
import { toast } from "@/components/ui/sonner";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

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
    setErrors({});

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
      setErrors({});
      toast.success(result.message || "Profil berhasil diperbarui!");
    } else {
      if (result.errors) {
        setErrors(result.errors);
      }
      toast.error(result.message || "Gagal memperbarui profil.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8fb] text-slate-800 flex">
      {/* Merchant Sidebar */}
      <MerchantSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        merchantName={name}
        merchantSlug={user?.merchantSlug || current.slug}
        iconEmoji={iconEmoji}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16">
        <div className="bg-white border-b border-slate-200">
          <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              title={isSidebarOpen ? "Tutup Sidebar Navigasi" : "Buka Sidebar Navigasi"}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors shrink-0 cursor-pointer"
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeftOpen className="h-5 w-5" />
              )}
            </button>

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
                className={`w-full rounded-xl border px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 transition ${
                  errors.name
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500"
                    : "border-slate-200 focus:border-[#0284c7] focus:ring-[#0284c7]"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.name[0]}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Kuliner</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MerchantCategory)}
                className={`w-full rounded-xl border px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-1 transition ${
                  errors.category
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500"
                    : "border-slate-200 focus:border-[#0284c7] focus:ring-[#0284c7]"
                }`}
              >
                {CATEGORIES.filter((c) => c !== "Semua Kategori").map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.category[0]}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi & Tagline Usaha</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900 focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
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
                className={`w-full rounded-xl border px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 transition ${
                  errors.phone
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500"
                    : "border-slate-200 focus:border-[#0284c7] focus:ring-[#0284c7]"
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.phone[0]}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kecamatan Pangkalan</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2 text-slate-900 bg-white focus:outline-none focus:ring-1 transition ${
                  errors.district
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500"
                    : "border-slate-200 focus:border-[#0284c7] focus:ring-[#0284c7]"
                }`}
              >
                {BANDUNG_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {errors.district && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.district[0]}</p>
              )}
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
                className={`w-full rounded-xl border px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 transition ${
                  errors.address
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500"
                    : "border-slate-200 focus:border-[#0284c7] focus:ring-[#0284c7]"
                }`}
              />
              {errors.address && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.address[0]}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Area / Rute Keliling Utama</label>
              <input
                type="text"
                required
                value={operatingArea}
                onChange={(e) => setOperatingArea(e.target.value)}
                className={`w-full rounded-xl border px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 transition ${
                  errors.operatingArea
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500"
                    : "border-slate-200 focus:border-[#0284c7] focus:ring-[#0284c7]"
                }`}
              />
              {errors.operatingArea && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.operatingArea[0]}</p>
              )}
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
    </div>
  );
}
