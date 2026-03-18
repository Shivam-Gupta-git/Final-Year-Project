import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getSingleRoom, updateRoom } from "../../../features/user/roomSlice";

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

  // Fetch room data
  useEffect(() => {
    if (roomId) dispatch(getSingleRoom(roomId));
  }, [roomId]);

  // Prefill form with existing data
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
    <div className="min-h-screen bg-gray-100 flex justify-center p-8">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Update Room</h1>

        {/* OLD IMAGES */}
        {room.images?.length > 0 && (
          <div className="flex gap-4 mb-6">
            {room.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`room-${i}`}
                className="w-28 h-28 object-cover rounded-xl border"
              />
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ROOM TYPE */}
          <select
            name="roomType"
            value={formData.roomType}
            onChange={handleChange}
            className="w-full border p-3 rounded-xl"
          >
            <option value="">Select Room Type</option>
            <option value="standard">Standard</option>
            <option value="deluxe">Deluxe</option>
            <option value="suite">Suite</option>
            <option value="family">Family</option>
          </select>

          {/* PRICE + CAPACITY + TOTAL ROOMS */}
          <div className="grid grid-cols-3 gap-4">
            <input
              type="number"
              name="pricePerNight"
              value={formData.pricePerNight}
              onChange={handleChange}
              placeholder="Price Per Night"
              className="border p-3 rounded-xl"
            />
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="Capacity"
              className="border p-3 rounded-xl"
            />
            <input
              type="number"
              name="totalRooms"
              value={formData.totalRooms}
              onChange={handleChange}
              placeholder="Total Rooms"
              className="border p-3 rounded-xl"
            />
          </div>

          {/* AMENITIES */}
          <div>
            <p className="font-semibold mb-2">Amenities</p>
            <div className="grid grid-cols-3 gap-3">
              {amenitiesList.map((a) => (
                <div
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  className={`cursor-pointer border p-3 rounded-xl text-center ${
                    formData.amenities.includes(a)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {a}
                </div>
              ))}
            </div>
          </div>

          {/* DESCRIPTION */}
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full border p-3 rounded-xl"
            placeholder="Room Description"
          />

          {/* NEW IMAGES */}
          <input
            type="file"
            multiple
            onChange={handleImageChange}
            className="w-full border p-3 rounded-xl"
          />

          <button className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 transition">
            Update Room
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdateRoom;