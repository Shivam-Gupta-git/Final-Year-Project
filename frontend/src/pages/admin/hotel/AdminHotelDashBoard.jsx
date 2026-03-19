import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllActiveHotels, inactiveHotelByAdmin } from '../../../features/user/hotelSlice';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHotel } from 'react-icons/fa';

function AdminHotelDashBoard() {
  const dispatch = useDispatch();
  const [selectedHotel, setSelectedHotel] = useState(null);

  const {hotels = [], loading} = useSelector((state) => state.hotel)

  const handelInactiveHotel = (hotelId) => {
    dispatch(inactiveHotelByAdmin(hotelId))
  };

  useEffect(() => {
   dispatch(getAllActiveHotels())
  }, [dispatch])

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">

      {/* HEADER SECTION */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="p-4 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg text-2xl">
            <FaHotel />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Active Hotels Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Manage and monitor all active hotels on your platform
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <div className="bg-blue-100 dark:bg-blue-900/40 px-5 py-3 rounded-xl text-center">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {hotels.length}
            </p>
            <p className="text-xs text-gray-500">Total Hotels</p>
          </div>

          <div className="bg-green-100 dark:bg-green-900/40 px-5 py-3 rounded-xl text-center">
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              Active
            </p>
            <p className="text-xs text-gray-500">Status</p>
          </div>
        </div>
      </motion.div>

      {/* GRID */}
      {loading ? (
        <p className="text-gray-500">Loading hotels...</p>
      ) : hotels.length === 0 ? (
        <p className="text-gray-500">No active hotels found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {hotels
            .filter((h) => h && h._id)
            .map((hotel) => (
              <motion.div
                key={hotel._id}
                whileHover={{ y: -8, scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 200 }}
                onClick={() => setSelectedHotel(hotel)}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl transition cursor-pointer overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                {/* Image */}
                <div className="h-48 relative overflow-hidden">
                  <img
                    src={hotel.images?.[0] || "/no-image.jpg"}
                    className="w-full h-full object-cover transition duration-500 hover:scale-110"
                    alt={hotel.name}
                  />

                  <span className="absolute top-3 right-3 text-xs px-3 py-1 bg-green-500 text-white rounded-full shadow-md">
                    {hotel.status}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                    {hotel.name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    📍 {hotel.city?.name}
                  </p>

                  <p className="text-sm text-gray-400 line-clamp-2 mt-2">
                    {hotel.address}
                  </p>
                </div>
              </motion.div>
            ))}
        </div>
      )}

      {/* MODAL */}
      {selectedHotel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex justify-center items-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 w-[95%] md:w-237.5 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
          >
            <button
              onClick={() => setSelectedHotel(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-red-500"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
              {selectedHotel.name}
            </h2>

            <p className="text-gray-500 mb-4">{selectedHotel.city?.name}</p>

            {/* Gallery */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {selectedHotel.images?.map((img, i) => (
                <img key={i} src={img} className="h-40 w-full object-cover rounded-lg" />
              ))}
            </div>

            {/* Details */}
            <div className="grid md:grid-cols-2 gap-4 mt-6 text-gray-700 dark:text-gray-300">
              <p><b>Address:</b> {selectedHotel.address}</p>
              <p><b>Status:</b> {selectedHotel.status}</p>
              <p><b>Created By:</b> {selectedHotel.createdBy?.name || "Admin"}</p>
              <p>
                <b>Location:</b>{" "}
                <a
                  href={`https://www.google.com/maps?q=${selectedHotel.location?.coordinates?.[1]},${selectedHotel.location?.coordinates?.[0]}`}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  View Map
                </a>
              </p>
            </div>

            {/* Description */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">Description</h3>
              <p className="text-gray-600 dark:text-gray-300">{selectedHotel.description}</p>
            </div>

            {/* Facilities */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">Facilities</h3>
              <div className="flex flex-wrap gap-2">
                {selectedHotel.facilities?.map((f, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full text-sm">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 border-t pt-4 justify-end">
              <Link to={`/admin/rooms/${selectedHotel._id}`} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
                Show Rooms
              </Link>

              <Link to={`/admin/update-hotel-details/${selectedHotel._id}`} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg">
                Update
              </Link>

              <button onClick={() => handelInactiveHotel(selectedHotel._id)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg">
                Inactive
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default AdminHotelDashBoard;