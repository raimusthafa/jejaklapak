"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AuthUser } from "@/server/auth";
import {
  createMenuItemAction,
  updateMenuItemAction,
  deleteMenuItemAction,
  toggleMenuItemAvailabilityAction,
} from "@/actions/merchant";
import {
  UtensilsCrossed,
  Plus,
  ArrowLeft,
  Pencil,
  Trash2,
  X,
  ToggleLeft,
  ToggleRight,
  PanelLeft,
} from "lucide-react";
import { MerchantSidebar } from "@/components/merchant/MerchantSidebar";
import { toast } from "@/components/ui/sonner";

export interface MenuItemData {
  id: string;
  merchantId: string;
  name: string;
  description: string | null;
  price: number;
  image?: string | null;
  isAvailable: boolean;
}

interface MerchantMenuClientProps {
  user: AuthUser;
  initialItems: MenuItemData[];
}

export default function MerchantMenuClient({
  user,
  initialItems,
}: MerchantMenuClientProps) {
  const merchantId = user.merchantId || "00000000-0000-4000-8000-000000000100";
  const [items, setItems] = useState<MenuItemData[]>(initialItems);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItemData | null>(null);

  // Form Field State
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formAvailable, setFormAvailable] = useState(true);

  const showToast = (type: "success" | "error", message: string) => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormName("");
    setFormPrice("");
    setFormDesc("");
    setFormAvailable(true);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: MenuItemData) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormPrice(item.price.toString());
    setFormDesc(item.description || "");
    setFormAvailable(item.isAvailable);
    setIsFormOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseInt(formPrice, 10);
    if (!formName.trim() || formName.trim().length < 2) {
      showToast("error", "Nama menu makanan / minuman minimal 2 karakter.");
      return;
    }
    if (isNaN(priceNum) || priceNum < 500) {
      showToast("error", "Harga menu minimal Rp 500.");
      return;
    }

    const formData = new FormData();
    formData.append("name", formName.trim());
    formData.append("price", priceNum.toString());
    formData.append("description", formDesc.trim());
    formData.append("isAvailable", formAvailable ? "true" : "false");

    startTransition(async () => {
      if (editingItem) {
        // Edit existing
        const res = await updateMenuItemAction(merchantId, editingItem.id, formData);
        if (res.ok) {
          setItems((prev) =>
            prev.map((it) =>
              it.id === editingItem.id
                ? {
                    ...it,
                    name: formName.trim(),
                    price: priceNum,
                    description: formDesc.trim(),
                    isAvailable: formAvailable,
                  }
                : it
            )
          );
          setIsFormOpen(false);
          showToast("success", res.message || "Menu berhasil diperbarui!");
        } else {
          showToast("error", res.message || "Gagal memperbarui menu.");
        }
      } else {
        // Create new
        const res = await createMenuItemAction(merchantId, formData);
        if (res.ok) {
          const createdItem = (res.data as MenuItemData) || {
            id: `item-${Date.now()}`,
            merchantId,
            name: formName.trim(),
            price: priceNum,
            description: formDesc.trim(),
            isAvailable: formAvailable,
          };
          setItems((prev) => [...prev, createdItem]);
          setIsFormOpen(false);
          showToast("success", res.message || "Menu baru berhasil ditambahkan!");
        } else {
          showToast("error", res.message || "Gagal menambahkan menu.");
        }
      }
    });
  };

  const handleToggleAvailability = (item: MenuItemData) => {
    const nextState = !item.isAvailable;
    // Optimistic update
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, isAvailable: nextState } : it))
    );

    startTransition(async () => {
      const res = await toggleMenuItemAvailabilityAction(merchantId, item.id, nextState);
      if (res.ok) {
        showToast("success", res.message || "Status menu diperbarui.");
      } else {
        // Revert on error
        setItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, isAvailable: item.isAvailable } : it))
        );
        showToast("error", res.message || "Gagal mengubah status ketersediaan.");
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    const targetId = deleteTarget.id;
    // Optimistic remove
    setItems((prev) => prev.filter((it) => it.id !== targetId));
    setDeleteTarget(null);

    startTransition(async () => {
      const res = await deleteMenuItemAction(merchantId, targetId);
      if (res.ok) {
        showToast("success", "Menu berhasil dihapus.");
      } else {
        showToast("error", res.message || "Gagal menghapus menu.");
      }
    });
  };

  const totalCount = items.length;
  const availableCount = items.filter((it) => it.isAvailable).length;
  const outOfStockCount = totalCount - availableCount;

  return (
    <div className="min-h-screen bg-[#f4f8fb] text-slate-800 flex">
      {/* Merchant Sidebar */}
      <MerchantSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        merchantName={user.merchantName}
        merchantSlug={user.merchantSlug}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                {!isSidebarOpen && (
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(true)}
                    title="Buka Menu Sidebar"
                    className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl shadow-xs border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50 hover:text-[#006194] transition-colors cursor-pointer shrink-0"
                  >
                    <PanelLeft className="h-4 w-4 text-[#006194]" />
                    <span className="hidden sm:inline">Menu Sidebar</span>
                  </button>
                )}

                <Link
                  href="/merchant/dashboard"
                  className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shrink-0"
                  title="Kembali ke Dashboard"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900">
                    Kelola Menu &amp; Produk Lapak
                  </h1>
                  <span className="rounded bg-[#e6f6fc] px-2 py-0.5 text-[10px] font-semibold text-[#0284c7] border border-sky-200">
                    {user.merchantName || "Lapak Saya"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Atur daftar makanan, harga per porsi, dan ketersediaan stok gerobak untuk pembeli di peta.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#006194] hover:bg-[#004d77] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition"
            >
              <Plus className="h-4 w-4" />
              Tambah Menu Baru
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        {/* Metric Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
              <span>Total Menu</span>
              <UtensilsCrossed className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 mt-2">{totalCount}</p>
            <span className="text-[11px] text-slate-500">Varian makanan & minuman</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
              <span>Siap Saji (Tersedia)</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-2xl font-extrabold text-emerald-700 mt-2">{availableCount}</p>
            <span className="text-[11px] text-slate-500">Bisa dipesan pembeli di peta</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
              <span>Habis / Kosong</span>
              <span className="h-2 w-2 rounded-full bg-slate-300"></span>
            </div>
            <p className="text-2xl font-extrabold text-slate-700 mt-2">{outOfStockCount}</p>
            <span className="text-[11px] text-slate-500">Sementara tidak tersedia</span>
          </div>
        </div>

        {/* Menu Items Table / Cards */}
        {items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <UtensilsCrossed className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Belum Ada Menu</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Daftarkan menu makanan atau minuman andalan lapak Anda agar pelanggan dapat melihat rincian harga saat menemukan gerobak di peta.
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition"
            >
              <Plus className="h-4 w-4" />
              Tambah Menu Pertama
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Daftar Menu Gerobak ({items.length})
              </h2>
              <span className="text-[11px] text-slate-500">
                Klik sakelar untuk mengubah stok porsi seketika
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-50/70 ${
                    !item.isAvailable ? "opacity-60 bg-slate-50/40" : ""
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 font-bold text-base shrink-0 border border-slate-200/80">
                      🍲
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900">{item.name}</h3>
                        {item.isAvailable ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Tersedia
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Habis
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                        {item.description || "Tidak ada keterangan tambahan."}
                      </p>
                      <p className="text-xs font-bold text-emerald-800 mt-1 tabular-nums">
                        Rp {item.price.toLocaleString("id-ID")}
                        <span className="text-[10px] font-normal text-slate-500"> / porsi</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* Toggle Availability Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(item)}
                      disabled={isPending}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        item.isAvailable
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                      }`}
                      title={item.isAvailable ? "Tandai Habis" : "Tandai Tersedia"}
                    >
                      {item.isAvailable ? (
                        <>
                          <ToggleRight className="h-4 w-4 text-emerald-600" />
                          <span>Tersedia</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-4 w-4 text-slate-400" />
                          <span>Habis</span>
                        </>
                      )}
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition border border-slate-200"
                      title="Edit Menu"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition border border-rose-200"
                      title="Hapus Menu"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Form Modal (Create / Edit) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? "Edit Menu Lapak" : "Tambah Menu Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Menu Makanan / Minuman *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Cuanki Spesial Komplit"
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Harga per Porsi (Rp) *
                </label>
                <input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="15000"
                  min="500"
                  step="500"
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] focus:outline-none tabular-nums"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Keterangan / Komposisi Porsi (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Contoh: Isi 3 bakso halus, 2 siomay, tahu sutra, dan taburan seledri & bawang goreng"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="menuAvailableCheckbox"
                  checked={formAvailable}
                  onChange={(e) => setFormAvailable(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="menuAvailableCheckbox" className="font-semibold text-slate-700 cursor-pointer">
                  Menu langsung berstatus siap saji (Tersedia)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-[#006194] hover:bg-[#004d77] px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50"
                >
                  {isPending ? "Menyimpan..." : "Simpan Menu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Hapus Menu &quot;{deleteTarget.name}&quot;?
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Menu ini akan dihapus permanen dari daftar lapak Anda dan tidak dapat dilihat lagi oleh pembeli di peta.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isPending}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition disabled:opacity-50"
              >
                {isPending ? "Menghapus..." : "Ya, Hapus Menu"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

