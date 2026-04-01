import { memo } from "react";
import { motion } from "framer-motion";
import { MapPinIcon, StarIcon } from "@heroicons/react/24/solid";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

function RestaurantCard({
  restaurant,
  index,
  onViewMenu,
  onOpenRestaurant,
}) {
  const cityName = restaurant?.city?.name ?? "—";
  const img = restaurant?.images?.[0];
  const rating =
    typeof restaurant?.rating === "number"
      ? restaurant.rating.toFixed(1)
      : null;

  const id = restaurant?._id;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.05, 0.4),
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-md shadow-gray-900/5 transition-shadow duration-300 hover:shadow-xl hover:shadow-orange-500/10 dark:border-gray-700/80 dark:bg-gray-900/80 dark:shadow-black/20 dark:hover:shadow-orange-500/15"
    >
      <button
        type="button"
        onClick={() => id && onOpenRestaurant?.(id)}
        className="text-left"
        aria-label={`Open ${restaurant?.name ?? "restaurant"} details`}
      >
        <motion.div
          className="relative aspect-16/10 overflow-hidden bg-gray-100 dark:bg-gray-800"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <img
            src={img || "https://placehold.co/640x400/f3f4f6/9ca3af?text=Food"}
            alt={restaurant?.name ?? "Restaurant"}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-80" />
          {rating != null && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm backdrop-blur-sm dark:bg-gray-900/90 dark:text-white">
              <StarIcon className="h-3.5 w-3.5 text-amber-400" />
              {rating}
            </span>
          )}
        </motion.div>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <h3 className="line-clamp-1 text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
            {restaurant?.name ?? "Restaurant"}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <MapPinIcon className="h-4 w-4 shrink-0 text-orange-500/90" />
            <span className="line-clamp-1">{cityName}</span>
          </p>
          <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="font-medium text-gray-700 dark:text-gray-200">
              {restaurant?.foodType ?? "Multi-cuisine"}
            </span>
            <span className="mx-1.5 text-gray-300 dark:text-gray-600">·</span>
            <span>₹{restaurant?.avgCostForOne ?? "—"} for one</span>
          </p>
        </div>
      </button>

      <div className="mt-auto px-4 pb-4 sm:px-5 sm:pb-5">
        <motion.button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (id) onViewMenu?.(id);
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-orange-500 via-rose-500 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition-[box-shadow,transform] hover:shadow-lg hover:shadow-orange-500/35"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          View Menu
          <ArrowRightIcon className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.article>
  );
}

export default memo(RestaurantCard);
