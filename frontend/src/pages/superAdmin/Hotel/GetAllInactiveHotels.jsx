import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  approveHotelById,
  deleteHotel,
  getAllInactiveHotels,
} from "../../../features/user/hotelSlice";
import {
  FaHotel,
  FaSearch,
  FaCheckCircle,
  FaTrash,
  FaChevronRight,
  FaTimes,
  FaMapMarkerAlt,
} from "react-icons/fa";

function GetAllInactiveHotels() {
  const dispatch = useDispatch();
  const { hotels = [], loading } = useSelector((state) => state.hotel);

  const [selectedHotel, setSelectedHotel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");

  useEffect(() => {
    dispatch(getAllInactiveHotels());
  }, [dispatch]);

  const handleActivateButton = (hotelId) => {
    dispatch(approveHotelById(hotelId));
  };

  const handleDeleteButton = (hotelId) => {
    dispatch(deleteHotel(hotelId));
  };

  // City filter buttons
  const cityFilters = useMemo(() => {
    const uniqueCities = [
      ...new Set(
        hotels.map((hotel) => hotel.city?.name).filter((name) => name)
      ),
    ];
    return ["All", ...uniqueCities];
  }, [hotels]);

  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        hotel.name?.toLowerCase().includes(search) ||
        hotel.address?.toLowerCase().includes(search) ||
        hotel.city?.name?.toLowerCase().includes(search);

      const matchesCity =
        selectedCity === "All" || hotel.city?.name === selectedCity;

      return matchesSearch && matchesCity;
    });
  }, [hotels, searchTerm, selectedCity]);

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-8 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 border border-blue-500/20 animate-pulse">
                  <FaHotel className="text-2xl text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Inactive Hotels Dashboard
                  </h1>
                  <p className="mt-2 text-sm text-zinc-400 sm:text-base">
                    Manage all inactive hotels with search, filters, and actions.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4">
                  <p className="text-xs uppercase tracking-widest text-zinc-500">
                    Total Hotels
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-white">
                    {hotels.length}
                  </h3>
                </div>

                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 py-4">
                  <p className="text-xs uppercase tracking-widest text-blue-300">
                    Showing
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-blue-400">
                    {filteredHotels.length}
                  </h3>
                </div>
              </div>
            </div>

            {/* SEARCH */}
            <div className="w-full xl:max-w-md">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search hotel, address, or city..."
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 py-4 pl-12 pr-4 text-white placeholder:text-zinc-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CITY FILTERS */}
        <div className="flex flex-wrap gap-3">
          {cityFilters.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setSelectedCity(city)}
              className={`rounded-2xl border px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                selectedCity === city
                  ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* HOTELS TABLE */}
        {loading ? (
          <div className="flex min-h-87.5 items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-950">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950 px-6 py-20 text-center">
            <FaHotel className="mx-auto mb-4 text-5xl text-zinc-600" />
            <h2 className="text-2xl font-semibold text-white">
              No inactive hotels found
            </h2>
            <p className="mt-2 text-zinc-500">
              Try changing the search text or selected city.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="min-w-full w-full">
                <thead className="bg-zinc-900">
                  <tr className="border-b border-zinc-800">
                    <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Hotel
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      City
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Address
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Status
                    </th>
                    <th className="px-6 py-5 text-right text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredHotels.map((hotel) => (
                    <tr
                      key={hotel._id}
                      className="border-b border-zinc-800 transition-all duration-300 hover:bg-zinc-900/70"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={
                              hotel.images?.[0] ||
                              "https://via.placeholder.com/80"
                            }
                            alt={hotel.name}
                            className="h-14 w-14 rounded-2xl border border-zinc-700 object-cover"
                          />
                          <div>
                            <h3 className="text-base font-semibold capitalize text-white">
                              {hotel.name}
                            </h3>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-zinc-300">
                        {hotel.city?.name || "N/A"}
                      </td>

                      <td className="px-6 py-5 text-zinc-300">{hotel.address}</td>

                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                          <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                          Inactive
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleActivateButton(hotel._id)}
                            className="inline-flex items-center rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-500"
                          >
                            <FaCheckCircle className="mr-2" />
                            Activate
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteButton(hotel._id)}
                            className="inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
                          >
                            <FaTrash className="mr-2" />
                            Delete
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedHotel(hotel)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                          >
                            <FaChevronRight />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SIDE PANEL */}
        {selectedHotel && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
            <div className="h-full w-full max-w-md overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-[slideIn_.35s_ease]">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Hotel Details
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedHotel(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>

              <img
                src={
                  selectedHotel.images?.[0] ||
                  "https://via.placeholder.com/600x300"
                }
                alt={selectedHotel.name}
                className="mb-5 h-56 w-full rounded-2xl object-cover"
              />

              <h3 className="text-3xl font-bold capitalize text-white">
                {selectedHotel.name}
              </h3>

              <div className="mt-3 flex items-center gap-2 text-zinc-400">
                <FaMapMarkerAlt className="text-blue-400" />
                <span>
                  {selectedHotel.city?.name || "N/A"}, {selectedHotel.address}
                </span>
              </div>

              <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-sm text-zinc-500">Status</p>
                <h4 className="mt-2 text-2xl font-bold text-red-400">
                  Inactive
                </h4>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GetAllInactiveHotels;