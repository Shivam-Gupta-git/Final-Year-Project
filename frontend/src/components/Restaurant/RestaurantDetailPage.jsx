import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon, MapPinIcon, ClockIcon } from "@heroicons/react/24/outline";
import { getRestaurantByIdPublic } from "../../features/user/restaurantSlice";

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Instrument+Serif:ital@0;1&display=swap');

.rdp-root {
  min-height: 100vh;
  background: #0c0c10;
  font-family: 'Bricolage Grotesque', sans-serif;
  color: #f0f0f8;
  overflow-x: hidden;
}

/* ── HERO ── */
.rdp-hero {
  position: relative;
  height: 65vh;
  min-height: 420px;
  overflow: hidden;
}

.rdp-hero-img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 8s ease;
}

.rdp-hero:hover .rdp-hero-img { transform: scale(1.04); }

.rdp-hero-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    160deg,
    rgba(12,12,16,0.2) 0%,
    rgba(12,12,16,0.05) 35%,
    rgba(12,12,16,0.75) 70%,
    rgba(12,12,16,1) 100%
  );
}

.rdp-back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  background: rgba(12,12,16,0.65);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 100px;
  color: #f0f0f8;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  text-decoration: none;
}
.rdp-back-btn:hover { background: rgba(12,12,16,0.85); }

/* Status dot top-right */
.rdp-status-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
  backdrop-filter: blur(16px);
}
.rdp-status-badge.open { background: rgba(16,185,129,0.18); border: 1px solid rgba(16,185,129,0.3); color: #34d399; }
.rdp-status-badge.closed { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.25); color: #f87171; }
.rdp-status-live { width: 7px; height: 7px; border-radius: 50%; background: currentColor; animation: rdp-pulse 2s ease-in-out infinite; }
@keyframes rdp-pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }

/* Hero content */
.rdp-hero-content {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 0 32px 36px;
}

.rdp-hero-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.rdp-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  background: rgba(12,12,16,0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  color: rgba(240,240,248,0.85);
}

.rdp-chip.veg { border-color: rgba(34,197,94,0.3); color: #86efac; }
.rdp-chip.nonveg { border-color: rgba(239,68,68,0.3); color: #fca5a5; }
.rdp-chip.both { border-color: rgba(251,191,36,0.3); color: #fde68a; }
.rdp-chip.rec { border-color: rgba(255,77,0,0.35); color: #ff9a3c; }

.rdp-hero-name {
  font-family: 'Instrument Serif', serif;
  font-size: clamp(32px, 6vw, 58px);
  font-weight: 400;
  font-style: italic;
  color: #fff;
  text-shadow: 0 2px 24px rgba(0,0,0,0.5);
  letter-spacing: -0.5px;
  line-height: 1.05;
  text-transform: capitalize;
  margin: 0;
}

.rdp-rating-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.rdp-stars {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 13px;
}

.rdp-rating-val {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #fbbf24;
}

.rdp-reviews {
  font-size: 12px;
  color: rgba(240,240,248,0.55);
}

/* ── BODY ── */
.rdp-body {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

/* ── STAT STRIP ── */
.rdp-stats-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin: -36px 0 0;
  position: relative;
  z-index: 10;
  margin-bottom: 28px;
}

@media (max-width: 600px) {
  .rdp-stats-strip { grid-template-columns: repeat(2, 1fr); }
}

.rdp-stat-card {
  background: #131318;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 18px;
  padding: 18px 14px;
  text-align: center;
  transition: border-color 0.2s, transform 0.2s;
}
.rdp-stat-card:hover { border-color: rgba(255,77,0,0.25); transform: translateY(-2px); }

.rdp-stat-icon { font-size: 22px; display: block; margin-bottom: 6px; }
.rdp-stat-val {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: #fbbf24;
  display: block;
}
.rdp-stat-lbl {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: #6b6b85;
  margin-top: 3px;
}

/* ── INFO CARD ── */
.rdp-card {
  background: #131318;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 22px;
  padding: 24px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}

.rdp-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,77,0,0.25), transparent);
}

.rdp-card-title {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #6b6b85;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.rdp-card-title::before {
  content: '';
  width: 16px; height: 2px;
  background: #ff4d00;
  border-radius: 2px;
}

/* ── INFO GRID ── */
.rdp-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.rdp-info-item {
  background: #1a1a22;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 14px;
  padding: 14px 16px;
}

.rdp-info-lbl {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #6b6b85;
  margin-bottom: 6px;
}

.rdp-info-val {
  font-size: 14px;
  font-weight: 600;
  color: #f0f0f8;
  line-height: 1.4;
}

.rdp-info-val.accent { color: #fbbf24; }
.rdp-info-val.full { grid-column: 1 / -1; }

/* ── HOURS ── */
.rdp-hours-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  background: #1a1a22;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.05);
  gap: 12px;
  flex-wrap: wrap;
}

.rdp-open-chip {
  padding: 5px 14px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
}
.rdp-open-chip.open { background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); color: #34d399; }
.rdp-open-chip.closed { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: #f87171; }

/* ── CTA ROW ── */
.rdp-cta-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

@media (max-width: 440px) { .rdp-cta-row { grid-template-columns: 1fr; } }

.rdp-btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: linear-gradient(135deg, #ff4d00, #cc3a00);
  border: none;
  border-radius: 16px;
  color: #fff;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
  box-shadow: 0 4px 20px rgba(255,77,0,0.3);
}
.rdp-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255,77,0,0.45); }

.rdp-btn-secondary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  color: #f0f0f8;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
}
.rdp-btn-secondary:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.2); }

/* ── LOADING/ERROR ── */
.rdp-center {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0c0c10;
  font-family: 'Bricolage Grotesque', sans-serif;
  color: #6b6b85;
}

.rdp-spin {
  width: 40px; height: 40px;
  border: 2px solid rgba(255,77,0,0.15);
  border-top-color: #ff4d00;
  border-radius: 50%;
  animation: rdp-spin 0.7s linear infinite;
}

@keyframes rdp-spin { to { transform: rotate(360deg); } }

/* ── RESPONSIVE ── */
@media (max-width: 640px) {
  .rdp-hero { height: 55vh; min-height: 360px; }
  .rdp-hero-content { padding: 0 16px 24px; }
  .rdp-body { padding: 0 16px 80px; }
}
`;

function formatTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function isOpen(open, close) {
  if (!open || !close) return null;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = open.split(":").map(Number);
  const [ch, cm] = close.split(":").map(Number);
  return cur >= oh * 60 + om && cur <= ch * 60 + cm;
}

function Stars({ rating }) {
  return (
    <div className="rdp-stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: rating >= s ? "#fbbf24" : rating >= s - 0.5 ? "#fbbf24" : "#2e2e3d", opacity: rating >= s - 0.5 ? 1 : 0.5 }}>★</span>
      ))}
    </div>
  );
}

function RestaurantDetailPage() {
  const { restaurantId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { restaurant: r, restaurantDetailLoading, error } = useSelector((s) => s.restaurant);

  useEffect(() => {
    if (restaurantId) dispatch(getRestaurantByIdPublic(restaurantId));
  }, [dispatch, restaurantId]);

  // Inject style once
  useEffect(() => {
    if (document.getElementById("rdp-style")) return;
    const el = document.createElement("style");
    el.id = "rdp-style";
    el.textContent = STYLE;
    document.head.appendChild(el);
  }, []);

  if (restaurantDetailLoading && !r) {
    return <div className="rdp-center"><div className="rdp-spin" /></div>;
  }

  if (error && !r) {
    return (
      <div className="rdp-center" style={{ flexDirection: "column", gap: 16 }}>
        <p style={{ fontSize: 16 }}>{String(error)}</p>
        <button onClick={() => navigate(-1)} style={{ color: "#ff7340", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>← Go back</button>
      </div>
    );
  }

  const foodTypeChip = {
    veg: { cls: "veg", label: "🥦 Pure Veg" },
    "non-veg": { cls: "nonveg", label: "🍖 Non-Veg" },
    both: { cls: "both", label: "🍽️ Veg & Non-Veg" },
  };
  const ftc = foodTypeChip[r?.foodType] ?? foodTypeChip.both;
  const openStatus = isOpen(r?.openingHours?.open, r?.openingHours?.close);
  const cityName = r?.city?.name ?? "—";
  const stateName = r?.state?.name ?? "";

  return (
    <div className="rdp-root">

      {/* ── HERO ── */}
      <div className="rdp-hero">
        <img
          src={r?.images?.[0] || "https://placehold.co/1400x700/131318/ff4d00?text=Restaurant"}
          alt={r?.name}
          className="rdp-hero-img"
        />
        <div className="rdp-hero-gradient" />

        <button className="rdp-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeftIcon style={{ width: 14, height: 14 }} />
          Back
        </button>

        {openStatus !== null && (
          <div className={`rdp-status-badge ${openStatus ? "open" : "closed"}`}>
            <span className="rdp-status-live" />
            {openStatus ? "Open Now" : "Closed"}
          </div>
        )}

        <div className="rdp-hero-content">
          <div className="rdp-hero-chips">
            <span className={`rdp-chip ${ftc.cls}`}>{ftc.label}</span>
            {r?.isRecommended && <span className="rdp-chip rec">⭐ Editor's Pick</span>}
            {cityName && (
              <span className="rdp-chip">
                <MapPinIcon style={{ width: 11, height: 11 }} />
                {cityName}{stateName ? `, ${stateName}` : ""}
              </span>
            )}
          </div>

          <h1 className="rdp-hero-name">{r?.name ?? "Restaurant"}</h1>

          <div className="rdp-rating-row">
            <span className="rdp-rating-val">{r?.averageRating?.toFixed(1) ?? "—"}</span>
            <Stars rating={r?.averageRating ?? 0} />
            <span className="rdp-reviews">({r?.totalReviews?.toLocaleString() ?? 0} reviews)</span>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="rdp-body">

        {/* ── STAT STRIP ── */}
        <motion.div
          className="rdp-stats-strip"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="rdp-stat-card">
            <span className="rdp-stat-icon">⭐</span>
            <span className="rdp-stat-val">{r?.averageRating?.toFixed(1) ?? "—"}</span>
            <span className="rdp-stat-lbl">{r?.totalReviews?.toLocaleString()} Reviews</span>
          </div>
          <div className="rdp-stat-card">
            <span className="rdp-stat-icon">💰</span>
            <span className="rdp-stat-val">₹{r?.avgCostForOne ?? "—"}</span>
            <span className="rdp-stat-lbl">Per Person</span>
          </div>
          <div className="rdp-stat-card">
            <span className="rdp-stat-icon">🕐</span>
            <span className="rdp-stat-val" style={{ fontSize: 13 }}>{formatTime(r?.openingHours?.open)}</span>
            <span className="rdp-stat-lbl">Opens At</span>
          </div>
          <div className="rdp-stat-card">
            <span className="rdp-stat-icon">✨</span>
            <span className="rdp-stat-val" style={{ fontSize: 13 }}>{r?.bestTime || "Anytime"}</span>
            <span className="rdp-stat-lbl">Best Time</span>
          </div>
        </motion.div>

        {/* ── CTA BUTTONS ── */}
        <motion.div
          className="rdp-cta-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
        >
          <Link to={`/restaurant/${restaurantId}/menu`} className="rdp-btn-primary">
            <span>🍴</span> View Full Menu
          </Link>
          <Link to="/restaurants" className="rdp-btn-secondary">
            <span>🗺️</span> More Restaurants
          </Link>
        </motion.div>

        {/* ── ABOUT ── */}
        <motion.div
          className="rdp-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22 }}
        >
          <p className="rdp-card-title">About This Restaurant</p>
          <div className="rdp-info-grid">
            {r?.famousFood && (
              <div className="rdp-info-item">
                <p className="rdp-info-lbl">Famous For</p>
                <p className="rdp-info-val">{r.famousFood}</p>
              </div>
            )}
            <div className="rdp-info-item">
              <p className="rdp-info-lbl">Cuisine</p>
              <p className="rdp-info-val">{ftc.label}</p>
            </div>
            <div className="rdp-info-item">
              <p className="rdp-info-lbl">Avg Cost</p>
              <p className="rdp-info-val accent">₹{r?.avgCostForOne ?? "—"} per person</p>
            </div>
            {r?.bestTime && (
              <div className="rdp-info-item">
                <p className="rdp-info-lbl">Best Time</p>
                <p className="rdp-info-val">{r.bestTime}</p>
              </div>
            )}
            <div className="rdp-info-item" style={{ gridColumn: "1 / -1" }}>
              <p className="rdp-info-lbl">Address</p>
              <p className="rdp-info-val">{r?.address}, {cityName}{stateName ? `, ${stateName}` : ""}</p>
            </div>
          </div>
        </motion.div>

        {/* ── HOURS ── */}
        <motion.div
          className="rdp-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.28 }}
        >
          <p className="rdp-card-title">Opening Hours</p>
          <div className="rdp-hours-row">
            <div>
              <p style={{ fontSize: 12, color: "#6b6b85", marginBottom: 4 }}>Today's Timings</p>
              <p style={{ fontFamily: "'Bricolage Grotesque'", fontWeight: 800, fontSize: 20, color: "#f0f0f8", display: "flex", alignItems: "center", gap: 8 }}>
                <ClockIcon style={{ width: 18, height: 18, color: "#ff7340" }} />
                {formatTime(r?.openingHours?.open)} — {formatTime(r?.openingHours?.close)}
              </p>
            </div>
            {openStatus !== null && (
              <span className={`rdp-open-chip ${openStatus ? "open" : "closed"}`}>
                {openStatus ? "● Open Now" : "● Closed"}
              </span>
            )}
          </div>
        </motion.div>

        {/* ── PHOTO STRIP ── */}
        {r?.images?.length > 1 && (
          <motion.div
            className="rdp-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.32 }}
          >
            <p className="rdp-card-title">Photos</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
              {r.images.map((src, i) => (
                <div key={i} style={{ borderRadius: 12, overflow: "hidden", aspectRatio: "4/3", position: "relative" }}>
                  <img
                    src={src}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s", display: "block" }}
                    onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
                    onMouseLeave={e => e.target.style.transform = "scale(1)"}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

export default RestaurantDetailPage;
