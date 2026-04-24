import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNearbyPlaces } from "../../features/user/placeSlice";
import PlaceHeader from "../../components/Place/PlaceHeader";
import PlaceFilters from "../../components/Place/PlaceFilters";
import PlaceSummary from "../../components/Place/PlaceSummary";
import PlaceList from "../../components/Place/PlaceList";
import PlaceMap from "../../components/Place/PlaceMap";
import EmptyState from "../../components/Place/EmptyState";
import LoadingSkeleton from "../../components/Place/LoadingSkeleton";

import { useSearchParams } from "react-router-dom";

const DEFAULT_DISTANCE = 25000;

const PlacePage = ({ cityId }) => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const cityParam = searchParams.get("city");

  const {
    nearbyPlaces = [],
    loading,
    error,
  } = useSelector((state) => state.place);

  const searchPlaces = useSelector((state) => state.search?.places || []);

  const [coords, setCoords] = useState(null);
  const [distance, setDistance] = useState(DEFAULT_DISTANCE);
  const [category, setCategory] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState(null);
  const [cityName, setCityName] = useState(cityParam || "Discover Nearby");
  const [searchQuery, setSearchQuery] = useState("");

  const displayedPlaces = cityParam && searchPlaces.length > 0 ? searchPlaces : nearbyPlaces;

  // NEW: track geolocation state separately from API loading
  const [locationStatus, setLocationStatus] = useState("idle"); // "idle" | "loading" | "error" | "denied"

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }

    setLocationStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCoords(nextCoords);
        setLocationStatus("idle");
      },
      (err) => {
        // FIX: was silently swallowing errors before
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus("denied");
        } else {
          setLocationStatus("error");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  };

  useEffect(() => {
    requestUserLocation();
  }, []);

  useEffect(() => {
    if (!coords) return;

    dispatch(
      fetchNearbyPlaces({
        lat: coords.lat,
        lng: coords.lng,
        cityId,
        distance,
        category,
      }),
    );
  }, [coords, distance, category, cityId, dispatch]);

  useEffect(() => {
    if (!coords || !window.google?.maps?.Geocoder) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: coords }, (results, status) => {
      if (status !== "OK" || !results?.length) return;

      const locality = results[0].address_components?.find((c) =>
        c.types.includes("locality"),
      );
      const adminArea = results[0].address_components?.find((c) =>
        c.types.includes("administrative_area_level_1"),
      );

      setCityName(
        locality?.long_name || adminArea?.long_name || "Nearby Places",
      );
    });
  }, [coords]);

  // NEW: scroll to map on mobile when a card is selected
  const handleSelectPlace = (id) => {
    setSelectedPlaceId(id);
    if (window.innerWidth < 1024) {
      document
        .getElementById("place-map-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const filteredPlaces = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return displayedPlaces;

    return displayedPlaces.filter((place) => {
      const name = place?.name?.toLowerCase() || "";
      const placeCategory = (
        typeof place?.category === "string"
          ? place.category
          : place?.category?.name || ""
      ).toLowerCase();
      return (
        name.includes(normalizedQuery) ||
        placeCategory.includes(normalizedQuery)
      );
    });
  }, [displayedPlaces, searchQuery]);

  // Derive empty state context for EmptyState component
  const emptyStateReason = useMemo(() => {
    if (locationStatus === "denied") return "denied";
    if (locationStatus === "error") return "error";
    if (!coords) return "no-location";
    if (searchQuery.trim()) return "search";
    return "no-results";
  }, [locationStatus, coords, searchQuery]);

  return (
    <section className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-[1440px] grid-cols-1 gap-4 p-3 md:p-4 lg:grid-cols-12">
      <aside className="order-2 flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md lg:order-1 lg:col-span-5">
        <div className="space-y-4 border-b border-gray-100 p-4">
          <PlaceHeader
            cityName={cityName}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onUseLocation={requestUserLocation}
            locationStatus={locationStatus}
          />
          <PlaceFilters
            distance={distance}
            category={category}
            onDistanceChange={setDistance}
            onCategoryChange={setCategory}
          />
          {/* FIX: hide summary during loading so it doesn't show "0 places" */}
          {!loading && coords && (
            <PlaceSummary count={filteredPlaces.length} distance={distance} />
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : filteredPlaces.length === 0 ? (
            <EmptyState
              reason={emptyStateReason}
              onRetry={requestUserLocation}
            />
          ) : (
            <PlaceList
              places={filteredPlaces}
              selectedPlaceId={selectedPlaceId}
              hoveredPlaceId={hoveredPlaceId}
              onSelect={handleSelectPlace}
              onHover={setHoveredPlaceId}
            />
          )}
        </div>
      </aside>

      {/* NEW: id for mobile scroll-to-map */}
      <div
        id="place-map-section"
        className="order-1 h-[320px] overflow-hidden rounded-2xl bg-white shadow-md sm:h-[360px] md:h-[420px] lg:order-2 lg:col-span-7 lg:h-full"
      >
        <PlaceMap
          center={coords}
          places={filteredPlaces}
          selectedPlaceId={selectedPlaceId}
          hoveredPlaceId={hoveredPlaceId}
          onSelectPlace={handleSelectPlace}
          distance={distance}
        />
      </div>
    </section>
  );
};

export default PlacePage;
