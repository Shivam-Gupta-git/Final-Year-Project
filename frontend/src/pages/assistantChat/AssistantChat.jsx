import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { assistantChatThunk } from "../../features/user/aiSlice";

const QUICK_PROMPTS = [
  "Best places near me",
  "Find cheapest hotel under 1500",
  "Best veg food nearby",
  "Track my order",
  "Goa, ₹15000, 3 days, honeymoon",
];

function formatCurrency(value) {
  if (value === null || value === undefined) return "N/A";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function AssistantChat() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.ai);

  const [input, setInput] = useState("");
  const [chatItems, setChatItems] = useState([
    {
      role: "assistant",
      text: "Hi! I can help with nearby places, hotels, food, travel plans, and order status. Ask me anything.",
      data: null,
      intent: null,
      createdAt: Date.now(),
    },
  ]);
  const [location, setLocation] = useState({ latitude: 15.4909, longitude: 73.8352 });
  const [useLocation, setUseLocation] = useState(true);
  const [locationMessage, setLocationMessage] = useState("Fetching your location...");
  const [activeCategory, setActiveCategory] = useState("all");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationMessage("Location not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationMessage("Location ready");
      },
      () => {
        setLocationMessage("Location permission denied");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatItems, loading]);

  const locationReady = useMemo(
    () => location.latitude !== null && location.longitude !== null,
    [location]
  );

  const filteredSuggestions = useMemo(() => {
    const q = input.trim().toLowerCase();
    const base = QUICK_PROMPTS.filter((item) =>
      activeCategory === "all"
        ? true
        : activeCategory === "hotel"
        ? item.toLowerCase().includes("hotel")
        : activeCategory === "food"
        ? item.toLowerCase().includes("food")
        : activeCategory === "travel"
        ? item.toLowerCase().includes("goa") || item.toLowerCase().includes("days")
        : activeCategory === "order"
        ? item.toLowerCase().includes("order")
        : true
    );
    if (!q) return base;
    return base.filter((item) => item.toLowerCase().includes(q));
  }, [input, activeCategory]);

  const openMapLocation = (item) => {
    const lat = item?.location?.coordinates?.[1];
    const lng = item?.location?.coordinates?.[0];
    if (lat && lng) {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
    }
  };

  const handleItemNavigation = (type, item) => {
    if (!item) return;

    if (type === "cheapest_hotel") {
      navigate(`/hotels/${item._id}`);
      return;
    }

    if (type === "food_suggestion") {
      navigate(`/restaurant/${item._id}`);
      return;
    }

    if (type === "nearby_places") {
      openMapLocation(item);
    }
  };

  const handleViewMore = (data, title) => {
    navigate("/assistantChat/recommendations", {
      state: {
        data,
        title,
      },
    });
  };

  const sendMessage = async (messageText) => {
    const trimmed = messageText.trim();
    if (!trimmed || loading) return;

    const userMessage = {
      role: "user",
      text: trimmed,
      data: null,
      intent: null,
      createdAt: Date.now(),
    };

    setChatItems((prev) => [...prev, userMessage]);
    setInput("");

    const payload = { message: trimmed };
    if (useLocation && locationReady) {
      payload.latitude = location.latitude;
      payload.longitude = location.longitude;
    }

    try {
      const result = await dispatch(assistantChatThunk(payload)).unwrap();
      setChatItems((prev) => [
        ...prev,
        {
          role: "assistant",
          text: result?.reply || "No response from assistant.",
          data: result?.data || null,
          intent: result?.intent || null,
          createdAt: Date.now(),
        },
      ]);
    } catch (apiError) {
      setChatItems((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            apiError?.reply ||
            apiError?.message ||
            "Something went wrong. Please try again.",
          data: null,
          intent: null,
          createdAt: Date.now(),
        },
      ]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const refreshLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Location not supported in this browser.");
      return;
    }

    setLocationMessage("Refreshing location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationMessage("Location ready");
      },
      () => {
        setLocationMessage("Location permission denied");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const renderStructuredData = (item) => {
    if (!item?.data) return null;

    const { data } = item;

    if (data.type === "nearby_places" && Array.isArray(data.places)) {
      return (
        <div className="mt-3 grid gap-2">
          {data.places.map((place) => (
            <div
              key={place._id || place.name}
              className="rounded-xl border border-slate-200 bg-white p-3 cursor-pointer hover:border-blue-300 hover:bg-blue-50/40 transition"
              onClick={() => handleItemNavigation("nearby_places", place)}
            >
              <p className="font-semibold text-slate-900">{place.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{place.address}</p>
              <p className="text-xs text-slate-700 mt-1">
                ⭐ {place.averageRating || 0} • {place.distance} km away
              </p>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleViewMore(data, "Nearby Places")}
            className="rounded-xl border border-blue-200 bg-blue-50 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
          >
            View More Details
          </button>
        </div>
      );
    }

    if (data.type === "cheapest_hotel" && Array.isArray(data.hotels)) {
      return (
        <div className="mt-3 grid gap-2">
          {data.hotels.map((hotel) => (
            <div
              key={hotel._id || hotel.name}
              className="rounded-xl border border-slate-200 bg-white p-3 cursor-pointer hover:border-blue-300 hover:bg-blue-50/40 transition"
              onClick={() => handleItemNavigation("cheapest_hotel", hotel)}
            >
              <p className="font-semibold text-slate-900">{hotel.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{hotel.address}</p>
              <p className="text-xs text-slate-700 mt-1">
                {formatCurrency(hotel.cheapestRoom)} / night • {hotel.distance} km
              </p>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleViewMore(data, "Hotel Recommendations")}
            className="rounded-xl border border-blue-200 bg-blue-50 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
          >
            View More Details
          </button>
        </div>
      );
    }

    if (data.type === "food_suggestion" && Array.isArray(data.restaurants)) {
      return (
        <div className="mt-3 grid gap-2">
          {data.restaurants.map((restaurant) => (
            <div
              key={restaurant._id || restaurant.name}
              className="rounded-xl border border-slate-200 bg-white p-3 cursor-pointer hover:border-blue-300 hover:bg-blue-50/40 transition"
              onClick={() => handleItemNavigation("food_suggestion", restaurant)}
            >
              <p className="font-semibold text-slate-900">{restaurant.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {restaurant.address}
              </p>
              <p className="text-xs text-slate-700 mt-1">
                {formatCurrency(restaurant.avgCostForOne)} for one • ⭐{" "}
                {restaurant.averageRating || 0}
              </p>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleViewMore(data, "Restaurant Recommendations")}
            className="rounded-xl border border-blue-200 bg-blue-50 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
          >
            View More Details
          </button>
        </div>
      );
    }

    if (data.type === "delivery_status" && data.deliveryBoy) {
      return (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800">
          <p>
            <span className="font-semibold">Delivery Partner:</span>{" "}
            {data.deliveryBoy.name}
          </p>
          <p className="mt-1">
            <span className="font-semibold">Contact:</span>{" "}
            {data.deliveryBoy.contact}
          </p>
        </div>
      );
    }

    if (data.type === "travel_plan") {
      return (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800">
          {data.city && (
            <p>
              <span className="font-semibold">City:</span> {data.city}
            </p>
          )}
          {data.budget && (
            <p className="mt-1">
              <span className="font-semibold">Budget:</span>{" "}
              {formatCurrency(data.budget)}
            </p>
          )}
          {data.days && (
            <p className="mt-1">
              <span className="font-semibold">Days:</span> {data.days}
            </p>
          )}
          {Array.isArray(data.requiredFields) && (
            <p className="mt-1">
              <span className="font-semibold">Required:</span>{" "}
              {data.requiredFields.join(", ")}
            </p>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
          <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
            Smart Assistant Chat
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ask for nearby places, food suggestions, hotel options, trip plans, or
            order tracking.
          </p>
        </div>

        <div className="px-4 pt-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => setUseLocation((prev) => !prev)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                useLocation
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {useLocation ? "Location On" : "Location Off"}
            </button>
            <button
              type="button"
              onClick={refreshLocation}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Refresh location
            </button>
            <span className="text-xs text-slate-500">{locationMessage}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All" },
              { key: "hotel", label: "Hotels" },
              { key: "food", label: "Food" },
              { key: "travel", label: "Travel" },
              { key: "order", label: "Order" },
            ].map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={`rounded-full px-3 py-1.5 text-xs border transition ${
                  activeCategory === cat.key
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 h-[58vh] overflow-y-auto px-4 pb-2 sm:px-6">
          <div className="space-y-3">
            {chatItems.map((item, idx) => {
              const isUser = item.role === "user";
              return (
                <div
                  key={`${item.createdAt}-${idx}`}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-xs ${
                      isUser
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{item.text}</p>
                    {!isUser && renderStructuredData(item)}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                  Assistant is typing...
                </div>
              </div>
            )}

            {error && !loading && (
              <div className="text-xs text-red-600">{error}</div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-slate-200 p-4 sm:p-6">
          <div className="mb-3 flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                disabled={loading}
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="h-11 flex-1 rounded-xl border border-slate-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-11 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send
            </button>
          </form>
          {filteredSuggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setInput(suggestion)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssistantChat;