import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createCity } from "../../../features/user/citySlice";
import { useNavigate } from "react-router-dom";
import {
  FaCity,
  FaGlobeAsia,
  FaMapMarkerAlt,
  FaImage,
  FaLocationArrow,
} from "react-icons/fa";
import { motion } from "framer-motion";

function AddCityDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, createSuccess } = useSelector((state) => state.city);

  const famousOptions = [
    "tourism",
    "beaches",
    "mountains",
    "food",
    "history",
    "nightlife",
    "shopping",
  ];

  const bestTimeOptions = [
    "January - March",
    "April - June",
    "July - September",
    "October - December",
    "Winter",
    "Summer",
    "Monsoon",
    "All Year",
  ];

  const [formData, setFormData] = useState({
    name: "",
    state: "",
    country: "",
    description: "",
    bestTimeToVisit: "",
    avgDailyBudget: "",
    famousFor: [],
    latitude: "",
    longitude: "",
    images: [null, null, null, null, null],
  });

  const handleChange = ({ target: { name, value } }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleFamous = (item) => {
    setFormData((prev) => {
      const exists = prev.famousFor.includes(item);

      return {
        ...prev,
        famousFor: exists
          ? prev.famousFor.filter((f) => f !== item)
          : [...prev.famousFor, item],
      };
    });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      setFormData((prev) => ({
        ...prev,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }));
    });
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];

    if (!file) return;

    setFormData((prev) => {
      const updatedImages = [...prev.images];
      updatedImages[index] = file;

      return {
        ...prev,
        images: updatedImages,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();

    data.append("name", formData.name);
    data.append("state", formData.state);
    data.append("country", formData.country);
    data.append("description", formData.description);
    data.append("bestTimeToVisit", formData.bestTimeToVisit);
    data.append("avgDailyBudget", formData.avgDailyBudget);
    data.append("famousFor", formData.famousFor.join(","));

    const location = {
      type: "Point",
      coordinates: [
        Number(formData.longitude),
        Number(formData.latitude),
      ],
    };

    data.append("location", JSON.stringify(location));

    formData.images
      .filter(Boolean)
      .forEach((img) => data.append("images", img));

    dispatch(createCity(data));
  };

  useEffect(() => {
    if (createSuccess === true) {
      navigate("/superAdmin/superAdminDashboard");
    }
  }, [navigate, createSuccess]);

  return (
    <div className="min-h-screen bg-black px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-zinc-950 via-zinc-900 to-black p-8 shadow-[0_25px_80px_rgba(0,0,0,0.7)]"
        >
          <div className="absolute -top-16 right-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-52 w-52 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-5">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.08 }}
                className="flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br from-cyan-500 to-blue-600 text-4xl shadow-xl shadow-cyan-500/20"
              >
                <FaCity />
              </motion.div>

              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                  Smart City Management
                </div>

                <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                  Create a New
                  <span className="ml-3 bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    City Profile
                  </span>
                </h1>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
                  Add a city with detailed information, attractions, budget,
                  location, and media. Create a polished destination profile for
                  your platform in just a few steps.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
                    <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
                      Maximum Images
                    </p>
                    <p className="mt-1 text-xl font-bold text-white">5</p>
                  </div>

                  <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 backdrop-blur-xl">
                    <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                      Location Support
                    </p>
                    <p className="mt-1 text-xl font-bold text-cyan-100">
                      Enabled
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="grid gap-4 sm:grid-cols-2 lg:w-90"
            >
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <FaGlobeAsia className="mb-3 text-2xl text-cyan-400" />
                <p className="text-sm text-zinc-400">Global Reach</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  Add Cities Worldwide
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <FaMapMarkerAlt className="mb-3 text-2xl text-blue-400" />
                <p className="text-sm text-zinc-400">GPS Coordinates</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  Auto Detect Available
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/90 shadow-[0_20px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
        >
          <div className="grid gap-8 p-6 lg:grid-cols-2 lg:p-8">
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  City Name
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter city name"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-cyan-500/50 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/10"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    State
                  </label>
                  <input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-cyan-500/50 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/10"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Country
                  </label>
                  <input
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Enter country"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-cyan-500/50 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Describe the city, attractions, atmosphere and culture..."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-cyan-500/50 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/10"
                  required
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Best Time to Visit
                  </label>
                  <select
                    name="bestTimeToVisit"
                    value={formData.bestTimeToVisit}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all duration-300 focus:border-cyan-500/50 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/10"
                    required
                  >
                    <option value="">Select best time</option>
                    {bestTimeOptions.map((time) => (
                      <option key={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Average Daily Budget
                  </label>
                  <input
                    name="avgDailyBudget"
                    value={formData.avgDailyBudget}
                    onChange={handleChange}
                    placeholder="₹ Enter budget"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-cyan-500/50 focus:bg-white/10 focus:ring-4 focus:ring-cyan-500/10"
                    required
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <FaLocationArrow className="text-cyan-400" />
                  <h3 className="font-semibold text-white">Location Details</h3>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <input
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="Latitude"
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-cyan-500/50"
                  />

                  <input
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="Longitude"
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-cyan-500/50"
                  />

                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className="rounded-2xl bg-linear-to-r from-cyan-500 to-blue-600 px-4 py-3 font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/20"
                  >
                    Get Location
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 p-6 lg:p-8">
            <div className="mb-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Famous For
              </h3>
              <div className="flex flex-wrap gap-3">
                {famousOptions.map((item) => {
                  const active = formData.famousFor.includes(item);

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleFamous(item)}
                      className={`rounded-2xl border px-4 py-2 text-sm font-medium capitalize transition-all duration-300 ${
                        active
                          ? "border-cyan-500 bg-cyan-500/20 text-cyan-300 shadow-lg shadow-cyan-500/10"
                          : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center gap-3">
                <FaImage className="text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">
                  City Images (Max 5)
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {formData.images.map((img, index) => (
                  <motion.label
                    whileHover={{ scale: 1.03 }}
                    key={index}
                    className="group relative flex h-36 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border border-dashed border-white/10 bg-white/5 transition-all duration-300 hover:border-cyan-500/40 hover:bg-white/10"
                  >
                    {img ? (
                      <img
                        src={URL.createObjectURL(img)}
                        alt="preview"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="text-center text-zinc-500 transition group-hover:text-cyan-300">
                        <div className="text-3xl">+</div>
                        <p className="mt-1 text-xs">Upload</p>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => handleImageChange(e, index)}
                    />
                  </motion.label>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-linear-to-r from-emerald-500 to-green-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-emerald-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating City..." : "Create City"}
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

export default AddCityDetails;