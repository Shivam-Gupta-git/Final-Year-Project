import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '../../features/auth/adminAuthSlice'
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { Link } from "react-router-dom";

function AdminLogin() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false);

  const {loading, error, loginSuccess, adminToken, admin} = useSelector((state) => state.adminAuth);
  console.log("loginSuccess:", loginSuccess);
  console.log("admin:", admin?.admin?.host);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handelChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handelSubmit = (e) => {
    e.preventDefault();

    const { email, password } = formData;

    if (!email || !password) return;

    dispatch(adminLogin({ email, password }));
  };


  useEffect(() => {
    if (loginSuccess) {
      alert("admin login successfully");
  
      if (admin?.admin?.host === "hotel") {
        navigate("/admin/adminDashboard");
      } else if (admin?.admin?.host === "restaurant") {
        navigate("/admin/restaurantDashboard");
      }
    }
  }, [loginSuccess, navigate, admin]);

  return (
    <div className=" flex items-center justify-center bg-linear-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 text-gray-800 dark:text-white">
  
      {/* BACKGROUND GLOW */}
      <div className="absolute w-72 h-72 bg-blue-400/30 rounded-full blur-3xl top-10 left-10"></div>
      <div className="absolute w-72 h-72 bg-indigo-400/30 rounded-full blur-3xl bottom-10 right-10"></div>
  
      {/* CARD */}
      <div className="relative w-full max-w-md bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl shadow-2xl rounded-3xl p-8 border border-gray-200 dark:border-gray-700">
  
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg">
            🔐
          </div>
  
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            Admin Login
          </h2>
  
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Access admin dashboard securely
          </p>
        </div>
  
        <form onSubmit={handelSubmit} className="space-y-5">
  
          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Email Address
            </label>
  
            <div className="relative mt-1">
              <FiMail className="absolute left-3 top-4 text-gray-400" />
  
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handelChange}
                placeholder="Enter your email"
                required
                className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/60 dark:bg-gray-900/60 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
  
          {/* PASSWORD */}
          <div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Password
              </label>
  
              <Link
                to={"/forgot-password"}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot?
              </Link>
            </div>
  
            <div className="relative mt-1">
              <FiLock className="absolute left-3 top-4 text-gray-400" />
  
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handelChange}
                placeholder="Enter your password"
                required
                className="w-full pl-10 pr-10 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/60 dark:bg-gray-900/60 focus:ring-2 focus:ring-blue-500 outline-none"
              />
  
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-4 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
  
          {/* ERROR */}
          {error && (
            <p className="text-red-500 text-sm text-center font-medium">
              {error}
            </p>
          )}
  
          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-xl hover:opacity-90 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
  
        </form>
      </div>
    </div>
  );
}

export default AdminLogin