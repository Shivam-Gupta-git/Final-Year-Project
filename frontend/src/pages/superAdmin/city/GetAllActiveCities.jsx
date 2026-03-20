// components/city/GetActiveCities.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getActiveCities,
  inactiveCity,
} from "../../../features/user/citySlice";
import { Link, useNavigate } from "react-router-dom";
import { FaCity } from "react-icons/fa";

function GetAllActiveCities() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState(null);
  const { cities = [], loading, success } = useSelector((state) => state.city);
  const { superAdmin } = useSelector((state) => state.superAdmin);

  useEffect(() => {
    dispatch(getActiveCities());
  }, [dispatch]);

  const handelInactiveCity = (cityId) => {
    dispatch(inactiveCity(cityId));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 ">
  
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-linear-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl">
            <FaCity />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Explore Cities
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Hi <span className="font-medium">{superAdmin?.userName}</span>, manage your platform from here.
            </p>
          </div>
        </div>
  
        <Link
          to="/superAdmin/createCity"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition text-sm text-center"
        >
          + Create City
        </Link>
      </div>
  
      {/* Loading / Empty / City Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-white dark:bg-gray-800 rounded-2xl h-72 shadow-md"
            >
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-2xl"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : cities.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No active cities found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {cities.map((city) => (
            <div
              key={city._id}
              onClick={() => setSelectedCity(city)}
              className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-transform duration-300 hover:-translate-y-2"
            >
              {/* City Image */}
              <div className="relative h-48 overflow-hidden rounded-t-2xl">
                <img
                  src={city.images?.[0]}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute bottom-3 left-4 text-white">
                  <h3 className="text-lg font-semibold capitalize">{city.name}</h3>
                  <p className="text-sm opacity-90">{city.state}, {city.country}</p>
                </div>
              </div>
  
              {/* Card Info */}
              <div className="p-4">
                <p className="text-sm text-gray-500 dark:text-gray-300 line-clamp-2">
                  {city.description}
                </p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    ₹{city.avgDailyBudget}/day
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">View Details →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
  
      {/* Selected City Modal */}
      {selectedCity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[90%] md:w-200 max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setSelectedCity(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl"
            >
              ✕
            </button>
  
            <h2 className="text-2xl font-bold mb-4 capitalize text-gray-800 dark:text-white">
              {selectedCity.name}
            </h2>
  
            <div className="grid grid-cols-2 gap-3 mb-6">
              {selectedCity.images?.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt="city"
                  className="rounded-xl object-cover h-36 w-full hover:scale-105 transition-transform duration-300"
                />
              ))}
            </div>
  
            <div className="grid md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
              <p><span className="font-semibold">State:</span> {selectedCity.state}</p>
              <p><span className="font-semibold">Country:</span> {selectedCity.country}</p>
              <p><span className="font-semibold">Best Time:</span> {selectedCity.bestTimeToVisit}</p>
              <p><span className="font-semibold">Daily Budget:</span> ₹{selectedCity.avgDailyBudget}</p>
            </div>
  
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">Description</h3>
              <p className="text-gray-600 dark:text-gray-300">{selectedCity.description}</p>
            </div>
  
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">Famous For</h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(selectedCity.famousFor)
                  ? selectedCity.famousFor.map((item, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full"
                      >
                        {item}
                      </span>
                    ))
                  : <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full">{selectedCity.famousFor}</span>
                }
              </div>
  
              <div className="flex gap-3 mt-4 justify-end border-t pt-4">
                <Link
                  to={`/superAdmin/updateCityDetails/${selectedCity._id}`}
                  className="flex-1 md:flex-none px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-center transition"
                >
                  Update
                </Link>
                <button
                  onClick={() => handelInactiveCity(selectedCity._id)}
                  disabled={loading}
                  className="flex-1 md:flex-none px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
                >
                  {loading ? "Processing..." : "Inactive"}
                </button>
              </div>
            </div>
  
          </div>
        </div>
      )}
    </div>
  );
}

export default GetAllActiveCities;
