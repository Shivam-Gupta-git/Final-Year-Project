import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import EmptyState from "../../components/Place/EmptyState";
import LoadingSkeleton from "../../components/Place/LoadingSkeleton";
import PlaceFilters from "../../components/Place/PlaceFilters";
import PlaceHeader from "../../components/Place/PlaceHeader";
import PlaceList from "../../components/Place/PlaceList";
import PlaceSummary from "../../components/Place/PlaceSummary";

import {
  fetchPlacesByCity,
  clearNearby,
  selectDistanceRadius,
  selectNearbyError,
  selectNearbyLoading,
  selectNearbyPlaces,
  selectPlaces,
  selectPlacesError,
  selectPlacesLoading,
  selectUsingNearby,
  setActiveCategory,
  setSearchQuery,
  setSelectedCity,
  setSortBy,
} from "../../features/user/placeSlice";
import apiClient from "../services/apiClient";
import PlaceDetailDrawer from "./PlaceDetailDrawer";

/* ── Spinner ── */
function FullPageSpinner() {
  return (
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col items-center justify-center gap-5">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin" />
      </div>
      <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
        Loading Destination...
      </p>
    </div>
  );
}

/* ── Error Banner ── */
function ErrorBanner({ message }) {
  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10">
      <div className="flex items-center gap-4 bg-rose-50 border border-rose-100 rounded-2xl px-6 py-5">
        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor"
            strokeWidth={2} viewBox="0 0 24 24">
            <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0
                     2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898
                     0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-rose-700">Something went wrong</p>
          <p className="text-xs text-rose-500 mt-0.5">{message}</p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function CityPage() {
  const { id: cityId } = useParams();
  const dispatch = useDispatch();

  const [cityData, setLocalCityData] = useState(null);
  const [loadingCity, setLoadingCity] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);

  /* ── Selectors (untouched) ── */
  const places = useSelector(selectPlaces);
  const nearbyPlaces = useSelector(selectNearbyPlaces);
  const usingNearby = useSelector(selectUsingNearby);
  const loadingPlaces = useSelector(selectPlacesLoading);
  const loadingNearby = useSelector(selectNearbyLoading);
  const errorPlaces = useSelector(selectPlacesError);
  const errorNearby = useSelector(selectNearbyError);
  const radius = useSelector(selectDistanceRadius);

  const error = usingNearby ? errorNearby : errorPlaces;


  const currentList = usingNearby ? nearbyPlaces : places;
  const isListLoading = usingNearby ? loadingNearby : loadingPlaces;

  /* ── Fetch city meta + initial places (untouched) ── */
  useEffect(() => {
    if (!cityId) return;
    dispatch(clearNearby());
    dispatch(setActiveCategory(""));
    dispatch(setSearchQuery(""));
    dispatch(setSortBy("popularity"));
    (async () => {
      try {
        setLoadingCity(true);
        const res = await apiClient.get(`/api/city/getcity/${cityId}`);
        const city = res?.data?.data || res?.data || res;
        setLocalCityData(city);
        dispatch(setSelectedCity(city));
        dispatch(fetchPlacesByCity({ cityId }));
      } catch (err) {
        console.error("Failed to load city:", err);
      } finally {
        setLoadingCity(false);
      }
    })();
  }, [cityId, dispatch]);

  /* ── Initial page load spinner ── */
  if (loadingCity) return <FullPageSpinner />;

  /* ════════════════════════════════
     RENDER
  ════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#f5f7fa]">

      {/* ── HERO / HEADER ──────────────────────────────── */}
      <PlaceHeader city={cityData} />

      {/* ── STICKY FILTER + SUMMARY BAR ───────────────── */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <PlaceFilters />
          <PlaceSummary />
        </div>
      </div>

      {/* ── CONTENT ────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10">

        <AnimatePresence mode="wait">

          {/* Loading */}
          {isListLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingSkeleton count={8} />
            </motion.div>
          )}

          {/* Error */}
          {!isListLoading && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <ErrorBanner message={error} />
            </motion.div>
          )}

          {/* Empty */}
          {!isListLoading && !error && currentList.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                cityName={cityData?.name}
                usingNearby={usingNearby}
                radiusKm={radius}
              />
            </motion.div>
          )}

          {/* ── PLACE GRID ── */}
          {!isListLoading && !error && currentList.length > 0 && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {/* Section heading */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-1">
                    {usingNearby ? "📡 Nearby Results" : "Explore"}
                  </p>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {usingNearby
                      ? `Places within ${radius} km`
                      : `Places in ${cityData?.name || "this city"}`}
                  </h2>
                </div>

                <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-5 py-2.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-600">
                    {currentList.length} {currentList.length === 1 ? "place" : "places"}
                  </span>
                </div>
              </div>

              {/* Nearby mode divider pill */}
              {usingNearby && (
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50 border border-emerald-100 px-5 py-2 rounded-full shadow-sm">
                    📡 Live Nearby — within {radius} km
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
              )}

              <PlaceList
                cityName={cityData?.name}
                onPlaceClick={(p) => setSelectedPlace(p)}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <PlaceDetailDrawer
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
      />

      {/* ── FOOTER SPACER ── */}
      <div className="h-20" />
    </div>
  );
}