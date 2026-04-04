import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  approvePlaceById,
  deletePlace,
  getInactivePlacesCityWise,
} from "../../../features/user/placeSlice";
import {
  FaMapMarkerAlt,
  FaSearch,
  FaCheckCircle,
  FaTrash,
  FaChevronRight,
  FaTimes,
  FaLandmark,
} from "react-icons/fa";

function GetInactivePlaceCityWise() {
  const dispatch = useDispatch();
  const { inactiveCityWisePlaces = [], loading } = useSelector(
    (state) => state.place
  );

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [activeCity, setActiveCity] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getInactivePlacesCityWise());
  }, [dispatch]);

  const handleActivateButton = (id) => {
    dispatch(approvePlaceById(id));
    setSelectedPlace(null);
  };

  const handleDeleteButton = (id) => {
    dispatch(deletePlace(id));
    setSelectedPlace(null);
  };

  // City filters
  const cityFilters = useMemo(() => {
    const uniqueCities = [
      ...new Set(
        inactiveCityWisePlaces.map((c) => c.cityName).filter(Boolean)
      ),
    ];
    return ["All", ...uniqueCities];
  }, [inactiveCityWisePlaces]);

  // Filtered places
  const filteredPlaces = useMemo(() => {
    let places = [];
    inactiveCityWisePlaces.forEach((city) => {
      if (activeCity === "All" || city.cityName === activeCity) {
        places.push(...city.places);
      }
    });

    return places.filter(
      (place) =>
        place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inactiveCityWisePlaces, activeCity, searchTerm]);

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-8 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="relative rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between relative z-10">
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 border border-blue-500/20 animate-pulse">
                  <FaLandmark className="text-2xl text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold sm:text-4xl">
                    Inactive Places Dashboard
                  </h1>
                  <p className="mt-1 text-sm text-zinc-400 sm:text-base">
                    Manage all inactive places with search, city filters, and actions.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-4">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4">
                  <p className="text-xs uppercase tracking-widest text-zinc-500">
                    Total Places
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-white">
                    {inactiveCityWisePlaces.reduce(
                      (acc, city) => acc + city.places.length,
                      0
                    )}
                  </h3>
                </div>

                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 py-4">
                  <p className="text-xs uppercase tracking-widest text-blue-300">
                    Showing
                  </p>
                  <h3 className="mt-2 text-3xl font-bold text-blue-400">
                    {filteredPlaces.length}
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
                  placeholder="Search place or category..."
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
              onClick={() => setActiveCity(city)}
              className={`rounded-2xl border px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                activeCity === city
                  ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800"
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* PLACES TABLE */}
        {loading ? (
          <div className="flex min-h-87.5 items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-950">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950 px-6 py-20 text-center">
            <FaLandmark className="mx-auto mb-4 text-5xl text-zinc-600" />
            <h2 className="text-2xl font-semibold text-white">
              No inactive places found
            </h2>
            <p className="mt-2 text-zinc-500">
              Try changing the search or selected city.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="min-w-full w-full">
                <thead className="bg-zinc-900">
                  <tr className="border-b border-zinc-800">
                    <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Place
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Category
                    </th>
                    <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      City
                    </th>
                    <th className="px-6 py-5 text-right text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPlaces.map((place) => (
                    <tr
                      key={place._id}
                      className="border-b border-zinc-800 transition-all duration-300 hover:bg-zinc-900/70"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={place.images?.[0] || "https://via.placeholder.com/80"}
                            alt={place.name}
                            className="h-14 w-14 rounded-2xl border border-zinc-700 object-cover"
                          />
                          <div>
                            <h3 className="text-base font-semibold capitalize text-white">
                              {place.name}
                            </h3>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-zinc-300">{place.category}</td>
                      <td className="px-6 py-5 text-zinc-300">{place.cityName}</td>

                      <td className="px-6 py-5 flex justify-end gap-2">
                        <button
                          onClick={() => handleActivateButton(place._id)}
                          className="inline-flex items-center rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 transition"
                        >
                          <FaCheckCircle className="mr-2" /> Active
                        </button>

                        <button
                          onClick={() => handleDeleteButton(place._id)}
                          className="inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition"
                        >
                          <FaTrash className="mr-2" /> Delete
                        </button>

                        <button
                          onClick={() => setSelectedPlace(place)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                        >
                          <FaChevronRight />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SIDE PANEL */}
        {selectedPlace && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
            <div className="h-full w-full max-w-md overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-[slideIn_.35s_ease]">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">{selectedPlace.name}</h2>
                <button
                  onClick={() => setSelectedPlace(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
                >
                  <FaTimes />
                </button>
              </div>

              <img
                src={selectedPlace.images?.[0] || "https://via.placeholder.com/600x300"}
                alt={selectedPlace.name}
                className="mb-5 h-56 w-full rounded-2xl object-cover"
              />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-400">
                  <FaMapMarkerAlt className="text-blue-400" />
                  <span>{selectedPlace.cityName}</span>
                </div>

                <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <p className="text-sm text-zinc-500">Status</p>
                  <h4 className="mt-1 text-2xl font-bold text-red-400 capitalize">{selectedPlace.status}</h4>
                </div>

                <p className="text-zinc-300">{selectedPlace.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm text-zinc-400">
                  <p><strong>⏱ Time:</strong> {selectedPlace.timeRequired}</p>
                  <p><strong>💰 Entry Fee:</strong> ₹{selectedPlace.entryfees}</p>
                  <p><strong>🌤 Best Time:</strong> {selectedPlace.bestTimeToVisit}</p>
                  <p><strong>⭐ Popular:</strong> {selectedPlace.isPopular ? "Yes" : "No"}</p>
                </div>

                {selectedPlace.images?.length > 1 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-white">More Images</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedPlace.images.map((img, idx) => (
                        <img key={idx} src={img} className="w-full h-24 object-cover rounded-lg hover:scale-105 transition" />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleActivateButton(selectedPlace._id)}
                    className="bg-blue-500 px-3 py-1 rounded-2xl text-white hover:bg-blue-600 transition"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleDeleteButton(selectedPlace._id)}
                    className="bg-red-500 px-3 py-1 rounded-2xl text-white hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GetInactivePlaceCityWise;