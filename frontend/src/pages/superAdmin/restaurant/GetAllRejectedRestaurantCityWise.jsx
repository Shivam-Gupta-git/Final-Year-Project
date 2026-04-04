import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteRestaurant,
  getAllRejectedRestaurantCityWise,
} from "../../../features/user/restaurantSlice";
import { getActiveCities } from "../../../features/user/citySlice";
import {
  FaUtensils,
  FaSearch,
  FaTrash,
  FaChevronRight,
  FaTimes,
  FaMapMarkerAlt,
  FaCity,
} from "react-icons/fa";

function GetAllRejectedRestaurantCityWise() {
  const dispatch = useDispatch();

  const { restaurants = [], loading } = useSelector(
    (state) => state.restaurant
  );
  const { cities = [] } = useSelector((state) => state.city);

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");

  useEffect(() => {
    dispatch(getActiveCities());
    dispatch(getAllRejectedRestaurantCityWise({ city: "", page: 1 }));
  }, [dispatch]);

  const handleDelete = (e, id) => {
    e.stopPropagation();
    dispatch(deleteRestaurant(id));
  };

  const cityFilters = useMemo(() => {
    const cityNames = [
      ...new Set(
        restaurants
          .map((restaurant) => {
            if (restaurant.city?.name) return restaurant.city.name;
            if (typeof restaurant.city === "string") return restaurant.city;
            return null;
          })
          .filter(Boolean)
      ),
    ];

    return ["All", ...cityNames];
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const cityName =
        restaurant.city?.name ||
        (typeof restaurant.city === "string" ? restaurant.city : "");

      const search = searchTerm.toLowerCase();

      const matchesSearch =
        restaurant.name?.toLowerCase().includes(search) ||
        restaurant.address?.toLowerCase().includes(search) ||
        cityName?.toLowerCase().includes(search) ||
        restaurant.foodType?.toLowerCase().includes(search);

      const matchesCity =
        selectedCity === "All" || cityName === selectedCity;

      return matchesSearch && matchesCity;
    });
  }, [restaurants, searchTerm, selectedCity]);

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-8 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15),transparent_50%)] pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 animate-pulse">
                  <FaUtensils className="text-2xl text-orange-400" />
                </div>

                <div>
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Rejected Restaurants Dashboard
                  </h1>

                  <p className="mt-2 text-sm text-zinc-400 sm:text-base">
                    Manage rejected restaurants with search, filters, and quick actions.
                  </p>
                </div>
              </div>

              {/* STATS */}
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4 transition hover:border-orange-500/30">
                  <p className="text-xs uppercase tracking-widest text-zinc-500">
                    Total Restaurants
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-white">
                    {restaurants.length}
                  </h3>
                </div>

                <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 px-5 py-4">
                  <p className="text-xs uppercase tracking-widest text-orange-300">
                    Showing
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-orange-400">
                    {filteredRestaurants.length}
                  </h3>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4 transition hover:border-orange-500/30">
                  <p className="text-xs uppercase tracking-widest text-zinc-500">
                    Cities
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-white">
                    {cityFilters.length - 1}
                  </h3>
                </div>
              </div>
            </div>

            {/* SEARCH */}
            <div className="w-full xl:max-w-md">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search restaurant, food type, address..."
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 py-4 pl-12 pr-4 text-white placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CITY FILTERS */}
        <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex min-w-max gap-3">
            {cityFilters.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  selectedCity === city
                    ? "border-orange-500 bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                    : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800"
                }`}
              >
                <FaCity className="text-xs" />
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="flex min-h-100 items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-950">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-zinc-700 border-t-orange-500" />
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950 px-6 py-20 text-center">
            <FaUtensils className="mx-auto mb-4 text-5xl text-zinc-600" />

            <h2 className="text-2xl font-semibold text-white">
              No rejected restaurants found
            </h2>

            <p className="mt-2 text-zinc-500">
              Try changing the search text or selected city.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-zinc-900">
                  <tr className="border-b border-zinc-800">
                    <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Restaurant
                    </th>

                    <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      City
                    </th>

                    <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Food Type
                    </th>

                    <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Address
                    </th>

                    <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Status
                    </th>

                    <th className="px-6 py-5 text-right text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRestaurants.map((restaurant, index) => {
                    const cityName =
                      restaurant.city?.name ||
                      (typeof restaurant.city === "string"
                        ? restaurant.city
                        : "N/A");

                    return (
                      <tr
                        key={restaurant._id}
                        className={`border-b border-zinc-800 transition-all duration-300 hover:bg-zinc-900/70 ${
                          index % 2 === 0 ? "bg-zinc-950" : "bg-zinc-900/20"
                        }`}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <img
                              src={
                                restaurant.images?.[0] ||
                                "https://via.placeholder.com/80"
                              }
                              alt={restaurant.name}
                              className="h-14 w-14 rounded-2xl border border-zinc-700 object-cover"
                            />

                            <div>
                              <h3 className="text-base font-semibold capitalize text-white">
                                {restaurant.name}
                              </h3>

                              <p className="mt-1 text-xs text-zinc-500">
                                ₹{restaurant.avgCostForOne || 0} / person
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-zinc-300">
                          {cityName}
                        </td>

                        <td className="px-6 py-5 text-zinc-300">
                          {restaurant.foodType || "N/A"}
                        </td>

                        <td className="max-w-60 px-6 py-5 text-zinc-300 truncate">
                          {restaurant.address || "N/A"}
                        </td>

                        <td className="px-6 py-5">
                          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                            <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                            Rejected
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={(e) =>
                                handleDelete(e, restaurant._id)
                              }
                              className="inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
                            >
                              <FaTrash className="mr-2" />
                              Delete
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedRestaurant(restaurant)
                              }
                              className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                            >
                              <FaChevronRight />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SIDE PANEL */}
        {selectedRestaurant && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
            <div className="h-full w-full max-w-xl overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-[slideIn_.35s_ease]">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Restaurant Details
                </h2>

                <button
                  type="button"
                  onClick={() => setSelectedRestaurant(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>

              <img
                src={
                  selectedRestaurant.images?.[0] ||
                  "https://via.placeholder.com/600x300"
                }
                alt={selectedRestaurant.name}
                className="mb-5 h-60 w-full rounded-2xl object-cover border border-zinc-800"
              />

              <h3 className="text-3xl font-bold capitalize text-white">
                {selectedRestaurant.name}
              </h3>

              <div className="mt-3 flex items-center gap-2 text-zinc-400">
                <FaMapMarkerAlt className="text-orange-400" />
                <span>
                  {selectedRestaurant.city?.name || "N/A"},{" "}
                  {selectedRestaurant.address}
                </span>
              </div>

              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <p className="text-sm text-zinc-500">Food Type</p>
                  <h4 className="mt-2 text-xl font-semibold text-white">
                    {selectedRestaurant.foodType || "N/A"}
                  </h4>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <p className="text-sm text-zinc-500">Famous Food</p>
                  <h4 className="mt-2 text-xl font-semibold text-white">
                    {selectedRestaurant.famousFood || "N/A"}
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                    <p className="text-sm text-zinc-500">Average Cost</p>
                    <h4 className="mt-2 text-xl font-semibold text-orange-400">
                      ₹{selectedRestaurant.avgCostForOne || 0}
                    </h4>
                  </div>

                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                    <p className="text-sm text-red-300">Status</p>
                    <h4 className="mt-2 text-xl font-bold text-red-400">
                      Rejected
                    </h4>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <p className="text-sm text-zinc-500">Best Time</p>
                  <h4 className="mt-2 text-lg text-white">
                    {selectedRestaurant.bestTime || "N/A"}
                  </h4>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <p className="text-sm text-zinc-500">Opening Hours</p>
                  <h4 className="mt-2 text-lg text-white">
                    {selectedRestaurant.openingHours?.open || "--"} -{" "}
                    {selectedRestaurant.openingHours?.close || "--"}
                  </h4>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <p className="text-sm text-zinc-500">Address</p>
                  <h4 className="mt-2 text-white">
                    {selectedRestaurant.address || "N/A"}
                  </h4>
                </div>

                {selectedRestaurant.location?.coordinates && (
                  <a
                    href={`https://maps.google.com?q=${selectedRestaurant.location.coordinates[1]},${selectedRestaurant.location.coordinates[0]}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 font-medium text-orange-400 transition hover:bg-orange-500 hover:text-white"
                  >
                    <FaMapMarkerAlt className="mr-2" />
                    Open in Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0%);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default GetAllRejectedRestaurantCityWise;