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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      {/* Welcome Card */}
      <div>
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          {/* Left Side */}
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
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

            {/* Info */}
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Welcome Back 👋
              </h1>

              <p className="text-gray-600 dark:text-gray-300">
                Hi <span className="font-medium">{superAdmin?.userName}</span>,
                manage your platform from here.
              </p>
            </div>
          </div>

          {/* Right Side Button */}
          <div>
            <button
              onClick={() => setShowAdminForm(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition"
            >
              + Register Admin
            </button>
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
              <AdminRegisterForm closeForm={() => setShowAdminForm(false)} />
            </div>
          </div>
        )}
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm">Total Users</h3>
            <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
              0
            </p>
          </div>

          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
            <FaUsers className="text-xl text-blue-600 dark:text-blue-300" />
          </div>
        </div>

        {/* Total Admins */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm">Total Admins</h3>
            <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
              {admins?.length}
            </p>
          </div>

          <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
            <FaUserCheck className="text-xl text-purple-600 dark:text-purple-300" />
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm">Active Sessions</h3>
            <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
              0
            </p>
          </div>

          <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
            <FaUsers className="text-xl text-yellow-600 dark:text-yellow-300" />
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm">System Status</h3>
            <p className="text-lg font-semibold text-green-500 mt-2">Running</p>
          </div>

          <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
            <FaServer className="text-xl text-green-600 dark:text-green-300" />
          </div>
        </div>

        {/* Admin Approval Card */}
        <Link
          to="/superadmin/adminApprovel"
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition flex items-center justify-between hover:-translate-y-1"
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Admin Approval
            </h3>
            <p className="text-sm text-gray-500">
              Approve or reject admin accounts
            </p>
          </div>

          <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
            <FaUserShield className="text-xl text-blue-600 dark:text-blue-300" />
          </div>
        </Link>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
