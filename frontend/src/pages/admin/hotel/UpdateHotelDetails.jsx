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
<div className="min-h-screen bg-black relative overflow-hidden px-4 py-8 md:px-8 text-white">
  {/* Background Effects */}
  <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
  <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

  <div className="relative z-10 max-w-6xl mx-auto">
    {/* HEADER */}
    <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div className="flex items-center gap-5">
        <div className="h-16 w-16 rounded-2xl bg-linear-to-br from-orange-500 to-amber-500 flex items-center justify-center text-3xl shadow-lg shadow-orange-500/30">
          <FaEdit />
        </div>
        <div>
          <p className="text-orange-400 text-sm font-semibold uppercase tracking-[0.3em] mb-1">
            Hotel Panel
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Update Hotel
          </h1>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            Modify hotel details and location
          </p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 text-emerald-300">
        <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
        Ready to update
      </div>
    </div>

    {/* FORM CARD */}
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.55)] overflow-hidden">
      <div className="border-b border-white/10 px-6 md:px-8 py-5 bg-white/5">
        <h2 className="text-xl font-semibold text-white">Hotel Information</h2>
        <p className="text-sm text-gray-400 mt-1">
          Fill in all the required hotel details below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
        {/* OLD IMAGES */}
        {hotel && hotel.images?.length > 0 && (
          <div className="flex gap-4 mb-6 flex-wrap">
            {hotel.images.map((img, i) => (
              <img
                key={i}
                src={img}
                className="w-28 h-28 object-cover rounded-2xl border border-white/10 shadow-lg"
              />
            ))}
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Hotel Name"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-gray-500 outline-none focus:border-orange-500 focus:bg-white/10 focus:ring-4 focus:ring-orange-500/20 transition-all"
          />
          <input
            type="text"
            value={formData.cityName}
            readOnly
            className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-gray-300 outline-none"
          />
        </div>

        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Address"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-gray-500 outline-none focus:border-orange-500 focus:bg-white/10 focus:ring-4 focus:ring-orange-500/20 transition-all"
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          rows="4"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-gray-500 outline-none focus:border-orange-500 focus:bg-white/10 focus:ring-4 focus:ring-orange-500/20 transition-all"
        />

        <input
          type="text"
          name="facilities"
          value={formData.facilities}
          onChange={handleChange}
          placeholder="wifi, parking, pool"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-gray-500 outline-none focus:border-orange-500 focus:bg-white/10 focus:ring-4 focus:ring-orange-500/20 transition-all"
        />

        {/* Location */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h3 className="text-lg font-semibold text-white mb-5">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="Latitude"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-gray-500 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all"
            />
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="Longitude"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white placeholder:text-gray-500 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all"
            />
            <button
              type="button"
              onClick={handleLiveLocation}
              className="group relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-4 font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-blue-500/40"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                📍 Get Live Location
              </span>
              <div className="absolute inset-0 translate-y-full bg-white/10 transition-transform duration-300 group-hover:translate-y-0" />
            </button>
          </div>
        </div>

        {/* Image Upload */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Hotel Images</h3>
          <p className="text-sm text-gray-400 mb-5">
            Upload up to 5 hotel images.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from(formData.images || []).map((img, i) => {
              const src = typeof img === "string" ? img : URL.createObjectURL(img);
              return (
                <label
                  key={i}
                  className="group relative h-36 cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed border-white/10 bg-white/5 transition-all duration-300 hover:border-orange-500/60 hover:bg-white/10"
                >
                  {img ? (
                    <img
                      src={src}
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
                  <input hidden type="file" multiple onChange={handleChange} />
                </label>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full overflow-hidden rounded-2xl bg-linear-to-r from-orange-500 via-orange-600 to-red-500 px-6 py-4 text-lg font-bold text-white shadow-[0_15px_40px_rgba(249,115,22,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(249,115,22,0.55)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="relative z-10">{loading ? "Updating Hotel..." : "Update Hotel"}</span>
          <div className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-0" />
        </button>
      </form>
    </div>
  </div>
</div>
  );
}

export default UpdateHotelDetails;