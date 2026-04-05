import { useEffect, useRef, useState } from "react";
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

// ── Amenity icon map ──────────────────────────────────────────────────────────
const AMENITY_MAP = {
  wifi: { icon: <FaWifi />, label: "Free WiFi" },
  pool: { icon: <MdPool />, label: "Swimming Pool" },
  parking: { icon: <FaParking />, label: "Free Parking" },
  restaurant: { icon: <MdRestaurant />, label: "Restaurant" },
  ac: { icon: <FaSnowflake />, label: "Air Conditioning" },
  spa: { icon: <FaSpa />, label: "Spa & Wellness" },
  gym: { icon: <FaDumbbell />, label: "Fitness Centre" },
  laundry: { icon: <MdOutlineLocalLaundryService />, label: "Laundry" },
  roomservice: { icon: <MdRoomService />, label: "Room Service" },
  breakfast: { icon: <MdFreeBreakfast />, label: "Breakfast" },
  tv: { icon: <FaTv />, label: "Smart TV" },
  concierge: { icon: <FaConciergeBell />, label: "Concierge" },
};

const getToday = () => new Date().toISOString().split("T")[0];
const getTomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};
const nightsBetween = (a, b) =>
  Math.max(1, Math.round((new Date(b) - new Date(a)) / 86400000));

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
  <div className="animate-pulse min-h-screen bg-slate-50">
    <div className="h-14 bg-white border-b border-slate-200" />
    <div className="h-75 sm:h-105 bg-slate-200 w-full mt-0" />
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-4">
        <div className="h-8 bg-slate-200 rounded-xl w-2/3" />
        <div className="h-4 bg-slate-100 rounded w-1/3" />
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="w-full lg:w-80 shrink-0 h-72 bg-slate-200 rounded-2xl" />
    </div>
  </div>
);

// ── Image Gallery ─────────────────────────────────────────────────────────────
const Lightbox = ({ imgs, lightbox, setLightbox }) => (
  <div
    className="fixed inset-0 z-200 bg-black/93 flex items-center justify-center"
    onClick={() => setLightbox(null)}
  >
    <button
      className="absolute top-4 right-4 text-white text-2xl bg-white/10 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/20"
      onClick={() => setLightbox(null)}
    >
      ✕
    </button>
    <button
      className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white bg-white/10 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/20"
      onClick={(e) => { e.stopPropagation(); setLightbox((l) => Math.max(0, l - 1)); }}
    >
      <FaChevronLeft />
    </button>
    <img
      src={imgs[lightbox]}
      alt=""
      className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl"
      onClick={(e) => e.stopPropagation()}
    />
    <button
      className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-white bg-white/10 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/20"
      onClick={(e) => { e.stopPropagation(); setLightbox((l) => Math.min(imgs.length - 1, l + 1)); }}
    >
      <FaChevronRight />
    </button>
    <p className="absolute bottom-4 text-white/60 text-sm">
      {lightbox + 1} / {imgs.length}
    </p>
  </div>
);

const ImageGallery = ({ images, name }) => {
  const [lightbox, setLightbox] = useState(null);
  const imgs = (images || []).filter(Boolean);
  const count = imgs.length;

  if (count === 0)
    return (
      <div className="h-55 sm:h-70 w-full bg-slate-100 rounded-2xl flex flex-col items-center justify-center border border-slate-200">
        <FaMapMarkerAlt className="text-slate-300 text-3xl mb-2" />
        <p className="text-slate-400 text-sm font-medium">No photos uploaded yet</p>
      </div>
    );

  if (count === 1)
    return (
      <>
        <div className="h-65 sm:h-105 w-full rounded-2xl overflow-hidden cursor-pointer group" onClick={() => setLightbox(0)}>
          <img src={imgs[0]} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        {lightbox !== null && <Lightbox imgs={imgs} lightbox={lightbox} setLightbox={setLightbox} />}
      </>
    );

  if (count === 2)
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 h-105 sm:h-105 w-full">
          {imgs.map((src, i) => (
            <div key={i} className={`relative overflow-hidden cursor-pointer group ${i === 0 ? "sm:rounded-l-2xl rounded-t-2xl sm:rounded-t-none" : "sm:rounded-r-2xl rounded-b-2xl sm:rounded-b-none"}`} onClick={() => setLightbox(i)}>
              <img src={src} alt={`${name} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
        {lightbox !== null && <Lightbox imgs={imgs} lightbox={lightbox} setLightbox={setLightbox} />}
      </>
    );

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 grid-rows-4 sm:grid-rows-2 gap-1.5 h-105 sm:h-105 w-full">
        <div className="col-span-2 row-span-2 relative overflow-hidden rounded-t-2xl sm:rounded-l-2xl sm:rounded-t-none cursor-pointer group" onClick={() => setLightbox(0)}>
          <img src={imgs[0]} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
        {[1, 2].map((i) => (
          <div key={i} className={`relative overflow-hidden cursor-pointer group ${i === 2 ? "sm:rounded-tr-2xl" : ""}`} onClick={() => setLightbox(i)}>
            <img src={imgs[i]} alt={`${name} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        ))}
        {[3, 4].map((i) => (
          imgs[i] ? (
            <div key={i} className={`relative overflow-hidden cursor-pointer group ${i === 4 ? "rounded-b-2xl sm:rounded-br-2xl sm:rounded-b-none" : ""}`} onClick={() => setLightbox(i)}>
              <img src={imgs[i]} alt={`${name} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {i === 4 && count > 5 && (
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center rounded-br-2xl">
                  <span className="text-white font-bold text-lg">+{count - 5} photos</span>
                </div>
              )}
            </div>
          ) : null
        ))}
      </div>
      {lightbox !== null && <Lightbox imgs={imgs} lightbox={lightbox} setLightbox={setLightbox} />}
    </>
  );
};

// ── Room image slider ─────────────────────────────────────────────────────────
const RoomImageSlider = ({ images }) => {
  const [idx, setIdx] = useState(0);
  const imgs = images?.length
    ? images
    : [
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&q=80",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500&q=80",
        "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=500&q=80",
      ];

  return (
    <div className="relative w-full sm:w-44 h-48 sm:h-full shrink-0 overflow-hidden bg-slate-100 group">
      <img src={imgs[idx]} alt="room" className="w-full h-full object-cover transition-opacity duration-300" />
      {imgs.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((i) => Math.max(0, i - 1)); }}
            className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all ${idx === 0 ? "opacity-30 cursor-not-allowed" : ""}`}
          >
            <FaChevronLeft className="text-[9px]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((i) => Math.min(imgs.length - 1, i + 1)); }}
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all ${idx === imgs.length - 1 ? "opacity-30 cursor-not-allowed" : ""}`}
          >
            <FaChevronRight className="text-[9px]" />
          </button>
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
            {imgs.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }} className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? "bg-white w-3" : "bg-white/50"}`} />
            ))}
          </div>
          <div className="absolute top-2 right-2 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium">
            {idx + 1}/{imgs.length}
          </div>
        </>
      )}
    </div>
  );
};

// ── Selected Room Banner inside Booking Widget ────────────────────────────────
const SelectedRoomBanner = ({ room, onClear }) => (
  <div className="mx-4 mb-0 -mt-1">
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 flex items-center gap-2">
      <FaCheckCircle className="text-emerald-500 shrink-0 text-sm" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Room Selected</p>
        <p className="text-xs text-emerald-800 font-semibold truncate capitalize">{room.roomType}</p>
      </div>
      <button
        onClick={onClear}
        className="w-5 h-5 rounded-full bg-emerald-200 hover:bg-emerald-300 flex items-center justify-center transition-colors shrink-0"
      >
        <FaTimes className="text-[8px] text-emerald-700" />
      </button>
    </div>
  </div>
);

// ── Sticky Booking Widget ─────────────────────────────────────────────────────
const BookingWidget = ({ hotel, onSelectRoom, selectedRoom, onClearRoom }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { availability } = useSelector((s) => s.hotelBooking);
  const [checkIn, setCheckIn] = useState(getToday());
  const [checkOut, setCheckOut] = useState(getTomorrow());
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [prevPrice, setPrevPrice] = useState(null);
  const [priceChanged, setPriceChanged] = useState(false);

  const nights = nightsBetween(checkIn, checkOut);
  const pricePerNight =
    selectedRoom?.pricePerNight ?? hotel?.pricePerNight ?? hotel?.price ?? 3499;
  const total = pricePerNight * nights * rooms;
  const taxes = Math.round(total * 0.12);

  const {
    loading: bookingLoading,
    success: bookingSuccess,
    error: bookingError,
  } = useSelector((s) => s.hotelBooking);

  // Animate price change when room is selected
  useEffect(() => {
    if (prevPrice !== null && prevPrice !== pricePerNight) {
      setPriceChanged(true);
      const t = setTimeout(() => setPriceChanged(false), 600);
      return () => clearTimeout(t);
    }
    setPrevPrice(pricePerNight);
  }, [pricePerNight]);

  useEffect(() => {
    dispatch(resetBookingState());
  }, []);

  const handleBook = () => {
    navigate("/my-booking");
    if (!selectedRoom) return;
    if (guests > selectedRoom.capacity) {
      alert(`Max ${selectedRoom.capacity} guests allowed for this room`);
      return;
    }
    dispatch(
      bookRoom({
        hotelId: hotel._id,
        roomType: selectedRoom._id || null,
        bookedRooms: rooms,
        checkIn,
        checkOut,
        guests,
        totalAmount: total + taxes,
      }),
    );
  };

  useEffect(() => {
    if (hotel?._id && checkIn && checkOut) {
      dispatch(getRoomAvailability({ hotelId: hotel._id, checkIn, checkOut }));
    }
  }, [checkIn, checkOut, hotel?._id]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden lg:sticky lg:top-24">
      {/* Header */}
      <div className="bg-[#1a3a6b] px-5 py-4">
        <p className="text-blue-200 text-xs font-medium mb-0.5">
          {selectedRoom ? "Selected room price" : "Starting from"}
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <span
            className={`text-3xl font-extrabold text-white transition-all duration-300 ${priceChanged ? "scale-110 text-amber-300" : ""}`}
            style={{ display: "inline-block" }}
          >
            ₹{pricePerNight.toLocaleString()}
          </span>
          <span className="text-blue-200 text-sm mb-1">/ night</span>
        </div>
        {selectedRoom && (
          <p className="text-blue-100 text-[11px] mt-0.5 font-semibold capitalize">
            {selectedRoom.roomType}
          </p>
        )}
        <p className="text-blue-200 text-[11px] mt-0.5">
          +₹{Math.round(pricePerNight * 0.12).toLocaleString()} taxes & fees
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
              title="Clear selection"
            >
              <FaTimes className="text-[8px] text-emerald-700" />
            </button>
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              label: "Check-in",
              val: checkIn,
              min: getToday(),
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
              <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">{label}</p>
              <div className="relative">
                <FaCalendarAlt className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                <input
                  type="date"
                  value={val}
                  min={min}
                  onChange={(e) => set(e.target.value)}
                  className="w-full pl-7 pr-2 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 bg-slate-50"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Rooms & Guests */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Rooms", val: rooms, set: setRooms },
            { label: "Guests", val: guests, set: setGuests },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1">{label}</p>
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                <button onClick={() => set((v) => Math.max(1, v - 1))} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100">
                  <FaMinus className="text-[9px]" />
                </button>
                <span className="flex-1 text-center text-sm font-bold text-slate-800">{val}</span>
                <button onClick={() => set((v) => Math.min(10, v + 1))} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100">
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
        <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 border border-slate-100">
          <div className="flex justify-between text-xs text-slate-600">
            <span>
              ₹{pricePerNight.toLocaleString()} × {nights} night{nights > 1 ? "s" : ""} × {rooms} room{rooms > 1 ? "s" : ""}
            </span>
            <span>₹{total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-600">
            <span>Taxes & fees (12%)</span>
            <span>₹{taxes.toLocaleString()}</span>
          </div>
          <div className="h-px bg-slate-200 my-1" />
          <div className="flex justify-between text-sm font-extrabold text-slate-900">
            <span>Total</span>
            <span>₹{(total + taxes).toLocaleString()}</span>
          </div>
        </div>

        {/* CTA */}
        {!selectedRoom ? (
          <button
            onClick={() => {
              // Scroll to rooms section
              document.getElementById("rooms-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="w-full font-bold py-3 rounded-xl shadow-md transition-all text-sm border-2 border-[#1a3a6b] text-[#1a3a6b] hover:bg-[#1a3a6b] hover:text-white active:scale-95"
          >
            Select a Room First
          </button>
        ) : (
          <button
            onClick={handleBook}
            disabled={bookingLoading || (selectedRoom && guests > selectedRoom.capacity)}
            className={`w-full font-bold py-3 rounded-xl shadow-md transition-all text-sm 
              ${bookingLoading || (selectedRoom && guests > selectedRoom.capacity)
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-[#1a3a6b] hover:bg-[#14305a] active:scale-95 text-white hover:shadow-lg"
              }`}
          >
            {bookingLoading ? "Booking..." : "Book Now"}
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
  <div className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-[#1a3a6b]/10 flex items-center justify-center text-[#1a3a6b] font-bold text-sm shrink-0">
          {(review.user?.name || review.userName || "G")[0].toUpperCase()}
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-800">{review.user?.name || review.userName || "Guest"}</p>
          <p className="text-[10px] text-slate-400">
            {review.createdAt
              ? new Date(review.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
              : review.date || "Recent stay"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-lg px-2 py-0.5">
        <FaStar className="text-amber-400 text-[9px]" />
        <span className="text-xs font-bold text-amber-700">{review.rating}</span>
      </div>
    </div>
    <p className="text-xs text-slate-600 leading-relaxed">{review.comment || review.review}</p>
  </div>
);

// ── Add Review Form ───────────────────────────────────────────────────────────
const AddReviewForm = ({ hotelId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { submitLoading, submitSuccess, submitError } = useSelector((s) => s.review);
  const { user } = useSelector((s) => s.user);
  const [rating, setRating] = useState(0);
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
      <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
        <p className="text-sm text-slate-500">
          <button onClick={() => navigate("/login")} className="text-[#1a3a6b] font-semibold hover:underline">Login</button>{" "}
          to write a review
        </p>
      </div>
    );

  return (
    <div className="mt-5 border-t border-slate-100 pt-5">
      <h3 className="text-sm font-bold text-slate-800 mb-3">Write a Review</h3>
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(star)}
            className="text-2xl transition-transform hover:scale-110"
          >
            <FaStar className={star <= (hovered || rating) ? "text-amber-400" : "text-slate-200"} />
          </button>
        ))}
        {rating > 0 && <span className="text-xs text-slate-500 ml-2">{rating}/5</span>}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        rows={3}
        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 resize-none"
      />
      {submitSuccess && <p className="text-emerald-600 text-xs font-semibold mt-2">✓ Review submitted! It will appear after approval.</p>}
      {submitError && <p className="text-rose-500 text-xs mt-2">{submitError}</p>}
      <button
        disabled={!rating || !comment.trim() || submitLoading}
        onClick={() => dispatch(addHotelReview({ hotelId, rating, comment }))}
        className={`mt-3 px-5 py-2 rounded-xl text-white text-xs font-bold transition-all
          ${!rating || !comment.trim() || submitLoading ? "bg-slate-300 cursor-not-allowed" : "bg-[#1a3a6b] hover:bg-[#14305a] active:scale-95"}`}
      >
        {submitLoading ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
};

// ── Room Card ─────────────────────────────────────────────────────────────────
const RoomCard = ({ room, isSelected, onSelect, onPreview, availability }) => {
  const roomAvail = availability?.find?.((a) => a._id === room._id);
  const availableRooms = roomAvail?.availableRooms ?? room.totalRooms;
  const isSoldOut = availableRooms === 0;

  return (
    <div
      className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
        isSelected
          ? "border-[#1a3a6b] shadow-lg shadow-[#1a3a6b]/10 scale-[1.01]"
          : isSoldOut
          ? "border-slate-200 opacity-60"
          : "border-slate-200 hover:border-slate-300 hover:shadow-md"
      }`}
    >
      {/* Selected indicator strip */}
      {isSelected && (
        <div className="bg-[#1a3a6b] px-4 py-1.5 flex items-center gap-2">
          <FaCheckCircle className="text-white text-xs" />
          <span className="text-white text-[11px] font-bold tracking-wide">ROOM SELECTED — Scroll up to book</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row">
        {/* Image — clickable to open preview modal */}
        <div
          className="relative w-full sm:w-44 shrink-0 cursor-pointer group"
          onClick={() => onPreview(room)}
        >
          <RoomImageSlider images={room.images} />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center pointer-events-none">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 text-[#1a3a6b] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
              Preview
            </span>
          </div>
          {isSelected && (
            <div className="absolute inset-0 ring-2 ring-inset ring-[#1a3a6b]/30 pointer-events-none" />
          )}
        </div>

        {/* Details */}
        <div className="flex-1 p-4 flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <button
                onClick={() => onPreview(room)}
                className="font-bold text-slate-900 text-sm capitalize hover:text-[#1a3a6b] hover:underline underline-offset-2 transition-colors text-left"
              >
                {room.roomType}
              </button>
              {isSelected && (
                <span className="text-[9px] bg-[#1a3a6b] text-white font-bold px-2 py-0.5 rounded-full">SELECTED</span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Max {room.capacity} guests · {room.totalRooms} rooms total
            </p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(room.amenities || []).slice(0, 4).map((f) => (
                <span key={f} className="text-[10px] bg-slate-50 border border-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">
                  {f}
                </span>
              ))}
              {(room.amenities || []).length > 4 && (
                <button
                  onClick={() => onPreview(room)}
                  className="text-[10px] text-[#1a3a6b] font-semibold hover:underline"
                >
                  +{room.amenities.length - 4} more
                </button>
              )}
            </div>
            {availableRooms <= 5 && availableRooms > 0 && (
              <span className="text-[10px] text-orange-600 font-semibold">🔥 Only {availableRooms} rooms left!</span>
            )}
            {isSoldOut && (
              <span className="text-[10px] text-rose-600 font-semibold">Sold Out</span>
            )}
          </div>

          <div className="flex flex-row sm:flex-col items-end sm:items-end justify-between sm:justify-start gap-2 shrink-0 w-full sm:w-auto">
            <div className="sm:text-right">
              <p className="text-xl font-extrabold text-slate-900">₹{room.pricePerNight.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400">per night + taxes</p>
            </div>

            <div className="flex flex-col gap-1.5 items-end">
              {/* Preview button */}
              <button
                onClick={() => onPreview(room)}
                className="text-[#1a3a6b] border border-[#1a3a6b]/30 bg-[#1a3a6b]/5 hover:bg-[#1a3a6b]/10 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all w-full text-center"
              >
                📸 Preview Room
              </button>

              {!isSoldOut ? (
                isSelected ? (
                  <button
                    onClick={() => onSelect(null)}
                    className="text-[#1a3a6b] border-2 border-[#1a3a6b] text-xs font-bold px-4 py-2 rounded-xl transition-all min-w-[7rem] hover:bg-[#1a3a6b]/5 active:scale-95 flex items-center gap-1.5 justify-center"
                  >
                    <FaCheckCircle className="text-[10px]" />
                    Selected
                  </button>
                ) : (
                  <button
                    onClick={() => onSelect(room)}
                    className="bg-[#1a3a6b] hover:bg-[#14305a] active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition-all min-w-[7rem] flex items-center gap-1.5 justify-center"
                  >
                    <FaBed className="text-[10px]" />
                    Select Room
                  </button>
                )
              ) : (
                <button disabled className="bg-slate-400 cursor-not-allowed text-white text-xs font-bold px-4 py-2 rounded-xl min-w-[7rem]">
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

// ── Toast notification ────────────────────────────────────────────────────────
const RoomSelectedToast = ({ room, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce-once">
      <div className="bg-[#1a3a6b] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 whitespace-nowrap">
        <FaCheckCircle className="text-emerald-300 text-base shrink-0" />
        <div>
          <p className="text-xs font-bold capitalize">{room.roomType} selected!</p>
          <p className="text-[10px] text-blue-200">Scroll up to complete your booking</p>
        </div>
        <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
          <FaTimes className="text-xs" />
        </button>
      </div>
    </div>
  );
};

const TABS = ["Overview", "Amenities", "Rooms", "Reviews", "Location & Policies"];

// ── Main Page ─────────────────────────────────────────────────────────────────
const HotelDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const bookingRef = useRef(null);
  const [wishlist, setWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [previewRoom, setPreviewRoom] = useState(null);

  const refs = {
    Overview: useRef(null),
    Amenities: useRef(null),
    Rooms: useRef(null),
    Reviews: useRef(null),
    "Location & Policies": useRef(null),
  };

  const { hotels, loading, error } = useSelector((s) => s.hotel);
  const hotel = hotels?.find((h) => h._id === id);

  const { publicRooms, loading: roomsLoading } = useSelector((s) => s.room);
  const { hotelReviews } = useSelector((s) => s.review);
  const { availability } = useSelector((s) => s.hotelBooking);

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

  const scrollTo = (tab) => {
    setActiveTab(tab);
    refs[tab]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSelectRoom = (room) => {
    if (!room) {
      setSelectedRoom(null);
      return;
    }
    setSelectedRoom(room);
    setShowToast(true);
    // Scroll booking widget into view (right column on desktop)
    setTimeout(() => {
      bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const openGoogleMaps = () => {
    const coords = hotel?.location?.coordinates;
    let url;
    if (coords && coords[0] && coords[1]) {
      url = `https://www.google.com/maps?q=${coords[1]},${coords[0]}`;
    } else {
      const query = encodeURIComponent(`${hotel.name}, ${hotel.address}`);
      url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading && (!hotels || hotels.length === 0)) return <DetailSkeleton />;

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaMapMarkerAlt className="text-rose-300 text-2xl" />
          </div>
          <h3 className="font-bold text-slate-700 mb-2">Something went wrong</h3>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button onClick={() => navigate(-1)} className="bg-[#1a3a6b] text-white px-6 py-2 rounded-xl text-sm font-semibold">Go Back</button>
        </div>
      </div>
    );

  if (!hotel)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaMapMarkerAlt className="text-slate-300 text-2xl" />
          </div>
          <h3 className="font-bold text-slate-700 mb-2">Hotel not found</h3>
          <button onClick={() => navigate(-1)} className="bg-[#1a3a6b] text-white px-6 py-2 rounded-xl text-sm font-semibold">Back to results</button>
        </div>
      </div>
    );

  const facilities = hotel.facilities || hotel.amenities || [];
  const cityName = hotel.city?.name || (typeof hotel.city === "string" ? hotel.city : "");
  const avgRating = +(hotel.averageRating ?? hotel.rating ?? 0);
  const displayRating = avgRating > 0 ? avgRating.toFixed(1) : null;
  const totalReviews = hotel.totalReviews ?? hotel.reviews?.length ?? 0;
  const pricePerNight = hotel.pricePerNight ?? hotel.price ?? 3499;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {showToast && selectedRoom && (
        <RoomSelectedToast room={selectedRoom} onClose={() => setShowToast(false)} />
      )}

      {/* Room Preview Modal */}
      <RoomPreviewModal
        room={previewRoom}
        isOpen={!!previewRoom}
        onClose={() => setPreviewRoom(null)}
        onSelectRoom={(room) => {
          handleSelectRoom(room);
          setPreviewRoom(null);
        }}
        isSelected={!!(previewRoom && selectedRoom?._id === previewRoom._id)}
      />

      {/* Navbar */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-[#1a3a6b] transition-colors text-sm font-semibold"
          >
            <FaChevronLeft className="text-xs" /> Back
          </button>
          <div className="flex-1 min-w-0 hidden sm:block">
            <p className="text-sm font-bold text-slate-900 truncate">{hotel.name}</p>
            <p className="text-xs text-slate-400 truncate">{hotel.address}{cityName ? `, ${cityName}` : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            {selectedRoom && (
              <div className="hidden sm:flex items-center gap-1.5 bg-[#1a3a6b]/5 border border-[#1a3a6b]/20 px-3 py-1.5 rounded-xl">
                <FaBed className="text-[#1a3a6b] text-xs" />
                <span className="text-xs font-semibold text-[#1a3a6b] capitalize truncate max-w-28">{selectedRoom.roomType}</span>
                <span className="text-[#1a3a6b] font-bold text-xs">· ₹{selectedRoom.pricePerNight.toLocaleString()}</span>
              </div>
            )}
            <button
              onClick={() => setWishlist(!wishlist)}
              className="flex items-center gap-1.5 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              {wishlist ? <FaHeart className="text-rose-500" /> : <FaRegHeart />}
              <span className="hidden sm:inline">Save</span>
            </button>
            <button
              onClick={() => navigator.share?.({ title: hotel.name, url: window.location.href })}
              className="flex items-center gap-1.5 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
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
      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {hotel.status === "active" && (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Available</span>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight mb-2">{hotel.name}</h1>
        <button
          onClick={openGoogleMaps}
          className="flex items-start sm:items-center gap-1.5 text-sm text-slate-500 hover:text-[#1a3a6b] transition-colors mb-3 group text-left"
        >
          <FaMapMarkerAlt className="text-[#1a3a6b] text-xs shrink-0" />
          <span className="group-hover:underline">{hotel.address}{cityName ? `, ${cityName}` : ""}</span>
          <FaExternalLinkAlt className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        <div className="flex flex-wrap items-center gap-3">
          {displayRating ? (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-[#1a3a6b] text-white px-3 py-1.5 rounded-xl">
                <FaStar className="text-amber-300 text-xs" />
                <span className="font-extrabold text-sm">{displayRating}</span>
                <span className="text-blue-200 text-xs">/ 5</span>
              </div>
              {totalReviews > 0 && (
                <span className="text-sm text-slate-500">{totalReviews} {totalReviews === 1 ? "review" : "reviews"}</span>
              )}
              <StarRating rating={avgRating} size="text-xs" />
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No ratings yet</span>
          )}
          <div className="flex flex-wrap gap-1.5">
            {facilities.slice(0, 3).map((f) => (
              <span key={f} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium capitalize">{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky tabs */}
      <div className="sticky top-14 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => scrollTo(tab)}
                className={`shrink-0 px-4 py-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap
                  ${activeTab === tab ? "border-[#1a3a6b] text-[#1a3a6b]" : "border-transparent text-slate-500 hover:text-slate-800"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Overview */}
          <section ref={refs["Overview"]} className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm scroll-mt-28">
            <h2 className="text-lg font-bold text-slate-900 mb-3">About this property</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {hotel.description || "Experience unparalleled comfort at this exceptional property. Nestled in a prime location, our hotel offers world-class amenities, exquisite dining, and personalised service to make your stay truly memorable."}
            </p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {["Free cancellation", "Instant confirmation", "Best price guarantee", "24/7 support", "Secure payments", "No hidden charges"].map((text) => (
                <div key={text} className="flex items-center gap-2 text-xs text-slate-600">
                  <FaCheckCircle className="text-emerald-500 shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Amenities */}
          <section ref={refs["Amenities"]} className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm scroll-mt-28">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Amenities & facilities</h2>
            {facilities.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {facilities.map((f) => {
                  const key = f.toLowerCase().replace(/\s/g, "");
                  const item = AMENITY_MAP[key] || AMENITY_MAP[f] || { icon: <FaCheckCircle />, label: f };
                  return (
                    <div key={f} className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                      <span className="text-[#1a3a6b] text-base shrink-0">{item.icon}</span>
                      <span className="text-xs text-slate-700 font-medium capitalize">{item.label || f}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Object.entries(AMENITY_MAP).slice(0, 8).map(([key, item]) => (
                  <div key={key} className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                    <span className="text-[#1a3a6b] text-base shrink-0">{item.icon}</span>
                    <span className="text-xs text-slate-700 font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Rooms */}
          <section
            id="rooms-section"
            ref={refs["Rooms"]}
            className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm scroll-mt-28"
          >
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-lg font-bold text-slate-900">Available rooms</h2>
              {selectedRoom && (
                <div className="flex items-center gap-2 bg-[#1a3a6b]/5 border border-[#1a3a6b]/20 rounded-xl px-3 py-1.5">
                  <FaCheckCircle className="text-[#1a3a6b] text-xs" />
                  <span className="text-xs font-semibold text-[#1a3a6b] capitalize">{selectedRoom.roomType} selected</span>
                  <button onClick={() => setSelectedRoom(null)} className="text-slate-400 hover:text-slate-600 ml-1">
                    <FaTimes className="text-[9px]" />
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {roomsLoading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : publicRooms.length === 0 ? (
                <p className="text-slate-400 text-sm">No rooms available</p>
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
          <section ref={refs["Reviews"]} className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm scroll-mt-28">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="text-lg font-bold text-slate-900">Guest reviews</h2>
              {displayRating && (
                <div className="flex items-center gap-2 bg-[#1a3a6b] text-white px-3 py-1.5 rounded-xl">
                  <FaStar className="text-amber-300 text-xs" />
                  <span className="font-extrabold text-sm">{displayRating}</span>
                  <span className="text-blue-200 text-xs">({totalReviews})</span>
                </div>
              )}
            </div>
            {hotelReviews.length > 0 ? (
              <div className="space-y-4">
                {hotelReviews.slice(0, 5).map((r, i) => <ReviewCard key={r._id || i} review={r} />)}
                {hotelReviews.length > 5 && (
                  <button className="w-full py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                    View all {hotelReviews.length} reviews
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaStar className="text-slate-300 text-xl" />
                </div>
                <p className="text-slate-500 text-sm font-medium">No reviews yet</p>
                <p className="text-slate-400 text-xs mt-1">Be the first to review this property</p>
              </div>
            )}
            <AddReviewForm hotelId={hotel._id} />
          </section>

          {/* Location & Policies */}
          <section ref={refs["Location & Policies"]} className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm scroll-mt-28">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Location</h2>
            <p className="text-sm text-slate-600 mb-3 flex items-start gap-2">
              <FaMapMarkerAlt className="text-[#1a3a6b] mt-0.5 shrink-0" />
              {hotel.address}{cityName ? `, ${cityName}` : ""}
            </p>
            <button
              onClick={openGoogleMaps}
              className="w-full h-44 bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200 group cursor-pointer hover:border-[#1a3a6b]/30 transition-all"
            >
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80" alt="Map" className="w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/95 backdrop-blur px-4 sm:px-5 py-2.5 rounded-full text-[11px] sm:text-xs font-bold text-[#1a3a6b] flex items-center gap-2 shadow-md group-hover:shadow-lg transition-all">
                  <FaMapMarkerAlt className="text-[#1a3a6b]" />
                  Open in Google Maps
                  <FaExternalLinkAlt className="text-[9px]" />
                </div>
              </div>
            </button>

            <h2 className="text-lg font-bold text-slate-900 mt-6 mb-4">Hotel policies</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Check-in", value: "From 2:00 PM", icon: <FaCheckCircle className="text-emerald-500" /> },
                { label: "Check-out", value: "Until 11:00 AM", icon: <FaCheckCircle className="text-emerald-500" /> },
                { label: "Cancellation", value: "Free before check-in", icon: <FaShieldAlt className="text-emerald-500" /> },
                { label: "Smoking", value: "Not allowed", icon: <MdSmokeFree className="text-rose-500" /> },
                { label: "Pets", value: "Not allowed", icon: <MdPets className="text-slate-400" /> },
                { label: "Payment", value: "Card & UPI accepted", icon: <FaCheckCircle className="text-emerald-500" /> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-base shrink-0">{icon}</span>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
                    <p className="text-xs text-slate-700 font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <a href={`tel:${hotel.phone || ""}`} className="flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                <FaPhoneAlt className="text-[#1a3a6b] text-xs" /> Call Hotel
              </a>
              <a href={`mailto:${hotel.email || ""}`} className="flex items-center gap-2 border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                <FaEnvelope className="text-[#1a3a6b] text-xs" /> Email Hotel
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
          />
        </div>
      </div>
    </div>
  );
};

export default HotelDetailPage;