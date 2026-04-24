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
    <div className="min-h-screen bg-gray-50 px-3 sm:px-4 md:px-8 py-5 sm:py-6 text-gray-900 relative overflow-hidden">

      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-0 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-blue-200/30 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-0 h-64 w-64 sm:h-80 sm:w-80 rounded-full bg-purple-200/30 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/3 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-cyan-200/30 blur-3xl animate-pulse" />
      </div>

      {/* Header */}
      <div className="mb-6 sm:mb-8 rounded-3xl border border-gray-200 bg-white/80 p-4 sm:p-6 md:p-8 shadow-lg backdrop-blur-xl">
        <div className="flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div className="text-center lg:text-left">
            <span className="mb-3 inline-flex rounded-full border border-blue-300/40 bg-blue-200/20 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-blue-600">
              Admin Management
            </span>

            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black leading-tight">
              Welcome back,{" "}
              <span className="bg-linear-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                {superAdmin?.userName}
              </span>
            </h1>

            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600">
              Search and filter admins by host type.
            </p>
          </div>

          <div className="mx-auto lg:mx-0 rounded-2xl border border-gray-200 bg-white/10 px-5 sm:px-6 py-4 sm:py-5 backdrop-blur-sm text-center">
            <p className="text-xs sm:text-sm text-gray-600">Total Admins</p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900">
              {filteredAdmins.length}
            </h2>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-5 sm:mb-6 rounded-3xl border border-gray-200 bg-white/50 p-3 sm:p-4 backdrop-blur-sm">
        <div className="relative">
          <FaSearch className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

          <input
            type="text"
            placeholder="Search admin by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white/30 py-3 sm:py-4 pl-12 sm:pl-14 pr-4 text-sm sm:text-base text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-400"
          />
        </div>
      </div>

      {/* Host Type Filters */}
      <div className="mb-8 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
        {[
          { key: "all", label: "All", count: hostTypeCounts.all, active: "border-blue-400/40 bg-blue-200/20 text-blue-600" },
          { key: "hotel", label: "Hotel", count: hostTypeCounts.hotel, active: "border-cyan-400/40 bg-cyan-200/20 text-cyan-600" },
          { key: "restaurant", label: "Restaurant", count: hostTypeCounts.restaurant, active: "border-purple-400/40 bg-purple-200/20 text-purple-600" },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setHostTypeFilter(filter.key)}
            className={`flex flex-col items-center justify-center rounded-2xl border px-3 py-3 text-xs font-semibold transition-all duration-300 sm:flex-row sm:px-5 sm:text-sm ${
              hostTypeFilter === filter.key
                ? filter.active
                : "border-gray-200 bg-white/10 text-gray-600 hover:border-gray-300 hover:bg-white/20 hover:text-gray-900"
            }`}
          >
            <span>{filter.label}</span>
            <span className="mt-0.5 text-[11px] opacity-70 sm:mt-0 sm:ml-1">({filter.count})</span>
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 sm:mb-6 rounded-2xl border border-red-300 bg-red-100 px-4 sm:px-5 py-3 sm:py-4 text-sm text-red-600 text-center">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white/80 shadow-lg backdrop-blur-xl">

        {/* Mobile scroll fix */}
        <div className="w-full overflow-x-auto">
          <table className="min-w-200 w-full">

            <thead className="border-b border-gray-200 bg-white/30">
              <tr>
                {["Admin", "Host Type", "Contact", "Location", "Status", "Action"].map((header) => (
                  <th
                    key={header}
                    className="px-4 sm:px-6 py-4 sm:py-5 text-left text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-500"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loadingAdmins ? (
                [...Array(5)].map((_, index) => (
                  <tr key={index} className="border-b border-gray-200 animate-pulse">
                    {[...Array(6)].map((_, i) => (
                      <td key={i} className="px-4 sm:px-6 py-4 sm:py-5">
                        <div className="h-5 sm:h-6 w-full rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredAdmins.length > 0 ? (
                filteredAdmins.map((admin) => (
                  <tr key={admin._id} className="border-b border-gray-200 hover:bg-gray-100 transition">

                    {/* Admin */}
                    <td className="px-4 sm:px-6 py-4 sm:py-5">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-2xl overflow-hidden border bg-gray-100">
                          {admin.avatar ? (
                            <img src={admin.avatar} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-blue-400 to-cyan-300 text-xs sm:text-sm font-bold text-white">
                              {admin.userName?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                          <div className={`absolute bottom-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border border-white ${admin.isLoggedIn ? "bg-emerald-400" : "bg-gray-400"}`} />
                        </div>

                        <div>
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                            {admin.userName}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {admin.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Host */}
                    <td className="px-4 sm:px-6 py-4 sm:py-5">
                      <span className={`text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-full font-semibold ${
                        admin.host?.toLowerCase() === "hotel"
                          ? "bg-cyan-200/20 text-cyan-600 border border-cyan-400/40"
                          : "bg-purple-200/20 text-purple-600 border border-purple-400/40"
                      }`}>
                        {admin.host}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-xs sm:text-sm text-gray-600">
                      {admin.contactNumber}
                    </td>

                    {/* Location */}
                    <td className="px-4 sm:px-6 py-4 sm:py-5 text-xs sm:text-sm text-gray-600">
                      {admin.location?.city}, {admin.location?.state}
                    </td>

                    {/* Status */}
                    <td className="px-4 sm:px-6 py-4 sm:py-5">
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        <span className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-full ${
                          admin.isActive ? "bg-emerald-200/20 text-emerald-600" : "bg-red-200/20 text-red-600"
                        }`}>
                          {admin.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-4 sm:px-6 py-4 sm:py-5">
                      <Link
                        to={`/superAdmin/admin-products/${admin._id}`}
                        className="text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl border border-gray-200 hover:bg-blue-200/20"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 sm:px-6 py-12 sm:py-16 text-center">
                    <FaSearch className="mx-auto mb-3 text-2xl sm:text-3xl text-gray-400" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      No admins found
                    </h3>
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