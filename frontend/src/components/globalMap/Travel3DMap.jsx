import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Hotel,
  Landmark,
  Map as MapIcon,
  MapPin,
  Mountain,
  UtensilsCrossed,
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
  west: 67.5,
  south: 6,
  east: 97.5,
  north: 37.5,
};

const BASEMAPS = [
  {
    id: "outdoor",
    label: "Outdoor 3D",
    mapId: "outdoor-v2",
    icon: Mountain,
  },
  {
    id: "streets",
    label: "Streets",
    mapId: "streets-v2",
    icon: MapIcon,
  },
  {
    id: "hybrid",
    label: "Satellite",
    mapId: "hybrid",
    icon: MapPin,
  },
];

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
  if (item.type === "city" || item.type === "place") {
    return `/city/${item.cityId || item.id}/places`;
  }

  return null;
}

function MarkerIcon({ type }) {
  const className = "h-5 w-5 text-white";

  switch (type) {
    case "hotel":
      return <Hotel className={className} />;
    case "restaurant":
      return <UtensilsCrossed className={className} />;
    case "city":
      return <Landmark className={className} />;
    default:
      return <MapPin className={className} />;
  }
}

export default function Travel3DMap({
  locations = [],
  loadingPlaces = false,
}) {
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const [selected, setSelected] = useState(null);
  const [basemapId, setBasemapId] = useState("outdoor");
  const [buildingSource, setBuildingSource] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(4.8);

  const activeBasemap =
    BASEMAPS.find((item) => item.id === basemapId) || BASEMAPS[0];

  const styleUrl = useMemo(
    () => getStyleUrl(activeBasemap.mapId),
    [activeBasemap]
  );

  const terrainUrl = useMemo(
    () =>
      `https://${MAPTILER_HOST}/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`,
    []
  );

  const indiaLocations = useMemo(() => {
    return locations.filter(
      (item) =>
        typeof item.lng === "number" &&
        typeof item.lat === "number" &&
        item.lng >= INDIA_BOUNDS.west &&
        item.lng <= INDIA_BOUNDS.east &&
        item.lat >= INDIA_BOUNDS.south &&
        item.lat <= INDIA_BOUNDS.north
    );
  }, [locations]);

  const visibleLocations = useMemo(() => {
    if (zoomLevel < 7) {
      return indiaLocations.filter((item) => item.type === "city");
    }

    if (zoomLevel < 10) {
      return indiaLocations.filter(
        (item) => item.type === "city" || item.type === "place"
      );
    }

    return indiaLocations;
  }, [indiaLocations, zoomLevel]);

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection",
      features: visibleLocations.map((item) => ({
        type: "Feature",
        properties: {
          id: item.id,
          name: item.name,
          type: item.type,
        },
        geometry: {
          type: "Point",
          coordinates: [item.lng, item.lat],
        },
      })),
    }),
    [visibleLocations]
  );

  const indiaBoundary = useMemo(
    () => ({
      type: "FeatureCollection",
      features: [
        {
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
        },
      ],
    }),
    []
  );

  const connectionLines = useMemo(() => {
    const features = [];

    for (let i = 0; i < visibleLocations.length; i++) {
      for (let j = i + 1; j < visibleLocations.length; j++) {
        const a = visibleLocations[i];
        const b = visibleLocations[j];

        const distance = Math.sqrt(
          Math.pow(a.lng - b.lng, 2) + Math.pow(a.lat - b.lat, 2)
        );

        if (distance < 4.5) {
          features.push({
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [a.lng, a.lat],
                [b.lng, b.lat],
              ],
            },
          });
        }
      }
    }

    return {
      type: "FeatureCollection",
      features,
    };
  }, [visibleLocations]);

  const counts = useMemo(() => {
    return visibleLocations.reduce(
      (acc, item) => {
        if (acc[item.type] !== undefined) {
          acc[item.type]++;
        }
        return acc;
      },
      {
        city: 0,
        hotel: 0,
        restaurant: 0,
        place: 0,
      }
    );
  }, [visibleLocations]);

  const fitToLocations = useCallback(() => {
    const map = mapRef.current?.getMap?.();
    if (!map || !indiaLocations.length) return;

    const bounds = new maplibregl.LngLatBounds();

    indiaLocations.forEach((item) => {
      bounds.extend([item.lng, item.lat]);
    });

    map.fitBounds(bounds, {
      padding: {
        top: 120,
        bottom: 120,
        left: 80,
        right: 80,
      },
      duration: 1400,
      maxZoom: 12,
    });
  }, [indiaLocations]);

  useEffect(() => {
    const map = mapRef.current?.getMap?.();
    if (!map || !indiaLocations.length) return;
  
    const bounds = new maplibregl.LngLatBounds();
    indiaLocations.forEach((item) => {
      bounds.extend([item.lng, item.lat]);
    });
  
    map.fitBounds(bounds, {
      padding: { top: 120, bottom: 120, left: 80, right: 80 },
      maxZoom: 10,
      duration: 1400,
    });
  }, [indiaLocations]);

  const showBuildings =
    activeBasemap.mapId === "outdoor-v2" ||
    activeBasemap.mapId === "streets-v2";

  if (!MAPTILER_KEY) {
    return (
      <div className="flex h-[720px] items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-center text-zinc-300">
        Add
        <code className="mx-2 rounded bg-zinc-800 px-2 py-1">
          VITE_MAPTILER_API_KEY
        </code>
        inside your .env file
      </div>
    );
  }

  return (
    <div className="relative h-[720px] overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_0_80px_rgba(14,165,233,0.08)]">
      <div className="absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />

      <div className="absolute right-4 top-4 z-20 flex gap-2 rounded-2xl border border-white/10 bg-black/60 p-2 backdrop-blur-xl">
        {BASEMAPS.map((mapItem) => {
          const Icon = mapItem.icon;
          const active = basemapId === mapItem.id;

          return (
            <button
              key={mapItem.id}
              onClick={() => setBasemapId(mapItem.id)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                active
                  ? "bg-cyan-500 text-white shadow-[0_0_20px_rgba(34,211,238,0.45)]"
                  : "text-zinc-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {mapItem.label}
            </button>
          );
        })}
      </div>

      <div className="absolute bottom-4 left-4 z-20 rounded-3xl border border-white/10 bg-black/60 px-5 py-4 text-white backdrop-blur-xl">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">
          India Overview
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-10">
            <span className="text-zinc-300">Cities</span>
            <span className="font-semibold text-amber-400">{counts.city}</span>
          </div>

          <div className="flex items-center justify-between gap-10">
            <span className="text-zinc-300">Hotels</span>
            <span className="font-semibold text-violet-400">{counts.hotel}</span>
          </div>

          <div className="flex items-center justify-between gap-10">
            <span className="text-zinc-300">Restaurants</span>
            <span className="font-semibold text-emerald-400">{counts.restaurant}</span>
          </div>

          <div className="flex items-center justify-between gap-10">
            <span className="text-zinc-300">Places</span>
            <span className="font-semibold text-sky-400">{counts.place}</span>
          </div>
        </div>
      </div>

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
          zoom: 5,
          pitch: 90,
          bearing: -20,
        }}
        onZoom={(e) => {
          setZoomLevel(e.viewState.zoom);
        }}
        maxBounds={[
          [INDIA_BOUNDS.west, INDIA_BOUNDS.south],
          [INDIA_BOUNDS.east, INDIA_BOUNDS.north],
        ]}
        minZoom={4}
        maxZoom={18}
        maxPitch={180}
        terrain={{
          source: "terrain-source",
          exaggeration: 1.45,
        }}
        onLoad={(e) => {
          setMapError(null);

          const sources = e.target.getStyle()?.sources || {};

          if (sources.openmaptiles) {
            setBuildingSource("openmaptiles");
          } else if (sources.maptiler_planet) {
            setBuildingSource("maptiler_planet");
          } else {
            setBuildingSource(null);
          }
        }}
        onError={(e) => {
          setMapError(e?.error?.message || "Unable to load map");
        }}
      >
        <NavigationControl position="top-left" />
        <ScaleControl position="bottom-right" />

        <Source
          id="terrain-source"
          type="raster-dem"
          url={terrainUrl}
          tileSize={256}
        />

        <Source id="india-boundary" type="geojson" data={indiaBoundary}>
          <Layer
            id="india-fill"
            type="fill"
            paint={{
              "fill-color": "#0ea5e9",
              "fill-opacity": 0.04,
            }}
          />

          <Layer
            id="india-glow-outer"
            type="line"
            paint={{
              "line-color": "#22d3ee",
              "line-width": 22,
              "line-opacity": 0.08,
              "line-blur": 10,
            }}
          />

          <Layer
            id="india-glow-inner"
            type="line"
            paint={{
              "line-color": "#67e8f9",
              "line-width": 10,
              "line-opacity": 0.18,
              "line-blur": 4,
            }}
          />

          <Layer
            id="india-border"
            type="line"
            paint={{
              "line-color": "#a5f3fc",
              "line-width": 2.5,
              "line-opacity": 0.95,
            }}
          />
        </Source>

        {zoomLevel >= 7 && (
          <Source
            id="connection-lines-source"
            type="geojson"
            data={connectionLines}
          >
            <Layer
              id="connection-line-glow"
              type="line"
              paint={{
                "line-color": "#22d3ee",
                "line-width": 10,
                "line-opacity": 0.12,
                "line-blur": 5,
              }}
            />

            <Layer
              id="connection-line"
              type="line"
              paint={{
                "line-color": "#67e8f9",
                "line-width": 2,
                "line-opacity": 0.75,
                "line-dasharray": [2, 2],
              }}
            />
          </Source>
        )}

        <Source id="places-source" type="geojson" data={geojson}>
          <Layer
            id="places-glow"
            type="circle"
            paint={{
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                4,
                10,
                10,
                24,
                14,
                34,
              ],
              "circle-color": [
                "match",
                ["get", "type"],
                "hotel",
                "#8b5cf6",
                "restaurant",
                "#10b981",
                "city",
                "#f59e0b",
                "#0ea5e9",
              ],
              "circle-opacity": 0.18,
              "circle-blur": 1.6,
            }}
          />
        </Source>

        {showBuildings && buildingSource && (
          <Layer
            id="3d-buildings"
            type="fill-extrusion"
            source={buildingSource}
            source-layer="building"
            minzoom={13}
            paint={{
              "fill-extrusion-color": "#a1a1aa",
              "fill-extrusion-height": [
                "coalesce",
                ["get", "render_height"],
                ["get", "height"],
                20,
              ],
              "fill-extrusion-base": [
                "coalesce",
                ["get", "render_min_height"],
                ["get", "min_height"],
                0,
              ],
              "fill-extrusion-opacity": 0.72,
            }}
          />
        )}

        {visibleLocations.map((item) => (
          <Marker
            key={`${item.type}-${item.id}`}
            longitude={item.lng}
            latitude={item.lat}
            anchor="bottom"
            // onClick={(e) => {
            //   e.originalEvent.stopPropagation();
            //   setSelected(item);
            // }}
          >
            <div className="group relative cursor-pointer">
              <div className="absolute inset-0 animate-ping rounded-full bg-cyan-400/25 blur-xl" />

              <div className="absolute -inset-2 rounded-full border border-cyan-400/20 opacity-0 transition-all duration-300 group-hover:scale-125 group-hover:opacity-100" />

              <div
                className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 shadow-[0_0_30px_rgba(34,211,238,0.45)] transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-125 ${
                  item.type === "hotel"
                    ? "bg-gradient-to-br from-violet-500 to-fuchsia-600"
                    : item.type === "restaurant"
                    ? "bg-gradient-to-br from-emerald-500 to-green-700"
                    : item.type === "city"
                    ? "bg-gradient-to-br from-amber-400 to-orange-600"
                    : "bg-gradient-to-br from-sky-500 to-cyan-700"
                }`}
              >
                <MarkerIcon type={item.type} />
              </div>

              <div className="absolute left-1/2 top-14 hidden -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-black/80 px-3 py-1 text-xs font-medium text-white shadow-xl backdrop-blur-md group-hover:block">
                {item.name}
              </div>
            </div>
          </Marker>
        ))}

        {selected && (
          <Popup
            longitude={selected.lng}
            latitude={selected.lat}
            anchor="top"
            offset={22}
            closeOnClick={false}
            onClose={() => setSelected(null)}
            className="travel-popup"
          >
            <div className="min-w-[250px] rounded-2xl border border-white/10 bg-zinc-950/95 p-4 text-white shadow-2xl backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    selected.type === "hotel"
                      ? "bg-violet-600"
                      : selected.type === "restaurant"
                      ? "bg-emerald-600"
                      : selected.type === "city"
                      ? "bg-amber-500"
                      : "bg-sky-600"
                  }`}
                >
                  <MarkerIcon type={selected.type} />
                </div>

                <div className="flex-1">
                  <h3 className="text-base font-semibold">{selected.name}</h3>

                  <p className="mt-1 text-xs uppercase tracking-[0.25em] text-cyan-400">
                    {selected.type}
                  </p>
                </div>
              </div>

              {selected.address && (
                <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                  {selected.address}
                </p>
              )}

              <button
                onClick={() => {
                  const path = getDetailPath(selected);
                  if (path) navigate(path);
                }}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(34,211,238,0.45)]"
              >
                View Details
              </button>
            </div>
          </Popup>
        )}
      </Map>

      {loadingPlaces && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="rounded-2xl border border-cyan-400/20 bg-zinc-950/90 px-6 py-4 text-white shadow-[0_0_30px_rgba(34,211,238,0.2)]">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
              <span className="text-sm font-medium">
                Loading India travel data...
              </span>
            </div>
          </div>
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 p-6 backdrop-blur-md">
          <div className="max-w-lg rounded-3xl border border-red-500/20 bg-zinc-950 p-6 text-white shadow-2xl">
            <h2 className="mb-2 text-xl font-semibold text-red-400">
              Map failed to load
            </h2>

            <p className="mb-4 text-sm text-red-300">{mapError}</p>

            <p className="text-sm text-zinc-400">
              Check your MapTiler API key and make sure localhost is added in
              allowed domains.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

