import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────────────────────
   Static data 
───────────────────────────────────────────────────────────── */
const MOCK_DB = [
  {
    id: 1, active: true, route: "/hotels",
    icon: "🏨", tag: "STAY", title: "Handpicked Hotels",
    desc: "Every property is personally vetted for comfort, location, and value. No filler listings — just places worth staying.",
    stat: "12,000+", statLabel: "properties",
    color: "#6366f1", // Indigo
  },
  {
    id: 2, active: true, route: "/explore",
    icon: "🗺️", tag: "EXPLORE", title: "Hidden Destinations",
    desc: "Beyond the tourist trail. We surface secret spots, offbeat routes, and local gems that never make the front page.",
    stat: "180+", statLabel: "countries",
    color: "#10b981", // Emerald
  },
  {
    id: 3, active: true, route: "/RestaurantLandingPage",
    icon: "🍜", tag: "EAT", title: "Local Food Trails",
    desc: "Eat where the locals eat. Curated food experiences, street food maps.",
    stat: "8,400+", statLabel: "eateries",
    color: "#f59e0b", // Amber
  },
  {
    id: 4, active: true, route: "/travel",
    icon: "✈️", tag: "TRAVEL", title: "Seamless Journeys",
    desc: "Flights, transfers, and ground transport — coordinated in one place. No juggling apps, no missed connections.",
    stat: "99.2%", statLabel: "on-time rate",
    color: "#3b82f6", // Blue
  },
  {
    id: 5, active: true, route: "/support",
    icon: "🛡️", tag: "TRUST", title: "24/7 Travel Guard",
    desc: "Real humans, real-time. Whether it's a cancelled flight at 2am or a lost booking — we pick up every time.",
    stat: "< 2 min", statLabel: "response time",
    color: "#ec4899", // Pink
  },
  {
    id: 6, active: true, route: "/deals",
    icon: "💎", tag: "VALUE", title: "Members-Only Deals",
    desc: "Exclusive rates negotiated directly with partners. Members save an average of 34% compared to booking direct.",
    stat: "34%", statLabel: "avg. savings",
    color: "#8b5cf6", // Purple
  },
];

const ACTIVE_FEATURES = MOCK_DB.filter((f) => f.active);

/* ─────────────────────────────────────────────────────────────
   Style injection — Matches PopularCities & Hero aesthetics
───────────────────────────────────────────────────────────── */
(() => {
  if (document.getElementById("wcu-styles")) return;

  if (!document.getElementById("fxc-font")) {
    const link = document.createElement("link");
    link.id = "fxc-font";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Inter:wght@300;400;500;600&display=swap";
    document.head.appendChild(link);
  }

  const style = document.createElement("style");
  style.id = "wcu-styles";
  style.textContent = `
    .wcu-root {
      background: #0a0a10; /* Match PopularCities bg */
      font-family: 'Inter', sans-serif;
      position: relative;
      overflow: hidden;
      color: #ffffff;
      padding: 100px 0 120px;
    }

    /* Subtle background grid/glow to match tech/modern vibe */
    .wcu-root::after {
      content: '';
      position: absolute;
      top: -100px; right: -100px;
      width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(61,110,245,0.06) 0%, transparent 60%);
      pointer-events: none;
      z-index: 0;
    }
    .wcu-root::before {
      content: '';
      position: absolute;
      bottom: -100px; left: -100px;
      width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 60%);
      pointer-events: none;
      z-index: 0;
    }

    .wcu-inner {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 40px;
      position: relative;
      z-index: 1;
    }
    @media (max-width: 768px) { .wcu-inner { padding: 0 24px; } }

    /* Header */
    .wcu-header {
      text-align: center;
      margin-bottom: 48px;
    }

    .wcu-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.4);
      margin-bottom: 16px;
      background: rgba(255,255,255,0.04);
      padding: 6px 14px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.08);
    }
    
    .wcu-title {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: clamp(40px, 5vw, 64px);
      font-weight: 900;
      line-height: 0.95;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: -0.01em;
      margin: 0 0 20px;
    }
    .wcu-title span { color: #3d6ef5; }

    .wcu-subtitle {
      font-size: 14px;
      font-weight: 400;
      color: rgba(255,255,255,0.55);
      line-height: 1.6;
      max-width: 580px;
      margin: 0 auto 32px;
    }

    /* Filter pills */
    .wcu-filters {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
    }
    .wcu-pill {
      padding: 10px 24px;
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.03);
      color: rgba(255,255,255,0.5);
      cursor: pointer;
      transition: all 0.3s ease;
      border-radius: 999px;
    }
    .wcu-pill:hover {
      background: rgba(255,255,255,0.08);
      color: #ffffff;
    }
    .wcu-pill.active {
      background: #3d6ef5;
      border-color: #3d6ef5;
      color: #ffffff;
      box-shadow: 0 8px 24px rgba(61,110,245,0.4);
    }

    /* Grid */
    .wcu-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    @media (max-width: 1024px) { .wcu-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px) { .wcu-grid { grid-template-columns: 1fr; } }

    /* Card */
    .wcu-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 20px;
      padding: 32px 28px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.3s cubic-bezier(0.34,1.26,0.64,1), box-shadow 0.3s ease, border-color 0.3s ease;
      will-change: transform;
    }
    
    /* Top accent bar matching CityPage */
    .wcu-card-topbar {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: var(--card-color);
      opacity: 0.5;
      transition: opacity 0.3s ease;
    }
    .wcu-card:hover .wcu-card-topbar { opacity: 1; }

    /* Hover effects */
    .wcu-card:hover {
      transform: translateY(-6px) scale(1.01);
      border-color: rgba(255,255,255,0.15);
      box-shadow: 0 16px 40px rgba(0,0,0,0.5);
      background: rgba(255,255,255,0.04);
    }
    .wcu-card:active { transform: scale(0.98); }

    /* IntersectionObserver reveal */
    .wcu-reveal {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.22,1,0.36,1);
    }
    .wcu-reveal.visible { opacity: 1; transform: translateY(0); }
    .wcu-card:hover { transform: translateY(-6px) scale(1.01) !important; }

    /* Icon Box */
    .wcu-card-icon-wrap {
      width: 48px; height: 48px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 24px;
      margin-bottom: 24px;
      background: var(--card-color-dim);
      border: 1px solid var(--card-color-border);
      transition: transform 0.3s cubic-bezier(0.34,1.26,0.64,1);
      will-change: transform;
    }
    .wcu-card:hover .wcu-card-icon-wrap { transform: scale(1.08); }

    /* Title */
    .wcu-card-title {
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.2;
      margin: 0 0 10px;
      transition: color 0.2s ease;
    }
    .wcu-card:hover .wcu-card-title { color: var(--card-color); }

    /* Desc */
    .wcu-card-desc {
      font-size: 13px;
      font-weight: 400;
      color: rgba(255,255,255,0.5);
      line-height: 1.6;
      flex: 1;
      margin: 0 0 24px;
    }

    /* Stat */
    .wcu-card-stat-row {
      display: flex; align-items: baseline; gap: 8px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.06);
      margin-top: auto;
    }
    .wcu-card-stat-num {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 28px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1;
    }
    .wcu-card-stat-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.1em;
      color: rgba(255,255,255,0.4);
      text-transform: uppercase;
    }

    /* Skeleton */
    .wcu-skeleton {
      background: rgba(255,255,255,0.02);
      border-radius: 20px;
      height: 310px;
      position: relative;
      overflow: hidden;
    }
    .wcu-skeleton::after {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
      animation: wcuShimmer 1.8s ease-in-out infinite;
    }
    @keyframes wcuShimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    /* Footer */
    .wcu-footer {
      text-align: center; margin-top: 80px;
      display: flex; align-items: center; justify-content: center; gap: 24px;
    }
    .wcu-footer-line {
      flex: 1; max-width: 100px; height: 1px;
      background: linear-gradient(to right, transparent, rgba(255,255,255,0.1));
    }
    .wcu-footer-line:last-child {
      background: linear-gradient(to left, transparent, rgba(255,255,255,0.1));
    }
    .wcu-footer-text {
      font-size: 11px; font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.3);
    }

    @media (prefers-reduced-motion: reduce) {
      .wcu-card, .wcu-reveal, .wcu-skeleton::after, .wcu-card-icon-wrap {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
        transition: background 0.2s ease !important;
      }
    }
  `;
  document.head.appendChild(style);
})();

/* ─────────────────────────────────────────────────────────────
   useReveal — IntersectionObserver
───────────────────────────────────────────────────────────── */
function useReveal(delay = 0) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add("visible"), delay);
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return ref;
}

/* ─────────────────────────────────────────────────────────────
   FeatureCard
───────────────────────────────────────────────────────────── */
const FeatureCard = memo(({ feature, index, onNavigate }) => {
  const ref = useReveal(index * 70);

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      className="wcu-card wcu-reveal"
      onClick={() => onNavigate(feature)}
      onKeyDown={(e) => e.key === "Enter" && onNavigate(feature)}
      aria-label={`Learn more about ${feature.title}`}
      style={{
        "--card-color": feature.color,
        "--card-color-dim": `${feature.color}1a`,
        "--card-color-border": `${feature.color}40`,
      }}
    >
      <div className="wcu-card-topbar" />

      <div className="wcu-card-icon-wrap">
        <span role="img" aria-label={feature.title}>{feature.icon}</span>
      </div>

      <h3 className="wcu-card-title">{feature.title}</h3>
      <p className="wcu-card-desc">{feature.desc}</p>

      {feature.stat && (
        <div className="wcu-card-stat-row">
          <span className="wcu-card-stat-num">{feature.stat}</span>
          <span className="wcu-card-stat-label">{feature.statLabel}</span>
        </div>
      )}
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────
   Header reveal component
───────────────────────────────────────────────────────────── */
const RevealDiv = memo(({ delay, className, children }) => {
  const ref = useReveal(delay);
  return (
    <div ref={ref} className={`wcu-reveal${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────── */
export default function WhyChooseUs() {
  const [features, setFeatures] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("ALL");

  const navigate = useNavigate();

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setFeatures(ACTIVE_FEATURES);
      setLoading(false);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const handleNavigate = useCallback((f) => navigate(f.route), [navigate]);
  const handleFilter   = useCallback((tag) => setFilter(tag), []);

  const tags = useMemo(
    () => ["ALL", ...new Set(features.map((f) => f.tag))],
    [features]
  );

  const visible = useMemo(
    () => (filter === "ALL" ? features : features.filter((f) => f.tag === filter)),
    [features, filter]
  );

  return (
    <section className="wcu-root" aria-label="Why choose us">
      <div className="wcu-inner">

        {/* ── Header ── */}
        <div className="wcu-header">
          <RevealDiv delay={0}>
            <div className="wcu-eyebrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Our Promise To You
            </div>
          </RevealDiv>
          
          <RevealDiv delay={80}>
            <h2 className="wcu-title">
              Travel smarter.<br />
              <span>Experience more.</span>
            </h2>
          </RevealDiv>

          <RevealDiv delay={160}>
            <p className="wcu-subtitle">
              Every feature we've built exists to make your journey effortless —
              from the first search to the final check-out. No filler, just what counts.
            </p>
          </RevealDiv>

          <RevealDiv delay={240}>
            <div className="wcu-filters" role="group" aria-label="Filter by category">
              {tags.map((tag) => (
                <button
                  key={tag}
                  className={`wcu-pill${filter === tag ? " active" : ""}`}
                  onClick={() => handleFilter(tag)}
                  aria-pressed={filter === tag}
                >
                  {tag}
                </button>
              ))}
            </div>
          </RevealDiv>
        </div>

        {/* ── Grid ── */}
        <div className="wcu-grid" role="list">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="wcu-skeleton" role="presentation" aria-hidden="true" />
              ))
            : visible.map((f, i) => (
                <FeatureCard
                  key={f.id}
                  feature={f}
                  index={i}
                  onNavigate={handleNavigate}
                />
              ))}
        </div>

        {/* ── Footer ── */}
        <RevealDiv delay={100}>
          <div className="wcu-footer" aria-hidden="true">
            <div className="wcu-footer-line" />
            <span className="wcu-footer-text">Built for modern travelers</span>
            <div className="wcu-footer-line" />
          </div>
        </RevealDiv>

      </div>
    </section>
  );
}
