import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { approvePlaceById, deletePlace, getInactivePlacesCityWise } from "../../../features/user/placeSlice";

function GetInactivePlaceCityWise() {
  const dispatch = useDispatch();
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [activeCity, setActiveCity] = useState(null);

  const { inactiveCityWisePlaces = [], loading } = useSelector(
    (state) => state.place
  );

  const handelActiveButton = (id) => {
   dispatch(approvePlaceById(id))
   setSelectedPlace(null)
  }

  const handelDeleteButton = (id) => {
    dispatch(deletePlace(id));
    setSelectedPlace(null)
  }

  useEffect(() => {
    dispatch(getInactivePlacesCityWise());
  }, [dispatch]);

  useEffect(() => {
    if (inactiveCityWisePlaces.length > 0 && !activeCity) {
      setActiveCity(inactiveCityWisePlaces[0]);
    }
  }, [inactiveCityWisePlaces]);

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">

      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Inactive Places City Wise ❌
      </h1>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-12 w-12 border-t-4 border-red-500 rounded-full"></div>
        </div>
      )}

      {!loading && inactiveCityWisePlaces.length === 0 && (
        <p className="text-center text-gray-500 py-10">
          No inactive places found
        </p>
      )}

      {/* CITY TABS */}
      <div className="flex gap-3 flex-wrap mb-6">
        {inactiveCityWisePlaces.map((city) => (
          <button
            key={city._id}
            onClick={() => setActiveCity(city)}
            className={`px-4 py-2 rounded-xl text-sm ${
              activeCity?._id === city._id
                ? "bg-red-600 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            {city.cityName}
          </button>
        ))}
      </div>

      {/* PLACES */}
      {activeCity && (
        <div className="grid md:grid-cols-3 gap-6">
          {activeCity.places.map((place) => (
            <div
              key={place._id}
              onClick={() => setSelectedPlace(place)}
              className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow cursor-pointer"
            >
              <img
                src={place.images?.[0]}
                className="w-full h-40 object-cover rounded mb-3"
              />
              <h3 className="font-semibold">{place.name}</h3>
              <p className="text-sm text-gray-500">{place.category}</p>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedPlace && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
    
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[95%] md:w-162.5 max-h-[90vh] overflow-y-auto relative">

      {/* CLOSE BUTTON */}
      <button
        onClick={() => setSelectedPlace(null)}
        className="absolute top-4 right-4 bg-gray-200 dark:bg-gray-700 hover:bg-red-500 hover:text-white transition text-gray-700 dark:text-white rounded-full w-8 h-8 flex items-center justify-center"
      >
        ✕
      </button>

      {/* MAIN IMAGE */}
      <img
        src={selectedPlace.images?.[0]}
        alt={selectedPlace.name}
        className="w-full h-56 object-cover rounded-t-2xl"
      />

      {/* CONTENT */}
      <div className="p-6 space-y-4">

        {/* TITLE */}
        <h2 className="text-2xl font-bold capitalize text-gray-800 dark:text-white">
          {selectedPlace.name}
        </h2>

        {/* CATEGORY + STATUS */}
        <div className="flex gap-3 flex-wrap">
          <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-600 capitalize">
            {selectedPlace.category}
          </span>

          <span className={`px-3 py-1 text-xs rounded-full capitalize
            ${
              selectedPlace.status === "active"
                ? "bg-green-100 text-green-600"
                : selectedPlace.status === "inactive"
                ? "bg-red-100 text-red-600"
                : "bg-yellow-100 text-yellow-600"
            }`}
          >
            {selectedPlace.status}
          </span>
        </div>

        {/* DESCRIPTION */}
        <p className="text-gray-600 dark:text-gray-300">
          {selectedPlace.description}
        </p>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
          <p><strong>⏱ Time:</strong> {selectedPlace.timeRequired}</p>
          <p><strong>💰 Entry Fee:</strong> ₹{selectedPlace.entryfees}</p>
          <p><strong>🌤 Best Time:</strong> {selectedPlace.bestTimeToVisit}</p>
          <p><strong>⭐ Popular:</strong> {selectedPlace.isPopular ? "Yes" : "No"}</p>
        </div>

        {/* LOCATION */}
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <strong>📍 Coordinates:</strong>{" "}
          {selectedPlace.location?.coordinates?.join(", ")}
        </div>

        {/* IMAGE GALLERY */}
        {selectedPlace.images?.length >= 1 && (
          <div>
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">
              More Images
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {selectedPlace.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className="w-full h-24 object-cover rounded-lg hover:scale-105 transition"
                />
              ))}
            </div>
          </div>
        )}

        <div className="w-full flex items-center justify-end gap-2">
          <button onClick={()=> handelActiveButton(selectedPlace._id)} className="bg-blue-500 px-2 py-1 rounded-2xl text-white cursor-pointer hover:bg-blue-600">Active</button>
          <button onClick={() => handelDeleteButton(selectedPlace._id)} className="bg-red-500 px-2 py-1 rounded-2xl text-white cursor-pointer hover:bg-red-600">Delete</button>
        </div>

      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default GetInactivePlaceCityWise;