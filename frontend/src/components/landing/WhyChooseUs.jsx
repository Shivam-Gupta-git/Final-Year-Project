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
    route: "/explore",
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
    setTimeout(() => resolve({ data: MOCK_DB }), 800),
  );
}

// ─── Styles injector ─────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("why-choose-styles")) return;

  const link = document.createElement("link");
  link.id = "why-choose-font";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap";
  document.head.appendChild(link);

  const style = document.createElement("style");
  style.id = "why-choose-styles";
  style.textContent = `
    #why-choose-us {
      --gold: #c9a84c;
      --gold-light: #e8c97a;
      --gold-dim: rgba(201, 168, 76, 0.10);
      --gold-border: rgba(201, 168, 76, 0.25);
      --ink: #080809;
      --smoke: #0f0f12;
      --panel: #121215;
      --panel-hover: #18181d;
      --border: rgba(255,255,255,0.07);
      --border-hover: rgba(201,168,76,0.28);
      --cream: #f5f0e8;
      --muted: rgba(255,255,255,0.36);
      --serif: 'Cormorant Garamond', Georgia, serif;
      --sans: 'DM Sans', sans-serif;
      background: var(--ink);
      font-family: var(--sans);
      position: relative;
      overflow: hidden;
    }

    /* Subtle background texture */
    #why-choose-us::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 0;
    }

    /* Ambient glow blobs */
    #why-choose-us::after {
      content: '';
      position: absolute;
      top: -200px;
      left: 50%;
      transform: translateX(-50%);
      width: 900px;
      height: 500px;
      background: radial-gradient(ellipse, rgba(201,168,76,0.04) 0%, transparent 70%);
      pointer-events: none;
      z-index: 0;
    }

    .wcu-inner {
      max-width: 1520px;
      margin: 0 auto;
      padding: 110px 48px 120px;
      position: relative;
      z-index: 1;
    }
    @media (max-width: 768px) {
      .wcu-inner { padding: 72px 24px 80px; }
    }

    /* ── Header ── */
    .wcu-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 40px;
      margin-bottom: 64px;
    }
    @media (max-width: 900px) {
      .wcu-header { flex-direction: column; align-items: flex-start; margin-bottom: 48px; }
    }

    .wcu-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      font-family: var(--sans);
      font-size: 9px;
      font-weight: 500;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 24px;
    }
    .wcu-eyebrow-line {
      display: inline-block;
      width: 36px;
      height: 1px;
      background: var(--gold);
      opacity: 0.7;
    }

    .wcu-title {
      font-family: var(--serif);
      font-size: clamp(48px, 6.5vw, 88px);
      font-weight: 300;
      line-height: 0.93;
      color: var(--cream);
      letter-spacing: -0.02em;
      margin: 0;
    }
    .wcu-title em {
      font-style: italic;
      color: var(--gold-light);
    }

    .wcu-header-right {
      max-width: 380px;
      padding-bottom: 6px;
    }
    .wcu-subtitle {
      font-family: var(--sans);
      font-size: 14px;
      font-weight: 300;
      color: var(--muted);
      line-height: 1.8;
      letter-spacing: 0.025em;
      margin: 0 0 28px;
    }

    /* ── Filter pills ── */
    .wcu-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .wcu-pill {
      padding: 8px 20px;
      font-family: var(--sans);
      font-size: 9px;
      font-weight: 500;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--muted);
      cursor: pointer;
      transition: all 0.25s ease;
      border-radius: 1px;
      position: relative;
      overflow: hidden;
    }
    .wcu-pill::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--gold-dim);
      opacity: 0;
      transition: opacity 0.25s;
    }
    .wcu-pill:hover { border-color: var(--gold-border); color: var(--gold); }
    .wcu-pill:hover::before { opacity: 1; }
    .wcu-pill.active {
      border-color: var(--gold);
      color: var(--gold);
      background: var(--gold-dim);
    }

    /* ── Divider ── */
    .wcu-divider {
      width: 100%;
      height: 1px;
      background: linear-gradient(to right, transparent, rgba(201,168,76,0.2), transparent);
      margin-bottom: 48px;
    }

    /* ── Grid ── */
    .wcu-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1px;
      background: rgba(201,168,76,0.05);
    }
    @media (max-width: 960px) { .wcu-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 580px) { .wcu-grid { grid-template-columns: 1fr; } }

    /* ── Card ── */
    .wcu-card {
      background: var(--panel);
      padding: 40px 36px 32px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: background 0.3s ease;
      opacity: 0;
      transform: translateY(20px);
      animation: wcuFadeUp 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }
    .wcu-card:hover { background: var(--panel-hover); }

    /* Gold left accent on hover */
    .wcu-card::before {
      content: '';
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 2px;
      background: linear-gradient(to bottom, var(--gold), var(--gold-light));
      transform: scaleY(0);
      transform-origin: bottom;
      transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .wcu-card:hover::before { transform: scaleY(1); }

    /* Top border reveal */
    .wcu-card::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: var(--gold);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.05s;
    }
    .wcu-card:hover::after { transform: scaleX(1); }

    @keyframes wcuFadeUp { to { opacity: 1; transform: translateY(0); } }

    /* Tag */
    .wcu-card-tag {
      font-family: var(--sans);
      font-size: 8px;
      font-weight: 500;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .wcu-card-tag-dot {
      width: 4px; height: 4px;
      border-radius: 50%;
      background: var(--gold);
    }

    /* Icon */
    .wcu-card-icon {
      font-size: 26px;
      margin-bottom: 20px;
      display: block;
      transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .wcu-card:hover .wcu-card-icon { transform: translateY(-3px); }

    /* Title */
    .wcu-card-title {
      font-family: var(--serif);
      font-size: clamp(22px, 2.2vw, 32px);
      font-weight: 300;
      color: var(--cream);
      line-height: 1.1;
      letter-spacing: -0.01em;
      margin: 0 0 14px;
      transition: color 0.3s;
    }
    .wcu-card:hover .wcu-card-title { color: #fff; }

    /* Desc */
    .wcu-card-desc {
      font-family: var(--sans);
      font-size: 13px;
      font-weight: 300;
      color: var(--muted);
      line-height: 1.75;
      letter-spacing: 0.02em;
      flex: 1;
      margin: 0 0 28px;
    }

    /* Stat */
    .wcu-card-stat-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      margin-top: auto;
    }
    .wcu-card-stat-num {
      font-family: var(--serif);
      font-size: clamp(24px, 2.5vw, 34px);
      font-weight: 300;
      color: var(--gold-light);
      line-height: 1;
      letter-spacing: -0.01em;
    }
    .wcu-card-stat-label {
      font-family: var(--sans);
      font-size: 10px;
      font-weight: 400;
      letter-spacing: 0.1em;
      color: var(--muted);
      text-transform: uppercase;
    }

    /* Arrow */
    .wcu-card-arrow {
      position: absolute;
      top: 28px;
      right: 28px;
      width: 36px;
      height: 36px;
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: translate(4px, -4px);
      transition: opacity 0.4s, transform 0.4s, background 0.3s, border-color 0.3s;
    }
    .wcu-card:hover .wcu-card-arrow {
      opacity: 1;
      transform: translate(0, 0);
      background: var(--gold);
      border-color: var(--gold);
    }
    .wcu-card-arrow svg { width: 12px; height: 12px; color: #080809; }

    /* ── Skeleton ── */
    .wcu-skeleton {
      background: var(--panel);
      height: 220px;
      position: relative;
      overflow: hidden;
    }
    .wcu-skeleton::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(201,168,76,0.04), transparent);
      animation: wcuShimmer 1.6s infinite;
    }
    @keyframes wcuShimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    /* ── Footer note ── */
    .wcu-footer {
      text-align: center;
      margin-top: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
    }
    .wcu-footer-line {
      width: 60px; height: 1px;
      background: linear-gradient(to right, transparent, rgba(201,168,76,0.3));
    }
    .wcu-footer-line:last-child {
      background: linear-gradient(to left, transparent, rgba(201,168,76,0.3));
    }
    .wcu-footer-text {
      font-family: var(--sans);
      font-size: 10px;
      font-weight: 400;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.22);
    }

    /* ── Reveal ── */
    .wcu-reveal {
      opacity: 0;
      transform: translateY(20px);
      animation: wcuReveal 0.85s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }
    .wcu-d1 { animation-delay: 0.08s; }
    .wcu-d2 { animation-delay: 0.18s; }
    .wcu-d3 { animation-delay: 0.28s; }
    @keyframes wcuReveal { to { opacity: 1; transform: translateY(0); } }
  `;
  document.head.appendChild(style);
};

// ─── Feature Card ─────────────────────────────────────────────
function FeatureCard({ feature, index, onNavigate }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      className="wcu-card"
      style={{
        animationDelay: `${index * 0.08}s`,
        transform: pressed ? "scale(0.985)" : undefined,
        display: "flex",
        flexDirection: "column",
      }}
      onClick={() => {
        setPressed(true);
        setTimeout(() => {
          setPressed(false);
          onNavigate(feature);
        }, 160);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={(e) => e.key === "Enter" && onNavigate(feature)}
    >
      {/* Arrow */}
      <div className="wcu-card-arrow">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 17L17 7M7 7h10v10"
          />
        </svg>
      </div>

      {/* Tag */}
      <div className="wcu-card-tag">
        <span className="wcu-card-tag-dot" />
        {feature.tag}
      </div>

      {/* Icon */}
      <span className="wcu-card-icon">{feature.icon}</span>

      {/* Title */}
      <h3 className="wcu-card-title">{feature.title}</h3>

      {/* Desc */}
      <p className="wcu-card-desc">{feature.desc}</p>

      {/* Stat */}
      {feature.stat && (
        <div className="wcu-card-stat-row">
          <span className="wcu-card-stat-num">{feature.stat}</span>
          <span className="wcu-card-stat-label">{feature.statLabel}</span>
        </div>
      )}
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
    injectStyles();
    fetchFeatures().then((res) => {
      setFeatures(res.data);
      setLoading(false);
    });
  }, []);

  const tags = ["ALL", ...new Set(features.map((f) => f.tag))];
  const visible =
    filter === "ALL" ? features : features.filter((f) => f.tag === filter);

  return (
    <section id="why-choose-us">
      <div className="wcu-inner">
        {/* Header */}
        <div className="wcu-header">
          <div>
            <div className="wcu-reveal">
              <div className="wcu-eyebrow">
                <span className="wcu-eyebrow-line" />
                Our Promise To You
                <span className="wcu-eyebrow-line" />
              </div>
            </div>
            <div className="wcu-reveal wcu-d1">
              <h2 className="wcu-title">
                Travel smarter.
                <br />
                <em>Experience more.</em>
              </h2>
            </div>
          </div>

          <div className="wcu-header-right wcu-reveal wcu-d2">
            <p className="wcu-subtitle">
              Every feature we've built exists to make your journey effortless —
              from the first search to the final check-out.
            </p>
            {/* Filters */}
            <div className="wcu-filters">
              {tags.map((tag) => (
                <button
                  key={tag}
                  className={`wcu-pill${filter === tag ? " active" : ""}`}
                  onClick={() => setFilter(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="wcu-divider wcu-reveal wcu-d3" />

        {/* Grid */}
        <div className="wcu-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="wcu-skeleton" />
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

        {/* Footer */}
        <div className="wcu-footer">
          <div className="wcu-footer-line" />
          <span className="wcu-footer-text">
            No account needed · Free to browse
          </span>
          <div className="wcu-footer-line" />
        </div>
      </div>
    </section>
  );
}
