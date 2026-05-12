import { useCallback, useEffect, useMemo, useState } from "react";
import { FaBars, FaTrash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getActiveCities } from "../../features/user/citySlice";
import {
  clearAiError,
  generatePlan,
  loadAiPlan,
  loadPlanHistory,
} from "../../features/user/placeSlice";
import AiPlannerDetails from "./AiPlannerDetails";
import apiClient from "../../pages/services/apiClient";

/** Great-circle distance in km (lat/lng in degrees). */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap";

const STYLES = `
  .aip-root * { font-family: 'Outfit', sans-serif; }
  .font-cormorant { font-family: 'Cormorant Garamond', serif !important; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulseAmber {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }

  .animate-fade-up       { animation: fadeUp .5s ease both; }
  .animate-fade-up-delay { animation: fadeUp .5s .1s ease both; }
  .animate-pulse-amber   { animation: pulseAmber 2s infinite; }

  .aip-history-item::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: #c9922a;
    border-radius: 0 3px 3px 0;
    transform: scaleY(0);
    transition: transform .2s;
  }
  .aip-history-item:hover::before { transform: scaleY(1); }

  .aip-submit::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0);
    transition: background .2s;
  }
  .aip-submit:hover        { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(201,146,42,0.45); }
  .aip-submit:hover::after { background: rgba(255,255,255,0.08); }
  .aip-submit:active       { transform: translateY(0); }

  .aip-backdrop {
    display: none;
  }
  @media (max-width: 767px) {
    .aip-sidebar-mobile-open {
      position: fixed !important;
      left: 0; top: 0; bottom: 0;
      z-index: 50;
      width: 280px !important;
    }
    .aip-backdrop {
      display: block;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.35);
      z-index: 40;
    }
  }
`;

function AiPlanner() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : true,
  );
  const [form, setForm] = useState({ cityId: "", budget: "", days: "" });

  const [previewHotels, setPreviewHotels] = useState([]);
  const [previewHotelsLoading, setPreviewHotelsLoading] = useState(false);

  const { cities = [] } = useSelector((state) => state.city);
  const { planHistory = [], aiLoading, aiError } = useSelector(
    (state) => state.place,
  );

  useEffect(() => {
    const id = "aip-planner-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    dispatch(getActiveCities());
    dispatch(loadPlanHistory());
    try {
      let history = JSON.parse(localStorage.getItem("planHistory")) || [];
      const now = Date.now();
      history = history.filter((item) => now - item.id < 24 * 60 * 60 * 1000);
      localStorage.setItem("planHistory", JSON.stringify(history));
      dispatch(loadPlanHistory());
    } catch {
      /* ignore corrupt localStorage */
    }
  }, [dispatch]);

  const selectedCity = useMemo(
    () => cities.find((c) => c._id === form.cityId),
    [cities, form.cityId],
  );

  useEffect(() => {
    if (!form.cityId) {
      setPreviewHotels([]);
      return;
    }
    const city = cities.find((c) => c._id === form.cityId);
    const name = city?.name?.trim();
    if (!name) {
      setPreviewHotels([]);
      return;
    }

    let cancelled = false;
    setPreviewHotelsLoading(true);
    apiClient
      .get("/api/hotel/public/hotels", { params: { city: name } })
      .then((body) => {
        if (cancelled) return;
        const arr = Array.isArray(body?.data)
          ? body.data
          : Array.isArray(body)
            ? body
            : [];
        setPreviewHotels(arr);
      })
      .catch(() => {
        if (!cancelled) setPreviewHotels([]);
      })
      .finally(() => {
        if (!cancelled) setPreviewHotelsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [form.cityId, cities]);

  const nearCheapHotels = useMemo(() => {
    if (!previewHotels.length) return [];

    const cc = selectedCity?.location?.coordinates;
    const [lng0, lat0] =
      Array.isArray(cc) && cc.length >= 2 ? cc : [null, null];

    const budgetCap = Number(form.budget);
    const hasBudget = Number.isFinite(budgetCap) && budgetCap > 0;

    const rows = previewHotels.map((h) => {
      const hc = h.location?.coordinates;
      const price = Number(h.pricePerNight) || 0;
      let distKm = null;
      if (
        lat0 != null &&
        lng0 != null &&
        Array.isArray(hc) &&
        hc.length >= 2
      ) {
        distKm = haversineKm(lat0, lng0, hc[1], hc[0]);
      }
      return { hotel: h, price, distKm };
    });

    let list = hasBudget
      ? rows.filter((r) => r.price === 0 || r.price <= budgetCap)
      : rows;
    if (!list.length) list = rows;

    list.sort((a, b) => {
      const da = a.distKm ?? 1e6;
      const db = b.distKm ?? 1e6;
      if (Math.abs(da - db) > 0.35) return da - db;
      return a.price - b.price;
    });

    return list.slice(0, 6);
  }, [previewHotels, selectedCity, form.budget]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      dispatch(clearAiError());
      if (!form.cityId || !form.budget || !form.days) {
        window.alert("Please fill all fields");
        return;
      }
      const budget = Number(form.budget);
      const days = Number(form.days);
      if (!Number.isFinite(budget) || budget <= 0) {
        window.alert("Please enter a valid budget");
        return;
      }
      if (!Number.isFinite(days) || days < 1 || days > 30) {
        window.alert("Please enter trip length between 1 and 30 days");
        return;
      }
      try {
        const plan = await dispatch(
          generatePlan({
            cityId: form.cityId,
            budget,
            days,
          }),
        ).unwrap();
        navigate("/AiPlanner-details", { state: { plan } });
      } catch (err) {
        const msg =
          typeof err === "string"
            ? err
            : err?.message || "Could not generate itinerary.";
        window.alert(msg);
      }
    },
    [dispatch, form, navigate],
  );

  const handleHistoryClick = useCallback(
    (plan) => {
      dispatch(loadAiPlan(plan));
      navigate("/AiPlanner-details", { state: { plan } });
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    },
    [dispatch, navigate],
  );

  const handleDelete = useCallback((id) => {
    try {
      let history = JSON.parse(localStorage.getItem("planHistory")) || [];
      history = history.filter((item) => item.id !== id);
      localStorage.setItem("planHistory", JSON.stringify(history));
      dispatch(loadPlanHistory());
    } catch {
      /* ignore */
    }
  }, [dispatch]);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const goToHotel = useCallback(
    (hotelId) => {
      const id = hotelId != null ? String(hotelId) : "";
      if (!id) return;
      navigate(`/hotels/${id}`);
    },
    [navigate],
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div className="aip-root h-screen flex overflow-hidden bg-[#f5f5f5] text-[#1f1f1f]">
        {sidebarOpen && <div className="aip-backdrop" onClick={closeSidebar} />}

        <aside
          className={`
            bg-white shadow-[4px_0_10px_rgba(0,0,0,0.05)] border-r border-black/10
            shrink-0 flex flex-col transition-all duration-300 ease-in-out
            overflow-hidden
            ${
              sidebarOpen
                ? "w-70 md:w-75 aip-sidebar-mobile-open"
                : "w-0"
            }
          `}
        >
          <div className="px-5 pt-6 pb-4 border-b border-black/10">
            <div className="text-[10px] tracking-[.18em] uppercase text-[#f59e0b] font-semibold mb-1">
              AI Planner
            </div>
            <div className="font-cormorant text-[20px] font-semibold text-[#1f1f1f]">
              Trip History
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pt-4 pb-6 [scrollbar-width:thin] [scrollbar-color:#e0e0e0_transparent]">
            {planHistory.length === 0 ? (
              <div className="mt-6 border border-dashed border-black/10 rounded-[14px] p-5 text-center">
                <div className="text-[26px] mb-2 opacity-50 animate-pulse">
                  🗺️
                </div>
                <p className="text-[12px] text-[#6b7280] leading-relaxed">
                  No history yet.
                  <br />
                  Generate your first plan and it will appear here.
                </p>
              </div>
            ) : (
              planHistory.map((item) => {
                const plan = item.plan;
                const dayCount = Array.isArray(plan) ? plan.length : 0;
                const title =
                  (Array.isArray(plan) && plan[0]?.places?.[0]?.name) ||
                  "Trip plan";
                return (
                  <div
                    key={item.id}
                    className="aip-history-item flex items-center gap-2 px-3 py-3 mb-2 rounded-[14px] border border-black/10 cursor-pointer relative overflow-hidden transition-all duration-200 hover:bg-[#fef3c7] hover:border-[#f59e0b]/30"
                  >
                    <div className="w-8 h-8 rounded-[10px] bg-[#f59e0b]/12 grid place-items-center shrink-0 text-[13px]">
                      ✈️
                    </div>
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => handleHistoryClick(plan)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleHistoryClick(plan);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="text-[12px] font-medium text-[#1f1f1f] truncate">
                        {title}
                      </div>
                      <div className="text-[11px] text-[#6b7280] mt-0.5">
                        {dayCount} day{dayCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="shrink-0 p-1.5 text-[#9ca3af] hover:text-red-400 transition-colors"
                      aria-label="Delete"
                    >
                      <FaTrash size={11} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex items-center gap-3 px-4 sm:px-6 md:px-8 py-3.5 border-b border-black/10 bg-white/70 backdrop-blur-md shrink-0">
            <button
              type="button"
              className="w-9 h-9 grid place-items-center rounded-[10px] border border-black/10 bg-white text-[#1f1f1f] cursor-pointer transition-all duration-200 hover:border-[#f59e0b] hover:bg-[#f59e0b]/10 shrink-0"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Toggle sidebar"
            >
              <FaBars size={13} />
            </button>

            <div className="min-w-0">
              <div className="font-cormorant text-[20px] sm:text-[24px] font-semibold text-[#1f1f1f] leading-[1.1] truncate">
                AI Travel Planner
              </div>
              <div className="hidden sm:block text-[11px] text-[#6b7280] mt-0.5 font-light tracking-[.02em]">
                Day-by-day itineraries crafted for your city, budget & pace
              </div>
            </div>

            <button
              type="button"
              className="ml-auto w-10 h-9 grid place-items-center rounded-[10px] border border-black/10 bg-transparent text-[#f5efe6] cursor-pointer transition-all duration-200 hover:border-[#c9922a] hover:bg-[#c9922a]/8 shrink-0"
              onClick={() => navigate("/assistantChat")}
              aria-label="Open AI Assistant"
              title="Chat with AI Assistant"
            >
              <img
                src="/robot.png"
                alt="AI Assistant"
                className="w-8 h-7 object-contain"
              />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 [scrollbar-width:thin] [scrollbar-color:#e0e0e0_transparent] bg-linear-to-b from-[#fefce8] to-[#fdfaf6]">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
              <form
                className="animate-fade-up bg-white border border-black/10 rounded-[20px] px-5 sm:px-7 md:px-8 py-6 sm:py-8 shadow-[0_0_40px_rgba(245,158,11,0.15)] transition-transform hover:-translate-y-0.5"
                onSubmit={handleSubmit}
              >
                <div className="text-[10px] tracking-[.18em] uppercase text-[#f59e0b] font-semibold mb-2">
                  ✦ New Itinerary
                </div>
                <div className="font-cormorant text-[26px] sm:text-[30px] md:text-[32px] font-semibold text-[#1f1f1f] leading-[1.15] mb-1.5">
                  Plan your
                  <br />
                  next journey
                </div>
                <div className="text-[12px] sm:text-[13px] text-[#6b7280] mb-6 leading-relaxed">
                  Share your destination, budget, and trip length — we&apos;ll handle
                  the rest.
                </div>

                {aiError ? (
                  <div
                    className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800"
                    role="alert"
                  >
                    {aiError}
                  </div>
                ) : null}

                <div className="mb-4">
                  <label className="block text-[11px] tracking-widest uppercase font-semibold text-[#6b7280] mb-2">
                    Destination City
                  </label>
                  <select
                    className="w-full bg-[#f9fafb] border border-black/10 text-[#1f1f1f] px-4 py-3 rounded-xl text-[14px] outline-none cursor-pointer appearance-none transition-all duration-200 focus:border-[#f59e0b] focus:shadow-[0_0_0_3px_rgba(245,158,11,0.12)] [&>option]:bg-white"
                    value={form.cityId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, cityId: e.target.value }))
                    }
                    disabled={aiLoading}
                  >
                    <option value="">Choose a city…</option>
                    {cities.map((city) => (
                      <option key={city._id} value={city._id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                {form.cityId ? (
                  <div className="mb-4 rounded-xl border border-amber-200/80 bg-linear-to-br from-amber-50/90 to-white px-3.5 py-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800/90">
                        Stays near {selectedCity?.name || "city"}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        By distance · then lowest price
                      </span>
                    </div>
                    {previewHotelsLoading ? (
                      <p className="text-[12px] text-zinc-500">
                        Loading hotels…
                      </p>
                    ) : nearCheapHotels.length === 0 ? (
                      <p className="text-[12px] text-zinc-500">
                        No active hotels found for this city name. Try another
                        city or check listings.
                      </p>
                    ) : (
                      <ul className="max-h-52 space-y-2 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
                        {nearCheapHotels.map(({ hotel: h, price, distKm }) => (
                          <li key={h._id} className="list-none">
                            <button
                              type="button"
                              onClick={() => goToHotel(h._id)}
                              aria-label={`Open ${h.name} hotel details`}
                              className="group flex w-full cursor-pointer items-start gap-2 rounded-lg border border-black/5 bg-white/90 px-2.5 py-2 text-left text-[13px] shadow-sm transition hover:border-amber-300/70 hover:bg-amber-50/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
                            >
                              {h.images?.[0] ? (
                                <img
                                  src={h.images[0]}
                                  alt=""
                                  className="mt-0.5 h-10 w-10 shrink-0 rounded-md object-cover"
                                />
                              ) : (
                                <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-md bg-zinc-100 text-[11px] text-zinc-400">
                                  🏨
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <span className="line-clamp-2 font-medium text-zinc-900 group-hover:text-amber-800 group-hover:underline">
                                  {h.name}
                                </span>
                                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-600">
                                  <span className="font-semibold text-emerald-800">
                                    {price > 0
                                      ? `₹${price.toLocaleString("en-IN")}/night`
                                      : "Price on request"}
                                  </span>
                                  {distKm != null ? (
                                    <span className="text-zinc-500">
                                      ~{distKm.toFixed(1)} km from centre
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-3">
                  <div className="mb-4">
                    <label className="block text-[11px] tracking-widest uppercase font-semibold text-[#6b7280] mb-2">
                      Budget (₹)
                    </label>
                    <input
                      className="w-full bg-[#f9fafb] border border-black/10 text-[#1f1f1f] px-3 py-3 rounded-xl text-[13px] outline-none transition-all duration-200 placeholder:text-[#9ca3af]/60 focus:border-[#f59e0b] focus:shadow-[0_0_0_3px_rgba(245,158,11,0.12)]"
                      type="number"
                      placeholder="e.g. 15000"
                      value={form.budget}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, budget: e.target.value }))
                      }
                      min={0}
                      disabled={aiLoading}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-[11px] tracking-widest uppercase font-semibold text-[#6b7280] mb-2">
                      Duration
                    </label>
                    <input
                      className="w-full bg-[#f9fafb] border border-black/10 text-[#1f1f1f] px-3 py-3 rounded-xl text-[13px] outline-none transition-all duration-200 placeholder:text-[#9ca3af]/60 focus:border-[#f59e0b] focus:shadow-[0_0_0_3px_rgba(245,158,11,0.12)]"
                      type="number"
                      placeholder="Days"
                      value={form.days}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, days: e.target.value }))
                      }
                      min={1}
                      max={30}
                      disabled={aiLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={aiLoading}
                  className="aip-submit w-full mt-5 px-6 py-3.5 border-none rounded-xl bg-linear-to-br from-[#f59e0b] to-[#fcd34d] text-[#1f1f1f] text-[14px] font-semibold tracking-[.04em] cursor-pointer shadow-[0_4px_24px_rgba(245,158,11,0.3)] relative overflow-hidden transition-all duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                >
                  {aiLoading ? "Generating…" : "Generate My Itinerary →"}
                </button>

                <div className="mt-3.5 text-[11px] text-[#6b7280] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shrink-0" />
                  Plans are saved for 24 hours in your History panel.
                </div>
              </form>

              <div className="animate-fade-up-delay bg-white border border-black/10 rounded-[20px] overflow-hidden h-[50vh] sm:h-[60vh] lg:h-[78vh] flex flex-col shadow-[0_0_40px_rgba(245,158,11,0.08)]">
                <div className="px-5 pt-4 pb-3.5 border-b border-black/10 flex items-center gap-2.5">
                  <div className="animate-pulse-amber w-2 h-2 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]" />
                  <span className="text-[12px] sm:text-[13px] font-medium text-[#1f1f1f] tracking-[.04em]">
                    Live Itinerary Preview
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto min-h-0 [scrollbar-width:thin] [scrollbar-color:#e0e0e0_transparent]">
                  <AiPlannerDetails embedded />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default AiPlanner;
