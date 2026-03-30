import { useSelector } from "react-redux";
import {
  selectPlaces,
  selectNearbyPlaces,
  selectUsingNearby,
  selectActiveCategory,
  selectSearchQuery,
} from "../../features/user/placeSlice";

export default function PlaceSummary() {
  const places      = useSelector(selectPlaces);
  const nearby      = useSelector(selectNearbyPlaces);
  const usingNearby = useSelector(selectUsingNearby);
  const category    = useSelector(selectActiveCategory);
  const search      = useSelector(selectSearchQuery);

  const list  = usingNearby ? nearby : places;
  const count = list.length;

  // ── Stats derived from current list ───────────────────────────────────────
  const avgRating = count
    ? (list.reduce((s, p) => s + (p.rating || 0), 0) / count).toFixed(1)
    : "–";

  const freeCount = list.filter(
    (p) => p.entryfees === 0 || p.entryfees == null
  ).length;

  const popularCount = list.filter((p) => p.isPopular).length;

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between
                      flex-wrap gap-3">
        {/* Left: result info */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="font-semibold text-gray-800">{count}</span>
          <span>{count === 1 ? "place" : "places"}</span>

          {usingNearby && (
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <circle cx="12" cy="10" r="3"/>
                <path d="M12 2a8 8 0 0 1 8 8c0 5.25-8 14-8 14S4 15.25 4 10a8 8 0 0 1 8-8z"/>
              </svg>
              nearby
            </span>
          )}

          {category && (
            <span className="bg-rose-50 text-rose-600 text-xs font-semibold px-2 py-0.5 rounded-full border border-rose-100">
              {category}
            </span>
          )}

          {search && (
            <span className="text-gray-400">
              for "<span className="text-gray-600 font-medium">{search}</span>"
            </span>
          )}
        </div>

        {/* Right: quick stats */}
        {count > 0 && (
          <div className="flex items-center gap-4 text-xs text-gray-400 divide-x divide-gray-100">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span>Avg {avgRating}</span>
            </div>

            {freeCount > 0 && (
              <div className="pl-4 flex items-center gap-1">
                <span className="text-green-500 font-semibold">{freeCount}</span>
                <span>free</span>
              </div>
            )}

            {popularCount > 0 && (
              <div className="pl-4 flex items-center gap-1">
                <span className="text-amber-500 font-semibold">{popularCount}</span>
                <span>popular</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}