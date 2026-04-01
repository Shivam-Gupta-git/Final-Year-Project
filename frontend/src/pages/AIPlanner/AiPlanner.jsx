import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getActiveCities } from "../../features/user/citySlice";
import {
  generatePlan,
  loadAiPlan,
  loadPlanHistory,
} from "../../features/user/placeSlice";
import { useNavigate } from "react-router-dom";
import { FaBars, FaTrash } from "react-icons/fa";
import AiPlannerDetails from "./AiPlannerDetails";

/* ── Only pseudo-elements, keyframes & font import stay here ── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');

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

  /* Left accent bar on history item — needs ::before */
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

  /* Shine overlay on submit button — needs ::after */
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
`;

function AiPlanner() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [form, setForm] = useState({ cityId: "", budget: "", days: "" });

  const { cities = [] } = useSelector((state) => state.city);
  const { planHistory = [] } = useSelector((state) => state.place);

  useEffect(() => {
    dispatch(getActiveCities());
    dispatch(loadPlanHistory());
    let history = JSON.parse(localStorage.getItem("planHistory")) || [];
    const now = Date.now();
    history = history.filter((item) => now - item.id < 24 * 60 * 60 * 1000);
    localStorage.setItem("planHistory", JSON.stringify(history));
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.cityId || !form.budget || !form.days) {
      alert("Please fill all fields");
      return;
    }
    dispatch(
      generatePlan({
        cityId: form.cityId,
        budget: Number(form.budget),
        days: Number(form.days),
      }),
    ).then((res) => {
      if (res.payload)
        navigate("/AiPlanner-details", { state: { plan: res.payload } });
    });
  };

  const handleHistoryClick = (plan) => {
    dispatch(loadAiPlan(plan));
    navigate("/AiPlanner-details", { state: { plan } });
  };

  const handleDelete = (id) => {
    let history = JSON.parse(localStorage.getItem("planHistory")) || [];
    history = history.filter((item) => item.id !== id);
    localStorage.setItem("planHistory", JSON.stringify(history));
    dispatch(loadPlanHistory());
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* ROOT */}
      <div className="aip-root h-screen flex overflow-hidden bg-[#0d1117] text-[#f5efe6]">
        {/* ── SIDEBAR ── */}
        <aside
          className={`bg-[#141c27] border-r border-white/[0.07] overflow-hidden shrink-0 flex flex-col shadow-[4px_0_10px_rgba(0,0,0,0.3)] transition-all duration-350 ease-in-out ${
            sidebarOpen ? "w-75" : "w-0"
          }`}
        >
          {/* Header */}
          <div className="px-6 pt-7 pb-5 border-b border-white/[0.07]">
            <div className="text-[10px] tracking-[.18em] uppercase text-[#c9922a] font-semibold mb-1">
              AI Planner
            </div>
            <div className="font-cormorant text-[22px] font-semibold text-[#f5efe6]">
              Trip History
            </div>
          </div>

          {/* Scroll area */}
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 [scrollbar-width:thin] [scrollbar-color:#1c2738_transparent]">
            {planHistory.length === 0 ? (
              <div className="mt-6 border border-dashed border-white/10 rounded-[14px] p-6 text-center">
                <div className="text-[28px] mb-2.5 opacity-50">🗺️</div>
                <p className="text-[13px] text-[#7a8a9a] leading-relaxed">
                  No history yet.
                  <br />
                  Generate your first plan and it will appear here.
                </p>
              </div>
            ) : (
              planHistory.map((item) => (
                <div
                  key={item.id}
                  className="aip-history-item flex items-center gap-2.5 px-3.5 py-3.5 mb-2 rounded-[14px] border border-white/[0.07] cursor-pointer relative overflow-hidden transition-all duration-200 hover:bg-white/4 hover:border-[#c9922a]/30 hover:translate-x-0.5"
                >
                  <div className="w-8.5 h-8.5 rounded-[10px] bg-[#c9922a]/12 grid place-items-center shrink-0 text-[14px]">
                    ✈️
                  </div>
                  <div
                    className="flex-1 min-w-0"
                    onClick={() => handleHistoryClick(item.plan)}
                  >
                    <div className="text-[13px] font-medium text-[#f5efe6] whitespace-nowrap overflow-hidden text-ellipsis max-w-37.5">
                      {item.plan[0]?.places?.[0]?.name || "Trip Plan"}
                    </div>
                    <div className="text-[11px] text-[#7a8a9a] mt-0.5">
                      {item.plan.length} Day{item.plan.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <button
                    className="ml-auto bg-transparent border-none text-[#7a8a9a] cursor-pointer p-1.5 rounded-lg shrink-0 transition-all duration-200 hover:text-red-500 hover:bg-red-500/10"
                    onClick={() => handleDelete(item.id)}
                    aria-label="Delete plan"
                  >
                    <FaTrash size={11} />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* TOPBAR */}
          <div className="flex items-center gap-4.5 px-8 max-[900px]:px-5 py-4.5 border-b border-white/[0.07] bg-[#0d1117]/80 backdrop-blur-md shrink-0">
            <button
              className="w-10 h-10 grid place-items-center rounded-[10px] border border-white/[0.07] bg-transparent text-[#f5efe6] cursor-pointer transition-all duration-200 hover:border-[#c9922a] hover:bg-[#c9922a]/8"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <FaBars size={14} />
            </button>

            <div>
              <div className="font-cormorant text-[24px] font-semibold text-[#f5efe6] leading-[1.1]">
                AI Travel Planner
              </div>
              <div className="text-[12px] text-[#7a8a9a] mt-0.5 font-light tracking-[.02em]">
                Day-by-day itineraries crafted for your city, budget & pace
              </div>
            </div>

            <span className="ml-auto text-[10px] tracking-[.12em] uppercase font-semibold text-[#e8b84b] bg-[#c9922a]/12 border border-[#c9922a]/25 px-3 py-1.25 rounded-full">
              ✦ Powered by AI
            </span>
          </div>

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto p-8 max-[900px]:p-5 [scrollbar-width:thin] [scrollbar-color:#1c2738_transparent]">
            <div className="max-w-275 mx-auto grid grid-cols-2 max-[900px]:grid-cols-1 gap-6 items-start">
              {/* FORM CARD */}
              <form
                className="animate-fade-up bg-[#141c27] border border-white/[0.07] rounded-[20px] px-8 py-9 shadow-[0_0_40px_rgba(201,146,42,0.15)]"
                onSubmit={handleSubmit}
              >
                <div className="text-[10px] tracking-[.18em] uppercase text-[#c9922a] font-semibold mb-2">
                  ✦ New Itinerary
                </div>
                <div className="font-cormorant text-[32px] font-semibold text-[#f5efe6] leading-[1.15] mb-1.5">
                  Plan your
                  <br />
                  next journey
                </div>
                <div className="text-[13px] text-[#7a8a9a] mb-8 leading-relaxed">
                  Share your destination, budget, and trip length —
                  <br />
                  we'll handle the rest.
                </div>

                {/* City */}
                <div className="mb-5">
                  <label className="block text-[11px] tracking-widest uppercase font-semibold text-[#7a8a9a] mb-2">
                    Destination City
                  </label>
                  <select
                    className="w-full bg-[#1c2738] border border-white/[0.07] text-[#f5efe6] px-4 py-3.5 rounded-xl text-[14px] outline-none cursor-pointer appearance-none transition-all duration-200 focus:border-[#c9922a] focus:shadow-[0_0_0_3px_rgba(201,146,42,0.12)] [&>option]:bg-[#141c27]"
                    value={form.cityId}
                    onChange={(e) =>
                      setForm({ ...form, cityId: e.target.value })
                    }
                  >
                    <option value="">Choose a city…</option>
                    {cities.map((city) => (
                      <option key={city._id} value={city._id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget + Days */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="mb-5">
                    <label className="block text-[11px] tracking-widest uppercase font-semibold text-[#7a8a9a] mb-2">
                      Budget (₹)
                    </label>
                    <input
                      className="w-full bg-[#1c2738] border border-white/[0.07] text-[#f5efe6] px-4 py-3.5 rounded-xl text-[14px] outline-none transition-all duration-200 placeholder:text-[#7a8a9a]/60 focus:border-[#c9922a] focus:shadow-[0_0_0_3px_rgba(201,146,42,0.12)]"
                      type="number"
                      placeholder="e.g. 15000"
                      value={form.budget}
                      onChange={(e) =>
                        setForm({ ...form, budget: e.target.value })
                      }
                      min={0}
                    />
                  </div>
                  <div className="mb-5">
                    <label className="block text-[11px] tracking-widest uppercase font-semibold text-[#7a8a9a] mb-2">
                      Trip Duration
                    </label>
                    <input
                      className="w-full bg-[#1c2738] border border-white/[0.07] text-[#f5efe6] px-4 py-3.5 rounded-xl text-[14px] outline-none transition-all duration-200 placeholder:text-[#7a8a9a]/60 focus:border-[#c9922a] focus:shadow-[0_0_0_3px_rgba(201,146,42,0.12)]"
                      type="number"
                      placeholder="Days"
                      value={form.days}
                      onChange={(e) =>
                        setForm({ ...form, days: e.target.value })
                      }
                      min={1}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="aip-submit w-full mt-7 px-6 py-3.75 border-none rounded-xl bg-linear-to-br from-[#c9922a] to-[#e8b84b] text-[#0d1117] text-[14px] font-semibold tracking-[.04em] cursor-pointer shadow-[0_4px_24px_rgba(201,146,42,0.3)] relative overflow-hidden transition-all duration-200"
                >
                  Generate My Itinerary →
                </button>

                <div className="mt-4 text-[12px] text-[#7a8a9a] flex items-center gap-1.5">
                  <span className="w-1.25 h-1.25 rounded-full bg-[#c9922a] shrink-0" />
                  Plans are saved for 24 hours in your History panel.
                </div>
              </form>

              {/* PREVIEW PANEL */}
              <div className="animate-fade-up-delay bg-[#141c27] border border-white/[0.07] rounded-[20px] overflow-hidden h-[78vh] flex flex-col">
                <div className="px-6 pt-5 pb-4 border-b border-white/[0.07] flex items-center gap-2.5">
                  <div className="animate-pulse-amber w-2 h-2 rounded-full bg-[#c9922a] shadow-[0_0_8px_#c9922a]" />
                  <span className="text-[13px] font-medium text-[#f5efe6] tracking-[.04em]">
                    Live Itinerary Preview
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#1c2738_transparent]">
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
