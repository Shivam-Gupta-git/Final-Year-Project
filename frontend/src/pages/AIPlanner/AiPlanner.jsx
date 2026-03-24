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
import { IoIosCloseCircleOutline } from "react-icons/io";
import AiPlannerDetails from "./AiPlannerDetails";

function AiPlanner() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [form, setForm] = useState({
    cityId: "",
    budget: "",
    days: "",
  });

  const { cities = [] } = useSelector((state) => state.city);
  const { planHistory = [] } = useSelector((state) => state.place);

  useEffect(() => {
    dispatch(getActiveCities());
    dispatch(loadPlanHistory());

    // ✅ AUTO DELETE OLD HISTORY (24 HOURS)
    let history = JSON.parse(localStorage.getItem("planHistory")) || [];

    const now = Date.now();
    history = history.filter((item) => now - item.id < 24 * 60 * 60 * 1000);

    localStorage.setItem("planHistory", JSON.stringify(history));
  }, [dispatch]);

  // ✅ SEARCH
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
      })
    ).then((res) => {
      if (res.payload) {
        navigate("/AiPlanner-details", {
          state: { plan: res.payload },
        });
      }
    });
  };

  // ✅ HISTORY CLICK
  const handleHistoryClick = (plan) => {
    dispatch(loadAiPlan(plan));

    navigate("/AiPlanner-details", {
      state: { plan },
    });
  };

  // ✅ DELETE SINGLE HISTORY
  const handleDelete = (id) => {
    let history = JSON.parse(localStorage.getItem("planHistory")) || [];
    history = history.filter((item) => item.id !== id);

    localStorage.setItem("planHistory", JSON.stringify(history));
    dispatch(loadPlanHistory());
  };

  return (
    <div className="h-screen flex overflow-hidden bg-linear-to-br from-slate-50 via-white to-slate-100">

      {/* ================= SIDEBAR ================= */}
      <div
        className={`bg-white/80 backdrop-blur border-r border-slate-200 transition-all duration-300 shadow-[4px_0_10px_rgba(0,0,0,0.08)] ${
          sidebarOpen ? "w-80" : "w-0"
        } overflow-hidden`}
      >
        <div className="h-full flex flex-col">

          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">AI Planner</p>
                <h2 className="font-semibold text-slate-900">History</h2>
              </div>
            </div>
          </div>

          {/* Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-3">
            {planHistory.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-700">
                  No history yet
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Generate a plan and it will appear here for quick access.
                </p>
              </div>
            )}

            {planHistory.map((item) => (
              <div
                key={item.id}
                className="p-3 mb-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition flex justify-between items-center"
              >
                <div
                  className="cursor-pointer flex-1"
                  onClick={() => handleHistoryClick(item.plan)}
                >
                  <p className="font-semibold text-sm text-slate-900 line-clamp-1">
                    {item.plan[0]?.places?.[0]?.name || "Trip Plan"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {item.plan.length} Days
                  </p>
                </div>

                {/* DELETE BUTTON */}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-slate-400 hover:text-red-600 ml-2 transition"
                  aria-label="Delete plan from history"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between bg-white/70 backdrop-blur border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-10 w-10 grid place-items-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
              aria-label="Toggle history sidebar"
            >
              {sidebarOpen === false ? <FaBars /> : <FaBars className="opacity-30" />}
            </button>

            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
                AI Travel Planner
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Generate a day-by-day itinerary based on city, budget, and trip length.
              </p>
            </div>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* FORM CARD */}
            <form
              onSubmit={handleSubmit}
              className="bg-white/90 backdrop-blur p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5"
            >
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-slate-900">
                  Plan your trip
                </h2>
                <p className="text-sm text-slate-500">
                  Fill in the details and let the planner build your itinerary.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  City
                </label>
                <select
                  value={form.cityId}
                  onChange={(e) =>
                    setForm({ ...form, cityId: e.target.value })
                  }
                  className="w-full border border-slate-200 bg-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a city</option>
                  {cities.map((city) => (
                    <option key={city._id} value={city._id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Budget (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    value={form.budget}
                    onChange={(e) =>
                      setForm({ ...form, budget: e.target.value })
                    }
                    className="w-full border border-slate-200 bg-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={0}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Days
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 3"
                    value={form.days}
                    onChange={(e) =>
                      setForm({ ...form, days: e.target.value })
                    }
                    className="w-full border border-slate-200 bg-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={1}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition font-medium"
              >
                Generate plan
              </button>

              <div className="text-xs text-slate-500">
                Tip: Use the History panel to revisit older plans.
              </div>
            </form>

            {/* AI PREVIEW PANEL */}
            <div className="rrounded-2xl border-slate-200 bg-white/70 backdrop-blur p-4 sm:p-5 shadow-sm border rounded-2xl h-[80vh] overflow-y-auto">
              <AiPlannerDetails embedded />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default AiPlanner;