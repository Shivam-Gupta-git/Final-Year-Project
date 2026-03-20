import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getHotelsStatus } from "../../../features/user/hotelSlice";
import { Link } from "react-router-dom";


function ShowHotelStatus() {
  const dispatch = useDispatch();
  const { hotels = [], loading } = useSelector((state) => state.hotel);

  const [status, setStatus] = useState("active");

  useEffect(() => {
    dispatch(getHotelsStatus(status));
  }, [status, dispatch]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
  
      {/* HEADER */}
      <div className="mb-8 p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4">
        <div className="p-4 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-xl shadow">
          🏨
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Hotel Status
          </h1>
          <p className="text-gray-500">
            Manage and monitor hotel approval status
          </p>
        </div>
      </div>
  
      {/* TABS */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {["pending", "active", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-5 py-2 rounded-xl capitalize font-medium transition ${
              status === s
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
  
      {/* LOADING */}
      {loading && (
        <p className="text-center text-lg text-gray-600 dark:text-gray-300">
          Loading hotels...
        </p>
      )}
  
      {/* EMPTY STATE */}
      {!loading && hotels?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
  
          <div className="bg-white dark:bg-gray-800 p-6 rounded-full mb-4 shadow-lg">
            <span className="text-5xl">🏨</span>
          </div>
  
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
            No Hotels Found
          </h2>
  
          <p className="text-gray-500 mt-2 text-center max-w-md">
            There are no hotels available under this status.
            Try switching status tab or add a new hotel.
          </p>
  
          <Link
            to={"/admin/hotel-dashboard"}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      )}
  
      {/* HOTEL GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  
        {hotels?.map((hotel) => (
          <div
            key={hotel._id}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition"
          >
            {/* IMAGE */}
            <div className="relative">
              <img
                src={hotel.images?.[0]}
                alt={hotel.name}
                className="h-48 w-full object-cover"
              />
  
              {/* STATUS BADGE */}
              <span
                className={`absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-medium ${
                  hotel.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : hotel.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {hotel.status}
              </span>
            </div>
  
            {/* INFO */}
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {hotel.name}
              </h2>
  
              <p className="text-sm text-gray-500 mt-1">
                {hotel.address}
              </p>
  
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-gray-600 dark:text-gray-300">
                  {hotel.city?.name}
                </span>
              </div>
            </div>
          </div>
        ))}
  
      </div>
    </div>
  );
}

export default ShowHotelStatus;