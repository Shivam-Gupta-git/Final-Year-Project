import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaCity, FaArrowRight, FaMapMarkedAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { motion } from "framer-motion";

function CityDashboard() {
  const dispatch = useDispatch();
  const [showAdminForm, setShowAdminForm] = useState(false);

  const { superAdmin } = useSelector((state) => state.superAdmin);
  const { city } = useSelector((state) => state.city);

  const cards = [
    {
      title: "City Approval List",
      icon: <FaCity />,
      color: "from-amber-500 to-yellow-500",
      link: "/superAdmin/SuperAdminApprovealCityList",
      glow: "hover:shadow-amber-500/20",
    },
    {
      title: "Show All Cities",
      icon: <FaMapMarkedAlt />,
      color: "from-cyan-500 to-blue-600",
      link: "/superAdmin/get-all-cities",
      glow: "hover:shadow-cyan-500/20",
    },
    {
      title: "Show All Active Cities",
      icon: <FaCheckCircle />,
      color: "from-emerald-500 to-green-600",
      link: "/superAdmin/get-all-active-cities",
      glow: "hover:shadow-emerald-500/20",
    },
    {
      title: "Show All Inactive Cities",
      icon: <FaTimesCircle />,
      color: "from-orange-500 to-red-600",
      link: "/superAdmin/get-all-inactive-cities",
      glow: "hover:shadow-orange-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6 md:px-8 overflow-hidden">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      {/* Interactive Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mb-10 overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-zinc-950 via-zinc-900 to-black p-6 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
      >
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          {/* Left Side */}
          <div className="flex items-start gap-5">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 8 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 text-3xl shadow-lg shadow-cyan-500/20"
            >
              <FaCity />
            </motion.div>

            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-cyan-300">
                City Management Panel
              </div>

              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                Welcome Back,
                <span className="ml-2 bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  {superAdmin?.userName}
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
                Manage city approvals, monitor active and inactive cities, and create new locations from one premium dashboard experience.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Total Sections
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">4</p>
                </div>

                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 backdrop-blur-md">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                    Dashboard Status
                  </p>
                  <p className="mt-1 text-xl font-bold text-cyan-100">Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side CTA */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-stretch gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:min-w-70"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                Quick Action
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Create a New City
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Add a new city to your platform and manage it instantly.
              </p>
            </div>

            <Link
              to="/superAdmin/createCity"
              className="group mt-2 flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/40"
            >
              + Create City
              <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.45 }}
          >
            <Link
              to={card.link}
              className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-white/20 hover:shadow-2xl ${card.glow}`}
            >
              <div className={`absolute inset-0 bg-linear-to-br ${card.color} opacity-0 transition duration-500 group-hover:opacity-10`} />

              <div className={`relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br ${card.color} text-2xl text-white shadow-lg`}>
                {card.icon}
              </div>

              <h3 className="relative text-lg font-semibold text-white transition group-hover:text-cyan-300">
                {card.title}
              </h3>

              <p className="relative mt-2 text-sm leading-6 text-zinc-400">
                Open and manage this section from your city administration dashboard.
              </p>

              <div className="relative mt-6 flex items-center gap-2 text-sm font-medium text-cyan-400 opacity-80 transition-all group-hover:gap-3 group-hover:opacity-100">
                Open Section
                <FaArrowRight className="text-xs" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default CityDashboard;