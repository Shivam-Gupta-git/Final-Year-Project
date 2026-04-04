import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllAdmin } from "../../features/auth/adminAuthSlice";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaArrowRight,
  FaCircle,
  FaCheckCircle,
} from "react-icons/fa";

function AdminsDetails() {
  const dispatch = useDispatch();

  const { admins = [] } = useSelector((state) => state.adminAuth);
  const { superAdmin } = useSelector((state) => state.superAdmin);
  const { selectedAdminId, loadingAdmins, error } = useSelector(
    (state) => state.hotel
  );

  const [search, setSearch] = useState("");
  const [hostTypeFilter, setHostTypeFilter] = useState("all");

  useEffect(() => {
    dispatch(getAllAdmin());
  }, [dispatch]);

  const hostTypeCounts = useMemo(
    () => ({
      all: admins.length,
      hotel: admins.filter(
        (admin) => admin.host?.toLowerCase() === "hotel"
      ).length,
      restaurant: admins.filter(
        (admin) => admin.host?.toLowerCase() === "restaurant"
      ).length,
    }),
    [admins]
  );

  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        admin.userName?.toLowerCase().includes(searchText) ||
        admin.email?.toLowerCase().includes(searchText) ||
        admin.contactNumber?.includes(searchText);

      const matchesHostType =
        hostTypeFilter === "all" ||
        admin.host?.toLowerCase() === hostTypeFilter;

      return matchesSearch && matchesHostType;
    });
  }, [admins, search, hostTypeFilter]);

  return (
    <div className="min-h-screen bg-black p-4 md:p-8 text-white">
      {/* Header */}
      <div className="mb-8 rounded-3xl border border-white/10 bg-zinc-950/90 p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="mb-4 inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-300">
              Admin Management
            </span>

            <h1 className="text-3xl md:text-5xl font-black">
              Welcome back,{" "}
              <span className="bg-linear-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                {superAdmin?.userName}
              </span>
            </h1>

            <p className="mt-3 text-zinc-400">
              Search and filter admins by host type.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5">
            <p className="text-sm text-zinc-400">Total Admins</p>
            <h2 className="mt-1 text-3xl font-bold">{filteredAdmins.length}</h2>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 rounded-3xl border border-white/10 bg-zinc-950/80 p-4">
        <div className="relative">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />

          <input
            type="text"
            placeholder="Search admin by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/50 py-4 pl-14 pr-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500/40"
          />
        </div>
      </div>

      {/* Host Type Filters */}
      <div className="mb-8 flex flex-wrap gap-3">
        {[
          {
            key: "all",
            label: "All",
            count: hostTypeCounts.all,
            active: "border-blue-500/40 bg-blue-500/15 text-blue-300",
          },
          {
            key: "hotel",
            label: "Hotel",
            count: hostTypeCounts.hotel,
            active: "border-cyan-500/40 bg-cyan-500/15 text-cyan-300",
          },
          {
            key: "restaurant",
            label: "Restaurant",
            count: hostTypeCounts.restaurant,
            active:
              "border-purple-500/40 bg-purple-500/15 text-purple-300",
          },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setHostTypeFilter(filter.key)}
            className={`rounded-2xl border px-5 py-3 text-sm font-semibold transition-all duration-300 ${
              hostTypeFilter === filter.key
                ? filter.active
                : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:bg-white/10 hover:text-white"
            }`}
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-300">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/90 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <div className="overflow-x-auto">
          <table className="min-w-250 w-full">
            <thead className="border-b border-white/10 bg-white/3">
              <tr>
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Admin
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Host Type
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Contact
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Location
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Status
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loadingAdmins ? (
                [...Array(5)].map((_, index) => (
                  <tr key={index} className="border-b border-white/5 animate-pulse">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-zinc-800" />
                        <div>
                          <div className="mb-2 h-4 w-32 rounded bg-zinc-800" />
                          <div className="h-3 w-48 rounded bg-zinc-800" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-8 w-24 rounded-full bg-zinc-800" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-28 rounded bg-zinc-800" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-24 rounded bg-zinc-800" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-8 w-20 rounded-full bg-zinc-800" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-10 w-28 rounded-xl bg-zinc-800" />
                    </td>
                  </tr>
                ))
              ) : filteredAdmins.length > 0 ? (
                filteredAdmins.map((admin) => (
                  <tr
                    key={admin._id}
                    className="border-b border-white/5 transition hover:bg-white/3"
                  >
                    {/* Admin */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
                          {admin.avatar ? (
                            <img
                              src={admin.avatar}
                              alt={admin.userName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-blue-600 to-cyan-500 text-sm font-bold text-white">
                              {admin.userName?.charAt(0)?.toUpperCase()}
                            </div>
                          )}

                          <div
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border border-black ${
                              admin.isLoggedIn
                                ? "bg-emerald-400"
                                : "bg-zinc-600"
                            }`}
                          />
                        </div>

                        <div>
                          <h3 className="font-semibold text-white">
                            {admin.userName}
                          </h3>
                          <p className="mt-1 text-sm text-zinc-500">
                            {admin.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Host Type */}
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                          admin.host?.toLowerCase() === "hotel"
                            ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                            : "bg-purple-500/10 text-purple-300 border border-purple-500/20"
                        }`}
                      >
                        {admin.host || "Unknown"}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-5 text-sm text-zinc-300">
                      {admin.contactNumber}
                    </td>

                    {/* Location */}
                    <td className="px-6 py-5 text-sm text-zinc-400">
                      {admin.location?.city || "Unknown"},{" "}
                      {admin.location?.state || "Unknown"}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                            admin.isActive
                              ? "bg-emerald-500/10 text-emerald-300"
                              : "bg-red-500/10 text-red-300"
                          }`}
                        >
                          <FaCircle className="text-[8px]" />
                          {admin.isActive ? "Active" : "Inactive"}
                        </span>

                        {admin.isVerified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-300">
                            <FaCheckCircle className="text-[10px]" />
                            Verified
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-5">
                      <Link
                        to={`/superAdmin/admin-products/${admin._id}`}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                          selectedAdminId === admin._id
                            ? "bg-linear-to-r from-blue-600 to-cyan-500 text-white"
                            : "border border-white/10 bg-white/5 text-zinc-300 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-white"
                        }`}
                      >
                        View Items
                        <FaArrowRight className="text-xs" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <FaSearch className="mb-4 text-3xl text-zinc-600" />
                      <h3 className="text-lg font-semibold text-white">
                        No admins found
                      </h3>
                      <p className="mt-2 text-sm text-zinc-500">
                        Try another search or host type filter.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminsDetails;