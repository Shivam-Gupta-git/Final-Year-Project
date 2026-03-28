import React from "react";
import { LocateFixed, SearchX, MapPinOff, WifiOff } from "lucide-react";

const STATES = {
  denied: {
    icon: <MapPinOff size={28} className="text-red-400" />,
    title: "Location access denied",
    description: "Enable location in your browser settings, then tap retry.",
    color: "border-red-900 bg-red-950/30",
  },
  error: {
    icon: <WifiOff size={28} className="text-orange-400" />,
    title: "Couldn't get your location",
    description: "Check your connection and try again.",
    color: "border-orange-900 bg-orange-950/30",
  },
  "no-location": {
    icon: <LocateFixed size={28} className="text-teal-400" />,
    title: "Share your location",
    description: "Allow location access to discover nearby tourist spots.",
    color: "border-teal-900 bg-teal-950/20",
  },
  search: {
    icon: <SearchX size={28} className="text-gray-500" />,
    title: "No matches",
    description: "Try a different keyword or clear the search.",
    color: "border-gray-700 bg-gray-800/30",
  },
  "no-results": {
    icon: <span className="text-3xl">🗺️</span>,
    title: "No places found",
    description: "Try increasing the radius or selecting a different category.",
    color: "border-gray-700 bg-gray-800/30",
  },
};

const EmptyState = ({ reason = "no-results", onRetry }) => {
  const state = STATES[reason] || STATES["no-results"];
  const showRetry = ["error", "denied", "no-location"].includes(reason);

  return (
    <div
      className={`flex shrink-0 flex-col items-center justify-center rounded-2xl border px-6 py-10 text-center ${state.color}`}
      style={{ width: 260, minHeight: 260 }}
    >
      <div className="mb-3">{state.icon}</div>
      <p className="text-sm font-bold text-white">{state.title}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-gray-400">{state.description}</p>
      {showRetry && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-full border border-teal-600 px-4 py-1.5 text-xs font-bold text-teal-400 transition hover:bg-teal-600 hover:text-white"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default EmptyState;