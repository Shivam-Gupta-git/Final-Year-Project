import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { getAllActiveHotels, getPublicActiveHotels } from "../../features/user/hotelSlice";

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

// ── Skeleton ────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 flex animate-pulse">
    <div className="w-60 h-48 bg-slate-200 shrink-0" />
    <div className="flex-1 p-5 space-y-3">
      <div className="h-4 bg-slate-200 rounded-lg w-2/3" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
      <div className="h-3 bg-slate-100 rounded w-1/3 mt-2" />
      <div className="flex gap-2 mt-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-6 w-16 bg-slate-100 rounded-lg" />
        ))}
      </div>
    </div>
    <div className="w-36 p-5 border-l border-slate-100 flex flex-col justify-between">
      <div className="h-7 bg-slate-200 rounded-lg w-20 ml-auto" />
      <div className="h-9 bg-slate-200 rounded-xl" />
    </div>
  </div>
);

// ── Hotel card ───────────────────────────────────────────────────────────────
const HotelCard = ({ hotel }) => {
  const [wishlist, setWishlist] = useState(false);
  const images = hotel.images?.length
    ? hotel.images
    : [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
      ];
  const amenities = hotel.amenities?.slice(0, 4) || [
    "wifi",
    "pool",
    "parking",
    "restaurant",
  ];
  const discount = hotel.originalPrice
    ? Math.round(
        ((hotel.originalPrice - hotel.price) / hotel.originalPrice) * 100,
      )
    : null;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col md:flex-row">
      {/* Image */}
      <div className="relative w-full md:w-56 h-48 md:h-auto shrink-0 overflow-hidden bg-slate-100">
        <img
          src={images[0]}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button
          onClick={() => setWishlist(!wishlist)}
          className="absolute top-3 right-3 w-7 h-7 bg-white/85 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform"
        >
          {wishlist ? (
            <FaHeart className="text-rose-500 text-xs" />
          ) : (
            <FaRegHeart className="text-slate-500 text-xs" />
          )}
        </button>
        {discount && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
            <FaPercent className="text-[8px]" />
            {discount}% OFF
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 p-4 md:p-5 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-[#1a3a6b] transition-colors line-clamp-1">
              {hotel.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0 bg-amber-50 border border-amber-200/80 rounded-lg px-2 py-0.5">
              <FaStar className="text-amber-400 text-[10px]" />
              <span className="text-xs font-bold text-amber-700">
                {hotel.rating ?? "4.2"}
              </span>
              <span className="text-[10px] text-slate-400">
                ({hotel.reviews ?? "248"})
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
            <FaMapMarkerAlt className="text-[#1a3a6b]/50 text-[10px] shrink-0" />
            <span className="line-clamp-1">
              {hotel.address ?? hotel.city ?? "City Centre"}
            </span>
          </p>

          {hotel.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {hotel.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] bg-[#1a3a6b]/5 text-[#1a3a6b] border border-[#1a3a6b]/15 px-2 py-0.5 rounded-full font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {amenities.map((key) => (
              <span
                key={key}
                className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg"
              >
                <span className="text-slate-400 text-[9px]">
                  {AMENITY_ICONS[key] ?? <FaWifi />}
                </span>
                <span className="capitalize">{key}</span>
              </span>
            ))}
          </div>
        </div>

        {hotel.offers?.length > 0 && (
          <div className="mt-3 flex items-center gap-1 text-emerald-600 text-[11px] font-semibold">
            <MdOutlineLocalOffer className="text-sm" />
            <span>{hotel.offers[0]}</span>
          </div>
        )}
      </div>

      {/* Price block */}
      <div className="md:w-40 p-4 md:p-5 md:border-l border-t md:border-t-0 border-slate-100 flex flex-row md:flex-col justify-between md:justify-start items-center md:items-end gap-3">
        <div className="text-right">
          {hotel.originalPrice && (
            <p className="text-[11px] text-slate-400 line-through mb-0.5">
              ₹{hotel.originalPrice.toLocaleString()}
            </p>
          )}
          <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
            ₹{(hotel.price ?? 3499).toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">per night + taxes</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {hotel.freeCancellation && (
            <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-semibold">
              <FaShieldAlt className="text-[8px]" /> Free cancellation
            </span>
          )}
          <button className="bg-[#1a3a6b] hover:bg-[#14305a] active:scale-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow hover:shadow-md transition-all whitespace-nowrap">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
      <FaMapMarkerAlt className="text-slate-300 text-2xl" />
    </div>
    <h3 className="text-lg font-bold text-slate-700 mb-2">No hotels found</h3>
    <p className="text-slate-400 text-sm max-w-xs">
      Try adjusting your filters or search a different city.
    </p>
  </div>
);

// ── Main page ────────────────────────────────────────────────────────────────
function HotelPage() {
  const dispatch = useDispatch();

  // ── Replace these with Redux when backend ready ─────────────────────────
  // const { hotels, loading, totalCount } = useSelector(s => s.hotel);
  const { hotels = [], loading } = useSelector((s) => s.hotel);
  const totalCount = hotels?.length || 0;
  console.log(hotels);
  

  useEffect(() => {
    dispatch(getPublicActiveHotels());
  }, [dispatch]);

  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState("recommended");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const handleFilters = (f) => {
    setFilters(f);
    setPage(1);
  };
  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label;

  return (
    <div className="min-h-screen bg-slate-50/70">
      {/* Sticky search */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <HeroSearch />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-5 items-start">
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
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              {loading ? (
                <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
              ) : (
                <h1 className="text-lg font-bold text-slate-900">
                  <span className="text-[#1a3a6b]">{totalCount}</span> Hotels
                  Found
                  {filters.city && (
                    <span className="text-slate-500 font-normal text-base ml-1">
                      in {filters.city}
                    </span>
                  )}
                </h1>
              )}
              <p className="text-[11px] text-slate-400 mt-0.5">
                Prices include taxes · Free cancellation available
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMobileFilter(true)}
                className="lg:hidden flex items-center gap-1.5 border border-slate-200 bg-white px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                <FaFilter className="text-[#1a3a6b] text-[10px]" /> Filters
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-2 border border-slate-200 bg-white px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
                >
                  <FaSortAmountDown className="text-[#1a3a6b] text-[10px]" />
                  {sortLabel}
                  <FaChevronDown
                    className={`text-[10px] transition-transform ${showSortMenu ? "rotate-180" : ""}`}
                  />
                </button>
                {showSortMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 w-48 py-1 overflow-hidden">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortBy(opt.value);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs transition-colors
                          ${sortBy === opt.value ? "bg-[#1a3a6b]/5 text-[#1a3a6b] font-bold" : "text-slate-700 hover:bg-slate-50"}`}
                      >
                        {sortBy === opt.value && (
                          <span className="mr-1.5 text-[#1a3a6b]">✓</span>
                        )}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Flash deal */}
          {!loading && hotels.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/70 rounded-xl px-4 py-2.5 mb-4 text-xs">
              <FaBolt className="text-amber-500 shrink-0" />
              <span className="font-bold text-amber-700">Flash Sale:</span>
              <span className="text-slate-600">
                Up to 40% off on select properties today only!
              </span>
            </div>
          )}

          {/* Cards */}
          <div className="space-y-3">
            {loading ? (
              [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
            ) : hotels.length === 0 ? (
              <EmptyState />
            ) : (
              hotels.map((h) => <HotelCard key={h._id} hotel={h} />)
            )}
          </div>

          {/* Pagination */}
          {!loading && totalCount > PER_PAGE && (
            <div className="flex justify-center items-center gap-1.5 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                ← Prev
              </button>
              {[...Array(Math.ceil(totalCount / PER_PAGE))].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition ${page === i + 1 ? "bg-[#1a3a6b] text-white shadow" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setPage((p) =>
                    Math.min(Math.ceil(totalCount / PER_PAGE), p + 1),
                  )
                }
                disabled={page === Math.ceil(totalCount / PER_PAGE)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
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
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-slate-50 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Filters</h2>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
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

      {/* Map modal */}
      <MapModal
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        city={filters.city || "Goa"}
        hotels={[]}
      />
    </div>
  );
}

export default HotelPage;
