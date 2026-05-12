import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getHotelById, updateHotel } from "../../../features/user/hotelSlice";
import { motion } from "framer-motion";
import { FaEdit } from "react-icons/fa";

function UpdateHotelDetails() {
  const { id: hotelId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { hotel, loading, error } = useSelector((state) => state.hotel);

  const [formData, setFormData] = useState({
    name: "",
    cityName: "",
    cityId: "",
    address: "",
    description: "",
    facilities: "",
    pricePerNight: "",
    latitude: "",
    longitude: "",
    images: [],
  });

  useEffect(() => {
    if (hotelId) dispatch(getHotelById(hotelId));
  }, [hotelId, dispatch]);

  useEffect(() => {
    if (hotel) {
      setFormData({
        name: hotel.name || "",
        cityName: hotel.city?.name || "",
        cityId: hotel.city?._id || "",
        address: hotel.address || "",
        description: hotel.description || "",
        facilities: hotel.facilities?.join(", ") || "",
        pricePerNight: hotel.pricePerNight || "",
        latitude: hotel.location?.coordinates?.[1] || "",
        longitude: hotel.location?.coordinates?.[0] || "",
        images: [],
      });
    }
  }, [hotel]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "images") {
      setFormData((prev) => ({ ...prev, images: files }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLiveLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((pos) => {
      setFormData((prev) => ({
        ...prev,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      }));
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("city", formData.cityId);
    data.append("address", formData.address);
    data.append("description", formData.description);
    data.append("pricePerNight", formData.pricePerNight);

    data.append(
      "location",
      JSON.stringify({
        type: "Point",
        coordinates: [formData.longitude, formData.latitude],
      })
    );

    data.append(
      "facilities",
      JSON.stringify(formData.facilities.split(",").map((f) => f.trim()))
    );

    for (let i = 0; i < formData.images.length; i++) {
      data.append("images", formData.images[i]);
    }

    dispatch(updateHotel({ hotelId, data }));
    alert("Hotel Updated Successfully");
    navigate("/admin/hotel-dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8fafc] px-4 py-6 text-slate-800 md:px-8 lg:px-10">
      {/* Ecommerce Style Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(96,165,250,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.14),transparent_30%)]" />

      <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-orange-300/30 blur-3xl animate-pulse" />
      <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-sky-300/30 blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl animate-pulse" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 overflow-hidden rounded-4xl border border-white/60 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="flex items-start gap-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.85, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.5 }}
                className="flex h-16 w-16 items-center justify-center rounded-3xl bg-linear-to-br from-orange-500 via-amber-500 to-yellow-500 text-3xl text-white shadow-[0_15px_35px_rgba(249,115,22,0.35)]"
              >
                <FaEdit />
              </motion.div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.45em] text-orange-500">
                  Hotel Management
                </p>

                <motion.h1
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-3xl font-black leading-tight text-slate-900 md:text-4xl"
                >
                  Update Hotel Details
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="mt-2 max-w-xl text-sm leading-7 text-slate-500 md:text-base"
                >
                  Edit hotel information, upload new images, and update the
                  location details with a premium dashboard experience.
                </motion.p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 self-start rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-emerald-700 shadow-sm"
            >
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-semibold">Ready to Update</span>
            </motion.div>
          </div>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="overflow-hidden rounded-4xl border border-white/70 bg-white/85 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl"
        >
          {/* Top Section */}
          <div className="border-b border-slate-200/70 bg-linear-to-r from-orange-50 via-white to-sky-50 px-6 py-6 md:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Hotel Information
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Update the details below and keep your listing fresh and
                  accurate.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600">
                All changes are saved after submission
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 p-6 md:p-8">
            {/* Old Images */}
            {hotel && hotel.images?.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Existing Images
                    </h3>
                    <p className="text-sm text-slate-500">
                      Current hotel gallery preview
                    </p>
                  </div>

                  <div className="rounded-xl bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600">
                    {hotel.images.length} Images
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {hotel.images.map((img, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -6, scale: 1.02 }}
                      transition={{ duration: 0.25 }}
                      className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md"
                    >
                      <img
                        src={img}
                        alt={`hotel-${i}`}
                        className="h-36 w-full object-cover transition duration-500 group-hover:scale-110"
                      />

                      <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Hotel Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter hotel name"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  City
                </label>
                <input
                  type="text"
                  value={formData.cityName}
                  readOnly
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-100 px-5 text-slate-600 outline-none"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter hotel address"
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Write a short description about the hotel..."
                rows="5"
                className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            {/* Facilities */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Facilities
              </label>
              <input
                type="text"
                name="facilities"
                value={formData.facilities}
                onChange={handleChange}
                placeholder="WiFi, Pool, Parking, Gym..."
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            {/* pricePerNight */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Average Price Per Night
              </label>

              <input
                type="number"
                name="pricePerNight"
                value={formData.pricePerNight}
                onChange={handleChange}
                placeholder="Enter room price"
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            {/* Location Section */}
            <div className="rounded-4xl border border-slate-200 bg-linear-to-br from-sky-50 via-white to-emerald-50 p-5 md:p-7">
              <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Hotel Location
                  </h3>
                  <p className="text-sm text-slate-500">
                    Update coordinates manually or use live location.
                  </p>
                </div>

                <div className="rounded-2xl bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-sky-600 shadow-sm">
                  GPS Enabled
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_auto]">
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="Latitude"
                  className="h-14 rounded-2xl border border-slate-200 bg-white px-5 text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />

                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="Longitude"
                  className="h-14 rounded-2xl border border-slate-200 bg-white px-5 text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />

                <motion.button
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleLiveLocation}
                  className="group flex h-14 items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-sky-500 via-blue-500 to-indigo-600 px-6 font-semibold text-white shadow-[0_15px_35px_rgba(59,130,246,0.35)] transition-all hover:shadow-[0_20px_45px_rgba(59,130,246,0.45)]"
                >
                  <span className="text-lg">📍</span>
                  Get Live Location
                </motion.button>
              </div>
            </div>

            {/* Image Upload */}
            <div className="rounded-4xl border border-slate-200 bg-slate-50/80 p-5 md:p-7">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  Upload New Images
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Add up to 5 images to make your hotel listing more attractive.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => {
                  const file = formData.images?.[i];
                  const src =
                    file && typeof file !== "string"
                      ? URL.createObjectURL(file)
                      : file;

                  return (
                    <motion.label
                      key={i}
                      whileHover={{ y: -5 }}
                      className="group relative flex h-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-slate-300 bg-white transition-all duration-300 hover:border-orange-400 hover:shadow-xl"
                    >
                      {src ? (
                        <>
                          <img
                            src={src}
                            alt="preview"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 transition group-hover:opacity-100" />
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-slate-400 transition duration-300 group-hover:text-orange-500">
                          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-3xl font-light">
                            +
                          </div>
                          <span className="text-sm font-semibold">
                            Upload Image
                          </span>
                        </div>
                      )}

                      <input
                        hidden
                        type="file"
                        multiple
                        onChange={handleChange}
                      />
                    </motion.label>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="relative w-full overflow-hidden rounded-3xl bg-linear-to-r from-orange-500 via-amber-500 to-red-500 px-6 py-5 text-lg font-bold text-white shadow-[0_20px_50px_rgba(249,115,22,0.35)] transition-all duration-300 hover:shadow-[0_25px_60px_rgba(249,115,22,0.45)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Updating Hotel...
                  </>
                ) : (
                  <>Save Hotel Changes</>
                )}
              </span>

              <div className="absolute inset-0 -translate-x-full bg-white/10 transition duration-700 hover:translate-x-full" />
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default UpdateHotelDetails;
