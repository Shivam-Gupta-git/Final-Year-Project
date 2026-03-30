import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteFood,
  getFoodByRestaurantId,
  toggleFoodAvailability,
} from "../../../features/user/foodSlice";
import { Link, useParams } from "react-router-dom";

function GetAllFood() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { foods = [], loading } = useSelector((state) => state.food);

  const [selectedFood, setSelectedFood] = useState(null);

  // ✅ FIXED dependency
  useEffect(() => {
    if (id) dispatch(getFoodByRestaurantId(id));
  }, [dispatch, id]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* HEADER */}
      <div className="mb-8 p-6 rounded-2xl bg-white dark:bg-gray-800 shadow flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Food Items
          </h1>
          <p className="text-gray-500 text-sm">Total Items: {foods.length}</p>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow"
            >
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY */}
      {!loading && foods.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          🍽️ No Food Items Found
        </div>
      )}

      {/* FOOD GRID */}
      {!loading && foods.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {foods.map((food) => (
            <div
              key={food._id}
              onClick={() => setSelectedFood(food)}
              className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md cursor-pointer hover:shadow-xl transition"
            >
              {/* IMAGE */}
              <img
                src={food.images?.[0] || "/no-image.jpg"}
                alt={food.name}
                className="w-full h-40 object-cover rounded-xl mb-3"
              />

              {/* INFO */}
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white capitalize">
                {food.name}
              </h3>

              <p className="text-sm text-gray-500">{food.category}</p>

              <p className="text-sm text-gray-600 mt-1">₹{food.price}</p>

              <p
                className={`text-xs mt-2 font-semibold ${
                  food.isVeg ? "text-green-600" : "text-red-600"
                }`}
              >
                {food.isVeg ? "Veg" : "Non-Veg"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedFood && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full md:w-2/3 max-h-[90vh] overflow-y-auto p-6 relative">
            {/* CLOSE */}
            <button
              onClick={() => setSelectedFood(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl"
            >
              ✕
            </button>

            {/* TITLE */}
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white capitalize">
              {selectedFood.name}
            </h2>

            {/* IMAGES */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {selectedFood.images?.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="food"
                  className="w-full h-32 object-cover rounded-lg"
                />
              ))}
            </div>

            {/* DETAILS */}
            <div className="grid md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
              <p>
                <b>Category:</b> {selectedFood.category}
              </p>
              <p>
                <b>Price:</b> ₹{selectedFood.price}
              </p>
              <p>
                <b>Type:</b> {selectedFood.isVeg ? "Veg" : "Non-Veg"}
              </p>
              <p>
                <b>Status:</b>{" "}
                {selectedFood.isAvailable ? "Available" : "Not Available"}
              </p>
            </div>

            {/* DESCRIPTION */}
            <div className="mt-4">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                Description
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {selectedFood.description}
              </p>
            </div>

            <div className=" flex items-center justify-end p-2 gap-3">
              <Link
                to={`/admin/update-food/${selectedFood._id}`}
                className="bg-blue-400 hover:bg-blue-500 hover:text-white duration-300 px-2 py-1 cursor-pointer rounded-sm"
              >
                Update
              </Link>
              <button
                onClick={() =>
                  dispatch(toggleFoodAvailability(selectedFood._id))
                }
                className={`px-3 py-1 rounded ${
                  selectedFood.isAvailable
                    ? "bg-green-500 hover:bg-green-600 hover:text-white duration-300"
                    : "bg-red-500 hover:bg-red-600 hover:text-white duration-300"
                } text-black cursor-pointer`}
              >
                {selectedFood.isAvailable ? "Available" : "Unavailable"}
              </button>

              <button
                onClick={() => dispatch(deleteFood(selectedFood._id))}
                className="bg-red-500 hover:bg-red-600 text-black hover:text-white duration-300 cursor-pointer px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GetAllFood;
