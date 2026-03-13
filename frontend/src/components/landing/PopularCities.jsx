import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getActiveCities } from "../../features/user/citySlice";

function PopularCities() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cities, loading, error } = useSelector((state) => state.city);

  useEffect(() => {
    dispatch(getActiveCities());
  }, [dispatch]);

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (error)
    return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!cities?.length)
    return <div className="text-center py-20">No cities found</div>;

  return (
    <section
      className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      id="popular-cities"
    >
      <div className="text-center mb-20">
        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 border border-emerald-200/50 backdrop-blur-sm shadow-lg">
          🌟 Featured Destinations
        </span>
        <h2 className="text-5xl lg:text-7xl font-black mb-8 bg-gradient-to-r from-slate-900 via-gray-900 to-black bg-clip-text text-transparent drop-shadow-2xl leading-tight">
          Popular Cities
        </h2>
        <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
          Discover breathtaking destinations with world-class hotels, authentic
          local cuisine, and unforgettable experiences
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
        {cities.map((city) => (
          <article
            key={city._id}
            onClick={() => navigate(`/city/${city._id}`)}
            className="group/card relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] cursor-pointer transition-all duration-700 hover:-translate-y-4 bg-gradient-to-br from-white/95 via-white/90 to-white/80 backdrop-blur-2xl border border-white/70 hover:border-white/90 hover:bg-white/100 hover:ring-4 hover:ring-white/30"
            role="button"
            tabIndex={0}
          >
            {/* Image Container */}
            <div className="relative aspect-[5/3] overflow-hidden">
              <img
                src={
                  city.images?.[0] ||
                  "https://via.placeholder.com/500x300?text=City+Image"
                }
                alt={`${city.name} - Featured Destination`}
                className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-1000 ease-out"
                loading="lazy"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover/card:from-black/60 group-hover/card:via-black/20" />

              {/* City Name */}
              <div className="absolute bottom-8 left-8 right-8">
                <h3 className="text-3xl lg:text-4xl font-black text-white drop-shadow-2xl group-hover/card:text-amber-400 group-hover/card:-translate-y-2 transition-all duration-700 capitalize leading-tight">
                  {city.name}
                </h3>
              </div>

              {/* Action Badge */}
              <div className="absolute top-8 right-8 opacity-0 group-hover/card:opacity-100 translate-y-4 group-hover/card:translate-y-0 transition-all duration-700 delay-150">
                <div className="w-16 h-16 bg-white/95 backdrop-blur-2xl rounded-3xl flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-400 hover:scale-110 hover:-rotate-6 group-hover/card:bg-gradient-to-r group-hover/card:from-amber-400 group-hover/card:to-orange-500">
                  <svg
                    className="w-8 h-8 text-gray-800 group-hover/card:text-white drop-shadow-lg"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Content Footer */}
            <div className="p-10 pb-8 relative z-10">
              <div className="flex items-center justify-between opacity-0 translate-y-6 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-700 delay-300">
                <span className="text-2xl font-black bg-gradient-to-r from-gray-900 to-slate-800 bg-clip-text text-transparent tracking-wide">
                  Explore Now
                </span>
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-400 hover:scale-110 hover:rotate-12 backdrop-blur-xl ring-2 ring-white/50">
                  <svg
                    className="w-7 h-7 text-white drop-shadow-lg"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default PopularCities;
