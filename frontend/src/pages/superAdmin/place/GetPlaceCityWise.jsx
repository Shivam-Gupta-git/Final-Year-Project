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

  const activeCityId = selectedCityId || (cityWisePlaces.length > 0 ? cityWisePlaces[0]._id : null);

  const selectedCity = cityWisePlaces.find(
    (city) => city._id === activeCityId
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
<div className="min-h-screen relative overflow-hidden bg-linear-to-br from-gray-50 via-gray-100 to-gray-50 text-gray-900">
  {/* Background Glow */}
  <div className="fixed inset-0 pointer-events-none">
    <div className="absolute top-0 left-1/4 h-80 w-80 rounded-full bg-cyan-100/30 blur-3xl" />
    <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl" />
  </div>

  <div className="relative z-10 p-4 sm:p-6 xl:p-8">
    {/* Header */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 rounded-3xl border border-gray-200 bg-white shadow-lg overflow-hidden hover:shadow-2xl transition-all"
    >
      <div className="relative p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4 md:gap-5">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.05 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-400 to-blue-500 text-3xl shadow-lg shadow-cyan-200/40"
            >
              🌍
            </motion.div>

            <div>
              <div className="mb-2 inline-flex rounded-full border border-cyan-200 bg-cyan-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-cyan-600">
                City Wise Places
              </div>

              <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                Explore All Places
              </h1>

              <p className="mt-3 max-w-2xl text-sm md:text-base text-gray-500 leading-7">
                Browse, search, and filter all places by city in this interactive dashboard.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-4 xl:mt-0">
            <div className="relative w-full lg:w-auto">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search places by name or category..."
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
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
          className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 
            ${
              selectedCityId === city._id
                ? "bg-cyan-500 text-white shadow-md"
                : "bg-white/50 text-gray-900 hover:bg-cyan-100 hover:text-cyan-700"
            }`}
        >
          {city.cityName}
        </button>
      ))}
    </div>

    {/* Table */}
    <div className="overflow-y-auto max-h-125 rounded-3xl border border-gray-200 bg-white shadow-lg p-4 transition-all hover:shadow-2xl">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-5 text-xs uppercase tracking-[0.2em] text-gray-500">
                Place
              </th>
              <th className="px-4 sm:px-6 py-5 text-xs uppercase tracking-[0.2em] text-gray-500 hidden md:table-cell">
                Category
              </th>
              <th className="px-4 sm:px-6 py-5 text-xs uppercase tracking-[0.2em] text-gray-500">
                Status
              </th>
              <th className="px-4 sm:px-6 py-5"></th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100 animate-pulse">
                  <td className="px-4 sm:px-6 py-5 h-12 bg-gray-200 rounded" colSpan="4" />
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
                  className="group cursor-pointer border-b border-gray-100 transition-all hover:bg-cyan-50"
                >
                  <td className="px-4 sm:px-6 py-5">{place.name}</td>
                  <td className="px-4 sm:px-6 py-5 hidden md:table-cell">{place.category}</td>
                  <td className="px-4 sm:px-6 py-5">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        place.status === "active"
                          ? "bg-emerald-200 text-emerald-600"
                          : place.status === "pending"
                          ? "bg-yellow-200 text-yellow-600"
                          : "bg-red-200 text-red-600"
                      }`}
                    >
                      {place.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-5 text-right">
                    <FaChevronRight className="ml-auto text-gray-400 group-hover:text-cyan-500 transition" />
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-20 text-center text-gray-500">
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
            className="fixed inset-0 z-40 bg-gray-300/30 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed right-0 top-0 z-50 h-full w-full sm:w-105 lg:w-130 overflow-y-auto border-l border-gray-200 bg-white shadow-lg"
          >
            <div className="relative p-6">
              <button
                onClick={() => setSelectedPlace(null)}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 hover:bg-red-400 transition"
              >
                <FaTimes className="text-gray-700" />
              </button>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">{selectedPlace.name}</h2>

              <p className="text-gray-600 mb-2">
                <strong>Category:</strong> {selectedPlace.category}
              </p>

              <p className="text-gray-600 mb-2">
                <strong>Description:</strong> {selectedPlace.description}
              </p>

              <p className="text-gray-600 mb-2">
                <strong>Time Required:</strong> {selectedPlace.timeRequired}
              </p>

              <p className="text-gray-600 mb-2">
                <strong>Entry Fees:</strong> ₹{selectedPlace.entryfees}
              </p>

              <p className="text-gray-600 mb-2">
                <strong>Status:</strong>{" "}
                <span
                  className={`font-semibold ${
                    selectedPlace.status === "active"
                      ? "text-green-600"
                      : selectedPlace.status === "pending"
                      ? "text-yellow-600"
                      : "text-red-600"
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
                      className="h-40 w-full object-cover rounded-xl transition hover:scale-105"
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