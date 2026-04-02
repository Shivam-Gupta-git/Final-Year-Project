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
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Fetch foods
  useEffect(() => {
    if (id) dispatch(getFoodByRestaurantId(id));
  }, [dispatch, id]);

  // Extract unique categories from foods
  const categories = ["All", ...new Set(foods.map((f) => f.category))];

  // Filter foods based on search and category
  const filteredFoods = foods.filter((food) => {
    const matchesCategory =
      activeCategory === "All" ? true : food.category === activeCategory;
    const matchesSearch = food.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
    {/* Background Glow */}
    <div className="absolute top-0 left-0 h-72 w-72 bg-orange-500/10 blur-3xl rounded-full" />
    <div className="absolute bottom-0 right-0 h-80 w-80 bg-blue-500/10 blur-3xl rounded-full" />

    <div className="relative z-10 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <p className="text-orange-400 text-sm font-semibold uppercase tracking-[0.35em] mb-2">
            Restaurant Dashboard
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Food Items Management
          </h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base max-w-2xl">
            View, manage and update all food items of this restaurant.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 px-5 py-4 min-w-35">
            <p className="text-xs uppercase tracking-widest text-orange-300 mb-1">
              Total Items
            </p>
            <h2 className="text-3xl font-bold text-white">{foods.length}</h2>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 min-w-35">
            <p className="text-xs uppercase tracking-widest text-emerald-300 mb-1">
              Available
            </p>
            <h2 className="text-3xl font-bold text-white">
              {foods.filter((f) => f.isAvailable).length}
            </h2>
          </div>
        </div>
      </div>

      {/* Search & Category Filters */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search food..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-2xl bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-64"
        />

        {/* Category Buttons */}
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-2xl border font-medium text-sm transition-all ${
                activeCategory === cat
                  ? "bg-orange-500 text-black border-orange-500"
                  : "bg-white/5 text-white border-white/10 hover:bg-orange-500/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 animate-pulse overflow-hidden">
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-2xl bg-white/5 border border-white/5"
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && filteredFoods.length === 0 && (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 py-20 text-center backdrop-blur-xl">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            No Food Items Found
          </h2>
          <p className="text-gray-400">
            Try adding food items or changing the filters/search.
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && filteredFoods.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-212.5">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
                    Food
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
                    Category
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
                    Price
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
                    Type
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-5 text-right text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
                    Details
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredFoods.map((food) => (
                  <tr
                    key={food._id}
                    className="border-b border-white/5 hover:bg-white/5 transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedFood(food)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 min-w-55">
                        <img
                          src={food.images?.[0] || "/no-image.jpg"}
                          alt={food.name}
                          className="h-14 w-14 rounded-2xl object-cover border border-white/10"
                        />

                        <div>
                          <h3 className="font-semibold text-white capitalize text-sm md:text-base">
                            {food.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-50">
                            {food.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-300 text-sm">
                      {food.category}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-xl bg-orange-500/10 border border-orange-500/20 px-3 py-1 text-orange-300 font-semibold text-sm">
                        ₹{food.price}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-xl px-3 py-1 text-xs font-semibold border ${
                          food.isVeg
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                            : "bg-red-500/10 text-red-300 border-red-500/20"
                        }`}
                      >
                        {food.isVeg ? "Veg" : "Non-Veg"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-xl px-3 py-1 text-xs font-semibold border ${
                          food.isAvailable
                            ? "bg-blue-500/10 text-blue-300 border-blue-500/20"
                            : "bg-gray-500/10 text-gray-300 border-gray-500/20"
                        }`}
                      >
                        {food.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition-all duration-300 hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-300"
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  
      {/* Right Sidebar Details */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-105 md:w-120 transform border-l border-white/10 bg-[#090909]/95 backdrop-blur-3xl shadow-[-20px_0_60px_rgba(0,0,0,0.7)] transition-transform duration-500 ${
          selectedFood ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedFood && (
          <div className="flex h-full flex-col overflow-y-auto">
            {/* Sidebar Header */}
            <div className="sticky top-0 z-10 border-b border-white/10 bg-[#090909]/90 backdrop-blur-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-orange-400 mb-1">
                  Food Details
                </p>
                <h2 className="text-2xl font-bold text-white capitalize">
                  {selectedFood.name}
                </h2>
              </div>
  
              <button
                onClick={() => setSelectedFood(null)}
                className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 text-gray-400 hover:text-red-400 hover:border-red-500/30 transition-all"
              >
                ✕
              </button>
            </div>
  
            {/* Main Image */}
            <div className="p-5">
              <img
                src={selectedFood.images?.[0] || "/no-image.jpg"}
                alt={selectedFood.name}
                className="h-64 w-full rounded-3xl object-cover border border-white/10"
              />
            </div>
  
            {/* Gallery */}
            <div className="px-5 grid grid-cols-3 gap-3">
              {selectedFood.images?.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="food"
                  className="h-24 w-full rounded-2xl object-cover border border-white/10"
                />
              ))}
            </div>
  
            {/* Details */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Category
                  </p>
                  <p className="font-semibold text-white">{selectedFood.category}</p>
                </div>
  
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Price
                  </p>
                  <p className="font-semibold text-orange-300">₹{selectedFood.price}</p>
                </div>
  
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Food Type
                  </p>
                  <p className={`${selectedFood.isVeg ? "text-emerald-300" : "text-red-300"} font-semibold`}>
                    {selectedFood.isVeg ? "Veg" : "Non-Veg"}
                  </p>
                </div>
  
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Availability
                  </p>
                  <p className={`${selectedFood.isAvailable ? "text-blue-300" : "text-gray-300"} font-semibold`}>
                    {selectedFood.isAvailable ? "Available" : "Unavailable"}
                  </p>
                </div>
              </div>
  
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Description
                </h3>
                <p className="text-sm leading-7 text-gray-400">
                  {selectedFood.description || "No description available."}
                </p>
              </div>
            </div>
  
            {/* Footer Actions */}
            <div className="mt-auto sticky bottom-0 border-t border-white/10 bg-[#090909]/95 p-5 backdrop-blur-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  to={`/admin/update-food/${selectedFood._id}`}
                  className="rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700"
                >
                  Update Food Items
                </Link>
  
                <button
                  onClick={() => dispatch(toggleFoodAvailability(selectedFood._id))}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                    selectedFood.isAvailable
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {selectedFood.isAvailable ? "Make Unavailable" : "Make Available"}
                </button>
  
                <button
                  onClick={() => dispatch(deleteFood(selectedFood._id))}
                  className="rounded-2xl bg-red-500/15 border border-red-500/30 px-4 py-3 text-sm font-semibold text-red-300 transition-all duration-300 hover:bg-red-500 hover:text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  
      {/* Overlay */}
      {selectedFood && (
        <div
          onClick={() => setSelectedFood(null)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        />
      )}
    </div>
  );
}

export default GetAllFood;
