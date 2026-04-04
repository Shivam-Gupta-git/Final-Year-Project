import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  approvePlaceById,
  getPendingPlaces,
  rejectePlaceById,
} from "../../../features/user/placeSlice";
import {
  FaCompass,
  FaSearch,
  FaCheck,
  FaTimes,
  FaMapMarkerAlt,
  FaArrowRight,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

function SuperAdminApprovealPlaceList() {
  const dispatch = useDispatch();
  const { places = [], loading } = useSelector((state) => state.place);

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");

  useEffect(() => {
    dispatch(getPendingPlaces());
  }, [dispatch]);

  const handleApprove = (e, id) => {
    e.stopPropagation();
    dispatch(approvePlaceById(id));
  };

  const handleReject = (e, id) => {
    e.stopPropagation();
    dispatch(rejectePlaceById(id));
  };

  const cities = useMemo(() => {
    const uniqueCities = [
      ...new Set(
        places
          ?.map((place) => place.city?.name)
          .filter((name) => typeof name === "string" && name?.trim() !== "")
      ),
    ];
    return ["All", ...uniqueCities];
  }, [places]);

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      const matchesSearch =
        place?.name?.toLowerCase().includes(search.toLowerCase()) ||
        place?.category?.toLowerCase().includes(search.toLowerCase());
      const matchesCity =
        selectedCity === "All" || place.city === selectedCity;
      return matchesSearch && matchesCity;
    });
  }, [places, search, selectedCity]);

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-8 py-6 overflow-hidden">
      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-cyan-500/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-600/10 blur-3xl rounded-full" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-8 overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-zinc-950 via-zinc-900 to-black p-6 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
      >
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 text-3xl shadow-lg shadow-cyan-500/20">
              <FaCompass />
            </div>

            <div>
              <div className="mb-2 inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-300">
                Place Approval Panel
              </div>

              <h1 className="text-3xl md:text-5xl font-bold">
                Pending Place Approvals
              </h1>

              <p className="mt-4 max-w-2xl text-sm md:text-base text-zinc-400 leading-7">
                Review, approve or reject pending places from one interactive dashboard.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Total Pending
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {filteredPlaces.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                    Current Filter
                  </p>
                  <p className="mt-1 text-lg font-semibold text-cyan-100">
                    {selectedCity}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="w-full xl:w-95 space-y-4">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search place or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white placeholder:text-zinc-500 outline-none backdrop-blur-xl transition focus:border-cyan-500/50 focus:bg-white/10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    selectedCity === city
                      ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                      : "border border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                <th className="px-6 py-5 text-sm font-semibold text-zinc-300">
                  Place
                </th>
                <th className="px-6 py-5 text-sm font-semibold text-zinc-300">
                  City
                </th>
                <th className="px-6 py-5 text-sm font-semibold text-zinc-300">
                  Category
                </th>
                <th className="px-6 py-5 text-sm font-semibold text-zinc-300">
                  Status
                </th>
                <th className="px-6 py-5 text-sm font-semibold text-zinc-300 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredPlaces.length > 0 ? (
                filteredPlaces.map((place, index) => (
                  <motion.tr
                    key={place._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => setSelectedPlace(place)}
                    className="group cursor-pointer border-b border-white/5 transition hover:bg-white/5"
                  >
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-semibold text-white group-hover:text-cyan-300 transition">
                          {place.city?.name || "-"}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-zinc-300">{place.city?.state || "-"}</td>
                    <td className="px-6 py-5 text-zinc-300">{place.category}</td>

                    <td className="px-6 py-5">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        place.status === "active"
                          ? "bg-green-600/20 text-green-400"
                          : place.status === "pending"
                          ? "bg-yellow-600/20 text-yellow-400"
                          : "bg-red-600/20 text-red-400"
                      }`}>
                        {place.status}
                      </span>
                    </td>

                    <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => handleApprove(e, place._id)}
                          disabled={loading}
                          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
                        >
                          <FaCheck />
                          Approve
                        </button>

                        <button
                          onClick={(e) => handleReject(e, place._id)}
                          disabled={loading}
                          className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                        >
                          <FaTimes />
                          Reject
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-zinc-500">
                    No places found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

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
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 z-50 h-full w-full sm:w-125 overflow-y-auto border-l border-white/10 bg-zinc-950 p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-2 inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-300">
                    Place Details
                  </div>
                  <h2 className="text-3xl font-bold">{selectedPlace.name}</h2>
                </div>

                <button
                  onClick={() => setSelectedPlace(null)}
                  className="rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="mt-6 space-y-5 text-zinc-400">
                <p><strong>Category:</strong> {selectedPlace.category}</p>
                <p><strong>City:</strong> {selectedPlace.city}</p>
                <p><strong>Entry Fee:</strong> ₹{selectedPlace.entryfees}</p>
                <p><strong>Time Required:</strong> {selectedPlace.timeRequired}</p>
                <p><strong>Best Time:</strong> {selectedPlace.bestTimeToVisit}</p>
                <p><strong>Popular:</strong> {selectedPlace.isPopular ? "Yes" : "No"}</p>
                <p><strong>Status:</strong> {selectedPlace.status}</p>
                <p><strong>Description:</strong> {selectedPlace.description}</p>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    onClick={(e) => handleApprove(e, selectedPlace._id)}
                    className="rounded-2xl bg-emerald-500 py-4 font-semibold text-white transition hover:bg-emerald-600"
                  >
                    Approve Place
                  </button>
                  <button
                    onClick={(e) => handleReject(e, selectedPlace._id)}
                    className="rounded-2xl bg-red-500 py-4 font-semibold text-white transition hover:bg-red-600"
                  >
                    Reject Place
                  </button>
                </div>
              </div>

              {selectedPlace.images?.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {selectedPlace.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="place"
                      className="w-full h-40 object-cover rounded-xl"
                    />
                  ))}
                </div>
              )}

              {selectedPlace.location?.coordinates && (
                <a
                  href={`https://www.google.com/maps?q=${selectedPlace.location.coordinates[1]},${selectedPlace.location.coordinates[0]}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-cyan-500 to-blue-600 px-5 py-4 font-semibold text-white transition hover:scale-[1.02]"
                >
                  <FaMapMarkerAlt />
                  Open in Google Maps
                  <FaArrowRight className="text-sm" />
                </a>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SuperAdminApprovealPlaceList;