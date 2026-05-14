import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { assistantChatThunk } from "../../features/user/aiSlice";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  { label: "📍 Best places near me",         text: "Best places near me",                 category: "places" },
  { label: "🏛️ Historical places",           text: "Historical places near me",           category: "places" },
  { label: "🏨 Hotel under ₹1500",           text: "Find cheapest hotel under 1500",       category: "hotel"  },
  { label: "🌊 Beach hotels",               text: "Beach hotels under 3000",              category: "hotel"  },
  { label: "🥗 Best veg food",              text: "Best veg food nearby",                 category: "food"   },
  { label: "🍗 Non-veg restaurants",        text: "Non veg restaurants near me",          category: "food"   },
  { label: "🍕 Dinner spots",              text: "Best dinner spots near me",            category: "food"   },
  { label: "☕ Cafes nearby",              text: "Best cafes near me",                   category: "food"   },
  { label: "📦 Track my order",            text: "Track my order",                       category: "order"  },
  { label: "🌴 Goa trip ₹15k",            text: "Goa, ₹15000, 3 days, honeymoon",       category: "travel" },
  { label: "👨‍👩‍👧 Kerala family trip",       text: "Kerala, ₹20000, 5 days, family trip",  category: "travel" },
  { label: "🏔️ Manali adventure",         text: "Manali, ₹10000, 4 days, adventure",    category: "travel" },
];

const CATEGORIES = [
  { key: "all",    label: "All",    emoji: "✦"  },
  { key: "places", label: "Places", emoji: "📍" },
  { key: "hotel",  label: "Hotels", emoji: "🏨" },
  { key: "food",   label: "Food",   emoji: "🍽️" },
  { key: "travel", label: "Travel", emoji: "✈️" },
  { key: "order",  label: "Orders", emoji: "📦" },
];

const INTENT_CONFIG = {
  nearby_places:   { color: "#7C3AED", bg: "#F5F3FF", label: "Nearby Places",  icon: "📍" },
  cheapest_hotel:  { color: "#0284C7", bg: "#EFF6FF", label: "Hotel Search",   icon: "🏨" },
  food_suggestion: { color: "#059669", bg: "#ECFDF5", label: "Food & Dining",  icon: "🍽️" },
  delivery_status: { color: "#D97706", bg: "#FFFBEB", label: "Order Tracking", icon: "📦" },
  travel_plan:     { color: "#DB2777", bg: "#FDF2F8", label: "Trip Planner",   icon: "✈️" },
  follow_up:       { color: "#7C3AED", bg: "#F5F3FF", label: "Follow-up",      icon: "💬" },
  general:         { color: "#4F46E5", bg: "#EEF2FF", label: "AI Answer",      icon: "✦"  },
};

// ─── UTILS ────────────────────────────────────────────────────────────────────

function fmt(v) {
  if (v === null || v === undefined) return "N/A";
  return `₹${Number(v).toLocaleString("en-IN")}`;
}

function timeStr(ts) {
  return new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// ─── SMALL UI PIECES ──────────────────────────────────────────────────────────

function StarRow({ rating }) {
  const n = Math.min(5, Math.max(0, Math.round(Number(rating) || 0)));
  return (
    <span style={{ fontSize: 11, color: "#F59E0B", letterSpacing: 1 }}>
      {"★".repeat(n)}<span style={{ color: "#E5E7EB" }}>{"★".repeat(5 - n)}</span>
    </span>
  );
}

function ScopeBadge({ scope }) {
  if (scope !== "overall") return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 20, background: "#FFFBEB", border: "1px solid #FDE68A", marginBottom: 8 }}>
      <span style={{ fontSize: 10 }}>📡</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: "#92400E" }}>
        Showing overall results · Enable location for nearby results
      </span>
    </div>
  );
}

function DistancePill({ distance }) {
  if (distance == null) return null;
  return (
    <span style={{ fontSize: 10, color: "#6B7280", background: "#F3F4F6", borderRadius: 8, padding: "2px 7px" }}>
      📍 {distance} km
    </span>
  );
}

function ViewAllBtn({ onClick, color, bg, label }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", padding: "10px", borderRadius: 12, cursor: "pointer",
        border: `1.5px ${hov ? "solid" : "dashed"} ${color}55`,
        background: hov ? color + "12" : bg,
        color, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
        transition: "all 0.15s",
      }}
    >
      {label} →
    </button>
  );
}

// ─── RESULT CARDS ─────────────────────────────────────────────────────────────

function PlaceCard({ place, onClick, index }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 14, border: `1px solid ${hov ? "#8B5CF6" : "#EDE9FE"}`,
        background: hov ? "#FAFAFA" : "white",
        padding: "12px 14px 12px 16px", cursor: "pointer",
        position: "relative", overflow: "hidden",
        transform: hov ? "translateX(4px)" : "translateX(0)",
        transition: "all 0.18s",
        animation: `cardIn 0.3s ease ${index * 0.07}s both`,
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "linear-gradient(180deg,#8B5CF6,#6D28D9)", borderRadius: "0 2px 2px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{place.name}</span>
        {place.category && (
          <span style={{ fontSize: 9, background: "#EDE9FE", color: "#5B21B6", borderRadius: 20, padding: "2px 7px", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>
            {place.category}
          </span>
        )}
      </div>
      {place.address && <p style={{ fontSize: 11, color: "#9CA3AF", margin: "3px 0 6px" }}>{place.address}</p>}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {place.averageRating > 0 && <StarRow rating={place.averageRating} />}
        {place.totalReviews > 0 && <span style={{ fontSize: 10, color: "#9CA3AF" }}>({place.totalReviews})</span>}
        <DistancePill distance={place.distance} />
      </div>
    </div>
  );
}

function HotelCard({ hotel, onClick, index }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 14, border: `1px solid ${hov ? "#3B82F6" : "#DBEAFE"}`,
        background: hov ? "#FAFAFA" : "white",
        padding: "12px 14px 12px 16px", cursor: "pointer",
        position: "relative", overflow: "hidden",
        transform: hov ? "translateX(4px)" : "translateX(0)",
        transition: "all 0.18s",
        animation: `cardIn 0.3s ease ${index * 0.07}s both`,
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "linear-gradient(180deg,#3B82F6,#1D4ED8)", borderRadius: "0 2px 2px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{hotel.name}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#1D4ED8", background: "#EFF6FF", borderRadius: 8, padding: "2px 9px", whiteSpace: "nowrap", flexShrink: 0 }}>
          {fmt(hotel.cheapestRoom)}<span style={{ fontWeight: 400, fontSize: 10, color: "#3B82F6" }}>/night</span>
        </span>
      </div>
      {hotel.address && <p style={{ fontSize: 11, color: "#9CA3AF", margin: "3px 0 6px" }}>{hotel.address}</p>}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {hotel.averageRating > 0 && <StarRow rating={hotel.averageRating} />}
        <DistancePill distance={hotel.distance} />
      </div>
    </div>
  );
}

function RestaurantCard({ r, onClick, index }) {
  const [hov, setHov] = useState(false);
  const isVeg = r.foodType === "veg";
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 14, border: `1px solid ${hov ? "#10B981" : "#D1FAE5"}`,
        background: hov ? "#FAFAFA" : "white",
        padding: "12px 14px 12px 16px", cursor: "pointer",
        position: "relative", overflow: "hidden",
        transform: hov ? "translateX(4px)" : "translateX(0)",
        transition: "all 0.18s",
        animation: `cardIn 0.3s ease ${index * 0.07}s both`,
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "linear-gradient(180deg,#10B981,#047857)", borderRadius: "0 2px 2px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{r.name}</span>
        {r.foodType && (
          <span style={{
            fontSize: 9, borderRadius: 20, padding: "2px 8px", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0,
            background: isVeg ? "#ECFDF5" : "#FEF2F2",
            color: isVeg ? "#065F46" : "#991B1B",
            border: `1px solid ${isVeg ? "#A7F3D0" : "#FECACA"}`,
          }}>
            {isVeg ? "🥗 VEG" : "🍗 NON-VEG"}
          </span>
        )}
      </div>
      {r.address && <p style={{ fontSize: 11, color: "#9CA3AF", margin: "3px 0 6px" }}>{r.address}</p>}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#065F46" }}>{fmt(r.avgCostForOne)} for one</span>
        {r.averageRating > 0 && <StarRow rating={r.averageRating} />}
        <DistancePill distance={r.distance} />
      </div>
    </div>
  );
}

// ─── STRUCTURED DATA ──────────────────────────────────────────────────────────

function StructuredData({ item, onNavigate, onViewMore }) {
  if (!item?.data) return null;
  const { data } = item;

  // Nearby Places
  if (data.type === "nearby_places" && Array.isArray(data.places)) {
    if (!data.places.length) return <EmptyResult label="No places found nearby." />;
    return (
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <ScopeBadge scope={data.scope} />
        {data.places.slice(0, 4).map((place, i) => (
          <PlaceCard key={place._id || place.name} place={place} index={i}
            onClick={() => onNavigate("nearby_places", place)} />
        ))}
        {data.places.length > 4 && (
          <ViewAllBtn onClick={() => onViewMore(data, "Nearby Places")}
            color="#7C3AED" bg="#F5F3FF"
            label={`View all ${data.places.length} places`} />
        )}
      </div>
    );
  }

  // Hotels
  if (data.type === "cheapest_hotel" && Array.isArray(data.hotels)) {
    if (!data.hotels.length) return <EmptyResult label="No hotels found matching your criteria." />;
    return (
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <ScopeBadge scope={data.scope} />
        {data.hotels.slice(0, 4).map((hotel, i) => (
          <HotelCard key={hotel._id || hotel.name} hotel={hotel} index={i}
            onClick={() => onNavigate("cheapest_hotel", hotel)} />
        ))}
        {data.hotels.length > 4 && (
          <ViewAllBtn onClick={() => onViewMore(data, "Hotel Recommendations")}
            color="#1D4ED8" bg="#EFF6FF"
            label={`View all ${data.hotels.length} hotels`} />
        )}
      </div>
    );
  }

  // Restaurants
  if (data.type === "food_suggestion" && Array.isArray(data.restaurants)) {
    if (!data.restaurants.length) return <EmptyResult label="No restaurants found nearby." />;
    return (
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <ScopeBadge scope={data.scope} />
        {data.restaurants.slice(0, 4).map((r, i) => (
          <RestaurantCard key={r._id || r.name} r={r} index={i}
            onClick={() => onNavigate("food_suggestion", r)} />
        ))}
        {data.restaurants.length > 4 && (
          <ViewAllBtn onClick={() => onViewMore(data, "Restaurant Recommendations")}
            color="#047857" bg="#ECFDF5"
            label={`View all ${data.restaurants.length} restaurants`} />
        )}
      </div>
    );
  }

  // Delivery status
  if (data.type === "delivery_status") {
    if (!data.deliveryBoy) return <EmptyResult label="Order details not available." />;
    return (
      <div style={{ marginTop: 12, borderRadius: 14, border: "1px solid #FDE68A", background: "#FFFBEB", padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 16 }}>📦</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#92400E", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Live Order Tracking
          </span>
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block", animation: "pulseDot 2s infinite" }} />
            <span style={{ fontSize: 10, color: "#059669", fontWeight: 700 }}>LIVE</span>
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "Delivery Partner", value: data.deliveryBoy.name },
            { label: "Contact",          value: data.deliveryBoy.contact },
            data.orderId && { label: "Order ID", value: data.orderId },
            data.status  && { label: "Status",   value: data.status  },
          ].filter(Boolean).map((f) => (
            <div key={f.label} style={{ background: "white", borderRadius: 10, padding: "10px 12px", border: "1px solid #FDE68A" }}>
              <p style={{ fontSize: 9, color: "#92400E", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 3px" }}>{f.label}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>{f.value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Travel plan
  if (data.type === "travel_plan") {
    const fields = [
      { icon: "📍", label: "Destination", value: data.city },
      { icon: "💰", label: "Budget",      value: data.budget ? fmt(data.budget) : null },
      { icon: "📅", label: "Duration",    value: data.days ? `${data.days} days` : null },
      { icon: "✈️", label: "Trip Type",   value: data.tripType },
      { icon: "✓",  label: "Includes",    value: Array.isArray(data.requiredFields) ? data.requiredFields.join(", ") : null },
    ].filter((f) => f.value);

    return (
      <div style={{ marginTop: 12, borderRadius: 14, border: "1px solid #FCE7F3", background: "#FDF2F8", padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <span style={{ fontSize: 16 }}>✈️</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#9D174D", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Trip Summary
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {fields.map((f) => (
            <div key={f.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", background: "white", borderRadius: 10, border: "1px solid #FCE7F3" }}>
              <span style={{ fontSize: 11, color: "#BE185D", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                <span>{f.icon}</span>{f.label}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{f.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Follow-up
  if (data.type === "follow_up" && data.item) {
    const it = data.item;
    return (
      <div style={{ marginTop: 10, borderRadius: 14, border: "1px solid #EDE9FE", background: "#F5F3FF", padding: "12px 14px" }}>
        <p style={{ fontSize: 10, color: "#6D28D9", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px" }}>
          Selected Item
        </p>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>{it.name}</p>
        {it.address && <p style={{ fontSize: 11, color: "#9CA3AF", margin: "3px 0 0" }}>{it.address}</p>}
        {it.averageRating != null && (
          <div style={{ marginTop: 5 }}>
            <StarRow rating={it.averageRating} />
          </div>
        )}
      </div>
    );
  }

  // General / AI
  if (data.type === "general" && data.handledByAI) return null; // badge shown in bubble header

  return null;
}

function EmptyResult({ label }) {
  return (
    <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 12, background: "#F9FAFB", border: "1px solid #F3F4F6", color: "#9CA3AF", fontSize: 12, textAlign: "center" }}>
      {label}
    </div>
  );
}

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────

function MessageBubble({ item, onNavigate, onViewMore }) {
  const isUser = item.role === "user";
  const cfg = item.intent ? INTENT_CONFIG[item.intent] : null;
  const isAI = item.data?.type === "general" && item.data?.handledByAI;

  return (
    <div style={{
      display: "flex", alignItems: "flex-end", gap: 10,
      justifyContent: isUser ? "flex-end" : "flex-start",
      animation: "msgIn 0.28s cubic-bezier(0.34,1.4,0.64,1) both",
    }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: 10, flexShrink: 0, marginBottom: 4,
          background: "linear-gradient(135deg,#7C3AED,#4F46E5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, boxShadow: "0 3px 10px #7C3AED33",
        }}>✦</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 5, maxWidth: "80%", alignItems: isUser ? "flex-end" : "flex-start" }}>

        {/* Intent / AI badge */}
        {!isUser && cfg && item.intent !== "general" && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: cfg.bg, border: `1px solid ${cfg.color}22` }}>
            <span style={{ fontSize: 10 }}>{cfg.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.07em" }}>{cfg.label}</span>
          </div>
        )}
        {!isUser && isAI && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: "#EEF2FF", border: "1px solid #A5B4FC33" }}>
            <span style={{ fontSize: 9 }}>✦</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#4338CA", textTransform: "uppercase", letterSpacing: "0.07em" }}>AI Answer · Gemini</span>
          </div>
        )}

        {/* Bubble */}
        <div style={{
          borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
          padding: "11px 15px",
          background: isUser ? "linear-gradient(135deg,#4F46E5,#7C3AED)" : "white",
          color: isUser ? "white" : "#111827",
          border: isUser ? "none" : "1px solid #F3F4F6",
          boxShadow: isUser ? "0 4px 16px #4F46E522" : "0 2px 12px rgba(0,0,0,0.05)",
          fontSize: 13.5, lineHeight: 1.65,
        }}>
          <p style={{ margin: 0, whiteSpace: "pre-line" }}>{item.text}</p>
          {!isUser && (
            <StructuredData item={item} onNavigate={onNavigate} onViewMore={onViewMore} />
          )}
        </div>

        <span style={{ fontSize: 9, color: "#9CA3AF", padding: "0 4px" }}>{timeStr(item.createdAt)}</span>
      </div>

      {isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: 10, flexShrink: 0, marginBottom: 4,
          background: "linear-gradient(135deg,#E0E7FF,#C7D2FE)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 800, color: "#4338CA",
        }}>YOU</div>
      )}
    </div>
  );
}

// ─── TYPING INDICATOR ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, background: "linear-gradient(135deg,#7C3AED,#4F46E5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✦</div>
      <div style={{ borderRadius: "4px 18px 18px 18px", padding: "13px 18px", background: "white", border: "1px solid #F3F4F6", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 5 }}>
        {[0, 0.18, 0.36].map((d, i) => (
          <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: `linear-gradient(135deg,#7C3AED,#4F46E5)`, display: "inline-block", animation: `bounceDot 1.2s ease ${d}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function AssistantChat() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.ai);

  const [input, setInput]                 = useState("");
  const [focused, setFocused]             = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [useLocation, setUseLocation]     = useState(true);
  const [locStatus, setLocStatus]         = useState("fetching"); // fetching|ready|denied|unsupported
  const [location, setLocation]           = useState({ latitude: null, longitude: null });
  const [chatItems, setChatItems]         = useState([
    {
      role: "assistant",
      text: "Hey! 👋 I'm your smart travel assistant.\n\nAsk me anything — nearby places, cheapest hotels, best food spots, trip planning, or order tracking. Just type or tap a suggestion below!",
      data: null, intent: null, createdAt: Date.now(),
    },
  ]);

  const endRef  = useRef(null);
  const inputRef = useRef(null);

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) { setLocStatus("unsupported"); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => { setLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude }); setLocStatus("ready"); },
      ()  => setLocStatus("denied"),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatItems, loading]);

  const locationReady = location.latitude !== null;

  const filteredPrompts = useMemo(
    () => QUICK_PROMPTS.filter((p) => activeCategory === "all" || p.category === activeCategory),
    [activeCategory]
  );

  const suggestions = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (q.length < 2) return [];
    return QUICK_PROMPTS.filter((p) => p.text.toLowerCase().includes(q) || p.label.toLowerCase().includes(q)).slice(0, 3);
  }, [input]);

  const handleNav = useCallback((type, item) => {
    if (!item) return;
    if (type === "cheapest_hotel")  { navigate(`/hotels/${item._id}`);     return; }
    if (type === "food_suggestion") { navigate(`/restaurant/${item._id}`); return; }
    if (type === "nearby_places") {
      const lat = item?.location?.coordinates?.[1];
      const lng = item?.location?.coordinates?.[0];
      if (lat && lng) window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
    }
  }, [navigate]);

  const handleViewMore = useCallback((data, title) => {
    navigate("/assistantChat/recommendations", { state: { data, title } });
  }, [navigate]);

  const send = useCallback(async (text) => {
    const msg = text.trim();
    if (!msg || loading) return;
    setInput("");
    setChatItems((p) => [...p, { role: "user", text: msg, data: null, intent: null, createdAt: Date.now() }]);
    inputRef.current?.focus();

    const payload = { message: msg };
    if (useLocation && locationReady) {
      payload.latitude  = location.latitude;
      payload.longitude = location.longitude;
    }

    try {
      const res = await dispatch(assistantChatThunk(payload)).unwrap();
      setChatItems((p) => [
        ...p,
        { role: "assistant", text: res?.reply || "No response.", data: res?.data || null, intent: res?.intent || null, createdAt: Date.now() },
      ]);
    } catch (e) {
      setChatItems((p) => [
        ...p,
        { role: "assistant", text: e?.reply || e?.message || "Something went wrong. Please try again.", data: null, intent: null, createdAt: Date.now() },
      ]);
    }
  }, [loading, useLocation, locationReady, location, dispatch]);

  const refreshLoc = () => {
    setLocStatus("fetching");
    navigator.geolocation?.getCurrentPosition(
      (p) => { setLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude }); setLocStatus("ready"); },
      ()  => setLocStatus("denied"),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const LOC = {
    ready:       { dot: "#10B981", text: "Location ready",     bg: "#ECFDF5", col: "#065F46" },
    fetching:    { dot: "#F59E0B", text: "Getting location…",  bg: "#FFFBEB", col: "#92400E", pulse: true },
    denied:      { dot: "#EF4444", text: "Location denied",    bg: "#FEF2F2", col: "#991B1B" },
    unsupported: { dot: "#9CA3AF", text: "Not supported",      bg: "#F9FAFB", col: "#374151" },
  }[locStatus];

  return (
    <>
      <style>{`
        @keyframes msgIn    { from{opacity:0;transform:translateY(10px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes cardIn   { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
        @keyframes bounceDot{ 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-8px)} }
        @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .chat-scroll::-webkit-scrollbar{width:4px}
        .chat-scroll::-webkit-scrollbar-thumb{background:#E5E7EB;border-radius:4px}
        .chat-scroll::-webkit-scrollbar-track{background:transparent}
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(150deg,#F0F4FF 0%,#F8FAFC 50%,#F5F3FF 100%)",
        padding: "16px", display: "flex", justifyContent: "center", alignItems: "flex-start",
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      }}>
        <div style={{
          width: "100%", maxWidth: 860,
          borderRadius: 24, overflow: "hidden",
          border: "1px solid #E5E7EB",
          background: "white",
          boxShadow: "0 8px 48px rgba(79,70,229,0.08), 0 1px 4px rgba(0,0,0,0.04)",
          display: "flex", flexDirection: "column",
          animation: "fadeUp 0.4s ease both",
        }}>

          {/* ── HEADER ── */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6", background: "linear-gradient(to right,#FAFBFF,white)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative", width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#7C3AED,#4F46E5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 4px 14px #7C3AED33", flexShrink: 0 }}>
                🤖
                <span style={{ position: "absolute", bottom: -2, right: -2, width: 12, height: 12, borderRadius: "50%", background: "#10B981", border: "2.5px solid white" }} />
              </div>
              <div>
                <h1 style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.02em" }}>Smart Travel Assistant</h1>
                <p style={{ fontSize: 10, color: "#9CA3AF", margin: "2px 0 0", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>Places · Hotels · Food · Trips · Orders</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {/* Location badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 11px", borderRadius: 20, background: LOC.bg, border: `1px solid ${LOC.dot}22` }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: LOC.dot, display: "inline-block", animation: LOC.pulse ? "pulseDot 1.5s infinite" : "none" }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: LOC.col }}>{LOC.text}</span>
                {locStatus === "denied" && (
                  <button onClick={refreshLoc} style={{ fontSize: 10, color: LOC.col, background: "none", border: "none", cursor: "pointer", fontWeight: 700, padding: 0 }}>Retry</button>
                )}
              </div>

              {/* Toggle location */}
              <button onClick={() => setUseLocation(v => !v)} style={{
                display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 20, cursor: "pointer",
                background: useLocation ? "#EEF2FF" : "#F9FAFB",
                border: `1.5px solid ${useLocation ? "#A5B4FC" : "#E5E7EB"}`,
                color: useLocation ? "#4338CA" : "#6B7280",
                fontSize: 10, fontWeight: 700, transition: "all 0.15s",
              }}>
                {useLocation ? "📍 Location On" : "📴 Location Off"}
              </button>

              <button
                onClick={() => navigate(-1)}
                style={{ padding: "7px 14px", borderRadius: 12, border: "1px solid #E5E7EB", background: "white", color: "#374151", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#7C3AED"; e.currentTarget.style.color = "#7C3AED"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#374151"; }}
              >
                ← Back
              </button>
            </div>
          </div>

          {/* ── CATEGORY TABS ── */}
          <div style={{ padding: "10px 20px", borderBottom: "1px solid #F3F4F6", background: "#FAFAFA", display: "flex", gap: 6, overflowX: "auto" }}>
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.key;
              return (
                <button key={cat.key} onClick={() => setActiveCategory(cat.key)} style={{
                  padding: "5px 14px", borderRadius: 20, border: `1.5px solid ${active ? "#7C3AED" : "#E5E7EB"}`,
                  background: active ? "#EEF2FF" : "white", color: active ? "#4F46E5" : "#6B7280",
                  fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                  display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s", flexShrink: 0,
                }}>
                  <span>{cat.emoji}</span>{cat.label}
                </button>
              );
            })}
          </div>

          {/* ── MESSAGES ── */}
          <div className="chat-scroll" style={{ flex: 1, height: "calc(100vh - 400px)", minHeight: 300, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
            {chatItems.map((item, idx) => (
              <MessageBubble key={`${item.createdAt}-${idx}`} item={item} onNavigate={handleNav} onViewMore={handleViewMore} />
            ))}
            {loading && <TypingIndicator />}
            {error && !loading && (
              <div style={{ textAlign: "center", padding: "8px 16px", borderRadius: 10, background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: 11, fontWeight: 600 }}>
                ⚠ {error}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* ── INPUT AREA ── */}
          <div style={{ borderTop: "1px solid #F3F4F6", background: "#FAFAFA", padding: "14px 20px 18px", display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Quick prompts */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {filteredPrompts.map((p) => (
                <button key={p.text} type="button" onClick={() => send(p.text)} disabled={loading} style={{
                  padding: "5px 12px", borderRadius: 20, border: "1px solid #E5E7EB",
                  background: "white", color: "#4B5563", fontSize: 11, fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.45 : 1, transition: "all 0.15s",
                }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = "#7C3AED"; e.currentTarget.style.color = "#5B21B6"; e.currentTarget.style.background = "#F5F3FF"; } }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.color = "#4B5563"; e.currentTarget.style.background = "white"; }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Autocomplete */}
            {suggestions.length > 0 && input.length >= 2 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600 }}>Suggestions:</span>
                {suggestions.map((s) => (
                  <button key={s.text} type="button" onClick={() => { setInput(s.text); inputRef.current?.focus(); }} style={{
                    padding: "4px 10px", borderRadius: 16, border: "1px solid #DDD6FE", background: "#F5F3FF", color: "#5B21B6", fontSize: 11, fontWeight: 600, cursor: "pointer",
                  }}>
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {/* Text input row */}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{
                flex: 1, display: "flex", alignItems: "center", borderRadius: 16,
                border: `1.5px solid ${focused ? "#7C3AED" : "#E5E7EB"}`,
                background: "white", padding: "0 14px",
                boxShadow: focused ? "0 0 0 3px #7C3AED14" : "none",
                transition: "all 0.2s",
              }}>
                <span style={{ fontSize: 15, marginRight: 8, flexShrink: 0 }}>💬</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Ask about places, hotels, food, trips, orders…"
                  disabled={loading}
                  style={{ flex: 1, height: 46, border: "none", outline: "none", background: "transparent", fontSize: 13.5, color: "#111827", fontFamily: "inherit" }}
                />
                {input && (
                  <button onClick={() => { setInput(""); inputRef.current?.focus(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 4, fontSize: 13 }}>✕</button>
                )}
              </div>

              <button type="button" onClick={() => send(input)} disabled={loading || !input.trim()} style={{
                height: 46, padding: "0 22px", borderRadius: 16, border: "none",
                background: !loading && input.trim() ? "linear-gradient(135deg,#7C3AED,#4F46E5)" : "#E5E7EB",
                color: !loading && input.trim() ? "white" : "#9CA3AF",
                fontSize: 13, fontWeight: 800, cursor: !loading && input.trim() ? "pointer" : "not-allowed",
                boxShadow: !loading && input.trim() ? "0 4px 14px #7C3AED44" : "none",
                transition: "all 0.2s", letterSpacing: "0.01em",
              }}
                onMouseEnter={e => { if (!loading && input.trim()) e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {loading ? "…" : "Send ↑"}
              </button>
            </div>

            <p style={{ fontSize: 10, color: "#C4C9D4", textAlign: "center", margin: 0, fontWeight: 500 }}>
              Try: "Cheapest hotel in Delhi under ₹1500" · "Best veg restaurants near me" · "Plan a 3-day Goa trip"
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
