import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  approveCityById,
  getPendingCities,
  rejectCityById,
} from "../../../features/user/citySlice";
import { FaCity } from "react-icons/fa";

function SuperAdminApprovealCityList() {
  const dispatch = useDispatch();
  const { cities = [], loading } = useSelector((state) => state.city);
  //  console.log(cities);
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    dispatch(getPendingCities());
  }, [dispatch]);

  const handleApprove = (e, id) => {
    e.stopPropagation();
    dispatch(approveCityById(id));
  };

  const handleReject = (e, id) => {
    e.stopPropagation();
    dispatch(rejectCityById(id));
  };

  const closeModal = () => {
    setSelectedCity(null);
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-gray-200 p-3 rounded-2xl shadow-sm bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-white rounded-xl shadow-md">
            <FaCity size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Cities Pending Approval
            </h1>
            <p className="text-gray-500 dark:text-gray-300">
              Review and approve or reject cities awaiting approval
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          {/* Animated placeholder cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse h-40"
              />
            ))}
          </div>

          {/* Loading Text */}
          <p className="mt-6 text-gray-600 dark:text-gray-300 text-lg font-medium text-center">
            Loading pending cities...
          </p>
        </div>
      )}

      {/* No Cities */}
      {!loading && cities?.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-20">
          No pending cities found.
        </p>
      )}

      {/* City List */}
      {!loading && cities?.length > 0 && (
        <div className="space-y-4">
          {cities.map((city) => (
            <div
              key={city._id}
              onClick={() => setSelectedCity(city)}
              className="flex flex-col md:flex-row md:items-center justify-between shadow-gray-500 p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition rounded-2xl shadow-sm"
            >
              <div>
                <h3 className="font-semibold capitalize text-gray-800 dark:text-white">
                  {city.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      city.status === "active"
                        ? "text-green-600"
                        : city.status === "pending"
                        ? "text-yellow-600"
                        : city.status === "rejected"
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {city.status}
                  </span>
                </p>
              </div>

              {city.status === "pending" && (
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button
                    onClick={(e) => handleApprove(e, city._id)}
                    disabled={loading}
                    className="flex items-center justify-center text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="loader border-t-white border-blue-500 animate-spin rounded-full w-4 h-4 mr-2"></span>
                        Approving...
                      </>
                    ) : (
                      "Approve"
                    )}
                  </button>

                  <button
                    onClick={(e) => handleReject(e, city._id)}
                    disabled={loading}
                    className="flex items-center justify-center text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="loader border-t-white border-blue-500 animate-spin rounded-full w-4 h-4 mr-2"></span>
                        Rejecting...
                      </>
                    ) : (
                      "Reject"
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Popup Modal */}
      {selectedCity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[90%] md:w-3/4 max-h-[90vh] overflow-y-auto p-6 relative">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 dark:text-gray-300 hover:text-red-500 text-xl"
            >
              ✕
            </button>

            {/* Title */}
            <h2 className="text-2xl font-bold mb-4 capitalize text-gray-800 dark:text-white">
              {selectedCity.name} Details
            </h2>

            {/* Info */}
            <div className="grid md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
              <p>
                <strong>State:</strong> {selectedCity.state}
              </p>
              <p>
                <strong>Country:</strong> {selectedCity.country}
              </p>
              <p>
                <strong>Description:</strong> {selectedCity.description}
              </p>
              <p>
                <strong>Best Time To Visit:</strong>{" "}
                {selectedCity.bestTimeToVisit}
              </p>
              <p>
                <strong>Avg Budget:</strong> ₹{selectedCity.avgDailyBudget}
              </p>
              <p>
                <strong>Famous For:</strong>{" "}
                {Array.isArray(selectedCity.famousFor)
                  ? selectedCity.famousFor.join(", ")
                  : selectedCity.famousFor}
              </p>
            </div>

            {/* Images */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {selectedCity.images?.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt="city"
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

export default SuperAdminApprovealCityList;
