import { useState } from "react";

const CATEGORY_STYLE = {
  Hotel: { bg: "bg-indigo-100 text-indigo-700", icon: "🏨" },
  Restaurant: { bg: "bg-orange-100 text-orange-700", icon: "🍽️" },
  Cafe: { bg: "bg-amber-100 text-amber-700", icon: "☕" },
  Museum: { bg: "bg-purple-100 text-purple-700", icon: "🏛️" },
  Park: { bg: "bg-green-100 text-green-700", icon: "🌿" },
  Shopping: { bg: "bg-pink-100 text-pink-700", icon: "🛍️" },
  Adventure: { bg: "bg-yellow-100 text-yellow-700", icon: "🧗" },
  Beach: { bg: "bg-cyan-100 text-cyan-700", icon: "🏖️" },
  Historical: { bg: "bg-stone-100 text-stone-700", icon: "🏯" },
  Entertainment: { bg: "bg-violet-100 text-violet-700", icon: "🎭" },
  Wellness: { bg: "bg-emerald-100 text-emerald-700", icon: "🧘" },
  Nightlife: { bg: "bg-blue-100 text-blue-700", icon: "🌙" },
};

const PRICE_MAP = { 1: "₹", 2: "₹₹", 3: "₹₹₹", 4: "₹₹₹₹" };

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80";

function StarRating({ rating = 0 }) {
  const stars = Math.round(rating);
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <svg
            key={s}
            className={`w-3.5 h-3.5 ${s <= stars ? "text-amber-400" : "text-gray-200"}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span className="text-xs font-semibold text-gray-700">
        {rating?.toFixed(1)}
      </span>
    </div>
  );
}

export default function PlaceCard({ place, distanceInKm, onClick }) {
  const [imgErr, setImgErr] = useState(false);
  const cat = CATEGORY_STYLE[place.category] || {
    bg: "bg-gray-100 text-gray-600",
    icon: "📍",
  };

  const imageSrc = !imgErr && place.images?.[0] ? place.images[0] : null;

  const distLabel =
    distanceInKm != null
      ? distanceInKm < 1
        ? `${Math.round(distanceInKm * 1000)} m`
        : `${distanceInKm.toFixed(1)} km`
      : null;

  return (
    <div
      onClick={() => onClick?.(place)}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 
                 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* ── Image ── */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={place.name}
            loading="lazy"
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-indigo-50 to-gray-100">
            <span className="text-3xl">🗺️</span>
          </div>
        )}

        {/* Category badge */}
        <span
          className={`absolute top-3 left-3 flex items-center gap-1 text-xs font-semibold
                      px-2.5 py-1 rounded-full shadow-sm ${cat.bg}`}
        >
          {cat.icon} {place.category}
        </span>

        {/* Entry fee */}
        {place.entryfees != null && (
          <span
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800
                           text-xs font-bold px-2.5 py-1 rounded-full shadow-sm"
          >
            {place.entryfees === 0 ? "Free" : `₹${place.entryfees}`}
          </span>
        )}

        {/* Distance badge */}
        {distLabel && (
          <span
            className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/70
                           backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="10" r="3" />
              <path d="M12 2a8 8 0 0 1 8 8c0 5.25-8 14-8 14S4 15.25 4 10a8 8 0 0 1 8-8z" />
            </svg>
            {distLabel} away
          </span>
        )}

        {/* Popular badge */}
        {place.isPopular && (
          <span
            className="absolute bottom-3 left-3 bg-amber-400 text-amber-900
                           text-xs font-bold px-2.5 py-1 rounded-full shadow-sm"
          >
            ⭐ Popular
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-900 text-[15px] leading-snug line-clamp-1 flex-1">
            {place.name}
          </h3>
          {place.priceLevel && (
            <span className="text-xs text-gray-400 font-semibold shrink-0 mt-0.5">
              {PRICE_MAP[place.priceLevel]}
            </span>
          )}
        </div>

        <StarRating rating={place.rating} />

        {place.description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
            {place.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
          {place.timeRequired && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              {place.timeRequired}
            </span>
          )}

          {place.bestTimeToVisit && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M12 3v1m0 16v1M4.22 4.22l.71.71m12.73 12.73.71.71M3 12h1m16 0h1M4.22 19.78l.71-.71M18.36 5.64l.71-.71" />
                <circle cx="12" cy="12" r="5" />
              </svg>
              {place.bestTimeToVisit}
            </span>
          )}

          <button
            className="ml-auto text-xs font-semibold text-rose-500 hover:text-rose-600
                             hover:underline transition-colors"
          >
            View →
          </button>
        </div>
      </div>
    </div>
  );
}
