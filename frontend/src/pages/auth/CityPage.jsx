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

/* ─── Ambient blobs (same pattern as HotelPage) ─── */
const AmbientBlobs = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <div
      className="absolute top-[-8%] left-[-6%] w-[45vw] h-[45vw] rounded-full"
      style={{
        background:
          "radial-gradient(circle, rgba(147,197,253,0.28) 0%, rgba(199,228,255,0.08) 70%, transparent 100%)",
        filter: "blur(60px)",
      }}
    />
    <div
      className="absolute bottom-[-5%] right-[-4%] w-[38vw] h-[38vw] rounded-full"
      style={{
        background:
          "radial-gradient(circle, rgba(165,180,252,0.22) 0%, rgba(224,231,255,0.06) 70%, transparent 100%)",
        filter: "blur(70px)",
      }}
    />
    <div
      className="absolute top-[45%] left-[40%] w-[30vw] h-[30vw] rounded-full"
      style={{
        background:
          "radial-gradient(circle, rgba(186,230,253,0.15) 0%, transparent 70%)",
        filter: "blur(80px)",
      }}
    />
  </div>
);

/* ─── useReveal — Intersection Observer ─── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── HeroCrossFade ─── */
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
  }, [src]);

  return (
    <>
      {showPrev && prev && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${prev})`, opacity: 0, transition: "opacity 0.9s ease" }}
        />
      )}
      <div
        key={curr}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${curr})`, transition: "opacity 0.9s ease", animation: "cpKenBurns 20s ease-out forwards" }}
      />
    </>
  );
});

/* ─── Skeleton ─── */
const CityPageSkeleton = () => (
  <div
    className="min-h-screen"
    style={{ background: "linear-gradient(145deg,#eef3fb 0%,#e8f0f9 40%,#dfe9f5 70%,#d8e4f2 100%)" }}
  >
    <div className="relative h-[70vh] overflow-hidden animate-pulse bg-slate-200" />
    <div className="max-w-6xl mx-auto px-6 pt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-32 rounded-2xl bg-slate-200 animate-pulse" />
      ))}
    </div>
  </div>
);

/* ─── InfoCard ─── */
const InfoCard = React.memo(({ gradient, icon, label, value }) => {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: 0,
        transform: "translateY(24px)",
        transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)",
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 4px 24px rgba(100,130,180,0.10)",
      }}
      className="rounded-2xl p-6 border border-white/70 hover:-translate-y-1 transition-transform duration-300 cursor-default relative overflow-hidden"
    >
      <div
        className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-15 blur-2xl pointer-events-none"
        style={{ background: gradient }}
      />
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 text-lg shrink-0"
        style={{ background: gradient }}
      >
        {icon}
      </div>
      <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">{label}</p>
      <p className="text-slate-700 font-semibold text-sm leading-snug">{value}</p>
    </div>
  );
});

/* ─── ActionTile ─── */
const ActionTile = React.memo(({ emoji, title, desc, color, onClick }) => {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      style={{
        opacity: 0,
        transform: "translateY(24px)",
        transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)",
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 4px 24px rgba(100,130,180,0.10)",
      }}
      className="group rounded-2xl border border-white/70 overflow-hidden cursor-pointer hover:shadow-[0_12px_40px_rgba(100,130,180,0.18)] hover:-translate-y-2 transition-all duration-300"
    >
      <div className="h-1 w-full" style={{ background: color }} />
      <div className="p-7 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
          style={{ background: `${color}18`, border: `1px solid ${color}35` }}
        >
          {emoji}
        </div>
        <h3 className="text-slate-800 font-bold text-lg mb-1">{title}</h3>
        <p className="text-slate-400 text-sm font-medium mb-4">{desc}</p>
        <div
          className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
          style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
        >
          Explore →
        </div>
      </div>
    </div>
  );
});

/* ─── inject keyframes once ─── */
if (!document.getElementById("cp-light-styles")) {
  const s = document.createElement("style");
  s.id = "cp-light-styles";
  s.textContent = `
    @keyframes cpKenBurns { 0%{transform:scale(1.0)} 100%{transform:scale(1.08)} }
    @keyframes cpFadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
    .cp-fade-up   { animation: cpFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both; }
    .cp-fade-up-1 { animation: cpFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.12s both; }
    .cp-fade-up-2 { animation: cpFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.22s both; }
    .cp-fade-up-3 { animation: cpFadeUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.32s both; }
    .no-scrollbar { scrollbar-width:none; }
    .no-scrollbar::-webkit-scrollbar { display:none; }
  `;
  document.head.appendChild(s);
}

/* ─── Main component ─── */
function CityDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const city    = useSelector((s) => s.city.city);
  const loading = useSelector((s) => s.city.loading);
  const error   = useSelector((s) => s.city.error);

  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => { 
    window.scrollTo(0, 0);
    dispatch(getCityById(id)); 
  }, [dispatch, id]);
  useEffect(() => { setImgIdx(0); }, [city?._id]);

  useEffect(() => {
    if (!city?.images?.length || city.images.length < 2) return;
    const t = setInterval(() => setImgIdx((i) => (i + 1) % city.images.length), 5000);
    return () => clearInterval(t);
  }, [city]);

  useEffect(() => {
    if (!city?.images?.length) return;
    city.images.forEach((src) => { if (src) { const img = new window.Image(); img.src = src; } });
  }, [city]);

  const goBack   = useCallback(() => navigate(-1), [navigate]);
  const goHotels = useCallback(() => navigate(`/hotels?city=${city?.name}`), [navigate, city?.name]);
  const goPlaces = useCallback(() => navigate(`/explore?city=${city?.name}`), [navigate, city?.name]);

  const infoCards = useMemo(() => {
    if (!city) return [];
    return [
      { gradient: "linear-gradient(135deg,#6366f1,#8b5cf6)", icon: "✦", label: "Famous For",        value: city.famousFor },
      { gradient: "linear-gradient(135deg,#f59e0b,#f97316)", icon: "🗓", label: "Best Time to Visit", value: city.bestTimeToVisit },
      { gradient: "linear-gradient(135deg,#10b981,#059669)", icon: "₹", label: "Avg Daily Budget",   value: city.avgDailyBudget ? `₹${city.avgDailyBudget} / person` : null },
      { gradient: "linear-gradient(135deg,#3b82f6,#06b6d4)", icon: "🌐", label: "Language",           value: city.language },
      { gradient: "linear-gradient(135deg,#ec4899,#f43f5e)", icon: "🌡", label: "Climate",            value: city.climate },
      { gradient: "linear-gradient(135deg,#a855f7,#7c3aed)", icon: "🚉", label: "Nearest Airport",    value: city.nearestAirport },
    ].filter((c) => c.value);
  }, [city]);

  const actions = useMemo(() => {
    if (!city) return [];
    return [
      { emoji: "🏨", title: "Hotels",      desc: "Best stays & deals",  color: "#6366f1", path: `/hotels?city=${city.name}` },
      { emoji: "📍", title: "Places",      desc: "Top attractions",     color: "#10b981", path: `/explore?city=${city.name}` },
      { emoji: "🍽️", title: "Restaurants", desc: "Local flavors",       color: "#f59e0b", path: `/RestaurantLandingPage?city=${city.name}` },
    ];
  }, [city]);

  /* ── guards ── */
  if (loading) return <CityPageSkeleton />;

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "linear-gradient(145deg,#eef3fb 0%,#e8f0f9 40%,#dfe9f5 70%,#d8e4f2 100%)" }}>
        <div className="text-5xl">⚠️</div>
        <p className="text-rose-600 font-bold text-xl">Something went wrong</p>
        <p className="text-slate-400 text-sm max-w-xs text-center">{error}</p>
        <button onClick={goBack}
          className="mt-4 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold shadow-sm hover:shadow-md transition-all">
          ← Go back
        </button>
      </div>
    );

  if (!city)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "linear-gradient(145deg,#eef3fb 0%,#e8f0f9 40%,#dfe9f5 70%,#d8e4f2 100%)" }}>
        <div className="text-5xl">🗺️</div>
        <p className="text-slate-600 font-bold text-xl">City not found</p>
        <button onClick={goBack}
          className="mt-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold shadow-sm hover:shadow-md transition-all">
          ← Go back
        </button>
      </div>
    );

  const heroSrc = city.images?.[imgIdx] || city.images?.[0] || "";

  return (
    <div
      className="min-h-screen font-sans relative"
      style={{ background: "linear-gradient(145deg,#eef3fb 0%,#e8f0f9 40%,#dfe9f5 70%,#d8e4f2 100%)" }}
    >
      <AmbientBlobs />

      {/* ── HERO ── */}
      <section
        className="relative h-[72vh] min-h-[480px] overflow-hidden"
        aria-label={`${city.name} hero`}
        style={{ zIndex: 1 }}
      >
        <HeroCrossFade src={heroSrc} />

        {/* overlay — lighter than the dark version */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.22) 40%, rgba(0,0,0,0.72) 75%, rgba(0,0,0,0.88) 100%)",
          }}
        />

        {/* Back button */}
        <button
          onClick={goBack}
          className="absolute top-5 left-5 sm:top-7 sm:left-8 z-10 flex items-center gap-2 px-4 py-2.5 rounded-full text-slate-700 text-sm font-semibold transition-all duration-200 hover:shadow-md"
          style={{
            background: "rgba(255,255,255,0.88)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.8)",
            boxShadow: "0 2px 12px rgba(100,130,180,0.15)",
          }}
          aria-label="Go back"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </button>

        {/* Photo dots */}
        {city.images?.length > 1 && (
          <div
            className="absolute top-5 right-5 sm:top-7 sm:right-8 z-10 flex gap-2 px-3 py-2 rounded-full"
            style={{
              background: "rgba(255,255,255,0.88)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.8)",
              boxShadow: "0 2px 12px rgba(100,130,180,0.15)",
            }}
          >
            {city.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                className={`w-2 h-2 rounded-full border-0 cursor-pointer transition-all duration-300 ${
                  i === imgIdx ? "bg-blue-500 scale-125" : "bg-slate-300"
                }`}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Hero text */}
        <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-10 lg:px-16 pb-10 md:pb-14">
          <div className="max-w-6xl mx-auto">
            {/* pill badge */}
            <div className="cp-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-bold tracking-widest uppercase"
              style={{
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.35)",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              </svg>
              Destination Guide
            </div>

            <h1
              className="cp-fade-up-1 font-black leading-none mb-3 text-white drop-shadow-lg"
              style={{ fontSize: "clamp(48px,9vw,110px)", letterSpacing: "-0.02em" }}
            >
              {city.name}
            </h1>

            {city.description && (
              <p className="cp-fade-up-2 text-white/70 text-sm sm:text-base font-light max-w-xl leading-relaxed mb-7">
                {city.description.length > 150
                  ? city.description.slice(0, 150) + "…"
                  : city.description}
              </p>
            )}

            <div className="cp-fade-up-3 flex flex-wrap gap-3">
              <button
                onClick={goHotels}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                style={{
                  background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                  boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
                }}
              >
                Explore City
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={goPlaces}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.18)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  color: "rgba(255,255,255,0.92)",
                }}
              >
                📍 Top Places
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">

        {/* Info Cards */}
        {infoCards.length > 0 && (
          <section className="pt-14 pb-10" aria-label="City facts">
            <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 text-center mb-2">
              Quick Facts
            </p>
            <h2 className="text-center font-black text-slate-800 mb-10"
              style={{ fontSize: "clamp(24px,4vw,40px)" }}>
              About {city.name}
            </h2>
            <div className={`grid gap-4 ${
              infoCards.length >= 4
                ? "sm:grid-cols-2 lg:grid-cols-3"
                : `grid-cols-${Math.min(infoCards.length, 3)}`
            }`}>
              {infoCards.map((c, i) => <InfoCard key={i} {...c} />)}
            </div>
          </section>
        )}

        {/* Full description */}
        {city.description && city.description.length > 150 && (
          <section className="py-10 border-t border-white/60" aria-label="Description">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-10 h-0.5 rounded-full mx-auto mb-6"
                style={{ background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }} />
              <p className="text-slate-500 text-base leading-relaxed font-light">
                {city.description}
              </p>
            </div>
          </section>
        )}

        {/* Gallery */}
        {city.images?.length > 1 && (
          <section className="py-10 border-t border-white/60" aria-label="Photo gallery">
            <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-5">
              Gallery
            </p>
            <div className="flex gap-3 no-scrollbar overflow-x-auto pb-2 -mx-1 px-1">
              {city.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className="shrink-0 rounded-xl overflow-hidden cursor-pointer p-0 bg-transparent transition-all duration-200 hover:-translate-y-1"
                  style={{
                    width: 180, height: 120,
                    outline: i === imgIdx ? "2px solid #6366f1" : "2px solid transparent",
                    outlineOffset: 2,
                    borderRadius: 12,
                    boxShadow: i === imgIdx
                      ? "0 4px 20px rgba(99,102,241,0.3)"
                      : "0 2px 8px rgba(100,130,180,0.12)",
                  }}
                  aria-label={`View photo ${i + 1}`}
                  aria-pressed={i === imgIdx}
                >
                  <img
                    src={src}
                    alt={`${city.name} photo ${i + 1}`}
                    loading={i === 0 ? "eager" : "lazy"}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Explore actions */}
        <section className="py-14 border-t border-white/60" aria-label="Explore options">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 text-center mb-2">
            Start Exploring
          </p>
          <h2 className="text-center font-black text-slate-800 mb-10"
            style={{ fontSize: "clamp(24px,4vw,40px)" }}>
            Explore {city.name}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
        className="mt-6 py-8 text-center text-slate-400 text-xs tracking-widest uppercase relative z-10"
        style={{ borderTop: "1px solid rgba(255,255,255,0.6)" }}
      >
        {city.name} · Destination Guide
      </footer>
    </div>
  );
}

export default CityDetails;
