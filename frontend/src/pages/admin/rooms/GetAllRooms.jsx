import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  activeRoomAction,
  inactiveRoomAction,
  getAllRoomsByID,
} from "../../../features/user/roomSlice";
import { Link, useParams } from "react-router-dom";

function GetAllRooms() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { rooms = [], loading } = useSelector((state) => state.room);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeType, setActiveType] = useState("All");

  // Fetch rooms
  useEffect(() => {
    if (id) dispatch(getAllRoomsByID(id));
  }, [dispatch, id]);

  // Extract unique room types
  const types = ["All", ...new Set(rooms.map((r) => r.roomType))];

  // Filter rooms based on search and type
  const filteredRooms = rooms.filter((room) => {
    const matchesType = activeType === "All" ? true : room.roomType === activeType;
    const matchesSearch = !searchTerm || room.roomNumber.toString().includes(searchTerm);
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 h-72 w-72 bg-orange-500/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 h-80 w-80 bg-blue-500/10 blur-3xl rounded-full" />

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-orange-400 text-sm font-semibold uppercase tracking-[0.35em] mb-2">
              Rooms Dashboard
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Room Management
            </h1>
            <p className="text-gray-400 mt-2 text-sm md:text-base max-w-2xl">
              View, manage and update all rooms of this hotel.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 px-5 py-4 min-w-35">
              <p className="text-xs uppercase tracking-widest text-orange-300 mb-1">
                Total Rooms
              </p>
              <h2 className="text-3xl font-bold text-white">{rooms.length}</h2>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 min-w-35">
              <p className="text-xs uppercase tracking-widest text-emerald-300 mb-1">
                Active Rooms
              </p>
              <h2 className="text-3xl font-bold text-white">
                {rooms.filter((r) => r.status === "active").length}
              </h2>
            </div>
          </div>
        </div>

        {/* Search & Type Filters */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search room by number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-2xl bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-64"
          />

          {/* Type Buttons */}
          <div className="flex flex-wrap gap-3">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-4 py-2 rounded-2xl border font-medium text-sm transition-all ${
                  activeType === type
                    ? "bg-orange-500 text-black border-orange-500"
                    : "bg-white/5 text-white border-white/10 hover:bg-orange-500/10"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 animate-pulse overflow-hidden">
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-2xl bg-white/5 border border-white/5"
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && filteredRooms.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 py-20 text-center backdrop-blur-xl">
            <div className="text-6xl mb-4">🏨</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              No Rooms Found
            </h2>
            <p className="text-gray-400">
              Try adding rooms or changing the filters/search.
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && filteredRooms.length > 0 && (
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-212.5">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
                      Room Number
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
                      Type
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
                      Price
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
                      Capacity
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
                      Status
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
                      Hotel
                    </th>
                    <th className="px-6 py-5 text-right text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
                      Details
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRooms.map((room) => (
                    <tr
                      key={room._id}
                      className="border-b border-white/5 hover:bg-white/5 transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedRoom(room)}
                    >
                      <td className="px-6 py-4">{room.roomNumber}</td>
                      <td className="px-6 py-4">{room.roomType}</td>
                      <td className="px-6 py-4">₹{room.pricePerNight}</td>
                      <td className="px-6 py-4">{room.capacity}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-xl px-3 py-1 text-xs font-semibold border ${
                            room.status === "active"
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                              : "bg-red-500/10 text-red-300 border-red-500/20"
                          }`}
                        >
                          {room.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{room.hotel?.name || "N/A"}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition-all duration-300 hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-300">
                          View Details →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Details */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-105 md:w-120 transform border-l border-white/10 bg-[#090909]/95 backdrop-blur-3xl shadow-[-20px_0_60px_rgba(0,0,0,0.7)] transition-transform duration-500 ${
          selectedRoom ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedRoom && (
          <div className="flex h-full flex-col overflow-y-auto">
            {/* Sidebar Header */}
            <div className="sticky top-0 z-10 border-b border-white/10 bg-[#090909]/90 backdrop-blur-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-orange-400 mb-1">
                  Room Details
                </p>
                <h2 className="text-2xl font-bold text-white capitalize">
                  {selectedRoom.roomType} - Room {selectedRoom.roomNumber}
                </h2>
                <p className="text-gray-400 mt-1 text-sm">
                  Hotel: {selectedRoom.hotel?.name || "N/A"}
                </p>
              </div>

              <button
                onClick={() => setSelectedRoom(null)}
                className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 text-gray-400 hover:text-red-400 hover:border-red-500/30 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Details */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Room Type
                  </p>
                  <p className="font-semibold text-white">{selectedRoom.roomType}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Price
                  </p>
                  <p className="font-semibold text-orange-300">₹{selectedRoom.pricePerNight}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Capacity
                  </p>
                  <p className="font-semibold text-white">{selectedRoom.capacity}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Status
                  </p>
                  <p className={`${selectedRoom.status === "active" ? "text-emerald-300" : "text-red-300"} font-semibold`}>
                    {selectedRoom.status}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Description
                </h3>
                <p className="text-sm leading-7 text-gray-400">
                  {selectedRoom.description || "No description available."}
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-auto sticky bottom-0 border-t border-white/10 bg-[#090909]/95 p-5 backdrop-blur-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  to={`/admin/update-room/${selectedRoom._id}`}
                  className="rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700"
                >
                  Update Room
                </Link>

                {selectedRoom.status === "active" ? (
                  <button
                    onClick={() => dispatch(inactiveRoomAction(selectedRoom._id))}
                    className="rounded-2xl px-4 py-3 bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all duration-300"
                  >
                    Make Inactive
                  </button>
                ) : (
                  <button
                    onClick={() => dispatch(activeRoomAction(selectedRoom._id))}
                    className="rounded-2xl px-4 py-3 bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all duration-300"
                  >
                    Make Active
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay */}
      {selectedRoom && (
        <div
          onClick={() => setSelectedRoom(null)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}
    </div>
  );
}

export default GetAllRooms;