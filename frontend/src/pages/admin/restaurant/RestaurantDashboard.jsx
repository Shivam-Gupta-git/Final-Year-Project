import React from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FaUserSecret, FaCity, FaUtensils, FaClipboardList } from "react-icons/fa";
import { Link } from "react-router-dom";

function RestaurantDashboard() {
  const { admin } = useSelector((state) => state.admin);

  const getInitials = (name) => {
    if (!name) return "SA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-950 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 border border-gray-200 dark:border-gray-700"
      >
        {/* Left: Profile Info */}
        <div className="flex items-center gap-6 w-full md:w-1/2">
          <div className="w-20 h-20 rounded-full bg-linear-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden shadow-lg">
            {admin?.avatar ? (
              <img
                src={admin.avatar}
                alt={admin.userName}
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials(admin?.userName)
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Welcome Back, {admin?.userName?.split(" ")[0]} 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage your restaurants and food items efficiently
            </p>
            <p className="flex items-center gap-2 text-sm text-gray-500 mt-2">
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Host
              </span>
              <FaUserSecret className="text-orange-500" />
              {admin?.host || "N/A"}
            </p>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex flex-col gap-3 w-full md:w-auto">
          <Link
            to="/admin/add-restaurant"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-900 hover:border text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 text-center text-sm"
          >
            + Add Restaurant
          </Link>
          <Link
            to="/admin/create-food"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-900 hover:border text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 text-center text-sm"
          >
            + Add Food Items
          </Link>
        </div>
      </motion.div>

      {/* Cards Section */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* All Restaurants */}
        <Link to="/admin/admin-active-restaurant">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-gray-950 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 flex flex-col items-center text-center border border-gray-200 dark:border-gray-700"
          >
            <div className="text-4xl mb-4 bg-linear-to-tr from-purple-500 to-pink-500 p-4 rounded-2xl text-white shadow-md">
              <FaCity />
            </div>
            <h2 className="font-semibold text-gray-800 dark:text-white text-lg">
              All Restaurants
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View, manage, and update all restaurants
            </p>
          </motion.div>
        </Link>

        {/* Restaurant Status */}
        <Link to="/admin/show-restaurant-status">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-gray-950 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 flex flex-col items-center text-center border border-gray-200 dark:border-gray-700"
          >
            <div className="text-4xl mb-4 bg-linear-to-tr from-blue-500 to-cyan-500 p-4 rounded-2xl text-white shadow-md">
              <FaClipboardList />
            </div>
            <h2 className="font-semibold text-gray-800 dark:text-white text-lg">
              Restaurants Status
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track approval, availability, and activity
            </p>
          </motion.div>
        </Link>

        {/* Orders Dashboard */}
        <Link to="/admin/ordersDashboard">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-gray-950 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 flex flex-col items-center text-center border border-gray-200 dark:border-gray-700"
          >
            <div className="text-4xl mb-4 bg-linear-to-tr from-gray-500 to-gray-700 p-4 rounded-2xl text-white shadow-md">
              <FaUtensils />
            </div>
            <h2 className="font-semibold text-gray-800 dark:text-white text-lg">
              Orders Dashboard
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View and manage all orders efficiently
            </p>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}

export default RestaurantDashboard;