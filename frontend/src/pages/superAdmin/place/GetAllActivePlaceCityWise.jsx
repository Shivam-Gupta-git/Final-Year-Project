import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getActivePlacesCityWise,
  inactivePlace,
} from "../../../features/user/placeSlice";
import { Link } from "react-router-dom";

function GetAllActivePlaceCityWise() {
  const dispatch = useDispatch();
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [activeCity, setActiveCity] = useState(null);

  const { cityWisePlaces = [], loading } = useSelector((state) => state.place);

  const handelInactiveButton = (id) => {
    dispatch(inactivePlace(id));
    setSelectedPlace(null);
  };

  useEffect(() => {
    dispatch(getActivePlacesCityWise());
  }, [dispatch]);

  useEffect(() => {
    if (cityWisePlaces.length > 0 && !activeCity) {
      setActiveCity(cityWisePlaces[0]);
    }
  }, [cityWisePlaces]);

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white  px-3 py-5 rounded-2xl shadow-sm shadow-gray-500">
        Active Places City Wise 🌍
      </h1>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
      )}

      {/* NO DATA */}
      {!loading && cityWisePlaces.length === 0 && (
        <p className="text-center text-gray-500 py-10">
          No active places found
        </p>
      )}

      {/* 🔥 CITY TABS */}
      {!loading && cityWisePlaces.length > 0 && (
        <div className="flex gap-3 flex-wrap mb-8 overflow-x-auto">
          {cityWisePlaces.map((city) => (
            <button
              key={city._id}
              onClick={() => setActiveCity(city)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition whitespace-nowrap
                ${
                  activeCity?._id === city._id
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
            >
              {city.cityName} ({city.places.length})
            </button>
          ))}
        </div>
      )}

      {/* 🔥 ACTIVE CITY PLACES */}
      {activeCity && (
        <div>
          <h2 className="text-2xl font-semibold mb-5 text-blue-600 capitalize">
            {activeCity.cityName}
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {activeCity.places.map((place) => (
              <div
                key={place._id}
                onClick={() => setSelectedPlace(place)}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow hover:shadow-xl transition cursor-pointer group"
              >
                {/* IMAGE */}
                <div className="overflow-hidden">
                  <img
                    src={place.images?.[0]}
                    alt={place.name}
                    className="w-full h-40 object-cover group-hover:scale-105 transition"
                  />
                </div>

                {/* CONTENT */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold capitalize text-gray-800 dark:text-white">
                    {place.name}
                  </h3>

                  <p className="text-sm text-gray-500 capitalize">
                    {place.category}
                  </p>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                    {place.description}
                  </p>

                  <p className="text-sm mt-2 text-gray-500">
                    ⏱ {place.timeRequired}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔥 MODAL */}
      {selectedPlace && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[90%] md:w-150 max-h-[90vh] overflow-y-auto p-6 relative">
            {/* CLOSE */}
            <button
              onClick={() => setSelectedPlace(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl"
            >
              ✕
            </button>

            {/* TITLE */}
            <h2 className="text-2xl font-bold mb-4 capitalize text-gray-800 dark:text-white">
              {selectedPlace.name}
            </h2>

            {/* MAIN IMAGE */}
            <img
              src={selectedPlace.images?.[0]}
              className="w-full h-52 object-cover rounded-xl mb-4"
            />

            {/* DETAILS */}
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p>
                <strong>Category:</strong> {selectedPlace.category}
              </p>
              <p>
                <strong>Description:</strong> {selectedPlace.description}
              </p>
              <p>
                <strong>Time Required:</strong> {selectedPlace.timeRequired}
              </p>
              <p>
                <strong>Entry Fees:</strong> ₹{selectedPlace.entryfees}
              </p>
              <p>
                <strong>Best Time:</strong> {selectedPlace.bestTimeToVisit}
              </p>
            </div>

            {/* EXTRA IMAGES */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {selectedPlace.images?.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  className="w-full h-28 object-cover rounded"
                />
              ))}
            </div>
            <div className="w-full flex p-2 items-center justify-end gap-3">
              <Link
                to={`/superAdmin/update-place-Details/${selectedPlace._id}`}
                className="bg-blue-500 rounded-2xl px-2 py-1 hover:bg-blue-600 cursor-pointer"
              >
                Update
              </Link>

              <button
                onClick={() => handelInactiveButton(selectedPlace._id)}
                className="bg-red-500 rounded-2xl px-2 py-1 hover:bg-red-600 cursor-pointer"
              >
                Inactive
              </button>
            </div>
          </div>
          <div></div>
        </div>
      )}
    </div>
  );
}

export default GetAllActivePlaceCityWise;
