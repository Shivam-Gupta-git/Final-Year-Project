import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createRestaurant } from "../../../features/user/restaurantSlice";
import { getActiveCities } from "../../../features/user/citySlice";
import { useNavigate } from "react-router-dom";

function AddRestaurantDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, createSuccess } = useSelector((state) => state.restaurant);
  const { cities } = useSelector((state) => state.city);

  const [formData, setFormData] = useState({
    name: "",
    state: "",
    city: "",
    address: "",
    famousFood: "",
    foodType: "veg",
    avgCostForOne: "",
    bestTime: "anytime",
    latitude: "",
    longitude: "",
    isRecommended: false,
    openingHours: {
      open: "",
      close: "",
    },
    images: [null, null, null, null, null],
  });

  useEffect(() => {
    dispatch(getActiveCities());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 📍 GET LOCATION (same as hotel)
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();

    data.append("name", formData.name);
    data.append("stateId", formData.state);
    data.append("cityId", formData.city);
    data.append("address", formData.address);
    data.append("famousFood", formData.famousFood);
    data.append("foodType", formData.foodType);
    data.append("avgCostForOne", formData.avgCostForOne);
    data.append("bestTime", formData.bestTime);
    data.append("isRecommended", formData.isRecommended);
    data.append(
      "openingHours",
      JSON.stringify(formData.openingHours)
    );

    const location = {
      type: "Point",
      coordinates: [formData.longitude, formData.latitude],
    };

    data.append("location", JSON.stringify(location));

    formData.images.forEach((img) => {
      if (img) data.append("images", img);
    });
    dispatch(createRestaurant(data));
  };

  useEffect(() => {
    if (loading) {
      alert("Restaurant Created Successfully");
      navigate("/admin/restaurantDashboard");
    }
  }, [loading, navigate]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      {/* HEADER */}
      <div className="mb-8 p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl border flex items-center gap-4">
        <div className="p-4 bg-linear-to-r from-orange-500 to-red-500 text-white rounded-xl text-xl shadow">
          🍽️
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Create Restaurant
          </h1>
          <p className="text-gray-500">Add restaurant details and location</p>
        </div>
      </div>

      {/* FORM */}
      <div className="bg-white dark:bg-gray-900 w-full max-w-5xl mx-auto rounded-2xl shadow-2xl p-8 border text-gray-800 dark:text-white">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* NAME */}
          <input
            type="text"
            name="name"
            placeholder="Restaurant Name"
            className="w-full border p-3 rounded-xl"
            onChange={handleChange}
          />

          {/* STATE */}
          <select
            name="state"
            className="w-full border p-3 rounded-xl"
            onChange={handleChange}
          >
            <option value="">Select State</option>
            {cities.map((city) => (
              <option key={city._id} value={city._id}>
                {city.state}
              </option>
            ))}
          </select>

          {/* CITY */}
          <select
            name="city"
            className="w-full border p-3 rounded-xl"
            onChange={handleChange}
          >
            <option value="">Select City</option>
            {cities.map((city) => (
              <option key={city._id} value={city._id}>
                {city.name}
              </option>
            ))}
          </select>

          {/* ADDRESS */}
          <input
            type="text"
            name="address"
            placeholder="Address"
            className="w-full border p-3 rounded-xl"
            onChange={handleChange}
          />

          {/* FOOD */}
          <input
            type="text"
            name="famousFood"
            placeholder="Famous Food"
            className="w-full border p-3 rounded-xl"
            onChange={handleChange}
          />

          {/* FOOD TYPE */}
          <select
            name="foodType"
            className="w-full border p-3 rounded-xl"
            onChange={handleChange}
          >
            <option value="veg">Veg</option>
            <option value="non-veg">Non Veg</option>
            <option value="both">Both</option>
          </select>

          {/* COST */}
          <input
            type="number"
            name="avgCostForOne"
            placeholder="Avg Cost ₹"
            className="w-full border p-3 rounded-xl"
            onChange={handleChange}
          />

          {/* BEST TIME */}
          <select
            name="bestTime"
            className="w-full border p-3 rounded-xl"
            onChange={handleChange}
          >
            <option value="anytime">Anytime</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
          </select>

          {/* OPEN HOUR Div */}
          <div>
            <p className="text-sm mb-2">Opening Hours</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* OPEN */}
              <select
                value={formData.openingHours.open}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    openingHours: {
                      ...prev.openingHours,
                      open: e.target.value,
                    },
                  }))
                }
                className="border p-3 rounded-xl"
              >
                <option value="">Select Open Time</option>
                <option value="06:00">06:00 AM</option>
                <option value="08:00">08:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="12:00">12:00 PM</option>
              </select>

              {/* CLOSE */}
              <select
                value={formData.openingHours.close}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    openingHours: {
                      ...prev.openingHours,
                      close: e.target.value,
                    },
                  }))
                }
                className="border p-3 rounded-xl"
              >
                <option value="">Select Close Time</option>
                <option value="18:00">06:00 PM</option>
                <option value="20:00">08:00 PM</option>
                <option value="22:00">10:00 PM</option>
                <option value="23:59">11:59 PM</option>
              </select>
            </div>
          </div>

          {/* LOCATION */}
          <div>
            <p className="text-sm mb-2">Location</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* LATITUDE */}
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    latitude: e.target.value,
                  }))
                }
                placeholder="Latitude"
                className="border p-3 rounded-xl"
              />

              {/* LONGITUDE */}
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    longitude: e.target.value,
                  }))
                }
                placeholder="Longitude"
                className="border p-3 rounded-xl"
              />

              {/* AUTO BUTTON */}
              <button
                type="button"
                onClick={handleGetLocation}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                Auto Detect
              </button>
            </div>
          </div>

          {/* RECOMMENDED */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isRecommended"
              onChange={handleChange}
            />
            Recommended
          </label>

          {/* IMAGES */}
          <div>
            <p className="text-sm mb-2">Upload Images</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {formData.images.map((img, i) => (
                <label
                  key={i}
                  className="border h-24 flex items-center justify-center rounded-xl cursor-pointer overflow-hidden"
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
          </div>

          {/* BUTTON */}
          <button
            disabled={loading}
            className="w-full bg-linear-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl text-lg font-semibold"
          >
            {loading ? "Creating..." : "Create Restaurant"}
          </button>

          {createSuccess && (
            <p className="text-green-600 text-center">
              Restaurant created & pending approval
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default AddRestaurantDetails;
