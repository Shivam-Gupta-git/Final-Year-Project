// components/city/GetActiveCities.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getActiveCities,
  inactiveCity,
} from "../../../features/user/citySlice";
import { Link } from "react-router-dom";
import {
  FaCity,
  FaMapMarkerAlt,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

function GetAllActiveCities() {
  const dispatch = useDispatch();

  const [selectedCity, setSelectedCity] = useState(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const { cities = [], loading } = useSelector((state) => state.city);
  const { superAdmin } = useSelector((state) => state.superAdmin);

  useEffect(() => {
    dispatch(getActiveCities());
  }, [dispatch]);

  const handelInactiveCity = (cityId) => {
    dispatch(inactiveCity(cityId));
  };

  const filters = useMemo(() => {
    const uniqueStates = [
      ...new Set(cities.map((city) => city.state).filter(Boolean)),
    ];

    return ["All", ...uniqueStates];
  }, [cities]);

  const filteredCities = useMemo(() => {
    return cities.filter((city) => {
      const query = search.toLowerCase();

      const matchesSearch =
        city.name?.toLowerCase().includes(query) ||
        city.state?.toLowerCase().includes(query) ||
        city.country?.toLowerCase().includes(query);

      const matchesFilter =
        activeFilter === "All" || city.state === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [cities, search, activeFilter]);

  return (
    <div className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      {/* Header */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-zinc-900 via-black to-zinc-950 shadow-[0_20px_80px_rgba(0,0,0,0.8)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_35%)]" />

        <div className="relative flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-lg shadow-blue-500/20 animate-pulse">
              <FaCity className="text-3xl" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Active Cities Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
                Hi {superAdmin?.userName}, manage, search and filter your active
                cities with a modern dashboard.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
                  {filteredCities.length} Active Cities
                </div>

                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
                  {activeFilter === "All"
                    ? "Showing All States"
                    : activeFilter}
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/superAdmin/createCity"
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30"
          >
            + Create City
          </Link>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search city, state or country..."
            className="w-full rounded-2xl border border-white/10 bg-zinc-950 py-3 pl-12 pr-4 text-white placeholder:text-gray-500 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                activeFilter === filter
                  ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "border-white/10 bg-zinc-950 text-gray-400 hover:border-blue-500/30 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-[0_20px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                <th className="px-6 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  City
                </th>
                <th className="px-6 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  State
                </th>
                <th className="px-6 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Country
                </th>
                <th className="px-6 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Budget
                </th>
                <th className="px-6 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Best Time
                </th>
                <th className="px-6 py-5 text-right text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                [...Array(6)].map((_, index) => (
                  <tr key={index} className="border-b border-white/5">
                    <td colSpan="6" className="px-6 py-5">
                      <div className="h-14 animate-pulse rounded-2xl bg-white/5" />
                    </td>
                  </tr>
                ))
              ) : filteredCities.length ? (
                filteredCities.map((city) => (
                  <tr
                    key={city._id}
                    onClick={() => setSelectedCity(city)}
                    className="cursor-pointer border-b border-white/5 transition-all duration-300 hover:bg-blue-500/10"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <img
                          src={city.images?.[0]}
                          alt={city.name}
                          className="h-14 w-14 rounded-2xl border border-white/10 object-cover"
                        />

                        <div>
                          <h3 className="font-semibold capitalize text-white">
                            {city.name}
                          </h3>
                          <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                            {city.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-300">
                      {city.state}
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-300">
                      {city.country}
                    </td>

                    <td className="px-6 py-5 text-sm font-semibold text-blue-400">
                      ₹{city.avgDailyBudget}/day
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-300">
                      {city.bestTimeToVisit}
                    </td>

                    <td className="px-6 py-5 text-right">
                      <button className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-medium text-blue-300 transition hover:bg-blue-500/20">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-16 text-center text-gray-500"
                  >
                    No active cities found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Drawer */}
      {selectedCity && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedCity(null)}
          />

          <div className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-zinc-950 shadow-[0_0_80px_rgba(0,0,0,0.9)] animate-[slideIn_.35s_ease]">
            <div className="sticky top-0 z-10 border-b border-white/10 bg-black/90 px-6 py-5 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold capitalize text-white">
                    {selectedCity.name}
                  </h2>

                  <div className="mt-2 flex items-center gap-2 text-gray-400">
                    <FaMapMarkerAlt className="text-blue-400" />
                    <span>
                      {selectedCity.state}, {selectedCity.country}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCity(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-gray-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedCity.images?.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={selectedCity.name}
                    className="h-48 w-full rounded-3xl border border-white/10 object-cover transition duration-300 hover:scale-[1.02]"
                  />
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Daily Budget
                  </p>
                  <p className="mt-3 text-2xl font-bold text-blue-400">
                    ₹{selectedCity.avgDailyBudget}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Best Time To Visit
                  </p>
                  <p className="mt-3 text-2xl font-bold text-white">
                    {selectedCity.bestTimeToVisit}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    State
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {selectedCity.state}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Country
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {selectedCity.country}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="mb-3 text-lg font-semibold text-white">
                  Description
                </h3>
                <p className="leading-7 text-gray-400">
                  {selectedCity.description}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="mb-4 text-lg font-semibold text-white">
                  Famous For
                </h3>

                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(selectedCity.famousFor)
                    ? selectedCity.famousFor
                    : [selectedCity.famousFor]
                  ).map((item, index) => (
                    <span
                      key={index}
                      className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm text-blue-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row">
                <Link
                  to={`/superAdmin/updateCityDetails/${selectedCity._id}`}
                  className="flex-1 rounded-2xl bg-blue-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-500"
                >
                  Update City
                </Link>

                <button
                  onClick={() => handelInactiveCity(selectedCity._id)}
                  disabled={loading}
                  className="flex-1 rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Inactive City"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GetAllActiveCities;