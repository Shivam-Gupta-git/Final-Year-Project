import React from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  FaUserSecret,
  FaCity,
  FaClipboardList,
  FaArrowRight,
} from "react-icons/fa";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const { admin } = useSelector((state) => state.admin);

  const getInitials = (name) => {
    if (!name) return "SA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const cards = [
    {
      title: "All Hotels",
      description: "View, manage and update all hotels from one place.",
      icon: <FaCity />,
      color: "from-fuchsia-500/20 via-pink-500/10 to-transparent border-fuchsia-500/20",
      iconBg: "from-fuchsia-500 to-pink-500",
      link: "/admin/hotel-dashboard",
    },
    {
      title: "Hotel Status",
      description: "Track approval, availability and hotel activity.",
      icon: <FaClipboardList />,
      color: "from-cyan-500/20 via-blue-500/10 to-transparent border-cyan-500/20",
      iconBg: "from-cyan-500 to-blue-600",
      link: "/admin/show-hotel-status",
    },
    {
      title: "Bookings Dashboard",
      description: "Monitor all hotel bookings and manage them efficiently.",
      icon: <FaClipboardList />,
      color: "from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/20",
      iconBg: "from-amber-500 to-orange-600",
      link: "/admin/hotel-booking-dashboard",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-6 py-6">

      {/* Top Hero */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-4xl border border-white/10 bg-linear-to-br from-zinc-950 via-zinc-900 to-black p-6 md:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.55)]"
      >
        {/* glow effects */}
        <div className="absolute -top-16 -right-16 h-52 w-52 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-purple-600/20 blur-3xl" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
          {/* Left section */}
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="h-24 w-24 md:h-28 md:w-28 rounded-3xl bg-linear-to-br from-blue-500 via-indigo-500 to-purple-600 p-0.5 shadow-2xl">
                <div className="h-full w-full rounded-3xl bg-zinc-950 flex items-center justify-center overflow-hidden">
                  {admin?.avatar ? (
                    <img
                      src={admin.avatar}
                      alt={admin?.userName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-black text-white">
                      {getInitials(admin?.userName)}
                    </span>
                  )}
                </div>
              </div>

              <div className="absolute -bottom-2 -right-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-xl">
                Online
              </div>
            </div>

            {/* Text */}
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.35em] text-zinc-500">
                Hotel Admin Panel
              </p>

              <h1 className="text-3xl md:text-5xl font-black leading-tight">
                Welcome back,{" "}
                <span className="bg-linear-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent">
                  {admin?.userName?.split(" ")[0] || "Admin"}
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm md:text-base text-zinc-400 leading-7">
                Manage hotels, track bookings and control everything from your
                premium dashboard experience.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 backdrop-blur-xl">
                  <FaUserSecret className="text-orange-400" />
                  Host:{" "}
                  <span className="font-semibold text-white">
                    {admin?.host || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right buttons */}
          <div className="flex flex-col sm:flex-row xl:flex-col gap-4 w-full xl:w-auto">
            <Link
              to="/admin/create-hotel"
              className="group min-w-55 rounded-2xl border border-blue-500/20 bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-4 font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(37,99,235,0.45)]"
            >
              <div className="flex items-center justify-between">
                <span>Add Hotel</span>
                <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              to="/admin/create-room"
              className="group min-w-55 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:border-white/20"
            >
              <div className="flex items-center justify-between">
                <span>Add Room</span>
                <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Section heading */}
      <div className="mt-10 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Dashboard Modules
          </h2>
          <p className="mt-1 text-zinc-500">
            Quickly access and manage all hotel operations
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <Link key={index} to={card.link}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.12 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`group relative overflow-hidden rounded-3xl border bg-linear-to-br ${card.color} p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.45)]`}
            >
              {/* subtle glow */}
              <div className="absolute top-0 right-0 h-28 w-28 rounded-full bg-white/5 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div
                className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br ${card.iconBg} text-2xl text-white shadow-lg`}
              >
                {card.icon}
              </div>

              <h3 className="text-xl font-bold text-white">{card.title}</h3>

              <p className="mt-3 text-sm leading-7 text-zinc-400">
                {card.description}
              </p>

              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-zinc-300 transition-all duration-300 group-hover:text-white">
                Open Module
                <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;