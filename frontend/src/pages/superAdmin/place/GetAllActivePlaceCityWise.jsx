import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getActivePlacesCityWise,
  inactivePlace,
} from "../../../features/user/placeSlice";
import { FaMapMarkerAlt, FaSearch, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

function GetAllActivePlaceCityWise() {
  const dispatch = useDispatch();
  const { cityWisePlaces = [], loading } = useSelector((state) => state.place);
  console.log(cityWisePlaces);

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("All");

  useEffect(() => {
    dispatch(getActivePlacesCityWise());
  }, [dispatch]);

  const handleInactivePlace = (placeId) => {
    dispatch(inactivePlace(placeId));
  };

  // Flatten places for table
  const allPlaces = useMemo(() => {
    return cityWisePlaces.flatMap((city) =>
      city.places
        .filter((place) => place.status === "active") // <-- only active
        .map((place) => ({ ...place, cityName: city.cityName }))
    );
  }, [cityWisePlaces]);

  // Filtered places
  const filteredPlaces = useMemo(() => {
    return allPlaces.filter((place) => {
      const matchesSearch =
        place.name?.toLowerCase().includes(search.toLowerCase()) ||
        place.category?.toLowerCase().includes(search.toLowerCase()) ||
        place.cityName?.toLowerCase().includes(search.toLowerCase());

      const matchesCity = cityFilter === "All" || place.cityName === cityFilter;
      return matchesSearch && matchesCity;
    });
  }, [allPlaces, search, cityFilter]);

  // City filter options
  const cityOptions = useMemo(() => {
    const uniqueCities = [
      ...new Set(allPlaces.map((p) => p.cityName).filter(Boolean)),
    ];
    return ["All", ...uniqueCities];
  }, [allPlaces]);

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-zinc-900 via-black to-zinc-950 shadow-[0_20px_80px_rgba(0,0,0,0.8)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_35%)]" />
        <div className="relative flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-lg shadow-blue-500/20 animate-pulse">
              <FaMapMarkerAlt className="text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Active Places Dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
                Manage, search, and filter active places city-wise.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
                  {filteredPlaces.length} Active Places
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
                  {cityFilter === "All" ? "Showing All Cities" : cityFilter}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search + City Filters */}
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by place name, category or city..."
            className="w-full rounded-2xl border border-white/10 bg-zinc-950 py-3 pl-12 pr-4 text-white placeholder:text-gray-500 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          {cityOptions.map((city) => (
            <button
              key={city}
              onClick={() => setCityFilter(city)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                cityFilter === city
                  ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "border-white/10 bg-zinc-950 text-gray-400 hover:border-blue-500/30 hover:text-white"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-y-scroll h-125 rounded-3xl border border-white/10 bg-zinc-950 shadow-[0_20px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                <th className="px-6 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Place
                </th>
                <th className="px-6 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Category
                </th>
                <th className="px-6 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  City
                </th>
                <th className="px-6 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Time Required
                </th>
                <th className="px-6 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, index) => (
                  <tr key={index} className="border-b border-white/5">
                    <td colSpan="5" className="px-6 py-5">
                      <div className="h-14 animate-pulse rounded-2xl bg-white/5" />
                    </td>
                  </tr>
                ))
              ) : filteredPlaces.length ? (
                filteredPlaces.map((place) => (
                  <tr
                    key={place._id}
                    onClick={() => setSelectedPlace(place)}
                    className="cursor-pointer border-b border-white/5 transition-all duration-300 hover:bg-blue-500/10"
                  >
                    <td className="px-6 py-5">
                      <h3 className="font-semibold capitalize">{place.name}</h3>
                    </td>
                    <td className="px-6 py-5 text-gray-300">{place.category}</td>
                    <td className="px-6 py-5 text-gray-300">{place.cityName}</td>
                    <td className="px-6 py-5 text-gray-300">{place.timeRequired}</td>
                    <td className="px-6 py-5 text-right flex justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInactivePlace(place._id);
                        }}
                        className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-medium text-blue-300 transition hover:bg-blue-500/20"
                      >
                        Inactive
                      </button>

                      <Link
                        to={`/superAdmin/update-place-Details/${place._id}`}
                        className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-xs font-medium text-green-300 transition hover:bg-green-500/20"
                      >
                        Update
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-gray-500">
                    No active places found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Drawer */}
      {selectedPlace && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setSelectedPlace(null)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-zinc-950 shadow-[0_0_80px_rgba(0,0,0,0.9)] animate-[slideIn_.35s_ease]">
            <div className="sticky top-0 z-10 border-b border-white/10 bg-black/90 px-6 py-5 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold capitalize text-white">{selectedPlace.name}</h2>
                  <div className="mt-2 flex items-center gap-2 text-gray-400">
                    <FaMapMarkerAlt className="text-blue-400" />
                    <span>{selectedPlace.cityName}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlace(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-gray-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">Category</p>
                  <p className="mt-2 text-lg font-semibold text-white">{selectedPlace.category}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">Time Required</p>
                  <p className="mt-2 text-lg font-semibold text-white">{selectedPlace.timeRequired}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="mb-3 text-lg font-semibold text-white">Description</h3>
                <p className="leading-7 text-gray-400">{selectedPlace.description}</p>
              </div>

              {selectedPlace.images?.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {selectedPlace.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={selectedPlace.name}
                      className="h-48 w-full rounded-3xl border border-white/10 object-cover transition duration-300 hover:scale-[1.02]"
                    />
                  ))}
                </div>
              )}

              <div className="flex gap-3 flex-col sm:flex-row">
                <button
                  onClick={() => handleInactivePlace(selectedPlace._id)}
                  className="w-full rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-500"
                >
                  Inactive Place
                </button>
                <Link
                  to={`/superAdmin/update-place-Details/${selectedPlace._id}`}
                  className="w-full rounded-2xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-500 text-center"
                >
                  Update Place
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GetAllActivePlaceCityWise;