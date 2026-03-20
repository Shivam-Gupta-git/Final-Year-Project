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
    <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
  
      {/* HEADER */}
      <div className="mb-8 p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4">
        <div className="p-4 bg-linear-to-r from-indigo-500 to-blue-600 text-white rounded-xl text-xl shadow">
          🏨
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Create Room
          </h1>
          <p className="text-gray-500">
            Add new room details and assign to hotel
          </p>
        </div>
      </div>
  
      {/* FORM CARD */}
      <div className="bg-white dark:bg-gray-900 w-full max-w-5xl mx-auto rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white">
  
        <form onSubmit={handleSubmit} className="space-y-6">
  
          {/* HOTEL */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Select Hotel
            </label>
            <select
              name="hotelId"
              className="w-full border p-3 rounded-xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            >
              <option value="">Select Hotel</option>
              {hotels?.map((hotel) => (
                <option key={hotel._id} value={hotel._id}>
                  {hotel.name}
                </option>
              ))}
            </select>
          </div>
  
          {/* ROOM TYPE */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Room Type
            </label>
            <select
              name="roomType"
              className="w-full border p-3 rounded-xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            >
              <option value="">Select Room Type</option>
              <option value="standard">Standard</option>
              <option value="deluxe">Deluxe</option>
              <option value="suite">Suite</option>
              <option value="family">Family</option>
            </select>
          </div>
  
          {/* PRICE + CAPACITY + TOTAL */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="number"
              name="pricePerNight"
              placeholder="Price Per Night"
              className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
            <input
              type="number"
              name="capacity"
              placeholder="Capacity"
              className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
            <input
              type="number"
              name="totalRooms"
              placeholder="Total Rooms"
              className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
          </div>
  
          {/* AMENITIES */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Amenities
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {amenitiesList.map((a) => (
                <div
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  className={`cursor-pointer p-3 rounded-xl text-center transition ${
                    formData.amenities.includes(a)
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  {a}
                </div>
              ))}
            </div>
          </div>
  
          {/* DESCRIPTION */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Description
            </label>
            <textarea
              name="description"
              rows="4"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
          </div>
  
          {/* IMAGES */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Room Images
            </label>
            <input
              type="file"
              multiple
              className="w-full border p-3 rounded-xl"
              onChange={handleImageChange}
            />
  
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
              {formData.images.map((img, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(img)}
                  className="h-20 w-full object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
  
          {/* BUTTON */}
          <button
            disabled={loading}
            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl text-lg font-semibold hover:opacity-90 transition"
          >
            {loading ? "Creating..." : "Create Room"}
          </button>
  
        </form>
      </div>
    </div>
  );
}

export default CreateRoom;