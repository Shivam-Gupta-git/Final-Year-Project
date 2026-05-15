import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaFilter,
  FaList,
  FaMapMarkerAlt,
  FaSearch,
  FaStar,
  FaTimes,
  FaWifi,
  FaCoffee,
  FaParking,
  FaSwimmingPool,
} from "react-icons/fa";
import { MdMap, MdMyLocation } from "react-icons/md";
import { useNavigate } from "react-router-dom";

/* ────────────────────────────────────────────────────────
   Static filter definitions
──────────────────────────────────────────────────────── */
const PRICE_FILTERS = [
  { label: "Under ₹2,500", value: "0-2500", count: 851 },
  { label: "₹2,500 – ₹5,000", value: "2500-5000", count: 1047 },
  { label: "₹5,000 – ₹7,000", value: "5000-7000", count: 305 },
  { label: "₹7,000 – ₹10,000", value: "7000-10000", count: 275 },
  { label: "₹10,000 – ₹13,000", value: "10000-13000", count: 178 },
  { label: "₹15,000 – ₹30,000", value: "15000-30000", count: 320 },
  { label: "₹30,000+", value: "30000+", count: 142 },
];

const SUGGESTED_FILTERS = [
  { label: "Breakfast Included", value: "breakfast", icon: FaCoffee },
  { label: "Free Wi‑Fi", value: "wifi", icon: FaWifi },
  { label: "Free Parking", value: "parking", icon: FaParking },
  { label: "Swimming Pool", value: "pool", icon: FaSwimmingPool },
  { label: "Rush Deal", value: "rush_deal", icon: null },
  { label: "Last Minute", value: "last_minute", icon: null },
];

const STAR_FILTERS = [5, 4, 3, 2];

/* ────────────────────────────────────────────────────────
   Utility: parse price range string → { min, max }
──────────────────────────────────────────────────────── */
const parsePriceRange = (value) => {
  if (value.endsWith("+")) return { min: parseInt(value), max: Infinity };
  const [min, max] = value.split("-").map(Number);
  return { min, max };
};

/* ────────────────────────────────────────────────────────
   Sub-components
──────────────────────────────────────────────────────── */
const Checkbox = ({ label, count, checked, onChange, icon: Icon }) => (
  <label
    className="flex items-center justify-between py-2 cursor-pointer group select-none"
    onClick={onChange}
  >
    <div className="flex items-center gap-3">
      <div
        className={`w-4 h-4 rounded-sm border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-150
          ${
            checked
              ? "bg-[#2563eb] border-[#2563eb] shadow-[0_0_0_3px_rgba(37,99,235,0.15)]"
              : "border-stone-300 bg-white group-hover:border-[#2563eb]/60"
          }`}
      >
        {checked && (
          <svg
            className="w-2.5 h-2.5 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 12 12"
          >
            <path
              d="M2 6l3 3 5-5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      {Icon && (
        <Icon
          className={`text-[11px] transition-colors ${checked ? "text-[#2563eb]" : "text-stone-400"}`}
        />
      )}
      <span
        className={`text-[12px] leading-tight transition-colors ${checked ? "text-stone-800 font-semibold" : "text-stone-500 group-hover:text-stone-700"}`}
      >
        {label}
      </span>
    </div>
    {count !== undefined && (
      <span className="text-[10px] text-stone-400 tabular-nums font-medium">
        {count.toLocaleString()}
      </span>
    )}
  </label>
);

const Section = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-stone-100 py-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between mb-1 focus:outline-none"
      >
        <h3 className="text-[9px] font-black tracking-[0.15em] uppercase text-stone-400">
          {title}
        </h3>
        {open ? (
          <FaChevronUp className="text-stone-300 text-[8px]" />
        ) : (
          <FaChevronDown className="text-stone-300 text-[8px]" />
        )}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
};

const StarRow = ({ value, checked, onChange }) => (
  <label
    className="flex items-center justify-between py-1.5 cursor-pointer group select-none"
    onClick={onChange}
  >
    <div className="flex items-center gap-3">
      <div
        className={`w-4 h-4 rounded-sm border-[1.5px] flex items-center justify-center shrink-0 transition-all duration-150
          ${
            checked
              ? "bg-[#2563eb] border-[#2563eb] shadow-[0_0_0_3px_rgba(37,99,235,0.15)]"
              : "border-stone-300 bg-white group-hover:border-[#2563eb]/60"
          }`}
      >
        {checked && (
          <svg
            className="w-2.5 h-2.5 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 12 12"
          >
            <path
              d="M2 6l3 3 5-5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: value }, (_, i) => (
          <FaStar
            key={i}
            className={`text-[10px] transition-colors ${checked ? "text-amber-400" : "text-stone-300 group-hover:text-amber-300"}`}
          />
        ))}
        {Array.from({ length: 5 - value }, (_, i) => (
          <FaStar key={i} className="text-[10px] text-stone-200" />
        ))}
      </div>
      <span
        className={`text-[12px] transition-colors ${checked ? "text-stone-800 font-semibold" : "text-stone-500"}`}
      >
        {value} Star
      </span>
    </div>
  </label>
);

/* ────────────────────────────────────────────────────────
   HotelListCard — with click → map navigation
──────────────────────────────────────────────────────── */
const HotelListCard = ({ hotel, isSelected, onClick, onNavigate }) => (
  <div
    onClick={onClick}
    className={`flex gap-3 p-3.5 border-b border-stone-100 cursor-pointer transition-all duration-150 group
      ${isSelected ? "bg-blue-50 border-l-[3px] border-l-[#2563eb]" : "hover:bg-stone-50 border-l-[3px] border-l-transparent"}`}
  >
    {hotel.image ? (
      <img
        src={hotel.image}
        alt={hotel.name}
        className="w-17 h-17 rounded-xl object-cover shrink-0"
      />
    ) : (
      <div className="w-17 h-17 rounded-xl bg-stone-100 shrink-0 flex items-center justify-center">
        <FaMapMarkerAlt className="text-stone-300 text-lg" />
      </div>
    )}

    <div className="min-w-0 flex-1">
      <p
        className={`text-[13px] font-bold line-clamp-1 transition-colors leading-tight
        ${isSelected ? "text-[#2563eb]" : "text-stone-800 group-hover:text-[#2563eb]"}`}
      >
        {hotel.name}
      </p>

      {/* Locality */}
      {hotel.locality && (
        <p className="text-[10px] text-stone-400 mt-0.5 flex items-center gap-1">
          <FaMapMarkerAlt className="text-[8px]" />
          {hotel.locality}
        </p>
      )}

      {/* Stars */}
      {(hotel.stars > 0 || hotel.rating > 0) && (
        <div className="flex items-center gap-2 mt-1">
          {hotel.stars > 0 && (
            <div className="flex gap-0.5">
              {Array.from({ length: Math.min(hotel.stars, 5) }, (_, i) => (
                <FaStar key={i} className="text-amber-400 text-[9px]" />
              ))}
            </div>
          )}
          {hotel.rating > 0 && (
            <span className="text-[10px] bg-green-50 text-green-700 font-bold px-1.5 py-0.5 rounded-md border border-green-100">
              ★ {hotel.rating}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-1.5">
        <p className="text-[#2563eb] font-black text-[14px] flex items-baseline gap-1">
          ₹{hotel.price?.toLocaleString() ?? "—"}
          <span className="text-stone-400 font-normal text-[10px]">/night</span>
        </p>
        {isSelected && (
          <span className="text-[9px] bg-[#2563eb] text-white font-bold px-2 py-0.5 rounded-full">
            On map ›
          </span>
        )}
      </div>
    </div>
    <button
      onClick={(e) => {
        e.stopPropagation(); // don't also trigger map pan
        onNavigate(hotel._id);
      }}
      className="text-[9px] bg-[#2563eb] text-white font-bold px-2 py-1 rounded-full mt-1 hover:bg-blue-700 transition-colors"
    >
      View Details →
    </button>
  </div>
);

/* ────────────────────────────────────────────────────────
   Active filter pill
──────────────────────────────────────────────────────── */
const FilterPill = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 bg-[#2563eb]/10 border border-[#2563eb]/20 text-[#2563eb] text-[10px] font-bold px-2.5 py-1 rounded-full">
    {label}
    <button onClick={onRemove} className="hover:text-red-500 transition-colors">
      <FaTimes className="text-[8px]" />
    </button>
  </span>
);

/* ════════════════════════════════════════════════════════
   MapModal — main component
════════════════════════════════════════════════════════ */
const MapModal = ({ isOpen, onClose, city = "India", hotels = [] }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]); // PricePin overlays
  const infoWindowRef = useRef(null);
  const openPinRef = useRef(null); // currently open pin element

  const [mapLoading, setMapLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [view, setView] = useState("map");
  const [locality, setLocality] = useState("");
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    price: [],
    suggested: [],
    stars: [],
  });

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";

  /* ── Dynamic filtering ─────────────────────────────── */
  const filteredHotels = useMemo(() => {
    let result = hotels;

    // Text search
    if (locality.trim()) {
      const q = locality.toLowerCase();
      result = result.filter(
        (h) =>
          h.name?.toLowerCase().includes(q) ||
          h.locality?.toLowerCase().includes(q) ||
          h.address?.toLowerCase().includes(q),
      );
    }

    // Price filter (OR across selected ranges)
    if (activeFilters.price.length > 0) {
      result = result.filter((h) =>
        activeFilters.price.some((p) => {
          const { min, max } = parsePriceRange(p);
          return (h.price ?? 0) >= min && (h.price ?? 0) <= max;
        }),
      );
    }

    // Star filter (OR)
    if (activeFilters.stars.length > 0) {
      result = result.filter((h) =>
        activeFilters.stars.includes(h.stars ?? h.starCategory),
      );
    }

    // Suggested filters
    if (activeFilters.suggested.length > 0) {
      result = result.filter((h) =>
        activeFilters.suggested.every((s) => {
          if (s === "breakfast") return h.breakfastIncluded;
          if (s === "wifi") return h.wifi;
          if (s === "parking") return h.freeParking;
          if (s === "pool") return h.pool;
          if (s === "rush_deal") return h.isRushDeal;
          if (s === "last_minute") return h.isLastMinute;
          return true;
        }),
      );
    }

    return result;
  }, [hotels, locality, activeFilters]);

  /* ── Active filter labels (for pills) ─────────────── */
  const activeFilterLabels = useMemo(() => {
    const labels = [];
    activeFilters.price.forEach((v) => {
      const f = PRICE_FILTERS.find((p) => p.value === v);
      if (f)
        labels.push({
          key: `price-${v}`,
          label: f.label,
          remove: () => toggleFilter("price", v),
        });
    });
    activeFilters.stars.forEach((v) => {
      labels.push({
        key: `star-${v}`,
        label: `${v} Star`,
        remove: () => toggleFilter("stars", v),
      });
    });
    activeFilters.suggested.forEach((v) => {
      const f = SUGGESTED_FILTERS.find((s) => s.value === v);
      if (f)
        labels.push({
          key: `sug-${v}`,
          label: f.label,
          remove: () => toggleFilter("suggested", v),
        });
    });
    return labels;
  }, [activeFilters]);

  const toggleFilter = (type, value) =>
    setActiveFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((v) => v !== value)
        : [...prev[type], value],
    }));

  const clearAllFilters = () =>
    setActiveFilters({ price: [], suggested: [], stars: [] });

  /* ── Map initialisation ────────────────────────────── */
  const getCenter = useCallback(() => {
    const list = filteredHotels.filter((h) => h.lat && h.lng);
    if (list.length > 0) {
      return {
        lat: list.reduce((s, h) => s + h.lat, 0) / list.length,
        lng: list.reduce((s, h) => s + h.lng, 0) / list.length,
      };
    }
    return { lat: 20.5937, lng: 78.9629 };
  }, [filteredHotels]);

  const LIGHT_STYLES = [
    { elementType: "geometry", stylers: [{ color: "#f8f5f0" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#74746e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f8f5f0" }] },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#ede9e3" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#dff0d0" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#ffffff" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#e8e4dc" }],
    },
    {
      featureType: "transit.line",
      elementType: "geometry",
      stylers: [{ color: "#e2ddd7" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#b8d4e8" }],
    },
  ];

  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: getCenter(),
      zoom: filteredHotels.length > 0 ? 12 : 5,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_CENTER,
      },
      styles: LIGHT_STYLES,
    });
    infoWindowRef.current = new window.google.maps.InfoWindow({
      pixelOffset: new window.google.maps.Size(0, -8),
    });
    setMapLoading(false);
    setMapReady(true);
  }, [filteredHotels, getCenter]);

  useEffect(() => {
    if (!isOpen) return;
    if (window.google?.maps) {
      initMap();
      return;
    }
    if (document.getElementById("gmap-script")) {
      const t = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(t);
          initMap();
        }
      }, 100);
      return () => clearInterval(t);
    }
    const s = document.createElement("script");
    s.id = "gmap-script";
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    s.async = true;
    s.onload = initMap;
    s.onerror = () => setMapLoading(false);
    document.head.appendChild(s);
  }, [isOpen]);

  /* ── Markers (re-render when filtered list / selectedId changes) ── */
  const buildInfoContent = (hotel) => `
    <div style="font-family:'DM Sans',sans-serif;padding:4px 2px;min-width:210px;">
      ${hotel.image ? `<img src="${hotel.image}" style="width:100%;height:110px;object-fit:cover;border-radius:10px;margin-bottom:8px;" />` : ""}
      <p style="font-weight:800;font-size:14px;margin:0 0 2px;color:#1c1917;line-height:1.25;">${hotel.name}</p>
      ${hotel.locality ? `<p style="font-size:11px;color:#a8a29e;margin:0 0 6px;display:flex;align-items:center;gap:3px;">📍 ${hotel.locality}</p>` : ""}
      <p style="color:#2563eb;font-weight:900;font-size:18px;margin:0 0 4px">₹${(hotel.price ?? 0).toLocaleString()}<span style="font-weight:400;color:#a8a29e;font-size:11px"> /night</span></p>
      ${hotel.rating > 0 ? `<span style="background:#fef3c7;color:#92400e;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;">★ ${hotel.rating}</span>` : ""}
      ${hotel.stars > 0 ? `<span style="background:#eff6ff;color:#1d4ed8;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;margin-left:4px;">${hotel.stars}★ Hotel</span>` : ""}
    </div>
  `;

  const addMarkers = useCallback(
    (list) => {
      if (!mapInstanceRef.current || !window.google) return;
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      list
        .filter((h) => h.lat && h.lng)
        .forEach((hotel) => {
          class PricePin extends window.google.maps.OverlayView {
            constructor(pos, data) {
              super();
              this.pos = pos;
              this.data = data;
              this.el = null;
            }

            onAdd() {
              this.el = document.createElement("div");
              this.el.style.cssText =
                "position:absolute;cursor:pointer;transform:translate(-50%,-100%);z-index:10;transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1);";

              this._render();
              this.el.onclick = () => this._openInfo();
              this.el.onmouseenter = () => {
                this.el.style.zIndex = 50;
                this.el.style.transform = "translate(-50%,-100%) scale(1.1)";
              };
              this.el.onmouseleave = () => {
                this.el.style.zIndex = 10;
                this.el.style.transform = "translate(-50%,-100%) scale(1)";
              };
              this.getPanes().overlayMouseTarget.appendChild(this.el);
            }

            _render() {
              const sel = this.data.selected;
              const bg = sel
                ? "linear-gradient(135deg,#2563eb,#4f46e5)"
                : "rgba(255,255,255,0.97)";
              const color = sel ? "#fff" : "#1c1917";
              const border = sel
                ? "1.5px solid rgba(255,255,255,0.3)"
                : "1.5px solid rgba(0,0,0,0.09)";
              const shadow = sel
                ? "0 6px 20px rgba(37,99,235,0.45),0 2px 6px rgba(0,0,0,0.15)"
                : "0 4px 14px rgba(0,0,0,0.1),0 1px 3px rgba(0,0,0,0.06)";
              const tipColor = sel ? "#4f46e5" : "rgba(255,255,255,0.97)";

              this.el.innerHTML = `
                <div style="background:${bg};color:${color};border:${border};border-radius:20px;padding:6px 13px;
                  font-size:11px;font-weight:800;white-space:nowrap;box-shadow:${shadow};
                  backdrop-filter:blur(12px);font-family:'DM Sans',system-ui,sans-serif;position:relative;
                  letter-spacing:-0.01em;">
                  ₹${this.data.price?.toLocaleString() ?? "—"}
                  <div style="position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);
                    width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;
                    border-top:5px solid ${tipColor};"></div>
                </div>
              `;
            }

            _openInfo() {
              // close previously open
              if (openPinRef.current && openPinRef.current !== this.el) {
                openPinRef.current.style.zIndex = 10;
              }
              openPinRef.current = this.el;
              this.el.style.zIndex = 100;

              infoWindowRef.current.setContent(buildInfoContent(this.data));
              infoWindowRef.current.setPosition(this.pos);
              infoWindowRef.current.open(mapInstanceRef.current);
            }

            draw() {
              const p = this.getProjection()?.fromLatLngToDivPixel(this.pos);
              if (this.el && p) {
                this.el.style.left = p.x + "px";
                this.el.style.top = p.y + "px";
              }
            }
            onRemove() {
              this.el?.parentNode?.removeChild(this.el);
              this.el = null;
            }
          }

          const pin = new PricePin(
            new window.google.maps.LatLng(hotel.lat, hotel.lng),
            { ...hotel, selected: hotel._id === selectedHotelId },
          );
          pin.setMap(mapInstanceRef.current);
          markersRef.current.push(pin);
        });
    },
    [selectedHotelId],
  );

  // Re-draw markers whenever filtered list or selected hotel changes
  useEffect(() => {
    if (mapReady) addMarkers(filteredHotels);
  }, [filteredHotels, mapReady, addMarkers]);

  /* ── Hotel click → navigate map ────────────────────── */
  const navigate = useNavigate();
  const handleHotelClick = useCallback((hotel) => {
    setSelectedHotelId(hotel._id);
    setView("map");

    if (mapInstanceRef.current && hotel.lat && hotel.lng) {
      const pos = new window.google.maps.LatLng(hotel.lat, hotel.lng);
      mapInstanceRef.current.panTo(pos);
      mapInstanceRef.current.setZoom(15);

      setTimeout(() => {
        infoWindowRef.current?.setContent(buildInfoContent(hotel));
        infoWindowRef.current?.setPosition(pos);
        infoWindowRef.current?.open(mapInstanceRef.current);
      }, 350);
    }
  }, []);

  /* ── Re-centre on filtered set ─────────────────────── */
  const recentre = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.panTo(getCenter());
    mapInstanceRef.current.setZoom(filteredHotels.length > 0 ? 12 : 5);
    infoWindowRef.current?.close();
    setSelectedHotelId(null);
  };

  /* ── scroll lock ───────────────────────────────────── */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    if (!isOpen) {
      mapInstanceRef.current = null;
      setMapReady(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalActiveFilters =
    activeFilters.price.length +
    activeFilters.stars.length +
    activeFilters.suggested.length;

  /* ── Filter panel (shared desktop + mobile) ────────── */
  const FilterPanel = () => (
    <div className="px-4 py-3">
      {/* Result count inside panel */}
      <div className="mb-3 py-2 px-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#2563eb]">
          {filteredHotels.length} hotels found
        </span>
        {totalActiveFilters > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-[10px] text-red-400 font-semibold hover:text-red-600 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <Section title="Price per night">
        {PRICE_FILTERS.map((item) => {
          // compute live count from actual hotels array for this range
          const { min, max } = parsePriceRange(item.value);
          const liveCount = hotels.filter(
            (h) => (h.price ?? 0) >= min && (h.price ?? 0) <= max,
          ).length;
          return (
            <Checkbox
              key={item.value}
              label={item.label}
              count={liveCount}
              checked={activeFilters.price.includes(item.value)}
              onChange={() => toggleFilter("price", item.value)}
            />
          );
        })}
      </Section>

      <Section title="Amenities">
        {SUGGESTED_FILTERS.map((item) => (
          <Checkbox
            key={item.value}
            label={item.label}
            icon={item.icon}
            checked={activeFilters.suggested.includes(item.value)}
            onChange={() => toggleFilter("suggested", item.value)}
          />
        ))}
      </Section>

      <Section title="Star category">
        {STAR_FILTERS.map((v) => (
          <StarRow
            key={v}
            value={v}
            checked={activeFilters.stars.includes(v)}
            onChange={() => toggleFilter("stars", v)}
          />
        ))}
      </Section>
    </div>
  );

  /* ── Render ────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-50 flex bg-stone-900/50 backdrop-blur-sm">
      <div
        className="relative w-full h-full flex flex-col bg-[#f7f5f2]"
        style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      >
        {/* ─── Top bar ───────────────────────────────── */}
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-white border-b border-stone-200 shrink-0 z-20 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
          {/* Search input */}
          <div className="relative flex-1 max-w-md group">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[11px] transition-colors group-focus-within:text-[#2563eb]" />
            <input
              type="text"
              placeholder={`Search in ${city}…`}
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 focus:border-[#2563eb]/60 focus:bg-white rounded-full text-[12px] text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-4 focus:ring-[#2563eb]/8 transition-all"
            />
            {locality && (
              <button
                onClick={() => setLocality("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500 transition-colors"
              >
                <FaTimes className="text-[10px]" />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex border border-stone-200 rounded-lg overflow-hidden text-[11px] font-bold shrink-0 bg-stone-50 p-0.5 gap-0.5">
            {[
              { id: "list", icon: FaList, label: "List" },
              { id: "map", icon: MdMap, label: "Map" },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-all duration-150
                  ${
                    view === id
                      ? "bg-[#2563eb] text-white shadow-sm"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
              >
                <Icon className="text-[11px]" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Re-centre button */}
          <button
            onClick={recentre}
            title="Re-centre map"
            className="hidden sm:flex w-8 h-8 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 hover:text-[#2563eb] hover:border-[#2563eb]/40 transition-all"
          >
            <MdMyLocation className="text-sm" />
          </button>

          {/* Mobile filter btn */}
          <button
            onClick={() => setShowMobileFilter(true)}
            className="sm:hidden flex items-center gap-1.5 border border-stone-200 bg-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-stone-700 hover:bg-stone-50 transition-colors relative"
          >
            <FaFilter className="text-[9px]" />
            Filter
            {totalActiveFilters > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#2563eb] text-white text-[8px] font-black rounded-full flex items-center justify-center">
                {totalActiveFilters}
              </span>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors shrink-0"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* ─── Active filter pills ────────────────────── */}
        {activeFilterLabels.length > 0 && (
          <div className="flex gap-2 px-4 py-2 bg-white border-b border-stone-100 overflow-x-auto scrollbar-hide shrink-0">
            {activeFilterLabels.map((f) => (
              <FilterPill key={f.key} label={f.label} onRemove={f.remove} />
            ))}
          </div>
        )}

        {/* ─── Body ──────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Map */}
          <div className="flex-1 relative bg-stone-100">
            <div ref={mapRef} className="w-full h-full" />

            {/* Hotel count badge */}
            {!mapLoading && GOOGLE_MAPS_API_KEY && view === "map" && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-stone-200 rounded-full px-4 py-2 shadow-lg text-[11px] font-bold text-stone-700 flex items-center gap-2 z-10 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-[#2563eb] shadow-[0_0_6px_rgba(37,99,235,0.7)] animate-pulse" />
                {filteredHotels.length} hotels in {city}
                {totalActiveFilters > 0 && (
                  <span className="text-[#2563eb]">
                    · {totalActiveFilters} filter
                    {totalActiveFilters > 1 ? "s" : ""} active
                  </span>
                )}
              </div>
            )}

            {/* List overlay */}
            {view === "list" && (
              <div className="absolute inset-0 bg-[#f7f5f2] overflow-y-auto z-10">
                <div className="sticky top-0 z-10 px-4 py-2.5 bg-white border-b border-stone-100 flex items-center justify-between shadow-sm">
                  <p className="text-[11px] font-bold text-stone-500">
                    {filteredHotels.length} hotel
                    {filteredHotels.length !== 1 ? "s" : ""}
                    {locality ? ` matching "${locality}"` : ` in ${city}`}
                  </p>
                  {selectedHotelId && (
                    <button
                      onClick={() => setSelectedHotelId(null)}
                      className="text-[10px] text-[#2563eb] font-bold hover:underline"
                    >
                      Clear selection
                    </button>
                  )}
                </div>

                {filteredHotels.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                    <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                      <FaMapMarkerAlt className="text-stone-300 text-xl" />
                    </div>
                    <p className="text-stone-700 font-bold text-base mb-1">
                      No hotels match
                    </p>
                    <p className="text-stone-400 text-sm mb-4">
                      Try adjusting your search or removing filters.
                    </p>
                    {totalActiveFilters > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="text-[12px] bg-[#2563eb] text-white font-bold px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                ) : (
                  filteredHotels.map((h) => (
                    <HotelListCard
                      key={h._id}
                      hotel={h}
                      isSelected={h._id === selectedHotelId}
                      onClick={() => handleHotelClick(h)}
                      onNavigate={(id) => {
                        onClose(); // close the modal first
                        navigate(`/hotels/${id}`);
                      }}
                    />
                  ))
                )}
              </div>
            )}

            {/* Loading overlay */}
            {mapLoading && (
              <div className="absolute inset-0 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20">
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center">
                  <FaMapMarkerAlt className="text-[#2563eb] text-xl animate-bounce" />
                </div>
                <p className="text-stone-500 text-sm font-semibold">
                  Loading map…
                </p>
              </div>
            )}

            {/* No API key */}
            {!GOOGLE_MAPS_API_KEY && !mapLoading && (
              <div className="absolute inset-0 bg-stone-50 flex flex-col items-center justify-center gap-4 p-8 z-20">
                <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center text-red-300">
                  <MdMap className="text-3xl" />
                </div>
                <div className="text-center max-w-xs">
                  <h3 className="text-base font-bold text-stone-700 mb-1">
                    API key required
                  </h3>
                  <p className="text-[12px] text-stone-400 leading-relaxed">
                    Add{" "}
                    <code className="bg-stone-200 px-1.5 py-0.5 rounded text-stone-600 font-mono text-[11px]">
                      VITE_GOOGLE_MAPS_API_KEY
                    </code>{" "}
                    to your <code className="font-mono">.env</code> file.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ─── Desktop sidebar ──────────────────────── */}
          <div className="hidden sm:flex flex-col w-64 bg-white border-l border-stone-100 shrink-0 z-20">
            <div className="overflow-y-auto flex-1 [scrollbar-width:thin] [scrollbar-color:#e7e5e4_transparent]">
              <FilterPanel />
            </div>
          </div>
        </div>

        {/* ─── Mobile filter sheet ──────────────────────── */}
        {showMobileFilter && (
          <div className="fixed inset-0 z-50 sm:hidden flex flex-col justify-end">
            <div
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
              onClick={() => setShowMobileFilter(false)}
            />
            <div className="relative bg-white rounded-t-2xl max-h-[88vh] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 shrink-0">
                <div>
                  <h3 className="font-black text-stone-800 text-sm">Filters</h3>
                  {totalActiveFilters > 0 && (
                    <p className="text-[10px] text-[#2563eb] font-semibold mt-0.5">
                      {totalActiveFilters} active
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {totalActiveFilters > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-[11px] text-red-400 font-bold hover:text-red-600"
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={() => setShowMobileFilter(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-stone-100 text-stone-400"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto flex-1">
                <FilterPanel />
              </div>
              <div className="px-5 py-4 border-t border-stone-100 bg-white">
                <button
                  onClick={() => setShowMobileFilter(false)}
                  className="w-full py-3 bg-[#2563eb] hover:bg-blue-700 text-white font-black rounded-xl text-[13px] shadow-md transition-all active:scale-[0.98]"
                >
                  View {filteredHotels.length} Hotel
                  {filteredHotels.length !== 1 ? "s" : ""}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapModal;
