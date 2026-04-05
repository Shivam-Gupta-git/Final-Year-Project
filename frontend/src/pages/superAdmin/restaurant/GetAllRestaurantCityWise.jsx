import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRestaurantCityWise } from "../../../features/user/restaurantSlice";
import { getActiveCities } from "../../../features/user/citySlice";
import {
  FaUtensils,
  FaSearch,
  FaMapMarkerAlt,
  FaTimes,
  FaChevronRight,
  FaClock,
  FaMoneyBillWave,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

function GetAllRestaurantCityWise() {
  const dispatch = useDispatch();

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [search, setSearch] = useState("");

  const { restaurants = [], loading } = useSelector(
    (state) => state.restaurant
  );

  const { cities = [] } = useSelector((state) => state.city);

  useEffect(() => {
    dispatch(getActiveCities());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getRestaurantCityWise({ city: selectedCity, page: 1 }));
  }, [dispatch, selectedCity]);

  const cityFilters = useMemo(() => {
    const names = [
      "All",
      ...cities
        .map((city) => city?.name)
        .filter((city) => city && typeof city === "string"),
    ];

    return [...new Set(names)];
  }, [cities]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const cityName = restaurant?.city?.name || "";

      const matchesSearch =
        restaurant?.name?.toLowerCase().includes(search.toLowerCase()) ||
        cityName.toLowerCase().includes(search.toLowerCase()) ||
        restaurant?.foodType?.toLowerCase().includes(search.toLowerCase()) ||
        restaurant?.address?.toLowerCase().includes(search.toLowerCase());

      const matchesCity =
        selectedCity === "" ||
        restaurant?.city?._id === selectedCity ||
        cityName === selectedCity;

      return matchesSearch && matchesCity;
    });
  }, [restaurants, search, selectedCity]);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-red-600/10 blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl"
        >
          <div className="relative p-6 md:p-8">
            <div className="absolute -top-10 right-0 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />

            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-4 md:gap-5">
                <motion.div
                  whileHover={{ rotate: 8, scale: 1.05 }}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-orange-500 to-red-600 text-3xl shadow-lg shadow-orange-500/20"
                >
                  <FaUtensils />
                </motion.div>

                <div>
                  <div className="mb-2 inline-flex rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-orange-300">
                    Restaurant Explorer Dashboard
                  </div>

                  <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                    Explore Restaurants By City
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm md:text-base leading-7 text-zinc-400">
                    Browse restaurants city-wise, search instantly and open a
                    detailed side panel for every restaurant.
                  </p>
                </div>
              </div>

              <div className="grid w-full grid-cols-2 gap-4 sm:w-auto">
                <div className="min-w-35 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Total Restaurants
                  </p>
                  <p className="mt-2 text-3xl font-bold text-orange-300">
                    {restaurants.length}
                  </p>
                </div>

                <div className="min-w-35 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-orange-200">
                    Showing
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {filteredRestaurants.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Search + Filter */}
            <div className="mt-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative w-full xl:max-w-md">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search restaurant, city, address or food type..."
                  className="w-full rounded-2xl border border-white/10 bg-zinc-900/80 py-3 pl-12 pr-4 text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedCity("")}
                  className={`rounded-2xl border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    selectedCity === ""
                      ? "border-orange-500 bg-orange-500 text-black shadow-lg shadow-orange-500/20"
                      : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  All
                </button>

                {cities.map((city) => (
                  <button
                    key={city._id}
                    onClick={() => setSelectedCity(city._id)}
                    className={`rounded-2xl border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                      selectedCity === city._id
                        ? "border-orange-500 bg-orange-500 text-black shadow-lg shadow-orange-500/20"
                        : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <div className="max-h-[70vh] overflow-y-auto rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="sticky top-0 border-b border-white/10 bg-zinc-950/95 backdrop-blur">
                <tr>
                  <th className="px-6 py-5 text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Restaurant
                  </th>
                  <th className="hidden md:table-cell px-6 py-5 text-xs uppercase tracking-[0.2em] text-zinc-400">
                    City
                  </th>
                  <th className="hidden lg:table-cell px-6 py-5 text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Food Type
                  </th>
                  <th className="px-6 py-5 text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Cost
                  </th>
                  <th className="hidden sm:table-cell px-6 py-5 text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Status
                  </th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="animate-pulse border-b border-white/5">
                      <td className="px-6 py-5" colSpan="6">
                        <div className="h-16 rounded-2xl bg-zinc-800" />
                      </td>
                    </tr>
                  ))
                ) : filteredRestaurants.length > 0 ? (
                  filteredRestaurants.map((restaurant, index) => (
                    <motion.tr
                      key={restaurant._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      onClick={() => setSelectedRestaurant(restaurant)}
                      className="group cursor-pointer border-b border-white/5 transition-all hover:bg-orange-500/5"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={restaurant.images?.[0] || "/no-image.jpg"}
                            alt={restaurant.name}
                            className="h-14 w-14 rounded-2xl border border-white/10 object-cover"
                          />

                          <div>
                            <h3 className="font-semibold text-white transition group-hover:text-orange-300">
                              {restaurant.name}
                            </h3>
                            <p className="mt-1 text-sm text-zinc-500">
                              {restaurant.address?.slice(0, 40)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="hidden md:table-cell px-6 py-5 text-zinc-300">
                        {restaurant.city?.name || "-"}
                      </td>

                      <td className="hidden lg:table-cell px-6 py-5 text-zinc-400">
                        {restaurant.foodType || "-"}
                      </td>

                      <td className="px-6 py-5 text-orange-300 font-semibold">
                        ₹{restaurant.avgCostForOne || 0}
                      </td>

                      <td className="hidden sm:table-cell px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            restaurant.status === "active"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : restaurant.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-300"
                              : restaurant.status === "rejected"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-zinc-700 text-zinc-300"
                          }`}
                        >
                          {restaurant.status}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <FaChevronRight className="ml-auto text-zinc-500 transition group-hover:text-orange-300" />
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-20 text-center text-zinc-500">
                      No restaurants found matching your search or selected city.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Side Detail Panel */}
      <AnimatePresence>
        {selectedRestaurant && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRestaurant(null)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="fixed right-0 top-0 z-50 h-full w-full overflow-y-auto border-l border-white/10 bg-zinc-950 shadow-2xl sm:w-107.5 lg:w-130"
            >
              <div className="relative">
                <img
                  src={selectedRestaurant.images?.[0] || "/no-image.jpg"}
                  alt={selectedRestaurant.name}
                  className="h-64 w-full object-cover"
                />

                <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-transparent" />

                <button
                  onClick={() => setSelectedRestaurant(null)}
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-red-500"
                >
                  <FaTimes />
                </button>

                <div className="absolute bottom-6 left-6 right-6">
                  <span className="mb-3 inline-flex rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-300 capitalize">
                    {selectedRestaurant.status}
                  </span>

                  <h2 className="text-3xl font-bold text-white">
                    {selectedRestaurant.name}
                  </h2>

                  <p className="mt-2 text-zinc-300">
                    {selectedRestaurant.city?.name}
                  </p>
                </div>
              </div>

              <div className="space-y-6 p-6 text-zinc-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      Average Cost
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-xl font-bold text-orange-300">
                      <FaMoneyBillWave /> ₹{selectedRestaurant.avgCostForOne}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      Best Time
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-xl font-bold text-white">
                      <FaClock /> {selectedRestaurant.bestTime || "-"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold text-white">
                    Address
                  </h3>

                  <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <FaMapMarkerAlt className="mt-1 text-orange-400" />
                    <div>
                      <p>{selectedRestaurant.address}</p>

                      <a
                        href={`https://www.google.com/maps?q=${selectedRestaurant.location?.coordinates?.[1]},${selectedRestaurant.location?.coordinates?.[0]}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-sm text-orange-400 hover:text-orange-300"
                      >
                        View on Google Maps →
                      </a>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold text-white">
                    Restaurant Details
                  </h3>

                  <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-zinc-400">
                    <div className="flex justify-between gap-4">
                      <span>Food Type</span>
                      <span className="text-white">{selectedRestaurant.foodType}</span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span>Famous Food</span>
                      <span className="text-white">{selectedRestaurant.famousFood}</span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span>Opening Hours</span>
                      <span className="text-white">
                        {selectedRestaurant.openingHours?.open} - {selectedRestaurant.openingHours?.close}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedRestaurant.images?.length > 1 && (
                  <div>
                    <h3 className="mb-3 text-lg font-semibold text-white">
                      Gallery
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      {selectedRestaurant.images.slice(1).map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt="restaurant"
                          className="h-32 w-full rounded-2xl border border-white/10 object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GetAllRestaurantCityWise;