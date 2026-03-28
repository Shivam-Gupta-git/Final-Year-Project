import React from "react";

// FIX: component is now only rendered when coords exist and loading is false
// (the condition is handled in PlacePage, so this component always shows real data)
const PlaceSummary = ({ count, distance }) => {
  return (
    <p className="text-sm text-gray-600">
      Showing <span className="font-semibold text-gray-900">{count}</span>{" "}
      {count === 1 ? "place" : "places"} within{" "}
      <span className="font-semibold text-gray-900">{distance / 1000} km</span>
    </p>
  );
};

export default PlaceSummary;
