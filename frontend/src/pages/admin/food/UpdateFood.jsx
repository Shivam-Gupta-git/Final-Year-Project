import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { updateFood } from "../../../features/user/foodSlice";

function UpdateFood() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate()

  const { foods = [], loading } = useSelector((state) => state.food);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    isVeg: true,
    images: [null, null, null],
  });

  // ✅ find selected food
  useEffect(() => {
    const selectedFood = foods.find((f) => f._id === id);

    if (selectedFood) {
      setFormData({
        name: selectedFood.name || "",
        description: selectedFood.description || "",
        price: selectedFood.price || "",
        category: selectedFood.category || "",
        isVeg: selectedFood.isVeg ?? true,
        images: [null, null, null], // new images only
      });
    }
  }, [foods, id]);

  // -------- HANDLERS --------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (index, file) => {
    const updated = [...formData.images];
    updated[index] = file;

    setFormData((prev) => ({
      ...prev,
      images: updated,
    }));
  };

  // -------- SUBMIT --------
  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();

    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("category", formData.category);
    data.append("isVeg", formData.isVeg);

    formData.images.forEach((img) => {
      if (img) data.append("images", img);
    });

    dispatch(updateFood({ foodId: id, data }));
    alert("Food Updated Successfully");
    navigate("/admin/admin-active-restaurant")
  };

  return (
    <div className="min-h-screen bg-black px-4 md:px-6 py-6 text-white">
  
      {/* HEADER */}
      <div className="relative mb-8 overflow-hidden rounded-4xl border border-white/10 bg-linear-to-br from-zinc-950 via-zinc-900 to-black p-6 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
        <div className="absolute -top-10 right-0 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-red-500/20 blur-3xl" />
  
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-linear-to-br from-orange-500 to-red-600 text-3xl shadow-[0_10px_30px_rgba(249,115,22,0.45)]">
              🍔
            </div>
  
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.35em] text-zinc-500">
                Menu Management
              </p>
  
              <h1 className="text-3xl md:text-5xl font-black bg-linear-to-r from-white via-orange-100 to-orange-400 bg-clip-text text-transparent">
                Update Food
              </h1>
  
              <p className="mt-2 text-sm md:text-base text-zinc-400">
                Edit food details such as name, description, price, category and images
              </p>
            </div>
          </div>
  
          <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 px-5 py-3 text-sm text-orange-300 backdrop-blur-xl">
            Make sure all details are correct
          </div>
        </div>
      </div>
  
      {/* FORM CARD */}
      <div className="mx-auto max-w-4xl rounded-4xl border border-white/10 bg-zinc-950/90 p-6 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-8">
  
          {/* Food Name & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-400">
                Food Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                placeholder="Enter food name"
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
              />
            </div>
  
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-400">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                placeholder="Enter description"
                rows="4"
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
              />
            </div>
          </div>
  
          {/* Price & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-400">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                placeholder="Enter price"
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
              />
            </div>
  
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-400">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
              >
                <option value="">Select Category</option>
                <option value="starter">Starter</option>
                <option value="main">Main Course</option>
                <option value="dessert">Dessert</option>
              </select>
            </div>
          </div>
  
          {/* Veg / Non-Veg */}
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isVeg"
                checked={formData.isVeg}
                onChange={handleChange}
                className="h-5 w-5 rounded border-white/20 bg-white/10 text-emerald-400 focus:ring-emerald-400"
              />
              <span className="text-white font-medium">Veg Item</span>
            </label>
          </div>
  
          {/* Images */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-white">Food Images</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.images.map((img, i) => (
                <label
                  key={i}
                  className="group relative flex h-28 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border border-dashed border-white/15 bg-white/3 transition-all duration-300 hover:border-orange-500/40 hover:bg-white/5"
                >
                  {img ? (
                    <img
                      src={URL.createObjectURL(img)}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-2xl text-zinc-500 group-hover:text-orange-400">
                        +
                      </div>
                      <p className="text-xs text-zinc-500">Upload</p>
                    </div>
                  )}
                  <input
                    hidden
                    type="file"
                    onChange={(e) => handleImageChange(i, e.target.files[0])}
                  />
                </label>
              ))}
            </div>
          </div>
  
          {/* Submit */}
          <div className="pt-2">
            <button
              disabled={loading}
              className="w-full rounded-3xl bg-linear-to-r from-orange-500 to-red-600 py-4 text-lg font-bold text-white shadow-[0_12px_40px_rgba(249,115,22,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(249,115,22,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update Food"}
            </button>
          </div>
  
        </form>
      </div>
    </div>
  );
}

export default UpdateFood;