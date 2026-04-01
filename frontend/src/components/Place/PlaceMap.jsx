import { useState } from "react";
import { useSelector } from "react-redux";
import {
  selectPlaces,
  selectNearbyPlaces,
  selectUsingNearby,
  selectUserLocation,
} from "../../features/user/placeSlice";

// ── Single marker on a static map ────────────────────────────────────────────
function StaticMapMarker({ place, isSelected, onClick }) {
  return (
    <button
      onClick={() => onClick(place)}
      title={place.name}
      className={`absolute transform -translate-x-1/2 -translate-y-full transition-all
                  duration-200 group focus:outline-none
                  ${isSelected ? "z-20 scale-125" : "z-10 hover:scale-110"}`}
      style={{
        left: `${((place.location.coordinates[0] + 180) / 360) * 100}%`,
        top:  `${((90 - place.location.coordinates[1]) / 180) * 100}%`,
      }}
    >
      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
                       shadow-lg text-sm transition-all
                       ${isSelected
                         ? "bg-rose-500 border-white text-white"
                         : "bg-white border-rose-400 hover:bg-rose-50"}`}>
        📍
      </div>
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden
                      group-hover:block group-focus:block z-30">
        <div className="bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5
                        rounded-lg whitespace-nowrap shadow-xl">
          {place.name}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4
                          border-transparent border-t-gray-900" />
        </div>
      </div>
    </button>
  );
}

// ── Place detail panel (slides in) ────────────────────────────────────────────
function PlaceDetailPanel({ place, onClose }) {
  if (!place) return null;

  const img = place.images?.[0] ||
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80";

  return (
    <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-72
                    bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-30
                    animate-in slide-in-from-bottom-4 duration-300">
      <div className="relative h-36">
        <img src={img} alt={place.name} className="w-full h-full object-cover" />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70
                     text-white rounded-full flex items-center justify-center text-xs
                     transition-colors"
        >
          ✕
        </button>
        <span className="absolute bottom-2 left-2 bg-rose-500 text-white text-xs
                         font-semibold px-2 py-0.5 rounded-full">
          {place.category}
        </span>
      </div>
      <div className="p-3">
        <h4 className="font-bold text-gray-900 text-sm leading-snug">{place.name}</h4>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{place.description}</p>
        <div className="flex items-center justify-between mt-2">
          {place.entryfees != null && (
            <span className="text-xs font-semibold text-emerald-600">
              {place.entryfees === 0 ? "Free Entry" : `₹${place.entryfees} entry`}
            </span>
          )}
          {place.distanceInKm != null && (
            <span className="text-xs text-gray-400">
              {place.distanceInKm.toFixed(1)} km away
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PlaceMap() {
  const places      = useSelector(selectPlaces);
  const nearby      = useSelector(selectNearbyPlaces);
  const usingNearby = useSelector(selectUsingNearby);
  const userLoc     = useSelector(selectUserLocation);
  const [showMap,  setShowMap]  = useState(false);

  const list = usingNearby ? nearby : places;

  // Filter places that have valid coordinates
  const mappable = list.filter(
    (p) =>
      p.location?.coordinates?.length === 2 &&
      !isNaN(p.location.coordinates[0]) &&
      !isNaN(p.location.coordinates[1])
  );

  if (mappable.length === 0) return null;

  // Use OpenStreetMap embed for a real map experience
  // Center on first place or user location
  const center = userLoc
    ? { lat: userLoc.lat, lng: userLoc.lng }
    : {
        lat: mappable[0].location.coordinates[1],
        lng: mappable[0].location.coordinates[0],
      };

  const zoom = usingNearby ? 13 : 12;
  const osmUrl = buildOSMUrl(mappable, center, zoom, userLoc);

  return (
    <div className="bg-white border-b border-gray-100">
      {/* Toggle button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <button
          onClick={() => setShowMap((v) => !v)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600
                     hover:text-rose-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13 6-3m-6 3V7m6 10 4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
          {showMap ? "Hide Map" : `Show Map (${mappable.length} places)`}
          <svg
            className={`w-4 h-4 transition-transform ${showMap ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>
      </div>

      {/* Map */}
      {showMap && (
        <div className="relative h-72 sm:h-96 border-t border-gray-100 bg-gray-100 overflow-hidden">
          {/* OpenStreetMap embed */}
          <iframe
            title="Places Map"
            className="w-full h-full"
            src={osmUrl}
            style={{ border: 0 }}
            loading="lazy"
          />

          {/* Place count overlay */}
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl
                          px-3 py-1.5 shadow-md border border-gray-100">
            <p className="text-xs font-semibold text-gray-700">
              📍 {mappable.length} places on map
            </p>
          </div>

          {/* Attribution */}
          <div className="absolute bottom-1 right-2 text-[10px] text-gray-400">
            © OpenStreetMap contributors
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildOSMUrl(places, center, zoom, userLoc) {
  void places;
  void zoom;
  void userLoc;

  return (
    `https://www.openstreetmap.org/export/embed.html` +
    `?bbox=${center.lng - 0.1},${center.lat - 0.1},${center.lng + 0.1},${center.lat + 0.1}` +
    `&layer=mapnik` +
    `&marker=${center.lat},${center.lng}`
  );
}