import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { activeRoomAction, getAllRoomsByID, inactiveRoomAction } from "../../../features/user/roomSlice";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaBed } from "react-icons/fa";

function GetAllRooms() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { rooms = [], loading } = useSelector((state) => state.room);

  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    if (id) dispatch(getAllRoomsByID(id));
  }, [dispatch, id]);

  const handelActiveRoomButton = (roomId) => {
    dispatch(activeRoomAction(roomId));
  };

  const handelInactiveRoomButton = (roomId) => {
    dispatch(inactiveRoomAction(roomId));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl border border-gray-200 dark:border-gray-700 flex justify-between items-center"
      >
        <div className="flex items-center gap-4">
          <div className="p-4 bg-linear-to-r from-purple-500 to-indigo-600 text-white rounded-xl text-2xl shadow">
            <FaBed />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Rooms Dashboard</h1>
            <p className="text-gray-500">Manage all rooms of this hotel</p>
          </div>
        </div>

        <div className="bg-blue-100 dark:bg-blue-900/40 px-5 py-3 rounded-xl text-center">
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{rooms.length}</p>
          <p className="text-xs text-gray-500">Total Rooms</p>
        </div>
      </motion.div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-24 text-center">
          <div className="text-6xl mb-4">🏨</div>
          <h2 className="text-2xl font-semibold text-gray-700">No Rooms Found</h2>
          <p className="text-gray-500 mt-2 max-w-md">
            This hotel does not have any rooms yet. Please create rooms.
          </p>
          <Link to="/admin/create-room" className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700">
            Add Room
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <motion.div
              key={room._id}
              whileHover={{ y: -8, scale: 1.03 }}
              onClick={() => setSelectedRoom(room)}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="relative">
                <img src={room.images?.[0]} className="h-48 w-full object-cover" />

                <div className={`absolute top-3 right-3 px-3 py-1 text-xs text-white rounded-full ${room.status === "inactive" ? "bg-red-500" : "bg-green-500"}`}>
                  {room.status}
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white capitalize">
                  {room.roomType}
                </h3>
                <p className="text-gray-500 text-sm mt-1">Capacity: {room.capacity}</p>
                <p className="font-bold text-blue-600 mt-2">₹{room.pricePerNight} / night</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex justify-center items-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 w-[95%] md:w-225 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
          >
            <button onClick={() => setSelectedRoom(null)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">✕</button>

            <img src={selectedRoom.images?.[0]} className="h-60 w-full object-cover rounded-xl" />

            <h2 className="text-2xl font-bold mt-4 text-gray-800 dark:text-white capitalize">
              {selectedRoom.roomType}
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mt-2">{selectedRoom.description}</p>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-xl text-center">
                <p className="text-sm">Price</p>
                <p className="font-bold">₹{selectedRoom.pricePerNight}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-xl text-center">
                <p className="text-sm">Capacity</p>
                <p className="font-bold">{selectedRoom.capacity}</p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-xl text-center">
                <p className="text-sm">Total Rooms</p>
                <p className="font-bold">{selectedRoom.totalRooms}</p>
              </div>
            </div>

            {/* Amenities */}
            <div className="mt-5">
              <p className="font-semibold mb-2 text-gray-800 dark:text-white">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {selectedRoom.amenities?.map((a, i) => (
                  <span key={i} className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6 border-t pt-4 justify-end">
              <Link to={`/admin/update-room/${selectedRoom._id}`} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg">
                Update Room
              </Link>

              {selectedRoom.status === "active" ? (
                <button onClick={() => handelInactiveRoomButton(selectedRoom._id)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg">
                  Inactive
                </button>
              ) : (
                <button onClick={() => handelActiveRoomButton(selectedRoom._id)} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg">
                  Active
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default GetAllRooms;