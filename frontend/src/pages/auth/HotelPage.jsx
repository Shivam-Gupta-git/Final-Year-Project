import { motion } from "framer-motion";
import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaBolt,
  FaCar,
  FaChevronDown,
  FaFilter,
  FaHeart,
  FaMapMarkerAlt,
  FaMoon,
  FaPercent,
  FaRegHeart,
  FaShieldAlt,
  FaSortAmountDown,
  FaStar,
  FaSwimmingPool,
  FaUtensils,
  FaWifi,
} from "react-icons/fa";
import { MdAir, MdOutlineLocalOffer, MdSpa } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import HotelFilter from "../../components/Hotel/HotelFilter";
import HeroSearch from "../../components/Hotel/HotelSearch";
import MapModal from "../../components/Hotel/Mapmodal ";
import {
  getPublicActiveHotels,
  getRoomsAvailabilityBulk,
  searchHotel,
} from "../../features/user/hotelSlice";
import { useWishlist } from "../../components/WishlistContext";

/* ─── unchanged constants ─── */
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

const getNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 1;
  const diff = new Date(checkOut) - new Date(checkIn);
  const nights = Math.round(diff / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 1;
};

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

const applyFilters = (
  hotels,
  filters,
  bulkAvailability = {},
  requestedRooms = 0,
  requestedAdults = 0,
) => {
  let result = [...hotels];
  if (filters.locality) {
    const q = filters.locality.toLowerCase();
    result = result.filter(
      (h) =>
        h.name?.toLowerCase().includes(q) ||
        h.address?.toLowerCase().includes(q),
    );
  }
  if (filters.price?.length === 2) {
    result = result.filter((h) => {
      const price = h.pricePerNight ?? 0;
      const maxBound = filters.price[1] >= 20000 ? Infinity : filters.price[1];
      return price >= filters.price[0] && price <= maxBound;
    });
  }

  if (filters.suggested?.length > 0) {
    result = result.filter((h) => {
      return filters.suggested.every((s) => {
        switch (s) {
          case "Rush Deal":
          case "Last Minute Deals":
            return h.originalPrice && h.pricePerNight < h.originalPrice;
          case "5 Star":
            return h.starCategory === 5;
          case "4 Star":
            return h.starCategory === 4;
          case "3 Star":
            return h.starCategory === 3;
          case "Breakfast Included":
            return h.facilities?.some((f) =>
              f.toLowerCase().includes("breakfast"),
            );
          case "Free Cancellation":
            return h.freeCancellation === true;
          case "Couple Friendly":
            return h.tags?.some((t) => t.toLowerCase().includes("couple"));
          default:
            return true;
        }
      });
    });
  }
  if (filters.amenities?.length > 0) {
    result = result.filter((h) => {
      const fac = (h.facilities || []).map((f) => f.toLowerCase());
      return filters.amenities.every((a) => fac.includes(a));
    });
  }
  if (filters.stars?.length > 0) {
    result = result.filter((h) => filters.stars.includes(h.starCategory));
  }
  if (requestedRooms > 0 || requestedAdults > 0) {
    result = result.filter((h) => {
      const hotelAvail = bulkAvailability[h._id];
      if (!hotelAvail) return true;
      const { availableRooms, maxCapacityPerRoom } = hotelAvail;
      if (requestedRooms > 0 && availableRooms < requestedRooms) return false;
      if (requestedAdults > 0 && requestedRooms > 0) {
        const adultsPerRoom = Math.ceil(requestedAdults / requestedRooms);
        if (adultsPerRoom > maxCapacityPerRoom) return false;
      }
      return true;
    });
  }
  return result;
};

/* ─── SkeletonCard ─── */
const SkeletonCard = ({ index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.97 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{
      duration: 0.5,
      delay: index * 0.08,
      ease: [0.25, 0.1, 0.25, 1],
    }}
    className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 flex flex-col sm:flex-row animate-pulse min-h-80 sm:min-h-42.5 shadow-sm"
  >
    <div className="w-full sm:w-52 h-44 sm:h-full bg-slate-100 shrink-0" />
    <div className="flex-1 p-4 space-y-3">
      <div className="h-4 bg-slate-100 rounded w-2/3" />
      <div className="h-3 bg-slate-50 rounded w-1/2" />
      <div className="flex gap-2 mt-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-6 w-14 bg-slate-100 rounded-lg" />
        ))}
      </div>
    </div>
    <div className="w-36 p-4 border-l border-slate-100 hidden sm:flex flex-col justify-between items-end">
      <div className="h-6 bg-slate-100 rounded w-20" />
      <div className="h-9 bg-slate-100 rounded-xl w-24" />
    </div>
  </motion.div>
);

/* ─── StarDisplay ─── */
const StarDisplay = ({ count }) => {
  if (!count) return null;
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(Math.min(5, count))].map((_, i) => (
        <FaStar key={i} className="text-amber-400 text-[9px]" />
      ))}
    </div>
  );
};

/* ─── HotelCard ─── */
const HotelCard = ({
  hotel,
  nights = 1,
  availableRooms,
  maxCapacityPerRoom,
  requestedRooms = 0,
  requestedAdults = 0,
  index = 0,
}) => {
  const isSoldOut = availableRooms === 0;
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const wishlisted = isInWishlist("hotels", hotel._id);
  const navigate = useNavigate();

  const images = hotel.images?.length
    ? hotel.images
    : [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
      ];
  const price = hotel.pricePerNight ?? hotel.price ?? 0;
  const totalPrice = price * nights;
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
    <motion.div
      viewport={{ once: false, margin: "-10% 0px -10% 0px" }}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-200/70 hover:border-blue-200 transition-all duration-300 flex flex-col sm:flex-row cursor-pointer shadow-[0_2px_12px_rgba(100,130,180,0.08)] hover:shadow-[0_8px_32px_rgba(99,130,200,0.18)] will-change-transform"
      onClick={() => {
        sessionStorage.setItem("hotelListScroll", window.scrollY);
        navigate(`/hotels/${hotel._id}`);
      }}
    >
      {/* Image */}
      <div className="relative w-full sm:w-52 h-48 sm:h-48 shrink-0 overflow-hidden bg-slate-100">
        <img
          src={images[0]}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (wishlisted) {
              removeFromWishlist("hotels", hotel._id);
            } else {
              addToWishlist("hotels", {
                _id: hotel._id,
                name: hotel.name,
                image: images[0],
                location:
                  [hotel.address, cityName].filter(Boolean).join(", ") ||
                  "City Centre",
                rating: rating ?? 0,
                price: price,
              });
            }
          }}
          className="absolute top-3 right-3 w-7 h-7 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-10 hover:bg-white"
        >
          {wishlisted ? (
            <FaHeart className="text-rose-500 text-xs" />
          ) : (
            <FaRegHeart className="text-slate-400 text-xs" />
          )}
        </button>

        {isSoldOut && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-white/90 border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              Sold Out
            </span>
          </div>
        )}

        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-linear-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 z-10 shadow-md">
            <FaPercent className="text-[8px]" />
            {discount}% OFF
          </div>
        )}

        {hotel.images?.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/30 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md backdrop-blur-sm">
            +{hotel.images.length} photos
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug group-hover:text-[#c67c4e] transition-colors duration-200 line-clamp-1">
                {hotel.name}
              </h3>
              {hotel.starCategory && <StarDisplay count={hotel.starCategory} />}
            </div>

            {rating !== null && rating > 0 && (
              <div className="flex items-center gap-1 shrink-0 bg-blue-50 border border-blue-100 rounded-lg px-2 py-1">
                <FaStar className="text-amber-400 text-[10px]" />
                <span className="text-xs font-bold text-slate-700">
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

          <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-2.5">
            <FaMapMarkerAlt className="text-blue-400 text-[10px] shrink-0" />
            <span className="line-clamp-1">
              {[hotel.address, cityName].filter(Boolean).join(", ") ||
                "City Centre"}
            </span>
          </p>

          {facilities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {facilities.map((f) => {
                const key = f.toLowerCase().replace(/\s/g, "");
                return (
                  <span
                    key={f}
                    className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg capitalize hover:bg-blue-50 hover:border-blue-100 hover:text-blue-600 transition-colors"
                  >
                    <span className="text-blue-400 text-[9px]">
                      {AMENITY_ICONS[key] ?? <FaWifi />}
                    </span>
                    {f}
                  </span>
                );
              })}
            </div>
          )}

          {requestedAdults > 0 &&
            requestedRooms > 0 &&
            maxCapacityPerRoom &&
            (() => {
              const adultsPerRoom = Math.ceil(requestedAdults / requestedRooms);
              if (adultsPerRoom > maxCapacityPerRoom) {
                return (
                  <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1">
                    <span>⚠️</span> Room capacity: {maxCapacityPerRoom} adults
                    max
                  </p>
                );
              }
              return null;
            })()}

          {availableRooms !== undefined &&
            availableRooms > 0 &&
            availableRooms <= 7 && (
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1.5
                ${
                  availableRooms <= 3
                    ? "text-rose-600 bg-rose-50 border-rose-200"
                    : "text-amber-600 bg-amber-50 border-amber-200"
                }`}
              >
                {availableRooms <= 3 ? "🔥 " : ""}Only {availableRooms} rooms
                left!
              </span>
            )}

          {hotel.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {hotel.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {hotel.offers?.length > 0 && (
          <div className="mt-2 flex items-center gap-1 text-emerald-600 text-[11px] font-semibold">
            <MdOutlineLocalOffer className="text-sm shrink-0" />
            <span className="line-clamp-1">{hotel.offers[0]}</span>
          </div>
        )}
      </div>

      {/* Price panel */}
      <div className="sm:w-44 p-4 border-t sm:border-t-0 sm:border-l border-slate-100 group-hover:border-blue-100 flex flex-row sm:flex-col justify-between sm:justify-start items-start sm:items-end gap-3 transition-colors bg-linear-to-b from-white to-slate-50/60">
        <div className="text-left sm:text-right">
          {hotel.originalPrice && (
            <p className="text-[11px] text-slate-400 line-through">
              ₹{hotel.originalPrice.toLocaleString()}
            </p>
          )}

          <p
            className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight"
            style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
          >
            {price > 0 ? `₹${price.toLocaleString()}` : "On request"}
          </p>
          {price > 0 && (
            <p className="text-[10px] text-slate-400">per night + taxes</p>
          )}

          {price > 0 && nights > 1 && (
            <p className="text-[11px] text-blue-500 font-semibold mt-1 flex items-center justify-end gap-1">
              <FaMoon className="text-[9px]" />₹{totalPrice.toLocaleString()} ·{" "}
              {nights} nights
            </p>
          )}
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
          {hotel.freeCancellation && (
            <span className="hidden sm:flex items-center gap-1 text-emerald-500 text-[10px] font-semibold whitespace-nowrap">
              <FaShieldAlt className="text-[8px]" /> Free cancellation
            </span>
          )}
          <button
            disabled={isSoldOut}
            onClick={(e) => {
              e.stopPropagation();
              if (!isSoldOut) {
                sessionStorage.setItem("hotelListScroll", window.scrollY);
                navigate(`/hotels/${hotel._id}`);
              }
            }}
            className={`text-white text-xs font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow-sm transition-all duration-200 whitespace-nowrap min-w-27.5
            ${
              isSoldOut
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-linear-to-r from-[#c67c4e] to-[#b86c3d] hover:from-[#b06d42] hover:to-[#9e5b33] active:scale-95 shadow-[0_8px_24px_rgba(198,124,78,0.35)] hover:shadow-[0_8px_24px_rgba(198,124,78,0.5)]"
            }`}
          >
            {isSoldOut ? "Sold Out" : "Book Now"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── EmptyState ─── */
const EmptyState = ({ cityParam }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-20 text-center px-4 bg-white border border-slate-200 rounded-2xl shadow-sm"
  >
    <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mb-4">
      <FaMapMarkerAlt className="text-blue-300 text-2xl" />
    </div>
    <h3 className="text-lg font-bold text-slate-700 mb-2">
      {cityParam ? `No hotels found in "${cityParam}"` : "No hotels found"}
    </h3>
    <p className="text-slate-400 text-sm max-w-xs">
      {cityParam
        ? "Try a different city or remove some filters."
        : "Try searching for a city or adjusting your filters."}
    </p>
  </motion.div>
);

/* ─── HotelPage ─── */
function HotelPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    hotels = [],
    loading,
    bulkAvailability = {},
  } = useSelector((s) => s.hotel);

  const cityParam = searchParams.get("city") || "";
  const checkInParam = searchParams.get("checkIn") || "";
  const checkOutParam = searchParams.get("checkOut") || "";
  const roomsParam = searchParams.get("rooms") || "";
  const adultsParam = searchParams.get("adults") || "";
  const childrenParam = searchParams.get("children") || "";

  const nights = getNights(checkInParam, checkOutParam);

  // ── SCROLL RESTORATION ──────────────────────────────────────────────────────

  // 1. On mount: scroll to top only if NOT returning from a hotel detail page
  useEffect(() => {
    const saved = sessionStorage.getItem("hotelListScroll");
    if (!saved) {
      window.scrollTo(0, 0);
    }
  }, []);

  // 2. After hotels finish loading: restore saved scroll position.
  //    Must wait for loading=false so the cards are in the DOM and the page
  //    is tall enough. Double rAF lets Lenis finish its own render cycle first.
  const lenis = useLenis();
  const scrollRestored = useRef(false);
  const isRestoringScroll = useRef(false);
  useEffect(() => {
    if (loading) return;
    if (scrollRestored.current) return;

    const saved = sessionStorage.getItem("hotelListScroll");

    if (!saved) return;

    scrollRestored.current = true;
    isRestoringScroll.current = true;

    sessionStorage.removeItem("hotelListScroll");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (lenis) {
          lenis.scrollTo(parseInt(saved, 10), {
            immediate: true,
          });
        } else {
          window.scrollTo(0, parseInt(saved, 10));
        }

        setTimeout(() => {
          isRestoringScroll.current = false;
        }, 200);
      });
    });
  }, [loading, lenis]);

  // ── END SCROLL RESTORATION ──────────────────────────────────────────────────

  useEffect(() => {
    if (cityParam) {
      dispatch(
        searchHotel({
          city: cityParam,
          checkIn: checkInParam,
          checkOut: checkOutParam,
          rooms: roomsParam,
          adults: adultsParam,
          children: childrenParam,
        }),
      );
    } else {
      dispatch(getPublicActiveHotels());
    }
  }, [
    cityParam,
    checkInParam,
    checkOutParam,
    roomsParam,
    adultsParam,
    childrenParam,
    dispatch,
  ]);

  useEffect(() => {
    if (hotels.length > 0 && checkInParam && checkOutParam) {
      dispatch(
        getRoomsAvailabilityBulk({
          hotelIds: hotels.map((h) => h._id),
          checkIn: checkInParam,
          checkOut: checkOutParam,
        }),
      );
    }
  }, [hotels, checkInParam, checkOutParam, dispatch]);

  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState("recommended");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const PER_PAGE = 10;
  const requestedRooms = Number(roomsParam) || 0;
  const requestedAdults = Number(adultsParam) || 0;

  // ── PAGE (URL-based) ────────────────────────────────────────────────────────
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const setPage = (newPage) => {
    const next = typeof newPage === "function" ? newPage(page) : newPage;
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.set("page", String(next));
        return p;
      },
      { replace: false },
    );
  };

  // 3. Page-change scroll: skip on first render (back navigation), then scroll
  //    to top whenever the user actually changes page.
  const isFirstPageRender = useRef(true);
  useEffect(() => {
    if (isFirstPageRender.current) {
      isFirstPageRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // ── END PAGE ────────────────────────────────────────────────────────────────

  const processedHotels = useMemo(
    () =>
      sortHotels(
        applyFilters(
          hotels,
          filters,
          bulkAvailability,
          requestedRooms,
          requestedAdults,
        ),
        sortBy,
      ),
    [
      hotels,
      filters,
      sortBy,
      bulkAvailability,
      requestedRooms,
      requestedAdults,
    ],
  );
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

  useEffect(() => {
    const h = (e) => {
      if (!e.target.closest("#sort-menu")) setShowSortMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <ReactLenis root options={{ lerp: 0.08, smoothWheel: true }}>
      <div
        className="min-h-screen font-sans selection:bg-blue-200/60 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, #eef3fb 0%, #e8f0f9 40%, #dfe9f5 70%, #d8e4f2 100%)",
        }}
      >
        {/* Soft floating ambient blobs – very low opacity, no interactivity */}
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

        {/* ── Sticky Search Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="sticky top-0 sm:top-1 z-40 backdrop-blur-xl border-b border-white/60"
          style={{
            background: "rgba(238,243,251,0.85)",
            boxShadow: "0 2px 20px rgba(100,130,180,0.10)",
          }}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
            <HeroSearch />
          </div>
        </motion.div>

        {/* ── Main Layout ── */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex gap-5 items-start relative z-10">
          {/* Desktop Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="hidden lg:block shrink-0"
          >
            <div
              className="rounded-2xl overflow-hidden border border-white/70"
              style={{
                background: "rgba(255,255,255,0.72)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 4px 24px rgba(100,130,180,0.10)",
              }}
            >
              <HotelFilter
                onFilterChange={handleFilters}
                onMapOpen={() => setMapOpen(true)}
              />
            </div>
          </motion.aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Results header */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
              className="flex items-start sm:items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2"
            >
              <div className="min-w-0">
                {loading ? (
                  <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
                ) : (
                  <>
                    <h1 className="text-base sm:text-lg font-extrabold text-slate-800">
                      <span className="text-[#c67c4e]">{totalCount}</span>{" "}
                      Hotels Found
                      {cityParam && (
                        <span className="text-slate-400 font-normal text-sm sm:text-base ml-2">
                          in <span className="text-slate-700">{cityParam}</span>
                        </span>
                      )}
                    </h1>
                    {cityParam && (checkInParam || adultsParam) && (
                      <p className="text-[11px] text-slate-400 mt-1 font-medium">
                        {checkInParam &&
                          checkOutParam &&
                          `${new Date(checkInParam).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                            },
                          )} → ${new Date(checkOutParam).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                            },
                          )} · `}
                        {nights > 1 && `${nights} nights · `}
                        {roomsParam && `${roomsParam} Room · `}
                        {adultsParam && `${adultsParam} Adults`}
                        {childrenParam > 0 && ` · ${childrenParam} Children`}
                      </p>
                    )}
                    {!cityParam && (
                      <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 hidden sm:block">
                        Prices include taxes · Free cancellation available on
                        select rates
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {/* Mobile filter button */}
                <button
                  onClick={() => setShowMobileFilter(true)}
                  className="lg:hidden flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 transition-colors shadow-sm"
                >
                  <FaFilter className="text-blue-500 text-[10px]" />
                  Filters
                  {Object.values(filters).flat().filter(Boolean).length > 0 && (
                    <span className="bg-linear-to-r from-blue-500 to-indigo-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                      {Object.values(filters).flat().filter(Boolean).length}
                    </span>
                  )}
                </button>

                {/* Sort dropdown */}
                <div className="relative" id="sort-menu">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 transition-colors shadow-sm"
                  >
                    <FaSortAmountDown className="text-blue-500 text-[10px]" />
                    <span className="hidden sm:inline">{sortLabel}</span>
                    <span className="sm:hidden">Sort</span>
                    <FaChevronDown
                      className={`text-[10px] text-slate-400 transition-transform duration-200 ${
                        showSortMenu ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {showSortMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 top-full mt-2 border border-slate-200 rounded-xl z-30 w-48 py-1.5 overflow-hidden"
                      style={{
                        background: "rgba(255,255,255,0.96)",
                        backdropFilter: "blur(20px)",
                        boxShadow: "0 8px 32px rgba(100,130,180,0.18)",
                      }}
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSortBy(opt.value);
                            setShowSortMenu(false);
                            setPage(1);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs transition-colors
                            ${
                              sortBy === opt.value
                                ? "bg-blue-50 text-blue-600 font-bold"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                            }`}
                        >
                          {sortBy === opt.value && (
                            <span className="mr-1.5">✓</span>
                          )}
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Flash deal banner */}
            {!loading && pagedHotels.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="flex items-center gap-2 border border-blue-100 rounded-xl px-3 sm:px-4 py-2.5 mb-3 sm:mb-4 text-xs shadow-sm"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(219,234,254,0.7) 0%, rgba(224,231,255,0.5) 100%)",
                }}
              >
                <FaBolt className="text-blue-500 shrink-0" />
                <span className="font-bold text-slate-700">Flash Sale:</span>
                <span className="text-slate-500 line-clamp-2 sm:line-clamp-1">
                  Up to 40% off on select properties today only!
                </span>
              </motion.div>
            )}

            {/* Hotel Cards */}
            <div className="space-y-3">
              {loading ? (
                [...Array(3)].map((_, i) => <SkeletonCard key={i} index={i} />)
              ) : pagedHotels.length === 0 ? (
                <EmptyState cityParam={cityParam} />
              ) : (
                pagedHotels.map((h, i) => (
                  <HotelCard
                    key={h._id}
                    hotel={h}
                    nights={nights}
                    index={i}
                    availableRooms={bulkAvailability[h._id]?.availableRooms}
                    maxCapacityPerRoom={
                      bulkAvailability[h._id]?.maxCapacityPerRoom
                    }
                    requestedRooms={requestedRooms}
                    requestedAdults={requestedAdults}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex justify-center items-center gap-1.5 mt-8 flex-wrap pb-10"
              >
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 sm:px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
                >
                  ← Prev
                </button>

                <div className="flex items-center gap-1.5 overflow-x-auto max-w-[55vw] sm:max-w-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 ${
                        page === i + 1
                          ? "bg-linear-to-br from-blue-500 to-indigo-500 text-white shadow-[0_4px_12px_rgba(99,102,241,0.35)] border border-blue-400"
                          : "border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 shadow-sm"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 sm:px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
                >
                  Next →
                </button>
              </motion.div>
            )}
          </main>
        </div>

        {/* ── Mobile filter bottom sheet ── */}
        {showMobileFilter && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
              onClick={() => setShowMobileFilter(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-sm border-l border-white/70 flex flex-col"
              style={{
                background: "rgba(241,247,255,0.97)",
                backdropFilter: "blur(20px)",
                boxShadow: "-8px 0 40px rgba(100,130,180,0.18)",
              }}
            >
              <div
                className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0"
                style={{ background: "rgba(255,255,255,0.9)" }}
              >
                <h2 className="font-bold text-slate-800">Filters</h2>
                <button
                  onClick={() => setShowMobileFilter(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
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
            </motion.div>
          </div>
        )}

        {/* Map Modal */}
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
              lat: h.location.coordinates[1],
              lng: h.location.coordinates[0],
              rating: h.averageRating ?? 0,
              selected: false,
            }))}
        />
      </div>
    </ReactLenis>
  );
}

export default HotelPage;
