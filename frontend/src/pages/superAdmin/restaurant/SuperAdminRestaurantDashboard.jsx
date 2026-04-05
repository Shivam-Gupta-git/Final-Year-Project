import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  FaUtensils,
  FaArrowRight,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaBan,
} from "react-icons/fa";
import { motion } from "framer-motion";

function SuperAdminRestaurantDashboard() {
  const { superAdmin, loading } = useSelector(
    (state) => state.superAdmin
  );

  const cards = [
    {
      title: "Restaurant Approval List",
      icon: <FaClock />,
      color: "from-amber-500 to-yellow-500",
      link: "/superAdmin/approval-restaurant",
      glow: "hover:shadow-amber-500/20",
      description:
        "Review and approve newly submitted restaurant requests.",
    },
    {
      title: "Show All Restaurant",
      icon: <FaUtensils />,
      color: "from-cyan-500 to-blue-600",
      link: "/superAdmin/all-restaurant",
      glow: "hover:shadow-cyan-500/20",
      description:
        "View and manage all restaurants from one place.",
    },
    {
      title: "Show All Active Restaurant",
      icon: <FaCheckCircle />,
      color: "from-emerald-500 to-green-600",
      link: "/superAdmin/all-active-restaurant",
      glow: "hover:shadow-emerald-500/20",
      description:
        "See all currently active restaurants available on the platform.",
    },
    {
      title: "Show All Inactive Restaurant",
      icon: <FaTimesCircle />,
      color: "from-orange-500 to-red-600",
      link: "/superAdmin/all-inactive-restaurant",
      glow: "hover:shadow-orange-500/20",
      description:
        "Manage restaurants that are currently inactive.",
    },
    {
      title: "Show All Rejected Restaurant",
      icon: <FaBan />,
      color: "from-purple-500 to-fuchsia-600",
      link: "/superAdmin/all-rejected-restaurant",
      glow: "hover:shadow-purple-500/20",
      description:
        "Review all rejected restaurant applications and listings.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black px-4 py-6 text-white md:px-8">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />
        <div className="absolute left-10 top-1/2 h-40 w-40 rounded-full bg-yellow-500/5 blur-3xl" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mb-10 overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-zinc-950 via-zinc-900 to-black p-6 shadow-[0_20px_80px_rgba(0,0,0,0.7)] md:p-8"
      >
        {/* Decorative Glow */}
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-red-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          {/* Left Content */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 8 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-orange-500 to-red-600 text-3xl text-white shadow-lg shadow-orange-500/20"
            >
              <FaUtensils />
            </motion.div>

            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-orange-300">
                Restaurant Management Panel
              </div>

              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                Welcome Back,
                <span className="ml-2 bg-linear-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  {superAdmin?.userName}
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
                Manage restaurant approvals, monitor active and inactive
                restaurants, and review rejected listings from one premium
                dashboard experience.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Total Sections
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {cards.length}
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="rounded-2xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 backdrop-blur-md"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-orange-300">
                    Dashboard Status
                  </p>
                  <p className="mt-1 text-xl font-bold text-orange-100">
                    Active
                  </p>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Right Side Quick Action */}
          <motion.div
            initial={{ opacity: 0, x: 35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:min-w-75"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                Quick Action
              </p>

              <h2 className="mt-2 text-xl font-semibold text-white">
                Manage Restaurants
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Instantly open restaurant sections and manage all listings from
                one place.
              </p>
            </div>

            <Link
              to="/superAdmin/all-restaurant"
              className="group mt-2 flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-orange-500 to-red-600 px-5 py-3 font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-orange-500/40"
            >
              View Restaurants
              <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Loader */}
      {loading ? (
        <div className="flex min-h-75 items-center justify-center">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-zinc-700 border-t-orange-500" />
        </div>
      ) : (
        /* Cards */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.08,
                duration: 0.45,
              }}
            >
              <Link
                to={card.link}
                className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-white/20 hover:shadow-2xl ${card.glow}`}
              >
                {/* Hover Background */}
                <div
                  className={`absolute inset-0 bg-linear-to-br ${card.color} opacity-0 transition duration-500 group-hover:opacity-10`}
                />

                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.08, rotate: 6 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br ${card.color} text-2xl text-white shadow-lg`}
                >
                  {card.icon}
                </motion.div>

                {/* Title */}
                <h3 className="relative text-lg font-semibold text-white transition duration-300 group-hover:text-orange-300">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="relative mt-2 text-sm leading-6 text-zinc-400">
                  {card.description}
                </p>

                {/* CTA */}
                <div className="relative mt-6 flex items-center gap-2 text-sm font-medium text-orange-400 opacity-80 transition-all duration-300 group-hover:gap-3 group-hover:opacity-100">
                  Open Section
                  <FaArrowRight className="text-xs" />
                </div>

                {/* Bottom Glow Line */}
                <div
                  className={`absolute bottom-0 left-0 h-1 w-0 bg-linear-to-r ${card.color} transition-all duration-500 group-hover:w-full`}
                />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SuperAdminRestaurantDashboard;