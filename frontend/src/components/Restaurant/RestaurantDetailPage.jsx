import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  MapPinIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { getRestaurantByIdPublic } from "../../features/user/restaurantSlice";

function RestaurantDetailPage() {
  const { restaurantId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { restaurant, restaurantDetailLoading, error } = useSelector(
    (state) => state.restaurant
  );

  useEffect(() => {
    if (restaurantId) {
      dispatch(getRestaurantByIdPublic(restaurantId));
    }
  }, [dispatch, restaurantId]);

  const r = restaurant;
  const cityName = r?.city?.name ?? "—";
  const img = r?.images?.[0];

  if (restaurantDetailLoading && !r) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-50 dark:bg-gray-950">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-orange-400/30 border-t-orange-500" />
      </div>
    );
  }

  if (error && !r) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center dark:text-gray-200">
        <p className="text-lg font-medium">{String(error)}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 text-orange-600 hover:underline dark:text-orange-400"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-linear-to-b from-orange-50/90 to-white pb-16 dark:from-gray-950 dark:to-gray-900"
    >
      <div className="relative h-56 w-full overflow-hidden sm:h-72">
        <img
          src={img || "https://placehold.co/1200x600/f3f4f6/9ca3af?text=Restaurant"}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm font-medium text-gray-900 shadow-md backdrop-blur dark:bg-gray-900/90 dark:text-white"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </button>
      </div>

      <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {r?.name ?? "Restaurant"}
        </h1>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
          <span className="inline-flex items-center gap-1.5">
            <MapPinIcon className="h-5 w-5 text-orange-500" />
            {cityName}
          </span>
          {r?.bestTime ? (
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon className="h-5 w-5 text-orange-500" />
              {r.bestTime}
            </span>
          ) : null}
        </div>

        <p className="mt-4 text-gray-700 dark:text-gray-200">
          <span className="font-semibold">{r?.foodType ?? "Cuisine"}</span>
          {r?.famousFood ? (
            <>
              {" "}
              · Famous for{" "}
              <span className="text-orange-600 dark:text-orange-400">
                {r.famousFood}
              </span>
            </>
          ) : null}
        </p>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {r?.address ?? "Address not available"}
        </p>

        <p className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
          ₹{r?.avgCostForOne ?? "—"} for one (approx.)
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to={`/restaurant/${restaurantId}/menu`}
            className="inline-flex flex-1 items-center justify-center rounded-2xl bg-linear-to-r from-orange-500 to-rose-600 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-orange-500/30 sm:flex-none"
          >
            View menu
          </Link>
          <Link
            to="/RestaurantLandingPage"
            className="inline-flex items-center justify-center rounded-2xl border border-gray-300 bg-white px-6 py-3.5 text-sm font-semibold text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            More restaurants
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default RestaurantDetailPage;
