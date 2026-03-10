import React, { useState } from "react";
import Login from "../auth/Login";
import AdminLogin from "../admin/AdminLogin";

function LoginPage() {
  const [loginType, setLoginType] = useState("user");

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE IMAGE */}
      <div className="hidden lg:flex w-1/2 relative">

        <img
          src="https://images.unsplash.com/photo-1551434678-e076c223a692"
          alt="dashboard"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm flex flex-col justify-center items-center text-white p-10">

          <h1 className="text-5xl font-bold mb-6 text-center">
            Welcome Back
          </h1>

          <p className="text-lg text-center max-w-md opacity-90">
            Manage your platform, users, and operations in one powerful dashboard.
          </p>

        </div>
      </div>

      {/* RIGHT SIDE LOGIN */}
<div className="w-full lg:w-1/2 flex items-center justify-center bg-linear-to-br from-gray-100 via-gray-50 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">

  <div className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl rounded-3xl p-10 border border-gray-200 dark:border-gray-700">

    {/* Heading */}
    <div className="text-center mb-8">
      <h2 className="text-4xl font-bold text-gray-800 dark:text-white">
        Welcome Back
      </h2>

      <p className="text-gray-500 dark:text-gray-400 mt-2">
        Login to your account to continue
      </p>

      <div className="w-12 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>
    </div>

    {/* Toggle Buttons */}
    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-8">

      <button
        onClick={() => setLoginType("user")}
        className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
          loginType === "user"
            ? "bg-blue-600 text-white shadow-md"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        }`}
      >
        User Login
      </button>

      <button
        onClick={() => setLoginType("admin")}
        className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
          loginType === "admin"
            ? "bg-blue-600 text-white shadow-md"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        }`}
      >
        Admin Login
      </button>

    </div>

    {/* Login Form */}
    <div className="transition-all duration-300">
      {loginType === "user" ? <Login /> : <AdminLogin />}
    </div>

  </div>

</div>

    </div>
  );
}

export default LoginPage;