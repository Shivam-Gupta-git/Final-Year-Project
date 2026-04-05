import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCityById } from "../../features/user/citySlice";

/* ─────────────────────────────────────────────────────────────
   Inject styles once at module load (not inside useEffect)
───────────────────────────────────────────────────────────── */
(() => {
  if (document.getElementById("city-page-styles")) return;
  const s = document.createElement("style");
  s.id = "city-page-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Inter:wght@300;400;500;600&display=swap');

    .cp-root { font-family: 'Inter', sans-serif; }

    @keyframes cpFadeUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes cpFadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes cpShimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @keyframes cpScrollDown {
      0%   { transform: translateY(0);   opacity: 1; }
      100% { transform: translateY(8px); opacity: 0; }
    }
    @keyframes cpImgReveal {
      from { opacity: 0; transform: scale(1.04); }
      to   { opacity: 1; transform: scale(1); }
    }

    .cp-fade-up    { animation: cpFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both; }
    .cp-fade-up-1  { animation: cpFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.10s both; }
    .cp-fade-up-2  { animation: cpFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.20s both; }
    .cp-fade-up-3  { animation: cpFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.30s both; }
    .cp-fade-in    { animation: cpFadeIn 0.9s ease both; }

    /* Scroll-triggered reveal — applied via JS IntersectionObserver */
    .cp-reveal      { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1); }
    .cp-reveal.visible { opacity: 1; transform: none; }

    .cp-shimmer {
      background: linear-gradient(90deg,
        rgba(255,255,255,0.05) 0%,
        rgba(255,255,255,0.13) 50%,
        rgba(255,255,255,0.05) 100%);
      background-size: 200% 100%;
      animation: cpShimmer 1.8s ease-in-out infinite;
    }

    .cp-glass {
      background: rgba(255,255,255,0.07);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.12);
    }

    /* Lazy image: blur-up reveal */
    .cp-img-wrap { position: relative; overflow: hidden; }
    .cp-img-thumb {
      position: absolute; inset: 0;
      width: 100%; height: 100%; object-fit: cover;
      filter: blur(12px);
      transform: scale(1.06);
      transition: opacity 0.5s ease;
    }
    .cp-img-full {
      position: absolute; inset: 0;
      width: 100%; height: 100%; object-fit: cover;
      opacity: 0;
      animation: cpImgReveal 0.6s ease forwards;
    }
    .cp-img-full.loaded { animation: cpImgReveal 0.6s ease forwards; }

    .cp-card-hover {
      transition: transform 0.4s cubic-bezier(0.34,1.26,0.64,1),
                  box-shadow 0.4s ease;
    }
    .cp-card-hover:hover {
      transform: translateY(-8px) scale(1.01);
      box-shadow: 0 28px 56px rgba(0,0,0,0.22);
    }

    .cp-action-card {
      transition: transform 0.4s cubic-bezier(0.34,1.26,0.64,1), box-shadow 0.4s ease;
    }
    .cp-action-card:hover {
      transform: translateY(-10px) scale(1.02);
      box-shadow: 0 32px 64px rgba(0,0,0,0.24);
    }

    .cp-btn {
      transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.2s ease;
    }
    .cp-btn:hover  { transform: translateY(-2px) scale(1.03); }
    .cp-btn:active { transform: scale(0.97); }

    .cp-img-overlay {
      background: linear-gradient(
        to bottom,
        rgba(0,0,0,0.08) 0%,
        rgba(0,0,0,0.28) 40%,
        rgba(0,0,0,0.78) 75%,
        rgba(0,0,0,0.94) 100%
      );
    }

    .cp-section-divider {
      width: 44px; height: 3px; border-radius: 99px;
      background: linear-gradient(90deg,#6366f1,#8b5cf6);
      margin: 0 auto 24px;
    }

    .cp-tag {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 14px; border-radius: 999px; font-size: 11px;
      font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase;
    }

    .no-scrollbar { scrollbar-width: none; }
    .no-scrollbar::-webkit-scrollbar { display: none; }

    @media (prefers-reduced-motion: reduce) {
      .cp-fade-up, .cp-fade-up-1, .cp-fade-up-2, .cp-fade-up-3,
      .cp-fade-in, .cp-reveal, .cp-reveal.visible,
      .cp-shimmer, .cp-img-full { animation: none !important; opacity: 1 !important; transform: none !important; }
    }
  `;
  document.head.appendChild(s);
})();

/* ─────────────────────────────────────────────────────────────
   useReveal — Intersection Observer hook for scroll animations
───────────────────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─────────────────────────────────────────────────────────────
   LazyImage — blur-up progressive loading
   thumb: tiny placeholder  src: full-resolution
───────────────────────────────────────────────────────────── */
const LazyImage = React.memo(({ src, alt, className = "", eager = false }) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    setLoaded(false); // reset on src change
    const img = new window.Image();
    img.src = src;
    if (img.complete) { setLoaded(true); return; }
    img.onload = () => setLoaded(true);
  }, [src]);

  return (
    <div className={`cp-img-wrap ${className}`}>
      {/* Blurred placeholder — always visible until full loads */}
      <div
        className="cp-shimmer absolute inset-0"
        aria-hidden="true"
        style={{ opacity: loaded ? 0 : 1, transition: "opacity 0.4s ease" }}
      />
      {/* Full image — fades in on load */}
      {src && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="cp-img-full"
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.5s ease, transform 0.6s ease" }}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────
   HeroCrossFade — two-layer background for smooth transitions
───────────────────────────────────────────────────────────── */
const HeroCrossFade = React.memo(({ src }) => {
  const [curr, setCurr] = useState(src);
  const [prev, setPrev] = useState("");
  const [showPrev, setShowPrev] = useState(false);

  useEffect(() => {
    if (src === curr) return;
    setPrev(curr);
    setShowPrev(true);
    setCurr(src);
    const t = setTimeout(() => setShowPrev(false), 900);
    return () => clearTimeout(t);
  }, [src]); // curr intentionally omitted

  return (
    <>
      {showPrev && prev && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${prev})`, opacity: 0, transition: "opacity 0.9s ease" }}
        />
      )}
      <div
        className="absolute inset-0 bg-cover bg-center cp-fade-in"
        style={{ backgroundImage: `url(${curr})`, transition: "opacity 0.9s ease" }}
      />
    </>
  );
});

/* ─────────────────────────────────────────────────────────────
   Skeleton loader
───────────────────────────────────────────────────────────── */
const CityPageSkeleton = React.memo(() => (
  <div className="cp-root min-h-screen bg-[#0d0d18]">
    <div className="relative h-[92vh] overflow-hidden">
      <div className="cp-shimmer absolute inset-0" />
      <div className="absolute bottom-16 left-8 lg:left-16">
        <div className="cp-shimmer w-28 h-5 rounded-full mb-5" />
        <div className="cp-shimmer w-72 h-14 rounded-xl mb-4" />
        <div className="cp-shimmer w-44 h-4 rounded mb-3" />
        <div className="cp-shimmer w-40 h-3 rounded mb-8" />
        <div className="flex gap-3">
          <div className="cp-shimmer w-36 h-11 rounded-full" />
          <div className="cp-shimmer w-28 h-11 rounded-full" />
        </div>
      </div>
    </div>
    <div className="max-w-6xl mx-auto px-6 pt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="cp-shimmer h-40 rounded-2xl" />
      ))}
    </div>
  </div>
));

/* ─────────────────────────────────────────────────────────────
   InfoCard
───────────────────────────────────────────────────────────── */
const InfoCard = React.memo(({ gradient, icon, label, value }) => {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      className="cp-reveal cp-card-hover rounded-2xl p-7 relative overflow-hidden cursor-default"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
    >
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl pointer-events-none"
        style={{ background: gradient }}
      />
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-xl shrink-0"
        style={{ background: gradient }}
      >
        {icon}
      </div>
      <p className="text-[11px] font-semibold tracking-widest uppercase text-white/38 mb-1">{label}</p>
      <p className="text-white font-medium text-sm leading-snug">{value}</p>
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────
   ActionTile
───────────────────────────────────────────────────────────── */
const ActionTile = React.memo(({ emoji, title, desc, color, onClick }) => {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="cp-reveal cp-action-card group relative rounded-3xl overflow-hidden cursor-pointer"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
    >
      <div className="h-1 w-full" style={{ background: color }} />
      <div className="p-8 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5"
          style={{ background: `${color}1a`, border: `1px solid ${color}40` }}
        >
          {emoji}
        </div>
        <h3 className="text-white font-bold text-xl mb-2">{title}</h3>
        <p className="text-white/45 text-sm font-medium mb-5">{desc}</p>
        <div
          className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-4 py-2.5 rounded-full cp-btn"
          style={{ background: `${color}1a`, color, border: `1px solid ${color}40` }}
        >
          Explore →
        </div>
      </div>
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────── */
function CityDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* Granular selectors — each re-renders only when its own value changes */
  const city    = useSelector((s) => s.city.city);
  const loading = useSelector((s) => s.city.loading);
  const error   = useSelector((s) => s.city.error);

  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => { dispatch(getCityById(id)); }, [dispatch, id]);

  /* Reset image index when city changes */
  useEffect(() => { setImgIdx(0); }, [city?._id]);

  /* Cycle hero images */
  useEffect(() => {
    if (!city?.images?.length || city.images.length < 2) return;
    const t = setInterval(
      () => setImgIdx((i) => (i + 1) % city.images.length),
      5000
    );
    return () => clearInterval(t);
  }, [city]);

  /* Preload ALL city images immediately on data arrive */
  useEffect(() => {
    if (!city?.images?.length) return;
    city.images.forEach((src) => {
      if (!src) return;
      const img = new window.Image();
      img.src = src;
    });
  }, [city]);

  /* Stable callbacks */
  const goBack   = useCallback(() => navigate(-1), [navigate]);
  const goHotels = useCallback(() => navigate(`/hotels?city=${city?.name}`), [navigate, city?.name]);
  const goPlaces = useCallback(() => navigate(`/explore?city=${city?.name}`), [navigate, city?.name]);

  /* Memoised info cards — only recomputes when city changes */
  const infoCards = useMemo(() => {
    if (!city) return [];
    return [
      { gradient: "linear-gradient(135deg,#6366f1,#8b5cf6)", icon: "✦", label: "Famous For",       value: city.famousFor },
      { gradient: "linear-gradient(135deg,#f59e0b,#f97316)", icon: "🗓", label: "Best Time to Visit", value: city.bestTimeToVisit },
      { gradient: "linear-gradient(135deg,#10b981,#059669)", icon: "₹", label: "Avg Daily Budget",  value: city.avgDailyBudget ? `₹${city.avgDailyBudget} / person` : null },
      { gradient: "linear-gradient(135deg,#3b82f6,#06b6d4)", icon: "🌐", label: "Language",          value: city.language },
      { gradient: "linear-gradient(135deg,#ec4899,#f43f5e)", icon: "🌡", label: "Climate",           value: city.climate },
      { gradient: "linear-gradient(135deg,#a855f7,#7c3aed)", icon: "🚉", label: "Nearest Airport",   value: city.nearestAirport },
    ].filter((c) => c.value);
  }, [city]);

  /* Memoised actions */
  const actions = useMemo(() => {
    if (!city) return [];
    return [
      { emoji: "🏨", title: "Hotels",      desc: "Best stays & deals",  color: "#6366f1", path: `/hotels?city=${city.name}` },
      { emoji: "📍", title: "Places",      desc: "Top attractions",     color: "#10b981", path: `/explore?city=${city.name}` },
      { emoji: "🍽️", title: "Restaurants", desc: "Local flavors",       color: "#f59e0b", path: `/RestaurantLandingPage?city=${city.name}` },
    ];
  }, [city]);

  /* ── All hooks above this line — render guards below ── */

  if (loading) return <CityPageSkeleton />;

  if (error)
    return (
      <div className="cp-root min-h-screen bg-[#0d0d18] flex flex-col items-center justify-center gap-4">
        <div className="text-5xl opacity-40">⚠</div>
        <p className="text-[#e07070] font-bold text-xl">Something went wrong</p>
        <p className="text-white/40 text-sm max-w-xs text-center">{error}</p>
        <button onClick={goBack} className="mt-4 px-6 py-3 rounded-full bg-white/10 text-white text-sm font-medium cp-btn border border-white/10 hover:bg-white/20">
          ← Go back
        </button>
      </div>
    );

  if (!city)
    return (
      <div className="cp-root min-h-screen bg-[#0d0d18] flex flex-col items-center justify-center gap-4">
        <div className="text-5xl opacity-40">✦</div>
        <p className="text-white/60 font-bold text-xl">City not found</p>
        <button onClick={goBack} className="mt-2 px-6 py-3 rounded-full bg-white/10 text-white text-sm font-medium cp-btn border border-white/10 hover:bg-white/20">
          ← Go back
        </button>
      </div>
    );

  const heroSrc = city.images?.[imgIdx] || city.images?.[0] || "";

  return (
    <div className="cp-root min-h-screen bg-[#0d0d18] text-white">

      {/* ── HERO ── */}
      <section className="relative h-[92vh] min-h-[560px] overflow-hidden" aria-label={`${city.name} hero`}>

        {/* Crossfading background */}
        <HeroCrossFade src={heroSrc} />

        {/* Gradient overlay */}
        <div className="cp-img-overlay absolute inset-0" />

        {/* Back button */}
        <button
          onClick={goBack}
          className="cp-glass cp-btn absolute top-7 left-7 z-10 flex items-center gap-2 px-4 py-2.5 rounded-full text-white/80 text-sm font-medium"
          aria-label="Go back"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </button>

        {/* Photo dots */}
        {city.images?.length > 1 && (
          <div className="absolute top-7 right-7 z-10 flex gap-2 cp-glass px-3 py-2 rounded-full">
            {city.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                className={`w-2 h-2 rounded-full border-0 cursor-pointer transition-all duration-300 ${
                  i === imgIdx ? "bg-white scale-125" : "bg-white/35"
                }`}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Hero text */}
        <div className="absolute bottom-0 left-0 right-0 px-8 lg:px-16 pb-14">
          <div className="max-w-6xl mx-auto">
            <div className="cp-tag cp-fade-up mb-5 bg-white/10 border border-white/20 text-white/80">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              </svg>
              Destination Guide
            </div>

            <h1
              className="cp-fade-up-1 font-['Barlow_Condensed',sans-serif] font-black uppercase text-white leading-none mb-4"
              style={{ fontSize: "clamp(52px,10vw,130px)", letterSpacing: "-0.01em" }}
            >
              {city.name}
            </h1>

            {city.description && (
              <p className="cp-fade-up-2 text-white/60 text-base font-light max-w-xl leading-relaxed mb-8">
                {city.description.length > 150
                  ? city.description.slice(0, 150) + "…"
                  : city.description}
              </p>
            )}

            <div className="cp-fade-up-3 flex flex-wrap gap-3">
              <button
                onClick={goHotels}
                className="cp-btn inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-[#6366f1] text-white font-semibold text-sm shadow-[0_8px_32px_rgba(99,102,241,0.4)]"
              >
                Explore City
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={goPlaces}
                className="cp-btn cp-glass inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-white font-medium text-sm"
              >
                📍 Top Places
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-35 pointer-events-none" aria-hidden="true">
          <span className="text-[10px] tracking-widest uppercase text-white">Scroll</span>
          <div className="w-px h-5 bg-white/40 relative overflow-hidden rounded-full">
            <div className="cp-scroll-dot absolute inset-x-0 top-0 h-full bg-white rounded-full" />
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8">

        {/* Info cards */}
        {infoCards.length > 0 && (
          <section className="pt-16 pb-12" aria-label="City facts">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-white/35 text-center mb-2">
              Quick Facts
            </p>
            <h2
              className="font-['Barlow_Condensed',sans-serif] font-black uppercase text-center text-white mb-10"
              style={{ fontSize: "clamp(28px,5vw,48px)" }}
            >
              About {city.name}
            </h2>
            <div className={`grid gap-5 ${
              infoCards.length >= 4
                ? "sm:grid-cols-2 lg:grid-cols-3"
                : `grid-cols-${Math.min(infoCards.length, 3)}`
            }`}>
              {infoCards.map((c, i) => (
                <InfoCard key={i} {...c} />
              ))}
            </div>
          </section>
        )}

        {/* Full description */}
        {city.description && city.description.length > 150 && (
          <section className="py-12 border-t border-white/[0.06]" aria-label="Description">
            <div className="max-w-3xl mx-auto text-center">
              <div className="cp-section-divider" />
              <p className="text-white/55 text-base leading-relaxed font-light">
                {city.description}
              </p>
            </div>
          </section>
        )}

        {/* Gallery — lazy-loaded images with blur-up */}
        {city.images?.length > 1 && (
          <section className="py-12 border-t border-white/[0.06]" aria-label="Photo gallery">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-white/35 mb-5">
              Gallery
            </p>
            <div className="flex gap-4 no-scrollbar overflow-x-auto pb-2 -mx-1 px-1">
              {city.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className="shrink-0 cp-card-hover rounded-xl overflow-hidden border-0 cursor-pointer p-0 bg-transparent"
                  style={{
                    width: 192, height: 128,
                    outline: i === imgIdx ? "2px solid #6366f1" : "2px solid transparent",
                    outlineOffset: 2,
                    borderRadius: 12,
                  }}
                  aria-label={`View photo ${i + 1}`}
                  aria-pressed={i === imgIdx}
                >
                  {/* Lazy image with blur-up */}
                  <LazyImage
                    src={src}
                    alt={`${city.name} photo ${i + 1}`}
                    className="w-full h-full"
                    eager={i === 0}
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Explore actions */}
        <section className="py-14 border-t border-white/[0.06]" aria-label="Explore options">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-white/35 text-center mb-2">
            Start Exploring
          </p>
          <h2
            className="font-['Barlow_Condensed',sans-serif] font-black uppercase text-center text-white mb-12"
            style={{ fontSize: "clamp(28px,5vw,48px)" }}
          >
            Explore {city.name}
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {actions.map((a) => (
              <ActionTile
                key={a.title}
                emoji={a.emoji}
                title={a.title}
                desc={a.desc}
                color={a.color}
                onClick={() => navigate(a.path)}
              />
            ))}
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer
        className="mt-6 py-8 text-center text-white/22 text-xs tracking-widest uppercase"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        {city.name} · Destination Guide
      </footer>
y
    </div>
  );
}

export default CityDetails;
