import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { adminRegistration } from "../../features/auth/adminAuthSlice";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
  FiShield,
  FiBriefcase,
} from "react-icons/fi";

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
    host: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contactNumber") {
      if (!/^\d{0,10}$/.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.host) {
      alert("Please select a host type");
      return;
    }

    dispatch(adminRegistration(formData));
  };

  useEffect(() => {
    if (registerSuccess) {
      navigate("/verifyEmail");
    }
  }, [registerSuccess, navigate]);

  const fields = [
    {
      label: "User Name",
      name: "userName",
      type: "text",
      placeholder: "Enter username",
      icon: <FiUser />,
    },
    {
      label: "Email Address",
      name: "email",
      type: "email",
      placeholder: "Enter email address",
      icon: <FiMail />,
    },
    {
      label: "Contact Number",
      name: "contactNumber",
      type: "text",
      placeholder: "Enter phone number",
      icon: <FiPhone />,
    },
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden px-4 py-10 md:px-8 flex items-center justify-center">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/90 shadow-[0_25px_80px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
      >
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left Hero Section */}
          <div className="relative hidden lg:flex flex-col justify-between border-r border-white/10 bg-linear-to-br from-zinc-950 via-zinc-900 to-black p-10 xl:p-14 overflow-hidden">
            <div className="absolute -top-10 -left-10 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative z-10"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
                <FiShield /> Admin Access Portal
              </div>

              <h1 className="max-w-xl text-5xl font-black leading-tight text-white xl:text-6xl">
                Create A New
                <span className="mt-2 block bg-linear-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Admin Account
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-8 text-zinc-400">
                Register a new admin and assign their hosting category.
                Manage hotel, restaurant, driver and delivery accounts from one secure dashboard.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative z-10 mt-12 grid gap-4 sm:grid-cols-2"
            >
              {[
                "Hotel Management",
                "Restaurant Accounts",
                "Travel & Driver Access",
                "Secure Registration",
              ].map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition duration-300 hover:border-cyan-500/20 hover:bg-cyan-500/5"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                    <FiBriefcase />
                  </div>
                  <p className="text-sm font-medium text-zinc-300">{item}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Form Section */}
          <div className="p-6 sm:p-8 lg:p-10 xl:p-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="mb-8 text-center lg:text-left">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-2xl text-cyan-300 lg:mx-0">
                  <FiShield />
                </div>

                <h2 className="text-3xl font-black text-white">
                  Admin Registration
                </h2>

                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Fill in the details below to create a new admin profile.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {fields.map((field, index) => (
                  <motion.div
                    key={field.name}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + index * 0.08 }}
                  >
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      {field.label}
                    </label>

                    <div
                      className={`group relative overflow-hidden rounded-2xl border bg-white/3 transition-all duration-300 ${
                        focusedField === field.name
                          ? "border-cyan-500/40 shadow-[0_0_0_4px_rgba(34,211,238,0.08)]"
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-zinc-500 transition group-focus-within:text-cyan-300">
                        {field.icon}
                      </div>

                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        onFocus={() => setFocusedField(field.name)}
                        onBlur={() => setFocusedField("")}
                        placeholder={field.placeholder}
                        className="w-full bg-transparent py-4 pl-14 pr-4 text-white outline-none placeholder:text-zinc-500"
                        required={field.name !== "contactNumber"}
                      />
                    </div>
                  </motion.div>
                ))}

                {/* Password */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Password
                  </label>

                  <div
                    className={`relative overflow-hidden rounded-2xl border bg-white/3 transition-all duration-300 ${
                      focusedField === "password"
                        ? "border-cyan-500/40 shadow-[0_0_0_4px_rgba(34,211,238,0.08)]"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-zinc-500" />

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField("")}
                      placeholder="Enter secure password"
                      className="w-full bg-transparent py-4 pl-14 pr-14 text-white outline-none placeholder:text-zinc-500"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-lg text-zinc-500 transition hover:text-cyan-300"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </motion.div>

                {/* Host Type */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.58 }}
                >
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Host Type
                  </label>

                  <select
                    name="host"
                    value={formData.host}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-4 text-white outline-none transition-all duration-300 focus:border-cyan-500/40 focus:shadow-[0_0_0_4px_rgba(34,211,238,0.08)]"
                    required
                  >
                    <option value="" className="bg-zinc-900 text-zinc-400">
                      Select host type
                    </option>
                    <option value="hotel" className="bg-zinc-900">
                      Hotel
                    </option>
                    <option value="restaurant" className="bg-zinc-900">
                      Restaurant
                    </option>
                    <option value="travelOption" className="bg-zinc-900">
                      Travel Option
                    </option>
                    <option value="driver" className="bg-zinc-900">
                      Driver
                    </option>
                    <option value="delivery_boy" className="bg-zinc-900">
                      Delivery Boy
                    </option>
                  </select>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.button
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="group relative mt-4 flex w-full items-center justify-center overflow-hidden rounded-2xl bg-linear-to-r from-cyan-500 via-blue-500 to-purple-500 px-6 py-4 text-sm font-bold text-white shadow-[0_15px_40px_rgba(59,130,246,0.35)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(59,130,246,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-100" />
                  <span className="relative z-10">
                    {loading ? "Creating Admin Account..." : "Register Admin"}
                  </span>
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default AdminRegisterForm;