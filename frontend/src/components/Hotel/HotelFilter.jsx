import React, { useState } from "react";
import { FaSearch, FaMapMarkerAlt, FaStar, FaRupeeSign } from "react-icons/fa";

const HotelFilter = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    locality: "",
    suggested: [],
    price: [],
  });

  const suggestedFilters = [
    { label: "Rush Deal", count: 305, icon: "🔥" },
    { label: "Last Minute Deals", count: 21, icon: "⏰" },
    { label: "5 Star", count: 219, icon: "⭐⭐⭐⭐⭐" },
    { label: "4 Star", count: 442, icon: "⭐⭐⭐⭐" },
    { label: "Breakfast Included", count: 1096, icon: "🍳" },
    { label: "3 Star", count: 796, icon: "⭐⭐⭐" },
  ];

  const priceFilters = [
    { label: "₹ 0 - ₹ 2500", value: "0-2500", count: 851 },
    { label: "₹ 2500 - ₹ 5000", value: "2500-5000", count: 1047 },
    { label: "₹ 5000 - ₹ 7000", value: "5000-7000", count: 305 },
  ];

  const toggleFilter = (type, value) => {
    const current = filters[type];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    const newFilters = { ...filters, [type]: updated };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleLocalitySearch = (e) => {
    const newFilters = { ...filters, locality: e.target.value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const isActive = (type, value) => filters[type].includes(value);

  return (
    <div className="w-[340px] bg-white shadow-2xl rounded-3xl p-6 border border-gray-100 sticky top-4 h-fit max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Filters</h2>
        <p className="text-xs text-gray-500">Narrow down your search</p>
      </div>

      {/* MAP - MakeMyTrip Style */}
      <div className="relative mb-6 group">
        <div className="w-full h-[140px] bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-80"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          <FaMapMarkerAlt className="absolute top-4 left-4 text-white text-xl drop-shadow-lg" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white drop-shadow-lg">
            <button className="bg-white/90 hover:bg-white text-gray-800 font-semibold px-6 py-3 rounded-full shadow-xl backdrop-blur-sm border border-white/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-2 mx-auto">
              <span className="text-sm">Explore on Map</span>
              <FaMapMarkerAlt className="text-blue-500" />
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH LOCALITY - Premium Style */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
          <FaSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search locality or hotel name"
          value={filters.locality}
          onChange={handleLocalitySearch}
          className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-2xl focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100/50 shadow-sm text-sm transition-all duration-300 hover:shadow-md"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>
      </div>

      {/* Suggested For You */}
      <div className="mb-8">
        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-semibold">
            Popular
          </span>
          Suggested For You
        </h3>

        <div className="space-y-3">
          {suggestedFilters.map((item) => (
            <button
              key={item.label}
              onClick={() => toggleFilter("suggested", item.label)}
              className={`w-full flex justify-between items-center p-4 rounded-xl border-2 transition-all duration-300 group hover:shadow-lg hover:-translate-y-0.5 ${
                isActive("suggested", item.label)
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-blue-200"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm ${
                    isActive("suggested", item.label)
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-blue-300"
                      : "bg-white border-2 border-gray-200"
                  }`}
                >
                  {item.icon}
                </div>
                <div>
                  <div className="font-medium text-gray-800 group-hover:text-gray-900">
                    {item.label}
                  </div>
                </div>
              </div>
              <div
                className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${
                  isActive("suggested", item.label)
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {item.count}
              </div>
            </button>
          ))}
        </div>
      </div>

      <hr className="border-gray-200 mb-6" />

      {/* Price Per Night */}
      <div>
        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
          <FaRupeeSign className="text-blue-500" />
          Price Per Night
        </h3>

        <div className="space-y-3">
          {priceFilters.map((item) => (
            <button
              key={item.value}
              onClick={() => toggleFilter("price", item.value)}
              className={`w-full flex justify-between items-center p-4 rounded-xl border-2 transition-all duration-300 group hover:shadow-lg hover:-translate-y-0.5 ${
                isActive("price", item.value)
                  ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-300 shadow-emerald-200"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm ${
                    isActive("price", item.value)
                      ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-emerald-300"
                      : "bg-white border-2 border-gray-200"
                  }`}
                >
                  <FaRupeeSign />
                </div>
                <span className="font-medium text-gray-800 group-hover:text-gray-900">
                  {item.label}
                </span>
              </div>
              <div
                className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${
                  isActive("price", item.value)
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {item.count}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Clear & Apply Buttons */}
      <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
        <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-300 text-sm shadow-sm hover:shadow-md">
          Clear All
        </button>
        <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default HotelFilter;
