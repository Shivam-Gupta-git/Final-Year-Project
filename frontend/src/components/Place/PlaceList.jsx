import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PlaceCard from "./PlaceCard";
import LoadingSkeleton from "./LoadingSkeleton";
import EmptyState from "./EmptyState";
import {
  selectPlaces,
  selectNearbyPlaces,
  selectPlacesLoading,
  selectNearbyLoading,
  selectPlacesError,
  selectNearbyError,
  selectUsingNearby,
  selectDistanceRadius,
  selectPagination,
} from "../../features/user/placeSlice";

const KM_MAP = {
  5: "5 km",
  20: "20 km",
  50: "50 km",
  100: "100 km",
};

export default function PlaceList({ cityName, onPlaceClick }) {
  useDispatch();
  const places        = useSelector(selectPlaces);
  const nearby        = useSelector(selectNearbyPlaces);
  const loadingPlaces = useSelector(selectPlacesLoading);
  const loadingNearby = useSelector(selectNearbyLoading);
  const errorPlaces   = useSelector(selectPlacesError);
  const errorNearby   = useSelector(selectNearbyError);
  const usingNearby   = useSelector(selectUsingNearby);
  const radius        = useSelector(selectDistanceRadius);
  const pagination    = useSelector(selectPagination);

  const isLoading = usingNearby ? loadingNearby : loadingPlaces;
  const error     = usingNearby ? errorNearby   : errorPlaces;
  const list      = usingNearby ? nearby        : places;
  const radiusLabel = KM_MAP[radius] || `${Math.round(radius)} km`;
  console.log("usingNearby:", usingNearby);
console.log("places:", places);
console.log("nearby:", nearby);
console.log("list:", list);

  // Initial fetch
  useEffect(() => {
    void cityName;
  }, [cityName]);

  const handleRetry = () => {
    // Retry handled by page-level actions (cityId is required).
  };

  // ── Error state ────────────────────────────────────────────────────────────
  if (error && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">Something went wrong</h3>
        <p className="text-sm text-gray-500 mb-4 max-w-xs">{error}</p>
        <button
          onClick={handleRetry}
          className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold
                    px-5 py-2.5 rounded-xl transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <LoadingSkeleton count={8} />
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!isLoading && list.length === 0) {
    return (
      <EmptyState
        cityName={cityName}
        usingNearby={usingNearby}
        radiusKm={radiusLabel}
      />
    );
  }
  

  // ── Grid ───────────────────────────────────────────────────────────────────
  return (
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Nearby mode label */}
      {usingNearby && (
        <div className="flex items-center gap-2 mb-5">
          <div className="h-px flex-1 bg-gray-100" />
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50
                          border border-emerald-200 px-3 py-1 rounded-full">
            📡 Sorted by distance — within {radiusLabel}
          </span>
          <div className="h-px flex-1 bg-gray-100" />
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {list.map((place, i) => (
          <div
            key={place._id}
            className="animate-fade-up"
            style={{ animationDelay: `${Math.min(i * 0.05, 0.4)}s`, animationFillMode: "both" }}
          >
            <PlaceCard
              place={place}
              distanceInKm={place.distanceInKm ?? null}
              onClick={onPlaceClick}
            />
            
          </div>
        ))}
      </div>
      

      {/* Pagination info */}
      {!usingNearby && pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <p className="text-sm text-gray-400">
            Showing {list.length} of {pagination.total} places
          </p>
        </div>
      )}
      
    </div>
    
  );
  
}