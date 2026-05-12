import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createHotel } from "../../../features/user/hotelSlice";
import { getActiveCities } from "../../../features/user/citySlice";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function AddHotelDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, createSuccess } = useSelector((state) => state.hotel);
  const { cities } = useSelector((state) => state.city);

  const facilitiesList = [
    "free wifi",
    "swimming pool",
    "gym",
    "9+ restaurants & bars",
    "spa",
    "bar",
    "24/7 business center",
    "Currency exchange",
    "Parking & EV charging",
    "Laundry & dry cleaning",
    "Outdoor temperature-controlled swimming pool",
    "Full-service spa",
    "Fitness centre with modern equipment",
    "Multiple restaurants & bars (fine dining, lounge, cocktails)",
    "24-hour concierge & butler service",
    "Business centre & meeting/banquet facilities",
    "Free Wi-Fi in rooms",
    "Laundry & travel desk services",
    "Female butler service (for solo women travelers)",
    "IoT-based air purification system in rooms",
  ];

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    description: "",
    latitude: "",
    longitude: "",
    facilities: [],
    pricePerNight: "",
    images: [null, null, null, null, null],
  });

  useEffect(() => {
    dispatch(getActiveCities());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleFacility = (facility) => {
    setFormData((prev) => {
      const exists = prev.facilities.includes(facility);
      return {
        ...prev,
        facilities: exists
          ? prev.facilities.filter((f) => f !== facility)
          : [...prev.facilities, facility],
      };
    });
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();

    data.append("name", formData.name);
    data.append("city", formData.city);
    data.append("address", formData.address);
    data.append("description", formData.description);
    data.append("facilities", formData.facilities.join(","));
    data.append("pricePerNight", formData.pricePerNight);
    const location = {
      type: "Point",
      coordinates: [formData.longitude, formData.latitude],
    };

    data.append("location", JSON.stringify(location));

    formData.images.forEach((img) => {
      if (img) data.append("images", img);
    });

    // console.log(data);
    dispatch(createHotel(data));
    alert("Hotel Create SuccessFul.");
    navigate("/admin/adminDashboard");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8fafc] px-4 py-6 md:px-8">
      {/* Premium Ecommerce Background */}
      <div className="absolute inset-0">
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(96,165,250,0.12),transparent_30%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.08),transparent_35%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 overflow-hidden rounded-4xl border border-white/70 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl"
        >
          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="flex items-start gap-5">
              <motion.div
                whileHover={{ rotate: 8, scale: 1.05 }}
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-linear-to-br from-orange-500 via-amber-500 to-red-500 text-3xl text-white shadow-[0_15px_35px_rgba(249,115,22,0.35)]"
              >
                🏨
              </motion.div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.4em] text-orange-500">
                  Hotel Management
                </p>

                <h1 className="text-3xl font-black leading-tight text-slate-900 md:text-5xl">
                  Create New Hotel
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">
                  Add your hotel information, upload images, select facilities
                  and set the exact location with a premium dashboard
                  experience.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-orange-500 animate-pulse" />
                <p className="text-sm font-semibold text-orange-700">
                  Fill all required details carefully
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="overflow-hidden rounded-4xl border border-white/70 bg-white/85 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl"
        >
          <div className="border-b border-slate-200/70 bg-linear-to-r from-orange-50 via-white to-sky-50 px-6 py-6 md:px-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Hotel Details Form
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Complete the form below to create a new hotel listing.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10 p-6 md:p-8">
            {/* Basic Information */}
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="h-10 w-1 rounded-full bg-orange-500" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Basic Information
                  </h3>
                  <p className="text-sm text-slate-500">
                    Enter the hotel name and type
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Hotel Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter hotel name"
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Hotel Type
                  </label>
                  <input
                    type="text"
                    name="type"
                    placeholder="Resort, Motel, Lodge..."
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="rounded-4xl border border-slate-200 bg-linear-to-br from-sky-50 via-white to-cyan-50 p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-10 w-1 rounded-full bg-sky-500" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Location Details
                  </h3>
                  <p className="text-sm text-slate-500">
                    Choose the city and provide the hotel address
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Select City
                  </label>

                  <select
                    name="city"
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-slate-700 outline-none transition-all duration-300 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    onChange={handleChange}
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city._id} value={city._id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Full Address
                  </label>

                  <input
                    type="text"
                    name="address"
                    placeholder="Enter complete hotel address"
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Facilities */}
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="h-10 w-1 rounded-full bg-purple-500" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Facilities
                  </h3>
                  <p className="text-sm text-slate-500">
                    Select all facilities available in your hotel
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {facilitiesList.map((f, index) => (
                  <motion.div
                    key={f}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleFacility(f)}
                    className={`cursor-pointer rounded-2xl border px-4 py-4 text-center text-sm font-semibold transition-all duration-300 ${
                      formData.facilities.includes(f)
                        ? "border-orange-300 bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-[0_10px_25px_rgba(249,115,22,0.30)]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50"
                    }`}
                  >
                    {f}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* pricePerNight */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Average Room Price Per Night
              </label>

              <input
                type="number"
                name="pricePerNight"
                placeholder="Enter average room price"
                value={formData.pricePerNight}
                onChange={handleChange}
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            {/* Description */}
            <div className="rounded-4xl border border-slate-200 bg-linear-to-br from-violet-50 via-white to-purple-50 p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-10 w-1 rounded-full bg-violet-500" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Hotel Description
                  </h3>
                  <p className="text-sm text-slate-500">
                    Write a compelling description to attract guests
                  </p>
                </div>
              </div>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Describe your hotel — highlight unique features, ambiance, nearby attractions, and what makes it special for guests..."
                className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 resize-none"
              />

              <div className="mt-2 flex justify-end">
                <span className="text-xs text-slate-400">
                  {formData.description.length} characters
                </span>
              </div>
            </div>

            {/* Coordinates */}
            <div className="rounded-4xl border border-slate-200 bg-linear-to-br from-emerald-50 via-white to-green-50 p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-10 w-1 rounded-full bg-emerald-500" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Hotel Coordinates
                  </h3>
                  <p className="text-sm text-slate-500">
                    Detect the exact hotel location automatically
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr_auto]">
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  placeholder="Latitude"
                  onChange={handleChange}
                  className="h-14 rounded-2xl border border-slate-200 bg-white px-5 text-slate-700 outline-none transition-all duration-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                />

                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  placeholder="Longitude"
                  onChange={handleChange}
                  className="h-14 rounded-2xl border border-slate-200 bg-white px-5 text-slate-700 outline-none transition-all duration-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                />

                <motion.button
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleGetLocation}
                  className="h-14 rounded-2xl bg-linear-to-r from-sky-500 to-blue-600 px-6 font-semibold text-white shadow-[0_12px_30px_rgba(59,130,246,0.30)] transition-all duration-300 hover:shadow-[0_16px_40px_rgba(59,130,246,0.40)]"
                >
                  📍 Auto Detect
                </motion.button>
              </div>
            </div>

            {/* Images */}
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="h-10 w-1 rounded-full bg-pink-500" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Hotel Images
                  </h3>
                  <p className="text-sm text-slate-500">
                    Upload up to 5 attractive hotel images
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                {formData.images.map((img, i) => (
                  <motion.label
                    key={i}
                    whileHover={{ y: -5 }}
                    className="group relative flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-slate-300 bg-white transition-all duration-300 hover:border-orange-400 hover:shadow-xl"
                  >
                    {img ? (
                      <>
                        <img
                          src={URL.createObjectURL(img)}
                          alt=""
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 transition duration-300 group-hover:opacity-100" />
                      </>
                    ) : (
                      <div className="text-center">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-3xl text-orange-400 transition group-hover:bg-orange-100">
                          +
                        </div>
                        <p className="text-sm font-medium text-slate-500">
                          Upload Image
                        </p>
                      </div>
                    )}

                    <input
                      hidden
                      type="file"
                      onChange={(e) => handleImageChange(i, e.target.files[0])}
                    />
                  </motion.label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <motion.button
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full rounded-3xl bg-linear-to-r from-orange-500 via-amber-500 to-red-500 py-5 text-lg font-bold text-white shadow-[0_20px_50px_rgba(249,115,22,0.35)] transition-all duration-300 hover:shadow-[0_25px_60px_rgba(249,115,22,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating Hotel...
                  </span>
                ) : (
                  "Create Hotel"
                )}
              </motion.button>

              {createSuccess && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700"
                >
                  Hotel created successfully and is pending approval.
                </motion.p>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default AddHotelDetails;
