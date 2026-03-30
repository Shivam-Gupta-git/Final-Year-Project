import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllActiveRestaurant,
  inactiveRestaurantByAdmin,
} from "../../../features/user/restaurantSlice";
import { motion } from "framer-motion";
import { FaUtensils } from "react-icons/fa";
import { Link } from "react-router-dom";
import { IoIosCloseCircleOutline } from "react-icons/io";

function AdminActiveRestaurant() {
  const dispatch = useDispatch();
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const { restaurants = [], loading } = useSelector(
    (state) => state.restaurant
  );

  useEffect(() => {
    dispatch(getAllActiveRestaurant());
  }, [dispatch]);

  const handelRestaurantInactiveButton = (id) => {
    dispatch(inactiveRestaurantByAdmin(id));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl  flex flex-col md:flex-row justify-between items-center gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="p-4 bg-linear-to-r from-orange-500 to-red-500 text-white rounded-xl text-2xl shadow">
            <FaUtensils />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Active Restaurants
            </h1>
            <p className="text-gray-500">
              Manage all active restaurants on platform
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <div className="bg-blue-100 dark:bg-blue-900/40 px-5 py-3 rounded-xl text-center">
            <p className="text-lg font-bold text-blue-600">
              {restaurants.length}
            </p>
            <p className="text-xs text-gray-500">Total</p>
          </div>

          <div className="bg-green-100 dark:bg-green-900/40 px-5 py-3 rounded-xl text-center">
            <p className="text-lg font-bold text-green-600">Active</p>
            <p className="text-xs text-gray-500">Status</p>
          </div>
        </div>
      </motion.div>

      {/* GRID */}
      {loading ? (
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
      ) : restaurants.length === 0 ? (
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
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {restaurants.map((restaurant) => (
            <motion.div
              key={restaurant._id}
              whileHover={{ y: -8, scale: 1.03 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-2xl transition cursor-pointer overflow-hidden "
              onClick={() => setSelectedRestaurant(restaurant)}
            >
              {/* IMAGE */}
              <div className="h-48 relative">
                <img
                  src={restaurant.images?.[0] || "/no-image.jpg"}
                  className="w-full h-full object-cover"
                  alt={restaurant.name}
                />

                <span className="absolute top-3 right-3 text-xs px-3 py-1 bg-green-500 text-white rounded-full">
                  {restaurant.status}
                </span>
              </div>

              {/* INFO */}
              <div className="p-4">
                <h3 className="font-semibold text-lg">{restaurant.name}</h3>

                <p className="text-sm text-gray-500">
                  📍 {restaurant.city?.name}
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  {restaurant.foodType} • ₹{restaurant.avgCostForOne}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedRestaurant && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <motion.div
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-900 w-[95%] md:w-237.5 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
          >
            {/* CLOSE */}
            <button
              onClick={() => setSelectedRestaurant(null)}
              className="absolute right-4 top-4 text-gray-400 hover:bg-red-500 hover:text-white text-3xl rounded-full duration-300 cursor-pointer"
            >
              <IoIosCloseCircleOutline />
            </button>

            <h2 className="text-2xl font-bold">{selectedRestaurant.name}</h2>

            <p className="text-gray-500 mb-4">
              {selectedRestaurant.city?.name}
            </p>

            {/* IMAGES */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {selectedRestaurant.images?.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className="h-32 w-full object-cover rounded"
                />
              ))}
            </div>

            {/* DETAILS */}
            <div className="grid md:grid-cols-2 gap-3 mt-5 text-sm">
              <p>
                <b>Food Type:</b> {selectedRestaurant.foodType}
              </p>
              <p>
                <b>Famous Food:</b> {selectedRestaurant.famousFood}
              </p>
              <p>
                <b>Cost:</b> ₹{selectedRestaurant.avgCostForOne}
              </p>
              <p>
                <b>Best Time:</b> {selectedRestaurant.bestTime}
              </p>
              <p>
                <b>Status:</b> {selectedRestaurant.status}
              </p>
              <p>
                <b>Address:</b> {selectedRestaurant.address}
              </p>

              <p>
                <b>Opening:</b> {selectedRestaurant.openingHours?.open} -{" "}
                {selectedRestaurant.openingHours?.close}
              </p>

              <p>
                <b>Map:</b>{" "}
                <a
                  href={`https://maps.google.com?q=${selectedRestaurant.location?.coordinates?.[1]},${selectedRestaurant.location?.coordinates?.[0]}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  View Location
                </a>
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 mt-6 justify-end">
              <Link
                to={`/admin/get-All-Food/${selectedRestaurant._id}`}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 duration-300 text-white rounded-lg"
              >
                Show Food Menu
              </Link>

              <Link
                to={`/admin/update-restaurant/${selectedRestaurant._id}`}
                className="px-4 py-2 bg-blue-400 hover:bg-blue-500 duration-300 text-white rounded-lg"
              >
                Update
              </Link>

              <button
                onClick={() =>
                  handelRestaurantInactiveButton(selectedRestaurant._id)
                }
                className="px-4 py-2 bg-red-400 hover:bg-red-500 duration-300 text-white rounded-lg"
              >
                Inactive
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default AdminActiveRestaurant;
