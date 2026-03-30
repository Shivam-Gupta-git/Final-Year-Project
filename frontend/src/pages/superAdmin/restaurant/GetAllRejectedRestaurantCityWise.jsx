import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {deleteRestaurant, getAllRejectedRestaurantCityWise} from "../../../features/user/restaurantSlice";
import { getActiveCities } from "../../../features/user/citySlice";
import { FaUtensils } from "react-icons/fa";

function GetAllRejectedRestaurantCityWise() {
  const dispatch = useDispatch();

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const { restaurants = [], loading } = useSelector(
    (state) => state.restaurant
  );
  const { cities = [] } = useSelector((state) => state.city);

  useEffect(() => {
    dispatch(getActiveCities());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllRejectedRestaurantCityWise({ city: selectedCity, page: 1 }));
  }, [dispatch, selectedCity]);

  const handelDelete = (e, id) => {
    e.stopPropagation()
    dispatch(deleteRestaurant(id))
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">

    {/* HEADER */}
    <div className="mb-8 flex items-center gap-4 bg-orange-100 dark:bg-orange-800 p-4 rounded-2xl shadow">
      <div className="p-3 bg-orange-500 text-white rounded-xl">
        <FaUtensils size={22} />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Restaurants by City
        </h1>
        <p className="text-gray-500 dark:text-gray-300 text-sm">
          Explore restaurants based on selected city
        </p>
      </div>
    </div>

    {/* FILTER */}
    <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex flex-wrap gap-4 items-center justify-between">
      
      <div className="flex flex-col w-64">
        <label className="text-sm text-gray-500 mb-1">
          Select City
        </label>

        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="border px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white"
        >
          <option value="">All Cities</option>
          {cities.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => setSelectedCity("")}
        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300"
      >
        Reset
      </button>
    </div>

    {/* LOADING */}
    {loading && (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    )}

    {/* EMPTY */}
    {!loading && restaurants.length === 0 && (
      <div className="text-center py-20 text-gray-500">
        🍽️ No Restaurants Found
      </div>
    )}

    {/* LIST */}
    {!loading && restaurants.length > 0 && (
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {restaurants.map((r) => (
          <div
            key={r._id}
            onClick={() => setSelectedRestaurant(r)}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-xl transition overflow-hidden cursor-pointer "
          >
            {/* IMAGE */}
            <div className="h-40">
              <img
                src={r.images?.[0] || "/no-image.jpg"}
                className="w-full h-full object-cover"
                alt={r.name}
              />
            </div>

            {/* INFO */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 dark:text-white">
                {r.name}
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                📍 {r.city?.name}
              </p>

              <p className="text-sm text-gray-400 mt-1">
                {r.foodType} • ₹{r.avgCostForOne}
              </p>

              <p className="text-xs mt-2 text-green-600 font-medium">
                {r.status}
              </p>
            </div>
            {/* buttons */}
            <div onClick={(e) => handelDelete(e, r._id)} className=" flex items-center justify-end p-2">
              <button className="px-2 py-1 rounded-xl bg-red-400 hover:bg-red-500 hover:text-white duration-300 cursor-pointer">Delete</button>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* MODAL */}
    {selectedRestaurant && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[95%] md:w-200 max-h-[90vh] overflow-y-auto p-6 relative">

          {/* CLOSE */}
          <button
            onClick={() => setSelectedRestaurant(null)}
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl"
          >
            ✕
          </button>

          {/* TITLE */}
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {selectedRestaurant.name}
          </h2>

          <p className="text-gray-500 mb-4">
            📍 {selectedRestaurant.city?.name}
          </p>

          {/* IMAGES */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {selectedRestaurant.images?.map((img, i) => (
              <img
                key={i}
                src={img}
                className="h-32 w-full object-cover rounded-lg"
                alt="restaurant"
              />
            ))}
          </div>

          {/* DETAILS */}
          <div className="grid md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300 text-sm ">
            <p><b>Food Type:</b> {selectedRestaurant.foodType}</p>
            <p><b>Famous Food:</b> {selectedRestaurant.famousFood}</p>
            <p><b>Average Cost:</b> ₹{selectedRestaurant.avgCostForOne}</p>
            <p><b>Status:</b> {selectedRestaurant.status}</p>
            <p><b>Best Time:</b> {selectedRestaurant.bestTime}</p>
            <p><b>Address:</b> {selectedRestaurant.address}</p>

            <p>
              <b>Opening Hours:</b>{" "}
              {selectedRestaurant.openingHours?.open} -{" "}
              {selectedRestaurant.openingHours?.close}
            </p>

            <p>
              <b>Location:</b>{" "}
              <a
                href={`https://maps.google.com?q=${selectedRestaurant.location?.coordinates?.[1]},${selectedRestaurant.location?.coordinates?.[0]}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                View Map
              </a>
            </p>
          </div>

        </div>
      </div>
    )}

  </div>
  )
}

export default GetAllRejectedRestaurantCityWise