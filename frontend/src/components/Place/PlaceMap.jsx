import React, { useMemo } from "react";
import {
  GoogleMap,
  Marker,
  Circle,
  useJsApiLoader,
} from "@react-google-maps/api";

const mapContainerStyle = { width: "100%", height: "100%" };
const defaultCenter = { lat: 20.5937, lng: 78.9629 };

// Map style — subtle grey so place markers pop
const mapStyles = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
];

const getPlaceLatLng = (place) => {
  const lat = Number(place?.latitude);
  const lng = Number(place?.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };

  // Backend: location: { type: "Point", coordinates: [lng, lat] }
  const coordinates = place?.location?.coordinates;
  if (Array.isArray(coordinates) && coordinates.length === 2) {
    const lngNum = Number(coordinates[0]);
    const latNum = Number(coordinates[1]);
    if (Number.isFinite(latNum) && Number.isFinite(lngNum))
      return { lat: latNum, lng: lngNum };
  }

  return null;
};

const PlaceMap = ({
  center,
  places,
  selectedPlaceId,
  hoveredPlaceId,
  onSelectPlace,
  distance,
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey || "",
    id: "place-discovery-map",
  });

  const mapCenter = center || defaultCenter;

  const selectedPlace = useMemo(
    () =>
      places.find((p) => (p._id || p.id) === selectedPlaceId) ||
      places.find((p) => (p._id || p.id) === hoveredPlaceId),
    [hoveredPlaceId, places, selectedPlaceId],
  );

  if (!apiKey) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 p-6 text-center text-sm text-gray-500">
        Add{" "}
        <code className="mx-1 rounded bg-gray-100 px-1 font-mono text-xs">
          VITE_GOOGLE_MAPS_API_KEY
        </code>{" "}
        to show live Google Maps.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 text-sm text-gray-500">
        Loading map...
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={
        selectedPlace ? getPlaceLatLng(selectedPlace) || mapCenter : mapCenter
      }
      zoom={selectedPlace ? 14 : 12}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        styles: mapStyles,
        // NEW: cleaner controls placement
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_BOTTOM,
        },
      }}
    >
      {/* NEW: User's current location marker */}
      {center && (
        <Marker
          position={center}
          title="You are here"
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#4f46e5",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          }}
          zIndex={999}
        />
      )}

      {/* NEW: Radius circle showing the search boundary */}
      {center && distance && (
        <Circle
          center={center}
          radius={distance}
          options={{
            fillColor: "#4f46e5",
            fillOpacity: 0.05,
            strokeColor: "#4f46e5",
            strokeOpacity: 0.25,
            strokeWeight: 1.5,
          }}
        />
      )}

      {/* Place markers */}
      {places.map((place, index) => {
        const id =
          place._id || place.id || `${place?.name ?? "place"}-${index}`;
        const active = id === selectedPlaceId || id === hoveredPlaceId;
        const markerPos = getPlaceLatLng(place);

        if (!markerPos) return null;

        return (
          <Marker
            key={id}
            position={markerPos}
            title={place.name}
            onClick={() => onSelectPlace(id)}
            // NEW: active markers are bigger and use a different colour
            icon={
              active
                ? {
                    url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                    scaledSize: new window.google.maps.Size(44, 44),
                  }
                : {
                    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                    scaledSize: new window.google.maps.Size(32, 32),
                  }
            }
            zIndex={active ? 100 : 1}
          />
        );
      })}
    </GoogleMap>
  );
};

export default PlaceMap;
