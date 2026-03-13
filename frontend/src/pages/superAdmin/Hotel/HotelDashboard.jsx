import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaCity } from "react-icons/fa";

function HotelDashboard() {
  const { superAdmin } = useSelector((state) => state.superAdmin);
  return (
    <div className="w-full p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        {/* Left Side */}
        <div className="flex items-center gap-5">
          {/* Info */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Welcome to Hotel Pannel
            </h1>

            <p className="text-gray-600 dark:text-gray-300">
              Hi <span className="font-medium">{superAdmin?.userName}</span>,
              manage your platform from here.
            </p>
          </div>
        </div>
      </div>
      <div className="flex mt-6">
        <Link
          to="/superAdmin/SuperAdminApprovealHotelList"
          className="w-60 p-5 bg-gray-100 rounded-xl shadow hover:shadow-lg hover:scale-105 transition flex flex-col items-center"
        >
          <span className="text-3xl mb-2 bg-amber-400 p-1 rounded-sm text-white">
            <FaCity />
          </span>
          <span className="font-semibold text-gray-700">
            Hotel Approval List
          </span>
        </Link>
      </div>
    </div>
  );
}

export default HotelDashboard;
