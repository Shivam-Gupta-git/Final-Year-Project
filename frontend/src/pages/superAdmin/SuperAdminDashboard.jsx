import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllAdmin } from "../../features/auth/adminAuthSlice";
import {
  FaUsers,
  FaServer,
  FaUserCheck,
  FaArrowRight,
  FaBell,
  FaClock,
  FaChartLine,
} from "react-icons/fa";

function SuperAdminDashboard() {
  const dispatch = useDispatch();
  const { superAdmin } = useSelector((state) => state.superAdmin);
  const { admins } = useSelector((state) => state.adminAuth);

  useEffect(() => {
    dispatch(getAllAdmin());
  }, [dispatch]);

  const getInitials = (name) => {
    if (!name) return "SA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const stats = [
    {
      title: "Total Users",
      value: "0",
      icon: <FaUsers className="text-xl text-cyan-300" />,
      iconBg: "from-cyan-500/20 to-blue-500/20",
      border: "border-cyan-500/20",
      glow: "group-hover:shadow-cyan-500/20",
    },
    {
      title: "Total Admins",
      value: admins?.length || 0,
      icon: <FaUserCheck className="text-xl text-violet-300" />,
      iconBg: "from-violet-500/20 to-fuchsia-500/20",
      border: "border-violet-500/20",
      glow: "group-hover:shadow-violet-500/20",
      link: "/superAdmin/admin-details",
    },
    {
      title: "Active Sessions",
      value: "0",
      icon: <FaChartLine className="text-xl text-amber-300" />,
      iconBg: "from-amber-500/20 to-orange-500/20",
      border: "border-amber-500/20",
      glow: "group-hover:shadow-amber-500/20",
    },
    {
      title: "System Status",
      value: "Running",
      icon: <FaServer className="text-xl text-emerald-300" />,
      iconBg: "from-emerald-500/20 to-green-500/20",
      border: "border-emerald-500/20",
      glow: "group-hover:shadow-emerald-500/20",
      status: true,
    },
  ];

  return (
    <div className="min-h-screen bg-black px-4 py-6 md:px-8 lg:px-10 text-white">
      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 left-0 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-600/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-[#111827] via-[#0F172A] to-black shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          <div className="relative p-6 md:p-8">
            {/* Decorative Elements */}
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute bottom-0 right-20 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              {/* LEFT SIDE */}
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 rounded-3xl bg-linear-to-r from-blue-600 to-violet-600 blur-lg opacity-40" />
                  <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-blue-600 to-violet-700 text-2xl font-bold text-white shadow-2xl">
                    {superAdmin?.avatar ? (
                      <img
                        src={superAdmin.avatar}
                        alt={superAdmin.userName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(superAdmin?.userName)
                    )}
                  </div>
                </div>

                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
                    <FaBell className="text-[10px]" />
                    Super Admin Panel
                  </div>

                  <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl">
                    {greeting},{" "}
                    <span className="bg-linear-to-r from-blue-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
                      {superAdmin?.userName || "Super Admin"}
                    </span>
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400 md:text-base">
                    Monitor platform activity, manage admins, and keep your
                    system running smoothly from one place.
                  </p>

                  {/* Quick Info */}
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
                      <FaClock className="text-cyan-400" />
                      Last login: Today
                    </div>

                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">
                      System Online
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE ACTION */}
              <div className="flex flex-col gap-4 sm:flex-row xl:flex-col xl:items-end">
                <Link
                  to="/superAdmin/admin-registration"
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-4 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(79,70,229,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(79,70,229,0.6)]"
                >
                  <span className="text-lg">+</span>
                  Register New Admin
                  <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <p className="text-right text-xs leading-6 text-gray-500 xl:max-w-55">
                  Add and manage new administrators with full platform access.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* STATS SECTION */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((card, index) => {
            const CardWrapper = card.link ? Link : "div";

            return (
              <CardWrapper
                key={index}
                to={card.link}
                className={`group relative overflow-hidden rounded-3xl border ${card.border} bg-[#0F1117]/95 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-2 hover:border-white/20 hover:shadow-2xl ${card.glow}`}
              >
                {/* Card Glow */}
                <div
                  className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-linear-to-br ${card.iconBg} blur-2xl transition-transform duration-500 group-hover:scale-125`}
                />

                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      {card.title}
                    </p>

                    <div className="mt-4 flex items-end gap-2">
                      <h3
                        className={`text-3xl font-bold ${
                          card.status ? "text-emerald-400" : "text-white"
                        }`}
                      >
                        {card.value}
                      </h3>

                      {!card.status && (
                        <span className="mb-1 text-xs text-emerald-400">
                          +0%
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-xs leading-6 text-gray-500">
                      {card.title === "Total Users" &&
                        "Track the total number of users on your platform."}
                      {card.title === "Total Admins" &&
                        "Manage all registered administrators."}
                      {card.title === "Active Sessions" &&
                        "Monitor active sessions across the system."}
                      {card.title === "System Status" &&
                        "Everything is running without issues."}
                    </p>
                  </div>

                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-linear-to-br ${card.iconBg} backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
                  >
                    {card.icon}
                  </div>
                </div>

                {card.link && (
                  <div className="relative mt-6 flex items-center gap-2 text-sm font-medium text-violet-300 transition group-hover:text-violet-200">
                    View Details
                    <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                )}
              </CardWrapper>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;