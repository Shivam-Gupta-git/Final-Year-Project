import React, { useState } from "react";
import Login from "../auth/Login";
import AdminLogin from "../admin/AdminLogin";

function LoginPage() {
  const [loginType, setLoginType] = useState("user");

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* LEFT SIDE (BRANDING) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        {/* IMAGE */}
        <img
          src="https://images.unsplash.com/photo-1551434678-e076c223a692"
          alt="dashboard"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* GRADIENT OVERLAY */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-900/80 via-indigo-800/70 to-black/70 backdrop-blur-sm"></div>

        {/* CONTENT */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Manage Everything <br /> in One Place
          </h1>

          <p className="text-lg opacity-90 max-w-md mb-10">
            Control hotels, rooms, bookings and users with a powerful and modern
            admin dashboard.
          </p>

          {/* FEATURE POINTS */}
          <div className="space-y-4 text-sm opacity-90">
            <p>✔ Manage Hotels & Rooms</p>
            <p>✔ Real-time Updates</p>
            <p>✔ Secure Admin Access</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE (LOGIN) */}
      <div className="w-full lg:w-[60%] flex items-center justify-center relative overflow-hidden p-6">
        {/* BACKGROUND EFFECT */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-100 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>

        {/* GLOW CIRCLES */}
        <div className="absolute w-72 h-72 bg-blue-400/30 rounded-full blur-3xl top-10 left-10"></div>
        <div className="absolute w-72 h-72 bg-indigo-400/30 rounded-full blur-3xl bottom-10 right-10"></div>

        {/* CARD CONTAINER */}
        <div className="relative w-full max-w-[85%]">
          {/* FLOATING CARD */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl border border-white/40 dark:border-gray-700 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-10">
            {/* HEADER */}
            <div className="text-center mb-8">
              <div className="w-10 h-10 mx-auto mb-4 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg">
                🔐
              </div>

              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                Sign In
              </h2>

              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                Access your dashboard securely
              </p>
            </div>

            {/* TOGGLE */}
            <div className="relative flex bg-gray-200 dark:bg-gray-700 rounded-xl p-1 mb-8">
              {/* SLIDER EFFECT */}
              <div
                className={`absolute top-1 bottom-1 w-1/2 rounded-lg bg-blue-600 transition-all duration-300 ${
                  loginType === "admin" ? "left-1/2" : "left-1"
                }`}
              ></div>

              <button
                onClick={() => setLoginType("user")}
                className={`relative z-10 flex-1 py-2.5 text-sm font-semibold transition ${
                  loginType === "user"
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                User
              </button>

              <button
                onClick={() => setLoginType("admin")}
                className={`relative z-10 flex-1 py-2.5 text-sm font-semibold transition ${
                  loginType === "admin"
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                Admin
              </button>
            </div>

            {/* FORM */}
            <div className="transition-all duration-300">
              {loginType === "user" ? <Login /> : <AdminLogin />}
            </div>

            {/* EXTRA */}
            <div className="flex justify-between items-center mt-6 text-sm text-gray-500">
              <span className="cursor-pointer hover:text-blue-600">
                Forgot Password?
              </span>
              <span className="cursor-pointer hover:text-blue-600">Help</span>
            </div>
          </div>

          {/* FLOATING DECORATION */}
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-indigo-500/20 rounded-full blur-2xl"></div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
