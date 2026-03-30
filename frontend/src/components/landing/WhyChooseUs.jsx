import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ─── Mock API ─────────────────────────────────────────────
const MOCK_DB = [
  {
    id: 1,
    active: true,
    route: "/hotels",
    icon: "🏨",
    tag: "STAY",
    title: "Handpicked Hotels",
    desc: "Every property is personally vetted for comfort, location, and value. No filler listings — just places worth staying.",
    stat: "12,000+",
    statLabel: "properties",
    color: ["#667eea", "#764ba2"],
  },
  {
    id: 2,
    active: true,
    route: "/places",
    icon: "🗺️",
    tag: "EXPLORE",
    title: "Hidden Destinations",
    desc: "Beyond the tourist trail. We surface secret spots, offbeat routes, and local gems that never make the front page.",
    stat: "180+",
    statLabel: "countries",
    color: ["#f093fb", "#f5576c"],
  },
  {
    id: 3,
    active: true,
    route: "/RestaurantLandingPage",
    icon: "🍜",
    tag: "EAT",
    title: "Local Food Trails",
    desc: "Eat where the locals eat. Curated food experiences, street food maps.",
    stat: "8,400+",
    statLabel: "eateries",
    color: ["#4facfe", "#00f2fe"],
  },
  {
    id: 4,
    active: true,
    route: "/travel",
    icon: "✈️",
    tag: "TRAVEL",
    title: "Seamless Journeys",
    desc: "Flights, transfers, and ground transport — coordinated in one place. No juggling apps, no missed connections.",
    stat: "99.2%",
    statLabel: "on-time rate",
    color: ["#43e97b", "#38f9d7"],
  },
  {
    id: 5,
    active: true,
    route: "/support",
    icon: "🛡️",
    tag: "TRUST",
    title: "24/7 Travel Guard",
    desc: "Real humans, real-time. Whether it's a cancelled flight at 2am or a lost booking — we pick up every time.",
    stat: "< 2 min",
    statLabel: "response time",
    color: ["#fa709a", "#fee140"],
  },
  {
    id: 6,
    active: true,
    route: "/deals",
    icon: "💎",
    tag: "VALUE",
    title: "Members-Only Deals",
    desc: "Exclusive rates negotiated directly with partners. Members save an average of 34% compared to booking direct.",
    stat: "34%",
    statLabel: "avg. savings",
    color: ["#a18cd1", "#fbc2eb"],
  },
  {
    id: 7,
    active: false,
    route: "/insurance",
    icon: "📋",
    tag: "PLAN",
    title: "Travel Insurance",
    desc: "Coming soon.",
    stat: "",
    statLabel: "",
    color: ["#ccc", "#eee"],
  },
];

// ─── API ─────────────────────────────────────────────
async function fetchFeatures() {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ data: MOCK_DB }), 800)
  );
}

// ─── Particles ─────────────────────────────────────────────
function Particles() {
  const dots = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    size: 2 + Math.random() * 4,
    x: Math.random() * 100,
    y: Math.random() * 100,
    dur: 6 + Math.random() * 10,
    delay: Math.random() * 8,
    opacity: 0.06 + Math.random() * 0.16,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      {dots.map((d) => (
        <div
          key={d.id}
          style={{
            position: "absolute",
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            borderRadius: "50%",
            background: "#fff",
            opacity: d.opacity,
            animation: `floatDot ${d.dur}s ${d.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Feature Card (UNCHANGED LOGIC) ─────────────────────
function FeatureCard({ feature, index, onNavigate }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 110);
    return () => clearTimeout(t);
  }, [index]);

  const [c1, c2] = feature.color;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        setPressed(true);
        setTimeout(() => {
          setPressed(false);
          onNavigate(feature);
        }, 160);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-[20px] p-[32px_28px_28px] cursor-pointer backdrop-blur-[20px] border flex flex-col transition-all duration-300"
      style={{
        background: hovered
          ? "rgba(255,255,255,.17)"
          : "rgba(255,255,255,.08)",
        borderColor: hovered
          ? "rgba(255,255,255,.32)"
          : "rgba(255,255,255,.13)",
        boxShadow: hovered
          ? "0 28px 72px rgba(0,0,0,.4), 0 0 0 1px rgba(255,255,255,.18) inset"
          : "0 8px 32px rgba(0,0,0,.2)",
        transform: pressed
          ? "translateY(-2px) scale(.985)"
          : hovered
          ? "translateY(-12px) scale(1.015)"
          : visible
          ? "translateY(0) scale(1)"
          : "translateY(32px) scale(.96)",
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Icon */}
      <div
        className="w-13.5 h-13.5 rounded-2xl flex items-center justify-center text-[24px] mb-4.5"
        style={{
          background: `linear-gradient(135deg, ${c1}, ${c2})`,
          boxShadow: `0 8px 24px ${c1}55`,
        }}
      >
        {feature.icon}
      </div>

      <h3 className="text-white text-[21px] mb-2.5">
        {feature.title}
      </h3>

      <p className="text-white/60 text-[13px] mb-5.5 flex-1 leading-[1.7]">
        {feature.desc}
      </p>

      <div className="flex items-baseline gap-1.5 border-t border-white/10 pt-4">
        <span
          className="text-[24px]"
          style={{
            background: `linear-gradient(135deg, ${c1}, ${c2})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {feature.stat}
        </span>
        <span className="text-[11px] text-white/40">
          {feature.statLabel}
        </span>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────
export default function WhyChooseUs() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const navigate = useNavigate();

  useEffect(() => {
    fetchFeatures().then((res) => {
      setFeatures(res.data);
      setLoading(false);
    });
  }, []);

  const tags = ["ALL", ...new Set(features.map((f) => f.tag))];
  const visible =
    filter === "ALL"
      ? features
      : features.filter((f) => f.tag === filter);

  return (
    <section className="relative py-25 px-6 bg-[linear-gradient(135deg,#0d0b20_0%,#1a1040_28%,#0f2040_60%,#0a1628_100%)] font-[Plus_Jakarta_Sans] overflow-hidden">
      
      <Particles />

      <div className="max-w-285 mx-auto relative z-1">

        {/* HEADER */}
        <div className="text-center mb-13">
          <h2 className="text-white text-[clamp(34px,5.5vw,58px)] leading-tight mb-4.5">
            Travel smarter.
            <br />
            <span className="bg-linear-to-r from-blue-400 via-pink-400 to-green-400 bg-clip-text text-transparent">
              Experience more.
            </span>
          </h2>

          <p className="text-white/50 max-w-125 mx-auto text-[15px]">
            Every feature we've built exists to make your journey effortless.
          </p>
        </div>

        {/* FILTER */}
        <div className="flex flex-wrap justify-center gap-2 mb-11">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-4.5 py-1.75 text-[10px] font-extrabold uppercase tracking-widest rounded-full border backdrop-blur-sm
              ${
                filter === tag
                  ? "bg-white/20 border-white/40 text-white"
                  : "bg-white/10 border-white/20 text-white/60 hover:bg-white/20"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-3 gap-5 max-[960px]:grid-cols-2 max-[580px]:grid-cols-1">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-45 bg-white/10 animate-pulse rounded-xl" />
              ))
            : visible.map((f, i) => (
                <FeatureCard
                  key={f.id}
                  feature={f}
                  index={i}
                  onNavigate={(f) => navigate(f.route)}
                />
              ))}
        </div>

        {/* FOOTER */}
        <div className="text-center mt-17">
          <p className="text-white/30 text-[12px]">
            No account needed · Free to browse
          </p>
        </div>
      </div>
    </section>
  );
}