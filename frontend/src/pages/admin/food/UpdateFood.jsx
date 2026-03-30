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
    <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">

      {/* HEADER */}
      <div className="mb-8 p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl border flex items-center gap-4">
        <div className="p-4 bg-orange-500 text-white rounded-xl text-xl">
          🍔
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Update Food
          </h1>
          <p className="text-gray-500">
            Edit food details
          </p>
        </div>
      </div>

      {/* FORM */}
      <div className="bg-white dark:bg-gray-900 max-w-5xl mx-auto rounded-2xl shadow-2xl p-8">

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* NAME */}
          <input
            type="text"
            name="name"
            value={formData.name}
            placeholder="Food Name"
            className="w-full border p-3 rounded-xl"
            onChange={handleChange}
          />

          {/* DESCRIPTION */}
          <textarea
            name="description"
            value={formData.description}
            placeholder="Description"
            rows="4"
            className="w-full border p-3 rounded-xl"
            onChange={handleChange}
          />

          {/* PRICE + CATEGORY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              name="price"
              value={formData.price}
              placeholder="Price"
              className="border p-3 rounded-xl"
              onChange={handleChange}
            />

            <select
              name="category"
              value={formData.category}
              className="border p-3 rounded-xl"
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              <option value="starter">Starter</option>
              <option value="main">Main Course</option>
              <option value="dessert">Dessert</option>
            </select>
          </div>

          {/* VEG / NON-VEG */}
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isVeg"
              checked={formData.isVeg}
              onChange={handleChange}
            />
            <span className="text-gray-700 dark:text-gray-300">
              Veg Item
            </span>
          </label>

          {/* IMAGES */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {formData.images.map((img, i) => (
              <label
                key={i}
                className="border h-28 flex items-center justify-center rounded-xl cursor-pointer"
              >
                {img ? (
                  <img
                    src={URL.createObjectURL(img)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-xl">+</span>
                )}

                <input
                  hidden
                  type="file"
                  onChange={(e) =>
                    handleImageChange(i, e.target.files[0])
                  }
                />
              </label>
            ))}
          </div>

          {/* BUTTON */}
          <button
            disabled={loading}
            className="w-full bg-orange-600 text-white py-3 rounded-xl text-lg font-semibold"
          >
            {loading ? "Updating..." : "Update Food"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default UpdateFood;