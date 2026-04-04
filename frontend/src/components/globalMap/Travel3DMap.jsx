import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Hotel,
  Landmark,
  Map as MapIcon,
  MapPin,
  Mountain,
  UtensilsCrossed,
  Locate,
  X,
} from "lucide-react";
import maplibregl from "maplibre-gl";
import Map, {
  Layer,
  Marker,
  NavigationControl,
  Popup,
  ScaleControl,
  Source,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY || "";
const MAPTILER_HOST = "api.maptiler.com";

const INDIA_BOUNDS = {
  west: 68,
  south: 8,
  east: 88.5,
  north: 35.5,
};

const BASEMAPS = [
  { id: "outdoor", label: "Outdoor", mapId: "outdoor-v2", icon: Mountain },
  { id: "streets", label: "Streets", mapId: "streets-v2", icon: MapIcon },
  { id: "hybrid", label: "Satellite", mapId: "hybrid", icon: MapPin },
];

const TYPE_CONFIG = {
  hotel:      { color: "#a855f7", gradient: "from-violet-500 to-fuchsia-600", label: "Hotels",      counter: "text-violet-400" },
  restaurant: { color: "#10b981", gradient: "from-emerald-500 to-teal-600",   label: "Restaurants", counter: "text-emerald-400" },
  city:       { color: "#f59e0b", gradient: "from-amber-400 to-orange-500",   label: "Cities",      counter: "text-amber-400"   },
  place:      { color: "#0ea5e9", gradient: "from-sky-500 to-cyan-600",       label: "Places",      counter: "text-sky-400"     },
};

function shouldUseProxy() {
  if (typeof window === "undefined") return false;
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

function transformRequest(url) {
  if (!shouldUseProxy()) return { url };
  try {
    const parsed = new URL(
      url.startsWith("//") ? `https:${url}` : url,
      window.location.origin
    );
    if (parsed.hostname === MAPTILER_HOST) {
      return {
        url: `${window.location.origin}/maptiler-cloud${parsed.pathname}${parsed.search}`,
      };
    }
  } catch (err) {
    console.error("Map transform error:", err);
  }
  return { url };
}

function getStyleUrl(mapId) {
  return `https://${MAPTILER_HOST}/maps/${mapId}/style.json?key=${MAPTILER_KEY}`;
}

function getDetailPath(item) {
  if (!item?.id) return null;
  if (item.type === "hotel") return `/hotels/${item.id}`;
  if (item.type === "restaurant") return `/restaurant/${item.id}`;
  if (item.type === "city" || item.type === "place")
    return `/city/${item.cityId || item.id}/places`;
  return null;
}

function MarkerIcon({ type }) {
  const className = "h-4 w-4 text-white drop-shadow";
  switch (type) {
    case "hotel":      return <Hotel className={className} />;
    case "restaurant": return <UtensilsCrossed className={className} />;
    case "city":       return <Landmark className={className} />;
    default:           return <MapPin className={className} />;
  }
}

function PulseRing({ active }) {
  if (!active) return null;
  return (
    <span className="absolute inset-0 animate-ping rounded-2xl bg-white/30 blur-sm" />
  );
}

export default function Travel3DMap({ locations = [], loadingPlaces = false }) {
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const [selected, setSelected]       = useState(null);
  const [basemapId, setBasemapId]     = useState("outdoor");
  const [buildingSource, setBuildingSource] = useState(null);
  const [mapError, setMapError]       = useState(null);
  const [zoomLevel, setZoomLevel]     = useState(5);
  const [mapLoaded, setMapLoaded]     = useState(false);

  const activeBasemap = BASEMAPS.find((b) => b.id === basemapId) || BASEMAPS[0];
  const styleUrl      = useMemo(() => getStyleUrl(activeBasemap.mapId), [activeBasemap]);
  const terrainUrl    = useMemo(
    () => `https://${MAPTILER_HOST}/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`,
    []
  );

  const indiaLocations = useMemo(
    () =>
      locations.filter(
        (item) =>
          typeof item.lng === "number" &&
          typeof item.lat === "number" &&
          item.lng >= INDIA_BOUNDS.west &&
          item.lng <= INDIA_BOUNDS.east &&
          item.lat >= INDIA_BOUNDS.south &&
          item.lat <= INDIA_BOUNDS.north
      ),
    [locations]
  );

  const visibleLocations = useMemo(() => {
    if (zoomLevel < 7)  return indiaLocations.filter((i) => i.type === "city");
    if (zoomLevel < 5) return indiaLocations.filter((i) => i.type === "city" || i.type === "place");
    return indiaLocations;
  }, [indiaLocations, zoomLevel]);

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection",
      features: visibleLocations.map((item) => ({
        type: "Feature",
        properties: { id: item.id, name: item.name, type: item.type },
        geometry: { type: "Point", coordinates: [item.lng, item.lat] },
      })),
    }),
    [visibleLocations]
  );

  const indiaBoundary = useMemo(
    () => ({
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [INDIA_BOUNDS.west, INDIA_BOUNDS.south],
            [INDIA_BOUNDS.east, INDIA_BOUNDS.south],
            [INDIA_BOUNDS.east, INDIA_BOUNDS.north],
            [INDIA_BOUNDS.west, INDIA_BOUNDS.north],
            [INDIA_BOUNDS.west, INDIA_BOUNDS.south],
          ]],
        },
      }],
    }),
    []
  );

  const connectionLines = useMemo(() => {
    const features = [];
    const MAX_DIST = 4.5;
    for (let i = 0; i < visibleLocations.length; i++) {
      for (let j = i + 1; j < visibleLocations.length; j++) {
        const a = visibleLocations[i], b = visibleLocations[j];
        const dx = a.lng - b.lng, dy = a.lat - b.lat;
        if (dx * dx + dy * dy < MAX_DIST * MAX_DIST) {
          features.push({
            type: "Feature",
            geometry: { type: "LineString", coordinates: [[a.lng, a.lat], [b.lng, b.lat]] },
          });
        }
      }
    }
    return { type: "FeatureCollection", features };
  }, [visibleLocations]);

  const counts = useMemo(
    () =>
      visibleLocations.reduce(
        (acc, item) => { if (acc[item.type] !== undefined) acc[item.type]++; return acc; },
        { city: 0, hotel: 0, restaurant: 0, place: 0 }
      ),
    [visibleLocations]
  );

  useEffect(() => {
    if (!mapLoaded) return;
    const map = mapRef.current?.getMap?.();
    if (!map || !indiaLocations.length) return;
    const bounds = new maplibregl.LngLatBounds();
    indiaLocations.forEach((item) => bounds.extend([item.lng, item.lat]));
    map.fitBounds(bounds, {
      padding: { top: 120, bottom: 120, left: 80, right: 80 },
      maxZoom: 10,
      duration: 1400,
    });
  }, [indiaLocations, mapLoaded]);

  const fitToLocations = useCallback(() => {
    const map = mapRef.current?.getMap?.();
    if (!map || !indiaLocations.length) return;
    const bounds = new maplibregl.LngLatBounds();
    indiaLocations.forEach((item) => bounds.extend([item.lng, item.lat]));
    map.fitBounds(bounds, {
      padding: { top: 120, bottom: 120, left: 80, right: 80 },
      duration: 1400,
      maxZoom: 12,
    });
  }, [indiaLocations]);

  const showBuildings =
    (activeBasemap.mapId === "outdoor-v2" || activeBasemap.mapId === "streets-v2") &&
    !!buildingSource;

  if (!MAPTILER_KEY) {
    return (
      <div className="flex h-180 items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-center text-zinc-300">
        Add <code className="mx-2 rounded bg-zinc-800 px-2 py-1">VITE_MAPTILER_API_KEY</code> to your .env file
      </div>
    );
  }

  return (
    <div className="relative h-155 overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_0_80px_rgba(14,165,233,0.12)]">

      {/* Top vignette */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-linear-to-b from-black/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-linear-to-t from-black/40 to-transparent" />

      {/* Title */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
        <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-black/70 px-4 py-2.5 backdrop-blur-xl">
          <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <span className="text-sm font-semibold tracking-wide text-white">India Travel Map</span>
        </div>
      </div>

      {/* Basemap switcher */}
      <div className="absolute right-4 top-4 z-20 flex gap-1.5 rounded-2xl border border-white/10 bg-black/70 p-1.5 backdrop-blur-xl">
        {BASEMAPS.map((bm) => {
          const Icon   = bm.icon;
          const active = basemapId === bm.id;
          return (
            <button
              key={bm.id}
              onClick={() => setBasemapId(bm.id)}
              title={bm.label}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold tracking-wide transition-all duration-200 ${
                active
                  ? "bg-cyan-500 text-white shadow-[0_0_16px_rgba(34,211,238,0.5)]"
                  : "text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {bm.label}
            </button>
          );
        })}
      </div>

      {/* Fit button */}
      {indiaLocations.length > 0 && (
        <button
          onClick={fitToLocations}
          title="Fit to all locations"
          className="absolute right-4 top-18 z-20 flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-xs font-semibold text-zinc-300 backdrop-blur-xl transition-all hover:bg-white/10 hover:text-white"
        >
          <Locate className="h-3.5 w-3.5" />
          Fit All
        </button>
      )}

      {/* Legend */}
      <div className="absolute bottom-8 left-4 z-20 rounded-2xl border border-white/10 bg-black/70 px-4 py-4 backdrop-blur-xl">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400">
          Overview
        </p>
        <div className="space-y-2.5">
          {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
            <div key={type} className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }}
                />
                <span className="text-xs text-zinc-300">{cfg.label}</span>
              </div>
              <span className={`text-xs font-bold tabular-nums ${cfg.counter}`}>
                {counts[type] ?? 0}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 border-t border-white/10 pt-3">
          <div className="flex items-center justify-between gap-8">
            <span className="text-xs text-zinc-400">Total</span>
            <span className="text-xs font-bold text-white tabular-nums">
              {visibleLocations.length}
            </span>
          </div>
        </div>
      </div>

      {/* Zoom hint */}
      {zoomLevel < 2 && indiaLocations.some((i) => i.type !== "city") && (
        <div className="absolute bottom-8 right-4 z-20 rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-[11px] text-zinc-400 backdrop-blur-xl">
          Zoom in to reveal hotels & restaurants
        </div>
      )}

      {/* Map */}
      <Map
        ref={mapRef}
        mapLib={maplibregl}
        mapStyle={styleUrl}
        transformRequest={transformRequest}
        styleDiffing={false}
        style={{ width: "100%", height: "100%" }}
        initialViewState={{
          longitude: 78.9629,
          latitude: 22.5937,
          zoom: 50,
          pitch: 55,
          bearing: -15,
        }}
        onZoom={(e) => setZoomLevel(e.viewState.zoom)}
        maxBounds={[
          [INDIA_BOUNDS.west - 2, INDIA_BOUNDS.south - 2],
          [INDIA_BOUNDS.east + 2, INDIA_BOUNDS.north + 2],
        ]}
        minZoom={4}
        maxZoom={18}
        maxPitch={85}
        terrain={{ source: "terrain-source", exaggeration: 1.4 }}
        onLoad={(e) => {
          setMapError(null);
          setMapLoaded(true);
          const sources = e.target.getStyle()?.sources || {};
          if (sources.openmaptiles) setBuildingSource("openmaptiles");
          else if (sources.maptiler_planet) setBuildingSource("maptiler_planet");
          else setBuildingSource(null);
        }}
        onError={(e) => setMapError(e?.error?.message || "Unable to load map")}
        onClick={() => setSelected(null)}
      >
        <NavigationControl position="top-left" style={{ top: 52 }} />
        <ScaleControl position="bottom-right" />
        <Source id="terrain-source" type="raster-dem" url={terrainUrl} tileSize={256} />

        {/* India boundary */}
        <Source id="india-boundary" type="geojson" data={indiaBoundary}>
          <Layer id="india-fill"       type="fill" paint={{ "fill-color": "#0ea5e9", "fill-opacity": 0.1 }} />
          <Layer id="india-glow-outer" type="line" paint={{ "line-color": "#22d3ee", "line-width": 6, "line-opacity": 1, "line-blur": 10 }} />
          <Layer id="india-glow-inner" type="line" paint={{ "line-color": "#67e8f9", "line-width": 8,  "line-opacity": 1, "line-blur": 3  }} />
          <Layer id="india-border"     type="line" paint={{ "line-color": "#a5f3fc", "line-width": 2,  "line-opacity": 1 }} />
        </Source>

        {/* Connections */}
        {zoomLevel >= 7 && (
          <Source id="connection-lines-source" type="geojson" data={connectionLines}>
            <Layer id="connection-line-glow" type="line" paint={{ "line-color": "#22d3ee", "line-width": 8, "line-opacity": 1, "line-blur": 4 }} />
            <Layer id="connection-line" type="line" paint={{ "line-color": "#67e8f9", "line-width": 1.5, "line-opacity": 1, "line-dasharray": [3, 3] }} />
          </Source>
        )}

        {/* Glow halos */}
        <Source id="places-source" type="geojson" data={geojson}>
          <Layer
            id="places-glow"
            type="circle"
            paint={{
              "circle-radius":  ["interpolate", ["linear"], ["zoom"], 4, 12, 10, 28, 14, 38],
              "circle-color":   ["match", ["get", "type"], "hotel", "#8b5cf6", "restaurant", "#10b981", "city", "#f59e0b", "#0ea5e9"],
              "circle-opacity": 1,
              "circle-blur":    1,
            }}
          />
        </Source>

        {/* 3D buildings */}
        {showBuildings && (
          <Layer
            id="3d-buildings"
            type="fill-extrusion"
            source={buildingSource}
            source-layer="building"
            minzoom={13}
            paint={{
              "fill-extrusion-color":   "#6366f1",
              "fill-extrusion-height":  ["coalesce", ["get", "render_height"], ["get", "height"], 10],
              "fill-extrusion-base":    ["coalesce", ["get", "render_min_height"], ["get", "min_height"], 0],
              "fill-extrusion-opacity": 0.1,
            }}
          />
        )}

        {/* Markers */}
        {visibleLocations.map((item) => {
          const cfg      = TYPE_CONFIG[item.type] || TYPE_CONFIG.place;
          const isActive = selected?.id === item.id && selected?.type === item.type;
          return (
            <Marker
              key={`${item.type}-${item.id}`}
              longitude={item.lng}
              latitude={item.lat}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelected(isActive ? null : item);
              }}
            >
              <div className="group relative cursor-pointer">
                {isActive && (
                  <span className={`absolute inset-0 animate-ping rounded-2xl bg-linear-to-br ${cfg.gradient} opacity-40`} />
                )}
                <div className="absolute -inset-2 rounded-full border border-white/20 opacity-0 transition-all duration-300 group-hover:scale-110 group-hover:opacity-100" />
                <div
                  className={`relative flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-200 group-hover:-translate-y-0.5 group-hover:scale-110 ${
                    isActive ? "scale-115 border-white/60 shadow-[0_0_24px_rgba(255,255,255,0.3)]" : "border-white/30 shadow-lg"
                  } bg-linear-to-br ${cfg.gradient}`}
                  style={{ boxShadow: isActive ? `0 0 24px ${cfg.color}80` : undefined }}
                >
                  <MarkerIcon type={item.type} />
                </div>
                <div className="pointer-events-none absolute left-1/2 top-12 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-black/90 px-2.5 py-1 text-[11px] font-medium text-white shadow-xl backdrop-blur-md group-hover:block">
                  {item.name}
                </div>
              </div>
            </Marker>
          );
        })}

        {/* Popup */}
        {selected && (
          <Popup
            longitude={selected.lng}
            latitude={selected.lat}
            anchor="top"
            offset={20}
            closeOnClick={false}
            onClose={() => setSelected(null)}
            maxWidth="280px"
            className="travel-popup"
          >
            <div className="relative min-w-60 rounded-2xl border border-white/10 bg-zinc-950/95 p-4 text-white shadow-2xl">
              <button
                onClick={() => setSelected(null)}
                className="absolute right-3 top-3 rounded-lg p-1 text-zinc-500 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="flex items-center gap-3 pr-6">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${TYPE_CONFIG[selected.type]?.gradient || "from-sky-500 to-cyan-600"}`}
                  style={{ boxShadow: `0 0 16px ${TYPE_CONFIG[selected.type]?.color || "#0ea5e9"}60` }}
                >
                  <MarkerIcon type={selected.type} />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">{selected.name}</h3>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-cyan-400">
                    {selected.type}
                  </p>
                </div>
              </div>
              {selected.address && (
                <p className="mt-3 text-xs leading-relaxed text-zinc-400">{selected.address}</p>
              )}
              <button
                onClick={() => {
                  const path = getDetailPath(selected);
                  if (path) navigate(path);
                }}
                className="mt-4 w-full rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-all duration-200 hover:opacity-90 hover:shadow-[0_0_16px_rgba(34,211,238,0.4)]"
              >
                View Details →
              </button>
            </div>
          </Popup>
        )}
      </Map>

      {/* Loading overlay */}
      {loadingPlaces && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-2xl border border-cyan-400/20 bg-zinc-950/90 px-6 py-4 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            <span className="text-sm font-medium text-white">Loading India travel data…</span>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {mapError && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 p-6 backdrop-blur-md">
          <div className="max-w-sm rounded-3xl border border-red-500/20 bg-zinc-950 p-6 text-white shadow-2xl">
            <h2 className="mb-2 text-lg font-semibold text-red-400">Map failed to load</h2>
            <p className="mb-3 text-xs text-red-300">{mapError}</p>
            <p className="text-xs text-zinc-500">
              Check your MapTiler API key and ensure localhost is in the allowed domains.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}