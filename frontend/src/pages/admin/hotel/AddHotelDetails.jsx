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

    // console.log(data);
    dispatch(createHotel(data));
    alert("Hotel Create SuccessFul.")
    navigate("/admin/adminDashboard")
  };

  return (
<div className="min-h-screen bg-black px-4 md:px-6 py-6 text-white">
  {/* Header */}
  <div className="relative mb-8 overflow-hidden rounded-4xl border border-white/10 bg-linear-to-br from-zinc-950 via-zinc-900 to-black p-6 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
    <div className="absolute -top-10 right-0 h-44 w-44 rounded-full bg-orange-500/20 blur-3xl" />
    <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-red-500/20 blur-3xl" />

    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div className="flex items-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-linear-to-br from-orange-500 to-red-600 text-3xl shadow-[0_10px_30px_rgba(249,115,22,0.45)]">
          🏨
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-zinc-500">
            Hotel Management
          </p>

          <h1 className="text-3xl md:text-5xl font-black bg-linear-to-r from-white via-orange-100 to-orange-400 bg-clip-text text-transparent">
            Create Hotel
          </h1>

          <p className="mt-2 text-sm md:text-base text-zinc-400">
            Add hotel details, location, facilities and images
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 px-5 py-3 text-sm text-orange-300 backdrop-blur-xl">
        Fill all required details carefully
      </div>
    </div>
  </div>

  {/* Form Card */}
  <div className="mx-auto max-w-6xl rounded-4xl border border-white/10 bg-zinc-950/90 p-6 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Details */}
      <div>
        <h2 className="mb-5 text-xl font-bold text-white">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-400">
              Hotel Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter hotel name"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-400">
              Hotel Type
            </label>
            <input
              type="text"
              name="type"
              placeholder="e.g. Resort, Motel, Lodge"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Location Details */}
      <div>
        <h2 className="mb-5 text-xl font-bold text-white">Location Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-400">
              Select City
            </label>
            <select
              name="city"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
              onChange={handleChange}
            >
              <option className="bg-zinc-900" value="">
                Select City
              </option>
              {cities.map((city) => (
                <option className="bg-zinc-900" key={city._id} value={city._id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-400">
              Full Address
            </label>
            <input
              type="text"
              name="address"
              placeholder="Enter hotel address"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-orange-500/50 focus:bg-white/10"
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Facilities */}
      <div>
        <h2 className="mb-5 text-xl font-bold text-white">Facilities</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {facilitiesList.map((f) => (
            <div
              key={f}
              onClick={() => toggleFacility(f)}
              className={`cursor-pointer rounded-2xl p-3 text-center text-sm transition ${
                formData.facilities.includes(f)
                  ? "bg-orange-500 text-black shadow"
                  : "bg-white/5 text-white border border-white/10"
              }`}
            >
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Coordinates */}
      <div>
        <h2 className="mb-5 text-xl font-bold text-white">Hotel Coordinates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <input
            type="text"
            name="latitude"
            value={formData.latitude}
            placeholder="Latitude"
            readOnly
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition-all duration-300"
          />
          <input
            type="text"
            name="longitude"
            value={formData.longitude}
            placeholder="Longitude"
            readOnly
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition-all duration-300"
          />
          <button
            type="button"
            onClick={handleGetLocation}
            className="w-full rounded-2xl border border-blue-500/20 bg-blue-500/15 px-4 py-3 font-semibold text-blue-300 transition-all duration-300 hover:bg-blue-500/25 hover:border-blue-500/40"
          >
            Auto Detect Location
          </button>
        </div>
      </div>

      {/* Images */}
      <div>
        <h2 className="mb-5 text-xl font-bold text-white">Hotel Images</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {formData.images.map((img, i) => (
            <label
              key={i}
              className="group relative flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border border-dashed border-white/15 bg-white/3 transition-all duration-300 hover:border-orange-500/40 hover:bg-white/5"
            >
              {img ? (
                <>
                  <img
                    src={URL.createObjectURL(img)}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    alt=""
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 transition group-hover:opacity-100" />
                </>
              ) : (
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-2xl text-zinc-500 group-hover:text-orange-400">
                    +
                  </div>
                  <p className="text-xs text-zinc-500">Upload</p>
                </div>
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

      {/* Submit */}
      <div className="pt-2">
        <button
          disabled={loading}
          className="w-full rounded-3xl bg-linear-to-r from-orange-500 to-red-600 py-4 text-lg font-bold text-white shadow-[0_12px_40px_rgba(249,115,22,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(249,115,22,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating Hotel..." : "Create Hotel"}
        </button>

        {createSuccess && (
          <p className="mt-4 text-center text-sm font-medium text-emerald-400">
            Hotel created successfully and is pending approval.
          </p>
        )}
      </div>
    </form>
  </div>
</div>
  );

}

export default AddHotelDetails;