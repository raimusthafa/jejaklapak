"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Merchant } from "@/types/merchant";
import { LngLat } from "@/types/location";
import { merchantService } from "@/services/mock/merchantService";
import { telemetrySimulator } from "@/services/mock/telemetrySimulator";
import { MOCK_CULINARY_ZONES } from "@/data/mock/culinaryZones";
import { DEFAULT_BASEMAP } from "@/config/basemaps";
import { MaplibreContainer } from "@/components/map/MaplibreContainer";
import { MapControls } from "@/components/map/MapControls";
import { VendorSidebar } from "@/components/explore/VendorSidebar";
import { VendorDetailContent } from "@/components/explore/VendorDetailContent";
import { VendorDetailDrawer } from "@/components/explore/VendorDetailDrawer";
import { CallVendorModal } from "@/components/explore/CallVendorModal";
import { Map as MapIcon, ListFilter, AlertCircle, PanelLeft } from "lucide-react";

function ExploreContent() {
  const searchParams = useSearchParams();
  const queryMerchantSlug = searchParams.get("merchant") || searchParams.get("slug");
  const queryMerchantId = searchParams.get("id");

  const [allMerchants, setAllMerchants] = useState<Merchant[]>(() =>
    merchantService.getAll()
  );

  // Jangan auto-select merchant saat pertama buka peta kecuali ada query parameter spesifik di URL
  const [selectedMerchantId, setSelectedMerchantId] = useState<string | null>(() => {
    if (queryMerchantId) return queryMerchantId;
    if (queryMerchantSlug) {
      const match = merchantService.getAll().find((m) => m.slug === queryMerchantSlug);
      return match ? match.id : null;
    }
    return null;
  });
  
  // Sidebars toggle state:
  // Sidebar kiri (daftar) terbuka default di desktop
  // Sidebar kanan (detail lapak) tertutup default, HANYA terbuka jika ada lapak yang diklik/dipilih
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(
    Boolean(queryMerchantId || queryMerchantSlug)
  );

  // Mobile drawer state
  const [drawerMerchant, setDrawerMerchant] = useState<Merchant | null>(null);
  const [callModalMerchant, setCallModalMerchant] = useState<Merchant | null>(null);
  const [calledRoute, setCalledRoute] = useState<LngLat[] | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori");
  const [selectedDistrict, setSelectedDistrict] = useState("Semua Wilayah");
  const [selectedStatus, setSelectedStatus] = useState("SEMUA");
  const [onlyActive, setOnlyActive] = useState(false);

  // Map state
  const [activeBasemap, setActiveBasemap] = useState(DEFAULT_BASEMAP);
  const [is3D, setIs3D] = useState(false);
  const [followCamera, setFollowCamera] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [userLocation, setUserLocation] = useState<LngLat | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [zoomAction, setZoomAction] = useState<{ type: "in" | "out"; id: number } | null>(null);

  // Mobile tab state: "map" or "list"
  const [mobileTab, setMobileTab] = useState<"map" | "list">("map");

  // Fetch & poll live merchants from backend API
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    async function loadLiveMerchants() {
      if (isSimulating) return;

      try {
        const res = await fetch("/api/merchants");
        if (res.ok) {
          const json = await res.json();
          if (json.ok && Array.isArray(json.data) && json.data.length > 0) {
            setAllMerchants(json.data);
            setSelectedMerchantId((prev) => {
              // Jika ada query param dari URL, utamakan
              if (queryMerchantSlug) {
                const matchSlug = json.data.find((m: Merchant) => m.slug === queryMerchantSlug);
                if (matchSlug) return matchSlug.id;
              }
              if (queryMerchantId) {
                const matchId = json.data.find((m: Merchant) => m.id === queryMerchantId);
                if (matchId) return matchId.id;
              }
              if (!prev) return null;
              // Jika sebelumnya user sudah memilih pedagang, sinkronkan id (jaga-jaga mock vs db id)
              const prevInCurrent = allMerchants.find((m) => m.id === prev);
              const match = json.data.find(
                (m: Merchant) => m.id === prev || (prevInCurrent && m.slug === prevInCurrent.slug)
              );
              return match ? match.id : null;
            });
          }
        }
      } catch (err) {
        console.warn("Using local fallback merchants:", err);
      }
    }

    void loadLiveMerchants();

    if (!isSimulating) {
      timer = setInterval(loadLiveMerchants, 8000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSimulating, queryMerchantSlug, queryMerchantId, allMerchants]);

  const handleRefreshMap = useCallback(async () => {
    try {
      const res = await fetch("/api/merchants");
      if (res.ok) {
        const json = await res.json();
        if (json.ok && Array.isArray(json.data) && json.data.length > 0) {
          setAllMerchants(json.data);
          setSelectedMerchantId((prev) => {
            if (!prev) return null;
            const prevInCurrent = allMerchants.find((m) => m.id === prev);
            const match = json.data.find(
              (m: Merchant) => m.id === prev || (prevInCurrent && m.slug === prevInCurrent.slug)
            );
            return match ? match.id : null;
          });
        }
      }
    } catch (err) {
      console.warn("Refresh failed:", err);
    }
  }, [allMerchants]);

  // Subscribe to Telemetry Simulator stream
  useEffect(() => {
    const unsubscribe = telemetrySimulator.subscribe((updates) => {
      setAllMerchants((prevList) => {
        const next = [...prevList];
        updates.forEach((u) => {
          const idx = next.findIndex((m) => m.id === u.id);
          if (idx !== -1) {
            next[idx] = {
              ...next[idx],
              location: u.location,
              breadcrumbs: [
                ...(next[idx].breadcrumbs || []),
                [u.location.longitude, u.location.latitude],
              ],
            };
          }
        });
        return next;
      });
    });

    return () => {
      unsubscribe();
      telemetrySimulator.stop();
    };
  }, []);

  // Filtered merchants computation
  const filteredMerchants = useMemo(() => {
    return allMerchants.filter((m) => {
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchName = m.name.toLowerCase().includes(q);
        const matchOwner = m.ownerName.toLowerCase().includes(q);
        const matchCategory = m.category.toLowerCase().includes(q);
        const matchTagline = m.tagline.toLowerCase().includes(q);
        const matchMenu = m.menu.some((item) => item.name.toLowerCase().includes(q));
        if (!matchName && !matchOwner && !matchCategory && !matchTagline && !matchMenu) {
          return false;
        }
      }

      if (selectedCategory !== "Semua Kategori" && m.category !== selectedCategory) {
        return false;
      }

      if (selectedStatus !== "SEMUA" && m.sellingStatus !== selectedStatus) {
        return false;
      }

      if (onlyActive && m.sellingStatus !== "ACTIVE") {
        return false;
      }

      if (selectedDistrict !== "Semua Wilayah") {
        if (!m.district.includes(selectedDistrict) && !selectedDistrict.includes(m.district)) {
          return false;
        }
      }

      return true;
    });
  }, [allMerchants, searchQuery, selectedCategory, selectedStatus, onlyActive, selectedDistrict]);

  const selectedMerchant = useMemo(() => {
    return allMerchants.find((m) => m.id === selectedMerchantId) || null;
  }, [allMerchants, selectedMerchantId]);

  // Request browser GPS location
  const handleRequestUserLocation = () => {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError("Browser Anda tidak mendukung layanan Geolocation.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setUserLocation([pos.coords.longitude, pos.coords.latitude]);
      },
      () => {
        setIsLocating(false);
        setGpsError("Izin akses lokasi belum diizinkan atau tidak dapat diakses.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleToggleSimulation = () => {
    const running = telemetrySimulator.toggle();
    setIsSimulating(running);
  };

  const handleChangeSimulationSpeed = (speed: number) => {
    telemetrySimulator.setSpeed(speed);
    setSimulationSpeed(speed);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Semua Kategori");
    setSelectedDistrict("Semua Wilayah");
    setSelectedStatus("SEMUA");
    setOnlyActive(false);
  };

  const handleSelectMerchant = (id: string) => {
    setSelectedMerchantId(id);
    const m = allMerchants.find((item) => item.id === id);
    if (window.innerWidth < 768) {
      if (m) setDrawerMerchant(m);
      setMobileTab("map");
    } else {
      setIsRightSidebarOpen(true);
    }
  };

  const handleOpenDetails = (m: Merchant) => {
    setSelectedMerchantId(m.id);
    if (window.innerWidth < 768) {
      setDrawerMerchant(m);
    } else {
      setIsRightSidebarOpen(true);
    }
  };

  const handleDeselectMerchant = () => {
    setSelectedMerchantId(null);
    setIsRightSidebarOpen(false);
    setFollowCamera(false);
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] overflow-hidden flex flex-col bg-[#f8f9ff]">
      {/* GPS Error banner if any */}
      {gpsError && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>{gpsError} Anda dapat tetap menggunakan peta dan memilih titik manual.</span>
          </div>
          <button
            type="button"
            onClick={() => setGpsError(null)}
            className="font-bold hover:underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* ── Desktop Exploration Viewport Container (In-flow Sidebars, Map never scrolls) ── */}
      <div className="relative flex-1 w-full h-full flex flex-col md:flex-row overflow-hidden">
        {/* ==========================================
            COLUMN 1: LEFT SIDEBAR (Collapsible, In-Flow)
            ========================================== */}
        {isLeftSidebarOpen && (
          <div
            className={`h-full overflow-hidden shrink-0 transition-all duration-300 ${
              mobileTab === "list" ? "block w-full" : "hidden md:block w-[340px] xl:w-[360px]"
            }`}
          >
            <VendorSidebar
              merchants={filteredMerchants}
              allCount={allMerchants.length}
              selectedMerchantId={selectedMerchantId}
              onSelectMerchant={handleSelectMerchant}
              onOpenDetails={handleOpenDetails}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedDistrict={selectedDistrict}
              onDistrictChange={setSelectedDistrict}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              onlyActive={onlyActive}
              onToggleOnlyActive={() => setOnlyActive(!onlyActive)}
              onResetFilters={handleResetFilters}
              onRefreshMap={handleRefreshMap}
              onClose={() => setIsLeftSidebarOpen(false)}
            />
          </div>
        )}

        {/* ==========================================
            COLUMN 2: CENTER MAP VIEW CANVAS (Fixed height, dynamic flex-1)
            ========================================== */}
        <main
          className={`relative flex-1 h-full overflow-hidden bg-[#e5ece9] min-w-0 transition-all duration-300 ${
            mobileTab === "map" ? "block" : "hidden md:block"
          }`}
        >
          {/* Button to reopen Left Sidebar when closed */}
          {!isLeftSidebarOpen && (
            <button
              type="button"
              onClick={() => setIsLeftSidebarOpen(true)}
              className="hidden md:flex absolute top-3.5 left-3.5 z-20 items-center gap-1.5 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg shadow-md border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition"
              title="Buka Daftar Lapak"
            >
              <PanelLeft className="h-4 w-4 text-[#006194]" />
              <span>Daftar Lapak ({filteredMerchants.length})</span>
            </button>
          )}

          <MaplibreContainer
            merchants={filteredMerchants}
            selectedMerchantId={selectedMerchantId}
            onSelectMerchant={handleSelectMerchant}
            onOpenDetails={handleOpenDetails}
            onDeselect={handleDeselectMerchant}
            culinaryZones={MOCK_CULINARY_ZONES}
            activeBasemapId={activeBasemap}
            is3D={is3D}
            followCamera={followCamera}
            userLocation={userLocation}
            calledVendorRoute={calledRoute}
            zoomAction={zoomAction}
          />

          {/* Floating Controls HUD */}
          <MapControls
            activeBasemap={activeBasemap}
            onSelectBasemap={setActiveBasemap}
            is3D={is3D}
            onToggle3D={() => setIs3D(!is3D)}
            followCamera={followCamera}
            onToggleFollowCamera={() => setFollowCamera(!followCamera)}
            isSimulating={isSimulating}
            onToggleSimulation={handleToggleSimulation}
            simulationSpeed={simulationSpeed}
            onChangeSpeed={handleChangeSimulationSpeed}
            onRequestUserLocation={handleRequestUserLocation}
            isLocating={isLocating}
            onZoomIn={() => setZoomAction({ type: "in", id: Date.now() })}
            onZoomOut={() => setZoomAction({ type: "out", id: Date.now() })}
          />
        </main>

        {/* ==========================================
            COLUMN 3: RIGHT SIDEBAR (In-flow side panel, NO BACKDROP/BLUR!)
            ========================================== */}
        {isRightSidebarOpen && selectedMerchant && (
          <aside className="hidden md:flex h-full w-[340px] xl:w-[370px] shrink-0 overflow-hidden flex-col bg-white border-l border-slate-200/80 shadow-sm z-20 transition-all duration-300 animate-in slide-in-from-right-4">
            <VendorDetailContent
              merchant={selectedMerchant}
              onClose={() => {
                setIsRightSidebarOpen(false);
                setSelectedMerchantId(null);
              }}
              onCallVendor={(m) => setCallModalMerchant(m)}
              followCamera={followCamera}
              onToggleFollowCamera={() => setFollowCamera(!followCamera)}
            />
          </aside>
        )}
      </div>

      {/* Mobile Floating View Switcher (Peta vs Daftar) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center rounded-full bg-slate-900/90 text-white p-1 shadow-2xl backdrop-blur-md border border-slate-700">
          <button
            type="button"
            onClick={() => setMobileTab("map")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${
              mobileTab === "map"
                ? "bg-[#006194] text-white shadow-xs"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <MapIcon className="h-3.5 w-3.5" />
            Peta WebGL
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("list")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${
              mobileTab === "list"
                ? "bg-[#006194] text-white shadow-xs"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <ListFilter className="h-3.5 w-3.5" />
            Daftar ({filteredMerchants.length})
          </button>
        </div>
      </div>

      {/* Mobile Bottom Drawer (< 768px, shadcn Drawer) */}
      <VendorDetailDrawer
        merchant={drawerMerchant}
        isOpen={Boolean(drawerMerchant)}
        onClose={() => setDrawerMerchant(null)}
        onCallVendor={(m) => setCallModalMerchant(m)}
        followCamera={followCamera}
        onToggleFollowCamera={() => setFollowCamera(!followCamera)}
      />

      {/* Call Vendor Modal */}
      <CallVendorModal
        merchant={callModalMerchant}
        userLocation={userLocation}
        onClose={() => setCallModalMerchant(null)}
        onConfirmCall={(route) => {
          setCalledRoute(route);
        }}
      />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-[calc(100vh-64px)] bg-[#f8f9ff] flex items-center justify-center text-xs text-slate-500">
          Memuat peta eksplorasi Bandung...
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
