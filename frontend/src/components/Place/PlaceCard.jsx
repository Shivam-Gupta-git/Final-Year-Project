import React from "react";

// FIX: Backend sends distanceInKm directly — just format it cleanly,
// no conversion to meters and back.
const formatDistance = (distanceInKm) => {
  if (distanceInKm == null) return "N/A";
  const km = Number(distanceInKm);
  if (!Number.isFinite(km)) return "N/A";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

// FIX: format entry fee with ₹ symbol
const formatEntryFee = (fee) => {
  if (fee == null || fee === "" || fee === 0) return "Free";
  return `₹${Number(fee).toLocaleString("en-IN")}`;
};

const PlaceCard = ({
  place,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  // FIX: image field normalised (backend sends images array)
  const image = place?.images?.[0] || place?.image || null;

  // FIX: use distanceInKm directly — don't multiply by 1000
  const distanceInKm = place?.distanceInKm ?? null;

  // FIX: normalise entryFee field name
  const entryFee = place?.entryFee ?? place?.entryfees ?? null;

  const categoryLabel =
    typeof place?.category === "string"
      ? place.category
      : place?.category?.name || "Uncategorized";

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`w-full rounded-2xl border bg-white text-left shadow-sm transition duration-200 hover:shadow-md ${
        isSelected
          ? "border-indigo-500 ring-2 ring-indigo-100"
          : isHovered
            ? "border-indigo-200"
            : "border-gray-100"
      }`}
    >
      {/* FIX: aspect-video instead of fixed h-40 so it scales on all screens */}
      <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl bg-gray-100">
        {image ? (
          <img
            src={image}
            alt={place?.name || "Place"}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          // NEW: placeholder when no image available
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-50 to-gray-100">
            <span className="text-3xl">🗺️</span>
          </div>
        )}

        {/* Popular badge */}
        {place?.isPopular && (
          <span className="absolute right-3 top-3 rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white shadow">
            ⭐ Popular
          </span>
        )}

        {/* Distance badge overlay — easy to spot at a glance */}
        {distanceInKm != null && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {formatDistance(distanceInKm)}
          </span>
        )}
      </div>

      <div className="space-y-2 p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-gray-900">
          {place?.name || "-"}
        </h3>

        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
            {categoryLabel}
          </span>
          {/* FIX: ₹ symbol + free label */}
          <span
            className={`text-sm font-medium ${
              !entryFee || entryFee === 0 ? "text-green-600" : "text-gray-700"
            }`}
          >
            {formatEntryFee(entryFee)}
          </span>
        </div>
      </div>
    </button>
  );
};

export default PlaceCard;
