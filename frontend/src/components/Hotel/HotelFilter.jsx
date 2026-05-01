import React, { useState, useEffect } from "react";
import { FaSearch, FaMapMarkerAlt, FaTimes, FaStar } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

const SUGGESTED_FILTERS = [
  { label: "Rush Deal", icon: "🔥" },
  { label: "Last Minute Deals", icon: "⏰" },
  { label: "5 Star", icon: "⭐⭐⭐⭐⭐" },
  { label: "4 Star", icon: "⭐⭐⭐⭐" },
  { label: "Breakfast Included", icon: "🍳" },
  { label: "3 Star", icon: "⭐⭐⭐" },
  { label: "Free Cancellation", icon: "🛡️" },
  { label: "Couple Friendly", icon: "💑" },
];

const AMENITY_FILTERS = [
  { label: "Pool", value: "pool", icon: "🏊" },
  { label: "WiFi", value: "wifi", icon: "📶" },
  { label: "Parking", value: "parking", icon: "🚗" },
  { label: "Restaurant", value: "restaurant", icon: "🍽️" },
  { label: "Spa", value: "spa", icon: "💆" },
  { label: "Gym", value: "gym", icon: "🏋️" },
];

const SectionLabel = ({ dot, children }) => (
  <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2.5 flex items-center gap-2">
    <span className={`w-1 h-3 rounded-full ${dot}`} />
    {children}
  </h3>
);

// Dual-thumb slider logic 
const MAX_PRICE = 20000;

const HotelFilter = ({ onFilterChange, onMapOpen }) => {
  const [searchParams] = useSearchParams();
  const cityParam = searchParams.get("city") || "";

  // Pull hotels to compute dynamic counts
  const { hotels = [] } = useSelector((s) => s.hotel);

  const [filters, setFilters] = useState({
    locality: "",
    suggested: [],
    price: [0, MAX_PRICE],
    amenities: [],
    stars: [],
  });

  const toggle = (type, value) => {
    const updated = filters[type].includes(value)
      ? filters[type].filter((v) => v !== value)
      : [...filters[type], value];
    const n = { ...filters, [type]: updated };
    setFilters(n);
    onFilterChange?.(n);
  };

  const handleLocality = (e) => {
    const n = { ...filters, locality: e.target.value };
    setFilters(n);
    onFilterChange?.(n);
  };

  const handlePriceChange = (e, isMin) => {
    const val = Number(e.target.value);
    let newPrice = [...filters.price];
    if (isMin) {
      newPrice[0] = Math.min(val, newPrice[1] - 500);
    } else {
      newPrice[1] = Math.max(val, newPrice[0] + 500);
    }
    const n = { ...filters, price: newPrice };
    setFilters(n);
    onFilterChange?.(n);
  };

  const clearAll = () => {
    const fresh = {
      locality: "",
      suggested: [],
      price: [0, MAX_PRICE],
      amenities: [],
      stars: [],
    };
    setFilters(fresh);
    onFilterChange?.(fresh);
  };

  const isActive = (type, value) => filters[type].includes(value);
  const activeCount =
    filters.suggested.length +
    (filters.price[0] > 0 || filters.price[1] < MAX_PRICE ? 1 : 0) +
    filters.amenities.length +
    filters.stars.length +
    (filters.locality ? 1 : 0);

  const getDynamicCount = (type, value) => {
    return hotels.filter((h) => {
      switch (type) {
        case "suggested":
          switch (value) {
            case "Rush Deal":
            case "Last Minute Deals":
              return h.originalPrice && h.pricePerNight < h.originalPrice;
            case "5 Star":
              return h.starCategory === 5;
            case "4 Star":
              return h.starCategory === 4;
            case "3 Star":
              return h.starCategory === 3;
            case "Breakfast Included":
              return h.facilities?.some((f) => f.toLowerCase().includes("breakfast"));
            case "Free Cancellation":
              return h.freeCancellation === true;
            case "Couple Friendly":
              return h.tags?.some((t) => t.toLowerCase().includes("couple"));
            default:
              return false;
          }
        case "stars":
          return h.starCategory === value;
        case "amenities":
          return h.facilities?.some((f) => f.toLowerCase().includes(value));
        default:
          return false;
      }
    }).length;
  };

  return (
    <div className="w-full lg:w-67 lg:sticky lg:top-4 lg:max-h-[calc(100vh-90px)] flex flex-col font-sans bg-transparent">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white/10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">Filters</span>
          {activeCount > 0 && (
            <span className="bg-linear-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none shadow-sm">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-600 font-semibold transition-colors"
          >
            <FaTimes className="text-[9px]" /> Clear all
          </button>
        )}
      </div>

      {/* Scrollable body */}
      <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5
                overscroll-contain
                scroll-smooth
                touch-pan-y">
        {/* Map */}
        <div
          onClick={onMapOpen}
          className="relative h-24 rounded-xl overflow-hidden cursor-pointer group shadow-sm border border-slate-200"
        >
          <img
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=80"
            alt="Map"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-2.5 flex justify-center">
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md transition-transform group-hover:scale-105 border border-slate-200">
              <FaMapMarkerAlt className="text-blue-500 text-[9px]" /> Explore on Map
            </div>
          </div>
        </div>

        {/* Locality search */}
        <div className="relative">
          <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]" />
          <input
            type="text"
            placeholder="Search locality or hotel…"
            value={filters.locality}
            onChange={handleLocality}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-xs pl-7 pr-7 text-slate-700 focus:outline-none focus:border-blue-300 transition-colors"
          />
          {filters.locality && (
            <button
              onClick={() => handleLocality({ target: { value: "" } })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <FaTimes className="text-[9px]" />
            </button>
          )}
        </div>

        {/* Suggested */}
        <div>
          <SectionLabel dot="bg-[#3d6ef5]">Suggested for you</SectionLabel>
          <div className="space-y-0.5">
            {SUGGESTED_FILTERS.map((item) => {
              const active = isActive("suggested", item.label);
              return (
                <button
                  key={item.label}
                  onClick={() => toggle("suggested", item.label)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg border text-left transition-all duration-150
                    ${active ? "border-blue-200 bg-blue-50/50" : "border-transparent hover:bg-slate-50"}`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0 transition-all border
                      ${active ? "bg-blue-500 border-blue-500 text-white shadow-sm" : "bg-slate-50 border-slate-200 text-slate-400"}`}
                    >
                      {active ? "✓" : item.icon.slice(0, 2)}
                    </div>
                    <span
                      className={`text-xs font-medium ${active ? "text-blue-600" : "text-slate-600"}`}
                    >
                      {item.label}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold tabular-nums ${active ? "text-blue-600" : "text-slate-400"}`}
                  >
                    ({getDynamicCount("suggested", item.label)})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        {/* Star Rating */}
        <div>
          <SectionLabel dot="bg-amber-400">Star Rating</SectionLabel>
          <div className="space-y-0.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const active = filters.stars.includes(star);
              return (
                <button
                  key={star}
                  onClick={() => toggle("stars", star)}
                  className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-lg border text-left transition-all duration-150
            ${active ? "border-amber-200 bg-amber-50" : "border-transparent hover:bg-slate-50"}`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all border
              ${active ? "bg-amber-500 border-amber-500 text-white shadow-sm" : "bg-slate-50 border-slate-200 text-slate-300"}`}
                    >
                      {active ? (
                        "✓"
                      ) : (
                        <FaStar className="text-[8px]" />
                      )}
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(star)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`text-[10px] ${active ? "text-amber-500" : "text-slate-200"}`}
                        />
                      ))}
                      <span
                        className={`text-xs font-medium ml-1 ${active ? "text-amber-600" : "text-slate-600"}`}
                      >
                        {star} Star
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold ${active ? "text-amber-600" : "text-slate-400"}`}
                  >
                    ({getDynamicCount("stars", star)})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        {/* Price Slider */}
        <div>
          <SectionLabel dot="bg-emerald-400">Price per night</SectionLabel>
          <div className="px-2 pt-4 pb-2">
            <div className="flex justify-between items-center mb-4">
              <div className="border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 text-xs font-bold text-slate-700">
                ₹{filters.price[0].toLocaleString()}
              </div>
              <span className="text-slate-400 text-xs">—</span>
              <div className="border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 text-xs font-bold text-slate-700">
                {filters.price[1] === MAX_PRICE ? `₹${MAX_PRICE.toLocaleString()}+` : `₹${filters.price[1].toLocaleString()}`}
              </div>
            </div>
            
            {/* Dual thumb slider implementation */}
            <div className="relative h-1 bg-slate-200 rounded-full mt-2">
              <div 
                className="absolute h-full bg-emerald-500 rounded-full"
                style={{
                  left: `${(filters.price[0] / MAX_PRICE) * 100}%`,
                  right: `${100 - (filters.price[1] / MAX_PRICE) * 100}%`
                }}
              />
              <input
                type="range"
                min="0"
                max={MAX_PRICE}
                step="500"
                value={filters.price[0]}
                onChange={(e) => handlePriceChange(e, true)}
                className="absolute w-full -top-1.5 h-4 opacity-0 cursor-pointer pointer-events-auto"
                style={{ zIndex: filters.price[0] > MAX_PRICE - 500 ? 5 : 3 }}
              />
              <input
                type="range"
                min="0"
                max={MAX_PRICE}
                step="500"
                value={filters.price[1]}
                onChange={(e) => handlePriceChange(e, false)}
                className="absolute w-full -top-1.5 h-4 opacity-0 cursor-pointer pointer-events-auto"
                style={{ zIndex: 4 }}
              />
              
              {/* Thumbs for visual representation */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-emerald-500 rounded-full shadow-sm pointer-events-none"
                style={{ left: `calc(${(filters.price[0] / MAX_PRICE) * 100}% - 8px)` }}
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-emerald-500 rounded-full shadow-sm pointer-events-none"
                style={{ left: `calc(${(filters.price[1] / MAX_PRICE) * 100}% - 8px)` }}
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        {/* Amenities */}
        <div>
          <SectionLabel dot="bg-purple-500">Amenities</SectionLabel>
          <div className="grid grid-cols-2 gap-1.5">
            {AMENITY_FILTERS.map((item) => {
              const active = isActive("amenities", item.value);
              return (
                <button
                  key={item.value}
                  onClick={() => toggle("amenities", item.value)}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg border text-[11px] font-medium text-left transition-all duration-150
                    ${active ? "border-purple-200 bg-purple-50 text-purple-600 font-semibold shadow-sm" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-slate-100"}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm leading-none">{item.icon}</span>
                    {item.label}
                  </div>
                  <span className={`text-[9px] ${active ? "text-purple-400" : "text-slate-400"}`}>
                    ({getDynamicCount("amenities", item.value)})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelFilter;
