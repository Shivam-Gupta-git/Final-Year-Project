import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getSingleRoom, updateRoom } from "../../../features/user/roomSlice";
import { motion } from "framer-motion";
import { FaEdit } from "react-icons/fa";

function UpdateRoom() {
  const dispatch = useDispatch();
  const { roomId } = useParams();

  const { room, loading } = useSelector((state) => state.room);

  const amenitiesList = [
    "AC",
    "WiFi",
    "TV",
    "Mini Bar",
    "Balcony",
    "Room Service",
    "Bathtub",
  ];

  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (roomId) dispatch(getSingleRoom(roomId));
  }, [roomId]);

  useEffect(() => {
    if (room) {
      setFormData({
        roomType: room.roomType || "",
        pricePerNight: room.pricePerNight || "",
        capacity: room.capacity || "",
        totalRooms: room.totalRooms || "",
        amenities: room.amenities || [],
        description: room.description || "",
        images: [],
      });
    }
  }, [room]);

  if (loading || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading room data...
      </div>
    );
  }

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

    dispatch(updateRoom({ roomId, formData: data }));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4"
      >
        <div className="p-4 bg-linear-to-r from-indigo-500 to-blue-600 text-white rounded-xl text-xl shadow">
          <FaEdit />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Update Room</h1>
          <p className="text-gray-500">Modify room details and manage amenities</p>
        </div>
      </motion.div>

      {/* FORM CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 w-full max-w-5xl mx-auto rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700"
      >

        {/* OLD IMAGES */}
        {room.images?.length > 0 && (
          <div className="flex gap-4 mb-6 flex-wrap">
            {room.images.map((img, i) => (
              <img
                key={i}
                src={img}
                className="w-28 h-28 object-cover rounded-xl border shadow"
              />
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <select
            name="roomType"
            value={formData.roomType}
            onChange={handleChange}
            className="w-full border p-3 rounded-xl bg-gray-50 dark:bg-gray-800"
          >
            <option value="">Select Room Type</option>
            <option value="standard">Standard</option>
            <option value="deluxe">Deluxe</option>
            <option value="suite">Suite</option>
            <option value="family">Family</option>
          </select>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="number" name="pricePerNight" value={formData.pricePerNight} onChange={handleChange} placeholder="Price Per Night" className="border p-3 rounded-xl" />
            <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} placeholder="Capacity" className="border p-3 rounded-xl" />
            <input type="number" name="totalRooms" value={formData.totalRooms} onChange={handleChange} placeholder="Total Rooms" className="border p-3 rounded-xl" />
          </div>

          {/* Amenities */}
          <div>
            <p className="font-semibold mb-3 text-gray-800 dark:text-white">Amenities</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full border p-3 rounded-xl"
            placeholder="Room Description"
          />

          <input type="file" multiple onChange={handleImageChange} className="w-full border p-3 rounded-xl" />

          <button className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl text-lg font-semibold hover:opacity-90 transition">
            Update Room
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default UpdateRoom;