import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const COUNTRIES = [
  { name: "India", top: "55%", left: "62%" },
  { name: "United States", top: "40%", left: "22%" },
  { name: "United Kingdom", top: "32%", left: "46%" },
  { name: "France", top: "36%", left: "48%" },
  { name: "Japan", top: "45%", left: "78%" },
  { name: "Australia", top: "72%", left: "82%" },
];  

export default function WorldMapPage() {
  const navigate = useNavigate();

  const pinned = useMemo(() => COUNTRIES, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Explore the world
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
            Pick a country to discover cities and places. You can later switch
            to “Use My Location” and filter by distance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* “Map” panel */}
          <div className="lg:col-span-8">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.18),transparent_40%),radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.15),transparent_45%)]" />
              <div className="relative aspect-[16/9]">
                {/* simple grid “world” background */}
                <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] [background-size:32px_32px]" />

                {/* pins */}
                {pinned.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() =>
                      navigate(`/country/${encodeURIComponent(c.name)}`)
                    }
                    style={{ top: c.top, left: c.left }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  >
                    <span className="flex items-center gap-2 rounded-full bg-slate-900/80 text-white px-3 py-1.5 text-xs font-semibold backdrop-blur-sm shadow-md shadow-slate-900/10 border border-white/10">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                      </span>
                      {c.name}
                      <span className="opacity-70 group-hover:opacity-100">
                        →
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                <p className="text-xs sm:text-sm text-slate-500">
                  Tip: This is a lightweight interactive map. You can add a real
                  SVG map later without changing the country/city flow.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/country/${encodeURIComponent("India")}`)
                  }
                  className="text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 px-4 py-2 rounded-xl shadow-sm shadow-rose-200"
                >
                  Explore India
                </button>
              </div>
            </div>
          </div>

          {/* Country list */}
          <div className="lg:col-span-4">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Countries</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Click to see active cities.
                </p>
              </div>

              <div className="p-3 space-y-2">
                {pinned.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() =>
                      navigate(`/country/${encodeURIComponent(c.name)}`)
                    }
                    className="w-full flex items-center justify-between rounded-2xl px-4 py-3 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 transition-colors"
                  >
                    <span className="text-sm font-semibold text-slate-800">
                      {c.name}
                    </span>
                    <span className="text-sm text-slate-400">Browse →</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
