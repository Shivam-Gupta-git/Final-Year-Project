import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getActiveCities } from "../../features/user/citySlice";

/* ─── Placeholder SVG ─── */
const ph = (w, h, t) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <rect width="${w}" height="${h}" fill="#f1ede6"/>
      <text x="50%" y="50%" fill="#b5a898" text-anchor="middle" dy=".3em"
        font-size="13" font-family="sans-serif">${t}</text>
    </svg>`
  )}`;

/* ─── Style injection ─── */
const injectStyles = () => {
  if (!document.getElementById("pc-font")) {
    const l = document.createElement("link");
    l.id = "pc-font";
    l.rel = "stylesheet";
    l.href =
      "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600&display=swap";
    document.head.appendChild(l);
  }
  if (document.getElementById("pc-styles")) return;
  const s = document.createElement("style");
  s.id = "pc-styles";
  s.textContent = `
    :root {
      --pc-bg:      #f7f3ee;
      --pc-sand:    #ede8df;
      --pc-stone:   #c8c0b4;
      --pc-ink:     #1a1714;
      --pc-ink2:    #3d3830;
      --pc-ink3:    #7a7469;
      --pc-accent:  #e8622a;
      --pc-white:   rgba(255,255,255,0.94);
    }

    @keyframes pcKenBurns { from{transform:scale(1)} to{transform:scale(1.09)} }
    @keyframes pcSlideUp   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
    @keyframes pcSlideDown { from{opacity:0;transform:translateY(-28px)} to{opacity:1;transform:none} }
    @keyframes pcFadeIn    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
    @keyframes pcProgress  { from{width:0} to{width:100%} }
    @keyframes pcShimmer {
      0%  { background-position:200% 0 }
      100%{ background-position:-200% 0 }
    }
    @keyframes pcPulse {
      0%,100%{ box-shadow:0 0 0 0 rgba(232,98,42,.4) }
      50%    { box-shadow:0 0 0 7px rgba(232,98,42,0) }
    }
    @keyframes pcTagSlide { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:none} }

    .pc-ken      { animation:pcKenBurns 22s ease-out forwards }
    .pc-slide-up { animation:pcSlideUp   .5s cubic-bezier(.22,1,.36,1) both }
    .pc-slide-dn { animation:pcSlideDown .5s cubic-bezier(.22,1,.36,1) both }
    .pc-fi1 { animation:pcFadeIn .5s ease .08s both }
    .pc-fi2 { animation:pcFadeIn .5s ease .18s both }
    .pc-fi3 { animation:pcFadeIn .5s ease .30s both }
    .pc-fi4 { animation:pcFadeIn .5s ease .42s both }
    .pc-tag-anim { animation:pcTagSlide .4s ease both }
    .pc-card-fade{ animation:pcFadeIn .38s ease both }
    .pc-noscroll { scrollbar-width:none }
    .pc-noscroll::-webkit-scrollbar { display:none }
    .pc-shimmer {
      background:linear-gradient(90deg,#ede8df 0%,#e6e0d6 40%,#ede8df 80%);
      background-size:400% 100%;
      animation:pcShimmer 1.8s ease-in-out infinite;
    }
    .pc-progress-fill {
      height:100%; background:var(--pc-accent); border-radius:2px;
      animation:pcProgress 3s linear forwards;
    }
    .pc-dot {
      width:7px; height:7px; border-radius:50%; border:none;
      background:var(--pc-stone); cursor:pointer; padding:0; flex-shrink:0;
      transition:all .32s cubic-bezier(.34,1.26,.64,1);
    }
    .pc-dot:hover { background:var(--pc-ink2); transform:scale(1.2) }
    .pc-dot-active {
      background:var(--pc-accent) !important;
      transform:scaleY(3.2) scaleX(1) !important;
      border-radius:4px !important;
      animation:pcPulse 2s ease-in-out infinite;
    }
    .pc-card {
      background:var(--pc-white);
      border-radius:20px; overflow:hidden;
      position:relative; flex-shrink:0; cursor:pointer;
      border:1.5px solid rgba(255,255,255,.7);
      transition:transform .45s cubic-bezier(.34,1.26,.64,1),
                 box-shadow .45s ease, opacity .45s ease;
    }
    .pc-card:hover {
      transform:translateY(-7px) scale(1.028) !important;
      box-shadow: 0 8px 24px rgba(198, 124, 78, 0.35) !important;
      opacity:1 !important; z-index:20 !important;
    }
    .pc-card img { transition:transform .55s ease }
    .pc-card:hover img { transform:scale(1.08) }
    .pc-bm {
      position:absolute; top:10px; right:10px;
      width:32px; height:32px; border-radius:50%; border:none;
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; z-index:5; transition:all .22s;
      backdrop-filter:blur(8px);
    }
    .pc-bm:hover { transform:scale(1.14) }
    .pc-btn-primary {
      background:var(--pc-ink); color:#fff; border:none;
      border-radius:100px; padding:14px 28px;
      font-family:'Outfit',sans-serif; font-size:12px; font-weight:500;
      letter-spacing:.02em; cursor:pointer;
      display:inline-flex; align-items:center; gap:10px;
      transition:background .22s, transform .22s, box-shadow .22s;
    }
    .pc-btn-primary:hover {
      background: linear-gradient(to right, #c67c4e, #b86c3d); transform:translateY(-2px);
      box-shadow:0 12px 32px rgba(232,98,42,.28);
    }
    .pc-btn-primary:active { transform:scale(.97) }
    .pc-btn-ghost {
      background:transparent; color:linear-gradient(to right, #c67c4e, #b86c3d);
      border:1.5px solid var(--pc-stone); border-radius:100px;
      padding:13px 22px; font-family:'Outfit',sans-serif; font-size:14px;
      font-weight:500; cursor:pointer;
      display:inline-flex; align-items:center; gap:8px;
      transition:border-color .2s, color .2s, background .2s;
    }
    .pc-btn-ghost:hover { border-color:var(--pc-ink2); background:rgba(26,23,20,.04) }
    .pc-btn-circle {
      width:44px; height:44px; border-radius:50%;
      border:1.5px solid var(--pc-stone); 
      background:var(--pc-bg);
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; color:var(--pc-ink);
      transition:all .22s;
    }
    .pc-btn-circle:hover {
      border-color:var(--pc-ink); background:var(--pc-ink); color:#fff;
      transform:scale(1.08);
    }
    .pc-btn-circle-accent {
      width:44px; height:40px; border-radius:50%; border:none;

      color:#fff;
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; box-shadow:0 6px 20px rgba(232,98,42,.3);
      transition:all .22s;
    }
    .pc-btn-circle-accent:hover {
      background:#cf5320; transform:scale(1.08);
      box-shadow:0 10px 28px rgba(232,98,42,.42);
    }
    @media (prefers-reduced-motion:reduce) {
      *, *::before, *::after {
        animation-duration:.001ms !important;
        transition-duration:.001ms !important;
      }
    }
  `;
  document.head.appendChild(s);
};
injectStyles();

/* ─── Skeleton ─── */
function Skeleton() {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "var(--pc-bg)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="pc-shimmer" style={{ position: "absolute", inset: 0 }} />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 68,
          background: "rgba(247,243,238,.8)",
        }}
      />
      <div
        className="pc-shimmer"
        style={{
          position: "absolute",
          left: 60,
          bottom: 220,
          width: 300,
          height: 68,
          borderRadius: 10,
        }}
      />
      <div
        className="pc-shimmer"
        style={{
          position: "absolute",
          left: 60,
          bottom: 168,
          width: 180,
          height: 10,
          borderRadius: 8,
        }}
      />
      <div
        className="pc-shimmer"
        style={{
          position: "absolute",
          left: 60,
          bottom: 124,
          width: 136,
          height: 44,
          borderRadius: 100,
        }}
      />
      <div
        className="pc-shimmer"
        style={{
          position: "absolute",
          right: 216,
          top: "50%",
          marginTop: -130,
          width: 168,
          height: 258,
          borderRadius: 20,
          opacity: 0.55,
        }}
      />
      <div
        className="pc-shimmer"
        style={{
          position: "absolute",
          right: 26,
          top: "50%",
          marginTop: -155,
          width: 208,
          height: 308,
          borderRadius: 20,
        }}
      />
    </div>
  );
}

/* ─── Stars ─── */
const Stars = React.memo(({ rating = 4 }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <svg
        key={s}
        width="9"
        height="9"
        viewBox="0 0 12 12"
        fill={s <= rating ? "#e8622a" : "#d4cfc7"}
      >
        <path d="M6 1l1.3 2.7 3 .4-2.2 2.1.5 3L6 8l-2.6 1.2.5-3L1.7 4.1l3-.4z" />
      </svg>
    ))}
  </div>
));

/* ─── LocalStorage ─── */
const SAVED_KEY = "popularCities_saved";
const loadSaved = () => {
  try {
    const r = localStorage.getItem(SAVED_KEY);
    return r ? new Set(JSON.parse(r)) : new Set();
  } catch {
    return new Set();
  }
};
const persistSaved = (set) => {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify([...set]));
  } catch {}
};

/* ─── Card sizes ─── */
const SZ = {
  sm: { w: "190px", h: "298px", op: 0.72, tx: "16px", sc: 0.93, z: 1 },
  md: { w: "228px", h: "356px", op: 1, tx: "0px", sc: 1, z: 2 },
  xs: { w: "162px", h: "256px", op: 0.44, tx: "-12px", sc: 0.87, z: 0 },
};
const SZ_MOB = { w: "138px", h: "196px" };

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function PopularCities() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cities = useSelector((s) => s.city.cities);
  const loading = useSelector((s) => s.city.loading);
  const error = useSelector((s) => s.city.error);

  const [activeIdx, setActiveIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [direction, setDirection] = useState("next");
  const [bgCurr, setBgCurr] = useState("");
  const [bgPrev, setBgPrev] = useState("");
  const [showPrev, setShowPrev] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [slideKey, setSlideKey] = useState(0);
  const [saved, setSaved] = useState(loadSaved);
  const [isMd, setIsMd] = useState(
    () => window.matchMedia("(min-width:768px)").matches
  );

  const timerInt = useRef(null);
  const timerExit = useRef(null);
  const timerPause = useRef(null);
  const touchX = useRef(null);
  const touchY = useRef(null);
  const ptrIn = useRef(false);
  const refNext = useRef(null);
  const refPrev = useRef(null);

  /* breakpoint */
  useEffect(() => {
    const mq = window.matchMedia("(min-width:768px)");
    const h = (e) => setIsMd(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  /* bootstrap */
  useEffect(() => {
    injectStyles();
    dispatch(getActiveCities());
    return () => {
      clearInterval(timerInt.current);
      clearTimeout(timerExit.current);
    };
  }, [dispatch]);

  /* clamp index */
  useEffect(() => {
    if (cities?.length && activeIdx >= cities.length) setActiveIdx(0);
  }, [cities, activeIdx]);

  /* preload images */
  useEffect(() => {
    if (!cities?.length) return;
    cities.forEach((c) => {
      if (c.images?.[0]) {
        const i = new Image();
        i.src = c.images[0];
      }
    });
  }, [cities]);

  /* auto-slide */
  useEffect(() => {
    if (!cities?.length || isPaused) return;
    timerInt.current = setInterval(() => {
      clearTimeout(timerExit.current);
      setDirection("next");
      setIsExiting(true);
      timerExit.current = setTimeout(() => {
        setActiveIdx((i) => (i + 1) % cities.length);
        setIsExiting(false);
      }, 420);
    }, 3000);
    return () => clearInterval(timerInt.current);
  }, [cities, isPaused, slideKey]);

  /* bg crossfade */
  useEffect(() => {
    if (!cities?.length) return;
    const nxt = cities[activeIdx]?.images?.[0] || "";
    if (nxt === bgCurr) return;
    setBgPrev(bgCurr);
    setShowPrev(true);
    setBgCurr(nxt);
    setAnimKey((k) => k + 1);
    const t = setTimeout(() => setShowPrev(false), 900);
    return () => clearTimeout(t);
  }, [activeIdx, cities]);

  useEffect(() => {
    if (cities?.length && !bgCurr) setBgCurr(cities[0]?.images?.[0] || "");
  }, [cities]);

  /* keyboard */
  useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowRight") refNext.current?.();
      if (e.key === "ArrowLeft") refPrev.current?.();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  /* scroll resumes */
  useEffect(() => {
    const h = () => {
      if (!ptrIn.current) {
        clearTimeout(timerPause.current);
        setIsPaused(false);
      }
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  /* nav */
  const go = useCallback((getFn, dir) => {
    clearTimeout(timerExit.current);
    setDirection(dir);
    setIsExiting(true);
    timerExit.current = setTimeout(() => {
      setActiveIdx(getFn);
      setIsExiting(false);
    }, 250);
  }, []);

  const goNext = useCallback(() => {
    if (!cities?.length) return;
    setIsPaused(false);
    setSlideKey((k) => k + 1);
    go((i) => (i + 1) % cities.length, "next");
  }, [cities, go]);

  const goPrev = useCallback(() => {
    if (!cities?.length) return;
    setIsPaused(false);
    setSlideKey((k) => k + 1);
    go((i) => (i - 1 + cities.length) % cities.length, "prev");
  }, [cities, go]);

  const goTo = useCallback(
    (idx, curr) => {
      setSlideKey((k) => k + 1);
      go(() => idx, idx > curr ? "next" : "prev");
    },
    [go]
  );

  const toggleSave = useCallback((id, e) => {
    e.stopPropagation();
    setSaved((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      persistSaved(n);
      return n;
    });
  }, []);

  const onTouchStart = useCallback((e) => {
    touchX.current = e.touches[0].clientX;
    touchY.current = e.touches[0].clientY;
  }, []);
  const onTouchEnd = useCallback(
    (e) => {
      if (touchX.current === null) return;
      const dx = touchX.current - e.changedTouches[0].clientX;
      const dy = touchY.current - e.changedTouches[0].clientY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 48)
        dx > 0 ? goNext() : goPrev();
      touchX.current = null;
      touchY.current = null;
    },
    [goNext, goPrev]
  );

  const onEnter = useCallback(() => {
    ptrIn.current = true;
    clearTimeout(timerPause.current);
    setIsPaused(true);
  }, []);
  const onLeave = useCallback(() => {
    ptrIn.current = false;
    clearTimeout(timerPause.current);
    timerPause.current = setTimeout(() => {
      if (!ptrIn.current) setIsPaused(false);
    }, 300);
  }, []);

  refNext.current = goNext;
  refPrev.current = goPrev;

  const total = cities?.length ?? 0;

  const cardSlots = useMemo(() => {
    if (!total) return [];
    const raw = [
      { idx: (activeIdx + 1) % total, cls: "sm" },
      { idx: (activeIdx + 2) % total, cls: "md" },
      { idx: (activeIdx + 3) % total, cls: "xs" },
    ];
    return raw.filter(
      ({ idx }, pos, arr) =>
        idx !== activeIdx && arr.findIndex((s) => s.idx === idx) === pos
    );
  }, [activeIdx, total]);

  const heroClass = useMemo(
    () => (direction === "prev" ? "pc-slide-dn" : "pc-slide-up"),
    [direction]
  );

  /* ── Guards ── */
  if (loading) return <Skeleton />;
  if (error)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--pc-bg)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          fontFamily: "'Outfit',sans-serif",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "#fdecea",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}
        >
          ⚠
        </div>
        <p
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 20,
            fontWeight: 800,
            color: "#b91c1c",
            margin: 0,
          }}
        >
          Something went wrong
        </p>
        <p
          style={{
            fontSize: 13,
            color: "var(--pc-ink3)",
            maxWidth: 280,
            textAlign: "center",
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          {error}
        </p>
      </div>
    );
  if (!cities?.length)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--pc-bg)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          fontFamily: "'Outfit',sans-serif",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "rgba(232,98,42,.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}
        >
          ✦
        </div>
        <p
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 20,
            fontWeight: 800,
            color: "var(--pc-ink)",
            margin: 0,
          }}
        >
          No Destinations Yet
        </p>
        <p
          style={{
            fontSize: 13,
            color: "var(--pc-ink3)",
            maxWidth: 280,
            textAlign: "center",
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          We're curating extraordinary places. Check back soon.
        </p>
      </div>
    );

  const city = cities[activeIdx];

  /* ─── RENDER ─── */
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #ffffff 0%, #fdf8f3 30%, #f6ede4 70%, #efe1d1 100%)",
        fontFamily: "'Outfit',sans-serif",
      }}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Overlay — left clear, right exposed */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          background: `
          linear-gradient(to right,
            rgba(247,243,238,.97) 0%,
            rgba(247,243,238,.9)  28%,
            rgba(247,243,238,.55) 50%,
            rgba(247,243,238,.08) 70%,
            transparent 100%),
          linear-gradient(to top,
            rgba(247,243,238,.85) 0%,
            transparent 40%)
        `,
        }}
      />

      {/* Subtle dot grid texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          pointerEvents: "none",
          opacity: 0.04,
          backgroundImage:
            "radial-gradient(circle, rgba(26,23,20,.7) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ═══ DOT TRACKER ═══ */}
      {/* <div
        style={{
          position: "absolute",
          left: isMd ? 18 : 10,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: isMd ? 8 : 6,
        }}
      >
        {cities.map((_, i) => (
          <button
            key={i}
            className={`pc-dot ${i === activeIdx ? "pc-dot-active" : ""}`}
            style={isMd ? {} : { width: 5, height: 5 }}
            onClick={() => {
              if (i !== activeIdx) goTo(i, activeIdx);
            }}
            aria-label={`City ${i + 1}`}
            aria-current={i === activeIdx ? "true" : undefined}
          />
        ))}
      </div> */}

      {/* ═══ HERO CONTENT ═══ */}
      <div
        style={{
          // border: "1px solid black",
          position: "absolute",
          zIndex: 30,
          left: isMd ? 64 : 20,
          bottom: isMd ? 250 : "clamp(310px, 22vh, 220px)",
          right: isMd ? "auto" : 20,
          maxWidth: isMd ? 520 : "none",
          opacity: isExiting ? 0 : 1,
          transform: isExiting
            ? direction === "prev"
              ? "translateY(16px)"
              : "translateY(-16px)"
            : "none",
          transition:
            "opacity .22s cubic-bezier(.4,0,1,1), transform .22s cubic-bezier(.4,0,1,1)",
          willChange: "opacity,transform",
        }}
      >
        <div key={animKey}>
          {/* Tag */}
          <div
            className="pc-tag-anim"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(232,98,42,.1)",
              color: "var(--pc-accent)",
              border: "1px solid rgba(232,98,42,.22)",
              borderRadius: 100,
              padding: "4px 14px",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            <span
              className="bg-linear-to-r from-[#c67c4e] to-[#774425]"
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "",
                display: "inline-block",
              }}
            />
            Featured destination
          </div>

          {/* City name */}
          <h1
            className={heroClass}
            style={{
              fontFamily: "sans-serif",
              fontWeight: 800,
              fontSize: isMd
                ? "clamp(62px,8.2vw,100px)"
                : "clamp(50px,13vw,84px)",
              lineHeight: 0.88,
              letterSpacing: "-.025em",
              color: "var(--pc-ink)",
              margin: "0 0 18px",
            }}
          >
            {city.name}
          </h1>

          {/* Accent bars */}
          <div
            className="pc-fi1"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                height: 3,
                width: 40,
                background: "var(--pc-accent)",
                borderRadius: 3,
              }}
            />
            <div
              style={{
                height: 3,
                width: 20,
                background: "rgba(232,98,42,.32)",
                borderRadius: 3,
              }}
            />
            <div
              style={{
                height: 3,
                width: 10,
                background: "rgba(232,98,42,.14)",
                borderRadius: 3,
              }}
            />
          </div>

          {/* Description */}
          <p
            className="pc-fi2"
            style={{
              fontSize: 13,
              lineHeight: 1.75,
              color: "var(--pc-ink3)",
              margin: "0 0 30px",
              maxWidth: 420,
            }}
          >
            {city.description ||
              `Discover the breathtaking landscapes, vibrant culture, and world-class experiences that make ${city.name} one of the most sought-after destinations in the world.`}
          </p>

          {/* CTA row */}
          <div
            className="pc-fi3"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <button
              className="pc-btn-primary flex items-center justify-center gap-2 sm:gap-3
             px-1 py-1 text-sm
             sm:px-6 sm:py-3 sm:text-base
             md:px-7 md:py-3.5 md:text-[15px]
             w-[40%] sm:w-auto mb-5"
              onClick={() => navigate(`/city/${city._id}`)}
            >
              <span className="whitespace-nowrap">Explore city</span>

              <span
                className="flex items-center justify-center rounded-full
               w-3 h-3 sm:w-7 sm:h-7 md:w-8 md:h-8"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <svg
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </button>

            <button
              className={`pc-btn-ghost flex items-center justify-center gap-1.5
    px-2 py-1.5 text-[11px]
    sm:gap-2 sm:px-5 sm:py-2.5 sm:text-[14px]
    md:px-6 md:py-3 md:text-[15px]
    w-auto mb-5`}
              onClick={(e) => toggleSave(city._id, e)}
            >
              <svg
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
                viewBox="0 0 24 24"
                fill={saved.has(city._id) ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>

              {/* Hide text on very small screens */}
              <span className="hidden xs:inline sm:inline whitespace-nowrap">
                {saved.has(city._id) ? "Saved" : "Save"}
              </span>
            </button>
          </div>

          {/* Info pills row (desktop) */}
          {isMd && (
            <div
              className="pc-fi4"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                marginTop: 28,
              }}
            >
              {[
                { label: city.weather || "24°C avg" },
                { label: city.flights || "Direct flights" },
                {
                  label: city.rating
                    ? `${city.rating}/5 rating`
                    : "4.8/5 rating",
                },
              ].map(({ label }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 13px",
                    borderRadius: 100,
                    background: "rgba(26,23,20,.055)",
                    fontSize: 11,
                    color: "var(--pc-ink2)",
                    fontWeight: 500,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ PREVIEW CARDS ═══ */}
      <div
  className="pc-noscroll"
  style={{
    position: "absolute",
    zIndex: 10,
    ...(isMd
      ? {
          right: 0,
          top: "50%",
          transform: "translateY(-46%)",
          display: "flex",
          alignItems: "flex-end",
          gap: 16,
          paddingRight: 32,
          overflow: "visible",
        }
      : {
          bottom: 70,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "flex-end",
          gap: 12,
          paddingLeft: 14,
          paddingRight: 14,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
        }),
  }}
>
  {cardSlots.map(({ idx, cls }) => {
    const c = cities[idx];
    const img = c.images?.[0] || ph(228, 356, c.name);
    const isSaved = saved.has(c._id);
    const sz = SZ[cls];

    return (
      <div
        key={cls}
        className="pc-card"
        style={{
          ...(isMd
            ? {
              display: "flex",
              flexDirection: "column",
                width: sz.w,
                height: sz.h,
                opacity: sz.op,
                transform: `translateX(${sz.tx}) scale(${sz.sc})`,
                boxShadow:
                  cls === "md"
                    ? "0 20px 52px rgba(26,23,20,.14)"
                    : "none",
                zIndex: sz.z,
              }
            : {
                width: "120px",     // 👈 smaller mobile card
                height: "180px",
                opacity: 1,
                zIndex: sz.z,
                flexShrink: 0,
                scrollSnapAlign: "center",
              }),
        }}
        onClick={() =>
          idx !== activeIdx
            ? goTo(idx, activeIdx)
            : navigate(`/city/${c._id}`)
        }
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          idx !== activeIdx
            ? goTo(idx, activeIdx)
            : navigate(`/city/${c._id}`);
        }}
        aria-label={`Preview ${c.name}`}
      >
        {/* Card header */}
        <div
          className="pc-card-fade"
          key={c._id}
          style={{
            padding: isMd ? "10px 12px 8px" : "6px 8px 6px",
            background: "rgba(255,255,255,.96)",
            borderBottom: "1px solid rgba(200,192,180,.2)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: isMd ? 10 : 8,   // 👈 smaller text mobile
              fontWeight: 600,
              color: "var(--pc-ink)",
              textTransform: "uppercase",
              letterSpacing: ".07em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginBottom: 3,
            }}
          >
            {c.name}
          </div>

          {/* Smaller stars on mobile */}
          <div style={{ transform: isMd ? "scale(1)" : "scale(0.8)", transformOrigin: "left" }}>
            <Stars rating={c.rating ?? 4} />
          </div>
        </div>

        {/* Image */}
        <div
          onClick={() => navigate(`/city/${c._id}`)}
          style={{ flex: 1, position: "relative", overflow: "hidden" }}
        >
          <img
            key={img}
            src={img}
            alt={c.name}
            className="pc-card-fade"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition:"center"
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "55%",
              background:
                "linear-gradient(to top,rgba(26,23,20,.2),transparent)",
            }}
          />

          {/* Bookmark */}
          <button
            className="pc-bm"
            style={{
              top: isMd ? 10 : 6,
              right: isMd ? 10 : 6,
              width: isMd ? 32 : 24,   // 👈 smaller button mobile
              height: isMd ? 32 : 24,
              background: isSaved
                ? "var(--pc-accent)"
                : "rgba(255,255,255,.9)",
              color: isSaved ? "#fff" : "var(--pc-ink2)",
            }}
            onClick={(e) => toggleSave(c._id, e)}
          >
            <svg
              width={isMd ? 12 : 9}
              height={isMd ? 12 : 9}
              viewBox="0 0 24 24"
              fill={isSaved ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      </div>
    );
  })}
      </div>

      {/* ═══ BOTTOM BAR ═══ */}
      <div
  style={{
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between", // 👈 better spacing mobile
    gap: isMd ? 16 : 8,
    padding: isMd ? "18px 32px" : "10px 14px",
    background: "rgba(247,243,238,.82)",
    backdropFilter: "blur(20px)",
  }}
>
  {/* Prev */}
  <button
    className="pc-btn-circle"
    onClick={goPrev}
    aria-label="Previous city"
    style={{
      width: isMd ? 44 : 34,
      height: isMd ? 44 : 34,
    }}
  >
    <svg
      width={isMd ? 15 : 12}
      height={isMd ? 15 : 12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  </button>

  {/* Progress + counter */}
  <div
    style={{
      flex: 1,
      maxWidth: isMd ? 200 : 140, // 👈 smaller on mobile
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: isMd ? 7 : 4,
    }}
  >
    {/* Progress */}
    <div
      style={{
        width: "100%",
        height: isMd ? 2 : 1.5,
        background: "var(--pc-sand)",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {isPaused ? (
        <div
          style={{
            width: "65%",
            height: "100%",
            background: "var(--pc-stone)",
          }}
        />
      ) : (
        <div
          key={`${activeIdx}-${animKey}`}
          className="pc-progress-fill"
        />
      )}
    </div>

    {/* Counter */}
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span
        style={{
          fontFamily: "'Syne',sans-serif",
          fontWeight: 700,
          fontSize: isMd ? 15 : 12, // 👈 responsive text
          color: "var(--pc-ink)",
        }}
      >
        {String(activeIdx + 1).padStart(2, "0")}
      </span>

      <span
        style={{
          fontSize: isMd ? 11 : 9,
          color: "var(--pc-stone)",
        }}
      >
        / {String(total).padStart(2, "0")}
      </span>

      {isPaused && isMd && ( // 👈 hide on mobile (clean UI)
        <span
          style={{
            fontSize: 10,
            color: "var(--pc-stone)",
            letterSpacing: ".08em",
            textTransform: "uppercase",
            marginLeft: 4,
          }}
        >
          paused
        </span>
      )}
    </div>
  </div>

  {/* Next */}
  <button
    className="pc-btn-circle-accent"
    onClick={goNext}
    aria-label="Next city"
    style={{
      width: isMd ? 44 : 34,
      height: isMd ? 44 : 34,
      background: "linear-gradient(to right, #c67c4e, #b86c3d)",
    }}
  >
    <svg
      width={isMd ? 15 : 12}
      height={isMd ? 15 : 12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  </button>
     </div>
    </div>
  );
}
