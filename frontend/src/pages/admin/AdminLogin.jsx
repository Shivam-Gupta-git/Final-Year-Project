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

  const {loading, error, loginSuccess, adminToken} = useSelector((state) => state.adminAuth);

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
      alert("admin login successfully")
      navigate("/admin/adminDashboard");
    }
  }, [loginSuccess, navigate]);

  return (
    <div className=" flex items-center justify-center bg-linear-to-br from-blue-50 to-gray-200 p-4">

    <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 border border-gray-200">

      <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
        Admin Login
      </h2>

      <p className="text-center text-gray-500 text-sm mb-6">
        Login to access the dashboard
      </p>

      <form onSubmit={handelSubmit} className="space-y-5">

        {/* Email */}
        <div>
          <label className="text-sm font-medium text-gray-700">
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
              className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Password */}
        <div className=" relative flex flex-col">
          <div className=" flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Password
          </label>
          <Link
              to={"/forgot-password"}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition"
            >
              Forgot password?
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
              className="w-full pl-10 pr-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-4 text-gray-500"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>

          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm text-center font-medium">
            {error}
          </p>
        )}

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>
    </div>
  </div>
  )
}

export default AdminLogin