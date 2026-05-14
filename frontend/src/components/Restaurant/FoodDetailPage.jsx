import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
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
    if (foodId) dispatch(getFoodByIdForUser(foodId));
  }, [dispatch, foodId]);

  const food = userFoodDetail;
  const restaurant = food?.restaurantId;

  const restaurantId =
    restaurant?._id ?? location.state?.restaurantId ?? "";

  const handleOrder = () => {
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
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-orange-300 border-t-orange-500" />
      </div>
    );
  }

  if (error && !food) {
    return (
      <div className="px-4 py-16 text-center">
        <p>{String(error)}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-orange-600"
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
      className="min-h-screen bg-linear-to-b from-[#f4f7fb] via-[#e9f0f8] to-[#dfe9f5] pb-28 text-[#2d1f16]"
    >
      {/* 🖼 IMAGE */}
      <div className="relative w-full h-55 sm:h-80 md:h-105 overflow-hidden">
        <img
          src={img || "/no-image.jpg"}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
      </div>

      {/* 📄 CONTENT */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Restaurant */}
        <div className="flex items-center gap-2 mb-2">
          <span className="h-1 w-6 bg-[#c67c4e] rounded-full" />
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#a07d63] truncate">
            {restaurant?.name ?? "Restaurant"}
          </p>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold leading-tight">
          {food?.name}
        </h1>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
              food?.isVeg
                ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                : "bg-red-50 border-red-200 text-red-600"
            }`}
          >
            {food?.isVeg ? "Veg" : "Non-Veg"}
          </span>

          {food?.category && (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold border bg-white text-[#6f5a4b]">
              {food.category}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="mt-4 text-sm sm:text-base text-[#6f5a4b] leading-relaxed">
          {food?.description ||
            "Experience a delicious dish crafted with premium ingredients."}
        </p>

        {/* Price */}
        <div className="mt-6 flex items-end gap-1">
          <span className="text-sm text-[#a07d63] font-bold">₹</span>
          <span className="text-2xl sm:text-4xl font-extrabold">
            {food?.price}
          </span>
        </div>
      </div>

      {/* 🛒 BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-[#eadccf] px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-3">

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl border bg-white"
          >
            <ShoppingBagIcon className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 text-[9px] flex items-center justify-center rounded-full bg-[#c67c4e] text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* Add Button */}
          <button
            onClick={handleOrder}
            className="flex-1 rounded-xl bg-linear-to-r from-[#c67c4e] to-[#9f5b31] text-white text-xs sm:text-sm font-bold py-3 active:scale-95 transition"
          >
            Add • ₹{food?.price}
          </button>
        </div>

        {/* Menu link */}
        {restaurantId && (
          <Link
            to={`/restaurant/${restaurantId}/menu`}
            className="block text-center text-[10px] mt-2 text-[#a07d63]"
          >
            View full menu
          </Link>
        )}
      </div>
    </motion.div>
  );
}

export default FoodDetailPage;