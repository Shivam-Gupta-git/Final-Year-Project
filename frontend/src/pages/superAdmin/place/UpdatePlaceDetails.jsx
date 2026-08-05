import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useNavigate, useParams } from "react-router-dom";
import {
  getActivePlacesCityWise,
  updatePlace,
} from "../../../features/user/placeSlice";

function UpdatePlaceDetails() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();

  const { cityWisePlaces = [], loading } = useSelector((state) => state.place);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    timeRequired: "",
    entryfees: "",
    bestTimeToVisit: "",
    isPopular: "false",
    latitude: "",
    longitude: "",
    images: [],
    oldImages: [],
  });

  /* 🔥 Fetch Data */
  useEffect(() => {
    dispatch(getActivePlacesCityWise());
  }, [dispatch]);

  const loadedPlaceIdRef = useRef(null);

  /* 🔥 Find Place */
  useEffect(() => {
    if (cityWisePlaces.length > 0 && loadedPlaceIdRef.current !== id) {
      let found;

      for (let city of cityWisePlaces) {
        found = city.places.find((p) => p._id.toString() === id);
        if (found) break;
      }

      if (found) {
        loadedPlaceIdRef.current = id;
        setFormData({
          name: found.name || "",
          description: found.description || "",
          category: found.category || "",
          timeRequired: found.timeRequired || "",
          entryfees: found.entryfees || "",
          bestTimeToVisit: found.bestTimeToVisit || "",
          isPopular: found.isPopular ? "true" : "false",
          latitude: found.location?.coordinates?.[1] || "",
          longitude: found.location?.coordinates?.[0] || "",
          images: [],
          oldImages: found.images || [],
        });
      }
    }
  }, [cityWisePlaces, id]);

  /* 🔥 Handle Change */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* 🔥 Image Upload */
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    setFormData((prev) => ({
      ...prev,
      images: files,
    }));
  };

  /* 🔥 Live Location */
  const handleLiveLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setFormData((prev) => ({
        ...prev,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      }));
    });
  };

  /* 🔥 Submit */
  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();

    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("timeRequired", formData.timeRequired);
    data.append("entryfees", formData.entryfees);
    data.append("bestTimeToVisit", formData.bestTimeToVisit);
    data.append("isPopular", formData.isPopular === "true");

    data.append(
      "location",
      JSON.stringify({
        type: "Point",
        coordinates: [Number(formData.longitude), Number(formData.latitude)],
      })
    );

    // new images
    formData.images.forEach((img) => {
      data.append("images", img);
    });

    // old images
    data.append("oldImages", JSON.stringify(formData.oldImages));

    dispatch(updatePlace({ id, data }));

    navigate(-1);
  };

  return (
<div className="min-h-screen p-6 bg-linear-to-br from-gray-50 via-gray-100 to-gray-50 text-gray-900">

<h1 className="text-3xl font-bold mb-6 text-gray-900">
  Update Place ✏️
</h1>

<form
  onSubmit={handleSubmit}
  className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-lg space-y-5 transition-all duration-300"
>
  {/* NAME */}
  <input
    name="name"
    value={formData.name}
    onChange={handleChange}
    placeholder="Place Name"
    className="w-full border border-gray-300 p-3 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition"
  />

  {/* CATEGORY */}
  <input
    name="category"
    value={formData.category}
    onChange={handleChange}
    placeholder="Category"
    className="w-full border border-gray-300 p-3 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition"
  />

  {/* DESCRIPTION */}
  <textarea
    name="description"
    value={formData.description}
    onChange={handleChange}
    placeholder="Description"
    className="w-full border border-gray-300 p-3 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition"
  />

  {/* TIME + FEES */}
  <div className="grid grid-cols-2 gap-4">
    <input
      name="timeRequired"
      value={formData.timeRequired}
      onChange={handleChange}
      placeholder="Time Required"
      className="border border-gray-300 p-3 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition"
    />
    <input
      name="entryfees"
      value={formData.entryfees}
      onChange={handleChange}
      placeholder="Entry Fees"
      className="border border-gray-300 p-3 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition"
    />
  </div>

  {/* BEST TIME */}
  <input
    name="bestTimeToVisit"
    value={formData.bestTimeToVisit}
    onChange={handleChange}
    placeholder="Best Time"
    className="w-full border border-gray-300 p-3 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition"
  />

  {/* POPULAR */}
  <select
    name="isPopular"
    value={formData.isPopular}
    onChange={handleChange}
    className="w-full border border-gray-300 p-3 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition"
  >
    <option value="false">Normal</option>
    <option value="true">Popular</option>
  </select>

  {/* LOCATION */}
  <div className="grid grid-cols-2 gap-4">
    <input
      name="latitude"
      value={formData.latitude}
      onChange={handleChange}
      placeholder="Latitude"
      className="border border-gray-300 p-3 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition"
    />
    <input
      name="longitude"
      value={formData.longitude}
      onChange={handleChange}
      placeholder="Longitude"
      className="border border-gray-300 p-3 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition"
    />
  </div>

  <button
    type="button"
    onClick={handleLiveLocation}
    className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition"
  >
    Get Live Location 📍
  </button>

  {/* OLD IMAGES */}
  <div className="flex gap-3 flex-wrap">
    {formData.oldImages.map((img, i) => (
      <img
        key={i}
        src={img}
        className="w-24 h-24 object-cover rounded-xl border border-gray-200 shadow-sm transition hover:scale-105"
      />
    ))}
  </div>

  {/* NEW IMAGES */}
  <input
    type="file"
    multiple
    onChange={handleImageChange}
    className="w-full border border-gray-300 p-3 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition"
  />

  {/* SUBMIT */}
  <button className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition">
    Update Place 🚀
  </button>
</form>
</div>
  );
}

export default UpdatePlaceDetails;
