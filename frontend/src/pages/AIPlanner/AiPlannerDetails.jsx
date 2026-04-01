import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import L from "leaflet";
import { getActiveCities } from "../../features/user/citySlice";
import { loadAiPlan, loadPlanHistory } from "../../features/user/placeSlice";
import { IoIosCloseCircleOutline } from "react-icons/io";

// ✅ MAP IMPORTS
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// ✅ FIX MARKER ISSUE
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ✅ ICONS
const createIcon = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

const markerIcons = {
  Place: createIcon("green"),
  Hotel: createIcon("red"),
  Restaurant: createIcon("orange"),
};

function AiPlannerDetails({ embedded = false } = {}) {
  const dispatch = useDispatch();
  const [modalData, setModalData] = useState(null);

  const { aiPlan } = useSelector((state) => state.place);
  const safeAiPlan = aiPlan || [];

  console.log(aiPlan);

  useEffect(() => {
    dispatch(getActiveCities());
    dispatch(loadPlanHistory());

    const lastPlan = JSON.parse(localStorage.getItem("lastAiPlan"));
    if (lastPlan) dispatch(loadAiPlan(lastPlan));
  }, [dispatch]);

  // ✅ Coordinates
  const coordinates = safeAiPlan.flatMap((day) => [
    ...(day.places?.map((p) => [
      p.location.coordinates[1],
      p.location.coordinates[0],
    ]) || []),
    ...(day.hotels?.map((h) => [
      h.location.coordinates[1],
      h.location.coordinates[0],
    ]) || []),
  ]);

  const bounds = coordinates.length ? L.latLngBounds(coordinates) : null;

  const content = (
    <div className={embedded ? "space-y-4" : "p-6 max-w-7xl mx-auto space-y-6"}>

      {/* HEADER */}
      <div
        className={
          embedded
            ? "rounded-2xl border border-slate-200 bg-white/80 backdrop-blur px-5 py-4 shadow-sm"
            : "rounded-2xl border border-slate-200 bg-white/70 backdrop-blur px-6 py-5 shadow-sm"
        }
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1
              className={
                embedded
                  ? "text-lg sm:text-xl font-semibold text-slate-900"
                  : "text-2xl sm:text-3xl font-semibold text-slate-900"
              }
            >
              Plan overview
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Tap a place card to see details and nearby hotels.
            </p>
          </div>
          <div className="text-sm text-slate-600">
            {safeAiPlan?.length ? (
              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {safeAiPlan.length} day plan generated
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                No plan loaded
              </span>
            )}
          </div>
        </div>
      </div>

      {/* EMPTY STATE */}
      {safeAiPlan?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <p className="text-base font-medium text-slate-800">
            No plan generated yet
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Go back to the planner and generate a new itinerary.
          </p>
        </div>
      )}

      {/* ================= CARDS ================= */}
      <div
        className={
          embedded
            ? "grid grid-cols-1 gap-4"
            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        }
      >
        {safeAiPlan.map((day, index) => (
          <div
            key={index}
            className="p-4 bg-white/80 backdrop-blur rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg text-slate-900">
                Day {day.day}
              </h2>
              <span className="text-xs text-slate-500">
                {(day.places?.length || 0)} places
              </span>
            </div>

            {day.places?.map((p, idx) => (
              <div
                key={idx}
                onClick={() =>
                  setModalData({ type: "place", data: p, day })
                }
                className="p-3 mb-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:shadow-sm transition cursor-pointer flex items-center gap-3"
              >
                {p.images?.[0] && (
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-16 h-16 object-cover rounded-xl"
                  />
                )}
                <div>
                  <p className="font-semibold text-slate-900 leading-snug line-clamp-1">
                    {p.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {p.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ================= GLOBAL MAP ================= */}
      {coordinates.length > 0 && (
        <div className="mt-8 bg-white/80 backdrop-blur p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-end justify-between gap-3 mb-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Map overview
              </h2>
              <p className="text-sm text-slate-500">
                Visualize the route across selected places and hotels.
              </p>
            </div>
          </div>

          <MapContainer
            bounds={bounds}
            scrollWheelZoom={true}
            style={{ height: embedded ? "320px" : "450px", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {safeAiPlan.map((day) =>
              [
                ...(day.places || []).map((p) => ({
                  ...p,
                  type: "Place",
                })),
                ...(day.hotels || []).map((h) => ({
                  ...h,
                  type: "Hotel",
                })),
              ].map((loc, idx) => (
                <Marker
                  key={`${day.day}-${idx}`}
                  position={[
                    loc.location.coordinates[1],
                    loc.location.coordinates[0],
                  ]}
                  icon={markerIcons[loc.type]}
                >
                  <Popup>
                    <strong>{loc.name}</strong>
                    <br />
                    {loc.type}
                  </Popup>
                </Marker>
              ))
            )}

            <Polyline positions={coordinates} />
          </MapContainer>
        </div>
      )}

      {/* ================= MODAL ================= */}
      {modalData &&
        createPortal(
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
          onClick={() => setModalData(null)}
        >
          <div
            className="bg-white p-5 sm:p-6 rounded-2xl w-full max-w-5xl max-h-[85vh] overflow-y-auto shadow-xl relative border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-3xl text-slate-500 hover:text-slate-900 transition"
              onClick={() => setModalData(null)}
              aria-label="Close details"
            >
              <IoIosCloseCircleOutline />
            </button>

            {/* PLACE DETAILS */}
            {modalData.type === "place" && (
              <>
                <h2 className="text-2xl sm:text-3xl font-semibold mb-2 text-slate-900 pr-10">
                  {modalData.data.name}
                </h2>

                <p className="text-slate-600 mb-3">
                  {modalData.data.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {modalData.data.category && (
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                      {modalData.data.category}
                    </span>
                  )}
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                    ₹{modalData.data.entryfees} • {modalData.data.timeRequired} hrs
                  </span>
                </div>

                {/* IMAGES */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                  {modalData.data.images?.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`${modalData.data.name}-${i + 1}`}
                      className="w-full h-28 sm:h-32 object-cover rounded-xl border border-slate-200"
                    />
                  ))}
                </div>

                {/* HOTELS */}
                <h3 className="text-lg font-semibold mb-2 text-slate-900">
                  Nearby hotels
                </h3>

                <div className="grid grid-cols-1 gap-2 mb-4">
                  {modalData.day?.hotels?.map((h, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex gap-3"
                    >
                      {h.images?.[0] && (
                        <img
                          src={h.images[0]}
                          alt={h.name}
                          className="w-16 h-16 rounded-md"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-slate-900 line-clamp-1">
                          {h.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          ₹{h.cheapestRoom?.pricePerNight}/night
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );

  return embedded ? (
    content
  ) : (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      {content}
    </div>
  );
}

export default AiPlannerDetails;