import React from "react";
import { useSelector } from "react-redux";
import { FaCompass } from "react-icons/fa";
import { Link } from "react-router-dom";
import { MdPlace } from "react-icons/md";

function PlaceDashboard() {
  const { superAdmin } = useSelector((state) => state.superAdmin);

  return (
    <div className="w-full p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-all">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 flex flex-col md:flex-row justify-between items-center gap-6 mb-8 transition-all border border-gray-200 dark:border-gray-700">
        {/* Left Side */}
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl shadow-md">
            <FaCompass />
          </div>
          {/* Info */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Welcome to Place Panel
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Hi <span className="font-medium">{superAdmin?.userName}</span>,
              manage your platform from here.
            </p>
          </div>
        </div>
        {/* Right Side Button */}
        <div className="flex flex-col gap-2">
          <Link
            to="/superAdmin/add-place-details"
            className="text-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition text-[15px] hover:scale-105"
          >
            + Create Place
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <Link
          to="/superAdmin/SuperAdminApprovealPlaceList"
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition p-6 flex flex-col items-center text-center border border-gray-200 dark:border-gray-700"
        >
          <span className="text-3xl mb-2 bg-yellow-400 p-2 rounded-sm text-white">
          <MdPlace />
          </span>
          <span className="font-semibold text-gray-700 dark:text-gray-100">
            Place Approval List
          </span>
        </Link>

        <Link
          to="/superAdmin/get-placeCityWise"
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition p-6 flex flex-col items-center text-center border border-gray-200 dark:border-gray-700"
        >
          <span className="text-3xl mb-2 bg-orange-400 p-2 rounded-sm text-white">
          <MdPlace />
          </span>
          <span className="font-semibold text-gray-700 dark:text-gray-100">
            Show All Places
          </span>
        </Link>

        <Link
          to="/superAdmin/get-all-active-placeCityWise"
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition p-6 flex flex-col items-center text-center border border-gray-200 dark:border-gray-700"
        >
          <span className="text-3xl mb-2 bg-blue-400 p-2 rounded-sm text-white">
          <MdPlace />
          </span>
          <span className="font-semibold text-gray-700 dark:text-gray-100">
            Show All Active Places
          </span>
        </Link>

        <Link
          to="/superAdmin/get-inactive-pLaceCityWise"
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition p-6 flex flex-col items-center text-center border border-gray-200 dark:border-gray-700"
        >
          <span className="text-3xl mb-2 bg-gray-400 p-2 rounded-sm text-white">
          <MdPlace />
          </span>
          <span className="font-semibold text-gray-700 dark:text-gray-100">
            Show All Inactive Places
          </span>
        </Link>

      </div>
    </div>
  );
}

export default PlaceDashboard;
