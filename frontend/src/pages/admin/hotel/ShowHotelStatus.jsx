import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getHotelsStatus } from "../../../features/user/hotelSlice";
import { motion } from "framer-motion";
import { FaHotel, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

function ShowHotelStatus() {
  const dispatch = useDispatch();
  const { hotels = [], loading } = useSelector((state) => state.hotel);
  const [status, setStatus] = useState("active");

  useEffect(() => {
    dispatch(getHotelsStatus(status));
  }, [dispatch, status]);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      {/* FIXED HEADER */}
      <div className="sticky top-0 z-30 bg-[#050505] pb-6">
        <div className="rounded-3xl border border-white/10 bg-[#111111] px-8 py-6 shadow-2xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg">
              <FaHotel />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-wide">Hotel Status</h1>
              <p className="text-gray-400 mt-1 text-sm">
                Monitor all pending, active, and rejected hotels
              </p>
            </div>
          </div>

          {/* STATUS TABS */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setStatus("pending")}
              className={`px-5 py-2.5 rounded-2xl font-medium transition-all duration-300 border ${
                status === "pending"
                  ? "bg-yellow-500 text-black border-yellow-500 shadow-lg"
                  : "bg-[#171717] border-white/10 text-gray-300 hover:bg-[#222]"
              }`}
            >
              <span className="flex items-center gap-2">
                <FaClock /> Pending
              </span>
            </button>

            <button
              onClick={() => setStatus("active")}
              className={`px-5 py-2.5 rounded-2xl font-medium transition-all duration-300 border ${
                status === "active"
                  ? "bg-green-500 text-black border-green-500 shadow-lg"
                  : "bg-[#171717] border-white/10 text-gray-300 hover:bg-[#222]"
              }`}
            >
              <span className="flex items-center gap-2">
                <FaCheckCircle /> Active
              </span>
            </button>

            <button
              onClick={() => setStatus("rejected")}
              className={`px-5 py-2.5 rounded-2xl font-medium transition-all duration-300 border ${
                status === "rejected"
                  ? "bg-red-500 text-black border-red-500 shadow-lg"
                  : "bg-[#171717] border-white/10 text-gray-300 hover:bg-[#222]"
              }`}
            >
              <span className="flex items-center gap-2">
                <FaTimesCircle /> Rejected
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="mt-6 rounded-3xl border border-white/10 bg-[#111111] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-175">
            <thead className="bg-[#181818] border-b border-white/10 sticky top-0 z-20">
              <tr className="text-left text-sm uppercase tracking-wider text-gray-400">
                <th className="px-6 py-5">Hotel</th>
                <th className="px-6 py-5">City</th>
                <th className="px-6 py-5">Address</th>
                <th className="px-6 py-5">Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/5 animate-pulse"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#222]" />
                        <div>
                          <div className="h-4 w-36 bg-[#222] rounded mb-2" />
                          <div className="h-3 w-24 bg-[#1a1a1a] rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-20 bg-[#222] rounded" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-44 bg-[#222] rounded" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-8 w-24 rounded-full bg-[#222]" />
                    </td>
                  </tr>
                ))
              ) : hotels.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-6xl mb-4">🏨</div>
                      <h2 className="text-2xl font-semibold text-white">
                        No Hotels Found
                      </h2>
                      <p className="text-gray-400 mt-2 max-w-md text-sm">
                        There are no hotels with this status right now.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                hotels.map((hotel, index) => (
                  <motion.tr
                    key={hotel._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="border-b border-white/5 hover:bg-[#1a1a1a] transition duration-300 cursor-pointer"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <img
                          src={hotel.images?.[0] || "/no-image.jpg"}
                          alt={hotel.name}
                          className="w-16 h-16 rounded-2xl object-cover border border-white/10"
                        />

                        <div>
                          <h3 className="font-semibold text-white text-base">
                            {hotel.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            ID: {hotel._id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-gray-300">
                      {hotel.city?.name || "N/A"}
                    </td>

                    <td className="px-6 py-5 text-gray-400 max-w-xs truncate">
                      {hotel.address || "N/A"}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide ${
                          hotel.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                            : hotel.status === "active"
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : "bg-red-500/20 text-red-300 border border-red-500/30"
                        }`}
                      >
                        {hotel.status}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ShowHotelStatus;