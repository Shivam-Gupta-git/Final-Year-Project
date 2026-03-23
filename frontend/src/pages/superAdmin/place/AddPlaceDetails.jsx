import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { MdAddLocation } from "react-icons/md";
import { createPlace } from "../../../features/user/placeSlice";
import { getActiveCities } from "../../../features/user/citySlice";
import { useNavigate } from "react-router-dom";

function AddPlaceDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const { cities } = useSelector((state) => state.city);

  const [formData, setFormData] = useState({
    name: "",
    cityId: "",
    description: "",
    category: "",
    timeRequired: "",
    entryfees: "",
    isPopular: "false",
    bestTimeToVisit: "",
    latitude: "",
    longitude: "",
    images: [],
  });

  useEffect(() => {
    dispatch(getActiveCities());
  }, [dispatch]);

  // 🔥 handle input
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // 🔥 handle images (CORRECT)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    setFormData((prev) => ({
      ...prev,
      images: files,
    }));
  };

  // 🔥 live location
  const handleLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported ❌");
      return;
    }

    navigator.geolocation.getCurrentPosition((pos) => {
      setFormData((prev) => ({
        ...prev,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      }));
    });
  };

  // 🔥 submit
  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();

    data.append("name", formData.name);
    data.append("cityId", formData.cityId);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("timeRequired", formData.timeRequired);
    data.append("entryfees", formData.entryfees);
    data.append("bestTimeToVisit", formData.bestTimeToVisit);

    // boolean
    data.append("isPopular", formData.isPopular === "true");

    // location
    data.append(
      "location",
      JSON.stringify({
        type: "Point",
        coordinates: [
          Number(formData.longitude),
          Number(formData.latitude),
        ],
      })
    );

    // images
    formData.images.forEach((img) => {
      data.append("images", img);
    });

    dispatch(createPlace(data));
    navigate("/superAdmin/place-dashboard")
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
      
      {/* HEADER */}
      <div className="mb-8 flex items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
        <div className="p-4 bg-blue-600 text-white rounded-xl text-2xl">
          <MdAddLocation />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Add New Place
          </h1>
          <p className="text-gray-500">Create travel destination</p>
        </div>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 max-w-5xl mx-auto p-8 rounded-2xl shadow space-y-6"
      >
        <input
          name="name"
          placeholder="Place Name"
          onChange={handleChange}
          className="w-full border p-3 rounded-xl"
        />

        {/* CITY DROPDOWN */}
        <select
          name="cityId"
          onChange={handleChange}
          className="w-full border p-3 rounded-xl"
        >
          <option value="">Select City</option>
          {cities?.map((city) => (
            <option key={city._id} value={city._id}>
              {city.name}
            </option>
          ))}
        </select>

        <input
          name="category"
          placeholder="Category (historical, temple...)"
          onChange={handleChange}
          className="w-full border p-3 rounded-xl"
        />

        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
          className="w-full border p-3 rounded-xl"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            name="timeRequired"
            placeholder="Time Required"
            onChange={handleChange}
            className="border p-3 rounded-xl"
          />
          <input
            name="entryfees"
            placeholder="Entry Fees"
            onChange={handleChange}
            className="border p-3 rounded-xl"
          />
        </div>

        <input
          name="bestTimeToVisit"
          placeholder="Best Time"
          onChange={handleChange}
          className="w-full border p-3 rounded-xl"
        />

        <select
          name="isPopular"
          onChange={handleChange}
          className="w-full border p-3 rounded-xl"
        >
          <option value="false">Normal</option>
          <option value="true">Popular</option>
        </select>

        {/* LOCATION */}
        <div className="grid grid-cols-2 gap-4">
          <input
            name="latitude"
            value={formData.latitude}
            placeholder="Latitude"
            onChange={handleChange}
            className="border p-3 rounded-xl"
          />
          <input
            name="longitude"
            value={formData.longitude}
            placeholder="Longitude"
            onChange={handleChange}
            className="border p-3 rounded-xl"
          />
        </div>

        <button
          type="button"
          onClick={handleLiveLocation}
          className="bg-green-500 text-white px-4 py-2 rounded-xl"
        >
          Get Location 📍
        </button>

        {/* IMAGES */}
        <input
          type="file"
          multiple
          onChange={handleImageChange}
          className="w-full border p-3 rounded-xl"
        />

        {/* PREVIEW */}
        <div className="flex gap-3 flex-wrap">
          {formData.images.map((img, i) => (
            <img
              key={i}
              src={URL.createObjectURL(img)}
              className="w-24 h-24 rounded-xl object-cover"
            />
          ))}
        </div>

        <button className="w-full bg-blue-600 text-white py-3 rounded-xl">
          Add Place 🚀
        </button>
      </form>
    </div>
  );
}

export default AddPlaceDetails;