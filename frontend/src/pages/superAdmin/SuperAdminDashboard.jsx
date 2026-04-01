import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import AdminRegisterForm from "../admin/AdminRegisterForm";
import { Link } from "react-router-dom";
import { getAllAdmin } from "../../features/auth/adminAuthSlice";
import { FaUserShield } from "react-icons/fa";
import { FaUsers, FaServer, FaUserCheck } from "react-icons/fa";

function SuperAdminDashboard() {
  const dispatch = useDispatch();
  const { superAdmin } = useSelector((state) => state.superAdmin);
  const { admins } = useSelector((state) => state.adminAuth);
  const [showAdminForm, setShowAdminForm] = useState(false); 

  const getInitials = (name) => {
    if (!name) return "SA";
    const names = name.split(" ");
    return names
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  useEffect(() => {
    dispatch(getAllAdmin());
  }, [dispatch]);



  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
  
      {/* HEADER CARD */}
      <div className="mb-10">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
  
          {/* LEFT SIDE */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-linear-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden shadow-lg">
              {superAdmin?.avatar ? (
                <img
                  src={superAdmin.avatar}
                  alt={superAdmin.userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(superAdmin?.userName)
              )}
            </div>
  
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Welcome Back 👋
              </h1>
  
              <p className="text-gray-600 dark:text-gray-300">
                Hi <span className="font-semibold">{superAdmin?.userName}</span>, manage your platform from here.
              </p>
            </div>
          </div>
  
          {/* RIGHT BUTTON */}
          <Link to={"/superAdmin/admin-registration"}
            
            className="px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition"
          >
            + Register Admin
          </Link>
        </div>
      </div>
  
      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  
        {/* CARD */}
        <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:shadow-2xl transition border border-gray-200 dark:border-gray-700 flex items-center justify-between">
  
          <div>
            <h3 className="text-gray-500 text-sm">Total Users</h3>
            <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
              0
            </p>
          </div>
  
          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-xl group-hover:scale-110 transition">
            <FaUsers className="text-xl text-blue-600 dark:text-blue-300" />
          </div>
        </div>
  
        {/* CARD */}
        <Link to={"/superAdmin/admin-details"} className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:shadow-2xl transition border border-gray-200 dark:border-gray-700 flex items-center justify-between">
  
          <div>
            <h3 className="text-gray-500 text-sm">Total Admins</h3>
            <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
              {admins?.length}
            </p>
          </div>
  
          <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-xl group-hover:scale-110 transition">
            <FaUserCheck className="text-xl text-purple-600 dark:text-purple-300" />
          </div>
        </Link>
  
        {/* CARD */}
        <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:shadow-2xl transition border border-gray-200 dark:border-gray-700 flex items-center justify-between">
  
          <div>
            <h3 className="text-gray-500 text-sm">Active Sessions</h3>
            <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
              0
            </p>
          </div>
  
          <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-xl group-hover:scale-110 transition">
            <FaUsers className="text-xl text-yellow-600 dark:text-yellow-300" />
          </div>
        </div>
  
        {/* CARD */}
        <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:shadow-2xl transition border border-gray-200 dark:border-gray-700 flex items-center justify-between">
  
          <div>
            <h3 className="text-gray-500 text-sm">System Status</h3>
            <p className="text-lg font-semibold text-green-500 mt-2">
              Running
            </p>
          </div>
  
          <div className="bg-green-100 dark:bg-green-900 p-3 rounded-xl group-hover:scale-110 transition">
            <FaServer className="text-xl text-green-600 dark:text-green-300" />
          </div>
        </div>
  
      </div>
  
    </div>
  );
}

export default SuperAdminDashboard;
