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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Create Hotel</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          name="name"
          placeholder="Hotel Name"
          className="w-full border p-2 rounded"
          onChange={handleChange}
        />

        {/* CITY DROPDOWN */}
        <select
          name="city"
          className="w-full border p-2 rounded"
          onChange={handleChange}
        >
          <option value="">Select City</option>
          {cities.map((city) => (
            <option key={city._id} value={city._id}>
              {city.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="address"
          placeholder="Address"
          className="w-full border p-2 rounded"
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Description"
          className="w-full border p-2 rounded"
          onChange={handleChange}
        />

        {/* LOCATION */}
        <div className="grid grid-cols-3 gap-3">
          <input
            type="text"
            value={formData.latitude}
            readOnly
            className="border p-2 rounded"
          />
          <input
            type="text"
            value={formData.longitude}
            readOnly
            className="border p-2 rounded"
          />
          <button
            type="button"
            onClick={handleGetLocation}
            className="bg-blue-600 text-white rounded-lg"
          >
            Get Location
          </button>
        </div>

        {/* FACILITIES */}
        <div>
          <p className="font-semibold mb-2">Facilities</p>
          <div className="grid grid-cols-3 gap-2">
            {facilitiesList.map((f) => (
              <label key={f} className="flex items-center gap-2 border p-2 rounded">
                <input
                  type="checkbox"
                  checked={formData.facilities.includes(f)}
                  onChange={() => toggleFacility(f)}
                />
                {f}
              </label>
            ))}
          </div>
        </div>

        {/* IMAGES */}
        <div className="grid grid-cols-5 gap-3">
          {formData.images.map((img, i) => (
            <label key={i} className="border h-24 flex items-center justify-center cursor-pointer">
              {img ? (
                <img src={URL.createObjectURL(img)} className="h-full w-full object-cover" />
              ) : ("+")}
              <input hidden type="file" onChange={(e) => handleImageChange(i, e.target.files[0])} />
            </label>
          ))}
        </div>

        <button
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded-lg"
        >
          {loading ? "Creating..." : "Create Hotel"}
        </button>

        {createSuccess && <p className="text-green-600">Hotel created & pending approval</p>}
      </form>
    </div>
  );
}

export default AddHotelDetails;