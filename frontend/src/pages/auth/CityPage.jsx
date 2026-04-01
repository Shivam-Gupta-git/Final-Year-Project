import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCityById } from "../../features/user/citySlice";

function CityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { city, loading, error } = useSelector((state) => state.city);

  useEffect(() => {
    dispatch(getCityById(id));
  }, [dispatch, id]);

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (error)
    return <div className="p-20 text-center text-red-500">{error}</div>;
  if (!city) return <div className="p-20 text-center">City not found</div>;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50/20">
      {/* Hero Banner */}
      <section className="relative h-112.5 overflow-hidden">
        <img
          src={
            city.images?.[0] ||
            "https://via.placeholder.com/1200x450?text=City+Hero"
          }
          alt={`${city.name} - Cityscape`}
          className="w-full h-full object-cover brightness-75 transition-all duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/40 to-black/20" />

        <div className="absolute inset-0 flex flex-col items-center justify-end p-8 lg:p-12 text-center text-white max-w-3xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 mb-4">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m6 0h6M4 12h16M5 7h14v10H5V7z"
              />
            </svg>
            Welcome to {city.name}
          </div>
          {/* <h1 className="text-4xl lg:text-5xl font-black drop-shadow-2xl bg-gradient-to-r from-white to-gray-200 bg-clip-text leading-tight">
        {city.name}
      </h1> */}
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 -mt-10 relative z-10">
        {/* About Section */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 lg:p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold bg-linear-to-r from-gray-900 to-slate-800 bg-clip-text text-transparent mb-4">
              About {city.name}
            </h2>
            <div className="w-20 h-1 bg-linear-to-r from-emerald-500 to-teal-600 rounded-full mx-auto" />
          </div>
          <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
            {city.description}
          </p>
        </div>

        {/* Info Cards */}
        <section className="mb-20">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="group bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-white/70 hover:border-emerald-200/50">
              <div className="w-16 h-16 bg-linear-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl group-hover:scale-105 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600">
                Famous For
              </h3>
              <p className="text-gray-600 leading-relaxed">{city.famousFor}</p>
            </div>

            <div className="group bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-white/70 hover:border-amber-200/50">
              <div className="w-16 h-16 bg-linear-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl group-hover:scale-105 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-600">
                Best Time
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {city.bestTimeToVisit}
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-white/70 hover:border-indigo-200/50">
              <div className="w-16 h-16 bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl group-hover:scale-105 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600">
                Daily Budget
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                ₹{city.avgDailyBudget}
              </p>
              <p className="text-sm text-gray-500 mt-1 font-medium uppercase tracking-wide">
                Per Person
              </p>
            </div>
          </div>
        </section>

        {/* Explore Actions */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold bg-linear-to-r from-gray-900 to-slate-800 bg-clip-text text-transparent mb-4">
              Explore {city.name}
            </h2>
            <div className="w-20 h-1 bg-linear-to-r from-emerald-500 to-teal-600 rounded-full mx-auto mb-4" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🏨",
                title: "Hotels",
                desc: "Best stays & deals",
                path: `/hotels?city=${city.name}`,
              },
              {
                icon: "📍",
                title: "Places",
                desc: "Top attractions",
                path: `/explore?city=${city.name}`,
              },
              {
                icon: "🍽",
                title: "Restaurants",
                desc: "Local flavors",
                path: `/RestaurantLandingPage?city=${city.name}`,
              },
            ].map((item) => (
              <div
                key={item.title}
                onClick={() => navigate(item.path)}
                className="group bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-3 cursor-pointer transition-all duration-500 border border-white/70 hover:border-emerald-300/50 hover:ring-4 hover:ring-emerald-500/20 text-center"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600">
                  {item.title}
                </h3>
                <p className="text-gray-600 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default CityDetails;
