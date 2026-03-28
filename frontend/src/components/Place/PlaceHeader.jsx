import React from "react";
import { LocateFixed, Loader2, X, MapPinOff } from "lucide-react";

const PlaceHeader = ({
  cityName,
  searchQuery,
  onSearchChange,
  onUseLocation,
  locationStatus,
}) => {
  const isLocating = locationStatus === "loading";
  const isDenied = locationStatus === "denied";
  const isError = locationStatus === "error";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Current City
          </p>
          <h1 className="text-xl font-semibold text-gray-900">{cityName}</h1>
        </div>

        {/* FIX: icon + loading/error states on location button */}
        <button
          type="button"
          onClick={onUseLocation}
          disabled={isLocating}
          title={
            isDenied
              ? "Location permission denied — please allow it in browser settings"
              : isError
                ? "Could not get location — tap to retry"
                : "Use my current location"
          }
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white shadow-sm transition
            ${
              isDenied || isError
                ? "bg-red-500 hover:bg-red-600"
                : "bg-indigo-600 hover:bg-indigo-700"
            }
            disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {isLocating ? (
            <Loader2 size={15} className="animate-spin" />
          ) : isDenied || isError ? (
            <MapPinOff size={15} />
          ) : (
            <LocateFixed size={15} />
          )}
          {isLocating
            ? "Locating..."
            : isDenied
              ? "Denied"
              : isError
                ? "Retry"
                : "Use My Location"}
        </button>
      </div>

      {/* NEW: inline denied/error hint below button */}
      {isDenied && (
        <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
          Location access was denied. Please enable it in your browser settings
          and try again.
        </p>
      )}
      {isError && !isDenied && (
        <p className="rounded-lg border border-orange-100 bg-orange-50 px-3 py-2 text-xs text-orange-600">
          Could not detect your location. Check your connection and try again.
        </p>
      )}

      {/* FIX: clear (X) button added to search input */}
      <div className="relative">
        <input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search places or categories..."
          className="w-full rounded-xl border border-gray-200 py-2.5 pl-4 pr-9 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </div>
  );
};

export default PlaceHeader;
