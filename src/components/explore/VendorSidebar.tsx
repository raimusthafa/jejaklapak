"use client";

import { useState } from "react";
import { Merchant } from "@/types/merchant";
import { VendorCard } from "./VendorCard";
import { CATEGORIES, BANDUNG_DISTRICTS } from "@/config/constants";
import { Search, SlidersHorizontal, RefreshCw, X, Radio, ChevronDown, PanelLeftClose } from "lucide-react";

interface VendorSidebarProps {
  merchants: Merchant[];
  allCount: number;
  selectedMerchantId: string | null;
  onSelectMerchant: (id: string) => void;
  onOpenDetails: (merchant: Merchant) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedDistrict: string;
  onDistrictChange: (dist: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onlyActive: boolean;
  onToggleOnlyActive: () => void;
  onResetFilters: () => void;
  onRefreshMap?: () => void;
  onClose?: () => void;
}

export function VendorSidebar({
  merchants,
  allCount,
  selectedMerchantId,
  onSelectMerchant,
  onOpenDetails,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedDistrict,
  onDistrictChange,
  selectedStatus,
  onStatusChange,
  onlyActive,
  onToggleOnlyActive,
  onResetFilters,
  onRefreshMap,
  onClose,
}: VendorSidebarProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Active merchants count
  const activeCount = merchants.filter((m) => m.sellingStatus === "ACTIVE").length;

  // Active Area Title
  const activeAreaTitle =
    selectedDistrict !== "Semua Wilayah" ? selectedDistrict : "Dipati Ukur & Dago";
  const activeAreaSubtitle =
    selectedDistrict !== "Semua Wilayah" ? "Kota Bandung" : "Bandung Wetan";

  const isFiltered =
    searchQuery !== "" ||
    selectedCategory !== "Semua Kategori" ||
    selectedDistrict !== "Semua Wilayah" ||
    selectedStatus !== "SEMUA" ||
    onlyActive;

  return (
    <aside className="w-full h-full flex flex-col bg-white border-r border-slate-200/80 shadow-sm z-20 shrink-0 select-none">
      {/* ── Top Header & Geo Corridor Telemetry ── */}
      <div className="p-3.5 sm:p-4 bg-white border-b border-slate-100 flex flex-col gap-1.5 shrink-0">
        {/* Telemetry corridor & live count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006781] animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#006781]">
              Koridor Pantau GPS
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#baeaff] text-[#001f29] font-bold">
              {activeCount} Lapak Aktif
            </span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="hidden md:flex w-6 h-6 items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Tutup Panel Samping"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Area Headline */}
        <div className="flex items-baseline justify-between mt-0.5">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate max-w-[210px]">
            {activeAreaTitle}
          </h1>
          <span className="text-xs text-slate-400 font-medium shrink-0">
            {activeAreaSubtitle}
          </span>
        </div>

        {/* Search Bar Input */}
        <div className="relative mt-1.5">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari cuanki, cilok, jus, kopi..."
            className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#eff4ff] text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#006194] transition-all border border-transparent focus:border-[#006194]"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`absolute right-2.5 top-2.5 transition-colors ${
                showAdvancedFilters || isFiltered
                  ? "text-[#006194]"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Filter Tambahan"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Expandable Advanced Filters */}
        {showAdvancedFilters && (
          <div className="pt-2 pb-1 space-y-2 border-t border-slate-100 mt-1 animate-in fade-in duration-200">
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                  Wilayah
                </label>
                <div className="relative">
                  <select
                    value={selectedDistrict}
                    onChange={(e) => onDistrictChange(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-[#eff4ff]/60 px-2 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none pr-6"
                  >
                    {BANDUNG_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                  Status Sesi
                </label>
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-[#eff4ff]/60 px-2 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none pr-6"
                  >
                    <option value="SEMUA">Semua Status</option>
                    <option value="ACTIVE">Sedang Berjualan</option>
                    <option value="PAUSED">Sedang Istirahat</option>
                    <option value="ENDED">Sesi Berakhir</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label
                htmlFor="sidebarActiveToggle"
                className="text-xs font-medium text-slate-600 cursor-pointer flex items-center gap-1.5"
              >
                <span className="h-2 w-2 rounded-full bg-[#006781]" />
                Hanya yang sedang buka
              </label>
              <input
                id="sidebarActiveToggle"
                type="checkbox"
                checked={onlyActive}
                onChange={onToggleOnlyActive}
                className="h-4 w-4 rounded border-slate-300 text-[#006194] focus:ring-[#006194] cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Category Horizontal Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 no-scrollbar">
          <button
            type="button"
            onClick={() => onCategoryChange("Semua Kategori")}
            className={`px-3 py-1 rounded-full text-[11px] whitespace-nowrap transition-colors ${
              selectedCategory === "Semua Kategori"
                ? "bg-[#006194] text-white font-semibold shadow-xs"
                : "bg-[#eff4ff] text-[#3f4850] hover:bg-[#dce9ff]"
            }`}
          >
            Semua ({allCount})
          </button>
          {CATEGORIES.filter((c) => c !== "Semua Kategori").map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1 rounded-full text-[11px] whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-[#006194] text-white font-semibold shadow-xs"
                  : "bg-[#eff4ff] text-[#3f4850] hover:bg-[#dce9ff]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Scrollable Vendor Feed Cards ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#eff4ff]/30">
        {merchants.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-dashed border-slate-200 mt-2">
            <SlidersHorizontal className="h-8 w-8 text-slate-300 mb-2" />
            <h4 className="font-semibold text-xs sm:text-sm text-slate-800">
              Tidak ada pedagang ditemukan
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
              Coba sesuaikan kata kunci atau ubah filter kategori dan wilayah.
            </p>
            <button
              type="button"
              onClick={onResetFilters}
              className="mt-3 text-xs font-semibold text-[#006194] hover:underline"
            >
              Reset semua filter
            </button>
          </div>
        ) : (
          merchants.map((merchant, idx) => (
            <VendorCard
              key={merchant.id}
              merchant={merchant}
              isSelected={merchant.id === selectedMerchantId}
              onSelect={() => onSelectMerchant(merchant.id)}
              onOpenDetails={() => onOpenDetails(merchant)}
              distanceMeters={120 + idx * 80}
            />
          ))
        )}
      </div>

      {/* ── Telemetry Bottom Bar in Sidebar ── */}
      <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-slate-600 shrink-0">
        <div className="flex items-center gap-1.5">
          <Radio className="h-3.5 w-3.5 text-[#006781] animate-pulse" />
          <span className="text-[11px] font-medium text-slate-600">
            GPS Receiver Online • 4G LTE
          </span>
        </div>
        <button
          type="button"
          onClick={onRefreshMap || onResetFilters}
          className="text-[11px] font-semibold text-[#006194] hover:underline flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          Segarkan Peta
        </button>
      </div>
    </aside>
  );
}
