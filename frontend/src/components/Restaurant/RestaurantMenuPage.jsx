import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { getAllFoodForUser } from "../../features/user/foodSlice";
import { getRestaurantByIdPublic } from "../../features/user/restaurantSlice";

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Instrument+Serif:ital@0;1&display=swap');

.rmp-root {
  min-height: 100vh;
  background: #0c0c10;
  font-family: 'Bricolage Grotesque', sans-serif;
  color: #f0f0f8;
}

/* ── TOP BAR ── */
.rmp-topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(12,12,16,0.9);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(255,255,255,0.055);
  padding: 14px 24px;
}

.rmp-topbar-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.rmp-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 100px;
  color: #f0f0f8;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.2s;
  flex-shrink: 0;
}
.rmp-back:hover { background: rgba(255,255,255,0.1); }

.rmp-topbar-info { flex: 1; min-width: 0; }

.rmp-topbar-name {
  font-family: 'Instrument Serif', serif;
  font-size: 20px;
  font-style: italic;
  font-weight: 400;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: capitalize;
}

.rmp-topbar-sub {
  font-size: 11px;
  color: #6b6b85;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: 2px;
}

/* ── FILTER BAR ── */
.rmp-filter-bar {
  position: sticky;
  top: 65px;
  z-index: 99;
  background: rgba(12,12,16,0.88);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255,255,255,0.04);
  padding: 12px 24px;
}

.rmp-filter-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.rmp-search-wrap {
  position: relative;
  flex: 1;
  min-width: 180px;
}

.rmp-search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #6b6b85;
  pointer-events: none;
}

.rmp-search-input {
  width: 100%;
  padding: 10px 14px 10px 40px;
  background: #131318;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  color: #f0f0f8;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 13px;
  font-weight: 500;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.rmp-search-input::placeholder { color: #6b6b85; }
.rmp-search-input:focus { border-color: rgba(255,77,0,0.4); box-shadow: 0 0 0 3px rgba(255,77,0,0.08); }

.rmp-filter-pills {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.rmp-pill {
  padding: 9px 18px;
  border-radius: 100px;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.18s;
  white-space: nowrap;
}

.rmp-pill.all {
  border-color: rgba(255,255,255,0.1);
  background: transparent;
  color: #9898b0;
}
.rmp-pill.all.active {
  background: #f0f0f8;
  border-color: #f0f0f8;
  color: #0c0c10;
}

.rmp-pill.veg {
  border-color: rgba(34,197,94,0.2);
  background: transparent;
  color: #86efac;
}
.rmp-pill.veg.active {
  background: rgba(34,197,94,0.15);
  border-color: rgba(34,197,94,0.4);
  color: #4ade80;
  box-shadow: 0 0 14px rgba(34,197,94,0.15);
}

.rmp-pill.nonveg {
  border-color: rgba(239,68,68,0.2);
  background: transparent;
  color: #fca5a5;
}
.rmp-pill.nonveg.active {
  background: rgba(239,68,68,0.12);
  border-color: rgba(239,68,68,0.4);
  color: #f87171;
  box-shadow: 0 0 14px rgba(239,68,68,0.12);
}

/* ── MAIN ── */
.rmp-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px 80px;
}

/* ── GRID ── */
.rmp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px;
}

/* ── FOOD CARD ── */
.rmp-food-card {
  background: #131318;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 20px;
  overflow: hidden;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
  display: block;
}
.rmp-food-card:hover {
  border-color: rgba(255,77,0,0.3);
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.35);
}

.rmp-food-img-wrap {
  position: relative;
  aspect-ratio: 16/9;
  overflow: hidden;
  background: #1a1a22;
}

.rmp-food-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.rmp-food-card:hover .rmp-food-img { transform: scale(1.06); }

.rmp-food-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 22px;
  height: 22px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  border: 1.5px solid;
}
.rmp-food-badge.veg { background: rgba(34,197,94,0.15); border-color: #22c55e; color: #22c55e; }
.rmp-food-badge.nonveg { background: rgba(239,68,68,0.12); border-color: #ef4444; color: #ef4444; }

.rmp-food-body { padding: 16px; }

.rmp-food-name {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #f0f0f8;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rmp-food-desc {
  font-size: 12px;
  color: #6b6b85;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12px;
  min-height: 36px;
}

.rmp-food-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rmp-food-price {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: #ff7340;
}

.rmp-food-cat {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6b6b85;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  padding: 4px 10px;
  border-radius: 100px;
}

/* ── EMPTY ── */
.rmp-empty {
  text-align: center;
  padding: 80px 24px;
  color: #6b6b85;
}
.rmp-empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.6; }

/* ── LOADING ── */
.rmp-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px;
}

.rmp-spin {
  width: 36px; height: 36px;
  border: 2px solid rgba(255,77,0,0.15);
  border-top-color: #ff4d00;
  border-radius: 50%;
  animation: rmp-spin 0.7s linear infinite;
}
@keyframes rmp-spin { to { transform: rotate(360deg); } }

/* ── ERROR ── */
.rmp-error {
  padding: 14px 18px;
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.18);
  border-radius: 14px;
  color: #fca5a5;
  font-size: 13px;
  margin-bottom: 20px;
}

@media (max-width: 640px) {
  .rmp-topbar, .rmp-filter-bar { padding: 12px 16px; }
  .rmp-main { padding: 24px 16px 80px; }
  .rmp-filter-bar { top: 60px; }
  .rmp-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
}

@media (max-width: 440px) {
  .rmp-grid { grid-template-columns: 1fr; }
}
`;

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
};
const gridVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

function RestaurantMenuPage() {
  const { restaurantId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { foods, loading, error } = useSelector((s) => s.food);
  const { restaurant, restaurantDetailLoading } = useSelector((s) => s.restaurant);

  const [search, setSearch] = useState("");
  const [vegFilter, setVegFilter] = useState(null); // null=all, true=veg, false=nonveg

  useEffect(() => {
    if (document.getElementById("rmp-style")) return;
    const el = document.createElement("style");
    el.id = "rmp-style";
    el.textContent = STYLE;
    document.head.appendChild(el);
  }, []);

  useEffect(() => {
    if (restaurantId) {
      dispatch(getRestaurantByIdPublic(restaurantId));
      dispatch(getAllFoodForUser({ page: 1, limit: 100, restaurantId, category: "", isVeg: "" }));
    }
  }, [dispatch, restaurantId]);

  const filtered = (foods ?? []).filter((f) => {
    const matchSearch = f?.name?.toLowerCase().includes(search.toLowerCase());
    const matchVeg = vegFilter === null || f?.isVeg === vegFilter;
    return matchSearch && matchVeg;
  });

  const name = restaurant?.name ?? (restaurantDetailLoading ? "…" : "Restaurant");

  return (
    <div className="rmp-root">

      {/* ── TOP BAR ── */}
      <div className="rmp-topbar">
        <div className="rmp-topbar-inner">
          <button className="rmp-back" onClick={() => navigate(`/restaurant/${restaurantId}`)}>
            <ArrowLeftIcon style={{ width: 13, height: 13 }} />
            Back
          </button>
          <div className="rmp-topbar-info">
            <p className="rmp-topbar-name">{name}</p>
            <p className="rmp-topbar-sub">Menu · {filtered.length} item{filtered.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div className="rmp-filter-bar">
        <div className="rmp-filter-inner">
          <div className="rmp-search-wrap">
            <MagnifyingGlassIcon className="rmp-search-icon" />
            <input
              type="search"
              className="rmp-search-input"
              placeholder="Search dishes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="rmp-filter-pills">
            <button className={`rmp-pill all ${vegFilter === null ? "active" : ""}`} onClick={() => setVegFilter(null)}>All</button>
            <button className={`rmp-pill veg ${vegFilter === true ? "active" : ""}`} onClick={() => setVegFilter(true)}>🥦 Veg</button>
            <button className={`rmp-pill nonveg ${vegFilter === false ? "active" : ""}`} onClick={() => setVegFilter(false)}>🍖 Non-Veg</button>
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <main className="rmp-main">
        {error && <div className="rmp-error">⚠️ {String(error)}</div>}

        {loading && !foods?.length ? (
          <div className="rmp-loading"><div className="rmp-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="rmp-empty">
            <div className="rmp-empty-icon">🍽️</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f8", marginBottom: 6 }}>No dishes found</p>
            <p style={{ fontSize: 13 }}>Try adjusting your search or filter</p>
          </div>
        ) : (
          <motion.div
            className="rmp-grid"
            variants={gridVariants}
            initial="hidden"
            animate="show"
          >
            {filtered.map((item) => (
              <motion.div key={item._id} variants={cardVariants}>
                <Link
                  to={`/food/${item._id}`}
                  state={{ restaurantId }}
                  className="rmp-food-card"
                >
                  <div className="rmp-food-img-wrap">
                    <img
                      src={item.images?.[0] || "https://placehold.co/400x225/1a1a22/ff4d00?text=Food"}
                      alt={item.name}
                      className="rmp-food-img"
                    />
                    <div className={`rmp-food-badge ${item.isVeg ? "veg" : "nonveg"}`}>
                      {item.isVeg ? "●" : "●"}
                    </div>
                  </div>
                  <div className="rmp-food-body">
                    <p className="rmp-food-name">{item.name}</p>
                    <p className="rmp-food-desc">{item.description || "A delicious dish crafted with care."}</p>
                    <div className="rmp-food-footer">
                      <span className="rmp-food-price">₹{item.price}</span>
                      {item.category && <span className="rmp-food-cat">{item.category}</span>}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default RestaurantMenuPage;
