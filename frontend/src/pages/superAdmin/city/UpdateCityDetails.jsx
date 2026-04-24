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
    famousFor: [],
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
        avgDailyBudget: city.avgDailyBudget
          ? (() => {
              const clean = city.avgDailyBudget.replace(/,/g, "");
              const numbers = clean.match(/\d+/g);
              if (!numbers) return "";
              return numbers.length >= 2
                ? `${numbers[0]}-${numbers[1]}`
                : numbers[0];
            })()
          : "",
        famousFor: Array.isArray(city.famousFor)
          ? city.famousFor
          : typeof city.famousFor === "string"
          ? (() => {
              try {
                return JSON.parse(city.famousFor);
              } catch {
                return city.famousFor.split(",").map((item) => item.trim());
              }
            })()
          : [],
        images: city.images || [],
      });
    }
  }, [city]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();

    for (const key in formData) {
      if (key === "images") {
        for (let i = 0; i < formData.images.length; i++) {
          if (formData.images[i]) {
            data.append("images", formData.images[i]);
          }
        }
      } else if (key === "famousFor") {
        data.append(key, JSON.stringify(formData[key]));
      } else {
        data.append(key, formData[key]);
      }
    }

    dispatch(updateCity({ id: cityId, data }));
    alert("City details updated successfully");
    navigate("/superAdmin/get-all-active-cities");
  };

  const famousOptions = [
    "tourism",
    "beaches",
    "mountains",
    "food",
    "history",
    "nightlife",
    "shopping",
  ];

  const bestTimeOptions = [
    "January - March",
    "April - June",
    "July - September",
    "October - December",
    "Winter",
    "Summer",
    "Monsoon",
    "All Year",
  ];

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

  const handleImageSlotChange = (index, file) => {
    if (!file) return;
    setFormData((prev) => {
      const updated = [...prev.images];
      updated[index] = file;
      return { ...prev, images: updated };
    });
  };

  const handleImageSlotRemove = (index) => {
    setFormData((prev) => {
      const updated = [...prev.images];
      updated[index] = undefined;
      return { ...prev, images: updated };
    });
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
    <div className="min-h-screen bg-gray-50 px-4 py-6 text-gray-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-linear-to-br from-white to-gray-100 shadow-lg">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-200/20 blur-3xl animate-[pulse_6s_ease-in-out_infinite]"></div>
          <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-cyan-200/20 blur-3xl animate-[pulse_6s_ease-in-out_infinite]"></div>

          <div className="relative z-10 flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl animate-[fadeIn_0.8s_ease]">
              <div className="mb-5 inline-flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-100/50 px-4 py-3 backdrop-blur-md transition-all duration-300 hover:scale-105">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-400/20">
                  <FaCity className="text-2xl text-blue-600" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-blue-600">
                    City Management
                  </p>
                  <p className="text-sm text-gray-700">
                    Edit and update city information
                  </p>
                </div>
              </div>

              <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
                Update City Details
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
                Modify city information, travel details, budget, attractions and
                gallery images. All changes will be saved instantly after
                submission.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:w-auto">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-blue-300 shadow-sm">
                <FaGlobeAsia className="mb-3 text-2xl text-blue-600" />
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Country
                </p>
                <h3 className="mt-1 text-sm font-semibold text-gray-900">
                  {formData.country || "N/A"}
                </h3>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-300 shadow-sm">
                <FaMapMarkedAlt className="mb-3 text-2xl text-cyan-600" />
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  State
                </p>
                <h3 className="mt-1 text-sm font-semibold text-gray-900">
                  {formData.state || "N/A"}
                </h3>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-amber-300 shadow-sm">
                <FaCloudSun className="mb-3 text-2xl text-amber-500" />
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Best Time
                </p>
                <h3 className="mt-1 text-sm font-semibold text-gray-900">
                  {formData.bestTimeToVisit || "N/A"}
                </h3>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-green-300 shadow-sm">
                <FaWallet className="mb-3 text-2xl text-green-500" />
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Budget
                </p>
                <h3 className="mt-1 text-sm font-semibold text-gray-900">
                  {formData.avgDailyBudget
                    ? `${formData.avgDailyBudget}/day`
                    : "N/A"}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-gray-200 bg-white p-5 shadow-lg sm:p-8 transition-all duration-300"
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Name */}
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                City Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter city name"
                className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-4 text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* State */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
                className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-4 text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Country */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Enter country"
                className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-4 text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Description */}
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Write a short description about the city..."
                className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-4 text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Best Time */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Best Time To Visit
              </label>
              <select
                name="bestTimeToVisit"
                value={formData.bestTimeToVisit}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-4 text-gray-900 outline-none transition-all duration-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select best time</option>
                {bestTimeOptions.map((time) => (
                  <option key={time}>{time}</option>
                ))}
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Average Daily Budget
              </label>
              <input
                type="text"
                name="avgDailyBudget"
                value={formData.avgDailyBudget}
                onChange={handleChange}
                placeholder="Enter daily budget"
                className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-4 text-gray-900 outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Famous For */}
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Famous For
              </label>
              <div className="flex flex-wrap gap-3">
                {famousOptions.map((item) => {
                  const active = formData.famousFor.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleFamous(item)}
                      className={`rounded-2xl border px-4 py-2 text-sm font-medium capitalize transition-all duration-300 ${
                        active
                          ? "border-blue-400 bg-blue-100 text-blue-600"
                          : "border-gray-300 bg-gray-50 text-gray-600"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Images — 5 individual slots */}
            <div className="lg:col-span-2">
              <label className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaImage className="text-blue-600" />
                City Images
                <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
                  5 slots
                </span>
              </label>

              <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-5 transition hover:border-blue-400">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {[0, 1, 2, 3, 4].map((index) => {
                    const existingImg =
                      formData.images[index] &&
                      typeof formData.images[index] === "string"
                        ? formData.images[index]
                        : null;

                    const newFile =
                      formData.images[index] &&
                      typeof formData.images[index] !== "string"
                        ? formData.images[index]
                        : null;

                    const previewSrc = newFile
                      ? URL.createObjectURL(newFile)
                      : existingImg;

                    return (
                      <div
                        key={index}
                        className="group flex flex-col items-center gap-2"
                      >
                        <label
                          htmlFor={`image-slot-${index}`}
                          className="relative w-full cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-white transition-all duration-300 hover:border-blue-400 hover:shadow-md"
                          style={{ aspectRatio: "1 / 1" }}
                        >
                          {previewSrc ? (
                            <>
                              <img
                                src={previewSrc}
                                alt={`city-${index + 1}`}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              />

                              {/* Hover overlay */}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                <div className="flex flex-col items-center gap-1 text-white">
                                  <FaImage className="text-2xl" />
                                  <span className="text-xs font-medium">
                                    Change
                                  </span>
                                </div>
                              </div>

                              {/* Saved badge */}
                              {existingImg && !newFile && (
                                <span className="absolute left-2 top-2 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
                                  Saved
                                </span>
                              )}

                              {/* New badge */}
                              {newFile && (
                                <span className="absolute left-2 top-2 rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
                                  New
                                </span>
                              )}

                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleImageSlotRemove(index);
                                }}
                                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm text-white opacity-0 shadow transition-opacity duration-200 group-hover:opacity-100 hover:bg-red-600"
                              >
                                ×
                              </button>
                            </>
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                <FaImage className="text-lg text-blue-500" />
                              </div>
                              <p className="text-xs text-gray-500">
                                Click to upload
                              </p>
                              <p className="text-[10px] text-gray-400">
                                JPG, PNG, WEBP
                              </p>
                            </div>
                          )}
                        </label>

                        <input
                          id={`image-slot-${index}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageSlotChange(index, file);
                          }}
                        />

                        <span className="text-xs font-medium text-gray-500">
                          Image {index + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Summary bar */}
                <p className="mt-4 text-center text-xs text-gray-400">
                  {formData.images.filter(Boolean).length} / 5 image
                  {formData.images.filter(Boolean).length !== 1 ? "s" : ""} added
                  {formData.images.some(
                    (img) => img && typeof img === "string"
                  ) && (
                    <span className="ml-2 text-green-500">
                      •{" "}
                      {
                        formData.images.filter(
                          (img) => img && typeof img === "string"
                        ).length
                      }{" "}
                      previously saved
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/superAdmin/get-all-active-cities")}
              className="rounded-2xl border border-gray-300 bg-gray-100 px-6 py-3 font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center rounded-2xl bg-blue-600 px-8 py-3 font-semibold text-white transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
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
