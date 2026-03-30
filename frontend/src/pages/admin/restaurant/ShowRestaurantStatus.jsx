import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRestaurantStatus } from "../../../features/user/restaurantSlice";
import { Link } from "react-router-dom";

function ShowRestaurantStatus() {
  const dispatch = useDispatch();
  const { restaurants = [], loading } = useSelector(
    (state) => state.restaurant
  );

  const [status, setStatus] = useState("active");

  useEffect(() => {
    dispatch(getRestaurantStatus(status));
  }, [dispatch, status]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      {/* HEADER */}
      <div className="mb-8 p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4">
        <div className="p-4 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-xl shadow">
          🍽️
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Restaurant Status
          </h1>
          <p className="text-gray-500">
            Manage and monitor Restaurant approval status
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {["pending", "active", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-5 py-2 rounded-xl capitalize font-medium transition ${
              status === s
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden"
            >
              {/* IMAGE SKELETON */}
              <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>

              {/* TEXT SKELETON */}
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && restaurants?.length === 0 && (
        <div className="flex flex-col items-center justify-center h-80 text-center">
          {/* ICON */}
          <div className="text-6xl mb-4 animate-bounce">🍽️</div>

          {/* TITLE */}
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            No Restaurants Found
          </h2>

          {/* SUBTEXT */}
          <p className="text-gray-500 mt-2 text-sm max-w-sm">
            Looks like there are no active restaurants available right now. Try
            adding a new one or check back later.
          </p>

          {/* ACTION BUTTON */}
          <Link
            to="/admin/add-restaurant"
            className="mt-5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition"
          >
            + Add Restaurant
          </Link>
        </div>
      )}

      {/* HOTEL GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants?.map((restaurant) => (
          <div
            key={restaurant._id}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition"
          >
            {/* IMAGE */}
            <div className="relative">
              <img
                src={restaurant.images?.[0]}
                alt={restaurant.name}
                className="h-48 w-full object-cover"
              />

              {/* STATUS BADGE */}
              <span
                className={`absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-medium ${
                  restaurant.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : restaurant.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {restaurant.status}
              </span>
            </div>

            {/* INFO */}
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {restaurant.name}
              </h2>

              <p className="text-sm text-gray-500 mt-1">{restaurant.address}</p>

              <div className="flex justify-between items-center mt-4">
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-gray-600 dark:text-gray-300">
                  {restaurant.city?.name}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShowRestaurantStatus;
