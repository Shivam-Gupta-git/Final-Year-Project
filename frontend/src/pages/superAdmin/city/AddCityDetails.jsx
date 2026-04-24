import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FaCity,
  FaGlobeAsia,
  FaImage,
  FaLocationArrow,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createCity } from "../../../features/user/citySlice";

function AddCityDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, createSuccess } = useSelector((state) => state.city);

  const famousOptions = [
    "tourism",
    "beaches",
    "mountains",
    "food",
    "history",
    "nightlife",
    "shopping",
    "IT Hub",
    "Snowfall",
    "Trekking & hiking",
    "biking",
    "Ganga Aarti",
    "Kumbh Mela",
    "Darjeeling Tea",
    "Toy Train",
    "Tea gardens",
    "Tiger Hill sunrise",
    "temples",
    "Vaishno Devi",
    "culture",
    "lakes",
    "hill station",
    "nature",
    "boating",
    "Charminar",
    "colonial architecture",
    "mall road",
    "river rafting",
    "ghats",
  ];

  const [formData, setFormData] = useState({
    name: "",
    state: "",
    country: "",
    description: "",
    bestTimeToVisit: "",
    avgDailyBudget: "",
    famousFor: [],
    latitude: "",
    longitude: "",
    images: [null, null, null, null, null],
  });

  const handleChange = ({ target: { name, value } }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleFamous = (item) => {
    setFormData((prev) => {
      const exists = prev.famousFor.includes(item);

      return {
        ...prev,
        famousFor: exists
          ? prev.famousFor.filter((f) => f !== item)
          : [...prev.famousFor, item],
      };
    });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      setFormData((prev) => ({
        ...prev,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }));
    });
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];

    if (!file) return;

    setFormData((prev) => {
      const updatedImages = [...prev.images];
      updatedImages[index] = file;

      return {
        ...prev,
        images: updatedImages,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();

    data.append("name", formData.name);
    data.append("state", formData.state);
    data.append("country", formData.country);
    data.append("description", formData.description);
    data.append("bestTimeToVisit", formData.bestTimeToVisit);
    data.append("avgDailyBudget", formData.avgDailyBudget);
    data.append("famousFor", formData.famousFor.join(","));

    const location = {
      type: "Point",
      coordinates: [Number(formData.longitude), Number(formData.latitude)],
    };

    data.append("location", JSON.stringify(location));

    formData.images
      .filter(Boolean)
      .forEach((img) => data.append("images", img));

    dispatch(createCity(data));
  };

  useEffect(() => {
    if (createSuccess === true) {
      navigate("/superAdmin/superAdminDashboard");
    }
  }, [navigate, createSuccess]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-4 py-8 md:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-cyan-200/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-52 w-52 rounded-full bg-blue-200/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-6 sm:mb-8 overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-200/20 bg-linear-to-br from-white/90 via-gray-100/95 to-gray-50 p-5 sm:p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:shadow-[0_25px_80px_rgba(0,0,0,0.1)]"
        >
          {/* Background Glow */}
          <div className="absolute -top-10 sm:-top-16 right-0 h-40 w-40 sm:h-64 sm:w-64 rounded-full bg-cyan-200/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-36 w-36 sm:h-52 sm:w-52 rounded-full bg-blue-200/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-center lg:justify-between">
            {/* LEFT */}
            <div className="flex items-start gap-3 sm:gap-5">
              {/* Icon */}
              <motion.div
                whileHover={{ rotate: 10, scale: 1.08 }}
                className="flex h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-linear-to-br from-cyan-300 to-blue-400 text-2xl sm:text-3xl md:text-4xl shadow-lg sm:shadow-xl shadow-cyan-200/40"
              >
                <FaCity />
              </motion.div>

              {/* Content */}
              <div className="flex-1">
                <div className="mb-2 sm:mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-cyan-100/30 px-3 sm:px-4 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-cyan-600">
                  Smart City Management
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  Create a New
                  <span className="block sm:inline sm:ml-3 bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    City Profile
                  </span>
                </h1>

                <p className="mt-3 sm:mt-4 max-w-2xl text-xs sm:text-sm md:text-base leading-6 sm:leading-7 text-gray-600">
                  Add a city with detailed information, attractions, budget,
                  location, and media. Create a polished destination profile for
                  your platform in just a few steps.
                </p>

                {/* Stats */}
                <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3">
                  <div className="rounded-xl sm:rounded-2xl border border-gray-200/20 bg-white/50 px-3 sm:px-4 py-2 sm:py-3 backdrop-blur-xl">
                    <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-500">
                      Maximum Images
                    </p>
                    <p className="mt-1 text-base sm:text-xl font-bold text-gray-900">
                      5
                    </p>
                  </div>

                  <div className="rounded-xl sm:rounded-2xl border border-cyan-200/30 bg-cyan-100/30 px-3 sm:px-4 py-2 sm:py-3 backdrop-blur-xl">
                    <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-cyan-600">
                      Location Support
                    </p>
                    <p className="mt-1 text-base sm:text-xl font-bold text-cyan-700">
                      Enabled
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT CARDS */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full lg:w-90"
            >
              <div className="rounded-xl sm:rounded-2xl border border-gray-200/20 bg-white/50 p-3 sm:p-4 backdrop-blur-xl">
                <FaGlobeAsia className="mb-2 sm:mb-3 text-lg sm:text-2xl text-cyan-500" />
                <p className="text-xs sm:text-sm text-gray-600">Global Reach</p>
                <p className="mt-1 text-sm sm:text-lg font-semibold text-gray-900">
                  Add Cities Worldwide
                </p>
              </div>

              <div className="rounded-xl sm:rounded-2xl border border-gray-200/20 bg-white/50 p-3 sm:p-4 backdrop-blur-xl">
                <FaMapMarkerAlt className="mb-2 sm:mb-3 text-lg sm:text-2xl text-blue-400" />
                <p className="text-xs sm:text-sm text-gray-600">
                  GPS Coordinates
                </p>
                <p className="mt-1 text-sm sm:text-lg font-semibold text-gray-900">
                  Auto Detect Available
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl sm:rounded-3xl border border-gray-200/20 bg-white/50 shadow-[0_15px_50px_rgba(0,0,0,0.08)] sm:shadow-[0_20px_80px_rgba(0,0,0,0.1)] backdrop-blur-2xl"
        >
          <div className="grid gap-6 sm:gap-8 p-4 sm:p-6 lg:grid-cols-2 lg:p-8">
            {/* LEFT */}
            <div className="space-y-5 sm:space-y-6">
              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-700">
                  City Name
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter city name"
                  className="w-full rounded-xl sm:rounded-2xl border border-gray-200/30 bg-white/10 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-cyan-400/50 focus:bg-white/20 focus:ring-2 sm:focus:ring-4 focus:ring-cyan-400/10"
                  required
                />
              </div>

              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    className="w-full rounded-xl sm:rounded-2xl border border-gray-200/30 bg-white/10 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-cyan-400/50 focus:bg-white/20 focus:ring-2 sm:focus:ring-4 focus:ring-cyan-400/10"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Enter country"
                    className="w-full rounded-xl sm:rounded-2xl border border-gray-200/30 bg-white/10 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-cyan-400/50 focus:bg-white/20 focus:ring-2 sm:focus:ring-4 focus:ring-cyan-400/10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe the city..."
                  className="w-full rounded-xl sm:rounded-2xl border border-gray-200/30 bg-white/10 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-cyan-400/50 focus:bg-white/20 focus:ring-2 sm:focus:ring-4 focus:ring-cyan-400/10"
                  required
                />
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-5 sm:space-y-6">
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-700">
                    Best Time to Visit
                  </label>
                  <input
                    type="text"
                    name="bestTimeToVisit"
                    value={formData.bestTimeToVisit}
                    onChange={handleChange}
                    placeholder="e.g. March - June"
                    className="w-full rounded-xl sm:rounded-2xl border border-gray-200/30 bg-white/10 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 outline-none transition-all duration-300 focus:border-cyan-400/50 focus:bg-white/20 focus:ring-2 sm:focus:ring-4 focus:ring-cyan-400/10"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-medium text-gray-700">
                    Average Daily Budget
                  </label>
                  <input
                    name="avgDailyBudget"
                    value={formData.avgDailyBudget}
                    onChange={handleChange}
                    placeholder="₹ Enter budget"
                    className="w-full rounded-xl sm:rounded-2xl border border-gray-200/30 bg-white/10 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-cyan-400/50 focus:bg-white/20 focus:ring-2 sm:focus:ring-4 focus:ring-cyan-400/10"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="rounded-2xl sm:rounded-3xl border border-gray-200/30 bg-white/10 p-4 sm:p-5">
                <div className="mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                  <FaLocationArrow className="text-cyan-500 text-sm sm:text-base" />
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                    Location Details
                  </h3>
                </div>

                <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  <input
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="Latitude"
                    className="rounded-xl sm:rounded-2xl border border-gray-200/30 bg-white/10 px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-cyan-400/50"
                  />

                  <input
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="Longitude"
                    className="rounded-xl sm:rounded-2xl border border-gray-200/30 bg-white/10 px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-cyan-400/50"
                  />

                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className="w-full rounded-xl sm:rounded-2xl bg-linear-to-r from-cyan-400 to-blue-500 px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white transition-all duration-300 hover:scale-[1.02]"
                  >
                    Get Location
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-200/30 p-4 sm:p-6 lg:p-8">
            {/* Famous */}
            <div className="mb-5 sm:mb-6">
              <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-gray-900">
                Famous For
              </h3>

              <div className="flex flex-wrap gap-2 sm:gap-3">
                {famousOptions.map((item) => {
                  const active = formData.famousFor.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleFamous(item)}
                      className={`rounded-xl sm:rounded-2xl border px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium capitalize transition-all duration-300 ${
                        active
                          ? "border-cyan-400 bg-cyan-400/20 text-cyan-600"
                          : "border-gray-200/20 bg-white/10 text-gray-600"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Images */}
            <div>
              <div className="mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <FaImage className="text-cyan-500 text-sm sm:text-base" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  City Images (Max 5)
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {formData.images.map((img, index) => (
                  <motion.label
                    whileHover={{ scale: 1.03 }}
                    key={index}
                    className="group relative flex h-28 sm:h-32 md:h-36 cursor-pointer items-center justify-center overflow-hidden rounded-xl sm:rounded-3xl border border-dashed border-gray-200/20 bg-white/10"
                  >
                    {img ? (
                      <img
                        src={URL.createObjectURL(img)}
                        alt="preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <div className="text-xl sm:text-3xl">+</div>
                        <p className="text-[10px] sm:text-xs">Upload</p>
                      </div>
                    )}

                    <input
                      type="file"
                      hidden
                      onChange={(e) => handleImageChange(e, index)}
                    />
                  </motion.label>
                ))}
              </div>
            </div>

            {/* Button */}
            <div className="mt-6 sm:mt-8 flex justify-center sm:justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto rounded-xl sm:rounded-2xl bg-linear-to-r from-emerald-400 to-green-500 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? "Creating City..." : "Create City"}
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

export default AddCityDetails;
