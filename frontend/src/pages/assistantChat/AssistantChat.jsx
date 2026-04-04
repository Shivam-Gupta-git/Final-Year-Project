import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { assistantChatThunk } from "../../features/user/aiSlice";

// ─────────────────────────────────────────────
// QUICK PROMPTS  (updated to match new intents)
// ─────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: "📍 Best places near me",           text: "Best places near me",                  category: "places" },
  { label: "🏨 Cheapest hotel under ₹1500",    text: "Find cheapest hotel under 1500",        category: "hotel"  },
  { label: "🥗 Best veg food nearby",          text: "Best veg food nearby",                  category: "food"   },
  { label: "🍗 Non veg restaurants near me",   text: "Non veg restaurants near me",           category: "food"   },
  { label: "📦 Track my order",                text: "Track my order",                        category: "order"  },
  { label: "🌴 Goa trip plan",                 text: "Goa, ₹15000, 3 days, honeymoon",        category: "travel" },
  { label: "👨‍👩‍👧 Family trip plan",              text: "Kerala, ₹20000, 5 days, family trip",   category: "travel" },
  { label: "🍕 Dinner spots near me",          text: "Best dinner spots near me",             category: "food"   },
];

const CATEGORIES = [
  { key: "all",    label: "All"    },
  { key: "places", label: "Places" },
  { key: "hotel",  label: "Hotels" },
  { key: "food",   label: "Food"   },
  { key: "travel", label: "Travel" },
  { key: "order",  label: "Order"  },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function formatCurrency(value) {
  if (value === null || value === undefined) return "N/A";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function ScopeBadge({ scope }) {
  if (scope !== "overall") return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-400 font-semibold uppercase tracking-widest mb-2">
      📡 Showing overall results · Location off
    </span>
  );
}

function AIBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[9px] text-violet-400 font-semibold uppercase tracking-widest mb-2">
      ✦ AI Answer · Powered by Gemini
    </span>
  );
}

// ─────────────────────────────────────────────
// STRUCTURED DATA RENDERER
// ─────────────────────────────────────────────
function StructuredData({ item, onNavigate, onViewMore }) {
  if (!item?.data) return null;
  const { data } = item;

  // ── Nearby Places ──────────────────────────
  if (data.type === "nearby_places" && Array.isArray(data.places)) {
    return (
      <div className="mt-3 flex flex-col gap-2">
        <ScopeBadge scope={data.scope} />
        {data.places.map((place) => (
          <div
            key={place._id || place.name}
            className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-zinc-950 p-3 pl-4 cursor-pointer hover:border-violet-500/40 hover:bg-zinc-900 transition-all duration-200 group"
            onClick={() => onNavigate("nearby_places", place)}
          >
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-violet-500 rounded-r opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start">
              <p className="font-semibold text-zinc-100 text-[13px]">{place.name}</p>
              {place.category && (
                <span className="text-[9px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded-full">{place.category}</span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">{place.address}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] text-zinc-400">⭐ {place.averageRating || 0}</span>
              {place.totalReviews > 0 && (
                <span className="text-[10px] text-zinc-600">({place.totalReviews} reviews)</span>
              )}
              {place.distance != null && (
                <span className="text-[11px] text-zinc-500">· {place.distance} km away</span>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onViewMore(data, "Nearby Places")}
          className="rounded-xl border border-dashed border-violet-500/30 py-2 text-[11px] font-bold text-violet-400 hover:bg-violet-500/10 hover:border-violet-400/50 tracking-widest uppercase transition-all duration-200"
        >
          View All Results →
        </button>
      </div>
    );
  }

  // ── Hotels ─────────────────────────────────
  if (data.type === "cheapest_hotel" && Array.isArray(data.hotels)) {
    return (
      <div className="mt-3 flex flex-col gap-2">
        <ScopeBadge scope={data.scope} />
        {data.hotels.map((hotel) => (
          <div
            key={hotel._id || hotel.name}
            className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-zinc-950 p-3 pl-4 cursor-pointer hover:border-sky-500/40 hover:bg-zinc-900 transition-all duration-200 group"
            onClick={() => onNavigate("cheapest_hotel", hotel)}
          >
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-sky-400 rounded-r opacity-60 group-hover:opacity-100 transition-opacity" />
            <p className="font-semibold text-zinc-100 text-[13px]">{hotel.name}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">{hotel.address}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] text-sky-400 font-semibold">{formatCurrency(hotel.cheapestRoom)}/night</span>
              {hotel.averageRating > 0 && (
                <span className="text-[11px] text-zinc-400">⭐ {hotel.averageRating}</span>
              )}
              {hotel.distance != null && (
                <span className="text-[11px] text-zinc-500">· {hotel.distance} km</span>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onViewMore(data, "Hotel Recommendations")}
          className="rounded-xl border border-dashed border-sky-500/30 py-2 text-[11px] font-bold text-sky-400 hover:bg-sky-500/10 hover:border-sky-400/50 tracking-widest uppercase transition-all duration-200"
        >
          View All Hotels →
        </button>
      </div>
    );
  }

  // ── Restaurants ────────────────────────────
  if (data.type === "food_suggestion" && Array.isArray(data.restaurants)) {
    return (
      <div className="mt-3 flex flex-col gap-2">
        <ScopeBadge scope={data.scope} />
        {data.restaurants.map((r) => (
          <div
            key={r._id || r.name}
            className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-zinc-950 p-3 pl-4 cursor-pointer hover:border-emerald-500/40 hover:bg-zinc-900 transition-all duration-200 group"
            onClick={() => onNavigate("food_suggestion", r)}
          >
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-400 rounded-r opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start">
              <p className="font-semibold text-zinc-100 text-[13px]">{r.name}</p>
              {r.foodType && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                  r.foodType === "veg"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                  {r.foodType === "veg" ? "🥗 VEG" : "🍗 NON-VEG"}
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">{r.address}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] text-emerald-400 font-semibold">{formatCurrency(r.avgCostForOne)} for one</span>
              <span className="text-[11px] text-zinc-400">⭐ {r.averageRating || 0}</span>
              {r.distance != null && (
                <span className="text-[11px] text-zinc-500">· {r.distance} km</span>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onViewMore(data, "Restaurant Recommendations")}
          className="rounded-xl border border-dashed border-emerald-500/30 py-2 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400/50 tracking-widest uppercase transition-all duration-200"
        >
          View All Restaurants →
        </button>
      </div>
    );
  }

  // ── Delivery Status ────────────────────────
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

  // ── Travel Plan ────────────────────────────
  if (data.type === "travel_plan") {
    const fields = [
      { label: "Destination", value: data.city },
      { label: "Budget",      value: data.budget ? formatCurrency(data.budget) : null },
      { label: "Duration",    value: data.days ? `${data.days} days` : null },
      { label: "Trip Type",   value: data.tripType },
      { label: "Needs",       value: Array.isArray(data.requiredFields) ? data.requiredFields.join(", ") : null },
    ].filter((f) => f.value);

    return (
      <div className="mt-3 rounded-xl border border-white/[0.07] bg-zinc-950 p-4 flex flex-col gap-2.5">
        {fields.map((f) => (
          <div key={f.label} className="flex justify-between items-center border-b border-white/4 pb-2 last:border-0 last:pb-0">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{f.label}</span>
            <span className="text-[13px] font-semibold text-zinc-100">{f.value}</span>
          </div>
        ))}
      </div>
    );
  }

  // ── Follow-up item ─────────────────────────
  if (data.type === "follow_up" && data.item) {
    const it = data.item;
    return (
      <div className="mt-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 flex flex-col gap-1.5">
        <p className="text-[10px] text-violet-400 uppercase tracking-widest font-bold mb-1">Selected Item</p>
        <p className="text-sm font-semibold text-zinc-100">{it.name}</p>
        {it.address && <p className="text-[11px] text-zinc-500">{it.address}</p>}
        {it.averageRating != null && (
          <p className="text-[11px] text-zinc-400">⭐ {it.averageRating}</p>
        )}
      </div>
    );
  }

  // ── General / AI ───────────────────────────
  if (data.type === "general" && data.handledByAI) {
    return <AIBadge />;
  }

  return null;
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
function AssistantChat() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.ai);

  const [input, setInput] = useState("");
  const [chatItems, setChatItems] = useState([
    {
      role: "assistant",
      text: "Hi! I can help with nearby places, hotels, food, travel plans, and order status. Ask me anything. 🌍",
      data: null,
      intent: null,
      createdAt: Date.now(),
    },
  ]);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [useLocation, setUseLocation] = useState(true);
  const [locationMessage, setLocationMessage] = useState("Fetching location...");
  const [activeCategory, setActiveCategory]   = useState("all");

  const messagesEndRef = useRef(null);

  // ── Geolocation ───────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationMessage("Location not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocationMessage("Location ready");
      },
      () => setLocationMessage("Permission denied"),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, []);

  // ── Auto scroll ───────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatItems, loading]);

  const locationReady = useMemo(
    () => location.latitude !== null && location.longitude !== null,
    [location]
  );

  // ── Filtered quick prompts ─────────────────
  const filteredPrompts = useMemo(() => {
    return QUICK_PROMPTS.filter((p) =>
      activeCategory === "all" ? true : p.category === activeCategory
    );
  }, [activeCategory]);

  // ── Autocomplete suggestions while typing ─
  const autoSuggestions = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return [];
    return QUICK_PROMPTS.filter((p) => p.text.toLowerCase().includes(q)).slice(0, 4);
  }, [input]);

  // ── Navigation helpers ────────────────────
  const handleItemNavigation = (type, item) => {
    if (!item) return;
    if (type === "cheapest_hotel") { navigate(`/hotels/${item._id}`); return; }
    if (type === "food_suggestion") { navigate(`/restaurant/${item._id}`); return; }
    if (type === "nearby_places") {
      const lat = item?.location?.coordinates?.[1];
      const lng = item?.location?.coordinates?.[0];
      if (lat && lng) window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
    }
  };

  const handleViewMore = (data, title) => {
    navigate("/assistantChat/recommendations", { state: { data, title } });
  };

  // ── Send message ──────────────────────────
  const sendMessage = async (messageText) => {
    const trimmed = messageText.trim();
    if (!trimmed || loading) return;

    setChatItems((prev) => [
      ...prev,
      { role: "user", text: trimmed, data: null, intent: null, createdAt: Date.now() },
    ]);
    setInput("");

    const payload = { message: trimmed };
    if (useLocation && locationReady) {
      payload.latitude  = location.latitude;
      payload.longitude = location.longitude;
    }

    try {
      const result = await dispatch(assistantChatThunk(payload)).unwrap();
      setChatItems((prev) => [
        ...prev,
        {
          role: "assistant",
          text:   result?.reply  || "No response.",
          data:   result?.data   || null,
          intent: result?.intent || null,
          createdAt: Date.now(),
        },
      ]);
    } catch (err) {
      setChatItems((prev) => [
        ...prev,
        {
          role: "assistant",
          text: err?.reply || err?.message || "Something went wrong. Please try again.",
          data: null, intent: null, createdAt: Date.now(),
        },
      ]);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(input); };

  const refreshLocation = () => {
    if (!navigator.geolocation) return;
    setLocationMessage("Refreshing...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocationMessage("Location ready");
      },
      () => setLocationMessage("Permission denied"),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  // ── Location dot color ────────────────────
  const locDotColor =
    locationMessage === "Location ready"
      ? "bg-emerald-400"
      : locationMessage.includes("denied") || locationMessage.includes("not supported")
      ? "bg-red-400"
      : "bg-amber-400 animate-pulse";

  // ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080809] p-3 sm:p-6 flex items-start justify-center">
      <div className="w-full max-w-5xl rounded-2xl border border-white/[0.07] bg-[#0f0f11] shadow-2xl overflow-hidden flex flex-col">

        {/* ── HEADER ────────────────────────── */}
        <div className="relative flex items-center justify-between px-5 sm:px-7 py-4 border-b border-white/6">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-violet-500/40 to-transparent" />

          <div className="flex items-center gap-3.5">
            <div className="relative w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-lg shrink-0">
              🤖
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0f0f11]" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-zinc-100 tracking-tight">Smart Assistant</h1>
              <p className="text-[10px] text-zinc-500 tracking-widest mt-0.5 uppercase">
                Places · Hotels · Food · Trips · Orders
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

        {/* ── CONTROLS BAR ──────────────────── */}
        <div className="px-5 sm:px-7 py-3 border-b border-white/5 bg-[#0c0c0e] flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setUseLocation((v) => !v)}
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

          {CATEGORIES.map((cat) => (
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

        {/* ── MESSAGES ──────────────────────── */}
        <div className="h-[58vh] overflow-y-auto px-5 sm:px-7 py-5 flex flex-col gap-4 scroll-smooth [scrollbar-width:thin] [scrollbar-color:#27272a_transparent]">
          {chatItems.map((item, idx) => {
            const isUser = item.role === "user";
            const timeStr = new Date(item.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit", minute: "2-digit",
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
                    {/* Show AI badge ABOVE text for general intent */}
                    {!isUser && item.data?.type === "general" && item.data?.handledByAI && (
                      <div className="mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[9px] text-violet-400 font-semibold uppercase tracking-widest">
                          ✦ Gemini AI
                        </span>
                      </div>
                    )}

                    <p className="whitespace-pre-line">{item.text}</p>

                    {!isUser && (
                      <StructuredData
                        item={item}
                        onNavigate={handleItemNavigation}
                        onViewMore={handleViewMore}
                      />
                    )}
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

        {/* ── INPUT AREA ────────────────────── */}
        <div className="border-t border-white/6 bg-[#0c0c0e] px-5 sm:px-7 py-4 flex flex-col gap-3">

          {/* Quick prompts filtered by category */}
          <div className="flex flex-wrap gap-2">
            {filteredPrompts.map((p) => (
              <button
                key={p.text}
                type="button"
                onClick={() => sendMessage(p.text)}
                disabled={loading}
                className="px-3 py-1.5 rounded-full border border-white/8 bg-zinc-900 text-[11px] text-zinc-400 hover:border-violet-500/40 hover:text-violet-300 hover:bg-violet-500/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input row */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit(e)}
              placeholder="Ask about places, food, hotels, trips..."
              className="flex-1 h-11 rounded-xl border border-white/8 bg-zinc-900 px-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              className="h-11 px-6 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-violet-950/60 hover:from-violet-500 hover:to-indigo-500 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0 transition-all duration-200"
            >
              Send ↑
            </button>
          </div>

          {/* Autocomplete while typing */}
          {autoSuggestions.length > 0 && input.trim() && (
            <div className="flex flex-wrap gap-2">
              {autoSuggestions.map((s) => (
                <button
                  key={s.text}
                  type="button"
                  onClick={() => setInput(s.text)}
                  className="px-3 py-1 rounded-full border border-white/6 bg-zinc-950 text-[11px] text-zinc-500 hover:text-zinc-200 hover:border-white/[0.14] transition-all duration-150"
                >
                  {s.label}
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
