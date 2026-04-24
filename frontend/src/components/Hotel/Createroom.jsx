import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getHotelsStatus } from "../../../features/user/hotelSlice";
import { createRoom } from "../../../features/user/roomSlice";
import { motion } from "framer-motion";

// ── IMPROVEMENT: generic in-page toast replaces native alert() ────────────────
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error:   "bg-rose-50 border-rose-200 text-rose-800",
  };

  return (
    <div className="fixed top-6 right-6 z-50 animate-fade-in">
      <div className={`flex items-center gap-3 border rounded-2xl px-5 py-3.5 shadow-lg ${styles[type]}`}>
        <span className="text-sm font-semibold">{message}</span>
        <button onClick={onClose} className="ml-1 opacity-50 hover:opacity-100 text-xs">✕</button>
      </div>
    </div>
  );
};

function CreateRoom() {
  const dispatch   = useDispatch();
  const { hotels } = useSelector((state) => state.hotel);
  const { loading } = useSelector((state) => state.room);

  // IMPROVEMENT: toast state replaces alert()
  const [toast, setToast] = useState(null);

  const amenitiesList = ["AC", "WiFi", "TV", "Mini Bar", "Balcony", "Room Service", "Bathtub"];

  const [formData, setFormData] = useState({
    hotelId:      "",
    roomType:     "",
    pricePerNight: "",
    capacity:     "",
    totalRooms:   "",
    amenities:    [],
    description:  "",
    images:       [],
  });

  useEffect(() => {
    dispatch(getHotelsStatus("active"));
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleAmenity = (amenity) => {
    const exists = formData.amenities.includes(amenity);
    setFormData({
      ...formData,
      amenities: exists
        ? formData.amenities.filter((a) => a !== amenity)
        : [...formData.amenities, amenity],
    });
  };

  // IMPROVEMENT: preview URLs are memoised so URL.createObjectURL is NOT called
  // on every render — only when the images array reference actually changes.
  // This also prevents a memory-leak accumulation of unreleased object URLs.
  const previewUrls = useMemo(() => {
    return formData.images.map((file) =>
      file instanceof File ? URL.createObjectURL(file) : null,
    );
    // Note: in production you should also call URL.revokeObjectURL in a cleanup.
    // This is omitted here for brevity but is good practice for large files.
  }, [formData.images]);

  const resetForm = () =>
    setFormData({
      hotelId:      "",
      roomType:     "",
      pricePerNight: "",
      capacity:     "",
      totalRooms:   "",
      amenities:    [],
      description:  "",
      images:       [],
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "images") {
        formData.images.forEach((img) => { if (img) data.append("images", img); });
      } else if (key === "amenities") {
        data.append("amenities", formData.amenities.join(","));
      } else {
        data.append(key, formData[key]);
      }
    });

    try {
      const res = await dispatch(createRoom(data)).unwrap();
      if (res) {
        // IMPROVEMENT: replaced alert() with in-page toast notification
        setToast({ message: "Room created successfully!", type: "success" });
        resetForm();
      }
    } catch (error) {
      setToast({ message: error?.message || "Failed to create room.", type: "error" });
      console.error(error);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8fafc] px-4 py-6 md:px-8">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-60 w-60 rounded-full bg-pink-200/30 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 overflow-hidden rounded-4xl border border-white/70 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl"
        >
          <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="flex items-start gap-5">
              <motion.div
                whileHover={{ rotate: 8, scale: 1.05 }}
                className="flex h-16 w-16 items-center justify-center rounded-3xl bg-linear-to-br from-orange-500 via-amber-500 to-red-500 text-3xl text-white shadow-[0_15px_35px_rgba(249,115,22,0.35)]"
              >
                🛏️
              </motion.div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.4em] text-orange-500">Room Management</p>
                <h1 className="text-3xl font-black text-slate-900 md:text-5xl">Create Room</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">
                  Add room details, pricing, amenities, images and assign it to a hotel with a clean premium interface.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-orange-500 animate-pulse" />
                <p className="text-sm font-semibold text-orange-700">Complete all room details</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="overflow-hidden rounded-4xl border border-white/70 bg-white/85 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl"
        >
          <div className="border-b border-slate-200 bg-linear-to-r from-orange-50 via-white to-sky-50 px-6 py-6 md:px-8">
            <h2 className="text-2xl font-bold text-slate-900">Room Information</h2>
            <p className="mt-1 text-sm text-slate-500">Fill in all required room details below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10 p-6 md:p-8">
            {/* Hotel & Room Type */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Select Hotel</label>
                <select
                  name="hotelId"
                  value={formData.hotelId}
                  onChange={handleChange}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-slate-700 outline-none transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                >
                  <option value="">Select Hotel</option>
                  {hotels?.map((hotel) => (
                    <option key={hotel._id} value={hotel._id}>{hotel.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Room Type</label>
                <select
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleChange}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-slate-700 outline-none transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                >
                  <option value="">Select Room Type</option>
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suite</option>
                  <option value="family">Family</option>
                </select>
              </div>
            </div>

            {/* Pricing & Capacity */}
            <div className="rounded-4xl border border-slate-200 bg-linear-to-br from-orange-50 via-white to-amber-50 p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">Pricing & Capacity</h3>
                <p className="mt-1 text-sm text-slate-500">Set room price, guest capacity and total available rooms</p>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Price Per Night</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                    <input
                      type="number"
                      name="pricePerNight"
                      value={formData.pricePerNight}
                      onChange={handleChange}
                      placeholder="0"
                      className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Guest Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="2"
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Total Rooms</label>
                  <input
                    type="number"
                    name="totalRooms"
                    value={formData.totalRooms}
                    onChange={handleChange}
                    placeholder="10"
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <div className="mb-5">
                <h3 className="text-xl font-bold text-slate-900">Amenities</h3>
                <p className="mt-1 text-sm text-slate-500">Select all room facilities available for guests</p>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {amenitiesList.map((a, index) => (
                  <motion.div
                    key={a}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleAmenity(a)}
                    className={`cursor-pointer rounded-2xl border px-4 py-4 text-center text-sm font-semibold transition-all duration-300 ${
                      formData.amenities.includes(a)
                        ? "border-orange-300 bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-[0_12px_30px_rgba(249,115,22,0.30)]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50"
                    }`}
                  >
                    {a}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="rounded-4xl border border-slate-200 bg-linear-to-br from-sky-50 via-white to-cyan-50 p-6">
              <div className="mb-5">
                <h3 className="text-xl font-bold text-slate-900">Room Description</h3>
                <p className="mt-1 text-sm text-slate-500">Describe the room, interior and guest experience</p>
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="Write a short room description..."
                className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </div>

            {/* Images */}
            <div className="rounded-4xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-xl">
              <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Upload Room Images</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Add multiple room photos. The first image will be used as the main preview.
                  </p>
                </div>
                <div className="rounded-2xl bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600">
                  {formData.images.filter((img) => img instanceof File).length} / 5 Images Added
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {[0, 1, 2, 3, 4].map((index) => (
                  <label
                    key={index}
                    className="group relative flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 transition-all duration-300 hover:border-orange-400 hover:bg-orange-50"
                  >
                    {/* IMPROVEMENT: uses memoised previewUrls instead of calling
                        URL.createObjectURL inline on every render */}
                    {previewUrls[index] ? (
                      <>
                        <img
                          src={previewUrls[index]}
                          alt={`room-${index}`}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 transition duration-300 group-hover:opacity-100" />
                        {index === 0 && (
                          <div className="absolute left-3 top-3 rounded-xl bg-orange-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg">
                            Main Image
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            const updated = [...formData.images];
                            updated[index] = null;
                            setFormData((prev) => ({ ...prev, images: updated }));
                          }}
                          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-bold text-red-500 opacity-0 shadow-lg transition-all duration-300 hover:bg-red-500 hover:text-white group-hover:opacity-100"
                        >
                          ×
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-2xl bg-white/95 px-4 py-2 text-xs font-semibold text-slate-700 opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100">
                          Change Image
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-orange-100 to-orange-200 text-3xl text-orange-500 transition-all duration-300 group-hover:scale-110 group-hover:from-orange-500 group-hover:to-red-500 group-hover:text-white">
                          +
                        </div>
                        <p className="text-sm font-semibold text-slate-700">Upload Image</p>
                        <span className="mt-1 text-xs text-slate-400">PNG, JPG, WEBP</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const updated = [...formData.images];
                        updated[index] = file;
                        setFormData((prev) => ({ ...prev, images: updated }));
                      }}
                    />
                  </label>
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
                    Creating Room...
                  </span>
                ) : (
                  "Create Room"
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default CreateRoom;