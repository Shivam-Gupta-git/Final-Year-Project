import { useEffect, useRef, useState, useCallback } from "react";
import RoomPreviewModal from "../../pages/auth/Roompreviewmodal";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaConciergeBell,
  FaDumbbell,
  FaEnvelope,
  FaExternalLinkAlt,
  FaHeart,
  FaMapMarkerAlt,
  FaMinus,
  FaParking,
  FaPhoneAlt,
  FaPlus,
  FaRegHeart,
  FaRegStar,
  FaShare,
  FaShieldAlt,
  FaSnowflake,
  FaSpa,
  FaStar,
  FaStarHalfAlt,
  FaTv,
  FaWifi,
  FaBed,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";
import {
  MdFreeBreakfast,
  MdOutlineLocalLaundryService,
  MdPets,
  MdPool,
  MdRestaurant,
  MdRoomService,
  MdSmokeFree,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  bookRoom,
  getRoomAvailability,
  resetBookingState,
} from "../../features/user/hotelBookingSlice";
import { getPublicActiveHotels } from "../../features/user/hotelSlice";
import {
  addHotelReview,
  getHotelReviews,
  resetReviewState,
} from "../../features/user/reviewSlice";
import { getPublicRooms } from "../../features/user/roomSlice";
import { setFinalAmount } from "../../features/user/bookingSlice";

// ── IMPROVEMENT: pricing helpers imported from shared util ────────────────────
// Never define these inline again — import everywhere (checkout, invoice, etc.)
import {
  getGSTRate,
  getGSTLabel,
  computePriceBreakdown,
} from "../../features/user/pricing";

// ── Amenity icon map ──────────────────────────────────────────────────────────
const AMENITY_MAP = {
  wifi:        { icon: <FaWifi />,                         label: "Free WiFi" },
  pool:        { icon: <MdPool />,                          label: "Swimming Pool" },
  parking:     { icon: <FaParking />,                       label: "Free Parking" },
  restaurant:  { icon: <MdRestaurant />,                    label: "Restaurant" },
  ac:          { icon: <FaSnowflake />,                     label: "Air Conditioning" },
  spa:         { icon: <FaSpa />,                           label: "Spa & Wellness" },
  gym:         { icon: <FaDumbbell />,                      label: "Fitness Centre" },
  laundry:     { icon: <MdOutlineLocalLaundryService />,    label: "Laundry" },
  roomservice: { icon: <MdRoomService />,                   label: "Room Service" },
  breakfast:   { icon: <MdFreeBreakfast />,                 label: "Breakfast" },
  tv:          { icon: <FaTv />,                            label: "Smart TV" },
  concierge:   { icon: <FaConciergeBell />,                 label: "Concierge" },
};

// ── IMPROVEMENT: fallback images defined OUTSIDE component ───────────────────
// Avoids a new array reference on every render, enabling proper memoisation.
const ROOM_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&q=80",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500&q=80",
  "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=500&q=80",
];

const getToday    = () => new Date().toISOString().split("T")[0];
const getTomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};
const nightsBetween = (a, b) =>
  Math.max(1, Math.round((new Date(b) - new Date(a)) / 86400000));

const TABS = ["Overview", "Amenities", "Rooms", "Reviews", "Location & Policies"];

// ── Generic Toast ─────────────────────────────────────────────────────────────
// IMPROVEMENT: replaces all native alert() calls with a polished in-UI toast.
const TOAST_STYLES = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  error:   "bg-rose-50 border-rose-200 text-rose-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  info:    "bg-sky-50 border-sky-200 text-sky-800",
};
const TOAST_ICONS = {
  success: <FaCheckCircle className="text-emerald-500 shrink-0" />,
  error:   <FaTimes className="text-rose-500 shrink-0" />,
  warning: <FaInfoCircle className="text-amber-500 shrink-0" />,
  info:    <FaInfoCircle className="text-sky-500 shrink-0" />,
};

const Toast = ({ message, type = "info", onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up pointer-events-none">
      <div
        className={`flex items-center gap-3 border rounded-2xl px-5 py-3.5 shadow-lg backdrop-blur-xl pointer-events-auto whitespace-nowrap ${TOAST_STYLES[type]}`}
      >
        {TOAST_ICONS[type]}
        <span className="text-sm font-semibold">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 opacity-50 hover:opacity-100 transition-opacity"
        >
          <FaTimes className="text-xs" />
        </button>
      </div>
    </div>
  );
};

// ── Star renderer ─────────────────────────────────────────────────────────────
const StarRating = ({ rating, size = "text-sm" }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) =>
        i < full ? (
          <FaStar key={i} className={`text-amber-400 ${size}`} />
        ) : i === full && half ? (
          <FaStarHalfAlt key={i} className={`text-amber-400 ${size}`} />
        ) : (
          <FaRegStar key={i} className={`text-amber-300 ${size}`} />
        ),
      )}
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const DetailSkeleton = () => (
  <div className="animate-pulse min-h-screen bg-[#f8fafc]">
    <div className="h-14 border-b border-slate-200 bg-white/80 backdrop-blur-md" />
    <div className="mt-0 h-75 w-full bg-slate-200 sm:h-105" />
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-4">
        <div className="h-8 w-2/3 rounded-xl bg-slate-200" />
        <div className="h-4 w-1/3 rounded bg-slate-100" />
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
      <div className="h-72 w-full shrink-0 rounded-2xl bg-slate-200 lg:w-80" />
    </div>
  </div>
);

// ── Lightbox ──────────────────────────────────────────────────────────────────
const Lightbox = ({ imgs, lightbox, setLightbox }) => (
  <div
    className="fixed inset-0 z-200 bg-slate-900/95 flex items-center justify-center backdrop-blur-sm"
    onClick={() => setLightbox(null)}
  >
    <button
      className="absolute top-4 right-4 text-white text-xl bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
      onClick={() => setLightbox(null)}
    >
      ✕
    </button>
    <button
      className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center transition-all"
      onClick={(e) => { e.stopPropagation(); setLightbox((l) => Math.max(0, l - 1)); }}
    >
      <FaChevronLeft />
    </button>
    <img
      src={imgs[lightbox]}
      alt=""
      className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    />
    <button
      className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center transition-all"
      onClick={(e) => { e.stopPropagation(); setLightbox((l) => Math.min(imgs.length - 1, l + 1)); }}
    >
      <FaChevronRight />
    </button>
    <p className="absolute bottom-6 text-white/60 text-xs font-semibold tracking-wide">
      {lightbox + 1} / {imgs.length}
    </p>
  </div>
);

// ── Image Gallery ─────────────────────────────────────────────────────────────
const ImageGallery = ({ images, name }) => {
  const [lightbox, setLightbox] = useState(null);
  const imgs  = (images || []).filter(Boolean);
  const count = imgs.length;

  if (count === 0)
    return (
      <div className="flex h-55 w-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/50 sm:h-70">
        <FaMapMarkerAlt className="mb-2 text-3xl text-slate-300" />
        <p className="text-sm font-medium text-slate-400">No photos uploaded yet</p>
      </div>
    );

  if (count === 1)
    return (
      <>
        <div
          className="h-65 sm:h-105 w-full rounded-2xl overflow-hidden cursor-pointer group"
          onClick={() => setLightbox(0)}
        >
          <img src={imgs[0]} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        {lightbox !== null && <Lightbox imgs={imgs} lightbox={lightbox} setLightbox={setLightbox} />}
      </>
    );

  if (count === 2)
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 h-105 w-full">
          {imgs.map((src, i) => (
            <div
              key={i}
              className={`relative overflow-hidden cursor-pointer group ${
                i === 0 ? "sm:rounded-l-2xl rounded-t-2xl sm:rounded-t-none" : "sm:rounded-r-2xl rounded-b-2xl sm:rounded-b-none"
              }`}
              onClick={() => setLightbox(i)}
            >
              <img src={src} alt={`${name} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
        {lightbox !== null && <Lightbox imgs={imgs} lightbox={lightbox} setLightbox={setLightbox} />}
      </>
    );

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 grid-rows-4 sm:grid-rows-2 gap-1.5 h-105 w-full">
        <div
          className="col-span-2 row-span-2 relative overflow-hidden rounded-t-2xl sm:rounded-l-2xl sm:rounded-t-none cursor-pointer group"
          onClick={() => setLightbox(0)}
        >
          <img src={imgs[0]} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        {[1, 2].map((i) => (
          <div
            key={i}
            className={`relative overflow-hidden cursor-pointer group ${i === 2 ? "sm:rounded-tr-2xl" : ""}`}
            onClick={() => setLightbox(i)}
          >
            <img src={imgs[i]} alt={`${name} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        ))}
        {/* IMPROVEMENT: fixed overflow label — was i===4 (never triggered for 5 imgs),
            now i===3 with count>4 so the "+N" overlay appears on the correct slot. */}
        {[3, 4].map((i) =>
          imgs[i] ? (
            <div
              key={i}
              className={`relative overflow-hidden cursor-pointer group ${
                i === 4 ? "rounded-b-2xl sm:rounded-br-2xl sm:rounded-b-none" : ""
              }`}
              onClick={() => setLightbox(i)}
            >
              <img src={imgs[i]} alt={`${name} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {i === 3 && count > 4 && (
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">+{count - 4} photos</span>
                </div>
              )}
            </div>
          ) : null,
        )}
      </div>
      {lightbox !== null && <Lightbox imgs={imgs} lightbox={lightbox} setLightbox={setLightbox} />}
    </>
  );
};

// ── Room image slider ─────────────────────────────────────────────────────────
const RoomImageSlider = ({ images }) => {
  const [idx, setIdx] = useState(0);
  // IMPROVEMENT: fallback array is the module-level constant — no new reference per render
  const imgs = images?.length ? images : ROOM_FALLBACK_IMAGES;

  return (
    <div className="relative w-full h-full shrink-0 overflow-hidden bg-slate-100 group">
      <img
        src={imgs[idx]}
        alt="room"
        className="w-full h-full object-cover transition-opacity duration-500"
      />
      {imgs.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((i) => Math.max(0, i - 1)); }}
            className={`absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white backdrop-blur-md text-slate-800 rounded-full flex items-center justify-center transition-all shadow-sm ${
              idx === 0 ? "opacity-0 pointer-events-none" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <FaChevronLeft className="text-[10px]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((i) => Math.min(imgs.length - 1, i + 1)); }}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 hover:bg-white backdrop-blur-md text-slate-800 rounded-full flex items-center justify-center transition-all shadow-sm ${
              idx === imgs.length - 1 ? "opacity-0 pointer-events-none" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <FaChevronRight className="text-[10px]" />
          </button>
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
            {imgs.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? "bg-white w-3 shadow-sm" : "bg-white/40 shadow-sm"}`}
              />
            ))}
          </div>
          <div className="absolute top-2.5 right-2.5 bg-black/40 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
            {idx + 1}/{imgs.length}
          </div>
        </>
      )}
    </div>
  );
};

// ── Sticky Booking Widget ─────────────────────────────────────────────────────
const BookingWidget = ({
  hotel,
  onSelectRoom,
  selectedRoom,
  onClearRoom,
  onDatesChange,
  onShowToast,
}) => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { availability }              = useSelector((s) => s.hotelBooking);
  const { loading: bookingLoading }   = useSelector((s) => s.hotelBooking);

  const [checkIn,  setCheckIn]  = useState(getToday());
  const [checkOut, setCheckOut] = useState(getTomorrow());
  const [rooms,    setRooms]    = useState(1);
  const [guests,   setGuests]   = useState(2);
  const [priceChanged, setPriceChanged] = useState(false);
  const prevPriceRef = useRef(null);

  const nights       = nightsBetween(checkIn, checkOut);
  const pricePerNight = selectedRoom?.pricePerNight ?? hotel?.pricePerNight ?? hotel?.price ?? 3499;

  const { baseAmount, gstRate, gstAmount, totalAmount } = computePriceBreakdown({
    pricePerNight,
    nights,
    rooms,
  });

  // Animate total when it changes
  useEffect(() => {
    if (prevPriceRef.current !== null && prevPriceRef.current !== totalAmount) {
      setPriceChanged(true);
      const t = setTimeout(() => setPriceChanged(false), 600);
      return () => clearTimeout(t);
    }
    prevPriceRef.current = totalAmount;
  }, [totalAmount]);

  // IMPROVEMENT: onDatesChange added to dep array — previously missing, caused stale closure.
  useEffect(() => {
    if (onDatesChange) {
      onDatesChange({ checkIn, checkOut, rooms, guests, pricePerNight, nights });
    }
  }, [checkIn, checkOut, rooms, guests, selectedRoom, onDatesChange]);

  useEffect(() => { dispatch(resetBookingState()); }, []);

  useEffect(() => {
    if (hotel?._id && checkIn && checkOut) {
      dispatch(getRoomAvailability({ hotelId: hotel._id, checkIn, checkOut }));
    }
  }, [checkIn, checkOut, hotel?._id]);

  const handleBook = () => {
    if (!selectedRoom) return;

    // IMPROVEMENT: validate before touching Redux / navigating
    if (guests > selectedRoom.capacity) {
      // IMPROVEMENT: replaced alert() with onShowToast callback — no thread-blocking native dialog
      onShowToast(`This room fits max ${selectedRoom.capacity} guests.`, "warning");
      return;
    }

    // IMPROVEMENT: dispatch setFinalAmount BEFORE navigating so the booking
    // confirmation page always receives the correct computed totals from Redux,
    // not a stale/empty value.
    dispatch(setFinalAmount({ baseAmount, gstAmount, totalAmount }));

    dispatch(
      bookRoom({
        hotelId:     hotel._id,
        roomType:    selectedRoom._id || null,
        bookedRooms: rooms,
        checkIn,
        checkOut,
        guests,
        totalAmount,
      }),
    );

    navigate("/my-booking");
  };

  return (
    <div className="ui-card overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 lg:sticky lg:top-24">
      {/* Header */}
      <div className="bg-linear-to-r from-[#c67c4e] to-[#b86c3d] px-5 py-5 sm:py-6">
        <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider mb-1">
          {selectedRoom ? "Selected Room Rate" : "Special Offer From"}
        </p>
        <div className="flex flex-wrap items-baseline gap-2">
          <span
            className={`text-3xl font-extrabold text-white tracking-tight transition-all duration-300 inline-block ${priceChanged ? "scale-110" : ""}`}
          >
            ₹{pricePerNight.toLocaleString()}
          </span>
          <span className="text-white/80 text-sm font-medium">/ night</span>
        </div>
        {selectedRoom && (
          <p className="text-white font-bold text-xs mt-1 capitalize flex items-center gap-1.5">
            <FaBed className="text-white/60 text-[10px]" />
            {selectedRoom.roomType}
          </p>
        )}
        <p className="text-white/60 text-[10px] mt-1.5 font-medium border-t border-white/10 pt-1.5">
          +{getGSTLabel(pricePerNight)} applicable taxes
        </p>
      </div>

      {/* Selected room banner */}
      {selectedRoom && (
        <div className="pt-3 px-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <FaCheckCircle className="text-emerald-500 shrink-0 text-sm" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Room Selected</p>
              <p className="text-xs text-emerald-800 font-semibold truncate capitalize">
                {selectedRoom.roomType} · Max {selectedRoom.capacity} guests
              </p>
            </div>
            <button
              onClick={onClearRoom}
              className="w-5 h-5 rounded-full bg-emerald-200 hover:bg-emerald-300 flex items-center justify-center transition-colors shrink-0"
            >
              <FaTimes className="text-[8px] text-emerald-700" />
            </button>
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            {
              label: "Check-in", val: checkIn, min: getToday(),
              set: (v) => {
                setCheckIn(v);
                if (v >= checkOut) {
                  const d = new Date(v);
                  d.setDate(d.getDate() + 1);
                  setCheckOut(d.toISOString().split("T")[0]);
                }
              },
            },
            { label: "Check-out", val: checkOut, min: checkIn, set: setCheckOut },
          ].map(({ label, val, min, set }) => (
            <div key={label}>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">{label}</p>
              <div className="relative group">
                <FaCalendarAlt className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 transition-colors group-focus-within:text-[#3d6ef5]" />
                <input
                  type="date"
                  value={val}
                  min={min}
                  onChange={(e) => set(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-2 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-4 focus:ring-[#3d6ef5]/5 focus:border-[#3d6ef5]/40 transition-all"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Rooms & Guests */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: "Rooms",  val: rooms,  set: setRooms },
            { label: "Guests", val: guests, set: setGuests },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">{label}</p>
              <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <button onClick={() => set((v) => Math.max(1, v - 1))} className="flex h-10 w-10 items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                  <FaMinus className="text-[9px]" />
                </button>
                <span className="flex-1 text-center text-sm font-bold text-slate-700">{val}</span>
                <button onClick={() => set((v) => Math.min(10, v + 1))} className="flex h-10 w-10 items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                  <FaPlus className="text-[9px]" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Guest capacity warning */}
        {selectedRoom && guests > selectedRoom.capacity && (
          <p className="text-xs text-rose-500 font-semibold flex items-center gap-1">
            ⚠ This room fits max {selectedRoom.capacity} guests
          </p>
        )}

        {/* Price breakdown */}
        <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
          <div className="flex justify-between text-xs text-slate-600 font-medium">
            <span>₹{pricePerNight.toLocaleString()} × {nights} night{nights > 1 ? "s" : ""} × {rooms} room{rooms > 1 ? "s" : ""}</span>
            <span className="font-bold text-slate-700">₹{baseAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              GST ({(gstRate * 100).toFixed(0)}%)
              {gstRate === 0 && (
                <span className="text-emerald-600 text-[10px] font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">Exempt</span>
              )}
            </span>
            <span className={gstRate === 0 ? "text-emerald-600 font-bold" : "font-bold text-slate-700"}>
              {gstRate === 0 ? "₹0" : `₹${gstAmount.toLocaleString()}`}
            </span>
          </div>
          <div className="my-2 h-px bg-slate-200/60" />
          <div className="flex justify-between items-center text-[15px] font-extrabold text-slate-800">
            <span>Total Payable</span>
            <span className="text-lg">₹{totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex items-start gap-1.5 pt-1">
            <FaInfoCircle className="text-slate-300 text-[10px] mt-0.5 shrink-0" />
            <span className="text-[10px] text-slate-400 leading-tight">
              {pricePerNight < 1000
                ? "Rooms under ₹1,000/night are GST exempt."
                : pricePerNight <= 7500
                  ? "Standard occupancy taxes of 12% GST applied."
                  : "Luxury occupancy taxes of 18% GST applied."}
            </span>
          </div>
        </div>

        {/* CTA */}
        {!selectedRoom ? (
          <button
            onClick={() => document.getElementById("rooms-section")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="w-full font-bold py-3.5 rounded-xl shadow-lg shadow-[#3d6ef5]/10 active:scale-[0.98] transition-all text-sm border-2 border-[#c67c4e] text-[#c67c4e] hover:bg-[#b06d42] hover:text-white"
          >
            Choose a Room to Continue
          </button>
        ) : (
          <button
            onClick={handleBook}
            disabled={bookingLoading || (selectedRoom && guests > selectedRoom.capacity)}
            className={`w-full font-bold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98] ${
              bookingLoading || (selectedRoom && guests > selectedRoom.capacity)
                ? "bg-slate-200 cursor-not-allowed text-slate-400"
                : "bg-linear-to-r from-[#3d6ef5] to-[#6366f1] hover:from-[#3461d9] hover:to-[#5558e6] text-white shadow-lg shadow-[#3d6ef5]/20"
            }`}
          >
            {bookingLoading ? "Securing your stay..." : `Reserve Now · ₹${totalAmount.toLocaleString()}`}
          </button>
        )}

        <p className="flex items-center justify-center gap-1.5 text-emerald-600 text-xs font-semibold">
          <FaShieldAlt className="text-[10px]" /> Free cancellation before check-in
        </p>
      </div>
    </div>
  );
};

// ── Review Card ───────────────────────────────────────────────────────────────
const ReviewCard = ({ review }) => (
  <div className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
    <div className="flex items-center justify-between mb-2.5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-[15px] shrink-0 border border-slate-200/50 uppercase">
          {(review.user?.name || review.userName || "Guest")[0]}
        </div>
        <div>
          <p className="text-[13px] font-bold text-slate-800">
            {review.user?.name || review.userName || "Guest"}
          </p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
            {review.createdAt
              ? new Date(review.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
              : review.date || "Verified stay"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/50 rounded-lg px-2 py-1">
        <FaStar className="text-amber-400 text-[10px]" />
        <span className="text-xs font-black text-amber-700">{review.rating}</span>
      </div>
    </div>
    <p className="text-[13px] leading-relaxed text-slate-600 font-medium">
      {review.comment || review.review}
    </p>
  </div>
);

// ── Add Review Form ───────────────────────────────────────────────────────────
const AddReviewForm = ({ hotelId }) => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { submitLoading, submitSuccess, submitError } = useSelector((s) => s.review);
  const { user }  = useSelector((s) => s.user);
  const [rating,  setRating]  = useState(0);
  const [comment, setComment] = useState("");
  const [hovered, setHovered] = useState(0);

  useEffect(() => {
    if (submitSuccess) {
      setRating(0);
      setComment("");
      setTimeout(() => dispatch(resetReviewState()), 3000);
    }
  }, [submitSuccess, dispatch]);

  if (!user)
    return (
      <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/50 p-6 text-center">
        <p className="text-sm text-slate-500 font-medium">
          <button onClick={() => navigate("/login")} className="text-[#3d6ef5] font-black hover:underline underline-offset-4">
            Sign in
          </button>{" "}
          to write a review and help other travelers.
        </p>
      </div>
    );

  return (
    <div className="mt-6 border-t border-slate-100 pt-6">
      <h3 className="mb-4 text-[15px] font-black text-slate-800 tracking-tight">Write a Review</h3>
      <div className="flex items-center gap-1.5 mb-5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(star)}
            className="text-2xl transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <FaStar className={star <= (hovered || rating) ? "text-amber-400" : "text-slate-200"} />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-3 text-[11px] font-bold text-[#3d6ef5] bg-[#3d6ef5]/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
            {rating} / 5
          </span>
        )}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="How was your stay? Any tips for other travelers?"
        rows={4}
        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#3d6ef5]/5 focus:border-[#3d6ef5]/30 transition-all"
      />
      {submitSuccess && (
        <p className="text-emerald-600 text-xs font-bold mt-3 flex items-center gap-1.5">
          <FaCheckCircle className="text-[10px]" /> Review received! It will be live after a short verification.
        </p>
      )}
      {submitError && <p className="text-rose-500 text-xs font-bold mt-3">{submitError}</p>}
      <button
        disabled={!rating || !comment.trim() || submitLoading}
        onClick={() => dispatch(addHotelReview({ hotelId, rating, comment }))}
        className={`mt-4 px-8 py-3 rounded-xl text-white text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ${
          !rating || !comment.trim() || submitLoading
            ? "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
            : "bg-linear-to-r from-[#3d6ef5] to-[#6366f1] shadow-[#3d6ef5]/20"
        }`}
      >
        {submitLoading ? "Publishing..." : "Submit Review"}
      </button>
    </div>
  );
};

// ── Room Card ─────────────────────────────────────────────────────────────────
const RoomCard = ({ room, isSelected, onSelect, onPreview, availability }) => {
  const roomAvail      = availability?.find?.((a) => a._id === room._id);
  const availableRooms = roomAvail?.availableRooms ?? room.totalRooms;
  const isSoldOut      = availableRooms === 0;
  const gstLabel       = getGSTLabel(room.pricePerNight);

  return (
    <div
      className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
        isSelected
          ? "border-[#3d6ef5] shadow-xl shadow-[#3d6ef5]/10 scale-[1.01] bg-white"
          : isSoldOut
            ? "border-slate-100 opacity-60 bg-slate-50"
            : "border-slate-200 bg-white hover:border-[#3d6ef5]/30 hover:shadow-lg hover:shadow-slate-200/50"
      }`}
    >
      {isSelected && (
        <div className="bg-linear-to-r from-[#3d6ef5] to-[#6366f1] px-4 py-2 flex items-center gap-2">
          <FaCheckCircle className="text-white text-[10px]" />
          <span className="text-white text-[10px] font-bold tracking-widest uppercase">Currently Selected Room</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row">
        {/* Fixed-height image slot */}
        <div
          className="relative w-full sm:w-44 h-48 shrink-0 cursor-pointer group"
          onClick={() => onPreview(room)}
        >
          <RoomImageSlider images={room.images} />
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all duration-200 flex items-center justify-center pointer-events-none">
            <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-white/95 backdrop-blur-md text-[#3d6ef5] text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-xl">
              Preview Room
            </span>
          </div>
          {isSelected && <div className="absolute inset-0 ring-2 ring-inset ring-[#3d6ef5]/30 pointer-events-none" />}
        </div>

        <div className="flex-1 p-4 flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <button
                onClick={() => onPreview(room)}
                className="text-left text-[15px] font-extrabold capitalize text-slate-800 transition-colors hover:text-[#3d6ef5]"
              >
                {room.roomType}
              </button>
              {isSelected && (
                <span className="text-[9px] bg-[#3d6ef5]/10 text-[#3d6ef5] font-extrabold px-2 py-0.5 rounded-full border border-[#3d6ef5]/20">
                  SELECTED
                </span>
              )}
            </div>
            <p className="mb-2.5 text-xs text-slate-500 font-medium">
              Max {room.capacity} guests · {room.totalRooms} rooms total
            </p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {(room.amenities || []).slice(0, 4).map((f) => (
                <span key={f} className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1 text-[10px] font-bold capitalize text-slate-500">
                  {f}
                </span>
              ))}
              {(room.amenities || []).length > 4 && (
                <button onClick={() => onPreview(room)} className="text-[10px] text-[#3d6ef5] font-bold hover:underline underline-offset-2">
                  +{room.amenities.length - 4} more
                </button>
              )}
            </div>
            {availableRooms <= 5 && availableRooms > 0 && (
              <span className="text-[10px] text-orange-600 font-semibold">🔥 Only {availableRooms} rooms left!</span>
            )}
            {isSoldOut && <span className="text-[10px] text-rose-600 font-semibold">Sold Out</span>}
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <div className="sm:text-right">
              <p className="text-2xl font-black text-slate-800 tracking-tight">₹{room.pricePerNight.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">per night</p>
              <p className="text-[10px] text-slate-400/80 font-medium">+{gstLabel} tax</p>
            </div>

            <div className="flex flex-col gap-2 items-end w-full sm:w-auto">
              <button
                onClick={() => onPreview(room)}
                className="text-slate-500 bg-slate-50 hover:bg-slate-100 text-[10px] font-bold px-3 py-2 rounded-lg transition-all w-full text-center border border-slate-200/50"
              >
                Room Details
              </button>
              {!isSoldOut ? (
                isSelected ? (
                  <button
                    onClick={() => onSelect(null)}
                    className="bg-emerald-50 border-2 border-emerald-500 text-emerald-600 text-xs font-bold px-4 py-2 rounded-xl transition-all min-w-30 hover:bg-emerald-100 active:scale-95 flex items-center gap-1.5 justify-center"
                  >
                    <FaCheckCircle className="text-[11px]" /> Selected
                  </button>
                ) : (
                  <button
                    onClick={() => onSelect(room)}
                    className="bg-linear-to-r from-[#c67c4e] to-[#b86c3d] hover:from-[#b06d42] hover:to-[#9e5b33] active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-[#3d6ef5]/15 transition-all min-w-30 flex items-center gap-1.5 justify-center"
                  >
                    <FaBed className="text-[11px]" /> Select Room
                  </button>
                )
              ) : (
                <button disabled className="bg-slate-100 cursor-not-allowed text-slate-400 text-xs font-bold px-4 py-2.5 rounded-xl min-w-30">
                  Sold Out
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Room selected toast (existing, kept as-is) ────────────────────────────────
const RoomSelectedToast = ({ room, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-white/90 backdrop-blur-xl border border-[#3d6ef5]/20 text-slate-800 px-6 py-3.5 rounded-2xl shadow-[0_20px_50px_rgba(59,130,246,0.2)] flex items-center gap-4 whitespace-nowrap">
        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
          <FaCheckCircle className="text-emerald-500 text-lg" />
        </div>
        <div>
          <p className="text-xs font-black capitalize text-slate-800">{room.roomType} selected!</p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Scroll up to finalize your booking</p>
        </div>
        <button onClick={onClose} className="ml-2 text-slate-300 hover:text-slate-500 transition-colors">
          <FaTimes className="text-sm" />
        </button>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const HotelDetailPage = () => {
  const { id }      = useParams();
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const bookingRef  = useRef(null);

  const [wishlist,     setWishlist]     = useState(false);
  const [activeTab,    setActiveTab]    = useState("Overview");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showToast,    setShowToast]    = useState(false);
  const [previewRoom,  setPreviewRoom]  = useState(null);
  const [widgetParams, setWidgetParams] = useState({ nights: 1, rooms: 1 });

  // IMPROVEMENT: generic toast state — replaces all native alert() dialogs
  const [genericToast, setGenericToast] = useState(null);
  const showGenericToast = useCallback((message, type = "info") => {
    setGenericToast({ message, type });
  }, []);

  const refs = {
    Overview:              useRef(null),
    Amenities:             useRef(null),
    Rooms:                 useRef(null),
    Reviews:               useRef(null),
    "Location & Policies": useRef(null),
  };

  const { hotels, loading, error } = useSelector((s) => s.hotel);
  const hotel = hotels?.find((h) => h._id === id);

  const { publicRooms, loading: roomsLoading } = useSelector((s) => s.room);
  const { hotelReviews }  = useSelector((s) => s.review);
  const { availability }  = useSelector((s) => s.hotelBooking);

  useEffect(() => {
    if (!hotels || hotels.length === 0) dispatch(getPublicActiveHotels());
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (hotel?._id) {
      dispatch(getPublicRooms(hotel._id));
      dispatch(getHotelReviews(hotel._id));
    }
  }, [hotel?._id, dispatch]);

  // IMPROVEMENT: IntersectionObserver keeps the active tab highlight in sync as
  // the user scrolls naturally, instead of only updating on tab click.
  useEffect(() => {
    if (!hotel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.dataset.tab);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );

    TABS.forEach((tab) => {
      const el = refs[tab]?.current;
      if (el) {
        el.dataset.tab = tab;
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [hotel]);

  const scrollTo = (tab) => {
    setActiveTab(tab);
    refs[tab]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // IMPROVEMENT: uses setFinalAmount action + memoised with useCallback
  const handleSelectRoom = useCallback(
    (room) => {
      if (!room) {
        setSelectedRoom(null);
        return;
      }

      setSelectedRoom(room);

      const { baseAmount, gstAmount, totalAmount } = computePriceBreakdown({
        pricePerNight: room.pricePerNight,
        nights:        widgetParams.nights ?? 1,
        rooms:         widgetParams.rooms  ?? 1,
      });

      dispatch(setFinalAmount({ baseAmount, gstAmount, totalAmount }));
      setShowToast(true);

      setTimeout(() => {
        bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    },
    [dispatch, widgetParams],
  );

  // IMPROVEMENT: onDatesChange is memoised so BookingWidget's dep array is stable
  const handleWidgetChange = useCallback(
    ({ nights, rooms, pricePerNight }) => {
      setWidgetParams({ nights, rooms });

      if (selectedRoom) {
        const pricePn = pricePerNight ?? selectedRoom.pricePerNight;
        const { baseAmount, gstAmount, totalAmount } = computePriceBreakdown({ pricePerNight: pricePn, nights, rooms });
        dispatch(setFinalAmount({ baseAmount, gstAmount, totalAmount }));
      }
    },
    [dispatch, selectedRoom],
  );

  const openGoogleMaps = () => {
    const coords = hotel?.location?.coordinates;
    const url = coords?.[0] && coords?.[1]
      ? `https://www.google.com/maps?q=${coords[1]},${coords[0]}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.name}, ${hotel.address}`)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading && (!hotels || hotels.length === 0)) return <DetailSkeleton />;

  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="text-center p-12 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-sm mx-4">
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FaMapMarkerAlt className="text-rose-400 text-3xl" />
          </div>
          <h3 className="mb-3 text-[20px] font-black text-slate-800 tracking-tight">Technical Error</h3>
          <p className="mb-8 text-sm text-slate-500 font-medium leading-relaxed">{error}</p>
          <button onClick={() => navigate(-1)} className="w-full bg-slate-800 text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest">
            Go Back
          </button>
        </div>
      </div>
    );

  if (!hotel)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="text-center p-12 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-sm mx-4">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FaMapMarkerAlt className="text-slate-300 text-3xl" />
          </div>
          <h3 className="mb-3 text-[20px] font-black text-slate-800 tracking-tight">Hotel Missing</h3>
          <p className="mb-8 text-sm text-slate-500 font-medium leading-relaxed">
            The property you are looking for may have been moved or removed from our listings.
          </p>
          <button onClick={() => navigate(-1)} className="w-full bg-slate-800 text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest">
            Browse Others
          </button>
        </div>
      </div>
    );

  const facilities   = hotel.facilities || hotel.amenities || [];
  const cityName     = hotel.city?.name || (typeof hotel.city === "string" ? hotel.city : "");
  const avgRating    = +(hotel.averageRating ?? hotel.rating ?? 0);
  const displayRating = avgRating > 0 ? avgRating.toFixed(1) : null;
  const totalReviews  = hotel.totalReviews ?? hotel.reviews?.length ?? 0;
  const displayPrice  = selectedRoom?.pricePerNight ?? hotel?.pricePerNight ?? 3499;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans">
      {/* Room-selected toast */}
      {showToast && selectedRoom && (
        <RoomSelectedToast room={selectedRoom} onClose={() => setShowToast(false)} />
      )}

      {/* Generic toast — replaces alert() */}
      {genericToast && (
        <Toast
          message={genericToast.message}
          type={genericToast.type}
          onClose={() => setGenericToast(null)}
        />
      )}

      {/* Room Preview Modal */}
      <RoomPreviewModal
        room={previewRoom}
        isOpen={!!previewRoom}
        onClose={() => setPreviewRoom(null)}
        onSelectRoom={(room) => { handleSelectRoom(room); setPreviewRoom(null); }}
        isSelected={!!(previewRoom && selectedRoom?._id === previewRoom._id)}
      />

      {/* Navbar */}
      <div className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-[#3d6ef5] bg-slate-50 px-3 py-2 rounded-xl border border-slate-100"
          >
            <FaChevronLeft className="text-[10px]" /> Back
          </button>
          <div className="flex-1 min-w-0 hidden sm:block">
            <p className="truncate text-[15px] font-black text-slate-800 tracking-tight">{hotel.name}</p>
            <p className="truncate text-[11px] text-slate-400 font-bold uppercase tracking-wide">
              {hotel.address}{cityName ? `, ${cityName}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedRoom && (
              <div className="hidden items-center gap-1.5 rounded-xl border border-[#3d6ef5]/20 bg-[#3d6ef5]/5 px-3 py-2 sm:flex">
                <FaBed className="text-[#3d6ef5] text-xs" />
                <span className="text-xs font-bold text-slate-700 capitalize truncate max-w-28">{selectedRoom.roomType}</span>
                <span className="text-[#3d6ef5] font-black text-xs">· ₹{selectedRoom.pricePerNight.toLocaleString()}</span>
              </div>
            )}
            <button
              onClick={() => setWishlist(!wishlist)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm"
            >
              {wishlist ? <FaHeart className="text-rose-500" /> : <FaRegHeart />}
              <span className="hidden sm:inline">Save</span>
            </button>
            <button
              onClick={() => navigator.share?.({ title: hotel.name, url: window.location.href })}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-[#3d6ef5] hover:border-[#3d6ef5]/30 transition-all shadow-sm"
            >
              <FaShare />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <ImageGallery images={hotel.images} name={hotel.name} />
      </div>

      {/* Hotel header */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {hotel.status === "active" && (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 shadow-sm">
              Live Listing
            </span>
          )}
        </div>
        <h1 className="mb-3 text-3xl font-black leading-tight text-slate-800 sm:text-4xl tracking-tight">{hotel.name}</h1>
        <button
          onClick={openGoogleMaps}
          className="group mb-5 flex items-start gap-2 text-left text-sm text-slate-500 transition-colors hover:text-[#3d6ef5] sm:items-center font-medium"
        >
          <div className="w-7 h-7 rounded-lg bg-[#3d6ef5]/10 flex items-center justify-center shrink-0">
            <FaMapMarkerAlt className="text-[#3d6ef5] text-xs" />
          </div>
          <span className="group-hover:underline underline-offset-4 decoration-[#3d6ef5]/30">
            {hotel.address}{cityName ? `, ${cityName}` : ""}
          </span>
          <FaExternalLinkAlt className="text-[10px] opacity-40 group-hover:opacity-100 transition-opacity" />
        </button>
        <div className="flex flex-wrap items-center gap-4">
          {displayRating ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-linear-to-r from-amber-400 to-amber-500 text-white px-4 py-2 rounded-2xl shadow-lg shadow-amber-400/20">
                <FaStar className="text-white text-sm" />
                <span className="font-black text-base">{displayRating}</span>
                <span className="text-white/80 text-xs font-bold">/ 5</span>
              </div>
              {totalReviews > 0 && (
                <span className="text-sm text-slate-400 font-bold uppercase tracking-wide">
                  {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                </span>
              )}
              <StarRating rating={avgRating} size="text-sm" />
            </div>
          ) : (
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">No ratings yet</span>
          )}
          <div className="flex flex-wrap gap-2">
            {facilities.slice(0, 3).map((f) => (
              <span key={f} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black tracking-widest uppercase text-slate-500 shadow-sm">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky tabs */}
      <div className="sticky top-16 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => scrollTo(tab)}
                className={`shrink-0 px-2 py-4 text-xs sm:text-[13px] font-black tracking-widest uppercase transition-all border-b-[3px] ${
                  activeTab === tab ? "border-[#3d6ef5] text-[#3d6ef5]" : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6 items-start pb-28 lg:pb-6">
        {/* LEFT */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Overview */}
          <section ref={refs["Overview"]} className="bg-white scroll-mt-32 rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
            <h2 className="mb-5 text-[20px] font-black text-slate-800 tracking-tight">About this property</h2>
            <p className="text-[15px] leading-relaxed text-slate-600 font-medium">
              {hotel.description || "Experience unparalleled comfort at this exceptional property. Nestled in a prime location, our hotel offers world-class amenities, exquisite dining, and personalised service to make your stay truly memorable."}
            </p>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {["Free cancellation","Instant confirmation","Best price guarantee","24/7 support","Secure payments","No hidden charges"].map((text) => (
                <div key={text} className="flex items-center gap-2.5 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                  <FaCheckCircle className="text-emerald-500 shrink-0 text-[11px]" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Amenities */}
          <section ref={refs["Amenities"]} className="bg-white scroll-mt-32 rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
            <h2 className="mb-6 text-[20px] font-black text-slate-800 tracking-tight">Amenities & facilities</h2>
            {facilities.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {facilities.map((f) => {
                  const key  = f.toLowerCase().replace(/\s/g, "");
                  const item = AMENITY_MAP[key] || AMENITY_MAP[f] || { icon: <FaCheckCircle />, label: f };
                  return (
                    <div key={f} className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3.5 group hover:bg-white hover:border-[#3d6ef5]/20 hover:shadow-sm transition-all">
                      <span className="text-[#3d6ef5] text-lg shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">{item.icon}</span>
                      <span className="text-[13px] font-bold capitalize text-slate-700">{item.label || f}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Object.entries(AMENITY_MAP).slice(0, 8).map(([key, item]) => (
                  <div key={key} className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                    <span className="text-[#3d6ef5] text-base shrink-0">{item.icon}</span>
                    <span className="text-xs font-medium text-slate-600">{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Rooms */}
          <section id="rooms-section" ref={refs["Rooms"]} className="bg-white scroll-mt-32 rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h2 className="text-[20px] font-black text-slate-800 tracking-tight">Available rooms</h2>
              {selectedRoom && (
                <div className="flex items-center gap-2 bg-[#3d6ef5]/5 border border-[#3d6ef5]/20 rounded-2xl px-4 py-2 shadow-sm">
                  <FaCheckCircle className="text-[#3d6ef5] text-[11px]" />
                  <span className="text-xs font-black text-[#3d6ef5] uppercase tracking-wider">{selectedRoom.roomType} Selected</span>
                  <button onClick={() => setSelectedRoom(null)} className="ml-2 text-slate-300 hover:text-rose-500 transition-colors">
                    <FaTimes className="text-[10px]" />
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {roomsLoading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </div>
              ) : publicRooms.length === 0 ? (
                <div className="text-center py-12 rounded-3xl border-2 border-dashed border-slate-100">
                  <FaBed className="text-4xl text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No rooms found</p>
                </div>
              ) : (
                publicRooms.map((room) => (
                  <RoomCard
                    key={room._id}
                    room={room}
                    isSelected={selectedRoom?._id === room._id}
                    onSelect={handleSelectRoom}
                    onPreview={setPreviewRoom}
                    availability={availability}
                  />
                ))
              )}
            </div>
          </section>

          {/* Reviews */}
          {/* IMPROVEMENT: empty-state used hardcoded white rgba classes (invisible in light mode).
              Replaced with Tailwind slate utilities that work in both modes. */}
          <section ref={refs["Reviews"]} className="bg-white scroll-mt-32 rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <h2 className="text-[20px] font-black text-slate-800 tracking-tight">Guest reviews</h2>
              {displayRating && (
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-1.5 bg-amber-400 text-white px-2.5 py-1 rounded-xl">
                    <FaStar className="text-white text-[11px]" />
                    <span className="font-black text-[15px] leading-none">{displayRating}</span>
                  </div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">
                    ({totalReviews} Reviews)
                  </span>
                </div>
              )}
            </div>
            {hotelReviews.length > 0 ? (
              <div className="space-y-4">
                {hotelReviews.slice(0, 5).map((r, i) => (
                  <ReviewCard key={r._id || i} review={r} />
                ))}
                {hotelReviews.length > 5 && (
                  <button className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50">
                    View all {hotelReviews.length} reviews
                  </button>
                )}
              </div>
            ) : (
              // IMPROVEMENT: was text-white/35 + bg-white/8 → invisible on white bg.
              // Now uses proper slate utilities visible in both light and dark contexts.
              <div className="text-center py-8">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <FaStar className="text-xl text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-400">No reviews yet</p>
                <p className="mt-1 text-xs text-slate-400">Be the first to review this property</p>
              </div>
            )}
            <AddReviewForm hotelId={hotel._id} />
          </section>

          {/* Location & Policies */}
          <section ref={refs["Location & Policies"]} className="bg-white scroll-mt-32 rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
            <h2 className="mb-6 text-[20px] font-black text-slate-800 tracking-tight">Location Details</h2>
            <div className="mb-5 flex items-start gap-3 text-sm text-slate-500 font-medium">
              <div className="w-8 h-8 rounded-xl bg-[#3d6ef5]/10 flex items-center justify-center shrink-0">
                <FaMapMarkerAlt className="text-[#3d6ef5] text-xs" />
              </div>
              <span className="mt-1.5">{hotel.address}{cityName ? `, ${cityName}` : ""}</span>
            </div>
            <button
              onClick={openGoogleMaps}
              className="group relative h-52 w-full cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-inner transition-all hover:border-[#3d6ef5]/40"
            >
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80"
                alt="Map"
                className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900/40 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-2.5 rounded-2xl bg-white/95 backdrop-blur-md px-6 py-3 text-[13px] font-black text-[#3d6ef5] shadow-2xl transition-all group-hover:scale-110">
                  <FaMapMarkerAlt /> Find on Google Maps <FaExternalLinkAlt className="text-[10px]" />
                </div>
              </div>
            </button>

            <h2 className="mt-10 mb-6 text-[20px] font-black text-slate-800 tracking-tight">Hotel policies</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Check-in",    value: "From 2:00 PM",          icon: <FaCheckCircle className="text-emerald-500" /> },
                { label: "Check-out",   value: "Until 11:00 AM",        icon: <FaCheckCircle className="text-emerald-500" /> },
                { label: "Cancellation",value: "Free before check-in",  icon: <FaShieldAlt className="text-emerald-500" /> },
                { label: "Smoking",     value: "Not allowed",           icon: <MdSmokeFree className="text-rose-500" /> },
                { label: "Pets",        value: "Not allowed",           icon: <MdPets className="text-slate-400" /> },
                { label: "Payment",     value: "Card & UPI accepted",   icon: <FaCheckCircle className="text-emerald-500" /> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 hover:shadow-sm transition-shadow">
                  <span className="text-xl shrink-0 opacity-80">{icon}</span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
                    <p className="text-[13px] font-bold text-slate-700">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-slate-100">
              <a
                href={`tel:${hotel.phone || ""}`}
                className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-600 transition-all hover:text-[#3d6ef5] hover:border-[#3d6ef5]/30 shadow-sm"
              >
                <FaPhoneAlt className="text-[#3d6ef5] text-xs" /> Call Property
              </a>
              <a
                href={`mailto:${hotel.email || ""}`}
                className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-600 transition-all hover:text-[#3d6ef5] hover:border-[#3d6ef5]/30 shadow-sm"
              >
                <FaEnvelope className="text-[#3d6ef5] text-xs" /> Email Inquiries
              </a>
            </div>
          </section>
        </div>

        {/* RIGHT — booking widget */}
        <div ref={bookingRef} className="w-full lg:w-80 shrink-0">
          <BookingWidget
            hotel={hotel}
            onSelectRoom={handleSelectRoom}
            selectedRoom={selectedRoom}
            onClearRoom={() => setSelectedRoom(null)}
            onDatesChange={handleWidgetChange}
            onShowToast={showGenericToast}
          />
        </div>
      </div>

      {/* IMPROVEMENT: mobile sticky booking bar ─────────────────────────────────
          On mobile the BookingWidget is below all sections, making it impossible
          to start a booking without scrolling to the very bottom. This fixed bar
          sits above the device nav and gives instant access on all screen sizes.
          Hidden on lg (desktop) where the widget is already sticky in the sidebar. */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {selectedRoom ? "Selected" : "From"}
            </p>
            <p className="text-lg font-black text-slate-800 leading-tight">
              ₹{displayPrice.toLocaleString()}
              <span className="text-xs font-medium text-slate-400 ml-1">/ night</span>
            </p>
            {selectedRoom && (
              <p className="text-[10px] text-[#3d6ef5] font-bold capitalize">{selectedRoom.roomType}</p>
            )}
          </div>
          <button
            onClick={() => {
              if (selectedRoom) {
                bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
              } else {
                document.getElementById("rooms-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            className="flex-1 max-w-52 py-3.5 rounded-2xl font-bold text-sm text-white bg-linear-to-r from-[#c67c4e] to-[#b86c3d] hover:from-[#b06d42] hover:to-[#9e5b33] transition-all active:scale-[0.98] shadow-lg shadow-[#c67c4e]/30 text-center"
          >
            {selectedRoom ? "Complete Booking" : "Choose a Room"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelDetailPage;