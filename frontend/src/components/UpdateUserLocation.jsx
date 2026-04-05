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
    <div className="relative overflow-hidden bg-[#030712] px-4 py-8 sm:px-6 lg:px-8">
    {/* Animated Background */}
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-20 top-0 h-72 w-72 animate-pulse rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute right-0 top-20 h-80 w-80 animate-pulse rounded-full bg-cyan-500/10 blur-3xl [animation-delay:1.5s]" />
      <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 animate-pulse rounded-full bg-indigo-500/10 blur-3xl [animation-delay:3s]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.10),transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-size-[48px_48px]" />
    </div>
  
    <div className="relative mx-auto max-w-2xl">
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-4xl border border-white/10 bg-white/4 shadow-[0_35px_80px_rgba(0,0,0,0.65)] backdrop-blur-3xl"
      >
        {/* Interactive Header */}
        <div className="relative overflow-hidden border-b border-white/10 bg-linear-to-br from-[#0f172a] via-[#172554] to-[#0f172a] px-5 py-7 sm:px-8 sm:py-8">
          {/* Floating Glow */}
          <div className="absolute -left-10 top-0 h-40 w-40 animate-pulse rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute right-0 top-0 h-52 w-52 animate-pulse rounded-full bg-cyan-500/15 blur-3xl [animation-delay:1.5s]" />
  
          {/* Shine Animation */}
          <div className="absolute -left-40 top-0 h-full w-32 rotate-12 bg-white/10 blur-2xl transition-all duration-2500 hover:left-[120%]" />
  
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Left Content */}
            <div className="flex items-start gap-4">
              <div className="group relative flex h-16 w-16 items-center justify-center rounded-3xl border border-white/15 bg-white/10 text-white shadow-[0_15px_35px_rgba(37,99,235,0.35)] backdrop-blur-xl transition-all duration-500 hover:scale-110 hover:rotate-6 hover:bg-blue-500/20">
                <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-blue-500/30 to-cyan-500/20 opacity-0 transition duration-500 group-hover:opacity-100" />
                <MapPin className="relative h-7 w-7 transition duration-500 group-hover:scale-110" />
              </div>
  
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="bg-linear-to-r from-white via-blue-100 to-cyan-300 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
                    {user?.location ? "Update Location" : "Add Your Location"}
                  </h2>
  
                  {/* Optional Badge */}
                  <span className="inline-flex animate-pulse items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-300">
                    <span className="h-2 w-2 rounded-full bg-blue-400" />
                    Secure
                  </span>
                </div>
  
                <p className="max-w-lg text-sm leading-7 text-slate-300 sm:text-[15px]">
                  Use your live GPS location or manually enter your city, state
                  and country details below for a better personalized experience.
                </p>
              </div>
            </div>
  
            {/* Right Decorative Card */}
            <div className="hidden rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl md:block">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                  <Navigation className="h-5 w-5" />
                </div>
  
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Fast Detection
                  </p>
                  <p className="mt-1 text-sm font-medium text-white">
                    Auto-fill your location
                  </p>
                </div>
              </div>
            </div>
          </div>
  
          {/* Bottom Floating Info */}
          <div className="relative mt-6 flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 backdrop-blur-xl transition duration-300 hover:border-blue-500/20 hover:bg-blue-500/10">
              📍 Detect current city instantly
            </div>
  
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 backdrop-blur-xl transition duration-300 hover:border-cyan-500/20 hover:bg-cyan-500/10">
              🔒 Your location stays private
            </div>
  
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 backdrop-blur-xl transition duration-300 hover:border-emerald-500/20 hover:bg-emerald-500/10">
              ⚡ Faster recommendations nearby
            </div>
          </div>
        </div>
  
        <div className="space-y-7 p-5 sm:p-7 md:p-8">
          {/* Detect Button */}
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={detecting}
            className={`group relative w-full overflow-hidden rounded-3xl border transition-all duration-500 ${
              detecting
                ? "cursor-not-allowed border-blue-400/30 bg-blue-500/20"
                : detected
                ? "border-emerald-400/30 bg-emerald-500/15 hover:bg-emerald-500/20"
                : "border-white/10 bg-linear-to-r from-[#1d4ed8] via-[#4338ca] to-[#0891b2] hover:scale-[1.01] hover:shadow-[0_20px_55px_rgba(37,99,235,0.4)]"
            }`}
          >
            <div
              className={`absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
                detected
                  ? "bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.25),transparent_70%)]"
                  : "bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_70%)]"
              }`}
            />
  
            <div className="absolute -left-16 top-0 h-full w-14 rotate-12 bg-white/10 blur-xl transition-all duration-1000 group-hover:left-[120%]" />
  
            <div className="relative flex flex-col items-center justify-center gap-4 px-5 py-5 sm:flex-row sm:justify-start">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 ${
                  detecting
                    ? "border-blue-300/20 bg-blue-500/20 text-blue-100"
                    : detected
                    ? "border-emerald-300/20 bg-emerald-500/20 text-emerald-100"
                    : "border-white/20 bg-white/10 text-white group-hover:rotate-6 group-hover:scale-110"
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
  
              <div className="text-center sm:text-left">
                <p className="text-base font-semibold text-white">
                  {detecting
                    ? "Detecting Your Location..."
                    : detected
                    ? "Location Detected Successfully"
                    : "Use My Current Location"}
                </p>
  
                <p
                  className={`mt-1 text-sm ${
                    detecting
                      ? "text-blue-100/80"
                      : detected
                      ? "text-emerald-100/80"
                      : "text-white/70"
                  }`}
                >
                  {detecting
                    ? "Please wait while we fetch your address."
                    : detected
                    ? "Your address has been automatically filled."
                    : "Automatically detect and fill your location in one click."}
                </p>
              </div>
            </div>
          </button>
  
          {/* Input Fields */}
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
              <div key={field.name} className="group space-y-3">
                <label className="block text-sm font-medium text-slate-300">
                  {field.label}
                </label>
  
                <div className="relative">
                  <input
                    type="text"
                    name={field.name}
                    value={locationData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white/6 focus:ring-4 focus:ring-blue-500/20"
                  />
  
                  <div className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent transition duration-300 group-hover:border-blue-500/10" />
                </div>
              </div>
            ))}
          </div>
  
          {/* Address Preview */}
          {locationData.fullAddress && (
            <div className="animate-[fadeIn_.5s_ease] rounded-3xl border border-blue-500/20 bg-blue-500/10 p-5 backdrop-blur-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                  <MapPin className="h-5 w-5" />
                </div>
  
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-white">
                      Selected Address
                    </h3>
  
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                      Active
                    </span>
                  </div>
  
                  <p className="mt-3 text-sm leading-7 text-slate-300">
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
            className={`group relative w-full overflow-hidden rounded-2xl py-4 text-base font-semibold transition-all duration-300 ${
              loading
                ? "cursor-not-allowed bg-slate-700 text-slate-400"
                : "bg-linear-to-r from-emerald-500 via-green-500 to-teal-500 text-white hover:scale-[1.015] hover:shadow-[0_18px_45px_rgba(16,185,129,0.45)]"
            }`}
          >
            {!loading && (
              <div className="absolute -left-16 top-0 h-full w-14 rotate-12 bg-white/10 blur-xl transition-all duration-1000 group-hover:left-[120%]" />
            )}
  
            <span className="relative z-10">
              {loading ? "Saving Location..." : "Save & Continue"}
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
  );
}

export default UpdateUserLocation;
