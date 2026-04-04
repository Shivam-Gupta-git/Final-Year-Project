import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllAdmin,
  updateAdminStatus,
} from "../../features/auth/adminAuthSlice";
import {
  FaUserShield,
  FaSearch,
  FaCheck,
  FaTimes,
  FaChevronRight,
  FaEnvelope,
  FaPhone,
  FaUserTag,
  FaMapMarkerAlt,
} from "react-icons/fa";

function AdminApprovalPage() {
  const dispatch = useDispatch();

  const { admins = [], loading, error } = useSelector(
    (state) => state.adminAuth
  );

  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHost, setSelectedHost] = useState("All");
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    dispatch(getAllAdmin());
  }, [dispatch]);

  const handleStatusUpdate = async (adminId, status) => {
    setActionLoading((prev) => ({
      ...prev,
      [adminId]: true,
    }));

    await dispatch(updateAdminStatus({ adminId, status }));

    setActionLoading((prev) => ({
      ...prev,
      [adminId]: false,
    }));
  };

  const hostFilters = useMemo(() => {
    const hosts = [
      ...new Set(
        admins
          .map((admin) => admin.host)
          .filter((host) => host && host.trim() !== "")
      ),
    ];

    return ["All", ...hosts];
  }, [admins]);

  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        admin.userName?.toLowerCase().includes(search) ||
        admin.email?.toLowerCase().includes(search) ||
        admin.contactNumber?.toLowerCase().includes(search) ||
        admin.host?.toLowerCase().includes(search);

      const matchesHost =
        selectedHost === "All" || admin.host === selectedHost;

      return matchesSearch && matchesHost;
    });
  }, [admins, searchTerm, selectedHost]);

  const pendingCount = admins.filter(
    (admin) => admin.status === "pending"
  ).length;

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-8 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)] pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 animate-pulse">
                  <FaUserShield className="text-2xl text-blue-400" />
                </div>

                <div>
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Admin Approval Dashboard
                  </h1>

                  <p className="mt-2 text-sm text-zinc-400 sm:text-base">
                    Review, approve, or reject admin accounts with smart filters
                    and search.
                  </p>
                </div>
              </div>

              {/* STATS */}
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4">
                  <p className="text-xs uppercase tracking-widest text-zinc-500">
                    Total Admins
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-white">
                    {admins.length}
                  </h3>
                </div>

                <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-5 py-4">
                  <p className="text-xs uppercase tracking-widest text-yellow-300">
                    Pending
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-yellow-400">
                    {pendingCount}
                  </h3>
                </div>

                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 py-4">
                  <p className="text-xs uppercase tracking-widest text-blue-300">
                    Showing
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-blue-400">
                    {filteredAdmins.length}
                  </h3>
                </div>
              </div>
            </div>

            {/* SEARCH */}
            <div className="w-full xl:max-w-md">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, phone, host..."
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 py-4 pl-12 pr-4 text-white placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* HOST FILTERS */}
        <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex min-w-max gap-3">
            {hostFilters.map((host) => (
              <button
                key={host}
                type="button"
                onClick={() => setSelectedHost(host)}
                className={`rounded-2xl border px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  selectedHost === host
                    ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800"
                }`}
              >
                {host}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="flex min-h-100 items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-950">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-6 py-8 text-center text-red-400">
            {error}
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950 px-6 py-20 text-center">
            <FaUserShield className="mx-auto mb-4 text-5xl text-zinc-600" />

            <h2 className="text-2xl font-semibold text-white">
              No admins found
            </h2>

            <p className="mt-2 text-zinc-500">
              Try changing the search text or host filter.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-zinc-900">
                  <tr className="border-b border-zinc-800">
                    <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Admin
                    </th>

                    <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Email
                    </th>

                    <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Host Type
                    </th>

                    <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Status
                    </th>

                    <th className="px-6 py-5 text-right text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAdmins.map((admin, index) => (
                    <tr
                      key={admin._id}
                      className={`border-b border-zinc-800 transition-all duration-300 hover:bg-zinc-900/70 ${
                        index % 2 === 0 ? "bg-zinc-950" : "bg-zinc-900/20"
                      }`}
                    >
                      {/* ADMIN */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white">
                            {admin.userName
                              ?.split(" ")
                              .map((word) => word[0])
                              .join("")
                              .toUpperCase()}
                          </div>

                          <div>
                            <h3 className="text-base font-semibold text-white">
                              {admin.userName}
                            </h3>

                            <p className="mt-1 text-sm text-zinc-500">
                              {admin.contactNumber || "No phone"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td className="px-6 py-5 text-zinc-300">
                        {admin.email}
                      </td>

                      {/* HOST */}
                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm text-blue-300 capitalize">
                          {admin.host || "N/A"}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border ${
                            admin.status === "approved"
                              ? "border-green-500/20 bg-green-500/10 text-green-400"
                              : admin.status === "rejected"
                              ? "border-red-500/20 bg-red-500/10 text-red-400"
                              : "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full animate-pulse ${
                              admin.status === "approved"
                                ? "bg-green-400"
                                : admin.status === "rejected"
                                ? "bg-red-400"
                                : "bg-yellow-400"
                            }`}
                          />
                          {admin.status?.toUpperCase()}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          {admin.status === "pending" && (
                            <>
                              <button
                                type="button"
                                disabled={actionLoading[admin._id]}
                                onClick={() =>
                                  handleStatusUpdate(admin._id, "approved")
                                }
                                className="inline-flex items-center rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-500 disabled:opacity-50"
                              >
                                <FaCheck className="mr-2" />
                                {actionLoading[admin._id]
                                  ? "Approving..."
                                  : "Approve"}
                              </button>

                              <button
                                type="button"
                                disabled={actionLoading[admin._id]}
                                onClick={() =>
                                  handleStatusUpdate(admin._id, "rejected")
                                }
                                className="inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
                              >
                                <FaTimes className="mr-2" />
                                {actionLoading[admin._id]
                                  ? "Rejecting..."
                                  : "Reject"}
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedAdmin(admin)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                          >
                            <FaChevronRight />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SIDE PANEL */}
        {selectedAdmin && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
            <div className="h-full w-full max-w-md overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-[slideIn_.35s_ease]">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Admin Details
                </h2>

                <button
                  type="button"
                  onClick={() => setSelectedAdmin(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="flex flex-col items-center border-b border-zinc-800 pb-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-600 text-3xl font-bold text-white shadow-lg shadow-blue-500/20">
                  {selectedAdmin.userName
                    ?.split(" ")
                    .map((word) => word[0])
                    .join("")
                    .toUpperCase()}
                </div>

                <h3 className="mt-4 text-2xl font-bold text-white">
                  {selectedAdmin.userName}
                </h3>

                <span className="mt-3 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1 text-sm font-medium text-blue-300 capitalize">
                  {selectedAdmin.host || "N/A"}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <FaEnvelope className="text-blue-400" />
                    <span className="text-sm">Email</span>
                  </div>

                  <p className="mt-2 text-white">{selectedAdmin.email}</p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <FaPhone className="text-green-400" />
                    <span className="text-sm">Contact Number</span>
                  </div>

                  <p className="mt-2 text-white">
                    {selectedAdmin.contactNumber || "N/A"}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <FaUserTag className="text-purple-400" />
                    <span className="text-sm">Role</span>
                  </div>

                  <p className="mt-2 text-white capitalize">
                    {selectedAdmin.role}
                  </p>
                </div>

                {selectedAdmin.city && (
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                    <div className="flex items-center gap-3 text-zinc-400">
                      <FaMapMarkerAlt className="text-red-400" />
                      <span className="text-sm">City</span>
                    </div>

                    <p className="mt-2 text-white">
                      {typeof selectedAdmin.city === "object"
                        ? selectedAdmin.city.name
                        : selectedAdmin.city}
                    </p>
                  </div>
                )}

                <div
                  className={`rounded-2xl border p-4 ${
                    selectedAdmin.status === "approved"
                      ? "border-green-500/20 bg-green-500/10"
                      : selectedAdmin.status === "rejected"
                      ? "border-red-500/20 bg-red-500/10"
                      : "border-yellow-500/20 bg-yellow-500/10"
                  }`}
                >
                  <p className="text-sm text-zinc-400">Current Status</p>

                  <h4
                    className={`mt-2 text-2xl font-bold ${
                      selectedAdmin.status === "approved"
                        ? "text-green-400"
                        : selectedAdmin.status === "rejected"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {selectedAdmin.status?.toUpperCase()}
                  </h4>
                </div>

                {selectedAdmin.status === "pending" && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() =>
                        handleStatusUpdate(selectedAdmin._id, "approved")
                      }
                      className="rounded-2xl bg-green-600 px-4 py-3 font-medium text-white transition hover:bg-green-500"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        handleStatusUpdate(selectedAdmin._id, "rejected")
                      }
                      className="rounded-2xl bg-red-600 px-4 py-3 font-medium text-white transition hover:bg-red-500"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminApprovalPage;