import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { approveRestaurantById, getPendingRestaurant, rejecteRestaurantById } from "../../../features/user/restaurantSlice";
import { getActiveCities } from "../../../features/user/citySlice";
import { FaUtensils } from "react-icons/fa";

function SuperAdminApprovealRestaurant() {
  const dispatch = useDispatch();

  const { restaurants = [], loading } = useSelector(
    (state) => state.restaurant
  );

  const { cities = [] } = useSelector((state) => state.city);

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedCity, setSelectedCity] = useState("");

  /* -------- FETCH DATA -------- */
  useEffect(() => {
    dispatch(getPendingRestaurant({ page: 1, city: selectedCity }));
  }, [dispatch, selectedCity]);

  useEffect(() => {
    dispatch(getActiveCities());
  }, [dispatch]);

  const handleApprove = (e, id) => {
    e.stopPropagation();
    dispatch(approveRestaurantById(id));
  };

  const handleReject = (e, id) => {
    e.stopPropagation();
    dispatch(rejecteRestaurantById(id));
  };

  const closeModal = () => {
    setSelectedRestaurant(null);
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* HEADER */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border p-3 rounded-2xl shadow-sm bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-100 dark:bg-orange-800 rounded-xl shadow-md">
            <FaUtensils size={28} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Restaurants Pending Approval
            </h1>
            <p className="text-gray-500 dark:text-gray-300">
              Review and approve or reject restaurants
            </p>
          </div>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          {/* LEFT SIDE - FILTER */}
          <div className="flex flex-col w-full md:w-1/3">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Filter by City
            </label>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            >
              <option value="">All Cities</option>
              {cities.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* RIGHT SIDE - BUTTON */}
          <div className="flex justify-end">
            <button
              onClick={() => setSelectedCity("")}
              className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition shadow-sm"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* LOADING */}
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

          <p className="mt-6 text-gray-600 dark:text-gray-300 text-lg">
            Loading pending restaurants...
          </p>
        </div>
      )}

      {/* EMPTY */}
      {!loading && restaurants.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-20">
          No pending restaurants found.
        </p>
      )}

      {/* LIST */}
      {!loading && restaurants.length > 0 && (
        <div className="space-y-4">
          {restaurants.map((r) => (
            <div
              key={r._id}
              onClick={() => setSelectedRestaurant(r)}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition rounded-2xl shadow-sm border"
            >
              {/* LEFT */}
              <div>
                <h3 className="font-semibold capitalize text-gray-800 dark:text-white">
                  {r.name}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-300">
                  📍 {r.city?.name}
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {r.foodType} • ₹{r.avgCostForOne}
                </p>

                <p className="text-sm text-gray-500">
                  Status:{" "}
                  <span className="text-yellow-600 font-semibold">
                    {r.status}
                  </span>
                </p>
              </div>

              {/* ACTIONS */}
              {r.status === "pending" && (
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button
                    
                    onClick={(e) => handleApprove(e, r._id)}
                    className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Approve
                  </button>

                  <button
                    onClick={(e) => handleReject(e, r._id)}
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

      {/* MODAL */}
      {selectedRestaurant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[90%] md:w-3/4 max-h-[90vh] overflow-y-auto p-6 relative">
            {/* CLOSE */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl"
            >
              ✕
            </button>

            {/* TITLE */}
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
              {selectedRestaurant.name} Details
            </h2>

            {/* INFO */}
            <div className="grid md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
              <p>
                <strong>City:</strong> {selectedRestaurant.city?.name}
              </p>
              <p>
                <strong>Address:</strong> {selectedRestaurant.address}
              </p>
              <p>
                <strong>Food Type:</strong> {selectedRestaurant.foodType}
              </p>
              <p>
                <strong>Famous Food:</strong> {selectedRestaurant.famousFood}
              </p>
              <p>
                <strong>Cost:</strong> ₹{selectedRestaurant.avgCostForOne}
              </p>
              <p>
                <strong>Best Time:</strong> {selectedRestaurant.bestTime}
              </p>
              <p>
                <strong>Opening:</strong>{" "}
                {selectedRestaurant.openingHours?.open} -{" "}
                {selectedRestaurant.openingHours?.close}
              </p>
              <p>
                <strong>Location:</strong>{" "}
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

            {/* IMAGES */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {selectedRestaurant.images?.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className="w-full h-32 object-cover rounded"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdminApprovealRestaurant;
