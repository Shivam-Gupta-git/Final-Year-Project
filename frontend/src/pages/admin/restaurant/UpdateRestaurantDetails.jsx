import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  getRestaurantById,
  updateRestaurant,
} from "../../../features/user/restaurantSlice";

function UpdateRestaurantDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { restaurant, loading } = useSelector((state) => state.restaurant);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    foodType: "",
    famousFood: "",
    avgCostForOne: "",
    bestTime: "",
    latitude: "",
    longitude: "",
    openingOpen: "",
    openingClose: "",
    images: [null, null, null, null, null],
  });

  /* -------- FETCH DATA -------- */
  useEffect(() => {
    if (id) dispatch(getRestaurantById(id));
  }, [dispatch, id]);

  /* -------- SET DATA -------- */
  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || "",
        address: restaurant.address || "",
        foodType: restaurant.foodType || "",
        famousFood: restaurant.famousFood || "",
        avgCostForOne: restaurant.avgCostForOne || "",
        bestTime: restaurant.bestTime || "",
        latitude: restaurant.location?.coordinates?.[1] || "",
        longitude: restaurant.location?.coordinates?.[0] || "",
        openingOpen: restaurant.openingHours?.open?.slice(0, 5) || "",
        openingClose: restaurant.openingHours?.close?.slice(0, 5) || "",
        images: [null, null, null, null, null],
      });
    }
  }, [restaurant]);

  /* -------- HANDLERS -------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGetLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setFormData((prev) => ({
        ...prev,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      }));
    });
  };

  const handleImageChange = (index, file) => {
    const updated = [...formData.images];
    updated[index] = file;
    setFormData((prev) => ({ ...prev, images: updated }));
  };

  /* -------- SUBMIT -------- */
  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();

    data.append("name", formData.name);
    data.append("address", formData.address);
    data.append("foodType", formData.foodType);
    data.append("famousFood", formData.famousFood);
    data.append("avgCostForOne", formData.avgCostForOne);
    data.append("bestTime", formData.bestTime);

    // opening hours
    const openingHours = {
      open: formData.openingOpen,
      close: formData.openingClose,
    };
    data.append("openingHours", JSON.stringify(openingHours));

    // location
    const location = {
      type: "Point",
      coordinates: [formData.longitude, formData.latitude],
    };
    data.append("location", JSON.stringify(location));

    // images
    formData.images.forEach((img) => {
      if (img) data.append("images", img);
    });

    dispatch(updateRestaurant({ id, data }));
    alert("Restaurant Updated Successfully");
    // navigate("/admin/adminDashboard");
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden px-4 py-8 md:px-8">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-orange-500 to-amber-500 flex items-center justify-center text-3xl shadow-lg shadow-orange-500/30">
              🍽️
            </div>

            <div>
              <p className="text-orange-400 text-sm font-semibold uppercase tracking-[0.3em] mb-1">
                Restaurant Panel
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Update Restaurant
              </h1>
              <p className="text-gray-400 mt-2 text-sm md:text-base">
                Edit restaurant information, upload images, and update timings.
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 text-emerald-300">
            <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
            Ready to update
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.55)] overflow-hidden">
          <div className="border-b border-white/10 px-6 md:px-8 py-5 bg-white/5">
            <h2 className="text-xl font-semibold text-white">
              Restaurant Information
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Fill in all the required restaurant details below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  placeholder="Enter restaurant name"
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-gray-500 outline-none transition-all duration-300 focus:border-orange-500 focus:bg-white/10 focus:ring-4 focus:ring-orange-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  placeholder="Enter restaurant address"
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-gray-500 outline-none transition-all duration-300 focus:border-orange-500 focus:bg-white/10 focus:ring-4 focus:ring-orange-500/20"
                />
              </div>
            </div>

            {/* Food Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Food Type
                </label>
                <input
                  type="text"
                  name="foodType"
                  value={formData.foodType}
                  placeholder="Veg / Non-Veg"
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-gray-500 outline-none transition-all duration-300 focus:border-orange-500 focus:bg-white/10 focus:ring-4 focus:ring-orange-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Famous Food
                </label>
                <input
                  type="text"
                  name="famousFood"
                  value={formData.famousFood}
                  placeholder="Special dish"
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-gray-500 outline-none transition-all duration-300 focus:border-orange-500 focus:bg-white/10 focus:ring-4 focus:ring-orange-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Average Cost
                </label>
                <input
                  type="number"
                  name="avgCostForOne"
                  value={formData.avgCostForOne}
                  placeholder="₹ Average"
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-gray-500 outline-none transition-all duration-300 focus:border-orange-500 focus:bg-white/10 focus:ring-4 focus:ring-orange-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Best Time
                </label>
                <select
                  name="bestTime"
                  value={formData.bestTime}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition-all duration-300 focus:border-orange-500 focus:bg-white/10 focus:ring-4 focus:ring-orange-500/20"
                >
                  <option value="" className="bg-gray-900">
                    Select Time
                  </option>
                  <option value="Morning" className="bg-gray-900">
                    Morning
                  </option>
                  <option value="Lunch" className="bg-gray-900">
                    Lunch
                  </option>
                  <option value="Evening" className="bg-gray-900">
                    Evening
                  </option>
                  <option value="Dinner" className="bg-gray-900">
                    Dinner
                  </option>
                  <option value="Night" className="bg-gray-900">
                    Night
                  </option>
                </select>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
              <h3 className="text-lg font-semibold text-white mb-5">
                Opening Hours
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Open Time
                  </label>
                  <select
                    name="openingOpen"
                    value={formData.openingOpen}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                  >
                    <option value="" className="bg-gray-900">
                      Open Time
                    </option>
                    <option value="06:00" className="bg-gray-900">
                      06:00 AM
                    </option>
                    <option value="08:00" className="bg-gray-900">
                      08:00 AM
                    </option>
                    <option value="10:00" className="bg-gray-900">
                      10:00 AM
                    </option>
                    <option value="12:00" className="bg-gray-900">
                      12:00 PM
                    </option>
                    <option value="16:00" className="bg-gray-900">
                      04:00 PM
                    </option>
                    <option value="18:00" className="bg-gray-900">
                      06:00 PM
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Close Time
                  </label>
                  <select
                    name="openingClose"
                    value={formData.openingClose}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                  >
                    <option value="" className="bg-gray-900">
                      Close Time
                    </option>
                    <option value="18:00" className="bg-gray-900">
                      06:00 PM
                    </option>
                    <option value="20:00" className="bg-gray-900">
                      08:00 PM
                    </option>
                    <option value="22:00" className="bg-gray-900">
                      10:00 PM
                    </option>
                    <option value="23:00" className="bg-gray-900">
                      11:00 PM
                    </option>
                    <option value="23:59" className="bg-gray-900">
                      11:59 PM
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-semibold text-white">Location</h3>
                  <p className="text-sm text-gray-400">
                    Latitude and longitude of your restaurant
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="Latitude"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-gray-500 outline-none transition-all duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20"
                />

                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="Longitude"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-gray-500 outline-none transition-all duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20"
                />

                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="group relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-4 font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-blue-500/40"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    📍 Get Current Location
                  </span>
                  <div className="absolute inset-0 translate-y-full bg-white/10 transition-transform duration-300 group-hover:translate-y-0" />
                </button>
              </div>
            </div>

            {/* Image Upload */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Restaurant Images
              </h3>
              <p className="text-sm text-gray-400 mb-5">
                Upload up to 5 restaurant images.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {formData.images.map((img, i) => (
                  <label
                    key={i}
                    className="group relative h-36 cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed border-white/10 bg-white/5 transition-all duration-300 hover:border-orange-500/60 hover:bg-white/10"
                  >
                    {img ? (
                      <img
                        src={URL.createObjectURL(img)}
                        alt="preview"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center text-gray-500 transition-all duration-300 group-hover:text-orange-400">
                        <span className="text-4xl font-light">+</span>
                        <span className="mt-2 text-xs font-medium uppercase tracking-wider">
                          Upload
                        </span>
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

            {/* Submit Button */}
            <button
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-2xl bg-linear-to-r from-orange-500 via-orange-600 to-red-500 px-6 py-4 text-lg font-bold text-white shadow-[0_15px_40px_rgba(249,115,22,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(249,115,22,0.55)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="relative z-10">
                {loading ? "Updating Restaurant..." : "Update Restaurant"}
              </span>
              <div className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-0" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateRestaurantDetails;
