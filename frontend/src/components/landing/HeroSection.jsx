import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { smartSearch } from "../../features/user/searchSlice";

const TABS = [
  { key: "cities", label: "Cities", icon: "🏙️" },
  { key: "hotels", label: "Hotels", icon: "🏨" },
  { key: "places", label: "Places", icon: "📍" },
  { key: "restaurants", label: "Restaurants", icon: "🍽️" },
  { key: "travel", label: "Travel", icon: "✈️" },
];

const IMAGES = [
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
  "https://images.unsplash.com/photo-1467269204594-9661b134dd2b",
];

const HEADLINE_MAP = {
  cities: {
    title: "Discover Your Next City",
    sub: "Explore urban wonders around the globe",
  },
  hotels: {
    title: "Stay in Luxury",
    sub: "Hand-picked hotels for every journey",
  },
  places: {
    title: "Find Hidden Gems",
    sub: "Off-the-beaten-path destinations await",
  },
  restaurants: {
    title: "Taste the World",
    sub: "Authentic flavours at every destination",
  },
  travel: {
    title: "The World is Yours",
    sub: "Plan the adventure of a lifetime",
  },
};

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState("cities");
  const [currentImage, setCurrentImage] = useState(0);
  const [formData, setFormData] = useState({
    city: "",
    checkIn: "",
    checkOut: "",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* ── slideshow ── */
  useEffect(() => {
    const id = setInterval(
      () => setCurrentImage((p) => (p + 1) % IMAGES.length),
      10000,
    );
    return () => clearInterval(id);
  }, []);

  /* ── original logic – untouched ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearch = () => {
    if (!formData.city?.trim()) {
      alert("Please enter city");
      return;
    }
    let query = "",
      route = "";
    if (activeTab === "hotels") {
      query = `${formData.city.trim()} hotels`;
      route = "/hotels";
    } else if (activeTab === "places") {
      query = `${formData.city.trim()} places`;
      route = "/places";
    } else if (activeTab === "cities") {
      query = formData.city.trim();
      route = "/cities";
    } else if (activeTab === "restaurants") {
      query = `${formData.city.trim()} restaurants`;
      route = "/restaurants";
    } else {
      query = formData.city.trim();
      route = "/travel";
    }
    console.log("✅ SENDING QUERY:", query);
    console.log("📍 ROUTE:", route);
    dispatch(smartSearch(query))
      .unwrap()
      .then(() => navigate(route))
      .catch((err) => console.error("API ERROR:", err));
  };

  const handleTabClick = (key) => {
    setActiveTab(key);
    const sectionMap = {
      cities: "popular-cities",
      hotels: "why-choose-us",
      places: "why-choose-us",
      restaurants: "why-choose-us",
      travel: "why-choose-us",
    };
    const el = document.getElementById(sectionMap[key]);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const { title, sub } = HEADLINE_MAP[activeTab];

  return (
    <>
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --gold:   #C9A84C;
          --gold-lt:#F0D87C;
          --ink:    #0F0E0D;
          --cream:  #FAF7F2;
          --glass:  rgba(255,255,255,0.07);
          --border: rgba(255,255,255,0.14);
        }

        .hero-root { font-family: 'DM Sans', sans-serif; }
        .serif     { font-family: 'Cormorant Garamond', serif; }

        /* ── slide ── */
        .slide { position:absolute; inset:0; background-size:cover; background-position:center; transition:opacity 1.2s ease-in-out; }
        .slide-in  { opacity:1; }
        .slide-out { opacity:0; }

        /* ── headline ── */
        .headline {
          animation: fadeUp .7s ease both;
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0);    }
        }

        /* ── tabs ── */
        .tab-pill {
          display:flex; align-items:center; gap:8px;
          padding:10px 20px; border-radius:100px;
          font-size:13px; font-weight:500; letter-spacing:.02em;
          border:1px solid var(--border);
          background: var(--glass);
          color: rgba(255,255,255,.65);
          backdrop-filter: blur(12px);
          cursor:pointer;
          transition: all .25s ease;
          white-space:nowrap;
        }
        .tab-pill:hover { color:#fff; border-color:rgba(255,255,255,.35); background:rgba(255,255,255,.12); }
        .tab-pill.active {
          background: linear-gradient(135deg, var(--gold), #a8732a);
          border-color: transparent;
          color:#fff;
          box-shadow: 0 4px 20px rgba(201,168,76,.45);
        }
        .tab-pill .icon { font-size:16px; }

        /* ── search card ── */
        .search-card {
          background: rgba(15,14,13,0.72);
          border: 1px solid var(--border);
          backdrop-filter: blur(28px) saturate(1.4);
          border-radius: 24px;
          padding: 36px 40px 40px;
        }
        @media (max-width:640px) { .search-card { padding:24px 20px 28px; } }

        /* ── inputs ── */
        .field-wrap { display:flex; flex-direction:column; gap:8px; flex:1; min-width:200px; }
        .field-label { font-size:11px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.45); }
        .field-inner { position:relative; }
        .field-icon  { position:absolute; left:16px; top:50%; transform:translateY(-50%); color:rgba(255,255,255,.35); pointer-events:none; }
        .field-input {
          width:100%; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12);
          border-radius:14px; padding:14px 16px 14px 44px;
          color:#fff; font-size:15px; font-family:'DM Sans',sans-serif; outline:none;
          transition: border-color .2s, box-shadow .2s;
        }
        .field-input::placeholder { color:rgba(255,255,255,.28); }
        .field-input:focus { border-color: var(--gold); box-shadow:0 0 0 3px rgba(201,168,76,.18); }
        input[type="date"]::-webkit-calendar-picker-indicator { filter:invert(.5); cursor:pointer; }

        /* ── divider ── */
        .field-divider { width:1px; height:56px; background:rgba(255,255,255,.1); align-self:flex-end; margin-bottom:2px; flex-shrink:0; }
        @media (max-width:768px) { .field-divider { display:none; } }

        /* ── search button ── */
        .search-btn {
          display:flex; align-items:center; gap:10px;
          background: linear-gradient(135deg, var(--gold) 0%, #b8832a 100%);
          color:#0F0E0D; font-weight:700; font-size:14px; letter-spacing:.04em;
          padding:0 32px; height:52px; border-radius:14px; border:none; cursor:pointer;
          white-space:nowrap; flex-shrink:0;
          box-shadow: 0 6px 28px rgba(201,168,76,.4);
          transition: transform .2s, box-shadow .2s, filter .2s;
        }
        .search-btn:hover { transform:translateY(-2px); box-shadow:0 10px 36px rgba(201,168,76,.55); filter:brightness(1.06); }
        .search-btn:active { transform:translateY(0); }
        .search-btn svg { transition: transform .2s; }
        .search-btn:hover svg { transform:translateX(3px); }

        /* ── dots ── */
        .dot { height:6px; border-radius:100px; transition: all .35s ease; cursor:pointer; background:rgba(255,255,255,.35); }
        .dot.active { width:28px !important; background:#fff; }
        .dot:not(.active) { width:6px; }
        .dot:hover:not(.active) { background:rgba(255,255,255,.65); }

        /* ── stat chips ── */
        .stat-chip {
          display:flex; align-items:center; gap:8px;
          background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12);
          backdrop-filter:blur(12px); border-radius:100px;
          padding:8px 16px; color:rgba(255,255,255,.8); font-size:13px;
        }
        .stat-chip strong { color:#fff; font-weight:600; }
      `}</style>

      <section className="hero-root relative w-full min-h-screen overflow-hidden">
        {/* ── Background Slideshow ── */}
        <div style={{ position: "absolute", inset: 0 }}>
          {IMAGES.map((img, i) => (
            <div
              key={i}
              className={`slide ${i === currentImage ? "slide-in" : "slide-out"}`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
          {/* dramatic cinematic vignette */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(10,9,8,0.92) 0%, rgba(10,9,8,0.45) 50%, rgba(10,9,8,0.25) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to right, rgba(10,9,8,0.4) 0%, transparent 60%)",
            }}
          />
        </div>

        {/* ── Content ── */}
        <div
          style={{
            position: "relative",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "80px 24px 60px",
          }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
            {/* ── Eyebrow ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <div
                style={{ height: 1, width: 32, background: "var(--gold)" }}
              />
              <span
                style={{
                  color: "var(--gold)",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: ".15em",
                  textTransform: "uppercase",
                }}
              >
                World-Class Travel Planning
              </span>
            </div>

            {/* ── Headline ── */}
            <div className="headline" key={activeTab}>
              <h1
                className="serif"
                style={{
                  fontSize: "clamp(42px, 7vw, 88px)",
                  fontWeight: 300,
                  color: "#fff",
                  lineHeight: 1.05,
                  marginBottom: 14,
                  letterSpacing: "-.01em",
                }}
              >
                {title}
              </h1>
              <p
                style={{
                  color: "rgba(255,255,255,.55)",
                  fontSize: "clamp(14px,2vw,17px)",
                  fontWeight: 300,
                  marginBottom: 40,
                  maxWidth: 480,
                }}
              >
                {sub}
              </p>
            </div>

            {/* ── Tab Pills ── */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 36,
              }}
            >
              {TABS.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => handleTabClick(key)}
                  className={`tab-pill ${activeTab === key ? "active" : ""}`}
                >
                  <span className="icon">{icon}</span>
                  {label}
                </button>
              ))}
            </div>

            {/* ── Search Card ── */}
            <div className="search-card">
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 0,
                  alignItems: "flex-end",
                }}
              >
                {/* City */}
                <div className="field-wrap" style={{ marginRight: 0 }}>
                  <span className="field-label">Destination</span>
                  <div className="field-inner">
                    <svg
                      className="field-icon"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <input
                      className="field-input"
                      type="text"
                      name="city"
                      placeholder="City or destination"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="field-divider" style={{ margin: "0 20px" }} />

                {/* Check-in */}
                <div className="field-wrap">
                  <span className="field-label">Check-in</span>
                  <div className="field-inner">
                    <svg
                      className="field-icon"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <input
                      className="field-input"
                      type="date"
                      name="checkIn"
                      value={formData.checkIn}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="field-divider" style={{ margin: "0 20px" }} />

                {/* Check-out */}
                <div className="field-wrap">
                  <span className="field-label">Check-out</span>
                  <div className="field-inner">
                    <svg
                      className="field-icon"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <input
                      className="field-input"
                      type="date"
                      name="checkOut"
                      value={formData.checkOut}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Search Button */}
                <div
                  style={{
                    marginLeft: "auto",
                    paddingLeft: 20,
                    paddingTop: 24,
                    flexShrink: 0,
                  }}
                >
                  <button className="search-btn" onClick={handleSearch}>
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                      />
                    </svg>
                    Search
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* ── Stats row ── */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginTop: 28,
              }}
            >
              {[
                { label: "Destinations", value: "500+" },
                { label: "Happy Travellers", value: "2M+" },
                { label: "Hotels Listed", value: "12K+" },
              ].map(({ label, value }) => (
                <div key={label} className="stat-chip">
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Slide Dots ── */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            right: 32,
            display: "flex",
            gap: 6,
            zIndex: 30,
          }}
        >
          {IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentImage(i)}
              className={`dot ${i === currentImage ? "active" : ""}`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      </section>
    </>
  );
}
