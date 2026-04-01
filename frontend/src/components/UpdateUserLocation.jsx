import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUserLocation } from "../features/user/userSlice";
import {
  MapPin,
  Navigation,
  Loader2,
  CheckCircle2,
  Truck,
  ShieldCheck,
} from "lucide-react";

function UpdateUserLocation() {
  const dispatch = useDispatch();

  const { user, loading, error } = useSelector((state) => state.user);

  const [locationData, setLocationData] = useState({
    latitude: "",
    longitude: "",
    city: "",
    state: "",
    country: "",
    fullAddress: "",
  });

  const [detecting, setDetecting] = useState(false);
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    if (user?.location?.coordinates) {
      setLocationData({
        latitude: user.location.coordinates[1] || "",
        longitude: user.location.coordinates[0] || "",
        city: user.city || "",
        state: user.state || "",
        country: user.country || "",
        fullAddress: user.fullAddress || "",
      });

      setDetected(true);
    }
  }, [user]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );

          const data = await response.json();

          setLocationData({
            latitude,
            longitude,
            city:
              data?.address?.city ||
              data?.address?.town ||
              data?.address?.village ||
              data?.address?.county ||
              "",
            state: data?.address?.state || data?.address?.state_district || "",
            country: data?.address?.country || "",
            fullAddress: data?.display_name || "",
          });

          setDetected(true);
        } catch (err) {
          console.error("Reverse geocoding failed:", err);

          setLocationData((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        console.error(err);
        setDetecting(false);

        if (err.code === 1) {
          alert("Please allow location access in your browser.");
        } else {
          alert("Unable to fetch your location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setLocationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUserLocation(locationData));
  };

  return (
    <div className=" bg-[#0b1120] relative overflow-hidden px-4 py-10">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_35%)] bg-white rounded-2xl" />

      <div className="relative mx-auto max-w-md  gap-8 items-start">
        {/* Left Content */}

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-4xl border border-white/10 bg-white/8 backdrop-blur-3xl shadow-[0_30px_80px_rgba(0,0,0,0.55)] overflow-hidden"
        >
          {/* Header */}
          <div className="relative border-b border-white/10 bg-linear-to-r from-blue-600/90 via-indigo-600/90 to-cyan-600/90 px-8 py-8">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

            <div className="relative flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 text-white">
                <MapPin className="h-7 w-7" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white">
                  {user?.location ? "Update Location" : "Add Your Location"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-blue-100/90 max-w-md">
                  Use your current GPS location or manually fill your address
                  details below.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-7 p-8">
            {/* Detect Button */}
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={detecting}
              className={`group relative w-full overflow-hidden rounded-3xl border transition-all duration-500 cursor-pointer ${
                detecting
                  ? "border-blue-400 bg-blue-500 cursor-not-allowed"
                  : detected
                  ? "border-emerald-400 bg-emerald-400 hover:bg-emerald-500"
                  : "border-white/10 bg-linear-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] hover:scale-[1.015] hover:shadow-[0_20px_50px_rgba(79,70,229,0.45)]"
              }`}
            >
              {/* Glow Effect */}
              <div
                className={`absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
                  detected
                    ? "bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.25),transparent_70%)]"
                    : "bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_70%)]"
                }`}
              />

              {/* Animated Shine */}
              {!detecting && (
                <div className="absolute -left-20 top-0 h-full w-16 rotate-12 bg-white/10 blur-xl transition-all duration-1000 group-hover:left-[120%]" />
              )}

              <div className="relative flex items-center justify-center gap-4 px-6 py-5">
                {/* Icon Circle */}
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
                    detecting
                      ? "border-blue-300/20 bg-blue-400 text-blue-100"
                      : detected
                      ? "border-emerald-100 bg-emerald-400 text-emerald-100"
                      : "border-white/20 bg-white/15 text-white group-hover:rotate-6 group-hover:scale-110"
                  }`}
                >
                  {detecting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : detected ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Navigation className="h-5 w-5" />
                  )}
                </div>

                {/* Text */}
                <div className="flex flex-col items-start text-left">
                  <span className="text-base font-semibold tracking-wide text-white">
                    {detecting
                      ? "Detecting Your Location"
                      : detected
                      ? "Location Detected"
                      : "Use My Current Location"}
                  </span>

                  <span
                    className={`text-xs md:text-sm ${
                      detecting
                        ? "text-blue-100/80"
                        : detected
                        ? "text-emerald-100/80"
                        : "text-white/75"
                    }`}
                  >
                    {detecting
                      ? "Please wait while we fetch your address..."
                      : detected
                      ? "Your address has been detected successfully."
                      : "Automatically find your current address in one click."}
                  </span>
                </div>
              </div>
            </button>

            {/* Address */}
            {/* <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300">
                Full Address
              </label>

              <div className="relative">
                <textarea
                  name="fullAddress"
                  value={locationData.fullAddress}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Street, area, landmark, city..."
                  className="w-full rounded-3xl border border-white/10 bg-[#131c2f]/90 px-5 py-4 pr-24 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                />

                {locationData.fullAddress && (
                  <div className="absolute right-4 top-4 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                    Verified
                  </div>
                )}
              </div>
            </div> */}

            {/* Grid Inputs */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {[
                { label: "City", name: "city", placeholder: "Enter city" },
                { label: "State", name: "state", placeholder: "Enter state" },
                {
                  label: "Country",
                  name: "country",
                  placeholder: "Enter country",
                },
              ].map((field) => (
                <div key={field.name} className="space-y-3">
                  <label className="text-sm font-medium text-black">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    name={field.name}
                    value={locationData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full rounded-2xl border border-black  px-4 py-3 text-sm text-black placeholder:text-slate-500 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                  />
                </div>
              ))}
            </div>

            {/* Preview */}
            {locationData.fullAddress && (
              <div className="rounded-3xl border border-blue-500/20 bg-blue-500 p-5 backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                    <MapPin className="h-5 w-5" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-semibold text-white">
                        Selected Address
                      </h3>

                      <span className="rounded-full border border-emerald-500 bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                        Active
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-7 text-slate-300">
                      {locationData.fullAddress}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-2xl py-4 text-base font-semibold transition-all duration-300 ${
                loading
                  ? "cursor-not-allowed bg-slate-600 text-slate-300"
                  : "bg-linear-to-r from-emerald-500 via-green-500 to-teal-500 text-white hover:scale-[1.02] hover:shadow-[0_18px_45px_rgba(16,185,129,0.45)]"
              }`}
            >
              {loading ? "Saving Location..." : "Save & Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateUserLocation;
