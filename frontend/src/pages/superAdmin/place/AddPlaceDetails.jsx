import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { 
  MdAddLocation, 
  MdLocationCity, 
  MdCategory, 
  MdAccessTime, 
  MdAttachMoney, 
  MdCloudUpload,
  MdMyLocation,
  MdDriveFileRenameOutline,
  MdOutlineDescription,
  MdMap,
  MdStar,
  MdDateRange,
  MdDelete
} from "react-icons/md";
import { createPlace } from "../../../features/user/placeSlice";
import { getActiveCities } from "../../../features/user/citySlice";
import { useNavigate } from "react-router-dom";

function AddPlaceDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
      images: [...prev.images, ...files],
    }));
  };

  // 🔥 remove image
  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
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

    if (formData.images.length < 3) {
      alert("Please upload at least 3 images.");
      return;
    }

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
    <div className="min-h-screen bg-gray-50/50 p-6 lg:p-10 font-sans text-gray-900">
      {/* HEADER */}
      <div className="mb-8 max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-5 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          <div className="p-4 bg-linear-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/30">
            <MdAddLocation className="text-3xl" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Add New Place
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-1 font-medium">Create a new travel destination for the directory</p>
          </div>
        </motion.div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Basic Details Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-50">
                <MdDriveFileRenameOutline className="text-blue-500 text-2xl" /> 
                Basic Information
              </h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Place Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Place Name</label>
                    <div className="relative">
                      <input
                        name="name"
                        placeholder="e.g. Taj Mahal"
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      />
                      <MdDriveFileRenameOutline className="absolute left-4 top-4 text-gray-400 text-lg" />
                    </div>
                  </div>

                  {/* City Dropdown */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">City</label>
                    <div className="relative">
                      <select
                        name="cityId"
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none"
                      >
                        <option value="">Select a city</option>
                        {cities?.map((city) => (
                          <option key={city._id} value={city._id}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                      <MdLocationCity className="absolute left-4 top-4 text-gray-400 text-lg" />
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Category</label>
                  <div className="relative">
                    <input
                      name="category"
                      placeholder="e.g. Historical, Temple, Nature"
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    />
                    <MdCategory className="absolute left-4 top-4 text-gray-400 text-lg" />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Description</label>
                  <div className="relative">
                    <textarea
                      name="description"
                      placeholder="Write a detailed description of the place..."
                      onChange={handleChange}
                      rows="4"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
                    />
                    <MdOutlineDescription className="absolute left-4 top-4 text-gray-400 text-lg" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Visitor Details Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-50">
                <MdStar className="text-yellow-400 text-2xl" /> 
                Visitor Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Time Required</label>
                  <div className="relative">
                    <input
                      name="timeRequired"
                      placeholder="e.g. 2-3 hours"
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    />
                    <MdAccessTime className="absolute left-4 top-4 text-gray-400 text-lg" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Entry Fees</label>
                  <div className="relative">
                    <input
                      name="entryfees"
                      placeholder="e.g. ₹50 or Free"
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    />
                    <MdAttachMoney className="absolute left-4 top-4 text-gray-400 text-lg" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Best Time to Visit</label>
                  <div className="relative">
                    <input
                      name="bestTimeToVisit"
                      placeholder="e.g. October to March"
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    />
                    <MdDateRange className="absolute left-4 top-4 text-gray-400 text-lg" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Popularity</label>
                  <div className="relative">
                    <select
                      name="isPopular"
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none"
                    >
                      <option value="false">Standard Place</option>
                      <option value="true">Must Visit / Popular</option>
                    </select>
                    <MdStar className="absolute left-4 top-4 text-gray-400 text-lg" />
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Location & Images */}
          <div className="space-y-8">
            
            {/* Location Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <MdMap className="text-red-500 text-2xl" /> 
                  Location
                </h2>
                <button
                  type="button"
                  onClick={handleLiveLocation}
                  className="flex items-center gap-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg transition-colors font-semibold"
                >
                  <MdMyLocation /> Get Current
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Latitude</label>
                  <input
                    name="latitude"
                    value={formData.latitude}
                    placeholder="e.g. 28.6139"
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Longitude</label>
                  <input
                    name="longitude"
                    value={formData.longitude}
                    placeholder="e.g. 77.2090"
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>
            </motion.div>

            {/* Media Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-50">
                <MdCloudUpload className="text-blue-500 text-2xl" /> 
                Media
              </h2>
              
              <div className="space-y-4">
                <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:bg-gray-50 transition-colors group">
                  <input
                    type="file"
                    multiple
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MdCloudUpload className="text-2xl text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Click or drag images here</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                </div>

                {/* PREVIEW */}
                {formData.images.length > 0 && (
                  <div className="pt-2">
                    <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Selected Images ({formData.images.length})</h3>
                    <div className="flex gap-2 flex-wrap">
                      {formData.images.map((img, i) => (
                        <div key={i} className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-100">
                          <img
                            src={URL.createObjectURL(img)}
                            className="w-16 h-16 object-cover transition-transform duration-300 group-hover:scale-110"
                            alt="preview"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(i)}
                              className="p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors transform hover:scale-110"
                            >
                              <MdDelete className="text-sm" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Submit Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-end pt-4"
        >
          <button 
            type="submit"
            className="w-full lg:w-auto bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-10 rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:-translate-y-1 transition-all duration-200 flex items-center justify-center gap-3 text-lg"
          >
            <MdAddLocation className="text-2xl" />
            Publish Place
          </button>
        </motion.div>
      </form>
    </div>
  );
}

export default AddPlaceDetails;