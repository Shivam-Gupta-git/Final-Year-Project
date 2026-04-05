import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import { ReactLenis } from "lenis/react";
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
  FaMoon,
} from "react-icons/fa";
import { MdOutlineLocalOffer, MdAir, MdSpa } from "react-icons/md";
import {
  getPublicActiveHotels,
  getRoomsAvailabilityBulk,
  searchHotel,
} from "../../features/user/hotelSlice";

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
      return arr.sort((a, b) => (a.pricePerNight ?? 0) - (b.pricePerNight ?? 0));
    case "price_desc":
      return arr.sort((a, b) => (b.pricePerNight ?? 0) - (a.pricePerNight ?? 0));
    case "rating":
      return arr.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
    case "newest":
      return arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
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
      (h) => h.name?.toLowerCase().includes(q) || h.address?.toLowerCase().includes(q),
    );
  }
  if (filters.price?.length > 0) {
    result = result.filter((h) => {
      const price = h.pricePerNight ?? 0;
      return filters.price.some((range) => {
        if (range === "10000+") return price >= 10000;
        const [min, max] = range.split("-").map(Number);
        return price >= min && price <= max;
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

const SkeletonCard = ({ index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.95 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
    className="bg-white/[0.02] rounded-2xl overflow-hidden border border-white/10 flex flex-col sm:flex-row animate-pulse min-h-80 sm:min-h-42.5 backdrop-blur-sm will-change-transform"
  >
    <div className="w-full sm:w-52 h-44 sm:h-full bg-white/5 shrink-0" />
    <div className="flex-1 p-4 space-y-3">
      <div className="h-4 bg-white/10 rounded w-2/3" />
      <div className="h-3 bg-white/5 rounded w-1/2" />
      <div className="flex gap-2 mt-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-6 w-14 bg-white/5 rounded-lg" />
        ))}
      </div>
    </div>
    <div className="w-36 p-4 border-l border-white/10 hidden sm:flex flex-col justify-between items-end">
      <div className="h-6 bg-white/10 rounded w-20" />
      <div className="h-9 bg-white/10 rounded-xl w-24" />
    </div>
  </motion.div>
);

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
  const [wishlist, setWishlist] = useState(false);
  const navigate = useNavigate();

  const images = hotel.images?.length
    ? hotel.images
    : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80"];
  const price = hotel.pricePerNight ?? hotel.price ?? 0;
  const totalPrice = price * nights;
  const rating = hotel.averageRating ?? hotel.rating ?? null;
  const totalReviews = hotel.totalReviews ?? 0;
  const facilities = hotel.facilities?.slice(0, 4) || [];
  const cityName = hotel.city?.name || (typeof hotel.city === "string" ? hotel.city : "");
  const discount =
    hotel.originalPrice && price
      ? Math.round(((hotel.originalPrice - price) / hotel.originalPrice) * 100)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -20, scale: 0.95, filter: "blur(4px)" }}
      viewport={{ once: false, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: 0.6, delay: (index % 10) * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      className="group bg-white/[0.02] backdrop-blur-md rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 flex flex-col sm:flex-row cursor-pointer hover:shadow-[0_0_25px_rgba(61,110,245,0.1)] will-change-transform"
      onClick={() => navigate(`/hotels/${hotel._id}`)}
    >
      <div className="relative w-full sm:w-52 h-48 sm:h-48 shrink-0 overflow-hidden bg-white/5">
        <img
          src={images[0]}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
        />

        <button
          onClick={(e) => {
            e.stopPropagation();
            setWishlist(!wishlist);
          }}
          className="absolute top-3 right-3 w-7 h-7 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center shadow hover:scale-110 transition-transform z-10 hover:bg-black/60"
        >
          {wishlist ? (
            <FaHeart className="text-rose-500 text-xs shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
          ) : (
            <FaRegHeart className="text-white/60 text-xs" />
          )}
        </button>

        {isSoldOut && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-white/10 border border-white/20 text-white backdrop-blur-md text-xs font-bold px-3 py-1.5 rounded-full shadow">
              Sold Out
            </span>
          </div>
        )}

        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-[#3d6ef5]/90 backdrop-blur-sm border border-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 z-10 shadow-[0_0_10px_rgba(61,110,245,0.4)]">
            <FaPercent className="text-[8px]" />
            {discount}% OFF
          </div>
        )}

        {hotel.images?.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md backdrop-blur-sm border border-white/10">
            +{hotel.images.length} photos
          </div>
        )}
      </div>

      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <h3 className="font-bold text-white text-sm sm:text-base leading-snug group-hover:text-[#3d6ef5] transition-colors line-clamp-1">
                {hotel.name}
              </h3>
              {hotel.starCategory && <StarDisplay count={hotel.starCategory} />}
            </div>

            {rating !== null && rating > 0 && (
              <div className="flex items-center gap-1 shrink-0 bg-[#3d6ef5]/20 border border-[#3d6ef5]/30 rounded-lg px-2 py-1 shadow-[0_0_10px_rgba(61,110,245,0.2)]">
                <FaStar className="text-amber-400 text-[10px]" />
                <span className="text-xs font-bold text-white">
                  {Number(rating).toFixed(1)}
                </span>
                {totalReviews > 0 && (
                  <span className="text-[10px] text-white/50">
                    ({totalReviews})
                  </span>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-white/50 flex items-center gap-1.5 mb-2.5">
            <FaMapMarkerAlt className="text-[#3d6ef5] text-[10px] shrink-0" />
            <span className="line-clamp-1">
              {[hotel.address, cityName].filter(Boolean).join(", ") || "City Centre"}
            </span>
          </p>

          {facilities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {facilities.map((f) => {
                const key = f.toLowerCase().replace(/\s/g, "");
                return (
                  <span
                    key={f}
                    className="flex items-center gap-1 text-[10px] text-white/70 bg-white/5 border border-white/10 px-2 py-1 rounded-lg capitalize"
                  >
                    <span className="text-[#3d6ef5] text-[9px]">
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
                  <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                    <span className="text-rose-500">⚠️</span> Room capacity: {maxCapacityPerRoom} adults max
                  </p>
                );
              }
              return null;
            })()}

          {availableRooms !== undefined && availableRooms > 0 && availableRooms <= 7 && (
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1.5
                ${
                  availableRooms <= 3
                    ? "text-rose-400 bg-rose-500/10 border-rose-500/30 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                    : "text-amber-400 bg-amber-500/10 border-amber-500/30"
                }`}
            >
              {availableRooms <= 3 ? "🔥 " : ""}Only {availableRooms} rooms left!
            </span>
          )}

          {hotel.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {hotel.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] bg-[#3d6ef5]/10 text-[#3d6ef5] border border-[#3d6ef5]/20 px-2 py-0.5 rounded-full font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {hotel.offers?.length > 0 && (
          <div className="mt-2 flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
            <MdOutlineLocalOffer className="text-sm shrink-0" />
            <span className="line-clamp-1">{hotel.offers[0]}</span>
          </div>
        )}
      </div>

      <div className="sm:w-44 p-4 border-t sm:border-t-0 sm:border-l border-white/5 group-hover:border-white/10 flex flex-row sm:flex-col justify-between sm:justify-start items-start sm:items-end gap-3 transition-colors">
        <div className="text-left sm:text-right">
          {hotel.originalPrice && (
            <p className="text-[11px] text-white/40 line-through">
              ₹{hotel.originalPrice.toLocaleString()}
            </p>
          )}

          <p className="text-xl sm:text-2xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
            {price > 0 ? `₹${price.toLocaleString()}` : "On request"}
          </p>
          {price > 0 && <p className="text-[10px] text-white/40">per night + taxes</p>}

          {price > 0 && nights > 1 && (
            <p className="text-[11px] text-[#3d6ef5] font-semibold mt-1 flex items-center justify-end gap-1">
              <FaMoon className="text-[9px]" />₹{totalPrice.toLocaleString()} · {nights} nights
            </p>
          )}
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
          {hotel.freeCancellation && (
            <span className="hidden sm:flex items-center gap-1 text-emerald-400 text-[10px] font-semibold whitespace-nowrap">
              <FaShieldAlt className="text-[8px]" /> Free cancellation
            </span>
          )}
          <button
            disabled={isSoldOut}
            onClick={(e) => {
              e.stopPropagation();
              if (!isSoldOut) navigate(`/hotels/${hotel._id}`);
            }}
            className={`text-white text-xs font-bold px-4 sm:px-5 py-2.5 rounded-xl shadow transition-all whitespace-nowrap min-w-27.5
            ${
              isSoldOut
                ? "bg-white/10 text-white/40 cursor-not-allowed border border-white/5"
                : "bg-[#3d6ef5] hover:bg-[#2b59da] border border-[#3d6ef5]/50 active:scale-95 shadow-[0_4px_14px_rgba(61,110,245,0.4)] hover:shadow-[0_6px_20px_rgba(61,110,245,0.6)]"
            }`}
          >
            {isSoldOut ? "Sold Out" : "Book Now"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const EmptyState = ({ cityParam }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-20 text-center px-4 bg-white/[0.02] border border-white/5 rounded-2xl"
  >
    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4">
      <FaMapMarkerAlt className="text-white/20 text-2xl" />
    </div>
    <h3 className="text-lg font-bold text-white mb-2">
      {cityParam ? `No hotels found in "${cityParam}"` : "No hotels found"}
    </h3>
    <p className="text-white/50 text-sm max-w-xs">
      {cityParam
        ? "Try a different city or remove some filters."
        : "Try searching for a city or adjusting your filters."}
    </p>
  </motion.div>
);

function HotelPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { hotels = [], loading, bulkAvailability = {} } = useSelector((s) => s.hotel);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const cityParam = searchParams.get("city") || "";
  const checkInParam = searchParams.get("checkIn") || "";
  const checkOutParam = searchParams.get("checkOut") || "";
  const roomsParam = searchParams.get("rooms") || "";
  const adultsParam = searchParams.get("adults") || "";
  const childrenParam = searchParams.get("children") || "";

  const nights = getNights(checkInParam, checkOutParam);

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
  }, [cityParam, checkInParam, checkOutParam, roomsParam, adultsParam, childrenParam, dispatch]);

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
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const requestedRooms = Number(roomsParam) || 0;
  const requestedAdults = Number(adultsParam) || 0;

  const processedHotels = useMemo(
    () => sortHotels(applyFilters(hotels, filters, bulkAvailability, requestedRooms, requestedAdults), sortBy),
    [hotels, filters, sortBy, bulkAvailability, requestedRooms, requestedAdults],
  );
  const totalCount = processedHotels.length;
  const totalPages = Math.ceil(totalCount / PER_PAGE);
  const pagedHotels = processedHotels.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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
      <div className="min-h-screen bg-[#0a0a10] font-sans selection:bg-[#3d6ef5]/30 relative overflow-hidden">
        
        {/* Parallax Background subtle layers */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[20%] left-[-10%] w-[40vw] h-[40vw] bg-[#3d6ef5]/5 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30vw] h-[30vw] bg-purple-500/5 blur-[100px] rounded-full mix-blend-screen" />
        </div>

        {/* Global Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-[#3d6ef5] origin-left z-[100] shadow-[0_0_15px_rgba(61,110,245,0.8)]"
          style={{ scaleX }}
        />

        {/* Sticky search */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="sticky top-0 sm:top-1 z-40 bg-[#0a0a10]/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
            <HeroSearch />
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex gap-5 items-start relative z-10">
          {/* Desktop sidebar */}
          <motion.aside 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="hidden lg:block shrink-0"
          >
            <HotelFilter onFilterChange={handleFilters} onMapOpen={() => setMapOpen(true)} />
          </motion.aside>

          <main className="flex-1 min-w-0">
            {/* Results header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="flex items-start sm:items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2"
            >
              <div className="min-w-0">
                {loading ? (
                  <div className="h-5 w-40 bg-white/10 rounded animate-pulse" />
                ) : (
                  <>
                    <h1 className="text-base sm:text-lg font-extrabold text-white">
                      <span className="text-[#3d6ef5] drop-shadow-[0_0_8px_rgba(61,110,245,0.5)]">{totalCount}</span> Hotels Found
                      {cityParam && (
                        <span className="text-white/50 font-normal text-sm sm:text-base ml-2">
                          in <span className="text-white/90">{cityParam}</span>
                        </span>
                      )}
                    </h1>
                    {cityParam && (checkInParam || adultsParam) && (
                      <p className="text-[11px] text-white/40 mt-1 wrap-break-word font-medium">
                        {checkInParam && checkOutParam && `${new Date(checkInParam).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} → ${new Date(checkOutParam).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · `}
                        {nights > 1 && `${nights} nights · `}
                        {roomsParam && `${roomsParam} Room · `}
                        {adultsParam && `${adultsParam} Adults`}
                        {childrenParam > 0 && ` · ${childrenParam} Children`}
                      </p>
                    )}
                    {!cityParam && (
                      <p className="text-[10px] sm:text-[11px] text-white/40 mt-1 hidden sm:block">
                        Prices include taxes · Free cancellation available on select rates
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {/* Mobile filter */}
                <button
                  onClick={() => setShowMobileFilter(true)}
                  className="lg:hidden flex items-center gap-1.5 border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-colors backdrop-blur-md"
                >
                  <FaFilter className="text-[#3d6ef5] text-[10px]" />
                  Filters
                  {Object.values(filters).flat().filter(Boolean).length > 0 && (
                    <span className="bg-[#3d6ef5] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(61,110,245,0.4)]">
                      {Object.values(filters).flat().filter(Boolean).length}
                    </span>
                  )}
                </button>

                {/* Sort */}
                <div className="relative" id="sort-menu">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center gap-1.5 border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-colors backdrop-blur-md"
                  >
                    <FaSortAmountDown className="text-[#3d6ef5] text-[10px]" />
                    <span className="hidden sm:inline">{sortLabel}</span>
                    <span className="sm:hidden">Sort</span>
                    <FaChevronDown className={`text-[10px] text-white/50 transition-transform ${showSortMenu ? "rotate-180" : ""}`} />
                  </button>
                  {showSortMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 top-full mt-2 bg-[#12141d] border border-white/10 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] z-30 w-48 py-1.5 overflow-hidden backdrop-blur-xl"
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
                                ? "bg-[#3d6ef5]/10 text-[#3d6ef5] font-bold"
                                : "text-white/70 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                          {sortBy === opt.value && <span className="mr-1.5">✓</span>}
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Flash deal */}
            {!loading && pagedHotels.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex items-center gap-2 bg-[#3d6ef5]/10 border border-[#3d6ef5]/20 backdrop-blur-md rounded-xl px-3 sm:px-4 py-2.5 mb-3 sm:mb-4 text-xs shadow-[0_4px_16px_rgba(61,110,245,0.05)]"
              >
                <FaBolt className="text-[#3d6ef5] shrink-0 drop-shadow-[0_0_5px_rgba(61,110,245,0.6)]" />
                <span className="font-bold text-white">Flash Sale:</span>
                <span className="text-white/70 line-clamp-2 sm:line-clamp-1">
                  Up to 40% off on select properties today only!
                </span>
              </motion.div>
            )}

            {/* Cards */}
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
                    maxCapacityPerRoom={bulkAvailability[h._id]?.maxCapacityPerRoom}
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
                  className="px-3 sm:px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-white/50 hover:text-white hover:bg-white/5 hover:border-white/20 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  ← Prev
                </button>
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-[55vw] sm:max-w-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        page === i + 1
                          ? "bg-[#3d6ef5] text-white shadow-[0_4px_12px_rgba(61,110,245,0.4)] border border-[#3d6ef5]"
                          : "border border-white/10 text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 sm:px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-white/50 hover:text-white hover:bg-white/5 hover:border-white/20 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  Next →
                </button>
              </motion.div>
            )}
          </main>
        </div>

        {/* Mobile filter bottom sheet overlay */}
        {showMobileFilter && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setShowMobileFilter(false)} 
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-[#0a0a10] border-l border-white/10 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0 bg-[#0a0a10]">
                <h2 className="font-bold text-white">Filters</h2>
                <button
                  onClick={() => setShowMobileFilter(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <FaTimes className="text-sm" />
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
