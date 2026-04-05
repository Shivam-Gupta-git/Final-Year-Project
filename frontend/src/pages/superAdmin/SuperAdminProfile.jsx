import React, { useEffect, useState } from 'react'
import { useSelector } from "react-redux";
import { FiEdit } from "react-icons/fi";
import { MdOutlineEmail } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import SuperAdminDataUpdateForm from '../../components/SuperAdminDataUpdateForm';

function SuperAdminProfile() {
  const { superAdmin, profileUpdate } = useSelector((state) => state.superAdmin);
  const [showForm, setShowForm] = useState(false);

  const getInitials = (name) => {
    if (!name) return "SA";
    const names = name.split(" ");
    return names.map((n) => n[0]).join("").toUpperCase();
  };

  useEffect(()=> {
   if(profileUpdate){
    setShowForm(false)
   }
  }, [profileUpdate])

return (
<div className="relative mx-auto mt-10 w-[94%] overflow-hidden rounded-4xl border border-white/10 bg-[#07090f] shadow-[0_25px_80px_rgba(0,0,0,0.65)] md:w-[88%] lg:w-[75%]">
  {/* Animated Background Effects */}
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -left-20 top-0 h-72 w-72 animate-pulse rounded-full bg-blue-500/10 blur-3xl" />
    <div className="absolute right-0 top-10 h-64 w-64 animate-pulse rounded-full bg-purple-500/10 blur-3xl [animation-delay:1s]" />
    <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 animate-pulse rounded-full bg-cyan-500/5 blur-3xl [animation-delay:2s]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_45%)]" />
  </div>

  <div className="relative z-10 p-5 sm:p-6 lg:p-8">
    {/* Header Card */}
    <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-linear-to-br from-[#111827]/90 via-[#0f172a]/95 to-[#020617] p-5 shadow-xl transition-all duration-500 hover:border-blue-500/30 hover:shadow-blue-500/10 sm:p-7 lg:p-8">
      {/* Hover Glow */}
      <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
        <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center">
        {/* Avatar Section */}
        <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-5">
          <div className="relative">
            {/* Animated Ring */}
            <div className="absolute -inset-1 rounded-[30px] bg-linear-to-r from-blue-500 via-cyan-500 to-purple-500 opacity-70 blur-sm transition duration-500 group-hover:opacity-100" />

            <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-linear-to-br from-blue-500 via-indigo-600 to-purple-700 text-3xl font-bold text-white shadow-2xl transition duration-500 group-hover:scale-[1.03] sm:h-32 sm:w-32 sm:text-4xl">
              {superAdmin?.avatar ? (
                <img
                  src={superAdmin.avatar}
                  alt={superAdmin.userName || "Super Admin"}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(superAdmin?.userName)
              )}
            </div>

            {/* Status Dot */}
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-2xl border-2 border-[#07090f] bg-emerald-500 shadow-lg shadow-emerald-500/30">
              <div className="h-3 w-3 animate-pulse rounded-full bg-white" />
            </div>
          </div>

          {/* Name + Contact */}
          <div className="mt-5 text-center sm:mt-0 sm:text-left">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
              <h2 className="bg-linear-to-r from-white via-blue-100 to-zinc-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
                {superAdmin?.userName || "Super Admin"}
              </h2>

              <button
                onClick={() => setShowForm(!showForm)}
                className="group/edit flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-blue-400 transition-all duration-300 hover:scale-105 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-300"
              >
                <FiEdit
                  size={18}
                  className="transition-transform duration-300 group-hover/edit:rotate-12"
                />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                Super Admin
              </span>

              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                  superAdmin?.isVerified
                    ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    : "border border-red-500/20 bg-red-500/10 text-red-300"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    superAdmin?.isVerified ? "bg-emerald-400" : "bg-red-400"
                  }`}
                />
                {superAdmin?.isVerified ? "Verified" : "Not Verified"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side Stats / Quick Details */}
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-105">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition duration-300 hover:border-blue-500/20 hover:bg-blue-500/5">
            <div className="mb-2 flex items-center gap-2 text-zinc-400">
              <MdOutlineEmail className="text-blue-400" size={18} />
              <span className="text-xs uppercase tracking-[0.18em]">
                Email Address
              </span>
            </div>

            <p className="truncate text-sm font-medium text-white sm:text-base">
              {superAdmin?.email || "No Email Found"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition duration-300 hover:border-emerald-500/20 hover:bg-emerald-500/5">
            <div className="mb-2 flex items-center gap-2 text-zinc-400">
              <IoCallOutline className="text-emerald-400" size={18} />
              <span className="text-xs uppercase tracking-[0.18em]">
                Contact Number
              </span>
            </div>

            <p className="text-sm font-medium text-white sm:text-base">
              {superAdmin?.contactNumber || "Not Available"}
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Lower Cards */}
    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="group rounded-3xl border border-white/10 bg-[#0f1117]/90 p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/20 hover:shadow-blue-500/10">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 14l9-5-9-5-9 5 9 5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 14l6.16-3.422A12.083 12.083 0 0112 20.055a12.083 12.083 0 01-6.16-9.477L12 14z"
              />
            </svg>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              User Role
            </p>
            <h3 className="text-lg font-semibold text-white">
              {superAdmin?.role || "Super Admin"}
            </h3>
          </div>
        </div>

        <p className="text-sm leading-6 text-zinc-400">
          You have complete system level access and permission to manage all
          admins, cities, places and user data.
        </p>
      </div>

      <div className="group rounded-3xl border border-white/10 bg-[#0f1117]/90 p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/20 hover:shadow-emerald-500/10">
        <div className="mb-3 flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              superAdmin?.isVerified
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4"
              />
            </svg>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Account Status
            </p>
            <h3
              className={`text-lg font-semibold ${
                superAdmin?.isVerified ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {superAdmin?.isVerified ? "Verified" : "Not Verified"}
            </h3>
          </div>
        </div>

        <p className="text-sm leading-6 text-zinc-400">
          {superAdmin?.isVerified
            ? "Your account is verified and fully trusted by the system."
            : "Please verify your account to unlock all system privileges."}
        </p>
      </div>
    </div>

    {/* Update Form */}
    <div
      className={`overflow-hidden transition-all duration-700 ease-in-out ${
        showForm
          ? "mt-6 max-h-500 opacity-100"
          : "max-h-0 opacity-0"
      }`}
    >
      <div className="rounded-[28px] border border-white/10 bg-[#0b0d13]/95 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
        <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <FiEdit size={18} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">
              Update Profile Information
            </h3>
            <p className="text-sm text-zinc-400">
              Edit your details and save the changes securely.
            </p>
          </div>
        </div>

        <SuperAdminDataUpdateForm />
      </div>
    </div>
  </div>
</div>
);
}

export default SuperAdminProfile