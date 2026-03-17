import { useState, useEffect } from "react";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
  FaChevronDown,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
// import { fetchActiveHotels } from "../../redux/slices/hotelSlice";

const GUEST_OPTIONS = [
  { label: "1 Room, 1 Adult", sub: "Solo traveller" },
  { label: "1 Room, 2 Adults", sub: "Couple" },
  { label: "1 Room, 3 Adults", sub: "Small group" },
  { label: "2 Rooms, 2 Adults", sub: "Separate rooms" },
  { label: "2 Rooms, 4 Adults", sub: "Family / group" },
];

const getToday = () => new Date().toISOString().split("T")[0];
const getTomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

const Field = ({ icon, label, error, children }) => (
  <div className="flex-1 min-w-0">
    <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1.5 px-1">
      {label}
    </p>
    <div
      className={`relative flex items-center rounded-xl border transition-all duration-200 group
      ${error ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-slate-50 focus-within:border-[#1a3a6b]/40 focus-within:bg-white focus-within:shadow-sm hover:border-slate-300"}`}
    >
      <span
        className={`absolute left-3 text-sm pointer-events-none transition-colors z-10
        ${error ? "text-rose-400" : "text-slate-400 group-focus-within:text-[#1a3a6b]"}`}
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
  "w-full bg-transparent pl-9 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none";

const HeroSearch = () => {
  const dispatch = useDispatch();
  const [searchData, setSearchData] = useState({
    city: "",
    checkIn: getToday(),
    checkOut: getTomorrow(),
    guests: "1 Room, 2 Adults",
  });
  const [showGuests, setShowGuests] = useState(false);
  const [cityError, setCityError] = useState("");

  useEffect(() => {
    const h = (e) => {
      if (!e.target.closest("#guests-dd")) setShowGuests(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const onChange = (e) => {
    setSearchData((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (e.target.name === "city") setCityError("");
  };

  const onSearch = () => {
    if (!searchData.city.trim()) {
      setCityError("Enter a city or property");
      return;
    }
    // dispatch(fetchActiveHotels(searchData));
    console.log("Searching:", searchData);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 px-4 py-3.5">
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-0 lg:items-end">
          <Field
            icon={<FaMapMarkerAlt />}
            label="Destination"
            error={cityError}
          >
            <input
              type="text"
              name="city"
              placeholder="City, area or property"
              value={searchData.city}
              onChange={onChange}
              className={inputCls}
            />
          </Field>

          <div className="hidden lg:block w-px h-8 bg-slate-200 self-center mx-2" />

          <Field icon={<FaCalendarAlt />} label="Check-in">
            <input
              type="date"
              name="checkIn"
              value={searchData.checkIn}
              min={getToday()}
              onChange={onChange}
              className={inputCls}
            />
          </Field>

          <div className="hidden lg:block w-px h-8 bg-slate-200 self-center mx-2" />

          <Field icon={<FaCalendarAlt />} label="Check-out">
            <input
              type="date"
              name="checkOut"
              value={searchData.checkOut}
              min={searchData.checkIn}
              onChange={onChange}
              className={inputCls}
            />
          </Field>

          <div className="hidden lg:block w-px h-8 bg-slate-200 self-center mx-2" />

          {/* Guests */}
          <div className="flex-1 min-w-0" id="guests-dd">
            <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1.5 px-1">
              Guests & rooms
            </p>
            <div className="relative border border-slate-200 bg-slate-50 hover:border-slate-300 rounded-xl transition-all duration-200">
              <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none z-10" />
              <button
                type="button"
                onClick={() => setShowGuests((v) => !v)}
                className="w-full flex items-center justify-between pl-9 pr-3 py-3 text-sm focus:outline-none"
              >
                <span className="text-slate-800 font-medium truncate">
                  {searchData.guests}
                </span>
                <FaChevronDown
                  className={`text-slate-400 text-xs ml-2 transition-transform duration-200 ${showGuests ? "rotate-180" : ""}`}
                />
              </button>
              {showGuests && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-40 overflow-hidden">
                  {GUEST_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => {
                        setSearchData((p) => ({ ...p, guests: opt.label }));
                        setShowGuests(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors
                        ${searchData.guests === opt.label ? "bg-[#1a3a6b]/5" : "hover:bg-slate-50"}`}
                    >
                      <div>
                        <p
                          className={`text-sm font-semibold ${searchData.guests === opt.label ? "text-[#1a3a6b]" : "text-slate-800"}`}
                        >
                          {opt.label}
                        </p>
                        <p className="text-xs text-slate-400">{opt.sub}</p>
                      </div>
                      {searchData.guests === opt.label && (
                        <div className="w-2 h-2 rounded-full bg-[#1a3a6b]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search button */}
          <button
            onClick={onSearch}
            className="lg:ml-3 shrink-0 h-[46px] px-7 bg-[#1a3a6b] hover:bg-[#14305a] active:scale-95 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap self-end"
          >
            <FaSearch className="text-xs" />
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSearch;
