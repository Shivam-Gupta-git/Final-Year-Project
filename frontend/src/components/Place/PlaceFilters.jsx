import { useState, useRef, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
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
  fetchPlaceCategoriesByCity,
  selectActiveCategory,
  selectSearchQuery,
  selectSortBy,
  selectUserLocation,
  selectUsingNearby,
  selectDistanceRadius,
  selectSelectedCity,
  selectPlaceFilterCategories,
  selectLoadingPlaceCategories,
} from "../../features/user/placeSlice";

/** Emoji hint from common words in the DB `category` string */
function iconForCategoryName(name) {
  const n = String(name || "").toLowerCase();
  if (n.includes("hotel")) return "🏨";
  if (n.includes("restaurant") || n.includes("dining") || n.includes("food"))
    return "🍽️";
  if (n.includes("cafe") || n.includes("coffee")) return "☕";
  if (n.includes("museum")) return "🏛️";
  if (n.includes("park") || n.includes("garden")) return "🌿";
  if (n.includes("shop") || n.includes("mall")) return "🛍️";
  if (n.includes("adventure") || n.includes("trek")) return "🧗";
  if (n.includes("beach") || n.includes("lake")) return "🏖️";
  if (
    n.includes("histor") ||
    n.includes("heritage") ||
    n.includes("fort") ||
    n.includes("monument")
  )
    return "🏯";
  if (
    n.includes("entertain") ||
    n.includes("cinema") ||
    n.includes("theatre") ||
    n.includes("theater")
  )
    return "🎭";
  if (
    n.includes("temple") ||
    n.includes("mosque") ||
    n.includes("church") ||
    n.includes("shrine")
  )
    return "🛕";
  if (n.includes("nature") || n.includes("wildlife") || n.includes("zoo"))
    return "🦁";
  return "📍";
}

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
  const { id: routeCityId } = useParams();
  const category = useSelector(selectActiveCategory);
  const search = useSelector(selectSearchQuery);
  const sort = useSelector(selectSortBy);
  const userLoc = useSelector(selectUserLocation);
  const usingNearby = useSelector(selectUsingNearby);
  const radius = useSelector(selectDistanceRadius);
  const selectedCity = useSelector(selectSelectedCity);
  const placeFilterCategories = useSelector(selectPlaceFilterCategories);
  const loadingPlaceCategories = useSelector(selectLoadingPlaceCategories);
  const cityIdForApi =
    selectedCity?._id ?? selectedCity?.id ?? routeCityId ?? null;

  const categoryChips = useMemo(() => {
    const all = { label: "All", value: "", icon: "🗺️" };
    const fromDb = placeFilterCategories.map((name) => ({
      label: name,
      value: name,
      icon: iconForCategoryName(name),
    }));
    return [all, ...fromDb];
  }, [placeFilterCategories]);

  useEffect(() => {
    if (!cityIdForApi) return;
    dispatch(fetchPlaceCategoriesByCity(cityIdForApi));
  }, [cityIdForApi, dispatch]);

  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState("");
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const triggerFetch = (overrides = {}) => {
    const cid = overrides.cityId ?? cityIdForApi;
    if (!cid) return;
    if (usingNearby && userLoc) {
      dispatch(
        fetchNearbyPlaces({
          lat: userLoc.lat,
          lng: userLoc.lng,
          cityId: cid,
          distance: overrides.radius ?? radius,
          category: overrides.category ?? category,
          q: overrides.q,
        }),
      );
    } else {
      dispatch(
        fetchPlacesByCity({
          cityId: cid,
          category: overrides.category,
          q: overrides.q,
          sort: overrides.sort,
        }),
      );
    }
  };

  const handleCategory = (categoryObj) => {
    dispatch(setActiveCategory(categoryObj.value));
    const cid = cityIdForApi;
    if (!cid) return;
    navigate(`/city/${cid}/places`);
    if (usingNearby && userLoc) {
      dispatch(
        fetchNearbyPlaces({
          lat: userLoc.lat,
          lng: userLoc.lng,
          cityId: cid,
          distance: radius,
          category: categoryObj.value,
        }),
      );
    } else {
      dispatch(
        fetchPlacesByCity({
          cityId: cid,
          category: categoryObj.value,
        }),
      );
    }
  };

  const handleSearch = (val) => {
    dispatch(setSearchQuery(val));
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      triggerFetch({ q: val });
    }, 400);
  };

  const handleSort = (val) => {
    dispatch(setSortBy(val));
    if (!usingNearby) {
      triggerFetch({ sort: val });
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      return;
    }
    if (!cityIdForApi) {
      setLocError("Wait for the city to finish loading, then try again.");
      return;
    }
    setLocLoading(true);
    setLocError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        dispatch(setUserLocation(loc));
        dispatch(setUsingNearby(true));
        try {
          const first = await dispatch(
            fetchNearbyPlaces({
              lat: loc.lat,
              lng: loc.lng,
              cityId: cityIdForApi,
              distance: radius,
              category,
              q: search.trim(),
              relaxCity: false,
            }),
          ).unwrap();
          let places = first?.places ?? [];
          if (places.length === 0) {
            const second = await dispatch(
              fetchNearbyPlaces({
                lat: loc.lat,
                lng: loc.lng,
                cityId: cityIdForApi,
                distance: radius,
                category,
                q: search.trim(),
                relaxCity: true,
              }),
            ).unwrap();
            places = second?.places ?? [];
          }
        } catch (e) {
          const msg =
            typeof e === "string"
              ? e
              : e?.message || "Could not load nearby places.";
          setLocError(msg);
        } finally {
          setLocLoading(false);
        }
      },
      (err) => {
        setLocLoading(false);
        if (err?.code === err.PERMISSION_DENIED) {
          setLocError("Location permission denied. Enable location for this site.");
        } else if (err?.code === err.POSITION_UNAVAILABLE) {
          setLocError("Your position could not be determined. Try again outdoors.");
        } else if (err?.code === err.TIMEOUT) {
          setLocError("Location request timed out. Try again.");
        } else {
          setLocError("Could not read your location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      },
    );
  };

  const handleDistance = (val) => {
    const num = Number(val);
    dispatch(setDistanceRadius(num));
    if (userLoc) {
      dispatch(
        fetchNearbyPlaces({
          ...userLoc,
          cityId: cityIdForApi ?? undefined,
          distance: num,
          category,
        }),
      );
    }
  };

  const handleClearNearby = () => {
    dispatch(clearNearby());
    if (cityIdForApi) {
      dispatch(fetchPlacesByCity({ cityId: cityIdForApi }));
    }
  };

  return (
    <div className="bg-white/40 backdrop-blur-xl border-b border-white/50 sticky top-0 z-60 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex flex-wrap items-center gap-4 py-4">
          {/* Search */}
          <div className="relative flex-1 min-w-55">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Discover places..."
              className="w-full pl-11 pr-4 py-2.5 text-xs font-bold border border-slate-100/50 rounded-2xl bg-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 placeholder:text-slate-400 shadow-sm"
            />
            {search && (
              <button onClick={() => handleSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!usingNearby && (
              <select
                value={sort}
                onChange={(e) => handleSort(e.target.value)}
                className="text-xs font-bold border border-slate-100/50 rounded-2xl bg-white/60 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400/50 cursor-pointer shadow-sm text-slate-600"
              >
                {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            )}

            <div className="hidden sm:block w-px h-8 bg-slate-200/50" />

            {locLoading ? (
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 px-3 py-2">
                <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Locating…
              </div>
            ) : userLoc && usingNearby ? (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50/50 border border-emerald-100 px-4 py-2 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live nearby
                </span>
                <select
                  value={radius}
                  onChange={(e) => handleDistance(e.target.value)}
                  className="text-xs font-bold border border-emerald-100 rounded-2xl bg-emerald-50/50 px-4 py-2 text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                >
                  {DISTANCE_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label} Radius</option>)}
                </select>
                <button onClick={handleClearNearby} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 border border-slate-100 rounded-full px-4 py-1.5 hover:bg-white transition-all shadow-sm">✕ Clear</button>
              </div>
            ) : (
              <button
                onClick={handleGetLocation}
                disabled={locLoading}
                className="flex items-center gap-2 bg-linear-to-r from-[#c67c4e] to-[#b86c3d] hover:from-[#b06d42] hover:to-[#9e5b33]  disabled:opacity-60 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 0 1 8 8c0 5.25-8 14-8 14S4 15.25 4 10a8 8 0 0 1 8-8z" /></svg>
                USE MY LOCATION
              </button>
            )}
          </div>
        </div>

        {locError && (
          <p className="text-[10px] font-bold text-rose-500 pb-3 flex items-center gap-1.5 px-1">
             <span className="bg-rose-100 text-rose-600 w-4 h-4 flex items-center justify-center rounded-full text-[8px]">!</span>
             {locError}
          </p>
        )}

        <div className="flex items-center gap-3 pb-4 overflow-x-auto no-scrollbar">
          {loadingPlaceCategories && categoryChips.length <= 1 && (
            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap shrink-0 animate-pulse">
              Loading types…
            </span>
          )}
          {categoryChips.map((c) => (
            <button
              key={c.value === "" ? "cat-all" : `cat-${c.value}`}
              type="button"
              title={c.label}
              onClick={() => handleCategory(c)}
              className={`flex items-center gap-2 whitespace-nowrap text-[10px] font-bold border transition-all duration-300 shrink-0 rounded-xl px-5 py-2 ${
                c.value === ""
                  ? "uppercase tracking-widest font-black"
                  : "normal-case tracking-wide max-w-[200px]"
              } ${
                category === c.value
                  ? "bg-slate-800 text-white border-slate-800 shadow-md shadow-slate-300"
                  : "bg-white/50 text-slate-500 border-slate-100 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50/50"
              }`}
            >
              <span className="text-sm opacity-80 shrink-0">{c.icon}</span>
              <span className={c.value === "" ? "" : "truncate"}>{c.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
