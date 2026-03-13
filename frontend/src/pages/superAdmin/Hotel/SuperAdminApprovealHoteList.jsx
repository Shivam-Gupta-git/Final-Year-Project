import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { approveHotelById, getPendingHotels } from '../../../features/user/hotelSlice'

function SuperAdminApprovealHoteList() {
  const dispatch = useDispatch()
  const [selectedHotel, setSelectedHotel] = useState(null);
  const { hotels, loading } = useSelector((state) => state.hotel)
   console.log(hotels);

  useEffect(() => {
   dispatch(getPendingHotels())
  }, [dispatch])

  const handleApprove = (e, id) => {
    e.stopPropagation();
    dispatch(approveHotelById(id))

  };

  const handleReject = (e, id) => {
    e.stopPropagation();

  };

  const closeModal = () => {
    setSelectedHotel(null);
  };
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Cities Pending Approval</h2>

      {/* City List */}
      <div className="space-y-3">
        {hotels.length > 0 ? (
          hotels.map((hotel) => (
            <div
              key={hotel._id}
              onClick={() => setSelectedHotel(hotel)}
              className="flex items-center justify-between border p-4 rounded cursor-pointer hover:bg-gray-100 transition"
            >
              <div>
                <h3 className="font-semibold capitalize">{hotel.name}</h3>

                <p>
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      hotel.status === "active"
                        ? "text-green-600"
                        : hotel.status === "pending"
                        ? "text-yellow-600"
                        : hotel.status === "rejected"
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {hotel.status}
                  </span>
                </p>
              </div>

              {hotel.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleApprove(e, hotel._id)}
                    disabled={loading}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Approve
                  </button>

                  <button
                    onClick={(e) => handleReject(e, hotel._id)}
                    disabled={loading}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No pending cities</p>
        )}
      </div>

      {/* Popup Modal */}
      {selectedHotel && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-[95%] md:w-225 max-h-[90vh] overflow-y-auto p-6 relative">

      {/* CLOSE */}
      <button
        onClick={closeModal}
        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl"
      >
        ✕
      </button>

      {/* TITLE */}
      <h2 className="text-2xl font-bold mb-2 capitalize">
        {selectedHotel.name}
      </h2>

      {/* STATUS */}
      <span className={`inline-block px-3 py-1 text-sm rounded-full mb-5
        ${selectedHotel.status === "pending" ? "bg-yellow-100 text-yellow-700" :
          selectedHotel.status === "active" ? "bg-green-100 text-green-700" :
          selectedHotel.status === "inactive" ? "bg-red-100 text-red-700" :
          "bg-gray-100 text-gray-700"
        }`}>
        {selectedHotel.status}
      </span>

      {/* IMAGES */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {selectedHotel.images?.map((img, index) => (
          <img
            key={index}
            src={img}
            alt="hotel"
            className="w-full h-44 object-cover rounded-xl hover:scale-105 transition"
          />
        ))}
      </div>

      {/* INFO */}
      <div className="grid md:grid-cols-2 gap-4 text-gray-700">

        <p>
          <span className="font-semibold">City:</span>{" "}
          {selectedHotel.city?.name || "City not loaded"}
        </p>

        <p>
          <span className="font-semibold">Address:</span>{" "}
          {selectedHotel.address}
        </p>

        <p className="md:col-span-2">
          <span className="font-semibold">Description:</span>{" "}
          {selectedHotel.description}
        </p>

        <p>
          <span className="font-semibold">Created By:</span>{" "}
          {selectedHotel.createdBy?.name || "Admin"}
        </p>

        {/* MAP LINK */}
        <p>
          <span className="font-semibold">Location:</span>{" "}
          <a
            href={`https://www.google.com/maps?q=${selectedHotel.location?.coordinates?.[1]},${selectedHotel.location?.coordinates?.[0]}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            View on Map
          </a>
        </p>
      </div>

      {/* FACILITIES */}
      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-2">Facilities</h3>

        <div className="flex flex-wrap gap-2">
          {selectedHotel.facilities?.map((f, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      {selectedHotel.status === "pending" && (
        <div className="flex gap-3 mt-8">

          <button
            onClick={(e) => handleApprove(e, selectedHotel._id)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold"
          >
            Approve Hotel
          </button>

          <button
            onClick={(e) => handleReject(e, selectedHotel._id)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold"
          >
            Reject Hotel
          </button>

        </div>
      )}

    </div>
  </div>
)}
    </div>
  );
}

export default SuperAdminApprovealHoteList