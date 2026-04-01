import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import L from "leaflet";
import { getActiveCities } from "../../features/user/citySlice";
import { loadAiPlan, loadPlanHistory } from "../../features/user/placeSlice";
import { IoIosCloseCircleOutline } from "react-icons/io";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

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
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');

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
  .apd-map-section .leaflet-container { border-radius: 0 0 18px 18px; }
`;

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

  // ── Coordinates (unchanged logic) ──
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
    <div className="max-w-275 mx-auto">
      {/* ── HEADER ── */}
      <div
        className={`animate-apd-fadeup bg-[#141c27] border border-white/[0.07] rounded-[18px] flex items-center justify-between flex-wrap gap-4 mb-6 ${embedded ? "px-5 py-4.5" : "px-6.5 py-5.5"}`}
      >
        <div>
          <div className="text-[10px] tracking-[.18em] uppercase text-[#c9922a] font-semibold mb-1.5">
            ✦ Itinerary
          </div>
          <div
            className={`font-cormorant font-semibold text-[#f5efe6] leading-[1.1] ${embedded ? "text-[20px]" : "text-[28px]"}`}
          >
            Plan Overview
          </div>
          <div className="text-[12px] text-[#7a8a9a] mt-1">
            Tap a place to see details, images & nearby hotels
          </div>
        </div>
        <div>
          {safeAiPlan?.length ? (
            <span className="inline-flex items-center gap-2 text-[12px] font-medium px-3.5 py-2 rounded-full border border-white/12 bg-[#1c2738] text-[#d8cfc4] whitespace-nowrap">
              <span className="w-1.75 h-1.75 rounded-full bg-[#34d399] shadow-[0_0_6px_rgba(52,211,153,0.4)] shrink-0" />
              {safeAiPlan.length} day plan loaded
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 text-[12px] font-medium px-3.5 py-2 rounded-full border border-white/12 bg-[#1c2738] text-[#d8cfc4] whitespace-nowrap">
              <span className="w-1.75 h-1.75 rounded-full bg-[#7a8a9a] shrink-0" />
              No plan loaded
            </span>
          )}
        </div>
      </div>

      {/* ── EMPTY STATE ── */}
      {safeAiPlan?.length === 0 && (
        <div className="animate-apd-fadeup border border-dashed border-white/10 rounded-[18px] py-13 px-6 text-center">
          <div className="text-[36px] mb-3 opacity-50">🗺️</div>
          <div className="font-cormorant text-[22px] text-[#f5efe6] mb-2">
            No itinerary yet
          </div>
          <div className="text-[13px] text-[#7a8a9a]">
            Go back to the planner and generate a new trip.
          </div>
        </div>
      )}

      {/* ── DAY CARDS ── */}
      {safeAiPlan?.length > 0 && (
        <div
          className={`animate-apd-fadeup-1 grid gap-4.5 ${embedded ? "grid-cols-1" : "grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"}`}
        >
          {safeAiPlan.map((day, index) => (
            <div
              key={index}
              className="apd-day-card bg-[#141c27] border border-white/[0.07] rounded-[18px] p-5 relative overflow-hidden transition-all duration-250 hover:border-[#c9922a]/25 hover:shadow-[0_0_40px_rgba(201,146,42,0.12)]"
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-[10px] bg-[#c9922a]/12 border border-[#c9922a]/20 grid place-items-center font-cormorant text-[16px] font-semibold text-[#e8b84b] shrink-0">
                    {day.day}
                  </div>
                  <div className="font-cormorant text-[18px] font-semibold text-[#f5efe6]">
                    Day {day.day}
                  </div>
                </div>
                <span className="text-[11px] text-[#7a8a9a] tracking-[.06em] bg-[#1c2738] px-2.5 py-1 rounded-full border border-white/[0.07]">
                  {day.places?.length || 0} place
                  {(day.places?.length || 0) !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Place rows */}
              {day.places?.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 mb-2 last:mb-0 rounded-xl border border-white/[0.07] bg-[#1c2738] cursor-pointer transition-all duration-200 hover:border-[#c9922a]/30 hover:bg-[#243044] hover:translate-x-0.75"
                  onClick={() => setModalData({ type: "place", data: p, day })}
                >
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-13 h-13 object-cover rounded-[10px] shrink-0 border border-white/[0.07]"
                    />
                  ) : (
                    <div className="w-13 h-13 rounded-[10px] bg-[#243044] border border-white/[0.07] shrink-0 grid place-items-center text-[20px] opacity-50">
                      📍
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-medium text-[#f5efe6] leading-snug whitespace-nowrap overflow-hidden text-ellipsis max-w-45">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-[#7a8a9a] mt-0.75 tracking-[.04em]">
                      {p.category}
                    </div>
                  </div>
                  <span className="ml-auto text-[#7a8a9a] text-[16px] shrink-0 transition-all duration-200 group-hover:text-[#c9922a]">
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
        <div className="apd-map-section animate-apd-fadeup-2 mt-7 bg-[#141c27] border border-white/[0.07] rounded-[18px] overflow-hidden">
          <div className="px-6 pt-5 pb-4 border-b border-white/[0.07] flex items-center justify-between flex-wrap gap-2.5">
            <div>
              <div className="font-cormorant text-[22px] font-semibold text-[#f5efe6]">
                Route Map
              </div>
              <div className="text-[12px] text-[#7a8a9a] mt-0.75">
                Visualize places and hotels across your itinerary
              </div>
            </div>
            <div className="flex items-center gap-3.5 flex-wrap">
              <div className="flex items-center gap-1.5 text-[11px] text-[#7a8a9a] tracking-[.04em]">
                <div className="w-2 h-2 rounded-full bg-[#22c55e] shrink-0" />
                Places
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#7a8a9a] tracking-[.04em]">
                <div className="w-2 h-2 rounded-full bg-[#ef4444] shrink-0" />
                Hotels
              </div>
            </div>
          </div>

          <MapContainer
            bounds={bounds}
            scrollWheelZoom={true}
            style={{ height: embedded ? "300px" : "440px", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {safeAiPlan.map((day) =>
              [
                ...(day.places || []).map((p) => ({ ...p, type: "Place" })),
                ...(day.hotels || []).map((h) => ({ ...h, type: "Hotel" })),
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
              )),
            )}
            <Polyline
              positions={coordinates}
              color="#c9922a"
              weight={2}
              opacity={0.7}
              dashArray="6,8"
            />
          </MapContainer>
        </div>
      )}

      {/* ── MODAL ── */}
      {modalData &&
        createPortal(
          <div
            className="animate-apd-fadein fixed inset-0 bg-black/75 backdrop-blur-[6px] flex items-center justify-center z-9999 p-5"
            onClick={() => setModalData(null)}
          >
            <div
              className="animate-apd-slideup bg-[#141c27] border border-white/12 rounded-[22px] w-full max-w-215 max-h-[88vh] overflow-y-auto relative shadow-[0_32px_80px_rgba(0,0,0,0.6),0_0_40px_rgba(201,146,42,0.12)] [scrollbar-width:thin] [scrollbar-color:#1c2738_transparent]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Hero image strip */}
              {modalData.data.images?.length > 0 && (
                <div
                  className="apd-modal-imgs grid gap-0.75 mb-0"
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
                  className="absolute top-4.5 right-4.5 bg-[#1c2738] border border-white/12 text-[#7a8a9a] rounded-[10px] w-9 h-9 grid place-items-center cursor-pointer z-1 transition-all duration-200 hover:text-[#f5efe6] hover:border-[#c9922a] hover:bg-[#c9922a]/8"
                  onClick={() => setModalData(null)}
                  aria-label="Close"
                >
                  <IoIosCloseCircleOutline size={18} />
                </button>

                {modalData.type === "place" && (
                  <>
                    <div className="font-cormorant text-[30px] font-semibold text-[#f5efe6] mb-2.5 pr-11 leading-[1.15]">
                      {modalData.data.name}
                    </div>
                    <div className="text-[14px] text-[#d8cfc4] leading-[1.7] mb-4.5">
                      {modalData.data.description}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {modalData.data.category && (
                        <span className="text-[11px] font-medium tracking-[.08em] px-3 py-1.25 rounded-full border border-[#c9922a]/30 bg-[#c9922a]/8 text-[#e8b84b]">
                          {modalData.data.category}
                        </span>
                      )}
                      <span className="text-[11px] font-medium tracking-[.08em] px-3 py-1.25 rounded-full border border-white/12 bg-[#1c2738] text-[#d8cfc4]">
                        ₹{modalData.data.entryfees} entry
                      </span>
                      <span className="text-[11px] font-medium tracking-[.08em] px-3 py-1.25 rounded-full border border-white/12 bg-[#1c2738] text-[#d8cfc4]">
                        {modalData.data.timeRequired} hrs
                      </span>
                    </div>

                    {/* Nearby Hotels */}
                    {modalData.day?.hotels?.length > 0 && (
                      <>
                        <div className="text-[10px] tracking-[.18em] uppercase font-semibold text-[#c9922a] mb-3.5">
                          ✦ Nearby Hotels
                        </div>
                        {modalData.day.hotels.map((h, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3.5 px-4 py-3.5 mb-2.5 last:mb-0 rounded-[14px] border border-white/[0.07] bg-[#1c2738]"
                          >
                            {h.images?.[0] && (
                              <img
                                src={h.images[0]}
                                alt={h.name}
                                className="w-15 h-15 object-cover rounded-[10px] shrink-0"
                              />
                            )}
                            <div>
                              <div className="text-[14px] font-medium text-[#f5efe6]">
                                {h.name}
                              </div>
                              <div className="text-[12px] text-[#e8b84b] font-medium mt-0.75">
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
        className={`apd-wrap ${embedded ? "p-5" : "min-h-screen bg-[#0d1117] p-9 max-[900px]:p-5"}`}
      >
        {content}
      </div>
    </>
  );
}

export default AiPlannerDetails;
