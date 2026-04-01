import { useSelector } from "react-redux";
import {
  selectPlaces,
  selectNearbyPlaces,
  selectUsingNearby,
  selectDistanceRadius,
  selectSelectedCity,
} from "../../features/user/placeSlice";

const CITY_IMAGES = {
  Delhi:     "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=80",
  Mumbai:    "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=1200&q=80",
  "New York":"https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?w=1200&q=80",
  London:    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80",
  Paris:     "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=1200&q=80",
  Tokyo:     "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80",
  Sydney:    "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&q=80",
  Bangalore: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&q=80",
  Jaipur:    "https://images.unsplash.com/photo-1477587458883-47145ed6979e?w=1200&q=80",
  Goa:       "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=80",
};

const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80";

const KM_MAP = {
  5: "5",
  20: "20",
  50: "50",
  100: "100",
};

export default function PlaceHeader({ cityName }) {
  const places      = useSelector(selectPlaces);
  const nearby      = useSelector(selectNearbyPlaces);
  const usingNearby = useSelector(selectUsingNearby);
  const radius      = useSelector(selectDistanceRadius);
  const selectedCity= useSelector(selectSelectedCity);

  const count   = usingNearby ? nearby.length : places.length;
  const heroImg = CITY_IMAGES[cityName] || DEFAULT_IMG;
  const state   = selectedCity?.state ? `, ${selectedCity.state}` : "";
  const radiusKm= KM_MAP[radius] || Math.round(radius);

  return (
    <div className="relative h-64 sm:h-80 overflow-hidden bg-gray-900">
      {/* Hero image */}
      <img
        src={heroImg}
        alt={cityName}
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Breadcrumb */}
      <div className="absolute top-4 left-4 sm:left-6">
        <nav className="flex items-center gap-1.5 text-xs text-white/60">
          <span>Explore</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span className="text-white/80">{cityName}</span>
        </nav>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          {/* Nearby mode banner */}
          {usingNearby && (
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 backdrop-blur-sm
                            border border-emerald-400/30 text-emerald-300 text-xs font-semibold
                            px-3 py-1 rounded-full mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Showing places within {radiusKm} km of your location
            </div>
          )}

          <h1 className="text-white font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight
                         tracking-tight drop-shadow-sm">
            {cityName}
            {state && (
              <span className="font-normal text-white/60 text-xl sm:text-2xl">{state}</span>
            )}
          </h1>

          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <p className="text-white/70 text-sm font-medium">
              {count > 0
                ? `${count} ${count === 1 ? "place" : "places"} ${usingNearby ? "nearby" : "available"}`
                : "Fetching places…"}
            </p>

            {selectedCity?.categories?.length > 0 && (
              <>
                <span className="text-white/30">•</span>
                <p className="text-white/50 text-xs">
                  {selectedCity.categories.slice(0, 4).join(" · ")}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}