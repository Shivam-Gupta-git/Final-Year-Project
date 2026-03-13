import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllCities } from "../../../features/user/citySlice";
import { Link } from "react-router-dom";

function GetAllCities() {
  const dispatch = useDispatch();
  const { cities = [], loading } = useSelector((state) => state.city);

  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    dispatch(getAllCities());
  }, [dispatch]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* Page Title */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Explore Cities</h1>
        <p className="text-gray-500">
          Browse all cities available on the platform
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-gray-500">Loading cities...</p>
      )}

      {/* City Grid */}
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

        {cities?.map((city) => (
          <div
            key={city._id}
            onClick={() => setSelectedCity(city)}
            className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
          >

            {/* Image */}
            <div className="relative h-48 overflow-hidden">

              <img
                src={city.images?.[0]}
                alt={city.name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent"></div>

              {/* City Name Overlay */}
              <div className="absolute bottom-3 left-4 text-white">
                <h3 className="text-lg font-semibold capitalize">
                  {city.name}
                </h3>
                <p className="text-sm opacity-90">
                  {city.state}, {city.country}
                </p>
              </div>

            </div>

            {/* Card Info */}
            <div className="p-4">

              <p className="text-sm text-gray-500 line-clamp-2">
                {city.description}
              </p>

              <div className="mt-3 flex justify-between items-center">

                <span className="text-sm font-semibold text-blue-600">
                  ₹{city.avgDailyBudget}/day
                </span>

                <span className="text-xs text-gray-400">
                  View Details →
                </span>

              </div>

            </div>

          </div>
        ))}

      </div>

      {/* Modal */}
      {selectedCity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl shadow-2xl w-[90%] md:w-187.5 max-h-[90vh] overflow-y-auto p-6 relative">

            {/* Close Button */}
            <button
              onClick={() => setSelectedCity(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl"
            >
              ✕
            </button>

            {/* Title */}
            <h2 className="text-2xl font-bold mb-4 capitalize">
              {selectedCity.name}
            </h2>

            {/* Image Gallery */}
            <div className="grid grid-cols-2 gap-3 mb-6">

              {selectedCity.images?.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt="city"
                  className="rounded-lg object-cover h-36 w-full hover:scale-105 transition"
                />
              ))}

            </div>

            {/* City Info */}
            <div className="grid md:grid-cols-2 gap-4 text-gray-700">

              <p>
                <span className="font-semibold">State:</span> {selectedCity.state}
              </p>

              <p>
                <span className="font-semibold">Country:</span> {selectedCity.country}
              </p>

              <p>
                <span className="font-semibold">Best Time:</span>{" "}
                {selectedCity.bestTimeToVisit}
              </p>

              <p>
                <span className="font-semibold">Daily Budget:</span> ₹
                {selectedCity.avgDailyBudget}
              </p>

            </div>

            {/* Description */}
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-gray-600">
                {selectedCity.description}
              </p>
            </div>

            {/* Famous For */}
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Famous For</h3>

              <div className="flex flex-wrap gap-2 ">
 
                {Array.isArray(selectedCity.famousFor)
                  ? selectedCity.famousFor.map((item, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                      >
                        {item}
                      </span>
                    ))
                  : (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      {selectedCity.famousFor}
                    </span>
                  )}
                </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default GetAllCities;