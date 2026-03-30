import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  getRestaurantById,
  updateRestaurant,
} from "../../../features/user/restaurantSlice";

function UpdateRestaurantDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { restaurant, loading } = useSelector((state) => state.restaurant);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    foodType: "",
    famousFood: "",
    avgCostForOne: "",
    bestTime: "",
    latitude: "",
    longitude: "",
    openingOpen: "",
    openingClose: "",
    images: [null, null, null, null, null],
  });

  /* -------- FETCH DATA -------- */
  useEffect(() => {
    if (id) dispatch(getRestaurantById(id));
  }, [dispatch, id]);

  /* -------- SET DATA -------- */
  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || "",
        address: restaurant.address || "",
        foodType: restaurant.foodType || "",
        famousFood: restaurant.famousFood || "",
        avgCostForOne: restaurant.avgCostForOne || "",
        bestTime: restaurant.bestTime || "",
        latitude: restaurant.location?.coordinates?.[1] || "",
        longitude: restaurant.location?.coordinates?.[0] || "",
        openingOpen: restaurant.openingHours?.open?.slice(0, 5) || "",
        openingClose: restaurant.openingHours?.close?.slice(0, 5) || "",
        images: [null, null, null, null, null],
      });
    }
  }, [restaurant]);

  /* -------- HANDLERS -------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGetLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setFormData((prev) => ({
        ...prev,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      }));
    });
  };

  const handleImageChange = (index, file) => {
    const updated = [...formData.images];
    updated[index] = file;
    setFormData((prev) => ({ ...prev, images: updated }));
  };

  /* -------- SUBMIT -------- */
  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();

    data.append("name", formData.name);
    data.append("address", formData.address);
    data.append("foodType", formData.foodType);
    data.append("famousFood", formData.famousFood);
    data.append("avgCostForOne", formData.avgCostForOne);
    data.append("bestTime", formData.bestTime);

    // opening hours
    const openingHours = {
      open: formData.openingOpen,
      close: formData.openingClose,
    };
    data.append("openingHours", JSON.stringify(openingHours));

    // location
    const location = {
      type: "Point",
      coordinates: [formData.longitude, formData.latitude],
    };
    data.append("location", JSON.stringify(location));

    // images
    formData.images.forEach((img) => {
      if (img) data.append("images", img);
    });

    dispatch(updateRestaurant({ id, data }));
    alert("Restaurant Updated Successfully");
    // navigate("/admin/adminDashboard");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-gray-200 p-6">
      {/* HEADER */}
      <div className="mb-8 p-6 rounded-2xl bg-white shadow-xl flex items-center gap-4">
        <div className="p-4 bg-orange-500 text-white rounded-xl text-xl">
          🍽️
        </div>
        <div>
          <h1 className="text-3xl font-bold">Update Restaurant</h1>
          <p className="text-gray-500">Edit restaurant details</p>
        </div>
      </div>

      {/* FORM */}
      <div className="bg-white max-w-5xl mx-auto rounded-2xl shadow-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* NAME */}
          <input
            type="text"
            name="name"
            value={formData.name}
            placeholder="Restaurant Name"
            className="w-full border p-3 rounded-xl"
            onChange={handleChange}
          />

          {/* ADDRESS */}
          <input
            type="text"
            name="address"
            value={formData.address}
            placeholder="Address"
            className="w-full border p-3 rounded-xl"
            onChange={handleChange}
          />

          {/* FOOD TYPE */}
          <input
            type="text"
            name="foodType"
            value={formData.foodType}
            placeholder="Food Type (Veg, Non-Veg)"
            className="w-full border p-3 rounded-xl"
            onChange={handleChange}
          />

          {/* FAMOUS FOOD */}
          <input
            type="text"
            name="famousFood"
            value={formData.famousFood}
            placeholder="Famous Food"
            className="w-full border p-3 rounded-xl"
            onChange={handleChange}
          />

          {/* COST */}
          <input
            type="number"
            name="avgCostForOne"
            value={formData.avgCostForOne}
            placeholder="Average Cost"
            className="w-full border p-3 rounded-xl"
            onChange={handleChange}
          />

          {/* BEST TIME */}
          <select
            name="bestTime"
            value={formData.bestTime}
            onChange={handleChange}
            className="w-full border p-3 rounded-xl bg-gray-50"
          >
            <option value="">Select Best Time</option>
            <option value="Morning">Morning</option>
            <option value="Lunch">Lunch</option>
            <option value="Evening">Evening</option>
            <option value="Dinner">Dinner</option>
            <option value="Night">Night</option>
          </select>

          {/* OPENING HOURS */}
          <div className="grid grid-cols-2 gap-3">
            {/* OPEN TIME */}
            <select
              name="openingOpen"
              value={formData.openingOpen}
              onChange={handleChange}
              className="border p-3 rounded-xl bg-gray-50"
            >
              <option value="">Open Time</option>
              <option value="06:00">06:00 AM</option>
              <option value="08:00">08:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="16:00">04:00 PM</option>
              <option value="18:00">06:00 PM</option>
            </select>

            {/* CLOSE TIME */}
            <select
              name="openingClose"
              value={formData.openingClose}
              onChange={handleChange}
              className="border p-3 rounded-xl bg-gray-50"
            >
              <option value="">Close Time</option>
              <option value="18:00">06:00 PM</option>
              <option value="20:00">08:00 PM</option>
              <option value="22:00">10:00 PM</option>
              <option value="23:00">11:00 PM</option>
              <option value="23:59">11:59 PM</option>
            </select>
          </div>

          {/* LOCATION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="Latitude"
              className="border p-3 rounded-xl"
            />
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="Longitude"
              className="border p-3 rounded-xl"
            />
            <button
              type="button"
              onClick={handleGetLocation}
              className="bg-blue-600 text-white rounded-xl"
            >
              Get Location
            </button>
          </div>

          {/* IMAGES */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {formData.images.map((img, i) => (
              <label
                key={i}
                className="border h-24 flex items-center justify-center rounded-xl cursor-pointer"
              >
                {img ? (
                  <img
                    src={URL.createObjectURL(img)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-xl">+</span>
                )}
                <input
                  hidden
                  type="file"
                  onChange={(e) => handleImageChange(i, e.target.files[0])}
                />
              </label>
            ))}
          </div>

          {/* BUTTON */}
          <button
            disabled={loading}
            className="w-full bg-orange-600 text-white py-3 rounded-xl text-lg font-semibold"
          >
            {loading ? "Updating..." : "Update Restaurant"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdateRestaurantDetails;
