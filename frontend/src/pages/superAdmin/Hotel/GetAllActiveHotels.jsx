import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllActiveHotels, inactiveHotel } from "../../../features/user/hotelSlice";
import { FaHotel, FaMapMarkerAlt, FaSearch, FaTimes } from "react-icons/fa";

function GetAllActiveHotels() {
  const dispatch = useDispatch();
  const { hotels = [], loading } = useSelector((state) => state.hotel);

  const [selectedHotel, setSelectedHotel] = useState(null);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("All");

  useEffect(() => {
    dispatch(getAllActiveHotels());
  }, [dispatch]);

  const handelInactiveHotel = (hotelId) => {
    dispatch(inactiveHotel(hotelId));
  };

  // Filters for cities
  const cityOptions = useMemo(() => {
    const uniqueCities = [...new Set(hotels.map((h) => h.city?.name).filter(Boolean))];
    return ["All", ...uniqueCities];
  }, [hotels]);

  // Filtered hotels
  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) => {
      const matchesSearch =
        hotel.name?.toLowerCase().includes(search.toLowerCase()) ||
        hotel.address?.toLowerCase().includes(search.toLowerCase()) ||
        hotel.city?.name?.toLowerCase().includes(search.toLowerCase());

      const matchesCity = cityFilter === "All" || hotel.city?.name === cityFilter;
      return matchesSearch && matchesCity;
    });
  }, [hotels, search, cityFilter]);

  return (
    <div className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      {/* Header */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-zinc-900 via-black to-zinc-950 shadow-[0_20px_80px_rgba(0,0,0,0.8)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_35%)]" />

        <div className="relative flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-lg shadow-blue-500/20 animate-pulse">
              <FaHotel className="text-3xl" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Active Hotels Dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
                Manage, search, and filter active hotels in your platform.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
                  {filteredHotels.length} Active Hotels
                </div>

                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
                  {cityFilter === "All" ? "Showing All Cities" : cityFilter}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by hotel name, address or city..."
            className="w-full rounded-2xl border border-white/10 bg-zinc-950 py-3 pl-12 pr-4 text-white placeholder:text-gray-500 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {cityOptions.map((city) => (
            <button
              key={city}
              onClick={() => setCityFilter(city)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                cityFilter === city
                  ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "border-white/10 bg-zinc-950 text-gray-400 hover:border-blue-500/30 hover:text-white"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-y-scroll h-125 rounded-3xl border border-white/10 bg-zinc-950 shadow-[0_20px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                <th className="px-6 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Hotel</th>
                <th className="px-6 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">City</th>
                <th className="px-6 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Status</th>
                <th className="px-6 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Address</th>
                <th className="px-6 py-5 text-right text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                [...Array(6)].map((_, index) => (
                  <tr key={index} className="border-b border-white/5">
                    <td colSpan="5" className="px-6 py-5">
                      <div className="h-14 animate-pulse rounded-2xl bg-white/5" />
                    </td>
                  </tr>
                ))
              ) : filteredHotels.length ? (
                filteredHotels.map((hotel) => (
                  <tr
                    key={hotel._id}
                    onClick={() => setSelectedHotel(hotel)}
                    className="cursor-pointer border-b border-white/5 transition-all duration-300 hover:bg-blue-500/10"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <img
                          src={hotel.images?.[0]}
                          alt={hotel.name}
                          className="h-14 w-14 rounded-2xl border border-white/10 object-cover"
                        />
                        <div>
                          <h3 className="font-semibold capitalize text-white">{hotel.name}</h3>
                          <p className="mt-1 max-w-xs truncate text-xs text-gray-500">{hotel.description}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-300">{hotel.city?.name}</td>
                    <td className="px-6 py-5 text-sm text-gray-300">{hotel.status}</td>
                    <td className="px-6 py-5 text-sm text-gray-300">{hotel.address}</td>

                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); handelInactiveHotel(hotel._id); }}
                        className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-medium text-blue-300 transition hover:bg-blue-500/20"
                      >
                        Inactive
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-gray-500">
                    No active hotels found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Drawer */}
      {selectedHotel && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setSelectedHotel(null)} />

          <div className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-zinc-950 shadow-[0_0_80px_rgba(0,0,0,0.9)] animate-[slideIn_.35s_ease]">
            <div className="sticky top-0 z-10 border-b border-white/10 bg-black/90 px-6 py-5 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold capitalize text-white">{selectedHotel.name}</h2>
                  <div className="mt-2 flex items-center gap-2 text-gray-400">
                    <FaMapMarkerAlt className="text-blue-400" />
                    <span>{selectedHotel.city?.name}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedHotel(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-gray-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="space-y-6 p-6">
              {/* Images */}
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedHotel.images?.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={selectedHotel.name}
                    className="h-48 w-full rounded-3xl border border-white/10 object-cover transition duration-300 hover:scale-[1.02]"
                  />
                ))}
              </div>

              {/* Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">Status</p>
                  <p className="mt-2 text-lg font-semibold text-white">{selectedHotel.status}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">Location</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    <a
                      href={`https://www.google.com/maps?q=${selectedHotel.location?.coordinates?.[1]},${selectedHotel.location?.coordinates?.[0]}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 underline"
                    >
                      View Map
                    </a>
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="mb-3 text-lg font-semibold text-white">Description</h3>
                <p className="leading-7 text-gray-400">{selectedHotel.description}</p>
              </div>

              {/* Facilities */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="mb-4 text-lg font-semibold text-white">Facilities</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedHotel.facilities?.map((f, idx) => (
                    <span key={idx} className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm text-blue-300">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => handelInactiveHotel(selectedHotel._id)}
                className="w-full rounded-2xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-500"
              >
                Inactive Hotel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GetAllActiveHotels;