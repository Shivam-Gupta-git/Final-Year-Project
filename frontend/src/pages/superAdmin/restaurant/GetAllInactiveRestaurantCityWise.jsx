import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  approveRestaurantById,
  deleteRestaurant,
  getInactiveRestaurantCityWise,
} from "../../../features/user/restaurantSlice";
import { getActiveCities } from "../../../features/user/citySlice";
import {
  FaUtensils,
  FaSearch,
  FaCheckCircle,
  FaTrash,
  FaChevronRight,
  FaTimes,
  FaMapMarkerAlt,
} from "react-icons/fa";

function GetAllInactiveRestaurantCityWise() {
  const dispatch = useDispatch();

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { restaurants = [], loading } = useSelector(
    (state) => state.restaurant
  );

  const { cities = [] } = useSelector((state) => state.city);

  useEffect(() => {
    dispatch(getActiveCities());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      getInactiveRestaurantCityWise({
        city: selectedCity,
        page: 1,
      })
    );
  }, [dispatch, selectedCity]);

  const handleApprove = (id) => {
    dispatch(approveRestaurantById(id));
  };

  const handleDelete = (id) => {
    dispatch(deleteRestaurant(id));
  };

  const cityFilters = useMemo(() => {
    const uniqueCities = [
      ...new Set(
        restaurants
          .map((restaurant) => restaurant.city?.name)
          .filter(Boolean)
      ),
    ];

    return ["All", ...uniqueCities];
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        restaurant.name?.toLowerCase().includes(search) ||
        restaurant.address?.toLowerCase().includes(search) ||
        restaurant.city?.name?.toLowerCase().includes(search) ||
        restaurant.foodType?.toLowerCase().includes(search);

      const matchesCity =
        selectedCity === "" ||
        selectedCity === "All" ||
        restaurant.city?._id === selectedCity ||
        restaurant.city?.name === selectedCity;

      return matchesSearch && matchesCity;
    });
  }, [restaurants, searchTerm, selectedCity]);

  return (
    <div className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-zinc-950 via-black to-zinc-900 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.8)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_40%)]" />

          <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/10 text-orange-400 shadow-lg shadow-orange-500/20 animate-pulse">
                <FaUtensils className="text-3xl" />
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Inactive Restaurants Dashboard
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                  Search, filter and manage inactive restaurants from all cities.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-300">
                    {restaurants.length} Total Restaurants
                  </div>

                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
                    {filteredRestaurants.length} Showing
                  </div>
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
                  placeholder="Search restaurant, city, address..."
                  className="w-full rounded-2xl border border-white/10 bg-zinc-950 py-4 pl-12 pr-4 text-white placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* FILTER BUTTONS */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCity("")}
            className={`rounded-2xl border px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
              selectedCity === ""
                ? "border-orange-500 bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                : "border-white/10 bg-zinc-950 text-zinc-300 hover:border-orange-500/30 hover:text-white"
            }`}
          >
            All
          </button>

          {cities.map((city) => (
            <button
              key={city._id}
              onClick={() => setSelectedCity(city._id)}
              className={`rounded-2xl border px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                selectedCity === city._id
                  ? "border-orange-500 bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                  : "border-white/10 bg-zinc-950 text-zinc-300 hover:border-orange-500/30 hover:text-white"
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="flex h-80 items-center justify-center rounded-3xl border border-white/10 bg-zinc-950">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-zinc-700 border-t-orange-500" />
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-zinc-950 px-6 py-20 text-center">
            <FaUtensils className="mx-auto mb-4 text-5xl text-zinc-600" />
            <h2 className="text-2xl font-semibold text-white">
              No inactive restaurants found
            </h2>
            <p className="mt-2 text-zinc-500">
              Try changing the city filter or search text.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
            <div className="max-h-162.5 overflow-y-auto overflow-x-auto">
              <table className="min-w-full">
                <thead className="sticky top-0 z-10 border-b border-white/10 bg-zinc-900">
                  <tr>
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
                      Cost
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
                  {filteredRestaurants.map((restaurant, index) => (
                    <tr
                      key={restaurant._id}
                      className="border-b border-white/5 transition-all duration-300 hover:bg-orange-500/5"
                      style={{
                        animation: `fadeInUp 0.3s ease ${index * 0.05}s both`,
                      }}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={
                              restaurant.images?.[0] ||
                              "https://via.placeholder.com/80"
                            }
                            alt={restaurant.name}
                            className="h-14 w-14 rounded-2xl border border-white/10 object-cover"
                          />

                          <div>
                            <h3 className="font-semibold capitalize text-white">
                              {restaurant.name}
                            </h3>

                            <p className="mt-1 max-w-xs truncate text-xs text-zinc-500">
                              {restaurant.address}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-zinc-300">
                        {restaurant.city?.name || "N/A"}
                      </td>

                      <td className="px-6 py-5 text-sm text-zinc-300">
                        {restaurant.foodType || "N/A"}
                      </td>

                      <td className="px-6 py-5 text-sm text-zinc-300">
                        ₹{restaurant.avgCostForOne || 0}
                      </td>

                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                          <span className="h-2 w-2 rounded-full animate-pulse bg-red-400" />
                          Inactive
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(restaurant._id);
                            }}
                            className="inline-flex items-center rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-500"
                          >
                            <FaCheckCircle className="mr-2" />
                            Active
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(restaurant._id);
                            }}
                            className="inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
                          >
                            <FaTrash className="mr-2" />
                            Delete
                          </button>

                          <button
                            onClick={() => setSelectedRestaurant(restaurant)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-zinc-300 transition hover:border-orange-500/30 hover:bg-zinc-800 hover:text-white"
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

        {/* SIDE DRAWER */}
        {selectedRestaurant && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm">
            <div
              className="absolute inset-0"
              onClick={() => setSelectedRestaurant(null)}
            />

            <div className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-zinc-950 shadow-[0_0_80px_rgba(0,0,0,0.9)] animate-[slideIn_.35s_ease]">
              <div className="sticky top-0 z-10 border-b border-white/10 bg-black/90 px-6 py-5 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold capitalize text-white">
                      {selectedRestaurant.name}
                    </h2>

                    <div className="mt-2 flex items-center gap-2 text-zinc-400">
                      <FaMapMarkerAlt className="text-orange-400" />
                      <span>{selectedRestaurant.city?.name}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedRestaurant(null)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              <div className="space-y-6 p-6">
                {/* IMAGES */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {selectedRestaurant.images?.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={selectedRestaurant.name}
                      className="h-48 w-full rounded-3xl border border-white/10 object-cover transition duration-300 hover:scale-[1.02]"
                    />
                  ))}
                </div>

                {/* DETAILS */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Food Type
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {selectedRestaurant.foodType || "N/A"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Famous Food
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {selectedRestaurant.famousFood || "N/A"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Average Cost
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      ₹{selectedRestaurant.avgCostForOne || 0}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Best Time
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {selectedRestaurant.bestTime || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <h3 className="mb-3 text-lg font-semibold text-white">
                    Address
                  </h3>
                  <p className="leading-7 text-zinc-400">
                    {selectedRestaurant.address}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <h3 className="mb-3 text-lg font-semibold text-white">
                    Opening Hours
                  </h3>
                  <p className="text-zinc-400">
                    {selectedRestaurant.openingHours?.open} -{" "}
                    {selectedRestaurant.openingHours?.close}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(selectedRestaurant._id)}
                    className="flex-1 rounded-2xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-500"
                  >
                    Activate Restaurant
                  </button>

                  <button
                    onClick={() => handleDelete(selectedRestaurant._id)}
                    className="flex-1 rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default GetAllInactiveRestaurantCityWise;