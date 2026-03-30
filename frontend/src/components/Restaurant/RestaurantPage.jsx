import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getAllFoodForUser } from "../../features/user/foodSlice";

function RestaurantPage() {
  const dispatch = useDispatch();
  const { restaurantId } = useParams();

  const { foods = [], loading } = useSelector((state) => state.food);

  const [search, setSearch] = useState("");
  const [vegFilter, setVegFilter] = useState(null);

  useEffect(() => {
    dispatch(
      getAllFoodForUser({
        page: 1,
        restaurantId: restaurantId || "",
        category: "",
        isVeg: vegFilter === null ? "" : vegFilter,
      })
    );
  }, [dispatch, restaurantId, vegFilter]);

  const filteredFoods = foods.filter((f) =>
    f?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const restaurantName =
    foods[0]?.restaurantId?.name ?? "Restaurant";
  const cityName =
    foods[0]?.restaurantId?.city?.name ?? "City";

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
      <div className="flex-1 p-6">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow dark:bg-gray-900">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {restaurantName}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {cityName}
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search food..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />

          <button
            type="button"
            onClick={() => setVegFilter(null)}
            className={`rounded-xl px-4 py-2 ${
              vegFilter === null
                ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900"
                : "bg-gray-200 dark:bg-gray-800 dark:text-gray-200"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setVegFilter(true)}
            className={`rounded-xl px-4 py-2 ${
              vegFilter === true
                ? "bg-green-500 text-white"
                : "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
            }`}
          >
            Veg
          </button>

          <button
            type="button"
            onClick={() => setVegFilter(false)}
            className={`rounded-xl px-4 py-2 ${
              vegFilter === false
                ? "bg-red-500 text-white"
                : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
            }`}
          >
            Non-Veg
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {filteredFoods.map((item) => (
              <div
                key={item._id}
                className="rounded-2xl bg-white p-4 shadow transition hover:shadow-lg dark:bg-gray-900"
              >
                <img
                  src={item.images?.[0] || "/no-image.jpg"}
                  alt=""
                  className="h-40 w-full rounded-xl object-cover"
                />

                <h3 className="mt-3 font-semibold text-gray-800 dark:text-white">
                  {item.name}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ₹{item.price}
                </p>

                <p
                  className={`mt-1 text-xs ${
                    item.isVeg ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.isVeg ? "Veg" : "Non-Veg"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RestaurantPage;
