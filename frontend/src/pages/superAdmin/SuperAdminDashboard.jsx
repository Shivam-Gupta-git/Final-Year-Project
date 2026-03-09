import React from "react";
import { useSelector } from "react-redux";

function SuperAdminDashboard() {
  const { superAdmin } = useSelector((state) => state.superAdmin);

  const getInitials = (name) => {
    if (!name) return "SA";
    const names = name.split(" ");
    return names.map((n) => n[0]).join("").toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">

      {/* Welcome Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center gap-5 mb-8">

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
            Hi <span className="font-medium">{superAdmin?.userName}</span>, manage your platform from here.
          </p>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Card 1 */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow hover:shadow-lg transition">
          <h3 className="text-gray-500 text-sm">Total Users</h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
            0
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow hover:shadow-lg transition">
          <h3 className="text-gray-500 text-sm">Total Admins</h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
            0
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow hover:shadow-lg transition">
          <h3 className="text-gray-500 text-sm">Active Sessions</h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
            0
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow hover:shadow-lg transition">
          <h3 className="text-gray-500 text-sm">System Status</h3>
          <p className="text-lg font-semibold text-green-500 mt-2">
            Running
          </p>
        </div>

      </div>

    </div>
  );
}

export default SuperAdminDashboard;