import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { approvePlaceById, getPendingPlaces, rejectePlaceById } from '../../../features/user/placeSlice'

function SuperAdminApprovealPlaceList() {
  const dispatch = useDispatch()
  const [selectedPlace, setSelectedPlase] = useState(null)
  const {places = [], loading} = useSelector((state) => state.place) 

  // console.log(places);

  const handleApprove = (e, id) => {
    e.stopPropagation();
    dispatch(approvePlaceById(id));
  };

  const handleReject = (e, id) => {
    e.stopPropagation();
    dispatch(rejectePlaceById(id));
  };

  const closeModal = () => {
    setSelectedPlase(null);
  };

  useEffect(() => {
    dispatch(getPendingPlaces())
  }, [dispatch])

  return (
<div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
  {/* Header */}
  <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-gray-200 p-3 rounded-2xl shadow-sm bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-white">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-white rounded-xl shadow-md">
        {/* icon */}
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Places Pending Approval
        </h1>
        <p className="text-gray-500 dark:text-gray-300">
          Review and approve or reject Places awaiting approval
        </p>
      </div>
    </div>
  </div>

  {/* Loading */}
  {loading && (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse h-40"
          />
        ))}
      </div>
      <p className="mt-6 text-gray-600 dark:text-gray-300 text-lg font-medium text-center">
        Loading pending Places...
      </p>
    </div>
  )}

  {/* No Data */}
  {!loading && places?.length === 0 && (
    <p className="text-gray-500 dark:text-gray-400 text-center py-20">
      No pending places found.
    </p>
  )}

  {/* List */}
  {!loading && places?.length > 0 && (
    <div className="space-y-4">
      {places.map((place) => (
        <div
          key={place._id}
          onClick={() => setSelectedPlase(place)}
          className="flex flex-col md:flex-row md:items-center justify-between shadow-gray-500 p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition rounded-2xl shadow-sm"
        >
          <div>
            <h3 className="font-semibold capitalize text-gray-800 dark:text-white">
              {place.name}
            </h3>

            <p className="text-sm text-gray-500 dark:text-gray-300">
              Category: {place.category}
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-300">
              Entry Fee: ₹{place.entryfees}
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-300">
              Status:{" "}
              <span
                className={`font-semibold ${
                  place.status === "active"
                    ? "text-green-600"
                    : place.status === "pending"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {place.status}
              </span>
            </p>
          </div>

          {place.status === "pending" && (
            <div className="flex gap-2 mt-2 md:mt-0">
              <button
                onClick={(e) => handleApprove(e, place._id)}
                className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
              >
                Approve
              </button>

              <button
                onClick={(e) => handleReject(e, place._id)}
                className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )}

  {/* Modal */}
  {selectedPlace && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[90%] md:w-3/4 max-h-[90vh] overflow-y-auto p-6 relative">
        
        {/* Close */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-4 capitalize text-gray-800 dark:text-white">
          {selectedPlace.name}
        </h2>

        {/* Details */}
        <div className="grid md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
          <p><strong>Category:</strong> {selectedPlace.category}</p>
          <p><strong>Time Required:</strong> {selectedPlace.timeRequired}</p>
          <p><strong>Entry Fee:</strong> ₹{selectedPlace.entryfees}</p>
          <p><strong>Best Time:</strong> {selectedPlace.bestTimeToVisit}</p>
          <p><strong>Popular:</strong> {selectedPlace.isPopular ? "Yes" : "No"}</p>
          <p><strong>Status:</strong> {selectedPlace.status}</p>

          <p className="md:col-span-2">
            <strong>Description:</strong> {selectedPlace.description}
          </p>
        </div>

        {/* Images */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {selectedPlace.images?.map((img, index) => (
            <img
              key={index}
              src={img}
              alt="place"
              className="w-full h-32 object-cover rounded-xl"
            />
          ))}
        </div>
      </div>
    </div>
  )}
</div>
  );
}

export default SuperAdminApprovealPlaceList