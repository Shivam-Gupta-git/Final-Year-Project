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
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
        </div>

        {!items.length ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            No detailed recommendations available.
          </div>
        ) : (
          <div className="grid gap-3">
            {items.map((item) => (
              <button
                key={item._id || item.name}
                type="button"
                onClick={() => handleOpen(item)}
                className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-blue-300 hover:bg-blue-50/40"
              >
                <p className="font-semibold text-slate-900">{item.name}</p>
                <p className="mt-1 text-xs text-slate-500">{item.address}</p>
                <p className="mt-2 text-xs text-slate-700">
                  {item.distance ? `${item.distance} km away` : ""}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AssistantRecommendations;
