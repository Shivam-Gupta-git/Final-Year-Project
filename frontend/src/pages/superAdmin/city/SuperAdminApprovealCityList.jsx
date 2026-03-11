import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  approveCityById,
  getPendingCities,
  rejectCityById,
} from "../../../features/user/citySlice";

function SuperAdminApprovealCityList() {
  const dispatch = useDispatch();
  const { cities = [], loading } = useSelector((state) => state.city);
   console.log(cities);
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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Cities Pending Approval</h2>

      {/* City List */}
      <div className="space-y-3">
        {cities.length > 0 ? (
          cities.map((city) => (
            <div
              key={city._id}
              onClick={() => setSelectedCity(city)}
              className="flex items-center justify-between border p-4 rounded cursor-pointer hover:bg-gray-100 transition"
            >
              <div>
                <h3 className="font-semibold capitalize">{city.name}</h3>

                <p>
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
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleApprove(e, city._id)}
                    disabled={loading}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Approve
                  </button>

                  <button
                    onClick={(e) => handleReject(e, city._id)}
                    disabled={loading}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No pending cities</p>
        )}
      </div>

      {/* Popup Modal */}
      {selectedCity && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[90%] md:w-150 p-6 relative max-h-[90vh] overflow-y-auto">

            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-lg"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4 capitalize">
              {selectedCity.name} Details
            </h2>

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