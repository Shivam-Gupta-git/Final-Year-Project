import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCityById, updateCity } from "../../../features/user/citySlice";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaCity,
  FaGlobeAsia,
  FaMapMarkedAlt,
  FaCloudSun,
  FaWallet,
  FaImage,
} from "react-icons/fa";

function UpdateCityDetails() {
  const { id: cityId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { city, loading, error } = useSelector((state) => state.city);

  const [formData, setFormData] = useState({
    name: "",
    state: "",
    country: "",
    description: "",
    bestTimeToVisit: "",
    avgDailyBudget: "",
    famousFor: "",
    images: [],
  });

  useEffect(() => {
    if (cityId) dispatch(getCityById(cityId));
  }, [cityId, dispatch]);

  useEffect(() => {
    if (city) {
      setFormData({
        name: city.name || "",
        state: city.state || "",
        country: city.country || "",
        description: city.description || "",
        bestTimeToVisit: city.bestTimeToVisit || "",
        avgDailyBudget: city.avgDailyBudget || "",
        famousFor: Array.isArray(city.famousFor)
          ? city.famousFor.join(", ")
          : city.famousFor || "",
        images: city.images || [],
      });
    }
  }, [city]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "images") {
      setFormData((prev) => ({
        ...prev,
        images: files,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();

    for (const key in formData) {
      if (key === "images") {
        for (let i = 0; i < formData.images.length; i++) {
          data.append("images", formData.images[i]);
        }
      } else if (key === "famousFor") {
        data.append(
          key,
          JSON.stringify(
            formData[key]
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          )
        );
      } else {
        data.append(key, formData[key]);
      }
    }

    dispatch(updateCity({ id: cityId, data }));
    alert("City details updated successfully");
    navigate("/superAdmin/get-all-active-cities");
  };

  if (loading && !city) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500"></div>
          <p className="text-zinc-400">Loading city details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-400 shadow-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-linear-to-br from-zinc-950 via-zinc-900 to-black shadow-2xl">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"></div>

          <div className="relative z-10 flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl animate-[fadeIn_0.6s_ease]">
              <div className="mb-5 inline-flex items-center gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 backdrop-blur-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20">
                  <FaCity className="text-2xl text-blue-400" />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-blue-300">
                    City Management
                  </p>
                  <p className="text-sm text-zinc-300">
                    Edit and update city information
                  </p>
                </div>
              </div>

              <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                Update City Details
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
                Modify city information, travel details, budget, attractions
                and gallery images. All changes will be saved instantly after
                submission.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:w-auto">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-blue-500/30">
                <FaGlobeAsia className="mb-3 text-2xl text-blue-400" />
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  Country
                </p>
                <h3 className="mt-1 text-sm font-semibold text-white">
                  {formData.country || "N/A"}
                </h3>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-blue-500/30">
                <FaMapMarkedAlt className="mb-3 text-2xl text-cyan-400" />
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  State
                </p>
                <h3 className="mt-1 text-sm font-semibold text-white">
                  {formData.state || "N/A"}
                </h3>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-blue-500/30">
                <FaCloudSun className="mb-3 text-2xl text-amber-400" />
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  Best Time
                </p>
                <h3 className="mt-1 text-sm font-semibold text-white">
                  {formData.bestTimeToVisit || "N/A"}
                </h3>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-blue-500/30">
                <FaWallet className="mb-3 text-2xl text-green-400" />
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  Budget
                </p>
                <h3 className="mt-1 text-sm font-semibold text-white">
                  {formData.avgDailyBudget
                    ? `₹${formData.avgDailyBudget}/day`
                    : "N/A"}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl sm:p-8"
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Name */}
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                City Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter city name"
                className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-4 text-white outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* State */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
                className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-4 text-white outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Country */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Enter country"
                className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-4 text-white outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Description */}
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Write a short description about the city..."
                className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-4 text-white outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Best Time */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Best Time To Visit
              </label>
              <input
                type="text"
                name="bestTimeToVisit"
                value={formData.bestTimeToVisit}
                onChange={handleChange}
                placeholder="e.g. October - March"
                className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-4 text-white outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Average Daily Budget
              </label>
              <input
                type="number"
                name="avgDailyBudget"
                value={formData.avgDailyBudget}
                onChange={handleChange}
                placeholder="Enter daily budget"
                className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-4 text-white outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Famous For */}
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Famous For
              </label>
              <input
                type="text"
                name="famousFor"
                value={formData.famousFor}
                onChange={handleChange}
                placeholder="e.g. Lakes, Food, Mountains"
                className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-4 text-white outline-none transition-all duration-300 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Images */}
            <div className="lg:col-span-2">
              <label className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-300">
                <FaImage className="text-blue-400" />
                City Images
              </label>

              <div className="rounded-3xl border border-dashed border-zinc-700 bg-black/60 p-5 transition hover:border-blue-500/40">
                <input
                  type="file"
                  name="images"
                  multiple
                  onChange={handleChange}
                  className="w-full cursor-pointer text-sm text-zinc-400 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700"
                />

                {formData.images?.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {Array.from(formData.images).map((img, index) => {
                      const src =
                        typeof img === "string"
                          ? img
                          : URL.createObjectURL(img);

                      return (
                        <div
                          key={index}
                          className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
                        >
                          <img
                            src={src}
                            alt="city"
                            className="h-32 w-full object-cover transition duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/20"></div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/superAdmin/get-all-active-cities")}
              className="rounded-2xl border border-zinc-700 bg-zinc-900 px-6 py-3 font-medium text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center rounded-2xl bg-blue-600 px-8 py-3 font-semibold text-white transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                  Updating City...
                </span>
              ) : (
                "Update City"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateCityDetails;