import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getAllFoodForUser } from "../../features/user/foodSlice";
import { getRestaurantByIdPublic } from "../../features/user/restaurantSlice";

function RestaurantMenuPage() {
  const { restaurantId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { foods, loading, error } = useSelector((state) => state.food);
  const { restaurant, restaurantDetailLoading } = useSelector(
    (state) => state.restaurant
  );

  useEffect(() => {
    if (restaurantId) {
      dispatch(getRestaurantByIdPublic(restaurantId));
      dispatch(
        getAllFoodForUser({
          page: 1,
          limit: 100,
          restaurantId,
          category: "",
          isVeg: "",
        })
      );
    }
  }, [dispatch, restaurantId]);

  const name = restaurant?.name ?? "Restaurant";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 pb-16 dark:bg-gray-950"
    >
      <div className="border-b border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(`/restaurant/${restaurantId}`)}
            className="inline-flex items-center gap-2 rounded-xl text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Restaurant</span>
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-gray-900 dark:text-white">
              {restaurantDetailLoading ? "…" : name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Menu</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {error && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {String(error)}
          </p>
        )}

        {loading && !foods?.length ? (
          <div className="flex justify-center py-20">
            <span className="h-10 w-10 animate-spin rounded-full border-2 border-orange-400/30 border-t-orange-500" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {foods?.map((item) => (
              <Link
                key={item._id}
                to={`/food/${item._id}`}
                state={{ restaurantId }}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={item.images?.[0] || "/no-image.jpg"}
                    alt=""
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {item.name}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {item.description ?? " "}
                  </p>
                  <p className="mt-2 font-semibold text-orange-600 dark:text-orange-400">
                    ₹{item.price}
                  </p>
                  <p
                    className={`mt-1 text-xs ${
                      item.isVeg ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {item.isVeg ? "Veg" : "Non-veg"} · {item.category}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && foods?.length === 0 && (
          <p className="py-12 text-center text-gray-500 dark:text-gray-400">
            No dishes listed yet.
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default RestaurantMenuPage;
