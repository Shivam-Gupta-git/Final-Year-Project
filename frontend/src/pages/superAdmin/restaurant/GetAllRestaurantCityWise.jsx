import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRestaurantCityWise } from "../../../features/user/restaurantSlice";
import { getActiveCities } from "../../../features/user/citySlice";
import { FaUtensils } from "react-icons/fa";

function GetAllRestaurantCityWise() {
  const dispatch = useDispatch();

  const [selectedCity, setSelectedCity] = useState("");

  const { restaurants = [], loading } = useSelector(
    (state) => state.restaurant
  );

  const { cities = [] } = useSelector((state) => state.city);

  /* FETCH DATA */
  useEffect(() => {
    dispatch(getRestaurantCityWise({ city: selectedCity, page: 1 }));
  }, [dispatch, selectedCity]);

  useEffect(() => {
    dispatch(getActiveCities());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      
      {/* HEADER */}
      <div className="mb-8 flex items-center gap-4 bg-orange-100 dark:bg-orange-800 p-4 rounded-2xl shadow">
        <div className="p-3 bg-orange-500 text-white rounded-xl">
          <FaUtensils size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Restaurants by City
          </h1>
          <p className="text-gray-500 dark:text-gray-300 text-sm">
            Explore restaurants based on selected city
          </p>
        </div>
      </div>

      {/* FILTER */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex flex-wrap gap-4 items-center justify-between">
        
        <div className="flex flex-col w-62.5">
          <label className="text-sm text-gray-500 mb-1">
            Select City
          </label>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="border px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white"
          >
            <option value="">All Cities</option>
            {cities.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setSelectedCity("")}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300"
        >
          Reset
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      )}

      {/* EMPTY */}
      {!loading && restaurants.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          🍽️ No Restaurants Found
        </div>
      )}

      {/* LIST */}
      {!loading && restaurants.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {restaurants.map((r) => (
            <div
              key={r._id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-xl transition overflow-hidden"
            >
              {/* IMAGE */}
              <div className="h-40">
                <img
                  src={r.images?.[0] || "/no-image.jpg"}
                  className="w-full h-full object-cover"
                  alt={r.name}
                />
              </div>

              {/* INFO */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  {r.name}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  📍 {r.city?.name}
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  {r.foodType} • ₹{r.avgCostForOne}
                </p>

                <p className="text-xs mt-2 text-green-600 font-medium">
                  {r.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GetAllRestaurantCityWise;