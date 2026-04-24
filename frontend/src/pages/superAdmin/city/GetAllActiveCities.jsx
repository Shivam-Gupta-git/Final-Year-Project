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
<div className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900 sm:px-6 lg:px-8">
  {/* Header */}
  <div className="relative mb-8 overflow-hidden rounded-3xl border border-gray-200 bg-linear-to-br from-white to-gray-100 shadow-lg shadow-gray-300">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_35%)]" />

    <div className="relative flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-300/40 bg-blue-100 text-blue-500 shadow-md animate-pulse">
          <FaCity className="text-3xl" />
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Active Cities Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            Hi {superAdmin?.userName}, manage, search and filter your active cities with a modern dashboard.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <div className="rounded-full border border-blue-300/40 bg-blue-100 px-4 py-2 text-sm text-blue-500">
              {filteredCities.length} Active Cities
            </div>

            <div className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600">
              {activeFilter === "All" ? "Showing All States" : activeFilter}
            </div>
          </div>
        </div>
      </div>

      <Link
        to="/superAdmin/createCity"
        className="inline-flex items-center justify-center rounded-2xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-blue-400 hover:shadow-md"
      >
        + Create City
      </Link>
    </div>
  </div>

  {/* Search + Filters */}
  <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
    <div className="relative w-full xl:max-w-md">
      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search city, state or country..."
        className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 outline-none transition-all duration-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
      />
    </div>

    <div className="flex flex-wrap gap-3">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => setActiveFilter(filter)}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
            activeFilter === filter
              ? "border-blue-400 bg-blue-500 text-white shadow-md"
              : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-500 hover:shadow-sm"
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  </div>

  {/* Table */}
  <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-md backdrop-blur-sm">
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead className="border-b border-gray-200 bg-gray-100">
          <tr>
            <th className="px-6 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">City</th>
            <th className="px-6 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">State</th>
            <th className="px-6 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Country</th>
            <th className="px-6 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Budget</th>
            <th className="px-6 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Best Time</th>
            <th className="px-6 py-5 text-right text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Action</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            [...Array(6)].map((_, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td colSpan="6" className="px-6 py-5">
                  <div className="h-14 animate-pulse rounded-2xl bg-gray-100" />
                </td>
              </tr>
            ))
          ) : filteredCities.length ? (
            filteredCities.map((city) => (
              <tr
                key={city._id}
                onClick={() => setSelectedCity(city)}
                className="cursor-pointer border-b border-gray-100 transition-all duration-300 hover:bg-blue-50"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <img
                      src={city.images?.[0]}
                      alt={city.name}
                      className="h-14 w-14 rounded-2xl border border-gray-200 object-cover transition-all duration-300 hover:scale-105"
                    />
                    <div>
                      <h3 className="font-semibold capitalize text-gray-900">{city.name}</h3>
                      <p className="mt-1 max-w-xs truncate text-xs text-gray-500">{city.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-gray-700">{city.state}</td>
                <td className="px-6 py-5 text-sm text-gray-700">{city.country}</td>
                <td className="px-6 py-5 text-sm font-semibold text-blue-500">{city.avgDailyBudget}/day</td>
                <td className="px-6 py-5 text-sm text-gray-700">{city.bestTimeToVisit}</td>
                <td className="px-6 py-5 text-right">
                  <button className="rounded-xl border border-blue-300 bg-blue-100 px-4 py-2 text-xs font-medium text-blue-500 transition hover:bg-blue-200 hover:shadow-md">
                    View Details
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-6 py-16 text-center text-gray-500">
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
    <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={() => setSelectedCity(null)} />
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto border-l border-gray-200 bg-white shadow-lg animate-slideIn">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-5 backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold capitalize text-gray-900">{selectedCity.name}</h2>
              <div className="mt-2 flex items-center gap-2 text-gray-600">
                <FaMapMarkerAlt className="text-blue-500" />
                <span>{selectedCity.state}, {selectedCity.country}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedCity(null)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:border-red-400 hover:bg-red-100 hover:text-red-500"
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
                className="h-48 w-full rounded-3xl border border-gray-200 object-cover transition duration-300 hover:scale-105"
              />
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-xs uppercase tracking-wider text-gray-500">Daily Budget</p>
              <p className="mt-3 text-2xl font-bold text-blue-500">{selectedCity.avgDailyBudget}</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-xs uppercase tracking-wider text-gray-500">Best Time To Visit</p>
              <p className="mt-3 text-2xl font-bold text-gray-900">{selectedCity.bestTimeToVisit}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-xs uppercase tracking-wider text-gray-500">State</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">{selectedCity.state}</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-xs uppercase tracking-wider text-gray-500">Country</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">{selectedCity.country}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">Description</h3>
            <p className="leading-7 text-gray-600">{selectedCity.description}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Famous For</h3>
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(selectedCity.famousFor) ? selectedCity.famousFor : [selectedCity.famousFor]).map((item, index) => (
                <span key={index} className="rounded-full border border-blue-300 bg-blue-100 px-3 py-1 text-sm text-blue-500">{item}</span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row">
            <Link
              to={`/superAdmin/updateCityDetails/${selectedCity._id}`}
              className="flex-1 rounded-2xl bg-blue-500 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-400"
            >
              Update City
            </Link>

            <button
              onClick={() => handelInactiveCity(selectedCity._id)}
              disabled={loading}
              className="flex-1 rounded-2xl bg-red-500 px-5 py-3 font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
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