import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { getFoodByIdForUser } from "../../features/user/foodSlice";
import { addToCart, selectCartItemCount } from "../../features/user/cartSlice";

function FoodDetailPage() {
  const { foodId } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userFoodDetail, userFoodDetailLoading, error } = useSelector(
    (state) => state.food
  );
  const cartCount = useSelector(selectCartItemCount);

  useEffect(() => {
    if (foodId) {
      dispatch(getFoodByIdForUser(foodId));
    }
  }, [dispatch, foodId]);

  const food = userFoodDetail;
  const restaurant = food?.restaurantId;
  const restaurantId =
    restaurant?._id ?? location.state?.restaurantId ?? "";

  const handleOrder =  () => {
    if (!food) return;
    dispatch(
      addToCart({
        foodId: food._id,
        name: food.name,
        price: food.price,
        image: food.images?.[0],
        restaurantId: restaurant?._id,
        restaurantName: restaurant?.name,
        qty: 1,
      })
    );
  };

  if (userFoodDetailLoading && !food) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-gray-50 dark:bg-gray-950">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-orange-400/30 border-t-orange-500" />
      </div>
    );
  }

  if (error && !food) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center dark:text-gray-200">
        <p>{String(error)}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 text-orange-600 dark:text-orange-400"
        >
          Back
        </button>
      </div>
    );
  }

  const img = food?.images?.[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 pb-28 dark:bg-gray-950"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-gray-200 dark:bg-gray-800 sm:aspect-video sm:max-h-105">
        <img
          src={img || "/no-image.jpg"}
          alt=""
          className="h-full w-full object-cover"
        />
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm font-medium text-gray-900 shadow dark:bg-gray-900/90 dark:text-white"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </button>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
          {restaurant?.name ?? "Restaurant"}
          {restaurant?.city?.name ? ` · ${restaurant.city.name}` : ""}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
          {food?.name}
        </h1>
        <p
          className={`mt-2 text-sm font-medium ${
            food?.isVeg ? "text-green-600" : "text-red-600"
          }`}
        >
          {food?.isVeg ? "Vegetarian" : "Non-vegetarian"} · {food?.category}
        </p>
        <p className="mt-4 text-gray-700 dark:text-gray-300">
          {food?.description ?? "No description."}
        </p>
        <p className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
          ₹{food?.price}
        </p>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white/95 px-4 py-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
        <div className="mx-auto flex max-w-2xl gap-3">
          <Link
            to="/cart"
            className="relative inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white py-3.5 text-sm font-semibold text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <ShoppingBagIcon className="h-5 w-5" />
            Cart
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-xs text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={handleOrder}
            className="inline-flex flex-2 items-center justify-center rounded-2xl bg-linear-to-r from-orange-500 to-rose-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25"
          >
            Order — add to cart
          </button>
        </div>
        {restaurantId ? (
          <Link
            to={`/restaurant/${restaurantId}/menu`}
            className="mt-3 block text-center text-sm text-orange-600 dark:text-orange-400"
          >
            Browse more from this restaurant
          </Link>
        ) : null}
      </div>
    </motion.div>
  );
}

export default FoodDetailPage;
