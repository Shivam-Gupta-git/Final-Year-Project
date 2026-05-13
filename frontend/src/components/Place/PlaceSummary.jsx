import { useSelector } from "react-redux";
import {
  selectPlaces,
  selectNearbyPlaces,
  selectUsingNearby,
  selectActiveCategory,
  selectSearchQuery,
  selectNearbyExpandedBeyondCity,
} from "../../features/user/placeSlice";

export default function PlaceSummary() {
  const places = useSelector(selectPlaces);
  const nearby = useSelector(selectNearbyPlaces);
  const usingNearby = useSelector(selectUsingNearby);
  const category = useSelector(selectActiveCategory);
  const search = useSelector(selectSearchQuery);
  const nearbyExpandedBeyondCity = useSelector(selectNearbyExpandedBeyondCity);

  const list = usingNearby ? nearby : places;
  const count = list.length;

  const avgRating = count
    ? (
        list.reduce(
          (s, p) => s + (p.rating ?? p.averageRating ?? 0),
          0,
        ) / count
      ).toFixed(1)
    : "–";

  const freeCount = list.filter(
    (p) => p.entryfees === 0 || p.entryfees == null
  ).length;

  const popularCount = list.filter((p) => p.isPopular).length;

  return (
    <div className="bg-white/10 backdrop-blur-sm border-b border-white/40">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-3.5 flex items-center justify-between flex-wrap gap-4">
        {/* Left: result info */}
        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          <span className="text-slate-800 font-black px-2.5 py-1 bg-white rounded-lg shadow-sm">{count}</span>
          <span className="opacity-70">{count === 1 ? "Place" : "Places"} Found</span>

          {usingNearby && (
            <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50/50 px-3 py-1 rounded-full border border-emerald-100">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <circle cx="12" cy="10" r="3"/>
                <path d="M12 2a8 8 0 0 1 8 8c0 5.25-8 14-8 14S4 15.25 4 10a8 8 0 0 1 8-8z"/>
              </svg>
              Nearby
            </span>
          )}

          {usingNearby && nearbyExpandedBeyondCity && (
            <span className="text-[10px] font-bold normal-case text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-100 tracking-wide">
              Wider area (outside city filter)
            </span>
          )}

          {category && (
            <span className="bg-blue-50/50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
              {category}
            </span>
          )}

          {search && (
            <span className="text-slate-400 normal-case font-medium">
              for "<span className="text-slate-700 font-bold">{search}</span>"
            </span>
          )}
        </div>

        {/* Right: quick stats */}
        {count > 0 && (
          <div className="flex items-center gap-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="text-slate-600">Avg {avgRating}</span>
            </div>

            <div className="w-px h-4 bg-slate-200/50" />

            {freeCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded-md">{freeCount}</span>
                <span>Free Entry</span>
              </div>
            )}

            {popularCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-amber-600 px-2 py-0.5 bg-amber-50 rounded-md">{popularCount}</span>
                <span>Popular</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}