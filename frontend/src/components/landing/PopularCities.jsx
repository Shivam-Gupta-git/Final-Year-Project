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
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap";
  document.head.appendChild(link);

  const style = document.createElement("style");
  style.id = "popular-cities-css";
  style.textContent = `
    #popular-cities {
      --gold: #c9a84c;
      --gold-light: #e8c97a;
      --gold-dim: rgba(201, 168, 76, 0.15);
      --ink: #0a0a0b;
      --smoke: #1a1a1e;
      --ash: #2a2a30;
      --mist: rgba(255,255,255,0.06);
      --serif: 'Cormorant Garamond', Georgia, serif;
      --sans: 'DM Sans', sans-serif;
      background: var(--ink);
      font-family: var(--sans);
    }

    .pc-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-family: var(--sans);
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--gold);
      border: 1px solid rgba(201,168,76,0.3);
      padding: 8px 20px;
      border-radius: 2px;
      margin-bottom: 32px;
      background: var(--gold-dim);
    }
    .pc-eyebrow::before,
    .pc-eyebrow::after {
      content: '';
      display: inline-block;
      width: 20px;
      height: 1px;
      background: var(--gold);
      opacity: 0.6;
    }

    .pc-title {
      font-family: var(--serif);
      font-size: clamp(56px, 8vw, 110px);
      font-weight: 300;
      line-height: 0.9;
      color: #f0ece4;
      letter-spacing: -0.02em;
      margin-bottom: 12px;
    }
    .pc-title em {
      font-style: italic;
      color: var(--gold-light);
    }

    .pc-subtitle {
      font-family: var(--sans);
      font-size: 15px;
      font-weight: 300;
      color: rgba(255,255,255,0.4);
      letter-spacing: 0.04em;
      max-width: 500px;
      line-height: 1.7;
    }

    .pc-divider {
      width: 1px;
      height: 60px;
      background: linear-gradient(to bottom, transparent, var(--gold), transparent);
      margin: 28px auto;
    }

    /* ── Grid ── */
    .pc-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 2px;
    }

    /* Featured first card spans 8 cols */
    .pc-card:nth-child(1) { grid-column: span 8; }
    /* Second card spans 4 */
    .pc-card:nth-child(2) { grid-column: span 4; }
    /* Remaining cards span 4 each */
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
      transition: transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                  filter 1.2s ease;
      filter: brightness(0.75) saturate(0.8);
    }
    .pc-card:hover .pc-card-img {
      transform: scale(1.08);
      filter: brightness(0.55) saturate(1.1);
    }

    /* Grain overlay */
    .pc-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
      background-size: 200px;
      z-index: 2;
      pointer-events: none;
      opacity: 0.5;
    }

    /* Bottom gradient */
    .pc-card-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to top,
        rgba(0,0,0,0.92) 0%,
        rgba(0,0,0,0.5) 35%,
        rgba(0,0,0,0.1) 60%,
        transparent 100%
      );
      z-index: 3;
      transition: opacity 0.8s ease;
    }

    /* Side accent line */
    .pc-card-line {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 3px;
      height: 0%;
      background: var(--gold);
      z-index: 5;
      transition: height 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .pc-card:hover .pc-card-line { height: 100%; }

    /* Index number */
    .pc-card-index {
      position: absolute;
      top: 24px;
      left: 24px;
      font-family: var(--serif);
      font-size: 11px;
      font-weight: 400;
      letter-spacing: 0.2em;
      color: rgba(255,255,255,0.35);
      z-index: 5;
      transition: color 0.4s;
    }
    .pc-card:hover .pc-card-index { color: var(--gold); }

    /* Top-right arrow */
    .pc-card-arrow {
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 5;
      width: 44px;
      height: 44px;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: translate(8px, -8px);
      transition: opacity 0.5s ease, transform 0.5s ease,
                  background 0.3s, border-color 0.3s;
    }
    .pc-card:hover .pc-card-arrow {
      opacity: 1;
      transform: translate(0, 0);
      background: var(--gold);
      border-color: var(--gold);
    }
    .pc-card-arrow svg { width: 16px; height: 16px; color: white; }

    /* City name */
    .pc-card-body {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 32px 28px 28px;
      z-index: 4;
    }

    .pc-card-tag {
      font-family: var(--sans);
      font-size: 9px;
      font-weight: 500;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 10px;
      display: block;
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.5s ease 0.05s, transform 0.5s ease 0.05s;
    }
    .pc-card:hover .pc-card-tag {
      opacity: 1;
      transform: translateY(0);
    }

    .pc-card-name {
      font-family: var(--serif);
      font-size: clamp(28px, 3.5vw, 52px);
      font-weight: 300;
      color: #f5f0e8;
      line-height: 1;
      text-transform: capitalize;
      letter-spacing: -0.01em;
      transition: color 0.4s, transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .pc-card:nth-child(2) .pc-card-name { font-size: clamp(26px, 2.5vw, 42px); }
    .pc-card:nth-child(n+3) .pc-card-name { font-size: clamp(22px, 2vw, 36px); }

    .pc-card:hover .pc-card-name {
      color: #fff;
      transform: translateY(-4px);
    }

    .pc-card-explore {
      font-family: var(--sans);
      font-size: 12px;
      font-weight: 400;
      letter-spacing: 0.1em;
      color: rgba(255,255,255,0.5);
      margin-top: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      opacity: 0;
      transform: translateY(12px);
      transition: opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s;
    }
    .pc-card:hover .pc-card-explore {
      opacity: 1;
      transform: translateY(0);
    }
    .pc-card-explore span {
      display: inline-block;
      width: 28px;
      height: 1px;
      background: var(--gold);
      transition: width 0.4s;
    }
    .pc-card:hover .pc-card-explore span { width: 42px; }

    /* Loading / Error states */
    .pc-state {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      font-family: var(--serif);
      font-size: 22px;
      font-weight: 300;
      letter-spacing: 0.06em;
      color: rgba(255,255,255,0.35);
      background: var(--ink);
    }
    .pc-state-error { color: #c0706a; }

    .pc-loader {
      display: flex;
      gap: 8px;
    }
    .pc-loader span {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--gold);
      animation: pcPulse 1.2s ease-in-out infinite;
    }
    .pc-loader span:nth-child(2) { animation-delay: 0.2s; }
    .pc-loader span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes pcPulse {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
      40% { transform: scale(1); opacity: 1; }
    }

    /* scroll reveal */
    .pc-reveal {
      opacity: 0;
      transform: translateY(30px);
      animation: pcReveal 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }
    .pc-reveal-delay-1 { animation-delay: 0.1s; }
    .pc-reveal-delay-2 { animation-delay: 0.2s; }
    .pc-reveal-delay-3 { animation-delay: 0.35s; }
    @keyframes pcReveal {
      to { opacity: 1; transform: translateY(0); }
    }

    .pc-card-wrap {
      opacity: 0;
      animation: pcFadeIn 0.8s ease forwards;
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
      <div
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
          padding: "100px 32px 64px",
          textAlign: "center",
        }}
      >
        <div className="pc-reveal">
          <span className="pc-eyebrow">Featured Destinations</span>
        </div>

        <div className="pc-reveal pc-reveal-delay-1">
          <h2 className="pc-title">
            Popular <em>Cities</em>
          </h2>
        </div>

        <div className="pc-divider pc-reveal pc-reveal-delay-2" />

        <p
          className="pc-subtitle pc-reveal pc-reveal-delay-3"
          style={{ margin: "0 auto" }}
        >
          Curated escapes — where world-class hospitality meets authentic local
          spirit.
        </p>
      </div>

      <div
        style={{ maxWidth: "1600px", margin: "0 auto", padding: "0 0 120px" }}
      >
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
                  "https://via.placeholder.com/800x600/1a1a1e/c9a84c?text=City"
                }
                alt={city.name}
                className="pc-card-img"
                loading="lazy"
              />

              {/* Grain + overlay */}
              <div className="pc-card-overlay" />

              {/* Accent line */}
              <div className="pc-card-line" />

              {/* Index */}
              <span className="pc-card-index">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Arrow */}
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

              {/* Body */}
              <div className="pc-card-body">
                <span className="pc-card-tag">Explore destination</span>
                <h3 className="pc-card-name">{city.name}</h3>
                <div className="pc-card-explore">
                  <span />
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
