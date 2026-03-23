import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPlacesCityWise } from "../../../features/user/placeSlice";

function GetPlaceCityWise() {
  const dispatch = useDispatch();
  const { cityWisePlaces = [], loading } = useSelector((state) => state.place);

  const [selectedCityId, setSelectedCityId] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    dispatch(getPlacesCityWise());
  }, [dispatch]);

  // ✅ set default selected city
  useEffect(() => {
    if (cityWisePlaces.length > 0 && !selectedCityId) {
      setSelectedCityId(cityWisePlaces[0]._id);
    }
  }, [cityWisePlaces, selectedCityId]);

  const selectedCity = cityWisePlaces.find(
    (city) => city._id === selectedCityId
  );

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white  px-3 py-5 rounded-2xl shadow-sm shadow-gray-500">
        City Wise Places 🌍
      </h1>

      {/* 🔥 CITY TABS */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-6">
        {cityWisePlaces.map((city) => (
          <button
            key={city._id}
            onClick={() => setSelectedCityId(city._id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition 
              ${
                selectedCityId === city._id
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 hover:text-black duration-300"
              }`}
          >
            {city.cityName}
          </button>
        ))}
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-center py-10 text-gray-500">
          Loading places...
        </p>
      )}

      {/* NO DATA */}
      {!loading && !selectedCity && (
        <p className="text-center text-gray-500">
          No places found
        </p>
      )}

      {/* ✅ SELECTED CITY DATA */}
      {!loading && selectedCity && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-blue-600">
            {selectedCity.cityName}
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {selectedCity.places.map((place) => (
              <div
                key={place._id}
                onClick={() => setSelectedPlace(place)}
                className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow hover:shadow-lg transition cursor-pointer"
              >
                <img
                  src={place.images?.[0]}
                  alt={place.name}
                  className="w-full h-40 object-cover rounded-xl mb-3"
                />

                <h3 className="text-lg font-semibold capitalize text-gray-800 dark:text-white">
                  {place.name}
                </h3>

                <p className="text-sm text-gray-500">
                  {place.category}
                </p>

                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                  {place.description}
                </p>

                <p className="text-sm mt-2 text-gray-500">
                  ⏱ {place.timeRequired}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedPlace && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative">

      {/* ❌ Close Button */}
      <button
        onClick={() => setSelectedPlace(null)}
        className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-xl"
      >
        ✕
      </button>

      {/* 🔥 Title */}
      <h2 className="text-2xl font-bold mb-4 capitalize text-gray-800 dark:text-white">
        {selectedPlace.name}
      </h2>

      {/* 🖼️ Images */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {selectedPlace.images?.map((img, i) => (
          <img
            key={i}
            src={img}
            alt="place"
            className="w-full h-40 object-cover rounded-xl"
          />
        ))}
      </div>

      {/* 📄 Details */}
      <div className="space-y-2 text-gray-700 dark:text-gray-300">
        <p><strong>Category:</strong> {selectedPlace.category}</p>
        <p><strong>Description:</strong> {selectedPlace.description}</p>
        <p><strong>Time Required:</strong> {selectedPlace.timeRequired}</p>
        <p><strong>Entry Fees:</strong> ₹{selectedPlace.entryfees}</p>
        <p><strong>Best Time:</strong> {selectedPlace.bestTimeToVisit}</p>

        <p>
          <strong>Status:</strong>{" "}
          <span
            className={`font-semibold ${
              selectedPlace.status === "active"
                ? "text-green-600"
                : selectedPlace.status === "pending"
                ? "text-yellow-600"
                : "text-red-500"
            }`}
          >
            {selectedPlace.status}
          </span>
        </p>
      </div>

    </div>
  </div>
)}
    </div>

    
  );
}

export default GetPlaceCityWise;