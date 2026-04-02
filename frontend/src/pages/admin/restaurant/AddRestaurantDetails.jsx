import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createRestaurant } from "../../../features/user/restaurantSlice";
import { getActiveCities } from "../../../features/user/citySlice";
import { useNavigate } from "react-router-dom";

function AddRestaurantDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, createSuccess } = useSelector((state) => state.restaurant);
  const { cities } = useSelector((state) => state.city);

  const [formData, setFormData] = useState({
    name: "",
    state: "",
    city: "",
    address: "",
    famousFood: "",
    foodType: "veg",
    avgCostForOne: "",
    bestTime: "anytime",
    latitude: "",
    longitude: "",
    isRecommended: false,
    openingHours: {
      open: "",
      close: "",
    },
    images: [null, null, null, null, null],
  });

  useEffect(() => {
    dispatch(getActiveCities());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 📍 GET LOCATION (same as hotel)
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();

    data.append("name", formData.name);
    data.append("stateId", formData.state);
    data.append("cityId", formData.city);
    data.append("address", formData.address);
    data.append("famousFood", formData.famousFood);
    data.append("foodType", formData.foodType);
    data.append("avgCostForOne", formData.avgCostForOne);
    data.append("bestTime", formData.bestTime);
    data.append("isRecommended", formData.isRecommended);
    data.append(
      "openingHours",
      JSON.stringify(formData.openingHours)
    );

    const location = {
      type: "Point",
      coordinates: [formData.longitude, formData.latitude],
    };

    data.append("location", JSON.stringify(location));

    formData.images.forEach((img) => {
      if (img) data.append("images", img);
    });
    dispatch(createRestaurant(data));
  };

  useEffect(() => {
    if (loading) {
      alert("Restaurant Created Successfully");
      navigate("/admin/restaurantDashboard");
    }
  }, [loading, navigate]);

  return (
    <div className="min-h-screen bg-black px-4 md:px-6 py-6 text-white">
      {/* Header */}
      <div className="relative mb-8 overflow-hidden rounded-4xl border border-white/10 bg-linear-to-br from-zinc-950 via-zinc-900 to-black p-6 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
        <div className="absolute -top-10 right-0 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-red-500/20 blur-3xl" />
  
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-linear-to-br from-orange-500 to-red-600 text-3xl shadow-[0_10px_30px_rgba(249,115,22,0.45)]">
              🍽️
            </div>
  
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.35em] text-zinc-500">
                Restaurant Management
              </p>
  
              <h1 className="text-3xl md:text-5xl font-black bg-linear-to-r from-white via-orange-100 to-orange-400 bg-clip-text text-transparent">
                Create Restaurant
              </h1>
  
              <p className="mt-2 text-sm md:text-base text-zinc-400">
                Add restaurant details, location, timings and images
              </p>
            </div>
          </div>
  
          <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 px-5 py-3 text-sm text-orange-300 backdrop-blur-xl">
            Fill all required details carefully
          </div>
        </div>
      </div>
  
      {/* Form Card */}
      <div className="mx-auto max-w-6xl rounded-4xl border border-white/10 bg-zinc-950/90 p-6 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Details */}
          <div>
            <h2 className="mb-5 text-xl font-bold text-white">
              Basic Information
            </h2>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter restaurant name"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
                  onChange={handleChange}
                />
              </div>
  
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">
                  Famous Food
                </label>
                <input
                  type="text"
                  name="famousFood"
                  placeholder="e.g. Pizza, Biryani, Momos"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
  
          {/* State & City */}
          <div>
            <h2 className="mb-5 text-xl font-bold text-white">Location Details</h2>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">
                  Select State
                </label>
                <select
                  name="state"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
                  onChange={handleChange}
                >
                  <option className="bg-zinc-900" value="">
                    Select State
                  </option>
                  {cities.map((city) => (
                    <option
                      className="bg-zinc-900"
                      key={city._id}
                      value={city._id}
                    >
                      {city.state}
                    </option>
                  ))}
                </select>
              </div>
  
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">
                  Select City
                </label>
                <select
                  name="city"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
                  onChange={handleChange}
                >
                  <option className="bg-zinc-900" value="">
                    Select City
                  </option>
                  {cities.map((city) => (
                    <option
                      className="bg-zinc-900"
                      key={city._id}
                      value={city._id}
                    >
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
  
            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-zinc-400">
                Full Address
              </label>
              <input
                type="text"
                name="address"
                placeholder="Enter restaurant address"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
                onChange={handleChange}
              />
            </div>
          </div>
  
          {/* Restaurant Info */}
          <div>
            <h2 className="mb-5 text-xl font-bold text-white">
              Restaurant Preferences
            </h2>
  
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">
                  Food Type
                </label>
                <select
                  name="foodType"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
                  onChange={handleChange}
                >
                  <option className="bg-zinc-900" value="veg">
                    Veg
                  </option>
                  <option className="bg-zinc-900" value="non-veg">
                    Non Veg
                  </option>
                  <option className="bg-zinc-900" value="both">
                    Both
                  </option>
                </select>
              </div>
  
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">
                  Avg Cost Per Person
                </label>
                <input
                  type="number"
                  name="avgCostForOne"
                  placeholder="₹ 300"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
                  onChange={handleChange}
                />
              </div>
  
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">
                  Best Time
                </label>
                <select
                  name="bestTime"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
                  onChange={handleChange}
                >
                  <option className="bg-zinc-900" value="anytime">
                    Anytime
                  </option>
                  <option className="bg-zinc-900" value="breakfast">
                    Breakfast
                  </option>
                  <option className="bg-zinc-900" value="lunch">
                    Lunch
                  </option>
                  <option className="bg-zinc-900" value="dinner">
                    Dinner
                  </option>
                </select>
              </div>
            </div>
          </div>
  
          {/* Opening Hours */}
          <div>
            <h2 className="mb-5 text-xl font-bold text-white">
              Opening Hours
            </h2>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">
                  Open Time
                </label>
                <select
                  value={formData.openingHours.open}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      openingHours: {
                        ...prev.openingHours,
                        open: e.target.value,
                      },
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
                >
                  <option className="bg-zinc-900" value="">
                    Select Open Time
                  </option>
                  <option className="bg-zinc-900" value="06:00">
                    06:00 AM
                  </option>
                  <option className="bg-zinc-900" value="08:00">
                    08:00 AM
                  </option>
                  <option className="bg-zinc-900" value="10:00">
                    10:00 AM
                  </option>
                  <option className="bg-zinc-900" value="12:00">
                    12:00 PM
                  </option>
                </select>
              </div>
  
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">
                  Close Time
                </label>
                <select
                  value={formData.openingHours.close}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      openingHours: {
                        ...prev.openingHours,
                        close: e.target.value,
                      },
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
                >
                  <option className="bg-zinc-900" value="">
                    Select Close Time
                  </option>
                  <option className="bg-zinc-900" value="18:00">
                    06:00 PM
                  </option>
                  <option className="bg-zinc-900" value="20:00">
                    08:00 PM
                  </option>
                  <option className="bg-zinc-900" value="22:00">
                    10:00 PM
                  </option>
                  <option className="bg-zinc-900" value="23:59">
                    11:59 PM
                  </option>
                </select>
              </div>
            </div>
          </div>
  
          {/* Coordinates */}
          <div>
            <h2 className="mb-5 text-xl font-bold text-white">
              Restaurant Coordinates
            </h2>
  
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">
                  Latitude
                </label>
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      latitude: e.target.value,
                    }))
                  }
                  placeholder="Latitude"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
                />
              </div>
  
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">
                  Longitude
                </label>
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      longitude: e.target.value,
                    }))
                  }
                  placeholder="Longitude"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
                />
              </div>
  
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="w-full rounded-2xl border border-blue-500/20 bg-blue-500/15 px-4 py-3 font-semibold text-blue-300 transition-all duration-300 hover:bg-blue-500/25 hover:border-blue-500/40"
                >
                  Auto Detect Location
                </button>
              </div>
            </div>
          </div>
  
          {/* Recommended */}
          <div className="rounded-3xl border border-white/10 bg-white/3 p-5">
            <label className="flex items-center gap-4 cursor-pointer">
              <input
                type="checkbox"
                name="isRecommended"
                onChange={handleChange}
                className="h-5 w-5 rounded border-white/20 bg-white/10 text-orange-500 focus:ring-orange-500"
              />
              <div>
                <p className="font-semibold text-white">
                  Mark as Recommended Restaurant
                </p>
                <p className="text-sm text-zinc-500">
                  Recommended restaurants will be highlighted for users
                </p>
              </div>
            </label>
          </div>
  
          {/* Images */}
          <div>
            <h2 className="mb-5 text-xl font-bold text-white">
              Restaurant Images
            </h2>
  
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {formData.images.map((img, i) => (
                <label
                  key={i}
                  className="group relative flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border border-dashed border-white/15 bg-white/3 transition-all duration-300 hover:border-orange-500/40 hover:bg-white/5"
                >
                  {img ? (
                    <>
                      <img
                        src={URL.createObjectURL(img)}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        alt=""
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 transition group-hover:opacity-100" />
                    </>
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
              {loading ? "Creating Restaurant..." : "Create Restaurant"}
            </button>
  
            {createSuccess && (
              <p className="mt-4 text-center text-sm font-medium text-emerald-400">
                Restaurant created successfully and is pending approval.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddRestaurantDetails;
