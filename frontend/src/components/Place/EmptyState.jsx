import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  setActiveCategory,
  setSearchQuery,
  clearNearby,
  fetchPlacesByCity,
  selectSelectedCity,
} from "../../features/user/placeSlice";

export default function EmptyState({ usingNearby, radiusKm }) {
  const dispatch = useDispatch();
  const { id: routeCityId } = useParams();
  const selectedCity = useSelector(selectSelectedCity);
  const cityIdForApi =
    selectedCity?._id ?? selectedCity?.id ?? routeCityId ?? null;

  const handleReset = () => {
    dispatch(setActiveCategory(""));
    dispatch(setSearchQuery(""));
    if (usingNearby) {
      dispatch(clearNearby());
    }
    if (cityIdForApi) {
      dispatch(fetchPlacesByCity({ cityId: cityIdForApi }));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="w-28 h-28 rounded-full bg-slate-100 flex items-center justify-center shadow-inner">
          <span className="text-5xl">
            {usingNearby ? "📡" : "🔍"}
          </span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-white
                        flex items-center justify-center text-xl shadow-lg border border-slate-100">
          {usingNearby ? "📍" : "✨"}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
        {usingNearby
          ? `Out of range`
          : "No matches found"}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-8 font-medium">
        {usingNearby
          ? `We couldn't find any active places within ${radiusKm} of your current location. Try increasing the discovery radius.`
          : "We couldn't find any places matching your current filters. Try adjusting your search or category for better results."}
      </p>

      {/* Actions */}
      <div className="flex flex-col items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em]
                     px-8 py-3.5 rounded-2xl transition-all shadow-xl shadow-slate-200"
        >
          {usingNearby ? "Discover All Places" : "Reset Discovery"}
        </motion.button>

        {usingNearby && (
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            or adjust radius in the toolbar
          </p>
        )}
      </div>

      {/* Suggestions */}
      {!usingNearby && (
        <div className="mt-12 p-6 bg-white/50 backdrop-blur-sm rounded-4xl border border-white/80 max-w-xs shadow-sm">
          <p className="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">
            Optimization Tips
          </p>
          <ul className="text-xs text-slate-500 space-y-2 text-left font-medium">
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>Check for spelling variations</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>Try broader categories</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>Filter by popular spots</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>Use location for nearby finds</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}