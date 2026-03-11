import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FaCity } from "react-icons/fa";
// import { getCityById } from "../../../features/user/citySlice";


function CityDashboard() {
  const dispatch = useDispatch()
  const [showAdminForm, setShowAdminForm] = useState(false); 
  const { superAdmin } = useSelector((state) => state.superAdmin);
  const { city } = useSelector((state) => state.city)



  return (
    <div className="w-full p-4">
      {/* Welcome Card */}
      <div>
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col md:flex-row justify-between items-center gap-6 mb-8 ">
          {/* Left Side */}
          <div className="flex items-center gap-5">


            {/* Info */}
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Welcome to city Pannel
              </h1>

              <p className="text-gray-600 dark:text-gray-300">
                Hi <span className="font-medium">{superAdmin?.userName}</span>,
                manage your platform from here.
              </p>
            </div>
          </div>

          {/* Right Side Button */}
          <div className="flex flex-col gap-2">
            <Link to="/superAdmin/createCity" className=" text-center py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition text-[15px]"> Create City</Link>

            <Link to="/superAdmin/updateCity" className="text-center py-2 px-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md transition text-[15px]"> Update City</Link>
          </div>
        </div>

        {/* Admin Register Modal */}
        {showAdminForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg w-[90%] relative ">
              {/* Close Button */}
              <button
                onClick={() => setShowAdminForm(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-lg"
              >
                ✕
              </button>

              {/* Form Component */}
              {/* <AdminRegisterForm closeForm={() => setShowAdminForm(false)} /> */}
             
            </div>
          </div>
        )}
      </div>
    <div className="w-full flex flex-row gap-4">
  <div className="flex mt-6">
  <Link
    to="/superAdmin/SuperAdminApprovealCityList"
    className="w-60 p-5 bg-gray-100 rounded-xl shadow hover:shadow-lg hover:scale-105 transition flex flex-col items-center"
  >
    <span className="text-3xl mb-2 bg-amber-400 p-1 rounded-sm text-white"><FaCity /></span>
    <span className="font-semibold text-gray-700">City Approval List</span>
  </Link>
</div>

  <div className="flex mt-6">
  <Link
    to="/superAdmin/get-all-cities"
    className="w-60 p-5 bg-gray-100 rounded-xl shadow hover:shadow-lg hover:scale-105 transition flex flex-col items-center"
  >
    <span className="text-3xl mb-2 bg-blue-400 p-1 rounded-sm text-white">
      <FaCity />
    </span>

    <span className="font-semibold text-gray-700">
      Show All Cities
    </span>
  </Link>
</div>

  <div className="flex mt-6">
  <Link
    to="/superAdmin/get-all-active-cities"
    className="w-60 p-5 bg-gray-100 rounded-xl shadow hover:shadow-lg hover:scale-105 transition flex flex-col items-center"
  >
    <span className="text-3xl mb-2 bg-green-400 p-1 rounded-sm text-white">
      <FaCity />
    </span>

    <span className="font-semibold text-gray-700">
      Show All Active Cities
    </span>
  </Link>
</div>

    </div>

    </div>
  );
}

export default CityDashboard;
