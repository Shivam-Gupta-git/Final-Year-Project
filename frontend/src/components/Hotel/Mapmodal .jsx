import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  FaTimes,
  FaSearch,
  FaList,
  FaMapMarkerAlt,
  FaChevronDown,
  FaChevronUp,
  FaRupeeSign,
  FaSpinner,
} from "react-icons/fa";
import { MdMap } from "react-icons/md";

const PRICE_FILTERS = [
  { label: "₹ 0 – ₹ 2,500", value: "0-2500", count: 851 },
  { label: "₹ 2,500 – ₹ 5,000", value: "2500-5000", count: 1047 },
  { label: "₹ 5,000 – ₹ 7,000", value: "5000-7000", count: 305 },
  { label: "₹ 7,000 – ₹ 10,000", value: "7000-10000", count: 275 },
  { label: "₹ 10,000 – ₹ 13,000", value: "10000-13000", count: 178 },
  { label: "₹ 13,000 – ₹ 15,000", value: "13000-15000", count: 112 },
  { label: "₹ 15,000 – ₹ 30,000", value: "15000-30000", count: 320 },
  { label: "₹ 30,000+", value: "30000+", count: 142 },
];
const SUGGESTED_FILTERS = [
  { label: "Rush Deal", value: "rush_deal" },
  { label: "Last Minute Deals", value: "last_minute" },
  { label: "5 Star", value: "5_star" },
  { label: "4 Star", value: "4_star" },
  { label: "Breakfast Included", value: "breakfast" },
  { label: "3 Star", value: "3_star" },
];
const STAR_FILTERS = [
  { label: "5 Star", value: 5 },
  { label: "4 Star", value: 4 },
  { label: "3 Star", value: 3 },
  { label: "2 Star", value: 2 },
];
const MOCK_PINS = [
  {
    _id: "1",
    name: "The Grand Oberoi",
    price: 4991,
    lat: 15.4989,
    lng: 73.8278,
    rating: 4.5,
    selected: false,
  },
  {
    _id: "2",
    name: "Taj Holiday Village",
    price: 3327,
    lat: 15.5546,
    lng: 73.7631,
    rating: 4.8,
    selected: true,
  },
  {
    _id: "3",
    name: "Leela Goa Resort",
    price: 12287,
    lat: 15.0057,
    lng: 74.0125,
    rating: 4.7,
    selected: false,
  },
  {
    _id: "4",
    name: "Novotel Goa",
    price: 2400,
    lat: 15.6068,
    lng: 73.7542,
    rating: 4.2,
    selected: false,
  },
  {
    _id: "5",
    name: "ITC Grand Goa",
    price: 17519,
    lat: 15.1734,
    lng: 73.9557,
    rating: 4.9,
    selected: false,
  },
  {
    _id: "6",
    name: "Alila Diwa Goa",
    price: 3900,
    lat: 15.3261,
    lng: 73.9189,
    rating: 4.6,
    selected: false,
  },
  {
    _id: "7",
    name: "W Goa",
    price: 23152,
    lat: 15.5985,
    lng: 73.7083,
    rating: 4.8,
    selected: false,
  },
  {
    _id: "8",
    name: "Caravela Beach Resort",
    price: 3103,
    lat: 15.2788,
    lng: 73.9443,
    rating: 4.1,
    selected: false,
  },
  {
    _id: "9",
    name: "Radisson Blu Goa",
    price: 4622,
    lat: 15.2993,
    lng: 73.9195,
    rating: 4.3,
    selected: false,
  },
  {
    _id: "10",
    name: "Park Hyatt Goa",
    price: 9999,
    lat: 15.154,
    lng: 73.9616,
    rating: 4.7,
    selected: false,
  },
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

const MapModal = ({ isOpen, onClose, city = "Goa", hotels = MOCK_PINS }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [view, setView] = useState("map");
  const [locality, setLocality] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    price: [],
    suggested: [],
    stars: [],
  });

  // const GOOGLE_MAPS_API_KEY = useSelector(state => state.config.googleMapsApiKey);
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

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

  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 15.3, lng: 74.0 },
      zoom: 11,
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
    addMarkers(hotels);
  }, [hotels]);

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
              `<div style="font-family:sans-serif;padding:4px 6px;min-width:160px"><p style="font-weight:700;font-size:13px;margin:0 0 3px;color:#0f1f3d">${this.hotel.name}</p><p style="color:#1a3a6b;font-weight:700;font-size:14px;margin:0 0 2px">₹ ${this.hotel.price.toLocaleString()}<span style="font-weight:400;color:#94a3b8;font-size:11px">/night</span></p><p style="color:#f59e0b;font-size:12px;margin:0">★ ${this.hotel.rating}</p></div>`,
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
    setActiveFilters((p) => {
      const arr = p[type];
      return {
        ...p,
        [type]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });

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

  return (
    <div className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-sm">
      <div className="relative w-full h-full flex flex-col bg-white">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-slate-200 shrink-0 shadow-sm z-10">
          <div className="relative flex-1 max-w-lg">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder={`Search in ${city} — area, property or locality`}
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full pl-8 pr-4 py-2 border border-slate-200 bg-slate-50 focus:bg-white rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]/40 transition-all"
            />
          </div>

          {/* View toggle */}
          <div className="flex border border-slate-200 rounded-lg overflow-hidden text-xs font-semibold shrink-0">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-3 py-2 transition-colors ${view === "list" ? "bg-[#1a3a6b] text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <FaList className="text-[10px]" /> View List
            </button>
            <button
              onClick={() => setView("map")}
              className={`flex items-center gap-1.5 px-3 py-2 transition-colors ${view === "map" ? "bg-[#1a3a6b] text-white" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <MdMap className="text-xs" /> Main Areas
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors shrink-0"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Map */}
          <div className="flex-1 relative">
            <div ref={mapRef} className="w-full h-full" />

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
                <div className="w-full max-w-md h-40 rounded-xl overflow-hidden border border-slate-200 relative shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80"
                    alt="Map"
                    className="w-full h-full object-cover opacity-40"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 shadow text-xs font-semibold text-slate-700">
                      <FaSpinner className="animate-spin text-[#1a3a6b]" />{" "}
                      Waiting for API key…
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!mapLoading && GOOGLE_MAPS_API_KEY && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-full px-4 py-2 flex items-center gap-2 shadow-md text-xs font-semibold text-slate-700">
                <FaSpinner className="animate-spin text-[#1a3a6b] text-xs" />
                Loading properties…
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-56 bg-white border-l border-slate-100 overflow-y-auto shrink-0">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
