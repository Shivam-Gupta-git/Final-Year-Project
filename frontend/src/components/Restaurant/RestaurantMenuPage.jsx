import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { getAllFoodForUser } from "../../features/user/foodSlice";
import { getRestaurantByIdPublic } from "../../features/user/restaurantSlice";

function RestaurantMenuPage() {
  const { restaurantId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { foods, loading, error } = useSelector((s) => s.food);
  const { restaurant, restaurantDetailLoading } = useSelector(
    (s) => s.restaurant
  );

  const [search, setSearch] = useState("");
  const [vegFilter, setVegFilter] = useState(null);

  useEffect(() => {
    if (restaurantId) {
      dispatch(getRestaurantByIdPublic(restaurantId));
      dispatch(
        getAllFoodForUser({
          page: 1,
          limit: 100,
          restaurantId,
        })
      );
    }
  }, [dispatch, restaurantId]);

  const filtered = (foods ?? []).filter((f) => {
    const matchSearch = f?.name
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchVeg = vegFilter === null || f?.isVeg === vegFilter;
    return matchSearch && matchVeg;
  });

  const name =
    restaurant?.name ?? (restaurantDetailLoading ? "…" : "Restaurant");

  return (
    <div className="min-h-screen bg-linear-to-b from-[#f4f7fb] via-[#e9f0f8] to-[#dfe9f5] text-[#2d1f16]">

      {/* 🔝 TOP BAR */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-[#eadccf]">
        <div className="max-w-7xl mx-auto flex items-center gap-3 px-3 sm:px-6 py-3">

          <div className="min-w-0">
            <p className="text-base sm:text-xl font-semibold truncate">
              {name}
            </p>
            <p className="text-[10px] sm:text-xs text-[#a07d63] uppercase tracking-wider">
              {filtered.length} items
            </p>
          </div>
        </div>
      </div>

      {/* 🔍 FILTER BAR */}
      <div className="sticky top-15 z-40 bg-white/70 backdrop-blur-xl border-b border-[#f5ebe0]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex flex-col sm:flex-row gap-2 sm:items-center">

          {/* Search */}
          <div className="relative w-full sm:flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a07d63]" />
            <input
              type="search"
              placeholder="Search food..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#eadccf] bg-white py-2 pl-10 pr-3 text-sm focus:border-[#c67c4e] outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto">
            {[
              { label: "All", value: null },
              { label: "🥦 Veg", value: true },
              { label: "🍖 Non-Veg", value: false },
            ].map((f) => (
              <button
                key={f.label}
                onClick={() => setVegFilter(f.value)}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-full border whitespace-nowrap
                  ${
                    vegFilter === f.value
                      ? "bg-[#2d1f16] text-white border-[#2d1f16]"
                      : "bg-white text-[#6f5a4b]"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🍽️ MAIN */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6">

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm mb-4">
            {String(error)}
          </div>
        )}

        {loading && !foods?.length ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 border-2 border-[#c67c4e] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[#a07d63]">
            🍽️ No items found
          </div>
        ) : (
          <div
            className="
              grid gap-4
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >
            {filtered.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Link
                  to={`/food/${item._id}`}
                  state={{ restaurantId }}
                  className="block bg-white border border-[#eadccf] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition"
                >
                  {/* Image */}
                  <div className="relative aspect-16/10 overflow-hidden">
                    <img
                      src={
                        item.images?.[0] ||
                        "https://placehold.co/400x250"
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />

                    <span className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-full bg-white font-bold">
                      {item.isVeg ? "🥦 Veg" : "🍖 Non-Veg"}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold truncate">
                        {item.name}
                      </h3>
                      <span className="text-sm font-bold text-[#c67c4e]">
                        ₹{item.price}
                      </span>
                    </div>

                    <p className="text-xs text-[#6f5a4b] mt-1 line-clamp-2">
                      {item.description || "Delicious food item"}
                    </p>

                    {item.category && (
                      <span className="inline-block mt-2 text-[10px] px-2 py-1 border rounded-full">
                        {item.category}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default RestaurantMenuPage;