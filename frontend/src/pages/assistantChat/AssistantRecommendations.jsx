import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function AssistantRecommendations() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const title = state?.title || "Recommendations";
  const data = state?.data || {};
  const items =
    data?.hotels || data?.restaurants || data?.places || [];

  const handleOpen = (item) => {
    if (data?.type === "cheapest_hotel" && item?._id) {
      navigate(`/hotels/${item._id}`);
      return;
    }

    if (data?.type === "food_suggestion" && item?._id) {
      navigate(`/restaurant/${item._id}`);
      return;
    }

    if (data?.type === "nearby_places") {
      const lat = item?.location?.coordinates?.[1];
      const lng = item?.location?.coordinates?.[0];
      if (lat && lng) {
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
      }
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-950 to-black p-6">
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Manage and view detailed recommendations with ease.
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-xl bg-gray-800 px-5 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition"
        >
          ← Back
        </button>
      </div>
  
      {/* Empty State */}
      {!items.length ? (
        <div className="rounded-2xl border border-gray-700 bg-gray-900 p-8 text-center text-gray-400 shadow-lg">
          <div className="text-6xl mb-4">📍</div>
          <h2 className="text-2xl font-semibold text-white mb-2">No Recommendations</h2>
          <p className="text-gray-400">Currently, there are no detailed recommendations available.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item._id || item.name}
              onClick={() => handleOpen(item)}
              className="cursor-pointer rounded-2xl bg-gray-900 border border-gray-700 p-5 shadow-md hover:shadow-xl hover:border-blue-500 transition-all duration-300"
            >
              <div className="flex flex-col gap-2">
                <p className="text-lg font-semibold text-white truncate">{item.name}</p>
                <p className="text-sm text-gray-400 truncate">{item.address}</p>
                {item.distance && (
                  <p className="text-xs text-gray-500 mt-1">{item.distance} km away</p>
                )}
              </div>
              <div className="mt-3 h-0.5 w-full bg-gray-700 rounded-full"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
  );
}

export default AssistantRecommendations;
