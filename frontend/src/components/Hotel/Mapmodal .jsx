import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaTimes,
  FaSearch,
  FaList,
  FaMapMarkerAlt,
  FaChevronDown,
  FaChevronUp,
  FaSpinner,
  FaStar,
} from "react-icons/fa";
import { MdMap } from "react-icons/md";

const PRICE_FILTERS = [
  { label: "₹ 0 – ₹ 2,500", value: "0-2500", count: 851 },
  { label: "₹ 2,500 – ₹ 5,000", value: "2500-5000", count: 1047 },
  { label: "₹ 5,000 – ₹ 7,000", value: "5000-7000", count: 305 },
  { label: "₹ 7,000 – ₹ 10,000", value: "7000-10000", count: 275 },
  { label: "₹ 10,000 – ₹ 13,000", value: "10000-13000", count: 178 },
  { label: "₹ 15,000 – ₹ 30,000", value: "15000-30000", count: 320 },
  { label: "₹ 30,000+", value: "30000+", count: 142 },
];
const SUGGESTED_FILTERS = [
  { label: "Rush Deal", value: "rush_deal" },
  { label: "Last Minute", value: "last_minute" },
  { label: "5 Star", value: "5_star" },
  { label: "4 Star", value: "4_star" },
  { label: "Breakfast Incl", value: "breakfast" },
  { label: "3 Star", value: "3_star" },
];
const STAR_FILTERS = [
  { label: "5 Star", value: 5 },
  { label: "4 Star", value: 4 },
  { label: "3 Star", value: 3 },
  { label: "2 Star", value: 2 },
];

const Checkbox = ({ label, count, checked, onChange }) => (
  <label className="flex items-center justify-between py-1.5 cursor-pointer group">
    <div className="flex items-center gap-2.5" onClick={onChange}>
      <div
        className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer
        ${checked ? "bg-[#1a3a6b] border-[#1a3a6b]" : "border-slate-300 group-hover:border-[#1a3a6b]/50"}`}
      >
        {checked && (
          <svg
            className="w-2 h-2 text-white"
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
      <span
        className={`text-xs transition-colors ${checked ? "text-[#1a3a6b] font-semibold" : "text-slate-600 group-hover:text-slate-800"}`}
      >
        {label}
      </span>
    </div>
    {count !== undefined && (
      <span className="text-[10px] text-slate-400 tabular-nums">({count})</span>
    )}
  </label>
);

const Section = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 py-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between mb-1.5"
      >
        <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
          {title}
        </h3>
        {open ? (
          <FaChevronUp className="text-slate-400 text-[9px]" />
        ) : (
          <FaChevronDown className="text-slate-400 text-[9px]" />
        )}
      </button>
      {open && children}
    </div>
  );
};

// Hotel list card for list view
const HotelListCard = ({ hotel }) => (
  <div className="flex gap-3 p-3 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
    {hotel.image && (
      <img
        src={hotel.image}
        alt={hotel.name}
        className="w-16 h-16 rounded-lg object-cover shrink-0"
      />
    )}
    <div className="min-w-0 flex-1">
      <p className="text-sm font-bold text-slate-800 line-clamp-1">
        {hotel.name}
      </p>
      {hotel.rating > 0 && (
        <div className="flex items-center gap-1 mt-0.5">
          <FaStar className="text-amber-400 text-[10px]" />
          <span className="text-xs font-semibold text-slate-600">
            {hotel.rating}
          </span>
        </div>
      )}
      <p className="text-[#1a3a6b] font-bold text-sm mt-1">
        ₹{hotel.price.toLocaleString()}
        <span className="text-slate-400 font-normal text-[10px]">/night</span>
      </p>
    </div>
  </div>
);

const MapModal = ({ isOpen, onClose, city = "India", hotels = [] }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  const [mapLoading, setMapLoading] = useState(true);
  const [view, setView] = useState("map");
  const [locality, setLocality] = useState("");
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    price: [],
    suggested: [],
    stars: [],
  });

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  // Filter hotels by locality search
  const filteredHotels = hotels.filter(
    (h) =>
      !locality.trim() ||
      h.name?.toLowerCase().includes(locality.toLowerCase()),
  );

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
    s.onload = () => initMap();
    s.onerror = () => setMapLoading(false);
    document.head.appendChild(s);
  }, [isOpen]);

  // Auto-center map on city hotels
  const getCenter = useCallback(() => {
    if (filteredHotels.length > 0) {
      const avgLat =
        filteredHotels.reduce((s, h) => s + h.lat, 0) / filteredHotels.length;
      const avgLng =
        filteredHotels.reduce((s, h) => s + h.lng, 0) / filteredHotels.length;
      return { lat: avgLat, lng: avgLng };
    }
    return { lat: 20.5937, lng: 78.9629 }; // India center fallback
  }, [filteredHotels]);

  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: getCenter(),
      zoom: filteredHotels.length > 0 ? 12 : 5,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "transit",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });
    infoWindowRef.current = new window.google.maps.InfoWindow();
    setMapLoading(false);
    addMarkers(filteredHotels);
  }, [filteredHotels, getCenter]);

  const addMarkers = useCallback((list) => {
    if (!mapInstanceRef.current || !window.google) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    list.forEach((hotel) => {
      class PricePin extends window.google.maps.OverlayView {
        constructor(pos, hotel) {
          super();
          this.pos = pos;
          this.hotel = hotel;
          this.el = null;
        }
        onAdd() {
          this.el = document.createElement("div");
          this.el.style.cssText =
            "position:absolute;cursor:pointer;transform:translate(-50%,-100%);z-index:10;";
          const sel = this.hotel.selected;
          this.el.innerHTML = `<div style="background:${sel ? "#1a3a6b" : "#fff"};color:${sel ? "#fff" : "#1a3a6b"};border:1.5px solid ${sel ? "#1a3a6b" : "#cbd5e1"};border-radius:16px;padding:3px 9px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-family:sans-serif;position:relative;">₹ ${this.hotel.price.toLocaleString()}<div style="position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:5px solid ${sel ? "#1a3a6b" : "#cbd5e1"};"></div></div>`;
          this.el.onclick = () => {
            infoWindowRef.current.setContent(
              `<div style="font-family:sans-serif;padding:4px 6px;min-width:160px"><p style="font-weight:700;font-size:13px;margin:0 0 3px;color:#0f1f3d">${this.hotel.name}</p><p style="color:#1a3a6b;font-weight:700;font-size:14px;margin:0 0 2px">₹ ${this.hotel.price.toLocaleString()}<span style="font-weight:400;color:#94a3b8;font-size:11px">/night</span></p>${this.hotel.rating > 0 ? `<p style="color:#f59e0b;font-size:12px;margin:0">★ ${this.hotel.rating}</p>` : ""}</div>`,
            );
            infoWindowRef.current.setPosition(this.pos);
            infoWindowRef.current.open(mapInstanceRef.current);
          };
          this.getPanes().overlayMouseTarget.appendChild(this.el);
        }
        draw() {
          const p = this.getProjection().fromLatLngToDivPixel(this.pos);
          if (this.el && p) {
            this.el.style.left = p.x + "px";
            this.el.style.top = p.y + "px";
          }
        }
        onRemove() {
          if (this.el) {
            this.el.parentNode.removeChild(this.el);
            this.el = null;
          }
        }
      }
      const o = new PricePin(
        new window.google.maps.LatLng(hotel.lat, hotel.lng),
        hotel,
      );
      o.setMap(mapInstanceRef.current);
      markersRef.current.push(o);
    });
  }, []);

  const toggleFilter = (type, value) =>
    setActiveFilters((p) => ({
      ...p,
      [type]: p[type].includes(value)
        ? p[type].filter((v) => v !== value)
        : [...p[type], value],
    }));

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else {
      document.body.style.overflow = "";
      mapInstanceRef.current = null;
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const FilterPanel = () => (
    <div className="px-4 py-3">
      <Section title="Price per night">
        {PRICE_FILTERS.map((item) => (
          <Checkbox
            key={item.value}
            label={item.label}
            count={item.count}
            checked={activeFilters.price.includes(item.value)}
            onChange={() => toggleFilter("price", item.value)}
          />
        ))}
      </Section>
      <Section title="Suggested for you">
        {SUGGESTED_FILTERS.map((item) => (
          <Checkbox
            key={item.value}
            label={item.label}
            checked={activeFilters.suggested.includes(item.value)}
            onChange={() => toggleFilter("suggested", item.value)}
          />
        ))}
      </Section>
      <Section title="Star category">
        {STAR_FILTERS.map((item) => (
          <Checkbox
            key={item.value}
            label={item.label}
            checked={activeFilters.stars.includes(item.value)}
            onChange={() => toggleFilter("stars", item.value)}
          />
        ))}
      </Section>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-sm">
      <div className="relative w-full h-full flex flex-col bg-white">
        {/* Top bar */}
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 bg-white border-b border-slate-200 shrink-0 shadow-sm z-10">
          <div className="relative flex-1 max-w-lg">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder={`Search in ${city} — area or property`}
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full pl-8 pr-4 py-2 border border-slate-200 bg-slate-50 focus:bg-white rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]/40 transition-all"
            />
          </div>

          {/* View toggle */}
          <div className="flex border border-slate-200 rounded-lg overflow-hidden text-xs font-semibold shrink-0">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-2 transition-colors ${view === "list" ? "bg-[#1a3a6b] text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <FaList className="text-[10px]" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setView("map")}
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-2 transition-colors ${view === "map" ? "bg-[#1a3a6b] text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <MdMap className="text-xs" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>

          {/* Mobile filter button */}
          <button
            onClick={() => setShowMobileFilter(true)}
            className="sm:hidden flex items-center gap-1 border border-slate-200 px-2 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Filter
          </button>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors shrink-0"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Map area */}
          <div className="flex-1 relative">
            <div ref={mapRef} className="w-full h-full" />

            {/* Hotel list overlay when view=list */}
            {view === "list" && (
              <div className="absolute inset-0 bg-white overflow-y-auto">
                <div className="p-3 border-b border-slate-100 bg-slate-50">
                  <p className="text-xs font-semibold text-slate-600">
                    {filteredHotels.length} hotels{" "}
                    {locality ? `matching "${locality}"` : `in ${city}`}
                  </p>
                </div>
                {filteredHotels.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                    <FaMapMarkerAlt className="text-slate-300 text-3xl mb-3" />
                    <p className="text-slate-500 font-semibold">
                      No hotels found
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      Try a different search
                    </p>
                  </div>
                ) : (
                  filteredHotels.map((h) => (
                    <HotelListCard key={h._id} hotel={h} />
                  ))
                )}
              </div>
            )}

            {mapLoading && (
              <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 bg-[#1a3a6b]/10 rounded-full flex items-center justify-center">
                  <FaMapMarkerAlt className="text-[#1a3a6b] text-xl animate-bounce" />
                </div>
                <p className="text-slate-500 text-sm font-medium">
                  Loading map…
                </p>
              </div>
            )}

            {!GOOGLE_MAPS_API_KEY && !mapLoading && (
              <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center gap-5 p-8">
                <div className="w-16 h-16 bg-[#1a3a6b]/10 rounded-full flex items-center justify-center">
                  <MdMap className="text-[#1a3a6b] text-3xl" />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-bold text-slate-800 mb-1.5">
                    API key required
                  </h3>
                  <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                    Add{" "}
                    <code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[#1a3a6b] font-mono text-xs">
                      VITE_GOOGLE_MAPS_API_KEY
                    </code>{" "}
                    to your{" "}
                    <code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[#1a3a6b] font-mono text-xs">
                      .env
                    </code>{" "}
                    file.
                  </p>
                </div>
              </div>
            )}

            {/* Hotel count badge on map */}
            {!mapLoading &&
              GOOGLE_MAPS_API_KEY &&
              filteredHotels.length > 0 &&
              view === "map" && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-full px-4 py-2 shadow-md text-xs font-semibold text-slate-700">
                  {filteredHotels.length} hotels in {city}
                </div>
              )}
          </div>

          {/* Desktop sidebar */}
          <div className="hidden sm:block w-56 bg-white border-l border-slate-100 overflow-y-auto shrink-0">
            <FilterPanel />
          </div>
        </div>

        {/* Mobile filter bottom sheet */}
        {showMobileFilter && (
          <div className="fixed inset-0 z-60 sm:hidden flex flex-col justify-end">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowMobileFilter(false)}
            />
            <div className="relative bg-white rounded-t-2xl max-h-[75vh] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">Filters</h3>
                <button
                  onClick={() => setShowMobileFilter(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 text-slate-600"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1">
                <FilterPanel />
              </div>
              <div className="px-4 py-3 border-t border-slate-100">
                <button
                  onClick={() => setShowMobileFilter(false)}
                  className="w-full py-2.5 bg-[#1a3a6b] text-white font-bold rounded-xl text-sm"
                >
                  Apply Filters
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
