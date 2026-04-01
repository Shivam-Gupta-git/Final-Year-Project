import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setActiveCategory,
  setSearchQuery,
  setSortBy,
  setDistanceRadius,
  setUserLocation,
  setUsingNearby,
  clearNearby,
  fetchNearbyPlaces,
  fetchPlacesByCity,
  selectActiveCategory,
  selectSearchQuery,
  selectSortBy,
  selectUserLocation,
  selectUsingNearby,
  selectDistanceRadius,
  selectSelectedCity,
} from "../../features/user/placeSlice";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  { label: "All", value: "", icon: "🗺️" },
  { label: "Hotel", value: "hotel", route: "hotels", icon: "🏨" },
  { label: "Restaurant", value: "restaurant", icon: "🍽️" },
  { label: "Cafe", value: "cafe", icon: "☕" },
  { label: "Museum", value: "museum", icon: "🏛️" },
  { label: "Park", value: "park", icon: "🌿" },
  { label: "Shopping", value: "shopping", icon: "🛍️" },
  { label: "Adventure", value: "adventure", icon: "🧗" },
  { label: "Beach", value: "beach", icon: "🏖️" },
  { label: "Historical", value: "historical", icon: "🏯" },
  { label: "Entertainment", value: "entertainment", icon: "🎭" },
  { label: "Temple", value: "temple" , icon : "🔥"},
  // { label: "Wellness", value: "Wellness", icon: "🧘" },
  // { label: "Nightlife", value: "Nightlife", icon: "🌙" },
];

const SORT_OPTIONS = [
  { label: "Most Popular", value: "popularity" },
  { label: "Top Rated", value: "rating" },
  { label: "Newest", value: "newest" },
];

const DISTANCE_OPTIONS = [
  { label: "5 km", value: 5 },
  { label: "20 km", value: 20 },
  { label: "50 km", value: 50 },
  { label: "100 km", value: 100 },
];

export default function PlaceFilters() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const category = useSelector(selectActiveCategory);
  const search = useSelector(selectSearchQuery);
  const sort = useSelector(selectSortBy);
  const userLoc = useSelector(selectUserLocation);
  const usingNearby = useSelector(selectUsingNearby);
  const radius = useSelector(selectDistanceRadius);
  const selectedCity = useSelector(selectSelectedCity);

  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState("");
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // ── fetch when filters change ──────────────────────────────────────────────
  // cityName is kept for backwards compatibility with older pages
  const triggerFetch = (overrides = {}) => {
    if (usingNearby && userLoc) {
      dispatch(
        fetchNearbyPlaces({
          lat: userLoc.lat,
          lng: userLoc.lng,
          cityId: overrides.cityId ?? selectedCity?._id,
          distance: overrides.radius ?? radius, // KM
        }),
      );
    } else {
      dispatch(
        fetchPlacesByCity({
          cityId: selectedCity?._id,
        }),
      );
    }
  };

  // ── Category ───────────────────────────────────────────────────────────────
  const handleCategory = (categoryObj) => {
    dispatch(setActiveCategory(categoryObj.value));

    if (!selectedCity?._id) return;

    if (categoryObj.route) {
      navigate(`/city/${selectedCity._id}/${categoryObj.route}`);
    } else {
      navigate(`/city/${selectedCity._id}/places`);
    }
  };

  // ── Search (debounced 400ms) ───────────────────────────────────────────────
  const handleSearch = (val) => {
    dispatch(setSearchQuery(val));
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      triggerFetch({ search: val });
    }, 400);
  };

  // ── Sort ───────────────────────────────────────────────────────────────────
  const handleSort = (val) => {
    dispatch(setSortBy(val));
    triggerFetch({ sort: val });
  };

  // ── Geolocation ────────────────────────────────────────────────────────────
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      return;
    }
    setLocLoading(true);
    setLocError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        dispatch(setUserLocation(loc));
        dispatch(setUsingNearby(true));
        dispatch(
          fetchNearbyPlaces({
            ...loc,
            cityId: selectedCity?._id,
            distance: radius,
            category,
          }),
        );
        setLocLoading(false);
      },
      () => {
        setLocError(
          "Location access denied. Please enable it in browser settings.",
        );
        setLocLoading(false);
      },
      { timeout: 10000 },
    );
  };

  // ── Distance ───────────────────────────────────────────────────────────────
  const handleDistance = (val) => {
    const num = Number(val);
    dispatch(setDistanceRadius(num));
    if (userLoc) {
      dispatch(
        fetchNearbyPlaces({
          ...userLoc,
          cityId: selectedCity?._id,
          distance: num,
          category,
        }),
      );
    }
  };

  // ── Clear nearby ───────────────────────────────────────────────────────────
  const handleClearNearby = () => {
    dispatch(clearNearby());
    if (selectedCity?._id) {
      dispatch(fetchPlacesByCity({ cityId: selectedCity._id }));
    }
  };

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* ── Row 1: Search + Sort + Location ──────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 py-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search places..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl
                         bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-400
                         focus:border-transparent placeholder:text-gray-400"
            />
            {search && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Sort (hidden when nearby active) */}
          {!usingNearby && (
            <select
              value={sort}
              onChange={(e) => handleSort(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl bg-gray-50 px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          )}

          {/* Divider */}
          <div className="hidden sm:block w-px h-7 bg-gray-200" />

          {/* Location block */}
          {!userLoc ? (
            <button
              onClick={handleGetLocation}
              disabled={locLoading}
              className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-60
                         text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors
                         shadow-sm shadow-rose-200 whitespace-nowrap"
            >
              {locLoading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Locating…
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="10" r="3" />
                    <path d="M12 2a8 8 0 0 1 8 8c0 5.25-8 14-8 14S4 15.25 4 10a8 8 0 0 1 8-8z" />
                  </svg>
                  Use My Location
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Location active indicator */}
              <span
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600
                               bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Location Active
              </span>

              {/* Distance select */}
              <select
                value={radius}
                onChange={(e) => handleDistance(e.target.value)}
                className="text-sm border border-emerald-300 rounded-xl bg-emerald-50 px-3 py-2
                           text-emerald-700 font-medium focus:outline-none focus:ring-2
                           focus:ring-emerald-400 cursor-pointer"
              >
                {DISTANCE_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label} radius
                  </option>
                ))}
              </select>

              {/* Clear */}
              <button
                onClick={handleClearNearby}
                className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200
                           rounded-full px-3 py-1.5 hover:bg-gray-50 transition-colors"
              >
                ✕ Clear
              </button>
            </div>
          )}
        </div>

        {/* Location error */}
        {locError && (
          <p className="text-xs text-rose-500 pb-2 flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {locError}
          </p>
        )}

        {/* ── Row 2: Category pills ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 pb-3 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => handleCategory(c)}
              className={`flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold
                          px-3.5 py-1.5 rounded-full border transition-all duration-200 shrink-0
                          ${
                            category === c.value
                              ? "bg-rose-500 text-white border-rose-500 shadow-sm shadow-rose-200"
                              : "bg-white text-gray-600 border-gray-200 hover:border-rose-300 hover:text-rose-500"
                          }`}
            >
              <span>{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
