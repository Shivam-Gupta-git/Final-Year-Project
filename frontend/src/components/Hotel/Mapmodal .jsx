import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FaTimes,
  FaSearch,
  FaList,
  FaMapMarkerAlt,
  FaChevronDown,
  FaChevronUp,
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
        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all cursor-pointer
        ${checked ? "bg-[#3d6ef5] border-[#3d6ef5] shadow-[0_0_8px_rgba(61,110,245,0.4)]" : "border-white/20 bg-white/5 group-hover:border-[#3d6ef5]/50"}`}
      >
        {checked && (
          <svg
            className="w-2.5 h-2.5 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 12 12"
          >
            <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span
        className={`text-xs transition-colors ${checked ? "text-white font-semibold" : "text-white/60 group-hover:text-white"}`}
      >
        {label}
      </span>
    </div>
    {count !== undefined && (
      <span className="text-[10px] text-white/30 tabular-nums">({count})</span>
    )}
  </label>
);

const Section = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/10 py-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between mb-1.5 focus:outline-none"
      >
        <h3 className="text-[10px] font-bold tracking-widest uppercase text-white/50">
          {title}
        </h3>
        {open ? (
          <FaChevronUp className="text-white/40 text-[9px]" />
        ) : (
          <FaChevronDown className="text-white/40 text-[9px]" />
        )}
      </button>
      {open && <div className="mt-2 space-y-1">{children}</div>}
    </div>
  );
};

// Hotel list card for list view
const HotelListCard = ({ hotel }) => (
  <div className="flex gap-3 p-3 border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer group">
    {hotel.image ? (
      <img
        src={hotel.image}
        alt={hotel.name}
        className="w-16 h-16 rounded-lg object-cover shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
      />
    ) : (
      <div className="w-16 h-16 rounded-lg bg-white/10 shrink-0 flex items-center justify-center">
        <FaMapMarkerAlt className="text-white/20" />
      </div>
    )}
    <div className="min-w-0 flex-1">
      <p className="text-sm font-bold text-white line-clamp-1 group-hover:text-[#3d6ef5] transition-colors">
        {hotel.name}
      </p>
      {hotel.rating > 0 && (
        <div className="flex items-center gap-1 mt-0.5">
          <FaStar className="text-amber-400 text-[10px]" />
          <span className="text-[11px] font-semibold text-white/70">
            {hotel.rating}
          </span>
        </div>
      )}
      <p className="text-[#3d6ef5] font-bold text-sm mt-1 flex items-baseline gap-1">
        ₹{hotel.price.toLocaleString()}
        <span className="text-white/40 font-normal text-[10px]">/night</span>
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
    (h) => !locality.trim() || h.name?.toLowerCase().includes(locality.toLowerCase()),
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
      const avgLat = filteredHotels.reduce((s, h) => s + h.lat, 0) / filteredHotels.length;
      const avgLng = filteredHotels.reduce((s, h) => s + h.lng, 0) / filteredHotels.length;
      return { lat: avgLat, lng: avgLng };
    }
    return { lat: 20.5937, lng: 78.9629 }; // India center fallback
  }, [filteredHotels]);

  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    
    // Dark mode map styling
    const darkMapStyles = [
      { elementType: "geometry", stylers: [{ color: "#111222" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#111222" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
      { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
      { featureType: "poi", stylers: [{ visibility: "off" }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: "#1d2331" }] },
      { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
      { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
      { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2c3e50" }] },
      { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
      { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
      { featureType: "transit", stylers: [{ visibility: "off" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a0b12" }] },
      { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
      { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
    ];

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: getCenter(),
      zoom: filteredHotels.length > 0 ? 12 : 5,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      styles: darkMapStyles,
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
          this.el.style.cssText = "position:absolute;cursor:pointer;transform:translate(-50%,-100%);z-index:10;";
          const sel = this.hotel.selected;
          
          // Dark mode glassmorphic pin
          const bg = sel ? "#3d6ef5" : "rgba(18,20,29,0.95)";
          const border = sel ? "border-color:#3d6ef5;" : "border-color:rgba(255,255,255,0.15);";
          const shadow = sel ? "box-shadow: 0 0 15px rgba(61,110,245,0.6);" : "box-shadow: 0 4px 15px rgba(0,0,0,0.5);";
          
          this.el.innerHTML = `
            <div style="background:${bg};color:#fff;border:1px solid transparent;${border}border-radius:16px;padding:4px 10px;font-size:11px;font-weight:700;white-space:nowrap;${shadow}backdrop-filter:blur(4px);font-family:sans-serif;position:relative;transition:all 0.2s ease;">
              ₹ ${this.hotel.price.toLocaleString()}
              <div style="position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:5px solid ${sel ? "#3d6ef5" : "rgba(18,20,29,0.95)"};"></div>
            </div>
          `;
          
          this.el.onclick = () => {
             // Dark mode info window content
            infoWindowRef.current.setContent(`
              <div style="font-family:sans-serif;padding:6px;min-width:180px;background:#12141d;color:#fff;">
                <p style="font-weight:700;font-size:14px;margin:0 0 4px;color:#fff">${this.hotel.name}</p>
                <p style="color:#3d6ef5;font-weight:700;font-size:16px;margin:0 0 4px">₹ ${this.hotel.price.toLocaleString()}<span style="font-weight:400;color:rgba(255,255,255,0.5);font-size:11px">/night</span></p>
                ${this.hotel.rating > 0 ? `<p style="color:#f59e0b;font-size:12px;margin:0;display:flex;align-items:center;">★ ${this.hotel.rating}</p>` : ""}
              </div>
            `);
            infoWindowRef.current.setPosition(this.pos);
            infoWindowRef.current.open(mapInstanceRef.current);
          };
          
          this.el.onmouseenter = () => {
             this.el.style.zIndex = 50;
             this.el.style.transform = "translate(-50%, -100%) scale(1.05)";
          };
          this.el.onmouseleave = () => {
             this.el.style.zIndex = 10;
             this.el.style.transform = "translate(-50%, -100%) scale(1)";
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
      const o = new PricePin(new window.google.maps.LatLng(hotel.lat, hotel.lng), hotel);
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
    <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-md">
      <div className="relative w-full h-full flex flex-col bg-[#0a0a10]">
        {/* Top bar */}
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 bg-[#0a0a10] border-b border-white/10 shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.5)] z-20">
          <div className="relative flex-1 max-w-lg group">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xs transition-colors group-focus-within:text-[#3d6ef5]" />
            <input
              type="text"
              placeholder={`Search in ${city} — area or property`}
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full pl-8 pr-4 py-2 bg-white/5 border border-white/10 focus:border-[#3d6ef5]/50 focus:bg-white/10 rounded-full text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#3d6ef5]/20 transition-all font-sans"
            />
          </div>

          {/* View toggle */}
          <div className="flex border border-white/10 rounded-lg overflow-hidden text-xs font-semibold shrink-0 bg-white/5 p-0.5">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                view === "list" ? "bg-[#3d6ef5] text-white shadow" : "text-white/50 hover:text-white"
              }`}
            >
              <FaList className="text-[10px]" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setView("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                view === "map" ? "bg-[#3d6ef5] text-white shadow" : "text-white/50 hover:text-white"
              }`}
            >
              <MdMap className="text-xs" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>

          {/* Mobile filter button */}
          <button
            onClick={() => setShowMobileFilter(true)}
            className="sm:hidden flex items-center gap-1 border border-white/10 bg-white/5 px-3 py-2 rounded-lg text-xs font-semibold text-white/80 hover:bg-white/10"
          >
            Filter
          </button>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors shrink-0 ml-1 border border-white/5"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Map area */}
          <div className="flex-1 relative bg-[#111222]">
            <div ref={mapRef} className="w-full h-full" />

            {/* Hotel list overlay when view=list */}
            {view === "list" && (
              <div className="absolute inset-0 bg-[#0a0a10] overflow-y-auto z-10 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]">
                <div className="p-3 border-b border-white/5 bg-white/[0.02]">
                  <p className="text-xs font-semibold text-white/70">
                    {filteredHotels.length} hotels {locality ? `matching "${locality}"` : `in ${city}`}
                  </p>
                </div>
                {filteredHotels.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4">
                       <FaMapMarkerAlt className="text-white/20 text-2xl" />
                    </div>
                    <p className="text-white font-bold text-lg mb-1">No hotels found</p>
                    <p className="text-white/40 text-sm">Try adjusting your search or filters.</p>
                  </div>
                ) : (
                  filteredHotels.map((h) => <HotelListCard key={h._id} hotel={h} />)
                )}
              </div>
            )}

            {mapLoading && (
              <div className="absolute inset-0 bg-[#0a0a10] flex flex-col items-center justify-center gap-4 z-20">
                <div className="w-16 h-16 bg-[#3d6ef5]/10 border border-[#3d6ef5]/20 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(61,110,245,0.2)]">
                  <FaMapMarkerAlt className="text-[#3d6ef5] text-2xl animate-bounce drop-shadow-[0_0_8px_rgba(61,110,245,0.6)]" />
                </div>
                <p className="text-white/70 text-sm font-medium tracking-wide">Initializing Map…</p>
              </div>
            )}

            {!GOOGLE_MAPS_API_KEY && !mapLoading && (
              <div className="absolute inset-0 bg-[#0a0a10] flex flex-col items-center justify-center gap-5 p-8 z-20">
                <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.15)]">
                  <MdMap className="text-rose-400 text-4xl" />
                </div>
                <div className="text-center max-w-sm">
                  <h3 className="text-lg font-bold text-white mb-2">API key required</h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Add <code className="bg-white/10 border border-white/20 px-1.5 py-0.5 rounded text-white font-mono text-xs mx-1">VITE_GOOGLE_MAPS_API_KEY</code> to your `.env` file to render the map.
                  </p>
                </div>
              </div>
            )}

            {/* Hotel count badge on map */}
            {!mapLoading && GOOGLE_MAPS_API_KEY && filteredHotels.length > 0 && view === "map" && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#0a0a10]/80 backdrop-blur-md border border-white/10 rounded-full px-5 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.6)] text-xs font-bold text-white flex items-center gap-2 z-10">
                 <span className="w-2 h-2 rounded-full bg-[#3d6ef5] shadow-[0_0_6px_rgba(61,110,245,0.8)] animate-pulse"></span>
                {filteredHotels.length} hotels in {city}
              </div>
            )}
          </div>

          {/* Desktop sidebar */}
          <div className="hidden sm:block w-64 bg-[#0a0a10] border-l border-white/10 overflow-y-auto shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-20 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]">
            <FilterPanel />
          </div>
        </div>

        {/* Mobile filter bottom sheet */}
        {showMobileFilter && (
          <div className="fixed inset-0 z-50 sm:hidden flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowMobileFilter(false)} />
            <div className="relative bg-[#0a0a10] rounded-t-2xl max-h-[85vh] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.8)] border-t border-white/10">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
                <h3 className="font-bold text-white">Filters</h3>
                <button
                  onClick={() => setShowMobileFilter(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1">
                <FilterPanel />
              </div>
              <div className="px-5 py-4 border-t border-white/10 bg-[#0a0a10]">
                <button
                  onClick={() => setShowMobileFilter(false)}
                  className="w-full py-3 bg-[#3d6ef5] hover:bg-[#2b59da] text-white font-bold rounded-xl text-sm shadow-[0_4px_15px_rgba(61,110,245,0.4)] hover:shadow-[0_6px_20px_rgba(61,110,245,0.6)] transition-all"
                >
                  View {filteredHotels.length} Hotels
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
