import { useState } from "react";
import { FaHeart } from "react-icons/fa";
import { FaHotel, FaMapMarkerAlt } from "react-icons/fa";
import { IoRestaurant } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { useWishlist } from "../../components/WishlistContext";

const sections = [
  {
    key: "restaurants",
    title: "Restaurants",
    icon: <IoRestaurant />,
    empty: "No saved restaurants",
  },
  {
    key: "hotels",
    title: "Hotels",
    icon: <FaHotel />,
    empty: "No saved hotels",
  },
  {
    key: "places",
    title: "Places",
    icon: <FaMapMarkerAlt />,
    empty: "No saved places",
  },
];

const WishlistPage = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("restaurants");

  const activeItems = wishlist?.[activeTab] || [];

  return (
    <div className="min-h-screen bg-[#f8fbff] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6b84a7]">
            My Collection
          </p>

          <h1 className="mt-1 text-3xl font-black text-slate-800">Wishlist</h1>

          <p className="mt-2 text-sm text-slate-500">
            Save your favourite hotels, restaurants and places.
          </p>
        </div>

        {/* CATEGORY CARDS */}

        <div className="grid gap-4 sm:grid-cols-3">
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => setActiveTab(section.key)}
              className={`
                rounded-3xl border p-5 text-left
                transition-all duration-300
                ${
                  activeTab === section.key
                    ? "border-[#6b84a7] bg-[#eef3fb] shadow-lg"
                    : "border-slate-200 bg-white"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="text-3xl text-[#5b6f8f]">{section.icon}</div>

                <div
                  className="
                    flex h-9 w-9 items-center justify-center
                    rounded-full bg-white
                    text-sm font-bold text-[#445a78]
                    shadow-sm
                  "
                >
                  {wishlist?.[section.key]?.length || 0}
                </div>
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-800">
                {section.title}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                View saved {section.title.toLowerCase()}
              </p>
            </button>
          ))}
        </div>

        {/* EMPTY STATE */}

        {activeItems.length === 0 ? (
          <div
            className="
              mt-10 flex min-h-[45vh]
              flex-col items-center justify-center
              rounded-3xl border border-dashed
              border-slate-300 bg-white
              text-center
            "
          >
            <div className="rounded-full bg-pink-100 p-6">
              <FaHeart className="text-5xl text-pink-500" />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-slate-800">
              {sections.find((s) => s.key === activeTab).empty}
            </h2>

            <p className="mt-2 max-w-md text-slate-500">
              Start exploring and save your favourites.
            </p>

            <Link
              to="/"
              className="
                mt-6 rounded-2xl
                bg-linear-to-r
                from-[#6b84a7]
                via-[#5b6f8f]
                to-[#445a78]
                px-6 py-3
                text-sm font-semibold
                text-white shadow-lg
                transition hover:scale-[1.02]
              "
            >
              Explore Now
            </Link>
          </div>
        ) : (
          /* ITEMS GRID */
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {activeItems.map((item) => (
              <div
                key={item._id}
                className="
                  overflow-hidden rounded-3xl
                  border border-white/60
                  bg-white shadow-sm
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:shadow-xl
                "
              >
                {/* IMAGE */}

                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-56 w-full object-cover"
                  />

                  <button
                    onClick={() => removeFromWishlist(activeTab, item._id)}
                    className="
                      absolute right-4 top-4
                      flex h-11 w-11 items-center justify-center
                      rounded-full bg-white/90
                      shadow-md backdrop-blur
                      transition hover:scale-105
                    "
                  >
                    <FaHeart className="text-pink-500" />
                  </button>
                </div>

                {/* CONTENT */}

                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-800">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">{item.location}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#445a78]">
                      ⭐ {item.rating || "4.5"}
                    </span>

                    <span className="text-xs text-slate-400">Saved</span>
                  </div>

                  <button
                    onClick={() => navigate(`/hotels/${item._id}`)}
                    className="mt-5 w-full rounded-2xl bg-linear-to-r from-[#6b84a7] via-[#5b6f8f] to-[#445a78] py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
