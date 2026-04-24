import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  approveCityById,
  deleteCity,
  getAllInactiveCities,
} from "../../../features/user/citySlice";
import {
  FaCity,
  FaSearch,
  FaCheckCircle,
  FaTrash,
  FaChevronRight,
  FaTimes,
  FaMapMarkerAlt,
} from "react-icons/fa";

function GetAllInactiveCities() {
  const dispatch = useDispatch();

  const [selectedCity, setSelectedCity] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("All");

  const { cities = [], loading } = useSelector((state) => state.city);

  useEffect(() => {
    dispatch(getAllInactiveCities());
  }, [dispatch]);

  const handleActivateButton = (cityId) => {
    dispatch(approveCityById(cityId));
  };

  const handleDeleteCityButton = (cityId) => {
    dispatch(deleteCity(cityId));
  };

  const stateFilters = useMemo(() => {
    const uniqueStates = [
      ...new Set(
        cities
          .map((city) => city.state)
          .filter((state) => state && state.trim() !== "")
      ),
    ];

    return ["All", ...uniqueStates];
  }, [cities]);

  const filteredCities = useMemo(() => {
    return cities.filter((city) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        city.name?.toLowerCase().includes(search) ||
        city.state?.toLowerCase().includes(search) ||
        city.country?.toLowerCase().includes(search);

      const matchesState =
        selectedState === "All" || city.state === selectedState;

      return matchesSearch && matchesState;
    });
  }, [cities, searchTerm, selectedState]);

  return (
<div className="min-h-screen bg-linear-to-b from-white via-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8 text-gray-900 relative overflow-hidden">
  {/* Background Effects */}
  <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200/30 blur-3xl rounded-full animate-blob"></div>
  <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-200/30 blur-3xl rounded-full animate-blob animation-delay-2000"></div>

  <div className="mx-auto max-w-7xl space-y-6 relative z-10">
    {/* Header */}
    <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xl transition-all duration-500 hover:shadow-2xl">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-100 to-blue-200 border border-blue-200 shadow-md animate-pulse">
              <FaCity className="text-2xl text-blue-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-pink-500">
                Inactive Cities Dashboard
              </h1>
              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                Manage all inactive cities with search, filters and actions.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 shadow-sm hover:shadow-md transition-all duration-300">
              <p className="text-xs uppercase tracking-widest text-gray-400">
                Total Cities
              </p>
              <h3 className="mt-2 text-3xl font-bold text-gray-900">{cities.length}</h3>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 shadow-sm hover:shadow-md transition-all duration-300">
              <p className="text-xs uppercase tracking-widest text-blue-500">
                Showing
              </p>
              <h3 className="mt-2 text-3xl font-bold text-blue-600">{filteredCities.length}</h3>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="w-full xl:max-w-md">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search city, state or country..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
      </div>
    </div>

    {/* State Filters */}
    <div className="flex flex-wrap gap-3">
      {stateFilters.map((state) => (
        <button
          key={state}
          type="button"
          onClick={() => setSelectedState(state)}
          className={`rounded-2xl border px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
            selectedState === state
              ? "border-blue-500 bg-blue-100 text-blue-700 shadow-md"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          {state}
        </button>
      ))}
    </div>

    {/* Content */}
    {loading ? (
      <div className="flex min-h-87.5 items-center justify-center rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" />
      </div>
    ) : filteredCities.length === 0 ? (
      <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-20 text-center shadow-sm">
        <FaCity className="mx-auto mb-4 text-5xl text-gray-400" />
        <h2 className="text-2xl font-semibold text-gray-900">
          No inactive cities found
        </h2>
        <p className="mt-2 text-gray-500">
          Try changing the search text or selected state.
        </p>
      </div>
    ) : (
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl transition-all duration-300 hover:shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-237.5 w-full">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  City
                </th>
                <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  State
                </th>
                <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Country
                </th>
                <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Budget
                </th>
                <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Status
                </th>
                <th className="px-6 py-5 text-right text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredCities.map((city) => (
                <tr
                  key={city._id}
                  className="border-b border-gray-200 transition-all duration-300 hover:bg-gray-50"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <img
                        src={city.images?.[0] || "https://via.placeholder.com/80"}
                        alt={city.name}
                        className="h-14 w-14 rounded-2xl border border-gray-200 object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div>
                        <h3 className="text-base font-semibold capitalize text-gray-900">
                          {city.name}
                        </h3>
                        <p className="mt-1 max-w-62.5 truncate text-sm text-gray-500">
                          {city.description || "No description available"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-gray-700">{city.state}</td>
                  <td className="px-6 py-5 text-gray-700">{city.country}</td>
                  <td className="px-6 py-5 text-gray-700">
                    {city.avgDailyBudget || 0}/day
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      Inactive
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleActivateButton(city._id)}
                        className="inline-flex items-center rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-500"
                      >
                        <FaCheckCircle className="mr-2" />
                        Activate
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCityButton(city._id)}
                        className="inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
                      >
                        <FaTrash className="mr-2" />
                        Delete
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedCity(city)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
                      >
                        <FaChevronRight />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* Side Panel */}
    {selectedCity && (
      <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/50 backdrop-blur-sm transition-all duration-300">
        <div className="h-full w-full max-w-md overflow-y-auto border-l border-gray-200 bg-white p-6 shadow-2xl">
          <div className="mb-6 flex items-center justify-between mt-15">
            <h2 className="text-2xl font-bold text-gray-900">City Details</h2>

            <button
              type="button"
              onClick={() => setSelectedCity(null)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <FaTimes />
            </button>
          </div>

          <img
            src={selectedCity.images?.[0] || "https://via.placeholder.com/600x300"}
            alt={selectedCity.name}
            className="mb-5 h-56 w-full rounded-2xl object-cover transition-transform duration-300 hover:scale-105"
          />

          <h3 className="text-3xl font-bold capitalize text-gray-900">
            {selectedCity.name}
          </h3>

          <div className="mt-3 flex items-center gap-2 text-gray-500">
            <FaMapMarkerAlt className="text-blue-500" />
            <span>
              {selectedCity.state}, {selectedCity.country}
            </span>
          </div>

          <p className="mt-5 leading-7 text-gray-700">
            {selectedCity.description || "No description available"}
          </p>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
            <p className="text-sm text-gray-500">Average Daily Budget</p>
            <h4 className="mt-2 text-2xl font-bold text-blue-600">
              ₹{selectedCity.avgDailyBudget || 0}/day
            </h4>
          </div>
        </div>
      </div>
    )}
  </div>

  {/* Blob Animation */}
  <style>{`
    @keyframes blob {
      0%, 100% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(20px, -10px) scale(1.05); }
      66% { transform: translate(-20px, 10px) scale(0.95); }
    }
    .animate-blob { animation: blob 8s infinite; }
    .animation-delay-2000 { animation-delay: 2s; }
  `}</style>
</div>
  );
}

export default GetAllInactiveCities;