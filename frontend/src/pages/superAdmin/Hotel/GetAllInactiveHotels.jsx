import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { approveHotelById, deleteHotel, getAllInactiveHotels } from '../../../features/user/hotelSlice';

function GetAllInactiveHotels() {
  const dispatch = useDispatch();
  const {hotels = [], loading} = useSelector((state) => state.hotel)

  console.log(hotels);

  useEffect(() => {
  dispatch(getAllInactiveHotels())
  }, [dispatch])

  const handelActiveButtton = (hotelId) => {
   dispatch(approveHotelById(hotelId))
  };

  const handelDeleteCityButton = (hotelId) => {
    dispatch(deleteHotel(hotelId))
   }

  return (
<div className="p-8 bg-gray-50 min-h-screen">
  <h2 className="text-3xl font-bold mb-8 text-gray-800">
    Inactive Hotels
  </h2>

  {loading ? (
    <p className="text-gray-500">Loading inactive hotels...</p>
  ) : hotels.length === 0 ? (
    <p className="text-gray-400">No inactive hotels found</p>
  ) : (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {hotels.map((hotel) => (
        <div
          key={hotel._id}
          className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden border"
        >
          {/* IMAGE */}
          <div className="relative h-44">
            <img
              src={hotel.images?.[0]}
              alt={hotel.name}
              className="w-full h-full object-cover grayscale"
            />

            {/* STATUS */}
            <span className="absolute top-3 right-3 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
              {hotel.status}
            </span>
          </div>

          {/* INFO */}
          <div className="p-4">
            <h3 className="font-semibold text-lg">
              {hotel.name}
            </h3>

            <p className="text-sm text-gray-500">
              {hotel.city?.name}
            </p>

            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
              {hotel.address}
            </p>

            {/* FACILITIES PREVIEW */}
            <div className="flex flex-wrap gap-1 mt-3">
              {hotel.facilities?.slice(0, 3).map((f, i) => (
                <span
                  key={i}
                  className="text-xs bg-gray-100 px-2 py-1 rounded"
                >
                  {f}
                </span>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 mt-4">

              <button
                onClick={() => handelActiveButtton(hotel._id)}
                disabled={loading}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-1 rounded"
              >
                Activate
              </button>

              <button
                onClick={() => handelDeleteCityButton(hotel._id)}
                disabled={loading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-1 rounded"
              >
                Delete
              </button>

            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
  )
}

export default GetAllInactiveHotels