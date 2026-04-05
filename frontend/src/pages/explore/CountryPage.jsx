import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../services/apiClient";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80";

export default function CountryPage() {
  const { name } = useParams();
  const navigate = useNavigate();

  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const countryName = useMemo(
    () => decodeURIComponent(name || "").trim(),
    [name],
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await apiClient.get(
          `/api/city/activecity?country=${encodeURIComponent(countryName)}`,
        );
        const payload = res?.data ?? res;
        const list = Array.isArray(payload) ? payload : payload?.data ?? [];
        if (alive) setCities(list);
      } catch (e) {
        if (alive) {
          setError(
            e.response?.data?.message || "Failed to load cities for this country",
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [countryName]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Country
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {countryName}
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              Choose a city to explore places, or switch to nearby mode later.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/explore")}
            className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl"
          >
            ← Back to map
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-3xl bg-slate-100 animate-pulse border border-slate-200"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm text-rose-600">
            {error}
          </div>
        ) : cities.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center">
            <p className="text-slate-800 font-bold">No active cities found</p>
            <p className="text-sm text-slate-500 mt-1">
              Add/approve cities for this country in the admin panel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cities.map((city) => (
              <button
                key={city._id}
                type="button"
                onClick={() => navigate(`/city/${city._id}/places`)}
                className="group text-left rounded-3xl overflow-hidden border border-slate-200 bg-white hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="relative h-28 bg-slate-100 overflow-hidden">
                  <img
                    src={city.images?.[0] || FALLBACK_IMG}
                    alt={city.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="text-white font-extrabold text-lg leading-tight line-clamp-1">
                      {city.name}
                    </p>
                    <p className="text-white/70 text-xs font-semibold uppercase tracking-wide">
                      {city.state}
                    </p>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {city.famousFor || city.description || "Discover places here."}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      Active
                    </span>
                    <span className="text-sm font-semibold text-rose-500">
                      Explore →
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

