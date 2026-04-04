import React, { useEffect, useMemo, useState } from "react";
import Travel3DMap from "./Travel3DMap";
import { useDispatch, useSelector } from "react-redux";
import { getActiveCities } from "../../features/user/citySlice";
import { getPublicActiveHotels } from "../../features/user/hotelSlice";
import { getAllRestaurantsForUser } from "../../features/user/restaurantSlice";
import apiClient from "../../pages/services/apiClient";

function asArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

function GlobalMap() {
  const dispatch = useDispatch();
  const [poiPlaces, setPoiPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);

  const { cities = [] } = useSelector((state) => state.city);
  const { restaurants = [] } = useSelector((state) => state.restaurant);
  const { hotels: hotelsRaw } = useSelector((state) => state.hotel);
  const hotels = asArray(hotelsRaw);

  useEffect(() => {
    dispatch(getActiveCities());
    dispatch(getPublicActiveHotels());
    dispatch(getAllRestaurantsForUser());
  }, [dispatch]);

  useEffect(() => {
    if (!cities.length) {
      setPoiPlaces([]);
      setPlacesLoading(false);
      return;
    }

    let cancelled = false;
    setPlacesLoading(true);

    (async () => {
      try {
        const perCity = await Promise.all(
          cities.map(async (city) => {
            try {
              const res = await apiClient.get(
                `/api/places?cityId=${city._id}`,
              );
              return asArray(res);
            } catch {
              return [];
            }
          }),
        );
        if (cancelled) return;

        const merged = perCity.flat();
        const seen = new Set();
        const unique = merged.filter((p) => {
          if (!p?._id || seen.has(String(p._id))) return false;
          seen.add(String(p._id));
          return true;
        });
        setPoiPlaces(unique);
      } finally {
        if (!cancelled) setPlacesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cities]);

  const locations = useMemo(() => {
    const cityLocations = cities
      .filter(
        (city) =>
          city?.location?.coordinates &&
          city.location.coordinates.length === 2,
      )
      .map((city) => ({
        id: city._id,
        name: city.name,
        type: "city",
        lat: city.location.coordinates[1],
        lng: city.location.coordinates[0],
        address: city.address || city.state || "",
        image: city.images?.[0] || "",
        cityId: city._id,
      }));

    const hotelLocations = hotels
      .filter(
        (hotel) =>
          hotel?.location?.coordinates &&
          hotel.location.coordinates.length === 2,
      )
      .map((hotel) => ({
        id: hotel._id,
        name: hotel.name,
        type: "hotel",
        lat: hotel.location.coordinates[1],
        lng: hotel.location.coordinates[0],
        address: hotel.address || "",
        image: hotel.images?.[0] || "",
        price: hotel.cheapestRoom || hotel.pricePerNight || 0,
        cityId: hotel.city?._id || hotel.city,
      }));

    const restaurantLocations = restaurants
      .filter(
        (restaurant) =>
          restaurant?.location?.coordinates &&
          restaurant.location.coordinates.length === 2,
      )
      .map((restaurant) => ({
        id: restaurant._id,
        name: restaurant.name,
        type: "restaurant",
        lat: restaurant.location.coordinates[1],
        lng: restaurant.location.coordinates[0],
        address: restaurant.address || "",
        image: restaurant.images?.[0] || "",
        avgCostForOne: restaurant.avgCostForOne || 0,
        cityId: restaurant.city?._id || restaurant.city,
      }));

    const placeLocations = poiPlaces
      .filter(
        (place) =>
          place?.location?.coordinates &&
          place.location.coordinates.length === 2,
      )
      .map((place) => ({
        id: place._id,
        name: place.name,
        type: "place",
        lat: place.location.coordinates[1],
        lng: place.location.coordinates[0],
        address: place.description?.slice?.(0, 80) || "",
        image: place.images?.[0] || "",
        category: place.category,
        entryfees: place.entryfees,
        cityId: place.city?._id || place.city,
      }));

    return [
      ...cityLocations,
      ...hotelLocations,
      ...restaurantLocations,
      ...placeLocations,
    ];
  }, [cities, hotels, restaurants, poiPlaces]);

  return (
    <div className="p-6 bg-black">
      <Travel3DMap
        locations={locations}
        loadingPlaces={placesLoading}
      />
    </div>
  );
}

export default GlobalMap;