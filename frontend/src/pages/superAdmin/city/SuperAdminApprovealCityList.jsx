import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  approveCityById,
  getPendingCities,
  rejectCityById,
} from "../../../features/user/citySlice";
import { FaCity } from "react-icons/fa";
import { motion } from "framer-motion";

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
    <div className="min-h-screen bg-black text-white px-4 md:px-8 py-6 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-600/20 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600/20 blur-3xl rounded-full" />
  
      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="rounded-3xl border border-white/10 bg-zinc-950/90 backdrop-blur-2xl overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.7)]">
          <div className="relative p-6 md:p-8">
            <div className="absolute inset-0 bg-linear-to-r from-blue-600/10 via-cyan-500/5 to-purple-600/10" />
  
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.45)] animate-pulse">
                  <FaCity className="text-3xl text-white" />
                </div>
  
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 text-xs font-medium mb-3">
                    Pending Requests
                  </div>
  
                  <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
                    City Approval Center
                  </h1>
  
                  <p className="text-zinc-400 mt-2 max-w-2xl leading-relaxed">
                    Review all pending city submissions, approve verified cities, or reject incomplete requests.
                  </p>
                </div>
              </div>
  
              <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center min-w-35 hover:bg-white/10 transition-all duration-300">
                  <p className="text-2xl font-bold text-cyan-300">{cities?.length}</p>
                  <p className="text-xs uppercase tracking-wider text-zinc-500 mt-1">Pending Cities</p>
                </div>
  
                <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center min-w-35 hover:bg-white/10 transition-all duration-300">
                  <p className="text-2xl font-bold text-green-400">
                    {cities?.filter((c) => c.status === "pending").length}
                  </p>
                  <p className="text-xs uppercase tracking-wider text-zinc-500 mt-1">Awaiting Action</p>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Loading */}
        {loading && (
          <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 backdrop-blur-xl">
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-white/5 border border-white/5" />
              ))}
            </div>
          </div>
        )}
  
        {/* Empty State */}
        {!loading && cities?.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/10 bg-zinc-950/70 p-16 text-center backdrop-blur-xl">
            <div className="w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center justify-center mb-5">
              <FaCity className="text-3xl text-zinc-500" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No Pending Cities</h3>
            <p className="text-zinc-500">All city requests have already been reviewed.</p>
          </div>
        )}
  
        {/* Table */}
        {!loading && cities?.length > 0 && (
          <div className="rounded-3xl border border-white/10 bg-zinc-950/90 overflow-hidden backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-225">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-left">
                    <th className="px-6 py-5 text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold">City</th>
                    <th className="px-6 py-5 text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold">State</th>
                    <th className="px-6 py-5 text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold">Country</th>
                    <th className="px-6 py-5 text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold">Best Time</th>
                    <th className="px-6 py-5 text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold">Status</th>
                    <th className="px-6 py-5 text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
  
                <tbody>
                  {cities.map((city) => (
                    <tr
                      key={city._id}
                      onClick={() => setSelectedCity(city)}
                      className="border-b border-white/5 hover:bg-white/5 transition-all duration-300 cursor-pointer group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-500/20 to-cyan-500/20 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <FaCity className="text-cyan-300 text-lg" />
                          </div>
                          <div>
                            <p className="font-semibold text-white capitalize">{city.name}</p>
                            <p className="text-xs text-zinc-500">Tap to view details</p>
                          </div>
                        </div>
                      </td>
  
                      <td className="px-6 py-5 text-zinc-300 capitalize">{city.state}</td>
                      <td className="px-6 py-5 text-zinc-300">{city.country}</td>
                      <td className="px-6 py-5 text-zinc-400">{city.bestTimeToVisit}</td>
  
                      <td className="px-6 py-5">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold border border-yellow-500/20 bg-yellow-500/10 text-yellow-300 capitalize">
                          {city.status}
                        </span>
                      </td>
  
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={(e) => handleApprove(e, city._id)}
                            disabled={loading}
                            className="px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500 hover:text-white transition-all duration-300 text-sm font-medium"
                          >
                            Approve
                          </button>
  
                          <button
                            onClick={(e) => handleReject(e, city._id)}
                            disabled={loading}
                            className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500 hover:text-white transition-all duration-300 text-sm font-medium"
                          >
                            Reject
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
  
        {/* Side Drawer */}
        <div
          className={`fixed top-0 right-0 h-full w-full sm:w-110 md:w-130 bg-zinc-950 border-l border-white/10 shadow-[-20px_0_60px_rgba(0,0,0,0.8)] z-50 transform transition-transform duration-500 overflow-y-auto ${
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
                  <h2 className="text-3xl font-bold capitalize text-white">{selectedCity.name}</h2>
                  <p className="text-zinc-500 mt-2">Complete information about this city request.</p>
                </div>
  
                <button
                  onClick={closeModal}
                  className="w-11 h-11 rounded-2xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-zinc-400 hover:text-red-400 transition-all duration-300 mt-10"
                >
                  ✕
                </button>
              </div>
  
              <div className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">Location</p>
                  <div className="space-y-2 text-zinc-300">
                    <p><span className="text-zinc-500">State:</span> {selectedCity.state}</p>
                    <p><span className="text-zinc-500">Country:</span> {selectedCity.country}</p>
                  </div>
                </div>
  
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3">Description</p>
                  <p className="text-zinc-300 leading-7">{selectedCity.description}</p>
                </div>
  
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">Best Time</p>
                    <p className="text-white font-medium">{selectedCity.bestTimeToVisit}</p>
                  </div>
  
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">Avg Budget</p>
                    <p className="text-green-400 font-semibold text-lg">₹{selectedCity.avgDailyBudget}</p>
                  </div>
                </div>
  
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-3">Famous For</p>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(selectedCity.famousFor)
                      ? selectedCity.famousFor
                      : String(selectedCity.famousFor).split(",")
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
  
                {selectedCity.images?.length > 0 && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-4">Images</p>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedCity.images.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt="city"
                          className="w-full h-32 rounded-2xl object-cover border border-white/10 hover:scale-[1.03] transition-transform duration-300"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
  
        {/* Drawer Overlay */}
        {selectedCity && (
          <div
            onClick={closeModal}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </div>

     </div>
  )

}

export default SuperAdminApprovealCityList;
