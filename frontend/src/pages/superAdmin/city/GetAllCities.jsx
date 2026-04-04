import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllCities } from "../../../features/user/citySlice";
import { Link } from "react-router-dom";
import { FaCity } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";

function GetAllCities() {
  const dispatch = useDispatch();
  const { cities = [], loading } = useSelector((state) => state.city);

  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    dispatch(getAllCities());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-8 py-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-blue-600/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full" />
  
      <div className="relative z-10 space-y-8">
        {/* Interactive Header */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/90 shadow-[0_20px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          <div className="relative p-6 md:p-8">
            <div className="absolute inset-0 bg-linear-to-r from-blue-600/10 via-cyan-500/5 to-purple-600/10" />
  
            <div className="relative flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-[0_0_35px_rgba(59,130,246,0.5)] animate-pulse">
                  <FaCity className="text-3xl text-white" />
                </div>
  
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 text-xs font-medium mb-3">
                    City Management Dashboard
                  </div>
  
                  <h1 className="text-3xl md:text-5xl font-bold bg-linear-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
                    Explore All Cities
                  </h1>
  
                  <p className="mt-3 max-w-2xl text-zinc-400 leading-relaxed text-sm md:text-base">
                    Browse, inspect, and manage every city available on the platform from one place.
                  </p>
                </div>
              </div>
  
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 min-w-35 text-center hover:bg-white/10 transition-all duration-300">
                  <p className="text-3xl font-bold text-cyan-300">{cities?.length}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mt-1">
                    Total Cities
                  </p>
                </div>
  
                <Link
                  to="/superAdmin/createCity"
                  className="group px-6 py-4 rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold shadow-[0_10px_30px_rgba(59,130,246,0.35)] transition-all duration-300 hover:scale-[1.03] flex items-center justify-center gap-3"
                >
                  <FaPlus className="group-hover:rotate-90 transition-transform duration-300" />
                  Add New City
                </Link>
              </div>
            </div>
          </div>
        </div>
  
        {/* Loading State */}
        {loading && (
          <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 backdrop-blur-xl animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-16 rounded-2xl bg-white/5 border border-white/5"
              />
            ))}
          </div>
        )}
  
        {/* Empty State */}
        {!loading && cities?.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/10 bg-zinc-950/80 p-16 text-center backdrop-blur-xl">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-5">
              <FaCity className="text-3xl text-zinc-500" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No Cities Found</h3>
            <p className="text-zinc-500">There are currently no cities available in the system.</p>
          </div>
        )}
  
        {/* Cities Table */}
        {!loading && cities?.length > 0 && (
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/90 shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-237.5">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold">
                      City
                    </th>
                    <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold">
                      State
                    </th>
                    <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold">
                      Country
                    </th>
                    <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold">
                      Best Time
                    </th>
                    <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold">
                      Budget
                    </th>
                    <th className="px-6 py-5 text-left text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
  
                <tbody>
                  {cities.map((city) => (
                    <tr
                      key={city._id}
                      onClick={() => setSelectedCity(city)}
                      className="cursor-pointer border-b border-white/5 hover:bg-white/5 transition-all duration-300 group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-white/5 shrink-0">
                            {city.images?.[0] ? (
                              <img
                                src={city.images[0]}
                                alt={city.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FaCity className="text-cyan-300 text-xl" />
                              </div>
                            )}
                          </div>
  
                          <div>
                            <p className="font-semibold text-white capitalize text-base">
                              {city.name}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                              Click to view full details
                            </p>
                          </div>
                        </div>
                      </td>
  
                      <td className="px-6 py-5 text-zinc-300 capitalize">{city.state}</td>
                      <td className="px-6 py-5 text-zinc-300">{city.country}</td>
                      <td className="px-6 py-5 text-zinc-400">{city.bestTimeToVisit}</td>
                      <td className="px-6 py-5 text-green-400 font-semibold">
                        ₹{city.avgDailyBudget}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border capitalize ${
                          city.status === "active"
                            ? "bg-green-500/10 border-green-500/20 text-green-300"
                            : city.status === "pending"
                            ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-300"
                            : "bg-red-500/10 border-red-500/20 text-red-300"
                        }`}>
                          {city.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
  
        {/* Side Drawer Details */}
        <div
          className={`fixed top-0 right-0 h-full w-full sm:w-107.5 md:w-130 bg-zinc-950 border-l border-white/10 shadow-[-20px_0_80px_rgba(0,0,0,0.85)] z-50 transform transition-transform duration-500 overflow-y-auto ${
            selectedCity ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {selectedCity && (
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="inline-flex px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 text-xs mb-3 mt-10">
                    City Details
                  </div>
  
                  <h2 className="text-3xl font-bold text-white capitalize">
                    {selectedCity.name}
                  </h2>
                  <p className="text-zinc-500 mt-2">
                    Detailed information about this city.
                  </p>
                </div>
  
                <button
                  onClick={() => setSelectedCity(null)}
                  className="w-11 h-11 rounded-2xl border border-white/10 bg-white/5 hover:bg-red-500/20 hover:border-red-500/30 text-zinc-400 hover:text-red-400 transition-all duration-300 mt-10"
                >
                  ✕
                </button>
              </div>
  
              {selectedCity.images?.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {selectedCity.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt="city"
                      className="h-36 w-full object-cover rounded-2xl border border-white/10 hover:scale-[1.03] transition-transform duration-300"
                    />
                  ))}
                </div>
              )}
  
              <div className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3">Location</p>
                  <div className="space-y-2 text-zinc-300">
                    <p><span className="text-zinc-500">State:</span> {selectedCity.state}</p>
                    <p><span className="text-zinc-500">Country:</span> {selectedCity.country}</p>
                  </div>
                </div>
  
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">Best Time</p>
                    <p className="text-white font-medium">{selectedCity.bestTimeToVisit}</p>
                  </div>
  
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">Daily Budget</p>
                    <p className="text-green-400 font-bold text-lg">₹{selectedCity.avgDailyBudget}</p>
                  </div>
                </div>
  
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3">Description</p>
                  <p className="text-zinc-300 leading-7">{selectedCity.description}</p>
                </div>
  
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3">Famous For</p>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(selectedCity.famousFor)
                      ? selectedCity.famousFor
                      : [selectedCity.famousFor]
                    ).map((item, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm capitalize"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
  
        {/* Overlay */}
        {selectedCity && (
          <div
            onClick={() => setSelectedCity(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </div>
    </div>
  );
}


export default GetAllCities;