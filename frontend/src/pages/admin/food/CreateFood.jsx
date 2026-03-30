import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createFood } from "../../../features/user/foodSlice";
import { getRestaurantStatus } from "../../../features/user/restaurantSlice";

function CreateFood() {
  const dispatch = useDispatch();

  const { restaurants = [], loading } = useSelector((state) => state.restaurant);

  // console.log(restaurants);
  
  useEffect(() => {
   dispatch(getRestaurantStatus("active"))
  }, [dispatch])

  const [formData, setFormData] = useState({
    restaurantId: "",
    name: "",
    description: "",
    price: "",
    category: "",
    isVeg: true,
    images: [null, null, null],
  });


  // ✅ Filter ACTIVE restaurants safely
  const activeRestaurants = (restaurants || []).filter(
    (r) => r.status === "active"
  );

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

    // ✅ validation
    if (!formData.restaurantId) {
      alert("Please select a restaurant");
      return;
    }

    if (!formData.name || !formData.price || !formData.category) {
      alert("Please fill all required fields");
      return;
    }

    const data = new FormData();

    data.append("restaurantId", formData.restaurantId);
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("category", formData.category);

    // ✅ convert boolean to string (safe for backend)
    data.append("isVeg", formData.isVeg ? "true" : "false");

    formData.images.forEach((img) => {
      if (img) data.append("images", img);
    });

    dispatch(createFood(data));

    // ✅ reset form
    setFormData({
      restaurantId: "",
      name: "",
      description: "",
      price: "",
      category: "",
      isVeg: true,
      images: [null, null, null],
    });

    alert("Food Created Successfully");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* HEADER */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow">
        <h1 className="text-2xl font-bold">Add Food Item</h1>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow space-y-4"
      >

        {/* RESTAURANT */}
        <select
          name="restaurantId"
          value={formData.restaurantId}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        >
          <option value="">Select Restaurant</option>

          {activeRestaurants.map((r) => (
            <option key={r._id} value={r._id}>
              {r.name} ({r.city?.name})
            </option>
          ))}
        </select>

        {/* NAME */}
        <input
          type="text"
          name="name"
          placeholder="Food Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        {/* DESCRIPTION */}
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        {/* PRICE */}
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        />

        {/* CATEGORY */}
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg"
        >
          <option value="">Select Category</option>
          <option value="starter">Starter</option>
          <option value="main">Main Course</option>
          <option value="dessert">Dessert</option>
        </select>

        {/* VEG */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isVeg"
            checked={formData.isVeg}
            onChange={handleChange}
          />
          Veg Item
        </label>

        {/* IMAGES */}
        <div className="grid grid-cols-3 gap-3">
          {formData.images.map((img, i) => (
            <label
              key={i}
              className="border h-24 flex items-center justify-center rounded-lg cursor-pointer"
            >
              {img ? (
                <img
                  src={URL.createObjectURL(img)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-gray-400">+</span>
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
          className="w-full bg-orange-500 text-white py-3 rounded-lg"
        >
          {loading ? "Adding..." : "Add Food"}
        </button>

      </form>
    </div>
  );
}

export default CreateFood;