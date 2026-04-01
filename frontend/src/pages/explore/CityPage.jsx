import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { getCityById } from "../../features/user/citySlice";
import {
  fetchNearbyPlaces,
  fetchPlacesByCity,
  selectDistanceRadius,
  selectSelectedCity,
  selectUserLocation,
  selectUsingNearby,
  setDistanceRadius,
  setSelectedCity,
  setUserLocation,
  setUsingNearby,
} from "../../features/user/placeSlice";

import PlaceHeader from "../../components/Place/PlaceHeader";
import PlaceFilters from "../../components/Place/PlaceFilters";
import PlaceSummary from "../../components/Place/PlaceSummary";
import PlaceList from "../../components/Place/PlaceList";

export default function CityPage() {
  console.log("CityPage rendered"); 
  const { id } = useParams();
  const dispatch = useDispatch();
  const cityState = useSelector((s) => s.city);
  const selectedCity = useSelector(selectSelectedCity);
  const usingNearby = useSelector(selectUsingNearby);
  const userLocation = useSelector(selectUserLocation);
  const radiusKm = useSelector(selectDistanceRadius);

  // Load city details (for header + selectedCity)
  useEffect(() => {
    if (id) dispatch(getCityById(id));
  }, [dispatch, id]);

  // Sync citySlice.city -> placeSlice.selectedCity
  useEffect(() => {
    const payload = cityState.city;
    const city = payload?.data ?? null;
    if (city && city._id) {
      dispatch(setSelectedCity(city));
    }
  }, [cityState.city, dispatch]);

  // Default: fetch city places (active)
  useEffect(() => {
    if (!id) return;
    dispatch(fetchPlacesByCity({ cityId: id }));
  }, [dispatch, id]);

  const enableNearby = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        dispatch(setUserLocation(loc));
        dispatch(setUsingNearby(true));
        dispatch(
          fetchNearbyPlaces({
            ...loc,
            cityId: id,
            distance: radiusKm,
          }),
        );
      },
      () => {
        // keep it simple: UI already shows errors in list components
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  };

  

  const disableNearby = () => {
    dispatch(setUsingNearby(false));
    dispatch(fetchPlacesByCity({ cityId: id }));
  };

  const setRadiusAndRefetch = (km) => {
  dispatch(setDistanceRadius(km));

  if (usingNearby && userLocation) {
    dispatch(
      fetchNearbyPlaces({
        ...userLocation,
        cityId: id,
        distance: km,
      })
    );
  }
};

  const cityName = selectedCity?.name || (cityState.city?.data?.name ?? "City");

  return (
    <div className="min-h-screen bg-slate-50">
      <PlaceHeader cityName={cityName} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={usingNearby ? disableNearby : enableNearby}
                className={`text-sm font-semibold px-4 py-2 rounded-xl border transition-colors ${
                  usingNearby
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                    : "bg-rose-500 border-rose-500 text-white hover:bg-rose-600"
                }`}
              >
                {usingNearby ? "Using My Location" : "Use My Location"}
              </button>

              <div className="hidden sm:block w-px h-7 bg-slate-200" />

              <div className="flex items-center gap-2">
                {[5, 20, 50, 100].map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => setRadiusAndRefetch(km)}
                    className={`text-xs sm:text-sm font-semibold px-3 py-2 rounded-xl border transition-colors ${
                      radiusKm === km
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {km} km
                  </button>
                ))}
              </div>
            </div>

            {usingNearby && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                Showing within {radiusKm} km
              </span>
            )}
          </div>

          <PlaceFilters />
          <PlaceSummary />
          <PlaceList cityName={cityName} />
        </div>
      </div>
    </div>
  );
}

