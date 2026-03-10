import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllAdmin, updateAdminStatus } from "../../features/auth/adminAuthSlice";

function AdminApprovalPage() {
  const dispatch = useDispatch();
  const { admins, loading, error } = useSelector((state) => state.adminAuth);
  console.log(admins);

  const [actionLoading, setActionLoading] = useState({});
  const [selectedAdmin, setSelectedAdmin] = useState(null); // popup state

  useEffect(() => {
    dispatch(getAllAdmin());
  }, [dispatch]);

  const handleStatusUpdate = async (adminId, status) => {
    setActionLoading((prev) => ({ ...prev, [adminId]: true }));

    await dispatch(updateAdminStatus({ adminId, status }));

    setActionLoading((prev) => ({ ...prev, [adminId]: false }));
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        Admin Approval
      </h2>

      {loading && <p className="text-blue-500">Loading admins...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid gap-4">
        {admins?.map((admin) => (
          <div
            key={admin._id}
            onClick={() => setSelectedAdmin(admin)} // open popup
            className="cursor-pointer p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md flex justify-between items-center hover:shadow-lg transition"
          >
            {/* Admin Info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                {admin.userName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>

              <div>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {admin.userName}
                </p>

                <p className="text-sm text-gray-500">{admin.email}</p>

                <span
                  className={`text-sm font-semibold ${
                    admin.status === "approved"
                      ? "text-green-500"
                      : admin.status === "rejected"
                      ? "text-red-500"
                      : "text-yellow-500"
                  }`}
                >
                  {admin.status?.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Buttons */}
            {admin.status === "pending" && (
              <div
                className="flex gap-3"
                onClick={(e) => e.stopPropagation()} // prevent popup
              >
                <button
                  disabled={actionLoading[admin._id]}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition disabled:opacity-60"
                  onClick={() => handleStatusUpdate(admin._id, "approved")}
                >
                  {actionLoading[admin._id] ? "Approving..." : "Approve"}
                </button>

                <button
                  disabled={actionLoading[admin._id]}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition disabled:opacity-60"
                  onClick={() => handleStatusUpdate(admin._id, "rejected")}
                >
                  {actionLoading[admin._id] ? "Rejecting..." : "Reject"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ADMIN PROFILE POPUP */}
      {selectedAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-105 p-6 relative">

            {/* Close Button */}
            <button
              onClick={() => setSelectedAdmin(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl"
            >
              ✕
            </button>

            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                {selectedAdmin.userName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>

              <h3 className="text-xl font-bold mt-3 text-gray-800 dark:text-white">
                {selectedAdmin.userName}
              </h3>

              <span
                className={`text-sm font-semibold mt-1 ${
                  selectedAdmin.status === "approved"
                    ? "text-green-500"
                    : selectedAdmin.status === "rejected"
                    ? "text-red-500"
                    : "text-yellow-500"
                }`}
              >
                {selectedAdmin.status?.toUpperCase()}
              </span>
            </div>

            {/* Admin Details */}
            <div className="mt-6 space-y-3 text-sm">
              <p>
                <strong>Email:</strong> {selectedAdmin.email}
              </p>

              <p>
                <strong>Contact:</strong> {selectedAdmin.contactNumber}
              </p>

              <p>
                <strong>Role:</strong> {selectedAdmin.role}
              </p>

              <p>
                <strong>Host Type:</strong> {selectedAdmin.host || "N/A"}
              </p>

              <p>
                <strong>Verified:</strong>{" "}
                {selectedAdmin.isVerified ? "Yes" : "No"}
              </p>

              <p>
                <strong>Admin ID:</strong> {selectedAdmin._id}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminApprovalPage;