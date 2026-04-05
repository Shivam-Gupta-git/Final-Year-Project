import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaBath,
  FaBed,
  FaChevronLeft,
  FaChevronRight,
  FaCompass,
  FaExpand,
  FaRulerCombined,
  FaTimes,
  FaUsers,
  FaCheckCircle,
  FaWifi,
  FaSnowflake,
  FaTv,
  FaConciergeBell,
} from "react-icons/fa";
import { MdFreeBreakfast, MdRoomService } from "react-icons/md";

// ─── Amenity icon resolver ────────────────────────────────────────────────────
const AMENITY_ICONS = {
  wifi: <FaWifi />,
  ac: <FaSnowflake />,
  tv: <FaTv />,
  breakfast: <MdFreeBreakfast />,
  roomservice: <MdRoomService />,
  concierge: <FaConciergeBell />,
};

const resolveAmenityIcon = (name) => {
  const key = name.toLowerCase().replace(/\s/g, "");
  return AMENITY_ICONS[key] || <FaCheckCircle />;
};

// ─── Fallback images ──────────────────────────────────────────────────────────
const FALLBACK_IMGS = [
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=90",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&q=90",
  "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=1200&q=90",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=90",
];

// ─── Swipe direction helper ───────────────────────────────────────────────────
const SWIPE_THRESHOLD = 50;
const swipeDirection = (offset) => {
  if (offset < -SWIPE_THRESHOLD) return 1;   // left swipe → next
  if (offset > SWIPE_THRESHOLD) return -1;   // right swipe → prev
  return 0;
};

// ─── Image slide variants ─────────────────────────────────────────────────────
const slideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 35 },
  },
  exit: (dir) => ({
    x: dir > 0 ? "-100%" : "100%",
    opacity: 0,
    transition: { type: "spring", stiffness: 300, damping: 35 },
  }),
};

// ─── Modal backdrop variants ──────────────────────────────────────────────────
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 24 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: "spring", stiffness: 380, damping: 32, delay: 0.04 },
  },
  exit: {
    opacity: 0, scale: 0.94, y: 16,
    transition: { duration: 0.18, ease: "easeIn" },
  },
};

// ─── RoomPreviewModal ─────────────────────────────────────────────────────────
const RoomPreviewModal = ({ room, isOpen, onClose, onSelectRoom, isSelected }) => {
  const imgs = room?.images?.length ? room.images : FALLBACK_IMGS;
  const [[idx, dir], setPage] = useState([0, 0]);
  const touchStartX = useRef(null);
  const thumbnailRef = useRef(null);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "ArrowLeft") paginate(-1);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, idx]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setPage([0, 0]); // reset on close
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Scroll active thumbnail into view
  useEffect(() => {
    const container = thumbnailRef.current;
    if (!container) return;
    const active = container.children[idx];
    if (active) active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [idx]);

  const paginate = useCallback((newDir) => {
    setPage(([cur]) => {
      const next = cur + newDir;
      if (next < 0 || next >= imgs.length) return [cur, 0]; // no-op at edges
      return [next, newDir];
    });
  }, [imgs.length]);

  const goTo = (i) => {
    setPage(([cur]) => [i, i > cur ? 1 : -1]);
  };

  // Touch handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    const sd = swipeDirection(-delta);
    if (sd !== 0) paginate(-sd);
    touchStartX.current = null;
  };

  if (!room) return null;

  const amenities = room.amenities || [];

  // Room metadata with sensible fallbacks
  const meta = [
    { icon: <FaRulerCombined />, label: "Area", value: room.areaSqFt ? `${room.areaSqFt} sq ft` : "320 sq ft" },
    { icon: <FaCompass />, label: "View", value: room.view || "Garden view" },
    { icon: <FaBed />, label: "Bed", value: room.bedType || "King bed" },
    { icon: <FaBath />, label: "Bathrooms", value: room.bathrooms ? `${room.bathrooms} bath` : "1 bath" },
    { icon: <FaUsers />, label: "Capacity", value: `Up to ${room.capacity || 2} guests` },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        // Backdrop
        <motion.div
          key="modal-backdrop"
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6"
          style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(5,10,20,0.75)" }}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          {/* Modal panel */}
          <motion.div
            key="modal-panel"
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Close button ── */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="absolute top-3.5 right-3.5 z-30 w-9 h-9 bg-white/90 backdrop-blur border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 shadow-md"
            >
              <FaTimes className="text-xs" />
            </motion.button>

            {/* ── Image count pill ── */}
            <div className="absolute top-3.5 left-3.5 z-30 bg-black/50 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
              <FaExpand className="text-[9px]" />
              {idx + 1} / {imgs.length}
            </div>

            {/* ═══════════════ CAROUSEL ═══════════════ */}
            <div
              className="relative w-full overflow-hidden bg-slate-900"
              style={{ height: "clamp(220px, 45vw, 380px)" }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence initial={false} custom={dir} mode="popLayout">
                <motion.img
                  key={idx}
                  src={imgs[idx]}
                  alt={`Room photo ${idx + 1}`}
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 w-full h-full object-cover select-none"
                  draggable={false}
                  style={{ willChange: "transform" }}
                />
              </AnimatePresence>

              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
              <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />

              {/* Nav buttons */}
              {imgs.length > 1 && (
                <>
                  <motion.button
                    onClick={() => paginate(-1)}
                    disabled={idx === 0}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-all
                      ${idx === 0 ? "opacity-30 cursor-not-allowed bg-black/30" : "bg-black/50 hover:bg-black/70 backdrop-blur-sm"}`}
                  >
                    <FaChevronLeft className="text-sm" />
                  </motion.button>
                  <motion.button
                    onClick={() => paginate(1)}
                    disabled={idx === imgs.length - 1}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg transition-all
                      ${idx === imgs.length - 1 ? "opacity-30 cursor-not-allowed bg-black/30" : "bg-black/50 hover:bg-black/70 backdrop-blur-sm"}`}
                  >
                    <FaChevronRight className="text-sm" />
                  </motion.button>
                </>
              )}

              {/* Dot indicators */}
              {imgs.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                  {imgs.map((_, i) => (
                    <motion.button
                      key={i}
                      onClick={() => goTo(i)}
                      animate={{ width: i === idx ? 20 : 6, opacity: i === idx ? 1 : 0.5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                      className="h-1.5 rounded-full bg-white origin-left"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Thumbnail strip ── */}
            {imgs.length > 1 && (
              <div
                ref={thumbnailRef}
                className="flex gap-2 px-4 py-2.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-slate-50 border-b border-slate-100"
              >
                {imgs.map((src, i) => (
                  <motion.button
                    key={i}
                    onClick={() => goTo(i)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    className={`relative shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all duration-200
                      ${i === idx ? "border-[#1a3a6b] shadow-md" : "border-transparent opacity-60 hover:opacity-90"}`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    {i === idx && (
                      <motion.div
                        layoutId="thumb-active"
                        className="absolute inset-0 ring-2 ring-inset ring-[#1a3a6b]/60 rounded-lg pointer-events-none"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            )}

            {/* ═══════════════ DETAILS ═══════════════ */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-5 sm:p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 capitalize leading-tight">
                      {room.roomType || "Deluxe Room"}
                    </h2>
                    <p className="text-sm text-slate-400 mt-0.5">
                      {room.totalRooms} rooms available · {room.description || "Elegant room with premium furnishings and modern amenities."}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-extrabold text-slate-900">
                      ₹{(room.pricePerNight || 0).toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">per night + taxes</p>
                  </div>
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5">
                  {meta.map(({ icon, label, value }) => (
                    <motion.div
                      key={label}
                      whileHover={{ y: -1, boxShadow: "0 4px 16px rgba(26,58,107,0.08)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-3.5 py-3"
                    >
                      <span className="text-[#1a3a6b] text-base shrink-0">{icon}</span>
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
                        <p className="text-xs font-semibold text-slate-800 capitalize">{value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Amenities */}
                {amenities.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">Included amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {amenities.map((a) => (
                        <motion.span
                          key={a}
                          whileHover={{ scale: 1.04 }}
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#1a3a6b] bg-[#1a3a6b]/6 border border-[#1a3a6b]/15 px-3 py-1.5 rounded-full capitalize"
                        >
                          <span className="text-[11px]">{resolveAmenityIcon(a)}</span>
                          {a}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="h-px bg-slate-100 mb-5" />

                {/* CTA row */}
                <div className="flex items-center gap-3 flex-wrap">
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 min-w-[120px] py-3 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      if (isSelected) {
                        onSelectRoom(null);
                      } else {
                        onSelectRoom(room);
                      }
                      onClose();
                    }}
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 28px rgba(26,58,107,0.30)" }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex-[2] min-w-[160px] py-3 rounded-2xl text-sm font-extrabold transition-all shadow-lg
                      ${isSelected
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-[#1a3a6b] hover:bg-[#14305a] text-white"
                      }`}
                  >
                    {isSelected ? "✓ Room Selected" : "Select This Room"}
                  </motion.button>
                </div>

                {/* Keyboard hint */}
                <p className="text-center text-[10px] text-slate-300 mt-3 font-medium tracking-wide">
                  Use ← → arrow keys to browse · ESC to close
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RoomPreviewModal;