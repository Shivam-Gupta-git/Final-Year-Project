import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { adminRegistration } from "../../features/auth/adminAuthSlice";
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

function AdminRegisterForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, registerSuccess } = useSelector(
    (state) => state.adminAuth
  );

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    contactNumber: "",
    password: "",
    role: "admin",
    host: "", // ✅ new field
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contactNumber") {
      if (!/^\d{0,10}$/.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate host
    if (!formData.host) {
      alert("Please select a host type");
      return;
    }

    // Dispatch with all fields including host
    dispatch(adminRegistration(formData));
  };

  useEffect(() => {
    if (registerSuccess) {
      navigate("/verifyEmail");
    }
  }, [registerSuccess, navigate]);

  return (
    <div className=" flex items-center justify-center bg-linear-to-br from-blue-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="w-full max-w-[60%] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700 transition-all">
        {/* Header */}
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">
          Admin Register
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6">
          Create admin account
        </p>
  
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              User Name
            </label>
            <div className="relative mt-1">
              <FiUser className="absolute top-4 left-3 text-gray-400" />
              <input
                type="text"
                name="userName"
                placeholder="Enter username"
                value={formData.userName}
                onChange={handleChange}
                className="w-full pl-10 p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              />
            </div>
          </div>
  
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <div className="relative mt-1">
              <FiMail className="absolute top-4 left-3 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              />
            </div>
          </div>
  
          {/* Contact */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Contact Number
            </label>
            <div className="relative mt-1">
              <FiPhone className="absolute top-4 left-3 text-gray-400" />
              <input
                type="text"
                name="contactNumber"
                placeholder="Enter phone number"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full pl-10 p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
          </div>
  
          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative mt-1">
              <FiLock className="absolute top-4 left-3 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-10 p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-4 text-gray-500 hover:text-gray-700 transition"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
  
          {/* Host Type */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Host Type
            </label>
            <select
              name="host"
              value={formData.host}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mt-1 transition-all dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="">Select host type</option>
              <option value="hotel">Hotel</option>
              <option value="restaurant">Restaurant</option>
              <option value="travelOption">Travel Option</option>
              <option value="driver">Driver</option>
              <option value="delivery_boy">Delivery Boy</option>
            </select>
          </div>
  
          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm text-center font-medium">{error}</p>
          )}
  
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registering..." : "Register Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminRegisterForm;