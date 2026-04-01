// LiveLocationUpdate.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDeliveryBoyProfileThunk, updateLiveLocationThunk } from "../../../features/user/deliveryBoySlice";
import { MapPin, RefreshCw, Clock, Navigation, Wifi, AlertCircle } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom marker icon for better visuals
const customIcon = L.divIcon({
  className: "",
  html: `<div style="
    width: 36px; height: 36px;
    background: linear-gradient(135deg, #3B5BDB, #7048E8);
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 4px 12px rgba(59,91,219,0.5);
    border: 3px solid white;
  "></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// Auto-recenter map when coordinates change
function MapRecenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

function LiveLocationUpdate() {
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.deliveryBoy);
  const [address, setAddress] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [error, setError] = useState("");

  const fetchAddress = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      setAddress(data.display_name || "");
    } catch {
      setAddress("Unable to fetch address");
    }
  }, []);

  const updateLocation = useCallback(() => {
    if (!profile?._id || !navigator.geolocation) return;
    setUpdating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        dispatch(updateLiveLocationThunk({ id: profile._id, latitude, longitude }));
        fetchAddress(latitude, longitude);
        setLastUpdated(new Date());
        setCountdown(10);
        setUpdating(false);
      },
      (err) => {
        setError("Location access denied. Please enable GPS.");
        setUpdating(false);
      },
      { enableHighAccuracy: true }
    );
  }, [dispatch, profile?._id, fetchAddress]);

  // Auto update every 10 seconds
  useEffect(() => {
    if (!profile?._id) return;
    updateLocation();
    const interval = setInterval(updateLocation, 10000);
    return () => clearInterval(interval);
  }, [profile?._id]);

  // Countdown ticker
  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown((c) => (c <= 1 ? 10 : c - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    dispatch(getDeliveryBoyProfileThunk());
  }, [dispatch]);

  const lat = profile?.location?.coordinates?.[1];
  const lng = profile?.location?.coordinates?.[0];
  const hasLocation = lat != null && lng != null;

  return (
    <div className="min-h-screen bg-[#F7F8FC] font-['DM_Sans',sans-serif] px-4 py-8">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');`}</style>

      <div className="max-w-2xl mx-auto space-y-5">

        {/* Page Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#3B5BDB] flex items-center justify-center shadow-md">
            <Navigation className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-['Syne',sans-serif]">Live Location</h1>
            <p className="text-xs text-gray-400">Real-time GPS tracking</p>
          </div>
          {/* Auto-sync badge */}
          <div className="ml-auto flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5">
            <Wifi className="w-3 h-3 text-blue-500 animate-pulse" />
            <span className="text-xs text-blue-600 font-semibold">Auto · {countdown}s</span>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Map Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {hasLocation ? (
            <>
              {/* Map */}
              <div className="relative">
                <MapContainer
                  center={[lat, lng]}
                  zoom={16}
                  scrollWheelZoom={false}
                  style={{ height: "300px", width: "100%" }}
                  zoomControl={false}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution="&copy; OpenStreetMap &copy; CartoDB"
                  />
                  <Marker position={[lat, lng]} icon={customIcon}>
                    <Popup className="custom-popup">
                      <div className="text-sm font-semibold text-slate-800">Your Location</div>
                      <div className="text-xs text-gray-500 mt-0.5">{address || "Loading address…"}</div>
                    </Popup>
                  </Marker>
                  <MapRecenter lat={lat} lng={lng} />
                </MapContainer>

                {/* Updating overlay */}
                {updating && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-999">
                    <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-lg border">
                      <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
                      <span className="text-sm text-indigo-700 font-medium">Updating…</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Location Info */}
              <div className="px-5 py-4 space-y-3">
                {/* Coordinates */}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div className="flex gap-3 flex-wrap">
                    <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg">
                      {lat.toFixed(6)}° N
                    </span>
                    <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg">
                      {lng.toFixed(6)}° E
                    </span>
                  </div>
                </div>

                {/* Address */}
                <div className="bg-slate-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 mb-0.5 font-medium uppercase tracking-wider">Address</p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {address || "Fetching address…"}
                  </p>
                </div>

                {/* Last updated */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {lastUpdated
                      ? `Last updated: ${lastUpdated.toLocaleTimeString("en-IN")}`
                      : "Not updated yet"}
                  </div>
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-[#3B5BDB] to-[#7048E8] rounded-full transition-all duration-1000"
                      style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-slate-600 font-semibold">Location unavailable</p>
              <p className="text-sm text-gray-400 mt-1">Click the button below to fetch your current location.</p>
            </div>
          )}
        </div>

        {/* Update Button */}
        <button
          type="button"
          onClick={updateLocation}
          disabled={updating}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm text-white bg-linear-to-r from-[#3B5BDB] to-[#7048E8] hover:opacity-90 transition-all shadow-lg shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${updating ? "animate-spin" : ""}`} />
          {updating ? "Updating location…" : "Update Now"}
        </button>

        <p className="text-center text-xs text-gray-400 pb-2">
          Location auto-syncs every 10 seconds · GPS data used only for delivery tracking
        </p>
      </div>
    </div>
  );
}

export default LiveLocationUpdate;
