import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createHotel } from "../../../features/user/hotelSlice";
import { getActiveCities } from "../../../features/user/citySlice";
import { useNavigate } from "react-router-dom";

function AddHotelDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate()

  const { loading, createSuccess } = useSelector((state) => state.hotel);
  const { cities } = useSelector((state) => state.city);

  const facilitiesList = [
    "wifi",
    "pool",
    "gym",
    "parking",
    "restaurant",
    "spa",
    "bar",
  ];

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    description: "",
    latitude: "",
    longitude: "",
    facilities: [],
    images: [null, null, null, null, null],
  });

  useEffect(() => {
    dispatch(getActiveCities());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleFacility = (facility) => {
    setFormData((prev) => {
      const exists = prev.facilities.includes(facility);
      return {
        ...prev,
        facilities: exists
          ? prev.facilities.filter((f) => f !== facility)
          : [...prev.facilities, facility],
      };
    });
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();

    data.append("name", formData.name);
    data.append("city", formData.city);
    data.append("address", formData.address);
    data.append("description", formData.description);
    data.append("facilities", formData.facilities.join(","));

    const location = {
      type: "Point",
      coordinates: [formData.longitude, formData.latitude],
    };

    data.append("location", JSON.stringify(location));

    formData.images.forEach((img) => {
      if (img) data.append("images", img);
    });

    console.log(data);
    dispatch(createHotel(data));
    alert("Hotel Create SuccessFul.")
    navigate("/admin/adminDashboard")
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
  
      {/* HEADER */}
      <div className="mb-8 p-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-xl border border-gray-200 dark:border-gray-700 flex items-center gap-4">
        <div className="p-4 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-xl text-xl shadow">
          🏨
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Create Hotel
          </h1>
          <p className="text-gray-500">
            Add new hotel details and location
          </p>
        </div>
      </div>
  
      {/* FORM CARD */}
      <div className="bg-white dark:bg-gray-900 w-full max-w-5xl mx-auto rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white">
  
        <form onSubmit={handleSubmit} className="space-y-6">
  
          {/* NAME */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Hotel Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter hotel name"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
          </div>
  
          {/* CITY */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Select City
            </label>
            <select
              name="city"
              className="w-full border p-3 rounded-xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city._id} value={city._id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
  
          {/* ADDRESS */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Address
            </label>
            <input
              type="text"
              name="address"
              placeholder="Enter address"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
          </div>
  
          {/* DESCRIPTION */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Description
            </label>
            <textarea
              name="description"
              rows="4"
              placeholder="Enter description"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            />
          </div>
  
          {/* LOCATION */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Location
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={formData.latitude}
                readOnly
                placeholder="Latitude"
                className="border p-3 rounded-xl bg-gray-100 dark:bg-gray-800"
              />
              <input
                type="text"
                value={formData.longitude}
                readOnly
                placeholder="Longitude"
                className="border p-3 rounded-xl bg-gray-100 dark:bg-gray-800"
              />
              <button
                type="button"
                onClick={handleGetLocation}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                Get Location
              </button>
            </div>
          </div>
  
          {/* FACILITIES */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Facilities
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {facilitiesList.map((f) => (
                <div
                  key={f}
                  onClick={() => toggleFacility(f)}
                  className={`cursor-pointer p-3 rounded-xl text-center transition ${
                    formData.facilities.includes(f)
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  {f}
                </div>
              ))}
            </div>
          </div>
  
          {/* IMAGES */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Upload Images
            </label>
  
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
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
                    onChange={(e) =>
                      handleImageChange(i, e.target.files[0])
                    }
                  />
                </label>
              ))}
            </div>
          </div>
  
          {/* BUTTON */}
          <button
            disabled={loading}
            className="w-full bg-linear-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl text-lg font-semibold hover:opacity-90 transition"
          >
            {loading ? "Creating..." : "Create Hotel"}
          </button>
  
          {/* SUCCESS */}
          {createSuccess && (
            <p className="text-green-600 text-center">
              Hotel created & pending approval
            </p>
          )}
  
        </form>
      </div>
    </div>
  );
}

export default AddHotelDetails;