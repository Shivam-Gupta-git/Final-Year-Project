import {
  ArrowLeftIcon,
  ClockIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getRestaurantByIdPublic } from "../../features/user/restaurantSlice";

function formatTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function isOpen(open, close) {
  if (!open || !close) return null;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = open.split(":").map(Number);
  const [ch, cm] = close.split(":").map(Number);
  return cur >= oh * 60 + om && cur <= ch * 60 + cm;
}

function Stars({ rating }) {
  return (
    <div className="flex gap-1 text-yellow-400 text-sm">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={rating >= s - 0.5 ? "opacity-100" : "opacity-30"}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function RestaurantDetailPage() {
  const { restaurantId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { restaurant: r, restaurantDetailLoading, error } = useSelector(
    (s) => s.restaurant
  );

  useEffect(() => {
    if (restaurantId) dispatch(getRestaurantByIdPublic(restaurantId));
  }, [dispatch, restaurantId]);

  if (restaurantDetailLoading && !r) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !r) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p>{String(error)}</p>
        <button onClick={() => navigate(-1)} className="text-orange-500">
          ← Go back
        </button>
      </div>
    );
  }

  const openStatus = isOpen(r?.openingHours?.open, r?.openingHours?.close);

  return (
    <div className="min-h-screen bg-linear-to-b from-[#f4f7fb] via-[#e9f0f8] to-[#dfe9f5]">

      {/* HERO */}
      <div className="relative w-full h-[45vh] sm:h-[55vh] md:h-[60vh] overflow-hidden">
        <img
          src={r?.images?.[0] || "https://placehold.co/1400x700"}
          alt=""
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

        {/* Status */}
        {openStatus !== null && (
          <div className="absolute top-3 right-3 sm:top-5 sm:right-5 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold">
            {openStatus ? "🟢 Open" : "🔴 Closed"}
          </div>
        )}

        {/* Content */}
        <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6 text-white">
          <h1 className="text-lg sm:text-3xl md:text-4xl font-bold">
            {r?.name}
          </h1>

          <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm">
            <span>{r?.averageRating?.toFixed(1) ?? "—"}</span>
            <Stars rating={r?.averageRating ?? 0} />
            <span className="opacity-70">
              ({r?.totalReviews ?? 0} reviews)
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs opacity-80">
            <MapPinIcon className="w-4 h-4" />
            {r?.city?.name}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* STATS */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 -mt-10 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[
            { label: "Reviews", value: r?.totalReviews },
            { label: "Cost", value: `₹${r?.avgCostForOne}` },
            { label: "Open", value: formatTime(r?.openingHours?.open) },
            { label: "Best", value: r?.bestTime || "Anytime" },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-3 text-center shadow-sm"
            >
              <p className="text-xs opacity-60">{item.label}</p>
              <p className="text-sm font-bold">{item.value}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <Link
            to={`/restaurant/${restaurantId}/menu`}
            className="bg-linear-to-r from-[#c67c4e] to-[#9f5b31] text-white text-center py-3 rounded-xl font-semibold"
          >
            🍴 View Menu
          </Link>

          <Link
            to="/restaurants"
            className="border border-gray-300 text-center py-3 rounded-xl"
          >
            🗺️ More Restaurants
          </Link>
        </div>

        {/* ABOUT */}
        <div className="bg-white rounded-2xl p-4 mt-6 shadow-sm">
          <h2 className="text-sm font-bold text-orange-500 mb-3">
            About Restaurant
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Cuisine</p>
              <p className="font-semibold">{r?.foodType}</p>
            </div>

            <div>
              <p className="text-gray-500">Cost</p>
              <p className="font-semibold">₹{r?.avgCostForOne}</p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-gray-500">Address</p>
              <p className="font-semibold">
                {r?.address}, {r?.city?.name}
              </p>
            </div>
          </div>
        </div>

        {/* HOURS */}
        <div className="bg-white rounded-2xl p-4 mt-6 shadow-sm">
          <h2 className="text-sm font-bold text-orange-500 mb-3">
            Opening Hours
          </h2>

          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-orange-500" />
              {formatTime(r?.openingHours?.open)} -{" "}
              {formatTime(r?.openingHours?.close)}
            </div>

            <span
              className={`text-xs font-bold ${
                openStatus ? "text-green-500" : "text-red-500"
              }`}
            >
              {openStatus ? "Open" : "Closed"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}