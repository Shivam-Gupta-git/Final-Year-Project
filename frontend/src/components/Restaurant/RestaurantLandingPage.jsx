import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  SunIcon,
  MoonIcon,
  SignalIcon,
} from "@heroicons/react/24/outline";
import {
  getAllRestaurantsForUser,
  getNearbyRestaurants,
} from "../../features/user/restaurantSlice";
import { updateUserLocation } from "../../features/user/userSlice";
import { getActiveCities } from "../../features/user/citySlice";
import RestaurantCard from "./RestaurantCard";
import RestaurantGridSkeleton from "./RestaurantGridSkeleton";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const listContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function RestaurantLandingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    restaurants = [],
    loading,
    error,
  } = useSelector((state) => state.restaurant);
  const { user } = useSelector((state) => state.user);
  const cityState = useSelector((state) => state.city);
  const citiesRaw = cityState?.cities;
  const cities = useMemo(
    () => (Array.isArray(citiesRaw) ? citiesRaw : citiesRaw?.data ?? []),
    [citiesRaw]
  );

  const [city, setCity] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 400);
  const [isNearbyMode, setIsNearbyMode] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoDenied, setGeoDenied] = useState(false);

  // const [dark, setDark] = useState(() => {
  //   if (typeof window === "undefined") return false;
  //   return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  // });

  // useEffect(() => {
  //   document.documentElement.classList.toggle("dark", dark);
  // }, [dark]);

  useEffect(() => {
    dispatch(getActiveCities());
  }, [dispatch]);

  useEffect(() => {
    if (isNearbyMode) return;

    const params = {};
    if (city) params.city = city;
    if (debouncedSearch) params.search = debouncedSearch;

    dispatch(getAllRestaurantsForUser(params));
  }, [city, debouncedSearch, isNearbyMode, dispatch]);

  const displayRestaurants = useMemo(() => {
    const list = Array.isArray(restaurants) ? restaurants : [];
    if (!isNearbyMode || !searchInput.trim()) return list;
    const q = searchInput.trim().toLowerCase();
    return list.filter((r) => {
      const name = r?.name?.toLowerCase?.() ?? "";
      const cuisine = r?.foodType?.toLowerCase?.() ?? "";
      const cname = r?.city?.name?.toLowerCase?.() ?? "";
      return name.includes(q) || cuisine.includes(q) || cname.includes(q);
    });
  }, [restaurants, isNearbyMode, searchInput]);

  const handleCitySelect = useCallback((name) => {
    setIsNearbyMode(false);
    setGeoDenied(false);
    if (name === "") {
      setCity("");
      return;
    }
    setCity(name);
  }, []);

  const handleDetectLocation = useCallback(() => {
    // If user is not logged in
    if (!user) {
      alert("Please log in first to use your location.");
      navigate("/login"); // redirect to login page
      return;
    }
    setGeoDenied(false);
    if (!navigator.geolocation) {
      setGeoDenied(true);
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setIsNearbyMode(true);
        setCity("");
        setSearchInput("");
        if (user) {
          try {
            await dispatch(
              updateUserLocation({
                latitude: lat,
                longitude: lng,
              })
            ).unwrap();
          } catch {
            /* profile update optional */
          }
        }
        dispatch(getNearbyRestaurants({ lat, lng }));
        setGeoLoading(false);
      },
      () => {
        setGeoDenied(true);
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }, [dispatch, user]);

  const handleOpenRestaurant = useCallback(
    (id) => {
      if (!id) return;
      navigate(`/restaurant/${id}`);
    },
    [navigate]
  );

  const handleViewMenu = useCallback(
    (id) => {
      if (!id) return;
      navigate(`/restaurant/${id}/menu`);
    },
    [navigate]
  );

  const showEmpty = !loading && !geoLoading && displayRestaurants.length === 0;

  return (
    <motion.div
      className="min-h-screen bg-linear-to-b from-orange-50/90 via-white to-gray-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/75 shadow-sm shadow-gray-900/5 backdrop-blur-xl dark:border-gray-800/60 dark:bg-gray-950/75 dark:shadow-black/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">
                Order fresh
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
                Restaurants near you
              </h1>
              <p className="mt-1 max-w-xl text-sm text-gray-600 dark:text-gray-400">
                Discover flavours, browse menus, and order like Swiggy & Zomato
                — minimal, fast, and built for every screen.
              </p>
            </div>
            {/* <button
              type="button"
              onClick={() => setDark((d) => !d)}
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200/80 bg-white/80 px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition hover:border-orange-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-100 dark:hover:border-orange-500/40"
              aria-label="Toggle dark mode"
            >
              {dark ? (
                <SunIcon className="h-5 w-5 text-amber-400" />
              ) : (
                <MoonIcon className="h-5 w-5 text-indigo-500" />
              )}
              {dark ? "Light" : "Dark"}
            </button> */}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search restaurant or cuisine..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                }}
                className="w-full rounded-2xl border border-gray-200/90 bg-white/90 py-3.5 pl-12 pr-4 text-sm text-gray-900 shadow-inner shadow-gray-900/5 outline-none ring-0 transition-[box-shadow,transform,border-color] duration-200 placeholder:text-gray-400 focus:border-orange-400/80 focus:bg-white focus:shadow-lg focus:shadow-orange-500/10 dark:border-gray-700 dark:bg-gray-900/80 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-orange-500/50"
                aria-label="Search restaurants"
              />
            </div>
            <motion.button
              type="button"
              onClick={handleDetectLocation}
              disabled={geoLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-orange-500 via-rose-500 to-orange-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 disabled:cursor-not-allowed disabled:opacity-70"
              whileHover={{ scale: geoLoading ? 1 : 1.02 }}
              whileTap={{ scale: geoLoading ? 1 : 0.98 }}
            >
              {geoLoading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <MapPinIcon className="h-5 w-5" />
              )}
              Use my location
            </motion.button>
          </div>

          {isNearbyMode && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200"
            >
              <SignalIcon className="h-4 w-4" />
              Showing restaurants within ~5 km of your location. City filters
              were cleared.
            </motion.div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-10" aria-labelledby="cities-heading">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2
                id="cities-heading"
                className="text-lg font-semibold text-gray-900 dark:text-white"
              >
                Explore by city
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tap a city to filter — or open all restaurants.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-linear-to-r from-orange-50/95 to-transparent dark:from-gray-950/95 lg:w-12" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l from-orange-50/95 to-transparent dark:from-gray-950/95 lg:w-12" />

            <div className="scrollbar-thin flex gap-3 overflow-x-auto pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <motion.button
                type="button"
                onClick={() => handleCitySelect("")}
                className={`shrink-0 rounded-2xl border px-4 py-3 text-left text-sm font-medium shadow-sm transition ${
                  !city && !isNearbyMode
                    ? "border-orange-500 bg-orange-500 text-white shadow-orange-500/25"
                    : "border-gray-200/90 bg-white/90 text-gray-800 hover:border-orange-200 dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-100 dark:hover:border-orange-500/40"
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                All cities
              </motion.button>
              {cities.map((c) => {
                const name = c?.name ?? "";
                const active = !isNearbyMode && city === name;
                return (
                  <motion.button
                    key={c?._id ?? name}
                    type="button"
                    onClick={() => handleCitySelect(name)}
                    className={`min-w-35 shrink-0 rounded-2xl border px-4 py-3 text-left shadow-sm transition ${
                      active
                        ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                        : "border-gray-200/90 bg-white/90 text-gray-800 hover:border-orange-200 dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-100 dark:hover:border-orange-500/40"
                    }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span
                      className={`block text-xs font-medium uppercase tracking-wide ${
                        active
                          ? "text-white/90"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {active ? "Selected" : "City"}
                    </span>
                    <span className="mt-0.5 block text-sm font-semibold">
                      {name || "—"}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        <section aria-labelledby="listing-heading">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2
              id="listing-heading"
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              Popular restaurants
            </h2>
            {(loading || geoLoading) && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-400/40 border-t-orange-500" />
                Updating…
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                key="err"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
              >
                {typeof error === "string" ? error : "Something went wrong."}
              </motion.p>
            )}
          </AnimatePresence>

          {geoDenied && (
            <p className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/35 dark:text-amber-100">
              Location permission is off. Enable it to see nearby restaurants,
              or pick a city above.
            </p>
          )}

          <div className="relative min-h-50">
            <AnimatePresence mode="wait">
              {(loading || geoLoading) && !restaurants?.length ? (
                <motion.div
                  key="sk"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <RestaurantGridSkeleton count={8} />
                </motion.div>
              ) : showEmpty ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/60 px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-900/40"
                >
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    No restaurants found
                  </p>
                  <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
                    Try another city, clear your search, or use your location to
                    discover spots nearby.
                  </p>
                  <motion.button
                    type="button"
                    className="mt-6 rounded-2xl bg-linear-to-r from-orange-500 to-rose-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSearchInput("");
                      handleCitySelect("");
                    }}
                  >
                    Reset filters
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  variants={listContainer}
                  initial="hidden"
                  animate="show"
                  className={`grid grid-cols-1 gap-5 transition-opacity duration-300 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
                    loading ? "opacity-70" : "opacity-100"
                  }`}
                >
                  {displayRestaurants.map((r, i) => (
                    <RestaurantCard
                      key={r?._id ?? i}
                      restaurant={r}
                      index={i}
                      onOpenRestaurant={handleOpenRestaurant}
                      onViewMenu={handleViewMenu}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {(loading || geoLoading) && restaurants?.length > 0 && (
              <div className="pointer-events-none absolute inset-0 flex items-start justify-center rounded-2xl bg-white/40 pt-24 dark:bg-gray-950/40">
                <span className="h-10 w-10 animate-spin rounded-full border-2 border-orange-400/30 border-t-orange-500" />
              </div>
            )}
          </div>
        </section>
      </main>
    </motion.div>
  );
}

export default RestaurantLandingPage;
