import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllActiveHotels, inactiveHotelByAdmin } from '../../../features/user/hotelSlice';
import { Link } from 'react-router-dom';

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
    <div className="mt-5 h-full">
    <div className="p-8 bg-gray-50">
      {/* TITLE */}
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Active Hotels
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading hotels...</p>
      ) : hotels.length === 0 ? (
        <p className="text-gray-500">No active hotels found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.isArray(hotels) &&
            hotels
              .filter((h) => h && h._id)
              .map((hotel) => (
                <div
                  key={hotel._id}
                  onClick={() => setSelectedHotel(hotel)}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer overflow-hidden"
                >
                  {/* IMAGE */}
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={hotel.images?.[0] || "/no-image.jpg"}
                      className="w-full h-full object-cover hover:scale-105 transition"
                      alt={hotel.name || "hotel"}
                    />

                    {/* STATUS BADGE */}
                    <span className="absolute top-3 right-3 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      {hotel.status}
                    </span>
                  </div>

                  {/* INFO */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{hotel.name}</h3>

                    <p className="text-sm text-gray-500">
                      {hotel.city?.name}
                    </p>

                    <p className="text-sm text-gray-400 line-clamp-2 mt-2">
                      {hotel.address}
                    </p>
                  </div>
                </div>
              ))}
        </div>
      )}

      {/* MODAL */}
      {selectedHotel && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white w-[95%] md:w-225 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedHotel(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-red-500"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-2">
              {selectedHotel.name}
            </h2>

            <p className="text-gray-500 mb-4">{selectedHotel.city?.name}</p>

            {/* GALLERY */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {selectedHotel.images?.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className="h-40 w-full object-cover rounded-lg"
                />
              ))}
            </div>

            {/* DETAILS */}
            <div className="grid md:grid-cols-2 gap-4 mt-6 text-gray-700">
              <p>
                <b>Address:</b> {selectedHotel.address}
              </p>

              <p>
                <b>Status:</b> {selectedHotel.status}
              </p>

              <p>
                <b>Created By:</b>{" "}
                {selectedHotel.createdBy?.name || "Admin"}
              </p>

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

            {/* DESCRIPTION */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600">{selectedHotel.description}</p>
            </div>

            {/* FACILITIES */}
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Facilities</h3>

              <div className="flex flex-wrap gap-2">
                {selectedHotel.facilities?.map((f, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* ACTIONS */}
            
            <div className="flex gap-3 mt-6 border-t pt-4 justify-end">
            <Link
                to={`/admin/rooms/${selectedHotel._id}`}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Show Rooms
              </Link>

              <Link
                to={`/admin/update-hotel-details/${selectedHotel._id}`}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Update
              </Link>
             
                <button
                  onClick={() => handelInactiveHotel(selectedHotel._id)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                >
                  Inactive
                </button>
           
            </div>
          </div>
        </div>
      )}
    </div>

  </div>
  )
}

export default AdminHotelDashBoard