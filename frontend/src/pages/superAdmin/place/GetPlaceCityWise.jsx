import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPlacesCityWise } from "../../../features/user/placeSlice";
import {
  FaMapMarkerAlt,
  FaSearch,
  FaTimes,
  FaChevronRight,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

function GetPlaceCityWise() {
  const dispatch = useDispatch();
  const { cityWisePlaces = [], loading } = useSelector((state) => state.place);

  const [selectedCityId, setSelectedCityId] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(getPlacesCityWise());
  }, [dispatch]);

  // Set default city
  useEffect(() => {
    if (cityWisePlaces.length > 0 && !selectedCityId) {
      setSelectedCityId(cityWisePlaces[0]._id);
    }
  }, [cityWisePlaces, selectedCityId]);

  const selectedCity = cityWisePlaces.find(
    (city) => city._id === selectedCityId
  );

  // Filtered places based on search
  const filteredPlaces = useMemo(() => {
    if (!selectedCity) return [];
    return selectedCity.places.filter((place) => {
      const searchText = search.toLowerCase();
      return (
        place.name?.toLowerCase().includes(searchText) ||
        place.category?.toLowerCase().includes(searchText)
      );
    });
  }, [selectedCity, search]);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-6 xl:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl overflow-hidden"
        >
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-4 md:gap-5">
                <motion.div
                  whileHover={{ rotate: 8, scale: 1.05 }}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 text-3xl shadow-lg shadow-cyan-500/20"
                >
                  🌍
                </motion.div>

                <div>
                  <div className="mb-2 inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-cyan-300">
                    City Wise Places
                  </div>

                  <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                    Explore All Places
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm md:text-base text-zinc-400 leading-7">
                    Browse, search, and filter all places by city in this interactive dashboard.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-4 xl:mt-0">
                <div className="relative w-full lg:w-auto">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search places by name or category..."
                    className="w-full rounded-2xl border border-white/10 bg-zinc-900/80 py-3 pl-12 pr-4 text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* City Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-6">
          {cityWisePlaces.map((city) => (
            <button
              key={city._id}
              onClick={() => setSelectedCityId(city._id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition 
                ${
                  selectedCityId === city._id
                    ? "bg-cyan-500 text-black shadow-md"
                    : "bg-white/5 text-white hover:bg-cyan-600/20"
                }`}
            >
              {city.cityName}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-y-scroll max-h-125 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>
                  <th className="px-6 py-5 text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Place
                  </th>
                  <th className="px-6 py-5 text-xs uppercase tracking-[0.2em] text-zinc-400 hidden md:table-cell">
                    Category
                  </th>
                  <th className="px-6 py-5 text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Status
                  </th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="border-b border-white/5 animate-pulse">
                      <td className="px-6 py-5 h-12 bg-zinc-800 rounded" colSpan="4" />
                    </tr>
                  ))
                ) : filteredPlaces.length > 0 ? (
                  filteredPlaces.map((place, index) => (
                    <motion.tr
                      key={place._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      onClick={() => setSelectedPlace(place)}
                      className="group cursor-pointer border-b border-white/5 transition-all hover:bg-cyan-500/5"
                    >
                      <td className="px-6 py-5">{place.name}</td>
                      <td className="px-6 py-5 hidden md:table-cell">{place.category}</td>
                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            place.status === "active"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : place.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {place.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <FaChevronRight className="ml-auto text-zinc-500 group-hover:text-cyan-300 transition" />
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-20 text-center text-zinc-500">
                      No places found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Detail Panel */}
        <AnimatePresence>
          {selectedPlace && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPlace(null)}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              />

              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 240 }}
                className="fixed right-0 top-0 z-50 h-full w-full sm:w-105 lg:w-130 overflow-y-auto border-l border-white/10 bg-zinc-950 shadow-2xl"
              >
                <div className="relative p-6">
                  <button
                    onClick={() => setSelectedPlace(null)}
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-red-500 transition"
                  >
                    <FaTimes />
                  </button>

                  <h2 className="text-3xl font-bold text-white mb-4">
                    {selectedPlace.name}
                  </h2>

                  <p className="text-zinc-400 mb-2">
                    <strong>Category:</strong> {selectedPlace.category}
                  </p>

                  <p className="text-zinc-400 mb-2">
                    <strong>Description:</strong> {selectedPlace.description}
                  </p>

                  <p className="text-zinc-400 mb-2">
                    <strong>Time Required:</strong> {selectedPlace.timeRequired}
                  </p>

                  <p className="text-zinc-400 mb-2">
                    <strong>Entry Fees:</strong> ₹{selectedPlace.entryfees}
                  </p>

                  <p className="text-zinc-400 mb-2">
                    <strong>Status:</strong>{" "}
                    <span
                      className={`font-semibold ${
                        selectedPlace.status === "active"
                          ? "text-green-500"
                          : selectedPlace.status === "pending"
                          ? "text-yellow-500"
                          : "text-red-500"
                      }`}
                    >
                      {selectedPlace.status}
                    </span>
                  </p>

                  {selectedPlace.images?.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {selectedPlace.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt="place"
                          className="h-40 w-full object-cover rounded-xl"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default GetPlaceCityWise;