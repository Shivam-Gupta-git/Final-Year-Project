import { useDispatch } from "react-redux";
import {
  setActiveCategory,
  setSearchQuery,
  clearNearby,
  fetchPlacesByCity,
  selectSelectedCity,
} from "../../features/user/placeSlice";
import { useSelector } from "react-redux";

export default function EmptyState({ usingNearby, radiusKm }) {
  const dispatch = useDispatch();
  const selectedCity = useSelector(selectSelectedCity);

  const handleReset = () => {
    dispatch(setActiveCategory(""));
    dispatch(setSearchQuery(""));
    if (usingNearby) {
      dispatch(clearNearby());
    }
    if (selectedCity?._id) {
      dispatch(fetchPlacesByCity({ cityId: selectedCity._id }));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-rose-50 flex items-center justify-center">
          <span className="text-4xl">
            {usingNearby ? "📡" : "🔍"}
          </span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-100
                        flex items-center justify-center text-lg">
          {usingNearby ? "📍" : "✨"}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        {usingNearby
          ? `No places within ${radiusKm} km`
          : "No places found"}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-500 max-w-sm leading-relaxed mb-6">
        {usingNearby
          ? `We couldn't find any active places within ${radiusKm} km of your current location. Try increasing the distance radius.`
          : "We couldn't find any places matching your current filters. Try adjusting your search or category."}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <button
          onClick={handleReset}
          className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold
                     px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-rose-200"
        >
          {usingNearby ? "Show All Places" : "Clear Filters"}
        </button>

        {usingNearby && (
          <p className="text-xs text-gray-400">
            or increase the distance radius above
          </p>
        )}
      </div>

      {/* Suggestions */}
      {!usingNearby && (
        <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 max-w-xs">
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            Suggestions
          </p>
          <ul className="text-xs text-gray-400 space-y-1 text-left">
            <li>• Check for spelling mistakes</li>
            <li>• Try a different category</li>
            <li>• Use broader search terms</li>
            <li>• Enable location to find nearby places</li>
          </ul>
        </div>
      )}
    </div>
  );
}