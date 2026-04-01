import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getActiveCities } from "../../features/user/citySlice";

// Inject Google Fonts & global styles once
const injectStyles = () => {
  if (document.getElementById("popular-cities-styles")) return;
  const link = document.createElement("link");
  link.id = "popular-cities-styles";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap";
  document.head.appendChild(link);

  const style = document.createElement("style");
  style.id = "popular-cities-css";
  style.textContent = `
    #popular-cities {
      --gold: #c9a84c;
      --gold-light: #e8c97a;
      --gold-dim: rgba(201, 168, 76, 0.12);
      --gold-border: rgba(201, 168, 76, 0.28);
      --ink: #080809;
      --smoke: #111114;
      --ash: #1c1c21;
      --cream: #f5f0e8;
      --text-muted: rgba(255,255,255,0.38);
      --serif: 'Cormorant Garamond', Georgia, serif;
      --sans: 'DM Sans', sans-serif;
      background: var(--ink);
      font-family: var(--sans);
    }

    /* ── Header section ── */
    .pc-header {
      max-width: 1520px;
      margin: 0 auto;
      padding: 110px 48px 72px;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 32px;
    }
    @media (max-width: 768px) {
      .pc-header { flex-direction: column; align-items: flex-start; padding: 72px 24px 48px; }
    }

    .pc-header-left {}

    .pc-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      font-family: var(--sans);
      font-size: 9px;
      font-weight: 500;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 28px;
    }
    .pc-eyebrow-line {
      display: inline-block;
      width: 36px;
      height: 1px;
      background: var(--gold);
      opacity: 0.7;
    }

    .pc-title {
      font-family: var(--serif);
      font-size: clamp(52px, 7vw, 96px);
      font-weight: 300;
      line-height: 0.92;
      color: var(--cream);
      letter-spacing: -0.025em;
      margin: 0;
    }
    .pc-title em {
      font-style: italic;
      color: var(--gold-light);
    }

    .pc-header-right {
      max-width: 360px;
      padding-bottom: 8px;
    }
    .pc-subtitle {
      font-family: var(--sans);
      font-size: 14px;
      font-weight: 300;
      color: var(--text-muted);
      letter-spacing: 0.03em;
      line-height: 1.8;
      margin: 0 0 28px;
    }
    .pc-count-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 10px 22px;
      border: 1px solid var(--gold-border);
      background: var(--gold-dim);
      border-radius: 2px;
      font-family: var(--serif);
      font-size: 13px;
      font-weight: 400;
      color: var(--gold);
      letter-spacing: 0.08em;
    }

    /* ── Thin separator ── */
    .pc-sep {
      max-width: 1520px;
      margin: 0 auto;
      padding: 0 48px;
    }
    .pc-sep-line {
      width: 100%;
      height: 1px;
      background: linear-gradient(to right, transparent, rgba(201,168,76,0.25), transparent);
    }

    /* ── Grid ── */
    .pc-grid-wrap {
      max-width: 1520px;
      margin: 0 auto;
      padding: 0 0 120px;
    }
    .pc-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 1px;
      background: rgba(201,168,76,0.06);
    }

    .pc-card:nth-child(1) { grid-column: span 7; }
    .pc-card:nth-child(2) { grid-column: span 5; }
    .pc-card:nth-child(n+3) { grid-column: span 4; }

    @media (max-width: 1024px) {
      .pc-card:nth-child(1) { grid-column: span 12; }
      .pc-card:nth-child(2) { grid-column: span 6; }
      .pc-card:nth-child(n+3) { grid-column: span 6; }
    }
    @media (max-width: 640px) {
      .pc-card { grid-column: span 12 !important; }
    }

    /* ── Card ── */
    .pc-card {
      position: relative;
      overflow: hidden;
      cursor: pointer;
      background: var(--smoke);
      aspect-ratio: 4/3;
      display: block;
    }
    .pc-card:nth-child(1) { aspect-ratio: 16/9; }
    .pc-card:nth-child(2) { aspect-ratio: 3/4; }

    .pc-card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                  filter 1.4s ease;
      filter: brightness(0.7) saturate(0.75);
    }
    .pc-card:hover .pc-card-img {
      transform: scale(1.07);
      filter: brightness(0.45) saturate(1.05);
    }

    /* Grain overlay */
    .pc-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
      background-size: 200px;
      z-index: 2;
      pointer-events: none;
      opacity: 0.45;
    }

    /* Vignette gradient */
    .pc-card-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to top,
        rgba(0,0,0,0.96) 0%,
        rgba(0,0,0,0.55) 38%,
        rgba(0,0,0,0.1) 65%,
        transparent 100%
      );
      z-index: 3;
    }

    /* Gold left accent */
    .pc-card-line {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 2px;
      height: 0%;
      background: linear-gradient(to top, var(--gold), var(--gold-light));
      z-index: 5;
      transition: height 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .pc-card:hover .pc-card-line { height: 100%; }

    /* Top gold border reveal */
    .pc-card-top-line {
      position: absolute;
      top: 0;
      left: 0;
      width: 0%;
      height: 1px;
      background: var(--gold);
      z-index: 5;
      transition: width 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s;
    }
    .pc-card:hover .pc-card-top-line { width: 100%; }

    /* Index number */
    .pc-card-index {
      position: absolute;
      top: 22px;
      left: 22px;
      font-family: var(--serif);
      font-size: 10px;
      font-weight: 400;
      letter-spacing: 0.22em;
      color: rgba(255,255,255,0.28);
      z-index: 5;
      transition: color 0.4s;
    }
    .pc-card:hover .pc-card-index { color: var(--gold); }

    /* Arrow button */
    .pc-card-arrow {
      position: absolute;
      top: 18px;
      right: 18px;
      z-index: 5;
      width: 42px;
      height: 42px;
      border: 1px solid rgba(255,255,255,0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: translate(6px, -6px);
      transition: opacity 0.45s ease, transform 0.45s ease,
                  background 0.3s, border-color 0.3s;
    }
    .pc-card:hover .pc-card-arrow {
      opacity: 1;
      transform: translate(0, 0);
      background: var(--gold);
      border-color: var(--gold);
    }
    .pc-card-arrow svg { width: 14px; height: 14px; color: #080809; }

    /* Body */
    .pc-card-body {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 36px 28px 26px;
      z-index: 4;
    }

    .pc-card-tag {
      font-family: var(--sans);
      font-size: 8px;
      font-weight: 500;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 10px;
      display: block;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.45s ease 0.05s, transform 0.45s ease 0.05s;
    }
    .pc-card:hover .pc-card-tag { opacity: 1; transform: translateY(0); }

    .pc-card-name {
      font-family: var(--serif);
      font-size: clamp(30px, 3.8vw, 56px);
      font-weight: 300;
      color: var(--cream);
      line-height: 0.95;
      text-transform: capitalize;
      letter-spacing: -0.015em;
      transition: color 0.4s, transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .pc-card:nth-child(2) .pc-card-name { font-size: clamp(26px, 2.6vw, 44px); }
    .pc-card:nth-child(n+3) .pc-card-name { font-size: clamp(22px, 2.2vw, 38px); }
    .pc-card:hover .pc-card-name { color: #fff; transform: translateY(-3px); }

    .pc-card-meta {
      font-family: var(--sans);
      font-size: 11px;
      font-weight: 300;
      letter-spacing: 0.12em;
      color: rgba(255,255,255,0.42);
      margin-top: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.45s ease 0.1s, transform 0.45s ease 0.1s;
    }
    .pc-card:hover .pc-card-meta { opacity: 1; transform: translateY(0); }
    .pc-card-meta-line {
      display: inline-block;
      width: 24px;
      height: 1px;
      background: var(--gold);
      transition: width 0.4s;
    }
    .pc-card:hover .pc-card-meta-line { width: 40px; }

    /* ── States ── */
    .pc-state {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      font-family: var(--serif);
      font-size: 20px;
      font-weight: 300;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      background: var(--ink);
    }
    .pc-state-error { color: #b56b66; }

    .pc-loader {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .pc-loader span {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--gold);
      animation: pcPulse 1.3s ease-in-out infinite;
    }
    .pc-loader span:nth-child(2) { animation-delay: 0.22s; }
    .pc-loader span:nth-child(3) { animation-delay: 0.44s; }
    @keyframes pcPulse {
      0%, 80%, 100% { transform: scale(0.5); opacity: 0.25; }
      40% { transform: scale(1); opacity: 1; }
    }

    /* ── Reveal animations ── */
    .pc-reveal {
      opacity: 0;
      transform: translateY(24px);
      animation: pcReveal 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }
    .pc-reveal-d1 { animation-delay: 0.08s; }
    .pc-reveal-d2 { animation-delay: 0.18s; }
    .pc-reveal-d3 { animation-delay: 0.3s; }
    @keyframes pcReveal { to { opacity: 1; transform: translateY(0); } }

    .pc-card-wrap {
      opacity: 0;
      animation: pcFadeIn 0.75s ease forwards;
    }
    @keyframes pcFadeIn { to { opacity: 1; } }
  `;
  document.head.appendChild(style);
};

function PopularCities() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cities, loading, error } = useSelector((state) => state.city);

  useEffect(() => {
    injectStyles();
    dispatch(getActiveCities());
  }, [dispatch]);

  if (loading)
    return (
      <div className="pc-state" id="popular-cities">
        <div className="pc-loader">
          <span />
          <span />
          <span />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="pc-state pc-state-error" id="popular-cities">
        {error}
      </div>
    );

  if (!cities?.length)
    return (
      <div className="pc-state" id="popular-cities">
        No destinations found
      </div>
    );

  return (
    <section id="popular-cities">
      {/* Header */}
      <div className="pc-header">
        <div className="pc-header-left">
          <div className="pc-reveal">
            <div className="pc-eyebrow">
              <span className="pc-eyebrow-line" />
              World-Class Destinations
              <span className="pc-eyebrow-line" />
            </div>
          </div>
          <div className="pc-reveal pc-reveal-d1">
            <h2 className="pc-title">
              Popular
              <br />
              <em>Cities</em>
            </h2>
          </div>
        </div>

        <div className="pc-header-right pc-reveal pc-reveal-d2">
          <p className="pc-subtitle">
            Curated escapes — where world-class hospitality meets authentic
            local spirit. Every destination hand-picked for the discerning
            traveller.
          </p>
          <div className="pc-count-badge">
            {cities.length} Featured Destinations
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="pc-sep pc-reveal pc-reveal-d3">
        <div className="pc-sep-line" />
      </div>

      {/* Grid */}
      <div className="pc-grid-wrap">
        <div className="pc-grid">
          {cities.map((city, i) => (
            <article
              key={city._id}
              className="pc-card pc-card-wrap"
              style={{ animationDelay: `${0.1 + i * 0.07}s` }}
              onClick={() => navigate(`/city/${city._id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" && navigate(`/city/${city._id}`)
              }
              aria-label={`Explore ${city.name}`}
            >
              <img
                src={
                  city.images?.[0] ||
                  "https://via.placeholder.com/800x600/111114/c9a84c?text=City"
                }
                alt={city.name}
                className="pc-card-img"
                loading="lazy"
              />

              <div className="pc-card-overlay" />
              <div className="pc-card-line" />
              <div className="pc-card-top-line" />

              <span className="pc-card-index">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="pc-card-arrow">
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

              <div className="pc-card-body">
                <span className="pc-card-tag">Explore destination</span>
                <h3 className="pc-card-name">{city.name}</h3>
                <div className="pc-card-meta">
                  <span className="pc-card-meta-line" />
                  Discover more
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PopularCities;
