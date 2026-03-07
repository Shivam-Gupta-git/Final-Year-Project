import React from "react";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

function HeroSection() {
  return (
    <section className="h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1467269204594-9661b134dd2b)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="relative z-10 flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto w-full">
          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight drop-shadow-2xl">
            Discover
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Amazing Places
            </span>
            Around You
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl md:text-3xl font-medium mb-12 max-w-2xl mx-auto opacity-95 drop-shadow-xl leading-relaxed">
            Find hotels, restaurants, and tourist attractions in any city with
            just one click  
          </p>

          {/* Enhanced Search Form */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-1 border border-white/50 max-w-5xl mx-auto mb-12">
            <div className="p-6 flex flex-col lg:flex-row gap-3 items-stretch">
              {/* Location Input */}
              <div className="relative flex-1 group">
                <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Where to? e.g., Jaipur, Delhi, Goa..."
                  className="w-full pl-12 pr-4 py-5 rounded-2xl border-2 border-transparent bg-white/80 hover:border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-200 text-lg placeholder-gray-500 font-medium"
                />
              </div>

              {/* Date Input */}
              <div className="relative flex-1 min-w-0 lg:w-48 group">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="date"
                  className="w-full pl-12 pr-4 py-5 rounded-2xl border-2 border-transparent bg-white/80 hover:border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-200 text-lg"
                />
              </div>

              {/* Guests Input */}
              <div className="relative lg:w-32 group">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="number"
                  placeholder="Guests"
                  min="1"
                  className="w-full pl-10 pr-4 py-5 rounded-2xl border-2 border-transparent bg-white/80 hover:border-gray-200 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-200 text-lg text-center"
                />
              </div>

              {/* Search Button */}
              <button className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 hover:from-blue-700 hover:via-blue-800 hover:to-purple-800 px-8 py-5 rounded-2xl font-bold text-xl text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 whitespace-nowrap min-w-[140px]">
                <span className="flex items-center gap-2">
                  <MagnifyingGlassIcon className="h-6 w-6" />
                  Search
                </span>
              </button>
            </div>
          </div>

          {/* Popular Destinations */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-2xl mx-auto">
            {["Jaipur", "Delhi", "Goa", "Varanasi", "Mumbai", "Agra"].map(
              (city) => (
                <button
                  key={city}
                  className="px-6 py-3 bg-white/90 hover:bg-white backdrop-blur-sm text-gray-800 font-semibold rounded-full text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-200 border border-white/50 active:scale-95"
                >
                  {city}
                </button>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
