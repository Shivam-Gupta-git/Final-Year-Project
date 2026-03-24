import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ─── Mock API  GET /api/features ───────────────────────────────────────────────
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
    route: "/food",
    icon: "🍜",
    tag: "EAT",
    title: "Local Food Trails",
    desc: "Eat where the locals eat. Curated food experiences, street food maps, and chef-recommended restaurants at every stop.",
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

async function fetchFeatures() {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ data: MOCK_DB.filter((f) => f.active) }), 900),
  );
}

// ─── Particles ─────────────────────────────────────────────────────────────────
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
    <div
      style={{
        position: "absolute",
        inset: 0,
        // overflow: "hidden",
        pointerEvents: "none",
      }}
    >
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

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      style={{
        background: "rgba(255,255,255,.07)",
        border: "1px solid rgba(255,255,255,.1)",
        borderRadius: 20,
        padding: "32px 28px",
        backdropFilter: "blur(16px)",
      }}
    >
      {["40px", "60%", "90%", "75%", "50%"].map((w, i) => (
        <div
          key={i}
          style={{
            height: i === 0 ? 40 : 13,
            width: w,
            background: "rgba(255,255,255,.1)",
            borderRadius: 8,
            marginBottom: i === 0 ? 20 : 10,
            animation: `shimmer 1.6s ${i * 0.15}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Feature Card ──────────────────────────────────────────────────────────────
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
      onKeyDown={(e) => e.key === "Enter" && onNavigate(feature)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: hovered ? "rgba(255,255,255,.17)" : "rgba(255,255,255,.08)",
        border: `1px solid ${hovered ? "rgba(255,255,255,.32)" : "rgba(255,255,255,.13)"}`,
        borderRadius: 20,
        padding: "32px 28px 28px",
        cursor: "pointer",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
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
        transition:
          "transform .38s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease, background .25s ease, border-color .25s ease, opacity .55s ease",
        outline: "none",
        // overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Gradient glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 20,
          background: `linear-gradient(135deg, ${c1}20, ${c2}20)`,
          opacity: hovered ? 1 : 0,
          transition: "opacity .3s ease",
          pointerEvents: "none",
        }}
      />
      {/* Top line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 24,
          right: 24,
          height: 2,
          background: `linear-gradient(90deg, ${c1}, ${c2})`,
          borderRadius: "0 0 4px 4px",
          opacity: hovered ? 1 : 0,
          transition: "opacity .3s ease",
        }}
      />

      {/* Tag */}
      <div
        style={{
          display: "inline-block",
          background: `linear-gradient(135deg, ${c1}30, ${c2}30)`,
          border: `1px solid ${c1}50`,
          borderRadius: 999,
          padding: "3px 12px",
          fontSize: 9,
          fontWeight: 800,
          color: "#fff",
          letterSpacing: ".12em",
          marginBottom: 18,
          fontFamily: "'Plus Jakarta Sans',sans-serif",
        }}
      >
        {feature.tag}
      </div>

      {/* Icon */}
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: 16,
          background: `linear-gradient(135deg, ${c1}, ${c2})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          marginBottom: 18,
          boxShadow: `0 8px 24px ${c1}55`,
          transform: hovered
            ? "scale(1.12) rotate(-5deg)"
            : "scale(1) rotate(0)",
          transition: "transform .38s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        {feature.icon}
      </div>

      <h3
        style={{
          fontFamily: "'Instrument Serif',serif",
          fontSize: 21,
          fontWeight: 400,
          color: "#fff",
          lineHeight: 1.25,
          marginBottom: 10,
          letterSpacing: "-.01em",
        }}
      >
        {feature.title}
      </h3>

      <p
        style={{
          fontFamily: "'Plus Jakarta Sans',sans-serif",
          fontSize: 13,
          color: "rgba(255,255,255,.6)",
          lineHeight: 1.78,
          marginBottom: 22,
          fontWeight: 400,
          flex: 1,
        }}
      >
        {feature.desc}
      </p>

      {/* Stat */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 6,
          borderTop: "1px solid rgba(255,255,255,.1)",
          paddingTop: 16,
        }}
      >
        <span
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 24,
            fontWeight: 400,
            background: `linear-gradient(135deg, ${c1}, ${c2})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {feature.stat}
        </span>
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            fontSize: 11,
            color: "rgba(255,255,255,.4)",
            fontWeight: 500,
          }}
        >
          {feature.statLabel}
        </span>
      </div>

      {/* Arrow */}
      <div
        style={{
          position: "absolute",
          bottom: 26,
          right: 26,
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "rgba(255,255,255,.1)",
          border: "1px solid rgba(255,255,255,.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          color: "#fff",
          opacity: hovered ? 1 : 0,
          transform: hovered
            ? "scale(1) translateX(0)"
            : "scale(.5) translateX(-10px)",
          transition:
            "opacity .25s ease, transform .32s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        →
      </div>
    </div>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(10,10,20,.88)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,.15)",
        borderRadius: 999,
        padding: "13px 26px",
        color: "#fff",
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        boxShadow: "0 8px 40px rgba(0,0,0,.4)",
        zIndex: 9999,
        animation: "toastIn .35s cubic-bezier(.34,1.56,.64,1)",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#4facfe",
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      {msg}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function WhyChooseUs() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    setError(null);
    fetchFeatures()
      .then((res) => {
        setFeatures(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load features.");
        setLoading(false);
      });
  };
  useEffect(load, []);

  const tags = ["ALL", ...Array.from(new Set(features.map((f) => f.tag)))];
  const visible =
    filter === "ALL" ? features : features.filter((f) => f.tag === filter);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes floatDot{from{transform:translateY(0)}to{transform:translateY(-20px)}}
        @keyframes shimmer{from{opacity:.4}to{opacity:.9}}
        @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        .wcu-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
        @media(max-width:960px){.wcu-grid{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:580px){.wcu-grid{grid-template-columns:1fr;}}
        .fpill{
          background:rgba(255,255,255,.09);
          border:1px solid rgba(255,255,255,.16);
          color:rgba(255,255,255,.65);
          border-radius:999px;padding:7px 18px;
          font-family:'Plus Jakarta Sans',sans-serif;
          font-size:10px;font-weight:800;letter-spacing:.1em;
          cursor:pointer;backdrop-filter:blur(8px);
          transition:all .2s ease;text-transform:uppercase;
        }
        .fpill:hover{background:rgba(255,255,255,.16);color:#fff;}
        .fpill.on{background:rgba(255,255,255,.22);border-color:rgba(255,255,255,.38);color:#fff;box-shadow:0 4px 20px rgba(0,0,0,.25);}
        .cta-btn{
          background:linear-gradient(135deg,#4facfe,#667eea);
          border:none;border-radius:999px;
          padding:16px 44px;color:#fff;
          font-family:'Plus Jakarta Sans',sans-serif;
          font-size:14px;font-weight:700;letter-spacing:.04em;
          cursor:pointer;
          box-shadow:0 8px 32px rgba(79,172,254,.35);
          transition:transform .25s ease,box-shadow .25s ease;
        }
        .cta-btn:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(79,172,254,.48);}
      `}</style>

      <section
        style={{
          position: "relative",
          background:
            "linear-gradient(135deg, #0d0b20 0%, #1a1040 28%, #0f2040 60%, #0a1628 100%)",
          padding: "100px 24px 112px",
          // overflow: "hidden",
          fontFamily: "'Plus Jakarta Sans',sans-serif",
        }}
      >
        <Particles />

        {/* Ambient orbs */}
        {[
          { style: { top: "0px", left: "0px" }, size: 400, c: "#667eea" },
          { style: { top: "35%", right: "-120px" }, size: 420, c: "#f093fb" },
          { style: { bottom: "-100px", left: "25%" }, size: 380, c: "#4facfe" },
        ].map((o, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...o.style,
              width: o.size,
              height: o.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${o.c}16 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />
        ))}

        <div
          style={{
            maxWidth: 1140,
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: "center",
              marginBottom: 52,
              animation: "fadeUp .7s ease both",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,.09)",
                border: "1px solid rgba(255,255,255,.18)",
                borderRadius: 999,
                padding: "6px 20px",
                marginBottom: 24,
                backdropFilter: "blur(12px)",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#4facfe",
                  boxShadow: "0 0 8px #4facfe",
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "rgba(255,255,255,.8)",
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                }}
              >
                Why Choose Us
              </span>
            </div>

            <h2
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: "clamp(34px, 5.5vw, 58px)",
                fontWeight: 400,
                color: "#fff",
                lineHeight: 1.1,
                marginBottom: 18,
                letterSpacing: "-.02em",
              }}
            >
              Travel smarter.
              <br />
              <em
                style={{
                  background:
                    "linear-gradient(90deg, #4facfe 0%, #f093fb 50%, #43e97b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Experience more.
              </em>
            </h2>

            <p
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,.5)",
                lineHeight: 1.8,
                maxWidth: 500,
                margin: "0 auto",
                fontWeight: 400,
              }}
            >
              Every feature we've built exists to make your journey more
              effortless, more memorable, and more you.
            </p>
          </div>

          {/* Filters */}
          {!loading && !error && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 8,
                marginBottom: 44,
                animation: "fadeUp .7s .15s ease both",
              }}
            >
              {tags.map((tag) => (
                <button
                  key={tag}
                  className={`fpill ${filter === tag ? "on" : ""}`}
                  onClick={() => setFilter(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              style={{
                textAlign: "center",
                padding: "48px 0",
                color: "rgba(255,255,255,.45)",
                fontSize: 14,
              }}
            >
              ⚠ {error} —{" "}
              <button
                onClick={load}
                style={{
                  background: "none",
                  border: "none",
                  color: "#4facfe",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Grid */}
          <div className="wcu-grid">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : visible.map((f, i) => (
                  <FeatureCard
                    key={f.id}
                    feature={f}
                    index={i}
                    onNavigate={(f) => {
                      // scroll if section exists
                      const sectionId =
                        f.route === "/hotels"
                          ? "hotel"
                          : f.route === "/places"
                            ? "places"
                            : f.route === "/travel"
                              ? "travel"
                              : null;

                      if (sectionId && document.getElementById(sectionId)) {
                        document
                          .getElementById(sectionId)
                          ?.scrollIntoView({ behavior: "smooth" });
                      } else {
                        navigate(f.route);
                      }
                    }}
                  />
                ))}
          </div>

          {/* CTA */}
          {!loading && !error && (
            <div
              style={{
                textAlign: "center",
                marginTop: 68,
                animation: "fadeUp .7s .4s ease both",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,.28)",
                  marginTop: 14,
                  fontWeight: 500,
                }}
              >
                No account needed · Free to browse
              </p>
            </div>
          )}
        </div>
      </section>

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </>
  );
}
