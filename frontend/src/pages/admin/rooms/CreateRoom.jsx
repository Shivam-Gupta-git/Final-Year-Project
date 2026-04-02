import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getHotelsStatus } from "../../../features/user/hotelSlice";
import { createRoom } from "../../../features/user/roomSlice";

function CreateRoom() {
  const dispatch = useDispatch();
  const { hotels } = useSelector((state) => state.hotel);
  const { loading } = useSelector((state) => state.room);

  const amenitiesList = [
    "AC",
    "WiFi",
    "TV",
    "Mini Bar",
    "Balcony",
    "Room Service",
    "Bathtub",
  ];

  const [formData, setFormData] = useState({
    hotelId: "",
    roomType: "",
    pricePerNight: "",
    capacity: "",
    totalRooms: "",
    amenities: [],
    description: "",
    images: [],
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

  const handleImageChange = (e) => {
    setFormData({ ...formData, images: Array.from(e.target.files) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "images") {
        formData.images.forEach((img) => data.append("images", img));
      } else if (key === "amenities") {
        data.append("amenities", formData.amenities.join(","));
      } else {
        data.append(key, formData[key]);
      }
    });

    dispatch(createRoom(data));
  };

  return (
<div className="min-h-screen bg-black px-4 md:px-6 py-6 text-white">

{/* Header */}
<div className="relative mb-8 overflow-hidden rounded-4xl border border-white/10 bg-linear-to-br from-zinc-950 via-zinc-900 to-black p-6 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
  <div className="absolute -top-10 right-0 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />
  <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-red-500/20 blur-3xl" />

  <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
    <div className="flex items-center gap-5">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-linear-to-br from-orange-500 to-red-600 text-3xl shadow-[0_10px_30px_rgba(249,115,22,0.45)]">
        🏨
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.35em] text-zinc-500">
          Room Management
        </p>

        <h1 className="text-3xl md:text-5xl font-black bg-linear-to-r from-white via-orange-100 to-orange-400 bg-clip-text text-transparent">
          Create Room
        </h1>

        <p className="mt-2 text-sm md:text-base text-zinc-400">
          Add room details, pricing, capacity, images, and assign to a hotel
        </p>
      </div>
    </div>

    <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 px-5 py-3 text-sm text-orange-300 backdrop-blur-xl">
      Fill all required details carefully
    </div>
  </div>
</div>

{/* Form Card */}
<div className="mx-auto max-w-4xl rounded-4xl border border-white/10 bg-zinc-950/90 p-6 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
  <form onSubmit={handleSubmit} className="space-y-8">

    {/* Hotel & Room Type */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-400">Select Hotel</label>
        <select
          name="hotelId"
          value={formData.hotelId}
          onChange={handleChange}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
        >
          <option value="">Select Hotel</option>
          {hotels?.map(hotel => (
            <option key={hotel._id} value={hotel._id}>{hotel.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-400">Room Type</label>
        <select
          name="roomType"
          value={formData.roomType}
          onChange={handleChange}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
        >
          <option value="">Select Room Type</option>
          <option value="standard">Standard</option>
          <option value="deluxe">Deluxe</option>
          <option value="suite">Suite</option>
          <option value="family">Family</option>
        </select>
      </div>
    </div>

    {/* Price, Capacity & Total Rooms */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <input
        type="number"
        name="pricePerNight"
        value={formData.pricePerNight}
        onChange={handleChange}
        placeholder="Price per night"
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
      />
      <input
        type="number"
        name="capacity"
        value={formData.capacity}
        onChange={handleChange}
        placeholder="Capacity"
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
      />
      <input
        type="number"
        name="totalRooms"
        value={formData.totalRooms}
        onChange={handleChange}
        placeholder="Total Rooms"
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
      />
    </div>

    {/* Amenities */}
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-400">Amenities</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {amenitiesList.map(a => (
          <div
            key={a}
            onClick={() => toggleAmenity(a)}
            className={`cursor-pointer p-3 rounded-xl text-center transition ${
              formData.amenities.includes(a)
                ? "bg-orange-500 text-white shadow-[0_10px_30px_rgba(249,115,22,0.4)]"
                : "bg-white/5 hover:bg-white/10"
            }`}
          >
            {a}
          </div>
        ))}
      </div>
    </div>

    {/* Description */}
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-400">Description</label>
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        rows="4"
        placeholder="Room description"
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
      />
    </div>

    {/* Images */}
    <div>
      <h2 className="mb-4 text-xl font-bold text-white">Room Images</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {formData.images.map((img, i) => (
          <label
            key={i}
            className="group relative flex h-28 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border border-dashed border-white/15 bg-white/5 transition-all duration-300 hover:border-orange-500/40 hover:bg-white/10"
          >
            {img ? (
              <img
                src={URL.createObjectURL(img)}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl text-zinc-500 group-hover:text-orange-400">
                  +
                </div>
                <p className="text-xs text-zinc-500">Upload</p>
              </div>
            )}
            <input hidden type="file" onChange={(e) => handleImageChange(i, e.target.files[0])} />
          </label>
        ))}
      </div>
    </div>

    {/* Submit Button */}
    <div>
      <button
        disabled={loading}
        className="w-full rounded-3xl bg-linear-to-r from-orange-500 to-red-600 py-4 text-lg font-bold text-white shadow-[0_12px_40px_rgba(249,115,22,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(249,115,22,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creating Room..." : "Create Room"}
      </button>
    </div>

  </form>
</div>
</div>
  );
}

export default CreateRoom;