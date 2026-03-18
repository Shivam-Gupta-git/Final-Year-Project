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
    <div className="p-6">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-6">Hotel Status</h1>

      {/* TABS */}
      <div className="flex gap-4 mb-6">
        {["pending", "active", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-lg capitalize ${
              status === s
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* LOADING */}
      {loading && <p className="text-center text-lg">Loading hotels...</p>}

      {/* EMPTY */}
      {!loading && hotels?.length === 0 && (
  <div className="flex flex-col items-center justify-center py-20">

    {/* ICON */}
    <div className="bg-gray-100 p-6 rounded-full mb-4 shadow">
      <svg
        className="w-14 h-14 text-gray-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 7h18M5 7v12a2 2 0 002 2h10a2 2 0 002-2V7M9 11h6"
        />
      </svg>
    </div>

    {/* TEXT */}
    <h2 className="text-2xl font-semibold text-gray-700">
      No Hotels Found
    </h2>

    <p className="text-gray-500 mt-2 text-center max-w-md">
      There are no hotels available under this status.
      Try switching status tab or add a new hotel.
    </p>

    {/* BUTTON */}
    <Link to={"/admin/hotel-dashboard"} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
      Back to Dashboard
    </Link>

  </div>
)}

      {/* HOTEL GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {hotels?.map((hotel) => (
          <div
            key={hotel._id}
            className="bg-white shadow-lg rounded-xl overflow-hidden"
          >
            {/* IMAGE */}
            <img
              src={hotel.images?.[0]}
              alt={hotel.name}
              className="h-48 w-full object-cover"
            />

            {/* INFO */}
            <div className="p-4">
              <h2 className="text-xl font-semibold">{hotel.name}</h2>
              <p className="text-gray-500">{hotel.address}</p>

              <div className="flex justify-between mt-3">
                <span className="text-sm bg-gray-200 px-2 py-1 rounded">
                  {hotel.city?.name}
                </span>

                <span
                  className={`text-sm px-2 py-1 rounded ${
                    hotel.status === "pending"
                      ? "bg-yellow-200"
                      : hotel.status === "active"
                      ? "bg-green-200"
                      : "bg-red-200"
                  }`}
                >
                  {hotel.status}
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