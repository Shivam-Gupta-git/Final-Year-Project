import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import HeroSearch from "../../components/Hotel/HotelSearch";
import HotelFilter from "../../components/Hotel/HotelFilter";
import MapModal from "../../components/Hotel/Mapmodal ";
import {
  FaStar,
  FaMapMarkerAlt,
  FaWifi,
  FaSwimmingPool,
  FaCar,
  FaUtensils,
  FaHeart,
  FaRegHeart,
  FaFilter,
  FaSortAmountDown,
  FaChevronDown,
  FaShieldAlt,
  FaBolt,
  FaPercent,
} from "react-icons/fa";
import { MdOutlineLocalOffer, MdAir, MdSpa } from "react-icons/md";
import { getPublicActiveHotels } from "../../features/user/hotelSlice";

// ── Amenity icons — matches backend facilities field values ───────────────────
const AMENITY_ICONS = {
  wifi: <FaWifi />,
  pool: <FaSwimmingPool />,
  parking: <FaCar />,
  restaurant: <FaUtensils />,
  ac: <MdAir />,
  spa: <MdSpa />,
};

const SORT_OPTIONS = [
  { label: "Recommended", value: "recommended" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Star Rating", value: "rating" },
  { label: "Newest First", value: "newest" },
];

// ── Sort hotels client-side ───────────────────────────────────────────────────
const sortHotels = (hotels, sortBy) => {
  const arr = [...hotels];
  switch (sortBy) {
    case "price_asc":
      return arr.sort(
        (a, b) => (a.pricePerNight ?? 0) - (b.pricePerNight ?? 0),
      );
    case "price_desc":
      return arr.sort(
        (a, b) => (b.pricePerNight ?? 0) - (a.pricePerNight ?? 0),
      );
    case "rating":
      return arr.sort(
        (a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0),
      );
    case "newest":
      return arr.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      );
    default:
      return arr;
  }
};

// ── Filter hotels client-side by sidebar filters ──────────────────────────────
const applyFilters = (hotels, filters) => {
  let result = [...hotels];

  // Locality search
  if (filters.locality) {
    const q = filters.locality.toLowerCase();
    result = result.filter(
      (h) =>
        h.name?.toLowerCase().includes(q) ||
        h.address?.toLowerCase().includes(q),
    );
  }

  // Price filter
  if (filters.price?.length > 0) {
    result = result.filter((h) => {
      const price = h.pricePerNight ?? 0;
      return filters.price.some((range) => {
        const [min, max] = range.split("-").map(Number);
        if (range === "10000+") return price >= 10000;
        return price >= min && price <= max;
      });
    });
  }

  // Amenities filter — matches backend facilities array
  if (filters.amenities?.length > 0) {
    result = result.filter((h) => {
      const fac = (h.facilities || []).map((f) => f.toLowerCase());
      return filters.amenities.every((a) => fac.includes(a));
    });
  }

  return result;
};

// ── Skeleton card (mobile responsive) ────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 flex flex-col sm:flex-row animate-pulse">
    <div className="w-full sm:w-56 h-44 bg-slate-200 shrink-0" />
    <div className="flex-1 p-4 space-y-3">
      <div className="h-4 bg-slate-200 rounded-lg w-2/3" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
      <div className="flex gap-2 mt-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-6 w-14 bg-slate-100 rounded-lg" />
        ))}
      </div>
    </div>
    <div className="w-full sm:w-36 p-4 border-t sm:border-t-0 sm:border-l border-slate-100 flex flex-row sm:flex-col justify-between items-center sm:items-end gap-3">
      <div className="h-6 bg-slate-200 rounded-lg w-24" />
      <div className="h-9 bg-slate-200 rounded-xl w-24" />
    </div>
  </div>
);

// ── Hotel card ────────────────────────────────────────────────────────────────
const HotelCard = ({ hotel }) => {
  const [wishlist, setWishlist] = useState(false);
  const navigate = useNavigate();

  const images = hotel.images?.length
    ? hotel.images
    : [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
      ];

  // ── Use correct backend field names ──────────────────────────────────────
  const price = hotel.pricePerNight ?? hotel.price ?? 0;
  const rating = hotel.averageRating ?? hotel.rating ?? null;
  const totalReviews = hotel.totalReviews ?? 0;
  const facilities = hotel.facilities?.slice(0, 4) || [];
  const cityName =
    hotel.city?.name || (typeof hotel.city === "string" ? hotel.city : "");
  const discount =
    hotel.originalPrice && price
      ? Math.round(((hotel.originalPrice - price) / hotel.originalPrice) * 100)
      : null;

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col sm:flex-row sm:items-stretch cursor-pointer"
      onClick={() => navigate(`/hotels/${hotel._id}`)}
    >
      {/* Image */}
      <div className="relative w-full sm:w-52 h-44 sm:h-auto shrink-0 overflow-hidden bg-slate-100">
        <img
          src={images[0]}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setWishlist(!wishlist);
          }}
          className="absolute top-3 right-3 w-7 h-7 bg-white/85 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform"
        >
          {wishlist ? (
            <FaHeart className="text-rose-500 text-xs" />
          ) : (
            <FaRegHeart className="text-slate-500 text-xs" />
          )}
        </button>
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
            <FaPercent className="text-[8px]" />
            {discount}% OFF
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-[#1a3a6b] transition-colors line-clamp-1">
              {hotel.name}
            </h3>
            {/* ── Real rating from backend ── */}
            {rating !== null && (
              <div className="flex items-center gap-1 shrink-0 bg-amber-50 border border-amber-200/80 rounded-lg px-2 py-0.5">
                <FaStar className="text-amber-400 text-[10px]" />
                <span className="text-xs font-bold text-amber-700">
                  {Number(rating).toFixed(1)}
                </span>
                {totalReviews > 0 && (
                  <span className="text-[10px] text-slate-400">
                    ({totalReviews})
                  </span>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
            <FaMapMarkerAlt className="text-[#1a3a6b]/50 text-[10px] shrink-0" />
            {/* ── Show address + city name from populated city object ── */}
            <span className="line-clamp-1">
              {[hotel.address, cityName].filter(Boolean).join(", ") ||
                "City Centre"}
            </span>
          </p>

          {/* ── Real facilities from backend ── */}
          {facilities.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {facilities.map((f) => {
                const key = f.toLowerCase().replace(/\s/g, "");
                return (
                  <span
                    key={f}
                    className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg capitalize"
                  >
                    <span className="text-slate-400 text-[9px]">
                      {AMENITY_ICONS[key] ?? <FaWifi />}
                    </span>
                    {f}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {hotel.offers?.length > 0 && (
          <div className="mt-2 flex items-center gap-1 text-emerald-600 text-[11px] font-semibold">
            <MdOutlineLocalOffer className="text-sm" />
            <span className="line-clamp-1">{hotel.offers[0]}</span>
          </div>
        )}
      </div>

      {/* Price block */}
      <div className="sm:w-40 p-4 border-t sm:border-t-0 sm:border-l border-slate-100 flex flex-row sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-3">
        <div className="text-right">
          {hotel.originalPrice && (
            <p className="text-[11px] text-slate-400 line-through">
              ₹{hotel.originalPrice.toLocaleString()}
            </p>
          )}
          {/* ── Use pricePerNight from backend ── */}
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {price > 0 ? `₹${price.toLocaleString()}` : "Price on request"}
          </p>
          {price > 0 && (
            <p className="text-[10px] text-slate-400">per night + taxes</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {hotel.freeCancellation && (
            <span className="hidden sm:flex items-center gap-1 text-emerald-600 text-[10px] font-semibold">
              <FaShieldAlt className="text-[8px]" /> Free cancellation
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/hotels/${hotel._id}`);
            }}
            className="bg-[#1a3a6b] hover:bg-[#14305a] active:scale-95 text-white text-xs font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow hover:shadow-md transition-all whitespace-nowrap"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ cityParam }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center px-4">
    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
      <FaMapMarkerAlt className="text-slate-300 text-2xl" />
    </div>
    <h3 className="text-lg font-bold text-slate-700 mb-2">
      {cityParam ? `No hotels found in "${cityParam}"` : "No hotels found"}
    </h3>
    <p className="text-slate-400 text-sm max-w-xs">
      {cityParam
        ? "Try a different city or remove some filters."
        : "Try searching for a city or adjusting your filters."}
    </p>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
function HotelPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const { hotels = [], loading } = useSelector((s) => s.hotel);
  const cityParam = searchParams.get("city") || "";

  // Fetch whenever city param changes
  useEffect(() => {
    dispatch(getPublicActiveHotels({ city: cityParam }));
  }, [cityParam, dispatch]);

  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState("recommended");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  // ── Apply sidebar filters + sort client-side ──────────────────────────────
  const processedHotels = useMemo(() => {
    const filtered = applyFilters(hotels, filters);
    return sortHotels(filtered, sortBy);
  }, [hotels, filters, sortBy]);

  // Paginate
  const totalCount = processedHotels.length;
  const totalPages = Math.ceil(totalCount / PER_PAGE);
  const pagedHotels = processedHotels.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE,
  );

  const handleFilters = (f) => {
    setFilters(f);
    setPage(1);
  };
  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label;

  // Close sort menu on outside click
  useEffect(() => {
    const h = (e) => {
      if (!e.target.closest("#sort-menu")) setShowSortMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/70">
      {/* Sticky search */}
      <div className="sticky top-0 sm:top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
          <HeroSearch />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex gap-5 items-start">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block shrink-0">
          <HotelFilter
            onFilterChange={handleFilters}
            onMapOpen={() => setMapOpen(true)}
          />
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Results header */}
          <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
            <div>
              {loading ? (
                <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
              ) : (
                <h1 className="text-base sm:text-lg font-bold text-slate-900">
                  <span className="text-[#1a3a6b]">{totalCount}</span> Hotels
                  Found
                  {cityParam && (
                    <span className="text-slate-500 font-normal text-sm sm:text-base ml-1">
                      in {cityParam}
                    </span>
                  )}
                </h1>
              )}
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block">
                Prices include taxes · Free cancellation available
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile filter */}
              <button
                onClick={() => setShowMobileFilter(true)}
                className="lg:hidden flex items-center gap-1.5 border border-slate-200 bg-white px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                <FaFilter className="text-[#1a3a6b] text-[10px]" />
                Filters
                {Object.values(filters).flat().filter(Boolean).length > 0 && (
                  <span className="bg-[#1a3a6b] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {Object.values(filters).flat().filter(Boolean).length}
                  </span>
                )}
              </button>

              {/* Sort */}
              <div className="relative" id="sort-menu">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-1.5 border border-slate-200 bg-white px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
                >
                  <FaSortAmountDown className="text-[#1a3a6b] text-[10px]" />
                  <span className="hidden sm:inline">{sortLabel}</span>
                  <span className="sm:hidden">Sort</span>
                  <FaChevronDown
                    className={`text-[10px] transition-transform ${showSortMenu ? "rotate-180" : ""}`}
                  />
                </button>
                {showSortMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 w-44 py-1 overflow-hidden">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortBy(opt.value);
                          setShowSortMenu(false);
                          setPage(1);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors
                          ${sortBy === opt.value ? "bg-[#1a3a6b]/5 text-[#1a3a6b] font-bold" : "text-slate-700 hover:bg-slate-50"}`}
                      >
                        {sortBy === opt.value && (
                          <span className="mr-1.5">✓</span>
                        )}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Flash deal banner */}
          {!loading && pagedHotels.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/70 rounded-xl px-3 sm:px-4 py-2.5 mb-3 sm:mb-4 text-xs">
              <FaBolt className="text-amber-500 shrink-0" />
              <span className="font-bold text-amber-700">Flash Sale:</span>
              <span className="text-slate-600 line-clamp-1">
                Up to 40% off on select properties today only!
              </span>
            </div>
          )}

          {/* Cards */}
          <div className="space-y-3">
            {loading ? (
              [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
            ) : pagedHotels.length === 0 ? (
              <EmptyState cityParam={cityParam} />
            ) : (
              pagedHotels.map((h) => <HotelCard key={h._id} hotel={h} />)
            )}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-1.5 mt-6 sm:mt-8 flex-wrap">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 sm:px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                ← Prev
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition ${page === i + 1 ? "bg-[#1a3a6b] text-white shadow" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 sm:px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                Next →
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile filter drawer */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowMobileFilter(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-white overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-slate-800">Filters</h2>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 text-lg font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <HotelFilter
                onFilterChange={(f) => {
                  handleFilters(f);
                  setShowMobileFilter(false);
                }}
                onMapOpen={() => {
                  setShowMobileFilter(false);
                  setMapOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Map modal — pass real hotels with coordinates */}
      <MapModal
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        city={cityParam || "India"}
        hotels={hotels
          .filter((h) => h.location?.coordinates?.length === 2)
          .map((h) => ({
            _id: h._id,
            name: h.name,
            price: h.pricePerNight ?? 0,
            lat: h.location.coordinates[1], // GeoJSON: [lng, lat]
            lng: h.location.coordinates[0],
            rating: h.averageRating ?? 0,
            selected: false,
          }))}
      />
    </div>
  );
}

export default HotelPage;
