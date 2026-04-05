import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getActiveCities } from "../../features/user/citySlice";

/* ─────────────────────────────────────────────────────────────
   Placeholder image helper — inline SVG, zero network request
───────────────────────────────────────────────────────────── */
const ph = (w, h, t) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#13131a"/><text x="50%" y="50%" fill="#3d6ef5" text-anchor="middle" dy=".3em" font-size="14" font-family="sans-serif">${t}</text></svg>`
  )}`;

/* ─────────────────────────────────────────────────────────────
   Style injection — fonts + keyframe animations
   Guards prevent duplicate injection on hot-reload
───────────────────────────────────────────────────────────── */
const injectMinimalStyles = () => {
  if (!document.getElementById("fxc-font")) {
    const link = document.createElement("link");
    link.id = "fxc-font";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Inter:wght@300;400;500&display=swap";
    document.head.appendChild(link);
  }

  if (document.getElementById("fxc-styles")) return;
  const s = document.createElement("style");
  s.id = "fxc-styles";
  s.textContent = `
    @keyframes fxcSlideUp {
      from { opacity: 0; transform: translateY(32px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fxcSlideDown {
      from { opacity: 0; transform: translateY(-24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fxcFadeIn {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fxcShimmer {
      0%   { background-position: 100% 50%; }
      100% { background-position:   0% 50%; }
    }
    @keyframes fxcProgress {
      from { transform: scaleX(0); }
      to   { transform: scaleX(1); }
    }
    @keyframes fxcFadeCard {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    .anim-slide-up   { animation: fxcSlideUp   0.55s cubic-bezier(0.22,1,0.36,1) forwards; }
    .anim-slide-down { animation: fxcSlideDown 0.55s cubic-bezier(0.22,1,0.36,1) forwards; }
    .anim-fade-in-1  { animation: fxcFadeIn 0.55s ease 0.10s both; }
    .anim-fade-in-2  { animation: fxcFadeIn 0.55s ease 0.18s both; }
    .anim-fade-in-3  { animation: fxcFadeIn 0.55s ease 0.28s both; }
    .anim-shimmer {
      animation: fxcShimmer 1.9s ease-in-out infinite;
      background: linear-gradient(
        90deg,
        rgba(255,255,255,0.04) 0%,
        rgba(255,255,255,0.10) 50%,
        rgba(255,255,255,0.04) 100%
      );
      background-size: 400% 100%;
    }
    .anim-progress {
      animation: fxcProgress 3s linear forwards;
      transform-origin: left center;
    }
    .anim-fade-card { animation: fxcFadeCard 0.42s ease forwards; }
    .no-scrollbar   { scrollbar-width: none; }
    .no-scrollbar::-webkit-scrollbar { display: none; }

    /* FIX: Respect OS reduced-motion preference */
    @media (prefers-reduced-motion: reduce) {
      .anim-slide-up, .anim-slide-down,
      .anim-fade-in-1, .anim-fade-in-2, .anim-fade-in-3,
      .anim-shimmer, .anim-progress, .anim-fade-card {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
      }
    }
  `;
  document.head.appendChild(s);
};

/* Run once at module load so Skeleton gets shimmer on first paint */
injectMinimalStyles();

/* ─────────────────────────────────────────────────────────────
   Skeleton
───────────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="w-full h-screen bg-[#0a0a10] relative overflow-hidden">
      <div className="anim-shimmer absolute inset-0" />
      {/* Desktop shimmer blocks */}
      <div className="max-md:hidden">
        <div className="anim-shimmer absolute left-[72px] bottom-[198px] w-[340px] h-[95px] rounded-md" />
        <div className="anim-shimmer absolute left-[72px] bottom-[172px] w-[200px] h-[10px] rounded-sm" />
        <div className="anim-shimmer absolute left-[72px] bottom-[156px] w-[160px] h-[10px] rounded-sm" />
        <div className="anim-shimmer absolute left-[72px] bottom-[104px] w-[148px] h-[48px] rounded-full" />
        <div className="anim-shimmer absolute right-[264px] top-1/2 -mt-[145px] w-[185px] h-[290px] rounded-[18px] opacity-50" />
        <div className="anim-shimmer absolute right-8 top-1/2 -mt-[172px] w-[220px] h-[345px] rounded-[18px]" />
      </div>
      {/* Mobile shimmer blocks */}
      <div className="md:hidden">
        <div className="anim-shimmer absolute left-9 bottom-[130px] w-[240px] h-[80px] rounded-md" />
        <div className="anim-shimmer absolute left-9 bottom-[108px] w-[160px] h-[8px] rounded-sm" />
        <div className="anim-shimmer absolute left-9 bottom-[72px] w-[110px] h-[38px] rounded-full" />
        <div className="anim-shimmer absolute bottom-[86px] left-4 w-[148px] h-[200px] rounded-[18px]" />
        <div className="anim-shimmer absolute bottom-[86px] left-[164px] w-[148px] h-[200px] rounded-[18px] opacity-60" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Star rating helper
───────────────────────────────────────────────────────────── */
const Stars = React.memo(({ rating = 4 }) => (
  <div className="flex gap-[2px]">
    {[1, 2, 3, 4, 5].map((s) => (
      <span
        key={s}
        className={`text-[10px] ${s > rating ? "text-[#ddd]" : "text-[#f5a623]"}`}
      >
        ★
      </span>
    ))}
  </div>
));

/* ─────────────────────────────────────────────────────────────
   Card size / transform variants
───────────────────────────────────────────────────────────── */
const cardVariantClasses = {
  sm: [
    "w-[185px] h-[290px]",
    "translate-x-6 scale-[0.94] opacity-[0.68] z-[1]",
    "max-md:!w-[148px] max-md:!h-[200px]",
    "max-md:!translate-x-0 max-md:!scale-100 max-md:!opacity-100",
  ].join(" "),
  md: [
    "w-[220px] h-[345px]",
    "scale-100 opacity-100 z-[2]",
    "shadow-[0_24px_60px_rgba(0,0,0,0.55)]",
    "max-md:!w-[148px] max-md:!h-[200px] max-md:!shadow-none",
  ].join(" "),
  xs: [
    "w-[165px] h-[260px]",
    "-translate-x-5 scale-[0.88] opacity-[0.42] z-0",
    "max-md:!w-[148px] max-md:!h-[200px]",
    "max-md:!translate-x-0 max-md:!scale-100 max-md:!opacity-100",
  ].join(" "),
};

const cardHoverClasses = [
  "hover:translate-x-0",
  "hover:-translate-y-[10px]",
  "hover:scale-[1.04]",
  "hover:opacity-100",
  "hover:z-20",
  "hover:shadow-[0_30px_70px_rgba(0,0,0,0.65)]",
].join(" ");

/* ─────────────────────────────────────────────────────────────
   localStorage bookmark helpers
───────────────────────────────────────────────────────────── */
const SAVED_KEY = "popularCities_saved";
const loadSaved = () => {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};
const persistSaved = (set) => {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify([...set]));
  } catch { }
};

/* ─────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────── */
function PopularCities() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  /* Granular selectors — each only re-renders when its own value changes */
  const cities  = useSelector((s) => s.city.cities);
  const loading = useSelector((s) => s.city.loading);
  const error   = useSelector((s) => s.city.error);

  /* ── UI state ── */
  const [activeCityIndex, setActiveCityIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [direction, setDirection] = useState("next"); // "next" | "prev"
  const [bgCurr, setBgCurr] = useState("");
  const [bgPrev, setBgPrev] = useState("");
  const [showPrev, setShowPrev] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [slideKey, setSlideKey] = useState(0); // bumped on manual nav to restart interval
  const [savedCities, setSavedCities] = useState(loadSaved);

  const intervalRef  = useRef(null);
  const exitTimerRef  = useRef(null);
  const touchStartX   = useRef(null);
  const touchStartY   = useRef(null);  // track vertical scroll vs horizontal swipe
  const pauseTimerRef = useRef(null);
  const isPointerOver = useRef(false); // true only when pointer is physically inside
  /* Stable refs so the arrow-key listener never needs re-registration */
  const goNextRef = useRef(null);
  const goPrevRef = useRef(null);

  /* ── On mount ── */
  useEffect(() => {
    injectMinimalStyles();
    dispatch(getActiveCities());

    /* FIX: Clean up injected styles on unmount */
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(exitTimerRef.current);
    };
  }, [dispatch]);

  /* FIX: Clamp index when cities list shrinks */
  useEffect(() => {
    if (cities?.length && activeCityIndex >= cities.length) {
      setActiveCityIndex(0);
    }
  }, [cities, activeCityIndex]);

  /* ── Bulk-preload ALL city images once the list loads ──
     Runs once per city list update, not once per slide.       */
  useEffect(() => {
    if (!cities?.length) return;
    cities.forEach((city) => {
      const src = city.images?.[0];
      if (src) { const img = new window.Image(); img.src = src; }
    });
  }, [cities]);

  /* ── Auto-slide every 3 s ── */
  useEffect(() => {
    if (!cities?.length || isPaused) return;
    intervalRef.current = setInterval(() => {
      clearTimeout(exitTimerRef.current);
      setDirection("next");
      setIsExiting(true);
      exitTimerRef.current = setTimeout(() => {
        setActiveCityIndex((i) => (i + 1) % cities.length);
        setIsExiting(false);
      }, 260);
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, [cities, isPaused, slideKey]); // slideKey restarts interval after manual nav

  /* ── Cross-fade background ── */
  useEffect(() => {
    if (!cities?.length) return;
    const next = cities[activeCityIndex]?.images?.[0] || "";
    if (next === bgCurr) return;
    setBgPrev(bgCurr);
    setShowPrev(true);
    setBgCurr(next);
    setAnimKey((k) => k + 1);
    const t = setTimeout(() => setShowPrev(false), 900);
    return () => clearTimeout(t);
  }, [activeCityIndex, cities]); // bgCurr intentionally omitted

  /* ── Init first background ── */
  useEffect(() => {
    if (cities?.length && !bgCurr) setBgCurr(cities[0]?.images?.[0] || "");
  }, [cities]);

  /* ── Arrow-key navigation — stable listener via refs ──
     Never removes/re-adds the listener, zero allocation overhead.  */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight") goNextRef.current?.();
      if (e.key === "ArrowLeft")  goPrevRef.current?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []); // stable — deps are refs, not reactive values

  /* ── Shared transition helper ── */
  const transitionTo = useCallback((getNextIndex, dir = "next") => {
    clearTimeout(exitTimerRef.current);
    // NOTE: do NOT clearInterval here — goNext/goPrev/goToIndex bump slideKey to restart it
    setDirection(dir);
    setIsExiting(true);
    exitTimerRef.current = setTimeout(() => {
      setActiveCityIndex(getNextIndex);
      setIsExiting(false);
    }, 260);
  }, []);

  const goNext = useCallback(() => {
    if (!cities?.length) return;
    setIsPaused(false);
    setSlideKey((k) => k + 1); // restarts the 3s interval from zero
    transitionTo((i) => (i + 1) % cities.length, "next");
  }, [cities, transitionTo]);

  const goPrev = useCallback(() => {
    if (!cities?.length) return;
    setIsPaused(false);
    setSlideKey((k) => k + 1);
    transitionTo((i) => (i - 1 + cities.length) % cities.length, "prev");
  }, [cities, transitionTo]);

  const goToIndex = useCallback((idx, current) => {
    const dir = idx > current ? "next" : "prev";
    setSlideKey((k) => k + 1);
    transitionTo(() => idx, dir);
  }, [transitionTo]);

  /* ── Bookmark toggle — persisted to localStorage ── */
  const toggleSave = useCallback((cityId, e) => {
    e.stopPropagation();
    setSavedCities((prev) => {
      const next = new Set(prev);
      next.has(cityId) ? next.delete(cityId) : next.add(cityId);
      persistSaved(next);
      return next;
    });
  }, []);

  /* ── Touch / swipe handlers ──
     Distinguish horizontal swipe (navigate) from vertical scroll (ignore) ── */
  const onTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    // Only swipe if movement is more horizontal than vertical
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx > 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }, [goNext, goPrev]);

  /* ── Pause / resume ──
     FIX: Use pointerenter/pointerleave (not mouse) so scroll doesn't trigger pause.
     Also add a scroll listener that force-resumes if pointer isn't inside. ── */
  const onPointerEnter = useCallback(() => {
    isPointerOver.current = true;
    clearTimeout(pauseTimerRef.current);
    setIsPaused(true);
  }, []);

  const onPointerLeave = useCallback(() => {
    isPointerOver.current = false;
    clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      if (!isPointerOver.current) setIsPaused(false);
    }, 300);
  }, []);

  /* FIX: Scroll always resumes the slider (user is scrolling, not hovering) */
  useEffect(() => {
    const onScroll = () => {
      if (!isPointerOver.current) {
        clearTimeout(pauseTimerRef.current);
        setIsPaused(false);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Keep refs current so arrow-key listener always calls latest callbacks */
  goNextRef.current = goNext;
  goPrevRef.current = goPrev;

  /* ─────────────────────────────────────────────────────────────
     ALL hooks must come BEFORE any early returns (Rules of Hooks)
  ───────────────────────────────────────────────────────────── */
  const total = cities?.length ?? 0;

  /* Memoised card slots — null-safe, returns [] when cities not loaded */
  const cardSlots = useMemo(() => {
    if (!total) return [];
    const rawSlots = [
      { idx: (activeCityIndex + 1) % total, cls: "sm" },
      { idx: (activeCityIndex + 2) % total, cls: "md" },
      { idx: (activeCityIndex + 3) % total, cls: "xs" },
    ];
    return rawSlots.filter(
      ({ idx }, pos, arr) =>
        idx !== activeCityIndex &&
        arr.findIndex((s) => s.idx === idx) === pos
    );
  }, [activeCityIndex, total]);

  /* Memoised hero animation class */
  const heroEntryClass = useMemo(
    () => (direction === "prev" ? "anim-slide-down" : "anim-slide-up"),
    [direction]
  );

  /* ── Render guards — must come AFTER all hooks ── */
  if (loading) return <Skeleton />;

  if (error)
    return (
      <div className="w-full h-screen bg-[#0a0a10] flex flex-col items-center justify-center gap-[18px] font-['Inter',sans-serif]">
        <div className="text-[48px] opacity-[0.35]">⚠</div>
        <p className="font-['Barlow_Condensed',sans-serif] text-[28px] font-extrabold text-[#e07070] opacity-[0.55] uppercase tracking-[0.05em] m-0">
          Something went wrong
        </p>
        <p className="text-[13px] text-white/35 max-w-[280px] text-center leading-[1.7] m-0">{error}</p>
      </div>
    );

  if (!cities?.length)
    return (
      <div className="w-full h-screen bg-[#0a0a10] flex flex-col items-center justify-center gap-[18px] font-['Inter',sans-serif]">
        <div className="text-[48px] opacity-[0.35]">✦</div>
        <p className="font-['Barlow_Condensed',sans-serif] text-[28px] font-extrabold text-white opacity-[0.55] uppercase tracking-[0.05em] m-0">
          No Destinations Yet
        </p>
        <p className="text-[13px] text-white/35 max-w-[280px] text-center leading-[1.7] m-0">
          We're curating extraordinary places. Check back soon.
        </p>
      </div>
    );

  /* ── Derived values (safe — only reached after guards pass) ── */
  const activeCity = cities[activeCityIndex];

  return (
    <div
      className="relative w-full h-screen overflow-hidden font-['Inter',sans-serif] bg-[#0a0a10]"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Background images (cross-fade) ──
          Uses <img> tags for GPU-accelerated opacity transitions. ── */}
      {showPrev && bgPrev && (
        <img
          role="presentation"
          aria-hidden="true"
          src={bgPrev}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0, transition: "opacity 0.85s cubic-bezier(0.4,0,0.2,1)", willChange: "opacity", zIndex: 0 }}
        />
      )}
      <img
        role="img"
        aria-label={`${activeCity.name} background`}
        src={bgCurr || ph(1600, 900, activeCity.name)}
        alt={`${activeCity.name} cityscape`}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 1, transition: "opacity 0.85s cubic-bezier(0.4,0,0.2,1)", willChange: "opacity", zIndex: 0 }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 z-[2]"
        style={{
          background: `
            linear-gradient(to right,
              rgba(0,0,0,0.82) 0%,
              rgba(0,0,0,0.55) 38%,
              rgba(0,0,0,0.15) 60%,
              transparent 100%),
            linear-gradient(to top,
              rgba(0,0,0,0.5) 0%,
              transparent 40%)
          `,
        }}
      />

      {/* ── Top Navigation ── */}
      <nav className="absolute top-0 left-0 right-0 z-[40] flex items-center justify-between py-[30px] px-12 max-md:py-5 max-md:px-[22px]">
        <div className="flex items-center gap-[10px] text-white">
          <div className="w-[34px] h-[34px] bg-[#3d6ef5] rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white" />
              <circle cx="12" cy="9" r="2.5" fill="#3d6ef5" />
            </svg>
          </div>
          <span className="font-['Barlow_Condensed',sans-serif] text-[20px] font-extrabold tracking-[0.04em]">
            Popular Cities
          </span>
          {/* FIX: City count badge */}
          <span className="ml-1 px-[8px] py-[2px] rounded-full bg-white/10 text-white/60 text-[11px] font-medium tracking-wide">
            {total} destinations
          </span>
        </div>

        <div className="flex items-center gap-[14px]">
          <div className="w-9 h-9 rounded-full bg-white/[0.18] border-2 border-white/[0.18] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span className="text-[13px] text-white/70 max-sm:hidden">Explore the World</span>
        </div>
      </nav>

      {/* ── Left vertical dot tracker ── */}
      <div className="absolute left-7 top-1/2 -translate-y-1/2 z-[40] flex flex-col items-center max-md:left-3">
        {cities.map((_, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div className="w-px h-[30px] bg-white/[0.18] shrink-0" />}
            <button
              className={[
                "w-[7px] h-[7px] rounded-full border-0 p-0 cursor-pointer",
                "transition-all duration-300 relative z-[1] shrink-0",
                i === activeCityIndex ? "bg-white scale-[1.4]" : "bg-white/40",
              ].join(" ")}
              onClick={() => { if (i !== activeCityIndex) goToIndex(i, activeCityIndex); }}
              aria-label={`Go to city ${i + 1}`}
              aria-current={i === activeCityIndex ? "true" : undefined}
            />
          </React.Fragment>
        ))}
      </div>

      {/* ── Left hero content ── */}
      <div
        className="absolute left-[72px] bottom-[130px] z-[30] max-w-[520px] max-md:left-9 max-md:bottom-[110px] max-md:max-w-[calc(100vw-72px)]"
        style={{
          opacity: isExiting ? 0 : 1,
          transform: isExiting
            ? (direction === "prev" ? "translateY(18px)" : "translateY(-18px)")
            : "translateY(0)",
          transition: "opacity 0.25s cubic-bezier(0.4,0,1,1), transform 0.25s cubic-bezier(0.4,0,1,1)",
          willChange: "opacity, transform",
        }}
      >
        <div key={animKey}>
          <h2
            className={`${heroEntryClass} font-['Barlow_Condensed',sans-serif] font-black leading-[0.88] text-white tracking-[-0.01em] uppercase m-0 mb-[6px]`}
            style={{ fontSize: "clamp(72px, 11vw, 148px)" }}
          >
            {activeCity.name}
          </h2>

          {/* Dashed divider */}
          <div className="anim-fade-in-1 flex items-center gap-[5px] mb-[18px]">
            {[...Array(8)].map((_, i) => (
              <span
                key={i}
                className={[
                  "inline-block h-[2px] rounded-[2px]",
                  i === 0 ? "w-[28px] bg-white/70" : "w-[14px] bg-white/40",
                ].join(" ")}
              />
            ))}
          </div>

          <p className="anim-fade-in-2 text-[13px] font-light leading-[1.75] text-white/70 mt-0 mb-8">
            {activeCity.description ||
              `Discover the breathtaking landscapes, vibrant culture, and world-class
               experiences that make ${activeCity.name} one of the most sought-after
               destinations in the world.`}
          </p>

          <button
            className={[
              "anim-fade-in-3 group",
              "inline-flex items-center gap-[14px]",
              "py-[14px] px-[30px]",
              "bg-[#3d6ef5] border-0 rounded-full",
              "font-['Inter',sans-serif] text-sm font-medium text-white",
              "cursor-pointer",
              "transition-[background,transform,box-shadow] duration-[250ms] ease-in-out",
              "hover:bg-[#2a55d4] hover:-translate-y-[2px] hover:scale-[1.04]",
              "hover:shadow-[0_14px_36px_rgba(61,110,245,0.45)]",
              "active:scale-[0.98]",
            ].join(" ")}
            onClick={() => navigate(`/city/${activeCity._id}`)}
          >
            Explore
            <span className="flex items-center justify-center w-7 h-7 bg-white/[0.22] rounded-full transition-transform duration-300 group-hover:translate-x-[3px]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        </div>
      </div>

      {/* ── Preview cards (right side) ── */}
      <div
        className={[
          "absolute right-0 top-1/2 -translate-y-[46%] z-10",
          "flex items-end gap-4 pr-8",
          "max-md:top-auto max-md:bottom-0 max-md:translate-y-0",
          "max-md:right-0 max-md:left-0",
          "max-md:px-4 max-md:pb-[86px]",
          "max-md:gap-3 max-md:overflow-x-auto max-md:items-end",
          "no-scrollbar",
        ].join(" ")}
      >
        {cardSlots.map(({ idx, cls }) => {
          const city = cities[idx];
          const img = city.images?.[0] || ph(220, 345, city.name);
          const rating = city.rating ?? 4;
          const isSaved = savedCities.has(city._id);

          return (
            <div
              key={cls}
              className={[
                "group shrink-0 cursor-pointer rounded-[18px] overflow-hidden relative flex flex-col",
                "transition-[transform,box-shadow,opacity] duration-[450ms] ease-[cubic-bezier(0.34,1.26,0.64,1)]",
                cardVariantClasses[cls],
                cardHoverClasses,
              ].join(" ")}
              onClick={() => {
                idx !== activeCityIndex
                  ? goToIndex(idx, activeCityIndex)
                  : navigate(`/city/${city._id}`);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                idx !== activeCityIndex
                  ? goToIndex(idx, activeCityIndex)
                  : navigate(`/city/${city._id}`);
              }}
              aria-label={`Preview ${city.name}`}
            >
              {/* Card header — fades in with new city */}
              <div
                key={city._id}
                className="px-[14px] pt-3 pb-[10px] bg-white/95 backdrop-blur-[10px] shrink-0 anim-fade-card"
              >
                <div className="text-xs font-medium text-[#111] mb-[5px] whitespace-nowrap overflow-hidden text-ellipsis">
                  {city.name}
                </div>
                <Stars rating={rating} />
              </div>

              {/* City image */}
              <div className="flex-1 relative overflow-hidden rounded-b-[18px]">
                <img
                  key={img}
                  src={img}
                  alt={city.name}
                  className="w-full h-full object-cover block anim-fade-card transition-transform duration-[550ms] group-hover:scale-[1.08]"
                />
                {/* Bookmark — persisted to localStorage */}
                <button
                  className={[
                    "absolute top-3 right-3",
                    "w-[34px] h-[34px] rounded-full",
                    "border-0 flex items-center justify-center",
                    "cursor-pointer z-[5]",
                    "transition-[background,transform] duration-200",
                    isSaved
                      ? "bg-[#3d6ef5] hover:bg-[#2a55d4]"
                      : "bg-white/[0.92] hover:bg-white hover:scale-[1.12]",
                  ].join(" ")}
                  onClick={(e) => toggleSave(city._id, e)}
                  aria-label={isSaved ? `Unsave ${city.name}` : `Save ${city.name}`}
                >
                  <svg
                    width="14" height="14" viewBox="0 0 24 24"
                    fill={isSaved ? "white" : "none"}
                    stroke={isSaved ? "white" : "#333"}
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Auto-slide progress bar + pause indicator ── */}
      <div className="absolute bottom-[88px] left-1/2 -translate-x-1/2 z-[40] flex flex-col items-center gap-[6px]">
        <div className="w-[120px] h-[2px] rounded-full bg-white/[0.15] overflow-hidden">
          {isPaused ? (
            /* Frozen bar while paused */
            <div className="h-full w-full bg-white/30 rounded-full" />
          ) : (
            <div
              key={`${activeCityIndex}-${animKey}`}
              className="anim-progress h-full bg-white/60 rounded-full"
            />
          )}
        </div>
        {/* FIX: Pause indicator text */}
        {isPaused && (
          <span className="text-[10px] text-white/40 tracking-widest uppercase">paused</span>
        )}
      </div>

      {/* ── Bottom arrow navigation ── */}
      <div className="absolute bottom-0 left-0 right-0 z-[40] flex items-center justify-center gap-6 py-7 px-12">
        <button
          className={[
            "w-11 h-11 rounded-full",
            "border border-white/[0.18] bg-white/10 backdrop-blur-[8px]",
            "flex items-center justify-center cursor-pointer text-white",
            "transition-[background,border-color,transform] duration-200",
            "hover:bg-white/[0.22] hover:border-white/40 hover:scale-[1.08]",
          ].join(" ")}
          onClick={goPrev}
          aria-label="Previous city"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>

        <span className="font-['Barlow_Condensed',sans-serif] text-base font-bold tracking-[0.08em] text-white min-w-[52px] text-center">
          {String(activeCityIndex + 1).padStart(2, "0")}
          <span className="text-white/40"> / {String(total).padStart(2, "0")}</span>
        </span>

        <button
          className={[
            "w-11 h-11 rounded-full",
            "border border-white/[0.18] bg-white/10 backdrop-blur-[8px]",
            "flex items-center justify-center cursor-pointer text-white",
            "transition-[background,border-color,transform] duration-200",
            "hover:bg-white/[0.22] hover:border-white/40 hover:scale-[1.08]",
          ].join(" ")}
          onClick={goNext}
          aria-label="Next city"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default PopularCities;
