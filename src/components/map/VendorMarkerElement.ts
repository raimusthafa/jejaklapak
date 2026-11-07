import { Merchant } from "@/types/merchant";

export function createVendorMarkerElement(
  merchant: Merchant,
  isSelected: boolean,
  onClick: () => void,
  onOpenDetails?: () => void,
  onDeselect?: () => void
): HTMLElement {
  const el = document.createElement("div");
  el.className = "cursor-pointer group select-none relative";
  el.style.transform = "translate(-50%, -50%)";

  const isLive = merchant.sellingStatus === "ACTIVE";
  const isPaused = merchant.sellingStatus === "PAUSED";
  const isMoving = (merchant.location.speedKmh ?? 0) > 1;

  // Container wrapper
  const container = document.createElement("div");
  container.className = `relative flex items-center justify-center transition-transform duration-200 ${
    isSelected ? "scale-110 z-30" : "hover:scale-105 z-20"
  }`;

  // 1. Animated Radar Waves Halo for LIVE active vendors
  if (isLive) {
    const radarPing = document.createElement("span");
    radarPing.className =
      "absolute w-14 h-14 rounded-full bg-[#79d8fd]/40 animate-ping pointer-events-none";
    container.appendChild(radarPing);

    if (isSelected) {
      const radarHalo = document.createElement("span");
      radarHalo.className =
        "absolute w-20 h-20 rounded-full bg-[#79d8fd]/20 pointer-events-none";
      container.appendChild(radarHalo);
    }
  }

  // 2. Heading Pointer if moving
  if (merchant.location.heading !== undefined && isLive && isMoving) {
    const pointer = document.createElement("div");
    pointer.className =
      "absolute -top-2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-[#006194] transition-transform duration-300 pointer-events-none";
    pointer.style.transform = `rotate(${merchant.location.heading}deg) translateY(-14px)`;
    container.appendChild(pointer);
  }

  // 3. Pin Glyph Circle
  const pin = document.createElement("div");
  const borderColor = isLive
    ? isSelected
      ? "border-[#006194] ring-4 ring-[#79d8fd]/60 bg-white"
      : "border-[#006194] bg-white shadow-md"
    : isPaused
    ? isSelected
      ? "border-[#994100] ring-4 ring-[#ffdbca] bg-white"
      : "border-[#994100] bg-white"
    : "border-slate-400 bg-white opacity-80";

  pin.className = `relative flex h-10 w-10 items-center justify-center rounded-full border-2 text-base transition-all shadow-md ${borderColor}`;
  pin.innerHTML = `<span>${merchant.iconEmoji || "🍲"}</span>`;

  // 4. Live Pulse Dot Badge
  const dot = document.createElement("span");
  dot.className = `absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
    isLive ? "bg-[#006781]" : isPaused ? "bg-[#994100]" : "bg-slate-400"
  }`;
  pin.appendChild(dot);

  container.appendChild(pin);

  // 5. Floating Attached Quick Card Callout when SELECTED (with X close button)
  if (isSelected) {
    const callout = document.createElement("div");
    callout.className =
      "absolute -top-28 left-1/2 -translate-x-1/2 w-64 bg-white rounded-xl p-2.5 shadow-xl ring-1 ring-slate-200/80 pointer-events-auto z-40 transition-all animate-in fade-in zoom-in-95 duration-200";

    const headerRow = document.createElement("div");
    headerRow.className = "flex items-center justify-between";

    const statusBadge = document.createElement("span");
    statusBadge.className = "text-[10px] text-[#006781] font-bold flex items-center gap-1";
    statusBadge.innerHTML = `
      <span class="w-1.5 h-1.5 rounded-full ${isLive ? "bg-[#006781] animate-pulse" : "bg-slate-400"}"></span> ${isLive ? "GEROBAK AKTIF" : merchant.sellingStatus === "PAUSED" ? "ISTIRAHAT" : "TUTUP"}
    `;

    const rightGroup = document.createElement("div");
    rightGroup.className = "flex items-center gap-1.5";

    const categoryBadge = document.createElement("span");
    categoryBadge.className = "text-[10px] font-semibold bg-[#eff4ff] text-[#006194] px-1.5 py-0.5 rounded truncate max-w-[90px]";
    categoryBadge.innerText = merchant.category;

    // Tombol X untuk membatalkan pilihan / tutup tooltip
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className =
      "w-4 h-4 flex items-center justify-center rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors text-xs font-bold leading-none";
    closeBtn.title = "Batal Pilih / Lepas Fokus";
    closeBtn.innerText = "✕";
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (onDeselect) {
        onDeselect();
      }
    });

    rightGroup.appendChild(categoryBadge);
    rightGroup.appendChild(closeBtn);

    headerRow.appendChild(statusBadge);
    headerRow.appendChild(rightGroup);

    const titleEl = document.createElement("div");
    titleEl.className = "text-xs font-bold text-slate-900 truncate mt-1";
    titleEl.innerText = merchant.name;

    const footerRow = document.createElement("div");
    footerRow.className =
      "flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[11px]";

    const addressSpan = document.createElement("span");
    addressSpan.className = "text-slate-500 truncate max-w-[140px]";
    addressSpan.innerText = merchant.location.addressHint;

    const detailBtn = document.createElement("button");
    detailBtn.type = "button";
    detailBtn.className =
      "px-2.5 py-0.5 rounded bg-[#006194] text-white font-semibold hover:bg-[#007bb9] transition-colors";
    detailBtn.innerText = "Detail";
    detailBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (onOpenDetails) onOpenDetails();
      else onClick();
    });

    footerRow.appendChild(addressSpan);
    footerRow.appendChild(detailBtn);

    // Tip arrow
    const tip = document.createElement("div");
    tip.className =
      "absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-slate-200";

    callout.appendChild(headerRow);
    callout.appendChild(titleEl);
    callout.appendChild(footerRow);
    callout.appendChild(tip);

    container.appendChild(callout);
  } else {
    // Subtle Label Pill on Non-Selected (visible on hover)
    const label = document.createElement("div");
    label.className =
      "absolute top-11 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/95 backdrop-blur px-2 py-0.5 rounded-md shadow-xs border border-slate-200/80 text-[10px] font-semibold text-slate-800 opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none";
    label.innerText = merchant.name;
    container.appendChild(label);
  }

  el.appendChild(container);

  el.addEventListener("click", (e) => {
    e.stopPropagation();
    onClick();
  });

  return el;
}
