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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Update Hotel</h1>
          <p className="text-gray-500">Modify hotel details and location</p>
        </div>
      </motion.div>

      {/* FORM CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 w-full max-w-5xl mx-auto rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white"
      >

        {/* OLD IMAGES */}
        {hotel && hotel.images?.length > 0 && (
          <div className="flex gap-4 mb-6 flex-wrap">
            {hotel.images.map((img, i) => (
              <img
                key={i}
                src={img}
                className="w-28 h-28 object-cover rounded-xl border shadow"
              />
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <input name="name" value={formData.name} onChange={handleChange} placeholder="Hotel Name" className="w-full border p-3 rounded-xl" />

          <input value={formData.cityName} readOnly className="w-full border p-3 rounded-xl bg-gray-100 dark:bg-gray-800" />

          <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="w-full border p-3 rounded-xl" />

          <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full border p-3 rounded-xl" placeholder="Description" />

          <input name="facilities" value={formData.facilities} onChange={handleChange} placeholder="wifi, parking, pool" className="w-full border p-3 rounded-xl" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="latitude" value={formData.latitude} onChange={handleChange} placeholder="Latitude" className="border p-3 rounded-xl" />
            <input name="longitude" value={formData.longitude} onChange={handleChange} placeholder="Longitude" className="border p-3 rounded-xl" />
          </div>

          <button type="button" onClick={handleLiveLocation} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl">
            Get Live Location
          </button>

          <input type="file" name="images" multiple onChange={handleChange} className="w-full border p-3 rounded-xl" />

          <div className="flex gap-3 flex-wrap">
            {Array.from(formData.images || []).map((img, i) => {
              const src = typeof img === "string" ? img : URL.createObjectURL(img);
              return <img key={i} src={src} className="w-24 h-24 object-cover rounded-xl shadow" />;
            })}
          </div>

          <button className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl text-lg font-semibold hover:opacity-90">
            Update Hotel
          </button>

        </form>
      </motion.div>
    </div>
  );
}

export default UpdateHotelDetails;