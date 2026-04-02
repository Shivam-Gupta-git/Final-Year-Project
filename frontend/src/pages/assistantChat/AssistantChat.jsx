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
      state: { data, title },
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
        <div className="mt-3 flex flex-col gap-2">
          {data.places.map((place) => (
            <div
              key={place._id || place.name}
              className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-zinc-950 p-3 pl-4 cursor-pointer hover:border-violet-500/40 hover:bg-zinc-900 transition-all duration-200 group"
              onClick={() => handleItemNavigation("nearby_places", place)}
            >
              <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-violet-500 rounded-r opacity-60 group-hover:opacity-100 transition-opacity" />
              <p className="font-semibold text-zinc-100 text-[13px]">{place.name}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">{place.address}</p>
              <p className="text-[11px] text-zinc-400 mt-1.5">⭐ {place.averageRating || 0} · {place.distance} km away</p>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleViewMore(data, "Nearby Places")}
            className="rounded-xl border border-dashed border-violet-500/30 py-2 text-[11px] font-bold text-violet-400 hover:bg-violet-500/10 hover:border-violet-400/50 tracking-widest uppercase transition-all duration-200"
          >
            View All Results →
          </button>
        </div>
      );
    }

    if (data.type === "cheapest_hotel" && Array.isArray(data.hotels)) {
      return (
        <div className="mt-3 flex flex-col gap-2">
          {data.hotels.map((hotel) => (
            <div
              key={hotel._id || hotel.name}
              className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-zinc-950 p-3 pl-4 cursor-pointer hover:border-sky-500/40 hover:bg-zinc-900 transition-all duration-200 group"
              onClick={() => handleItemNavigation("cheapest_hotel", hotel)}
            >
              <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-sky-400 rounded-r opacity-60 group-hover:opacity-100 transition-opacity" />
              <p className="font-semibold text-zinc-100 text-[13px]">{hotel.name}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">{hotel.address}</p>
              <p className="text-[11px] text-zinc-400 mt-1.5">{formatCurrency(hotel.cheapestRoom)} / night · {hotel.distance} km</p>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleViewMore(data, "Hotel Recommendations")}
            className="rounded-xl border border-dashed border-sky-500/30 py-2 text-[11px] font-bold text-sky-400 hover:bg-sky-500/10 hover:border-sky-400/50 tracking-widest uppercase transition-all duration-200"
          >
            View All Hotels →
          </button>
        </div>
      );
    }

    if (data.type === "food_suggestion" && Array.isArray(data.restaurants)) {
      return (
        <div className="mt-3 flex flex-col gap-2">
          {data.restaurants.map((restaurant) => (
            <div
              key={restaurant._id || restaurant.name}
              className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-zinc-950 p-3 pl-4 cursor-pointer hover:border-emerald-500/40 hover:bg-zinc-900 transition-all duration-200 group"
              onClick={() => handleItemNavigation("food_suggestion", restaurant)}
            >
              <div className="absolute left-0 top-0 bottom-0 w-0.75 bg-emerald-400 rounded-r opacity-60 group-hover:opacity-100 transition-opacity" />
              <p className="font-semibold text-zinc-100 text-[13px]">{restaurant.name}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">{restaurant.address}</p>
              <p className="text-[11px] text-zinc-400 mt-1.5">{formatCurrency(restaurant.avgCostForOne)} for one · ⭐ {restaurant.averageRating || 0}</p>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleViewMore(data, "Restaurant Recommendations")}
            className="rounded-xl border border-dashed border-emerald-500/30 py-2 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400/50 tracking-widest uppercase transition-all duration-200"
          >
            View All Restaurants →
          </button>
        </div>
      );
    }

    if (data.type === "delivery_status" && data.deliveryBoy) {
      return (
        <div className="mt-3 rounded-xl border border-white/[0.07] bg-zinc-950 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Live Tracking</span>
          </div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Delivery Partner</p>
          <p className="text-sm font-semibold text-zinc-100 mt-0.5">{data.deliveryBoy.name}</p>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-2.5">Contact</p>
          <p className="text-sm font-semibold text-zinc-100 mt-0.5">{data.deliveryBoy.contact}</p>
        </div>
      );
    }

    if (data.type === "travel_plan") {
      return (
        <div className="mt-3 rounded-xl border border-white/[0.07] bg-zinc-950 p-4 flex flex-col gap-3">
          {data.city && (
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Destination</span>
              <span className="text-[13px] font-semibold text-zinc-100">{data.city}</span>
            </div>
          )}
          {data.budget && (
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Budget</span>
              <span className="text-[13px] font-semibold text-zinc-100">{formatCurrency(data.budget)}</span>
            </div>
          )}
          {data.days && (
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Duration</span>
              <span className="text-[13px] font-semibold text-zinc-100">{data.days} days</span>
            </div>
          )}
          {Array.isArray(data.requiredFields) && (
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Needs</span>
              <span className="text-[13px] font-semibold text-zinc-100">{data.requiredFields.join(", ")}</span>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const categories = [
    { key: "all", label: "All" },
    { key: "hotel", label: "Hotels" },
    { key: "food", label: "Food" },
    { key: "travel", label: "Travel" },
    { key: "order", label: "Order" },
  ];

  const locDotColor =
    locationMessage === "Location ready"
      ? "bg-emerald-400"
      : locationMessage.includes("denied") || locationMessage.includes("not supported")
      ? "bg-red-400"
      : "bg-amber-400 animate-pulse";

  return (
    <div className="min-h-screen bg-[#080809] p-3 sm:p-6 flex items-start justify-center">
      <div className="w-full max-w-5xl h-[85%] rounded-2xl border border-white/[0.07] bg-[#0f0f11] shadow-2xl overflow-hidden flex flex-col">

        {/* ── HEADER ── */}
        <div className="relative flex items-center justify-between px-5 sm:px-7 py-4 border-b border-white/6">
          {/* top glow line */}
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-violet-500/40 to-transparent" />

          <div className="flex items-center gap-3.5">
            <div className="relative w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-lg shrink-0">
              🤖
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0f0f11]" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-zinc-100 tracking-tight">Smart Assistant Chat</h1>
              <p className="text-[10px] text-zinc-500 tracking-widest mt-0.5 uppercase">
                Ask for nearby places, food, hotels, trip plans or order tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/[0.07] text-[10px] text-zinc-500 tracking-wide">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${locDotColor}`} />
              {locationMessage}
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-xl border border-white/8 text-zinc-400 text-xs font-semibold hover:border-violet-500/40 hover:text-violet-400 hover:bg-violet-500/5 transition-all duration-200"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* ── CONTROLS BAR (location + categories) ── */}
        <div className="px-5 sm:px-7 py-3 border-b border-white/5 bg-[#0c0c0e] flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setUseLocation((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all duration-200 ${
              useLocation
                ? "border-violet-500/40 bg-violet-500/10 text-violet-400"
                : "border-white/8 bg-zinc-900 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${useLocation ? "bg-violet-400" : "bg-zinc-600"}`} />
            {useLocation ? "Location On" : "Location Off"}
          </button>

          <button
            type="button"
            onClick={refreshLocation}
            className="px-3 py-1.5 rounded-lg border border-white/8 bg-zinc-900 text-[11px] font-semibold text-zinc-500 hover:text-zinc-200 hover:border-white/16 transition-all duration-200"
          >
            ↻ Refresh
          </button>

          <div className="h-4 w-px bg-white/8 mx-1 hidden sm:block" />

          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold border transition-all duration-200 ${
                activeCategory === cat.key
                  ? "bg-zinc-100 text-zinc-900 border-zinc-100"
                  : "bg-transparent text-zinc-500 border-white/8 hover:border-white/18 hover:text-zinc-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── MESSAGES ── */}
        <div className="h-[58vh] overflow-y-auto px-5 sm:px-7 py-5 flex flex-col gap-4 scroll-smooth [scrollbar-width:thin] [scrollbar-color:#27272a_transparent]">
          {chatItems.map((item, idx) => {
            const isUser = item.role === "user";
            const timeStr = new Date(item.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={`${item.createdAt}-${idx}`}
                className={`flex items-end gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xs shrink-0 mb-1 text-violet-300">
                    ✦
                  </div>
                )}

                <div className={`flex flex-col gap-1 max-w-[82%] ${isUser ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? "bg-linear-to-br from-violet-600 to-indigo-600 text-white rounded-br-sm shadow-lg shadow-violet-950/50"
                        : "bg-zinc-900 border border-white/[0.07] text-zinc-200 rounded-bl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-line">{item.text}</p>
                    {!isUser && renderStructuredData(item)}
                  </div>
                  <span className="text-[9px] text-zinc-600 px-1">{timeStr}</span>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[8px] font-bold text-indigo-400 shrink-0 mb-1">
                    YOU
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator */}
          {loading && (
            <div className="flex items-end gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xs shrink-0 text-violet-300">
                ✦
              </div>
              <div className="rounded-2xl rounded-bl-sm bg-zinc-900 border border-white/[0.07] px-4 py-3.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" />
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="text-[11px] text-red-400 text-center py-1">⚠ {error}</div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── INPUT AREA ── */}
        <div className="border-t border-white/6 bg-[#0c0c0e] px-5 sm:px-7 py-4 flex flex-col gap-3">

          {/* Quick prompts */}
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                disabled={loading}
                className="px-3 py-1.5 rounded-full border border-white/8 bg-zinc-900 text-[11px] text-zinc-400 hover:border-violet-500/40 hover:text-violet-300 hover:bg-violet-500/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 h-11 rounded-xl border border-white/8 bg-zinc-900 px-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/8 transition-all duration-200"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-11 px-6 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-violet-950/60 hover:from-violet-500 hover:to-indigo-500 hover:-translate-y-0.5 hover:shadow-violet-900/60 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 transition-all duration-200"
            >
              Send ↑
            </button>
          </form>

          {/* Filtered suggestions (only when typing) */}
          {filteredSuggestions.length > 0 && input.trim() && (
            <div className="flex flex-wrap gap-2">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1 rounded-full border border-white/6 bg-zinc-950 text-[11px] text-zinc-500 hover:text-zinc-200 hover:border-white/[0.14] transition-all duration-150"
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
