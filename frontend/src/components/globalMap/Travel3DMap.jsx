// ─── INSTALL ONCE (run in your terminal) ──────────────────────────────────────
// npm install leaflet react-leaflet
// ──────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Hotel, Landmark, MapPin, UtensilsCrossed, X, Navigation, Layers } from "lucide-react";

// Fix Leaflet's broken default icon path in Vite/webpack builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  city:       { color: "#F97316", bg: "#FFF7ED", label: "Cities"      },
  hotel:      { color: "#8B5CF6", bg: "#F5F3FF", label: "Hotels"      },
  restaurant: { color: "#10B981", bg: "#ECFDF5", label: "Restaurants" },
  place:      { color: "#0EA5E9", bg: "#F0F9FF", label: "Places"      },
};

const TILE_LAYERS = {
  streets: {
    label: "Streets",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri",
  },
  topo: {
    label: "Topo",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: "© OpenTopoMap",
  },
};

// ─── Custom marker icon factory ───────────────────────────────────────────────

function createMarkerIcon(type) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.place;
  const svg = getMarkerSVG(type);
  const html = `
    <div style="
      width:34px; height:34px;
      background:${cfg.color};
      border:2.5px solid white;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 3px 12px rgba(0,0,0,0.28);
      display:flex; align-items:center; justify-content:center;
    ">
      <div style="transform:rotate(45deg); display:flex; align-items:center; justify-content:center;">
        ${svg}
      </div>
    </div>`;
  return L.divIcon({
    html,
    className: "",
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -46],
  });
}

function getMarkerSVG(type) {
  const s = `width="15" height="15" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"`;
  switch (type) {
    case "hotel":
      return `<svg ${s}><path d="M3 22V8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v14"/><path d="M2 22h20"/><path d="M6 11h4v4H6z"/><path d="M14 11h4v4h-4z"/><path d="M10 22V18h4v4"/></svg>`;
    case "restaurant":
      return `<svg ${s}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`;
    case "city":
      return `<svg ${s}><path d="M3 22V9l9-7 9 7v13"/><path d="M9 22V12h6v10"/></svg>`;
    default:
      return `<svg ${s}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
  }
}

// ─── Helper: fits map bounds whenever locations change ─────────────────────────

function FitBounds({ locations }) {
  const map = useMap();
  useEffect(() => {
    if (!locations.length) return;
    const bounds = L.latLngBounds(locations.map((item) => [item.lat, item.lng]));
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12, animate: true });
  }, [locations, map]);
  return null;
}

// ─── Helper: switches tile layer reactively ────────────────────────────────────

function TileLayerSwitcher({ tileKey }) {
  const tile = TILE_LAYERS[tileKey];
  return <TileLayer key={tileKey} url={tile.url} attribution={tile.attribution} maxZoom={19} />;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypeIcon({ type, size = 18, color }) {
  const c = color || TYPE_CONFIG[type]?.color || "#64748B";
  const s = { width: size, height: size, color: c, flexShrink: 0 };
  switch (type) {
    case "hotel":      return <Hotel style={s} />;
    case "restaurant": return <UtensilsCrossed style={s} />;
    case "city":       return <Landmark style={s} />;
    default:           return <MapPin style={s} />;
  }
}

function getDetailPath(item) {
  if (!item?.id) return null;
  if (item.type === "hotel") return `/hotels/${item.id}`;
  if (item.type === "restaurant") return `/restaurant/${item.id}`;
  if (item.type === "city" || item.type === "place") return `/city/${item.cityId || item.id}/places`;
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TravelMap({ locations = [], loadingPlaces = false }) {
  const navigate = useNavigate();

  const [selected, setSelected]         = useState(null);
  const [tileKey, setTileKey]           = useState("streets");
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [searchQuery, setSearchQuery]   = useState("");
  const [activeFilters, setActiveFilters] = useState(
    new Set(["city", "hotel", "restaurant", "place"])
  );

  const validLocations = useMemo(
    () => locations.filter((item) =>
      typeof item.lng === "number" &&
      typeof item.lat === "number" &&
      !isNaN(item.lng) && !isNaN(item.lat)
    ),
    [locations]
  );

  const filteredLocations = useMemo(() => {
    let result = validLocations.filter((item) => activeFilters.has(item.type));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) => item.name?.toLowerCase().includes(q));
    }
    return result;
  }, [validLocations, activeFilters, searchQuery]);

  const counts = useMemo(() =>
    validLocations.reduce(
      (acc, item) => { if (acc[item.type] !== undefined) acc[item.type]++; return acc; },
      { city: 0, hotel: 0, restaurant: 0, place: 0 }
    ),
    [validLocations]
  );

  const markerIcons = useMemo(
    () => Object.fromEntries(Object.keys(TYPE_CONFIG).map((t) => [t, createMarkerIcon(t)])),
    []
  );

  const toggleFilter = useCallback((type) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  }, []);

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      borderRadius: 20,
      overflow: "hidden",
      border: "1px solid #E2E8F0",
      boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
      background: "#F8FAFC",
    }}>

      {/* ── Top Bar ── */}
      <div style={{
        background: "white",
        borderBottom: "1px solid #F1F5F9",
        padding: "12px 16px",
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 4 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#0EA5E9,#6366F1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MapPin size={16} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>Explore Map</span>
        </div>

        {/* Search */}
        <div style={{ flex: 1, minWidth: 160, position: "relative" }}>
          <svg width="14" height="14" fill="none" stroke="#CBD5E1" strokeWidth="2.2" viewBox="0 0 24 24"
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search locations…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", paddingLeft: 32, paddingRight: 10, paddingTop: 7, paddingBottom: 7, borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 13, color: "#334155", background: "#F8FAFC", outline: "none", boxSizing: "border-box" }}
            onFocus={(e)  => (e.target.style.borderColor = "#0EA5E9")}
            onBlur={(e)   => (e.target.style.borderColor = "#E2E8F0")}
          />
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
            const active = activeFilters.has(type);
            return (
              <button key={type} onClick={() => toggleFilter(type)} style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 10px", borderRadius: 20, cursor: "pointer",
                border: `1.5px solid ${active ? cfg.color : "#E2E8F0"}`,
                background: active ? cfg.bg : "white",
                color: active ? cfg.color : "#94A3B8",
                fontSize: 12, fontWeight: 600, transition: "all 0.15s",
              }}>
                <TypeIcon type={type} size={13} color={active ? cfg.color : "#CBD5E1"} />
                {cfg.label}
                <span style={{
                  background: active ? cfg.color : "#F1F5F9",
                  color: active ? "white" : "#94A3B8",
                  borderRadius: 10, fontSize: 10, padding: "1px 5px", fontWeight: 700,
                }}>{counts[type]}</span>
              </button>
            );
          })}
        </div>

        {/* Layer switcher */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowLayerMenu((v) => !v)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 11px", borderRadius: 10, border: "1px solid #E2E8F0", background: showLayerMenu ? "#F1F5F9" : "white", color: "#475569", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            <Layers size={14} />
            {TILE_LAYERS[tileKey].label}
          </button>
          {showLayerMenu && (
            <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", background: "white", border: "1px solid #E2E8F0", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 9999, minWidth: 120, overflow: "hidden" }}>
              {Object.entries(TILE_LAYERS).map(([key, tile]) => (
                <button key={key} onClick={() => { setTileKey(key); setShowLayerMenu(false); }} style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "9px 14px", border: "none", cursor: "pointer",
                  background: tileKey === key ? "#F8FAFC" : "white",
                  color: "#334155", fontSize: 13, fontWeight: tileKey === key ? 600 : 400,
                  borderLeft: `3px solid ${tileKey === key ? "#0EA5E9" : "transparent"}`,
                }}>
                  {tile.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Map ── */}
      <div style={{ position: "relative", height: 560 }}>
        <MapContainer
          center={[22.5937, 78.9629]}
          zoom={5}
          style={{ width: "100%", height: "100%" }}
          zoomControl={false}
        >
          <TileLayerSwitcher tileKey={tileKey} />
          <FitBounds locations={validLocations} />

          {filteredLocations.map((item) => (
            <Marker
              key={`${item.type}-${item.id}`}
              position={[item.lat, item.lng]}
              icon={markerIcons[item.type] || markerIcons.place}
              eventHandlers={{ click: () => setSelected(item) }}
            />
          ))}
        </MapContainer>

        {/* Results count */}
        <div style={{
          position: "absolute", top: 12, left: 12, zIndex: 1000,
          background: "white", borderRadius: 20, padding: "5px 12px",
          border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          fontSize: 12, color: "#64748B", fontWeight: 600,
          display: "flex", alignItems: "center", gap: 5, pointerEvents: "none",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
          {filteredLocations.length} location{filteredLocations.length !== 1 ? "s" : ""}
        </div>

        {/* Selected info card */}
        {selected && (
          <div style={{
            position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
            width: "min(340px, calc(100% - 32px))",
            background: "white", borderRadius: 18,
            border: "1px solid #E2E8F0",
            boxShadow: "0 12px 40px rgba(0,0,0,0.14)",
            zIndex: 1000, overflow: "hidden",
          }}>
            <div style={{ height: 4, background: TYPE_CONFIG[selected.type]?.color || "#0EA5E9" }} />
            <div style={{ padding: "14px 16px" }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                  background: TYPE_CONFIG[selected.type]?.bg || "#F0F9FF",
                  border: `1.5px solid ${TYPE_CONFIG[selected.type]?.color || "#0EA5E9"}33`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <TypeIcon type={selected.type} size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.name}</div>
                  <span style={{
                    display: "inline-block", marginTop: 3, fontSize: 11, fontWeight: 600,
                    background: TYPE_CONFIG[selected.type]?.bg,
                    color: TYPE_CONFIG[selected.type]?.color,
                    padding: "2px 8px", borderRadius: 6, textTransform: "capitalize",
                  }}>{selected.type}</span>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, cursor: "pointer", color: "#94A3B8", padding: 5, display: "flex", flexShrink: 0 }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Address */}
              {selected.address && (
                <div style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 10, padding: "8px 10px", background: "#F8FAFC", borderRadius: 10 }}>
                  <MapPin size={13} style={{ color: "#94A3B8", marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "#64748B", lineHeight: 1.5 }}>{selected.address}</span>
                </div>
              )}

              {/* Info chips */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {selected.price > 0 && (
                  <span style={{ fontSize: 11, background: "#F5F3FF", color: "#7C3AED", borderRadius: 8, padding: "3px 9px", fontWeight: 600 }}>₹{selected.price.toLocaleString()}/night</span>
                )}
                {selected.avgCostForOne > 0 && (
                  <span style={{ fontSize: 11, background: "#ECFDF5", color: "#059669", borderRadius: 8, padding: "3px 9px", fontWeight: 600 }}>₹{selected.avgCostForOne} avg/person</span>
                )}
                {selected.entryfees != null && (
                  <span style={{ fontSize: 11, background: "#F0F9FF", color: "#0284C7", borderRadius: 8, padding: "3px 9px", fontWeight: 600 }}>
                    {selected.entryfees === 0 ? "Free entry" : `₹${selected.entryfees} entry`}
                  </span>
                )}
                {selected.category && (
                  <span style={{ fontSize: 11, background: "#FFF7ED", color: "#C2410C", borderRadius: 8, padding: "3px 9px", fontWeight: 600 }}>{selected.category}</span>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setSelected(null)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "8px 0", borderRadius: 10, border: "1px solid #E2E8F0", background: "white", color: "#475569", fontSize: 12, fontWeight: 600, cursor: "pointer", flex: 1 }}
                >
                  <Navigation size={13} /> Close
                </button>
                <button
                  onClick={() => { const p = getDetailPath(selected); if (p) navigate(p); }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "8px 0", borderRadius: 10, border: "none", background: TYPE_CONFIG[selected.type]?.color || "#0EA5E9", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", flex: 2 }}
                >
                  View details →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loadingPlaces && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(248,250,252,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(3px)" }}>
            <div style={{ background: "white", borderRadius: 16, padding: "16px 24px", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: 12, border: "1px solid #E2E8F0" }}>
              <div style={{ width: 18, height: 18, border: "2.5px solid #E2E8F0", borderTopColor: "#0EA5E9", borderRadius: "50%", animation: "tmSpin 0.7s linear infinite" }} />
              <span style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>Loading travel data…</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Legend Footer ── */}
      <div style={{ background: "white", borderTop: "1px solid #F1F5F9", padding: "10px 16px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Legend</span>
        {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
          <div key={type} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: cfg.color }} />
            <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>{cfg.label}</span>
          </div>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#CBD5E1" }}>© OpenStreetMap contributors</span>
      </div>

      <style>{`
        @keyframes tmSpin { to { transform: rotate(360deg); } }
        .leaflet-container { font-family: 'Inter', -apple-system, sans-serif !important; }
        .leaflet-control-zoom {
          border: 1px solid #E2E8F0 !important;
          border-radius: 10px !important;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
          margin-right: 12px !important;
          margin-bottom: 12px !important;
        }
        .leaflet-control-zoom a {
          border-bottom: 1px solid #F1F5F9 !important;
          color: #475569 !important;
          font-size: 16px !important;
        }
        .leaflet-control-zoom a:hover { background: #F8FAFC !important; }
        .leaflet-control-attribution { font-size: 10px !important; }
      `}</style>
    </div>
  );
}
