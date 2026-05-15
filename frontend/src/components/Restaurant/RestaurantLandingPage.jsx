import {
  MagnifyingGlassIcon,
  MapPinIcon,
  SignalIcon,
  MinusIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { getActiveCities } from "../../features/user/citySlice";
import {
  getAllRestaurantsForUser,
  getNearbyRestaurants,
} from "../../features/user/restaurantSlice";
import { updateUserLocation } from "../../features/user/userSlice";

import RestaurantCard from "./RestaurantCard";
import RestaurantGridSkeleton from "./RestaurantGridSkeleton";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const listContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
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
    () => (Array.isArray(citiesRaw) ? citiesRaw : (citiesRaw?.data ?? [])),
    [citiesRaw],
  );

  const [city, setCity] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 400);

  const [isNearbyMode, setIsNearbyMode] = useState(false);

  const [geoLoading, setGeoLoading] = useState(false);
  const [geoDenied, setGeoDenied] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  const [distanceKm, setDistanceKm] = useState(5);

  // ---------------- FETCH ALL RESTAURANTS ----------------

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

  // ---------------- SCROLL ----------------

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ---------------- FILTER LOCAL SEARCH ----------------

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

  // ---------------- CITY SELECT ----------------

  const handleCitySelect = useCallback((name) => {
    setIsNearbyMode(false);
    setGeoDenied(false);

    if (name === "") {
      setCity("");
      return;
    }

    setCity(name);
  }, []);

  // ---------------- GET LOCATION ----------------

  const handleDetectLocation = useCallback(() => {
    if (!user) {
      alert("Please log in first to use your location.");
      navigate("/login");
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

        // optional user profile update
        try {
          await dispatch(
            updateUserLocation({
              latitude: lat,
              longitude: lng,
            }),
          ).unwrap();
        } catch {
          // ignore
        }

        dispatch(
          getNearbyRestaurants({
            lat,
            lng,
            radius: distanceKm,
          }),
        );

        setGeoLoading(false);
      },

      () => {
        setGeoDenied(true);
        setGeoLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      },
    );
  }, [dispatch, user, navigate, distanceKm]);

  // ---------------- DISTANCE CHANGE ----------------

  const handleDistanceChange = useCallback(
    (type) => {
      let next = distanceKm;

      if (type === "inc") {
        next = Math.min(distanceKm + 5, 100);
      } else {
        next = Math.max(distanceKm - 5, 5);
      }

      setDistanceKm(next);

      if (isNearbyMode && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            dispatch(
              getNearbyRestaurants({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                radius: next,
              }),
            );
          },
          () => {},
          {
            enableHighAccuracy: true,
          },
        );
      }
    },
    [distanceKm, dispatch, isNearbyMode],
  );

  // ---------------- CLEAR NEARBY ----------------

  const handleClearNearby = () => {
    setIsNearbyMode(false);
    setDistanceKm(5);

    dispatch(getAllRestaurantsForUser({}));
  };

  // ---------------- NAVIGATION ----------------

  const handleOpenRestaurant = useCallback(
    (id) => {
      if (!id) return;

      navigate(`/restaurant/${id}`);
    },
    [navigate],
  );

  const handleViewMenu = useCallback(
    (id) => {
      if (!id) return;

      navigate(`/restaurant/${id}/menu`);
    },
    [navigate],
  );

  const showEmpty = !loading && !geoLoading && displayRestaurants.length === 0;

  return (
    <motion.div
      className="relative min-h-screen bg-[linear-gradient(145deg,#eef3fb_0%,#e8f0f9_40%,#dfe9f5_70%,#d8e4f2_100%)]"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      {/* Background Blur */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -right-[5%] h-125 w-125 rounded-full bg-[#c67c4e]/5 blur-[120px]" />

        <div className="absolute -bottom-[10%] -left-[5%] h-150 w-150 rounded-full bg-[#eadccf]/10 blur-[150px]" />
      </div>

      {/* ================= HEADER ================= */}

      <header className="sticky top-0 z-50 w-full">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-2 pb-2">
          <div
            className={`
        rounded-2xl border border-white/60
        bg-white/80 backdrop-blur-2xl
        shadow-[0_8px_32px_rgba(186,140,102,0.10)]
        transition-all duration-300 ease-in-out
        ${isScrolled ? "px-4 py-3" : "px-5 py-4 sm:px-8 sm:py-5"}
      `}
          >
            {/* COLLAPSED HERO — only shown when NOT scrolled */}
            <div
              className={`
          grid transition-all duration-300 ease-in-out
          ${
            isScrolled
              ? "grid-rows-[0fr] opacity-0 mb-0"
              : "grid-rows-[1fr] opacity-100 mb-4"
          }
        `}
            >
              <div className="overflow-hidden">
                <div className="pb-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#5b6f8f]">
                    Premium Selection
                  </p>
                  <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-[#2d1f16] leading-tight">
                    <span className="bg-linear-to-r from-[#6b84a7] via-[#5b6f8f] to-[#445a78] bg-clip-text text-transparent">
                      Restaurants
                    </span>{" "}
                    near you
                  </h1>
                  <p className="mt-1.5 max-w-lg text-xs sm:text-sm font-medium leading-relaxed text-[#6f5a4b]">
                    Discover curated flavours and premium menus.
                  </p>
                </div>
              </div>
            </div>

            {/* SEARCH + LOCATION — always visible */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative flex-1 group">
                <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a07d63] pointer-events-none" />
                <input
                  type="search"
                  placeholder="Find your favorite cuisine..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="
              w-full rounded-xl border border-[#e8d8cc]/60
              bg-[#faf7f4] py-2.5 pl-10 pr-9
              text-sm text-[#2d1f16] placeholder:text-[#b09a8a]
              outline-none ring-0
              transition-all duration-200
              hover:border-[#c67c4e]/30
              focus:border-[#c67c4e]/50 focus:bg-white focus:shadow-sm
            "
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9c7d66] hover:text-[#2d1f16] transition"
                  >
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <motion.button
                type="button"
                onClick={handleDetectLocation}
                disabled={geoLoading}
                whileHover={{ scale: geoLoading ? 1 : 1.02 }}
                whileTap={{ scale: geoLoading ? 1 : 0.98 }}
                className="
            flex shrink-0 items-center justify-center gap-1.5
            rounded-xl bg-linear-to-br from-[#6b84a7] to-[#445a78]
            px-4 py-2.5 text-sm font-semibold text-white
            shadow-md shadow-[#445a78]/20
            transition-all duration-200
            hover:shadow-lg hover:shadow-[#445a78]/30
            disabled:opacity-70
          "
              >
                {geoLoading ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <MapPinIcon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline whitespace-nowrap">
                  Use my location
                </span>
              </motion.button>
            </div>

            {/* NEARBY BADGE */}
            <AnimatePresence>
              {isNearbyMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 10 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div
                    className="
              flex flex-wrap items-center gap-2
              rounded-xl border border-[#22c55e]/15
              bg-[#f0faf2] px-3 py-2 text-[#16a34a]
            "
                  >
                    <SignalIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-[11px] font-bold">
                      Nearby restaurants
                    </span>

                    {/* DISTANCE CONTROL */}
                    <div className="flex items-center gap-1 rounded-lg bg-white/80 px-1.5 py-0.5 shadow-sm ml-1">
                      <button
                        onClick={() => handleDistanceChange("dec")}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-[#16a34a] transition hover:bg-[#22c55e] hover:text-white"
                      >
                        <MinusIcon className="h-3 w-3" />
                      </button>
                      <span className="min-w-12 text-center text-[11px] font-black tabular-nums">
                        {distanceKm} km
                      </span>
                      <button
                        onClick={() => handleDistanceChange("inc")}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-[#16a34a] transition hover:bg-[#22c55e] hover:text-white"
                      >
                        <PlusIcon className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      onClick={handleClearNearby}
                      className="
                  ml-auto rounded-lg border border-[#22c55e]/20
                  bg-white/80 px-2.5 py-1 text-[10px]
                  font-black uppercase tracking-wider text-[#16a34a]
                  transition hover:bg-[#22c55e] hover:text-white
                "
                    >
                      Clear
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* CITIES */}

        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-xl font-black text-[#2d2d2d]">
              Explore by city
            </h2>

            <p className="text-sm font-medium text-[#6b6b6b]">
              Tap a city to filter restaurants.
            </p>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-linear-to-r from-[#f6f1eb]/95 to-transparent" />

            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-linear-to-l from-[#f1ebe4]/95 to-transparent" />

            <div
              className="
                flex gap-3 overflow-x-auto
                pb-2 pt-1 px-1
                scroll-smooth
                [-ms-overflow-style:none]
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
              "
            >
              {/* ALL */}

              <motion.button
                type="button"
                onClick={() => handleCitySelect("")}
                className={`
                  shrink-0 rounded-[20px]
                  border px-5 py-3
                  text-sm font-black
                  transition-all
                  ${
                    !city && !isNearbyMode
                      ? "border-[#c67c4e] bg-linear-to-br from-[#c67c4e] to-[#b86c3d] text-white shadow-[0_10px_20px_rgba(198,124,78,0.25)]"
                      : "border-[#eadccf] bg-white/80 text-[#6f5a4b]"
                  }
                `}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                All Regions
              </motion.button>

              {/* CITY LIST */}

              {cities.map((c) => {
                const name = c?.name ?? "";

                const active = !isNearbyMode && city === name;

                return (
                  <motion.button
                    key={c?._id ?? name}
                    type="button"
                    onClick={() => handleCitySelect(name)}
                    className={`
                      min-w-35 shrink-0
                      rounded-[20px]
                      border px-5 py-3
                      text-left transition-all
                      ${
                        active
                          ? "border-[#c67c4e] bg-linear-to-br from-[#c67c4e] to-[#b86c3d] text-white shadow-[0_10px_20px_rgba(198,124,78,0.25)]"
                          : "border-[#eadccf] bg-white/80 text-[#6f5a4b]"
                      }
                    `}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span
                      className={`
                        text-[10px] font-black uppercase tracking-[0.15em]
                        ${active ? "text-white/70" : "text-[#a07d63]"}
                      `}
                    >
                      {active ? "Current" : "Location"}
                    </span>

                    <span className="mt-1 block text-base font-black truncate">
                      {name}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        {/* RESTAURANTS */}

        <section>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black text-[#2d2d2d]">
              Popular restaurants
            </h2>

            {(loading || geoLoading) && (
              <div className="flex items-center gap-2 text-sm font-medium text-[#c67c4e]">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#c67c4e]/30 border-t-[#c67c4e]" />
                Updating...
              </div>
            )}
          </div>

          {/* ERROR */}

          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                key="err"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="
                  mb-6 rounded-2xl border border-red-200
                  bg-red-50 px-4 py-3 text-sm text-red-800
                "
              >
                {typeof error === "string" ? error : "Something went wrong."}
              </motion.p>
            )}
          </AnimatePresence>

          {/* GEO ERROR */}

          {geoDenied && (
            <p
              className="
                mb-6 rounded-2xl border border-amber-200
                bg-amber-50 px-4 py-3 text-sm text-amber-900
              "
            >
              Location permission is off. Enable it to see nearby restaurants.
            </p>
          )}

          {/* GRID */}

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
                  initial={{
                    opacity: 0,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{ opacity: 0 }}
                  className="
                    flex flex-col items-center justify-center
                    rounded-3xl border border-dashed border-black/10
                    bg-[#faf7f2]/40 px-6 py-20
                    text-center shadow-inner
                  "
                >
                  <p className="text-xl font-black text-[#2d2d2d]">
                    No restaurants found
                  </p>

                  <p className="mt-2 max-w-md text-sm font-medium text-[#6b6b6b]">
                    Try another city or use your location to discover nearby
                    places.
                  </p>

                  <motion.button
                    type="button"
                    className="ui-btn-primary mt-6 rounded-2xl! px-6! py-2.5!"
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
                  className={`
                    grid grid-cols-1 gap-5
                    transition-opacity duration-300
                    sm:grid-cols-2
                    lg:grid-cols-3
                    xl:grid-cols-4
                    ${loading ? "opacity-70" : "opacity-100"}
                  `}
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
              <div
                className="
                    pointer-events-none absolute inset-0
                    flex items-start justify-center
                    rounded-3xl bg-[#faf7f2]/20
                    pt-24 backdrop-blur-[2px]
                  "
              >
                <span className="h-10 w-10 animate-spin rounded-full border-2 border-[#c67c4e]/30 border-t-[#c67c4e]" />
              </div>
            )}
          </div>
        </section>
      </main>
    </motion.div>
  );
}

export default RestaurantLandingPage;
