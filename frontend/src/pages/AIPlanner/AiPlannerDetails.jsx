import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createPortal } from "react-dom";
import L from "leaflet";
import { getActiveCities } from "../../features/user/citySlice";
import {
  loadAiPlan,
  loadPlanHistory,
  normalizeAiPlan,
} from "../../features/user/placeSlice";
import { IoIosCloseCircleOutline } from "react-icons/io";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useLocation, useNavigate } from "react-router-dom";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const createIcon = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

const markerIcons = {
  Place: createIcon("green"),
  Hotel: createIcon("red"),
  Restaurant: createIcon("orange"),
};

/* ── Only pseudo-elements, keyframes, font import & Leaflet overrides stay here ── */
const STYLES = `
  .apd-wrap * { font-family: 'Outfit', sans-serif; }
  .font-cormorant { font-family: 'Cormorant Garamond', serif !important; }

  @keyframes apd-fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes apd-fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes apd-slideUp {
    from { opacity: 0; transform: translateY(20px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .animate-apd-fadeup   { animation: apd-fadeUp .45s ease both; }
  .animate-apd-fadeup-1 { animation: apd-fadeUp .45s .08s ease both; }
  .animate-apd-fadeup-2 { animation: apd-fadeUp .45s .16s ease both; }
  .animate-apd-fadein   { animation: apd-fadeIn .2s ease; }
  .animate-apd-slideup  { animation: apd-slideUp .25s ease; }

  /* Top amber accent bar on day card — needs ::before */
  .apd-day-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, #c9922a, transparent);
    opacity: 0;
    transition: opacity .25s;
  }
  .apd-day-card:hover::before { opacity: 1; }

  /* Modal image grid — complex :nth-child radius selectors */
  .apd-modal-imgs img:first-child          { border-radius: 22px 0 0 0; }
  .apd-modal-imgs img:last-child:nth-child(n+2) { border-radius: 0 22px 0 0; }

  /* Leaflet dark theme overrides */
  .apd-map-section .leaflet-tile {
    filter: brightness(0.85) saturate(0.9);
  }
  .apd-map-section .leaflet-popup-content-wrapper {
    background: #141c27;
    color: #f5efe6;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  }
  .apd-map-section .leaflet-popup-tip { background: #141c27; }
  .apd-map-section .leaflet-container { border-radius: 0 0 18px 18px;  }
`;

function latLngFromDoc(doc) {
  const c = doc?.location?.coordinates;
  if (!Array.isArray(c) || c.length < 2) return null;
  const lng = Number(c[0]);
  const lat = Number(c[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
}

function AiPlannerDetails({ embedded = false } = {}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [modalData, setModalData] = useState(null);

  const { aiPlan } = useSelector((state) => state.place);
  const safeAiPlan = useMemo(() => normalizeAiPlan(aiPlan), [aiPlan]);

  useEffect(() => {
    if (!embedded) {
      dispatch(getActiveCities());
      dispatch(loadPlanHistory());
    }
    try {
      const raw = localStorage.getItem("lastAiPlan");
      if (!raw) return;
      const lastPlan = normalizeAiPlan(JSON.parse(raw));
      if (lastPlan.length) dispatch(loadAiPlan(lastPlan));
    } catch {
      /* ignore */
    }
  }, [dispatch, embedded]);

  const navPlanFromState = location.state?.plan;
  useEffect(() => {
    if (navPlanFromState == null) return;
    const normalized = normalizeAiPlan(navPlanFromState);
    if (normalized.length) dispatch(loadAiPlan(normalized));
    navigate(location.pathname, { replace: true, state: {} });
  }, [dispatch, location.pathname, navigate, navPlanFromState]);

  const coordinates = useMemo(() => {
    const pts = [];
    for (const day of safeAiPlan) {
      for (const p of day.places || []) {
        const ll = latLngFromDoc(p);
        if (ll) pts.push(ll);
      }
      for (const h of day.hotels || []) {
        const ll = latLngFromDoc(h);
        if (ll) pts.push(ll);
      }
    }
    return pts;
  }, [safeAiPlan]);

  const mapKey = useMemo(
    () =>
      safeAiPlan.length
        ? safeAiPlan.map((d) => d.day).join("-") + `-${coordinates.length}`
        : "empty",
    [coordinates.length, safeAiPlan],
  );

  const bounds = useMemo(() => {
    if (coordinates.length === 0) return null;
    const b = L.latLngBounds(coordinates);
    if (coordinates.length === 1) {
      const [lat, lng] = coordinates[0];
      b.extend([lat + 0.02, lng + 0.02]);
      b.extend([lat - 0.02, lng - 0.02]);
    }
    return b;
  }, [coordinates]);

  const content = (
    <div className="max-w-275 mx-auto">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="text-[10px] tracking-[.18em] uppercase text-[#c9922a] font-semibold mb-1.5">
            ✦ Itinerary
          </div>
          <div className="font-cormorant font-semibold text-[#1f2937] text-[28px] leading-[1.1]">
            Plan Overview
          </div>
          <div className="text-[12px] text-gray-500 mt-1">
            Tap a place to see details
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">
          {/* status badge */}
          {safeAiPlan?.length ? (
            <span className="inline-flex items-center gap-2 text-[12px] font-medium px-3 py-2 rounded-full border border-gray-300 bg-gray-100 text-gray-800">
              {safeAiPlan.length} day plan
            </span>
          ) : null}

          {/* 🤖 AI BUTTON */}
          {!embedded && (
            <button
              onClick={() => navigate("/assistantChat")}
              className="w-10 h-10 grid place-items-center rounded-xl border border-gray-300 bg-white hover:border-[#c9922a] hover:bg-[#c9922a]/10 transition-all duration-200 shadow-sm hover:shadow-md"
              title="Ask AI about this plan"
            >
              <img src="/robot.png" className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* ── EMPTY STATE ── */}
      {safeAiPlan?.length === 0 && (
        <div className="animate-fade-up border border-dashed border-gray-200 rounded-[18px] py-13 px-6 text-center bg-gray-50">
          <div className="text-[36px] mb-3 opacity-60">🗺️</div>
          <div className="font-cormorant text-[22px] text-gray-800 mb-2">
            No itinerary yet
          </div>
          <div className="text-[13px] text-gray-500">
            Go back to the planner and generate a new trip.
          </div>
        </div>
      )}

      {/* ── DAY CARDS ── */}
      {safeAiPlan?.length > 0 && (
        <div
          className={`animate-fade-up-1 grid gap-4.5 ${
            embedded
              ? "grid-cols-1"
              : "grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
          }`}
        >
          {safeAiPlan.map((day, index) => (
            <div
              key={index}
              className="day-card bg-white border border-gray-200 rounded-[18px] p-5 relative overflow-hidden transition-all duration-250 hover:border-yellow-400 hover:shadow-lg"
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-[10px] bg-yellow-100 border border-yellow-200 grid place-items-center font-cormorant text-[16px] font-semibold text-yellow-500 shrink-0">
                    {day.day}
                  </div>
                  <div className="font-cormorant text-[18px] font-semibold text-gray-800">
                    Day {day.day}
                  </div>
                </div>
                <span className="text-[11px] text-gray-500 tracking-[.06em] bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                  {day.places?.length || 0} place
                  {(day.places?.length || 0) !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Place rows */}
              {day.places?.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 mb-2 last:mb-0 rounded-xl  border-gray-200 bg-gray-50 cursor-pointer transition-all duration-200  "
                  onClick={() => setModalData({ type: "place", data: p, day })}
                >
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-13 h-13 object-cover rounded-[10px] shrink-0 border border-gray-200"
                    />
                  ) : (
                    <div className="w-13 h-13 rounded-[10px] bg-gray-200 border border-gray-200 shrink-0 grid place-items-center text-[20px] opacity-50">
                      📍
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-medium text-gray-800 leading-snug whitespace-nowrap overflow-hidden text-ellipsis max-w-45">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.75 tracking-[.04em]">
                      {p.category}
                    </div>
                  </div>
                  <span className="ml-auto text-gray-500 text-[16px] shrink-0 transition-all duration-200 group-hover:text-yellow-500">
                    →
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── MAP ── */}
      {coordinates.length > 0 && (
        <div className="map-section animate-fade-up-2 mt-7 bg-white border border-gray-200 rounded-[18px] overflow-hidden">
          <div className="px-6 pt-5 pb-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2.5 -z-20">
            <div>
              <div className="font-cormorant text-[22px] font-semibold text-gray-800">
                Route Map
              </div>
              <div className="text-[12px] text-gray-500 mt-0.75">
                Visualize places and hotels across your itinerary
              </div>
            </div>
            <div className="flex items-center gap-3.5 flex-wrap">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 tracking-[.04em]">
                <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                Places
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 tracking-[.04em]">
                <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                Hotels
              </div>
            </div>
          </div>

          <MapContainer
            key={mapKey}
            bounds={bounds}
            scrollWheelZoom={true}
            style={{ height: embedded ? "300px" : "440px", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {safeAiPlan.map((day) =>
              [
                ...(day.places || []).map((p) => ({ ...p, type: "Place" })),
                ...(day.hotels || []).map((h) => ({ ...h, type: "Hotel" })),
              ].map((loc, idx) => {
                const pos = latLngFromDoc(loc);
                if (!pos) return null;
                return (
                  <Marker
                    key={`${day.day}-${idx}-${loc._id ?? loc.name ?? idx}`}
                    position={pos}
                    icon={markerIcons[loc.type]}
                  >
                    <Popup>
                      <strong>{loc.name}</strong>
                      <br />
                      {loc.type}
                    </Popup>
                  </Marker>
                );
              }),
            )}
            {coordinates.length > 1 ? (
              <Polyline
                positions={coordinates}
                color="#c9922a"
                weight={2}
                opacity={0.7}
                dashArray="6,8"
              />
            ) : null}
          </MapContainer>
        </div>
      )}

      {/* ── MODAL ── */}
      {modalData &&
        createPortal(
          <div
            className="animate-fade-in fixed inset-0 bg-black/30 backdrop-blur-[6px] flex items-center justify-center z-2000 p-5"
            onClick={() => setModalData(null)}
          >
            <div
              className="animate-slide-up bg-white border border-gray-200 rounded-[22px] w-full max-w-215 max-h-[88vh] overflow-y-auto relative shadow-lg [scrollbar-width:thin] [scrollbar-color:#cfd8dc_transparent] "
              onClick={(e) => e.stopPropagation()}
            >
              {/* Hero image strip */}
              {modalData.data.images?.length > 0 && (
                <div
                  className="modal-imgs grid gap-0.75 mb-0"
                  style={{
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(180px, 1fr))",
                  }}
                >
                  {modalData.data.images.slice(0, 4).map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`${modalData.data.name}-${i}`}
                      className="w-full h-40 object-cover"
                    />
                  ))}
                </div>
              )}

              <div className="px-7.5 pt-7 pb-8">
                {/* Close button */}
                <button
                  className="absolute top-4.5 right-4.5 bg-gray-100 border border-gray-300 text-gray-500 rounded-[10px] w-9 h-9 grid place-items-center cursor-pointer z-10 transition-all duration-200 hover:text-gray-800 hover:border-yellow-400 hover:bg-yellow-50"
                  onClick={() => setModalData(null)}
                  aria-label="Close"
                >
                  <IoIosCloseCircleOutline size={18} />
                </button>

                {modalData.type === "place" && (
                  <>
                    <div className="font-cormorant text-[30px] font-semibold text-gray-800 mb-2.5 pr-11 leading-[1.15]">
                      {modalData.data.name}
                    </div>
                    <div className="text-[14px] text-gray-700 leading-[1.7] mb-4.5">
                      {modalData.data.description}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {modalData.data.category && (
                        <span className="text-[11px] font-medium tracking-[.08em] px-3 py-1.25 rounded-full border border-yellow-200 bg-yellow-50 text-yellow-500">
                          {modalData.data.category}
                        </span>
                      )}
                      <span className="text-[11px] font-medium tracking-[.08em] px-3 py-1.25 rounded-full border border-gray-200 bg-gray-100 text-gray-700">
                        ₹{modalData.data.entryfees} entry
                      </span>
                      <span className="text-[11px] font-medium tracking-[.08em] px-3 py-1.25 rounded-full border border-gray-200 bg-gray-100 text-gray-700">
                        {modalData.data.timeRequired} hrs
                      </span>
                    </div>

                    {/* Nearby Hotels */}
                    {modalData.day?.hotels?.length > 0 && (
                      <>
                        <div className="text-[10px] tracking-[.18em] uppercase font-semibold text-yellow-500 mb-3.5">
                          ✦ Nearby Hotels
                        </div>
                        {modalData.day.hotels.map((h, idx) => (
                          <div
                            key={idx}
                            onClick={() => navigate(`/hotels/${h._id}`)}
                            className="flex items-center gap-3.5 px-4 py-3.5 mb-2.5 last:mb-0 rounded-[14px] border border-gray-200 bg-gray-50 cursor-pointer hover:shadow-xl duration-300"
                          >
                            {h.images?.[0] && (
                              <img
                                src={h.images[0]}
                                alt={h.name}
                                className="w-15 h-15 object-cover rounded-[10px] shrink-0"
                              />
                            )}
                            <div>
                              <div className="text-[14px] font-medium text-gray-800">
                                {h.name}
                              </div>
                              <div className="text-[12px] text-yellow-500 font-medium mt-0.75">
                                ₹{h.cheapestRoom?.pricePerNight}/night
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div
        className={`apd-wrap ${
          embedded
            ? "p-5"
            : "min-h-screen bg-linear-to-br from-white via-gray-50 to-gray-100 p-9 max-[900px]:p-5 animate-fade-in"
        }`}
      >
        {content}
      </div>
    </>
  );
}

export default AiPlannerDetails;
