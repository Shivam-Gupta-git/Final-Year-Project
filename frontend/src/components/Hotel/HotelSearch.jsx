import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
  FaChevronDown,
  FaTimes,
  FaMinus,
  FaPlus,
} from "react-icons/fa";
import apiClient from "../../pages/services/apiClient";

const getToday = () => new Date().toISOString().split("T")[0];
const getTomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const CounterRow = ({ label, sub, value, min = 0, max = 10, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
    <div>
      <p className="text-sm font-semibold text-white">{label}</p>
      {sub && <p className="text-xs text-white/50">{sub}</p>}
    </div>
    <div className="flex items-center border border-white/10 rounded-xl overflow-hidden bg-white/5">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-9 h-9 flex items-center justify-center text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <FaMinus className="text-[10px]" />
      </button>
      <span className="w-8 text-center text-sm font-bold text-white">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-9 h-9 flex items-center justify-center text-white/70 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <FaPlus className="text-[10px]" />
      </button>
    </div>
  </div>
);

const Field = ({ icon, label, error, children }) => (
  <div className="flex-1 min-w-0">
    <p className="text-[10px] font-bold tracking-widest uppercase text-white/50 mb-1.5 px-1">
      {label}
    </p>
    <div
      className={`relative flex items-center rounded-xl border transition-all duration-200 group
      ${error ? "border-rose-500/50 bg-rose-500/10" : "border-white/10 bg-white/[0.02] focus-within:border-[#3d6ef5]/60 focus-within:bg-white/[0.04] focus-within:shadow-[0_0_15px_rgba(61,110,245,0.15)] hover:border-white/20"}`}
    >
      <span
        className={`absolute left-3 text-sm pointer-events-none z-10 transition-colors
        ${error ? "text-rose-400" : "text-white/40 group-focus-within:text-[#3d6ef5]"}`}
      >
        {icon}
      </span>
      {children}
    </div>
    {error && (
      <p className="mt-1 px-1 text-[11px] text-rose-500 font-medium">{error}</p>
    )}
  </div>
);

const inputCls =
  "w-full bg-transparent pl-9 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none";

const HeroSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchData, setSearchData] = useState({
    city: searchParams.get("city") || "",
    checkIn: searchParams.get("checkIn") || getToday(),
    checkOut: searchParams.get("checkOut") || getTomorrow(),
  });

  const [rooms, setRooms] = useState(Number(searchParams.get("rooms")) || 1);
  const [adults, setAdults] = useState(Number(searchParams.get("adults")) || 2);
  const [children, setChildren] = useState(
    Number(searchParams.get("children")) || 0,
  );
  const [showGuests, setShowGuests] = useState(false);

  const guestLabel = [
    `${rooms} Room${rooms > 1 ? "s" : ""}`,
    `${adults} Adult${adults > 1 ? "s" : ""}`,
    children > 0 ? `${children} Child${children > 1 ? "ren" : ""}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const [cityError, setCityError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allCities, setAllCities] = useState([]);

  // Load cities once on mount
  useEffect(() => {
    // Left empty as it was in original codebase
  }, []);

  const debouncedCity = useDebounce(searchData.city, 200);

  // Filter cities locally
  useEffect(() => {
    if (debouncedCity.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const filtered = allCities.filter((c) =>
      c.toLowerCase().includes(debouncedCity.toLowerCase()),
    );
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [debouncedCity, allCities]);

  // Close dropdowns on outside click
  useEffect(() => {
    const h = (e) => {
      if (!e.target.closest("#city-field")) setShowSuggestions(false);
      if (!e.target.closest("#guests-panel")) setShowGuests(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const onCityChange = (e) => {
    setSearchData((p) => ({ ...p, city: e.target.value }));
    setCityError("");
  };

  const selectCity = (name) => {
    setSearchData((p) => ({ ...p, city: name }));
    setShowSuggestions(false);
  };

  const onChange = (e) =>
    setSearchData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSearch = () => {
    if (!searchData.city.trim()) {
      setCityError("Enter a city or property");
      cityInputRef.current?.focus(); 
      return;
    }
    const params = new URLSearchParams({
      city: searchData.city.trim(),
      checkIn: searchData.checkIn,
      checkOut: searchData.checkOut,
      rooms,
      adults,
      children,
    });
    navigate(`/hotels?${params.toString()}`);
    setShowSuggestions(false);
    setShowGuests(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      setShowSuggestions(false);
      onSearch();
    }
    if (e.key === "Escape") setShowSuggestions(false);
  };

  const cityInputRef = useRef(null);

  return (
    <div className="w-full max-w-6xl mx-auto font-sans">
      <div className="bg-[#0a0a10] sm:bg-white/[0.02] sm:backdrop-blur-md rounded-2xl shadow-xl shadow-black/40 border border-white/5 px-3 sm:px-4 py-3.5">
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-0 lg:items-end">
          {/* City */}
          <div className="flex-1 min-w-0" id="city-field">
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/50 mb-1.5 px-1">
              Destination
            </p>
            <div
              className={`relative flex items-center rounded-xl border transition-all duration-200 group
              ${cityError ? "border-rose-500/50 bg-rose-500/10" : "border-white/10 bg-white/[0.02] focus-within:border-[#3d6ef5]/60 focus-within:bg-white/[0.04] focus-within:shadow-[0_0_15px_rgba(61,110,245,0.15)] hover:border-white/20"}`}
            >
              <FaMapMarkerAlt
                className={`absolute left-3 text-sm pointer-events-none z-10 ${cityError ? "text-rose-400" : "text-white/40 group-focus-within:text-[#3d6ef5]"}`}
              />
              <input
                type="text"
                ref={cityInputRef}
                placeholder="City, area or property"
                value={searchData.city}
                onChange={onCityChange}
                onKeyDown={onKeyDown}
                onFocus={() =>
                  suggestions.length > 0 && setShowSuggestions(true)
                }
                autoComplete="off"
                className={inputCls}
              />
              {searchData.city && (
                <button
                  onClick={() => {
                    setSearchData((p) => ({ ...p, city: "" }));
                    setShowSuggestions(false);
                  }}
                  className="absolute right-3 text-white/40 hover:text-white transition-colors z-10"
                >
                  <FaTimes className="text-xs" />
                </button>
              )}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#12141d] border border-white/10 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] z-50 overflow-hidden max-h-48 overflow-y-auto">
                  {suggestions.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => selectCity(city)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors"
                    >
                      <FaMapMarkerAlt className="text-[#3d6ef5]/70 text-xs shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {city}
                        </p>
                        <p className="text-xs text-white/40">
                          Hotel destination
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {cityError && (
              <p className="mt-1 px-1 text-[11px] text-rose-500 font-medium">
                {cityError}
              </p>
            )}
          </div>

          <div className="hidden lg:block w-px h-8 bg-white/10 self-center mx-2" />

          {/* Check-in + Check-out */}
          <div className="flex gap-3 flex-1">
            <Field icon={<FaCalendarAlt />} label="Check-in">
              <input
                type="date"
                name="checkIn"
                value={searchData.checkIn}
                min={getToday()}
                onChange={onChange}
                className={`${inputCls} [color-scheme:dark]`}
              />
            </Field>
            <Field icon={<FaCalendarAlt />} label="Check-out">
              <input
                type="date"
                name="checkOut"
                value={searchData.checkOut}
                min={searchData.checkIn}
                onChange={onChange}
                className={`${inputCls} [color-scheme:dark]`}
              />
            </Field>
          </div>

          <div className="hidden lg:block w-px h-8 bg-white/10 self-center mx-2" />

          {/* Guests + Search */}
          <div className="flex items-end gap-3">
            <div className="flex-1 min-w-0" id="guests-panel">
              <p className="text-[10px] font-bold tracking-widest uppercase text-white/50 mb-1.5 px-1">
                Guests & rooms
              </p>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowGuests((v) => !v)}
                  className="w-full flex items-center justify-between pl-3 pr-3 py-3 border border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] rounded-xl transition-all text-sm focus:outline-none"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FaUsers className="text-white/40 text-sm shrink-0" />
                    <span className="text-white font-medium truncate">
                      {guestLabel}
                    </span>
                  </div>
                  <FaChevronDown
                    className={`text-white/40 text-xs ml-2 shrink-0 transition-transform duration-200 ${showGuests ? "rotate-180" : ""}`}
                  />
                </button>

                {showGuests && (
                  <div className="absolute top-full left-0 right-0 lg:left-auto lg:right-0 sm:min-w-75 mt-2 bg-[#12141d] border border-white/10 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] z-50 overflow-hidden">
                    <div className="px-5 py-4">
                      <CounterRow
                        label="Rooms"
                        value={rooms}
                        min={1}
                        max={10}
                        onChange={setRooms}
                      />
                      <CounterRow
                        label="Adults"
                        value={adults}
                        min={1}
                        max={30}
                        onChange={setAdults}
                      />
                      <CounterRow
                        label="Children"
                        sub="0 – 17 years old"
                        value={children}
                        min={0}
                        max={10}
                        onChange={setChildren}
                      />
                      {/* Apply button */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowGuests(false);
                          if (searchData.city.trim()) onSearch();
                        }}
                        className="mt-4 w-full bg-[#3d6ef5] hover:bg-[#2b59da] text-white font-bold py-2.5 rounded-xl text-sm shadow-[0_4px_16px_rgba(61,110,245,0.4)] transition-all"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0">
              <p className="text-[10px] tracking-widest text-transparent mb-1.5 px-1 select-none">
                S
              </p>
              <button
                onClick={onSearch}
                className="h-[46px] px-6 sm:px-7 bg-[#3d6ef5] hover:bg-[#2b59da] active:scale-95 text-white font-bold text-sm rounded-xl shadow-[0_4px_16px_rgba(61,110,245,0.4)] hover:shadow-[0_6px_24px_rgba(61,110,245,0.5)] transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <FaSearch className="text-xs" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSearch;
