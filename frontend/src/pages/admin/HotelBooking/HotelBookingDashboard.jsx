import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaHotel, FaSearch } from "react-icons/fa";
import { getAllActiveHotels } from "../../../features/user/hotelSlice";

function HotelBookingDashboard() {
  const dispatch = useDispatch();
  const { hotels = [], loading } = useSelector((state) => state.hotel);

  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    dispatch(getAllActiveHotels());
  }, [dispatch]);

  const filteredHotels = hotels.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase());
    const matchesCity = selectedCity ? h.city?.name === selectedCity : true;
    return matchesSearch && matchesCity;
  });

  const cities = Array.from(new Set(hotels.map((h) => h.city?.name).filter(Boolean)));

  return (
    <div className="min-h-screen bg-black relative overflow-hidden px-4 py-8 md:px-8 text-white">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/30">
              <FaHotel />
            </div>
            <div>
              <p className="text-blue-400 text-sm font-semibold uppercase tracking-[0.3em] mb-1">
                Admin Panel
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Room Booking Dashboard
              </h1>
              <p className="text-gray-400 mt-2 text-sm md:text-base">
                Manage and monitor all active hotels on your platform
              </p>
            </div>
          </div>
        </div>

        {/* Search & City Filters */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:w-1/2">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search hotels..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-12 py-3 text-white placeholder:text-gray-500 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              className={`px-4 py-2 rounded-xl border border-white/20 text-white transition ${
                selectedCity === "" ? "bg-blue-600/30" : "hover:bg-blue-600/20"
              }`}
              onClick={() => setSelectedCity("")}
            >
              All Cities
            </button>
            {cities.map((city) => (
              <button
                key={city}
                className={`px-4 py-2 rounded-xl border border-white/20 text-white transition ${
                  selectedCity === city ? "bg-blue-600/30" : "hover:bg-blue-600/20"
                }`}
                onClick={() => setSelectedCity(city)}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Hotels Table */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
          <table className="min-w-full text-left">
            <thead className="bg-white/10 text-gray-300">
              <tr>
                <th className="px-6 py-4">Hotel Name</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Address</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-gray-400">
                    Loading hotels...
                  </td>
                </tr>
              ) : filteredHotels.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-gray-400">
                    No hotels found.
                  </td>
                </tr>
              ) : (
                filteredHotels.map((hotel) => (
                  <tr
                    key={hotel._id}
                    className="hover:bg-white/10 cursor-pointer transition"
                    onClick={() => window.location.href = `/admin/booked-hotels/${hotel._id}`}
                  >
                    <td className="px-6 py-4 font-semibold">{hotel.name}</td>
                    <td className="px-6 py-4">{hotel.city?.name}</td>
                    <td className="px-6 py-4 line-clamp-2">{hotel.address}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default HotelBookingDashboard;