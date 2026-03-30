import { memo } from "react";
import { motion } from "framer-motion";

const item = {
  hidden: { opacity: 0.6 },
  show: (i) => ({
    opacity: 1,
    transition: { delay: i * 0.06 },
  }),
};

function RestaurantGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={item}
          initial="hidden"
          animate="show"
          className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white dark:border-gray-700/80 dark:bg-gray-900/50"
        >
          <div className="aspect-[16/10] animate-skeleton-shimmer bg-gray-200/50 dark:bg-gray-800/50" />
          <div className="space-y-3 p-4 sm:p-5">
            <div className="h-5 w-3/4 animate-skeleton-shimmer rounded-lg" />
            <div className="h-4 w-1/2 animate-skeleton-shimmer rounded-lg" />
            <div className="h-4 w-full animate-skeleton-shimmer rounded-lg" />
            <div className="mt-2 h-10 w-full animate-skeleton-shimmer rounded-xl" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default memo(RestaurantGridSkeleton);
