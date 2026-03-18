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
    <div className="min-h-screen bg-gray-100 flex justify-center p-8">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl p-8">

        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Create Room
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* HOTEL */}
          <div>
            <label className="block mb-1 font-medium">Hotel</label>
            <select
              name="hotelId"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
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
            <label className="block mb-1 font-medium">Room Type</label>
            <select
              name="roomType"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
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
          <div className="grid grid-cols-3 gap-4">
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
            <p className="font-medium mb-2">Amenities</p>
            <div className="grid grid-cols-4 gap-3">
              {amenitiesList.map((a) => (
                <div
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  className={`cursor-pointer border rounded-xl p-3 text-center transition ${
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
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              name="description"
              rows="4"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
          </div>

          {/* IMAGES */}
          <div>
            <label className="block mb-1 font-medium">Room Images</label>
            <input
              type="file"
              multiple
              className="w-full border p-3 rounded-xl"
              onChange={handleImageChange}
            />

            <div className="grid grid-cols-5 gap-3 mt-3">
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
            className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 transition"
          >
            {loading ? "Creating..." : "Create Room"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default CreateRoom;