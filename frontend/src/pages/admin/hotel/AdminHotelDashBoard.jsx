import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllActiveHotels, inactiveHotelByAdmin } from "../../../features/user/hotelSlice";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaHotel, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

function AdminHotelDashBoard() {
  const dispatch = useDispatch();
  const [selectedHotel, setSelectedHotel] = useState(null);

  const { hotels = [], loading } = useSelector((state) => state.hotel);

  useEffect(() => {
    dispatch(getAllActiveHotels());
  }, [dispatch]);

  const handleInactive = (id) => {
    dispatch(inactiveHotelByAdmin(id));
    setSelectedHotel(null);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 overflow-hidden">
      {/* Fixed Header */}
      <div className="sticky top-0 z-30 mb-6 rounded-3xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl px-8 py-6 shadow-2xl">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl shadow-lg">
              <FaHotel />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Active Hotels
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                View and manage all currently active hotels
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-white/10 bg-zinc-800 px-5 py-3 text-center">
              <p className="text-2xl font-bold text-white">
                {hotels.length}
              </p>
              <p className="text-xs uppercase tracking-wider text-zinc-400">
                Hotels
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6 flex-col md:flex-row">
        {/* Main Table */}
        <div className={`transition-all duration-300 ${selectedHotel ? "md:w-[68%]" : "w-full"}`}>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-175">
                <thead className="bg-zinc-800 text-left text-sm uppercase tracking-wide text-zinc-400">
                  <tr>
                    <th className="px-6 py-5">Hotel</th>
                    <th className="px-6 py-5">City</th>
                    <th className="px-6 py-5">Rooms</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(8)].map((_, index) => (
                      <tr key={index} className="border-t border-white/5 animate-pulse">
                        <td className="px-6 py-5">
                          <div className="h-10 w-40 rounded-xl bg-zinc-800" />
                        </td>
                        <td className="px-6 py-5">
                          <div className="h-5 w-24 rounded bg-zinc-800" />
                        </td>
                        <td className="px-6 py-5">
                          <div className="h-5 w-16 rounded bg-zinc-800" />
                        </td>
                        <td className="px-6 py-5">
                          <div className="h-8 w-20 rounded-full bg-zinc-800" />
                        </td>
                        <td className="px-6 py-5">
                          <div className="h-9 w-24 rounded-xl bg-zinc-800" />
                        </td>
                      </tr>
                    ))
                  ) : hotels.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-16 text-center text-zinc-500">
                        No active hotels found.
                      </td>
                    </tr>
                  ) : (
                    hotels.map((hotel) => (
                      <tr
                        key={hotel._id}
                        onClick={() => setSelectedHotel(hotel)}
                        className={`cursor-pointer border-t border-white/5 transition-all duration-200 hover:bg-zinc-800/80 ${
                          selectedHotel?._id === hotel._id ? "bg-zinc-800" : ""
                        }`}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <img
                              src={hotel.images?.[0] || "/no-image.jpg"}
                              alt={hotel.name}
                              className="h-14 w-14 rounded-2xl object-cover"
                            />
                            <div>
                              <p className="font-semibold text-white">{hotel.name}</p>
                              <p className="text-sm text-zinc-500">{hotel.address}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-zinc-300">{hotel.city?.name}</td>
                        <td className="px-6 py-5 text-zinc-300">{hotel.rooms?.length || 0}</td>
                        <td className="px-6 py-5">
                          <span className="rounded-full bg-emerald-500/20 px-4 py-1 text-sm font-medium text-emerald-400 border border-emerald-500/20">
                            {hotel.status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <button className="rounded-xl border border-white/10 bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side Panel */}
        <AnimatePresence>
          {selectedHotel && (
            <motion.div
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 60, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="sticky top-28 h-[calc(100vh-8rem)] w-full md:w-[32%] overflow-y-auto rounded-3xl border border-white/10 bg-zinc-900 p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedHotel.name}</h2>
                  <p className="mt-1 text-sm text-zinc-400">{selectedHotel.city?.name}</p>
                </div>
                <button
                  onClick={() => setSelectedHotel(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-800 text-xl text-zinc-400 hover:bg-red-500 hover:text-white"
                >
                  <IoClose />
                </button>
              </div>

              <img
                src={selectedHotel.images?.[0] || "/no-image.jpg"}
                alt={selectedHotel.name}
                className="mb-6 h-56 w-full rounded-3xl object-cover"
              />

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-zinc-800 p-4">
                  <p className="mb-2 text-xs uppercase tracking-widest text-zinc-500">Address</p>
                  <p className="text-sm text-zinc-300">{selectedHotel.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-zinc-800 p-4">
                    <p className="text-xs uppercase tracking-widest text-zinc-500">Rooms</p>
                    <p className="mt-2 text-xl font-bold text-white">{selectedHotel.rooms?.length || 0}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-zinc-800 p-4">
                    <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500">
                      <FaClock /> Status
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">{selectedHotel.status}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <Link
                  to={`/admin/rooms/${selectedHotel._id}`}
                  className="flex items-center justify-center rounded-2xl bg-zinc-700 px-4 py-3 font-medium text-white transition hover:bg-zinc-600"
                >
                  Show Rooms
                </Link>
                <Link
                  to={`/admin/update-hotel-details/${selectedHotel._id}`}
                  className="flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-500"
                >
                  Update Hotel
                </Link>
                <button
                  onClick={() => handleInactive(selectedHotel._id)}
                  className="rounded-2xl bg-red-600 px-4 py-3 font-medium text-white transition hover:bg-red-500"
                >
                  Mark Inactive
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AdminHotelDashBoard;