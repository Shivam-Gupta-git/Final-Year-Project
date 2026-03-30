import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { motion } from "framer-motion"
import { FaUserSecret, FaCity } from "react-icons/fa";
import { Link } from 'react-router-dom';

function RestaurantDashboard() {

  const { admin } = useSelector((state) => state.admin);

  const getInitials = (name) => {
    if (!name) return "SA";
    const names = name.split(" ");
    return names
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className='min-h-screen bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-6'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 border border-gray-200 dark:border-gray-700"
      >
        {/* Left */}
        <div className="flex items-center gap-5 w-full md:w-1/2">
          <div className="w-16 h-16 rounded-full bg-linear-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold overflow-hidden shadow-lg">
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
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Welcome Back 👋
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Hi <span className="font-semibold">{admin?.userName}</span>, manage your platform.
            </p>

            <p className="flex items-center gap-2 text-sm text-gray-500 mt-2">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Host</span>
              <FaUserSecret className="text-orange-500" />
              {admin?.host || "N/A"}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-3 w-full md:w-auto">
          <Link
            to="/admin/add-restaurant"
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg transition-all duration-300 text-sm text-center"
          >
            + Add Restaurant
          </Link>

          <Link
            to="/admin/create-food"
            className="px-5 py-3 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-xl shadow-lg transition-all duration-300 text-sm text-center"
          >
            + Add Food Items
          </Link>
        </div>
      </motion.div>

      {/* card section */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card */}
        <Link to="/admin/admin-active-restaurant">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all p-6 flex flex-col items-center text-center border border-gray-200 dark:border-gray-700"
          >
            <div className="text-3xl mb-3 bg-purple-500 p-3 rounded-xl text-white shadow">
              <FaCity />
            </div>
            <h2 className="font-semibold text-gray-800 dark:text-white">
              All Restaurants
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              View and manage all Restaurants
            </p>
          </motion.div>
        </Link>

        {/* Card */}
        <Link to="/admin/show-restaurant-status">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all p-6 flex flex-col items-center text-center border border-gray-200 dark:border-gray-700"
          >
            <div className="text-3xl mb-3 bg-blue-500 p-3 rounded-xl text-white shadow">
              <FaCity />
            </div>
            <h2 className="font-semibold text-gray-800 dark:text-white">
            Restaurants Status
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Track approval & availability
            </p>
          </motion.div>
        </Link>

        {/* Card */}
        <Link to="/admin/ordersDashboard">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all p-6 flex flex-col items-center text-center border border-gray-200 dark:border-gray-700"
          >
            <div className="text-3xl mb-3 bg-gray-500 p-3 rounded-xl text-white shadow">
              <FaCity />
            </div>
            <h2 className="font-semibold text-gray-800 dark:text-white">
              Show Orders
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Track approval & availability
            </p>
          </motion.div>
        </Link>
      </div>
    </div>
  )
}

export default RestaurantDashboard