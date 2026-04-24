import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { smartSearch } from "../../features/user/searchSlice";

const TABS = [
  { key: "cities", label: "Cities", icon: "🏙️" },
  { key: "hotels", label: "Hotels", icon: "🏨" },
  { key: "places", label: "Places", icon: "📍" },
  { key: "restaurants", label: "Restaurants", icon: "🍽️" },
  { key: "travel", label: "Travel", icon: "✈️" },
];

const IMAGES = [
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
  "https://images.unsplash.com/photo-1467269204594-9661b134dd2b",
];

const HEADLINE_MAP = {
  cities: {
    title: "Discover Your Next City",
    sub: "Explore urban wonders around the globe",
  },
  hotels: {
    title: "Stay in Luxury",
    sub: "Hand-picked hotels for every journey",
  },
  places: {
    title: "Find Hidden Gems",
    sub: "Off-the-beaten-path destinations await",
  },
  restaurants: {
    title: "Taste the World",
    sub: "Authentic flavours at every destination",
  },
  travel: {
    title: "The World is Yours",
    sub: "Plan the adventure of a lifetime",
  },
};

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState("cities");
  const [currentImage, setCurrentImage] = useState(0);
  const [formData, setFormData] = useState({
    city: "",
    checkIn: "",
    checkOut: "",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Slideshow
  useEffect(() => {
    const id = setInterval(
      () => setCurrentImage((p) => (p + 1) % IMAGES.length),
      10000
    );
    return () => clearInterval(id);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearch = () => {
    if (!formData.city?.trim()) return alert("Please enter city");

    if (!formData.checkIn || !formData.checkOut) {
    alert("Please select both dates");
    return;
  }

  if (new Date(formData.checkOut) <= new Date(formData.checkIn)) {
    alert("Check-out date must be after check-in date");
    return;
  }

    let query = "",
      route = "";
    if (activeTab === "hotels") {
      query = `${formData.city.trim()} hotels`;
      route = `/hotels?city=${encodeURIComponent(formData.city.trim())}`;
    } else if (activeTab === "places") {
      query = `${formData.city.trim()} places`;
      route = `/places?city=${encodeURIComponent(formData.city.trim())}`;
    } else if (activeTab === "cities") {
      query = formData.city.trim();
      route = `/explore`; // Assume cities go to explore or city listing, there is no /cities route
    } else if (activeTab === "restaurants") {
      query = `${formData.city.trim()} restaurants`;
      route = `/RestaurantLandingPage?city=${encodeURIComponent(formData.city.trim())}`;
    } else {
      query = formData.city.trim();
      route = `/explore`; // Fallback since travel route is not defined
    }

    dispatch(smartSearch(query))
      .unwrap()
      .then(() => navigate(route))
      .catch((err) => console.error("API ERROR:", err));
  };

  const handleTabClick = (key) => {
    setActiveTab(key);
  };

  const { title, sub } = HEADLINE_MAP[activeTab];

  return (
    <section className="relative w-full min-h-screen overflow-hidden font-sans text-gray-900 bg-gray-50">
      {/* Background Slideshow */}
      <div className="absolute inset-0">
        {IMAGES.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1200 ease-in-out ${
              i === currentImage ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="absolute inset-0 bg-linear-to-t from-gray-50/10 via-gray-50/10 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-gray-50/10 via-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-20 flex min-h-screen flex-col justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-6xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="h-px w-6 sm:w-8 bg-black shrink-0" />

            <span
              className="text-black 
                   text-[10px] sm:text-xs 
                   font-semibold 
                   tracking-[0.15em] sm:tracking-widest 
                   uppercase 
                   leading-tight"
            >
              World-Class Travel Planning
            </span>
          </div>

          {/* Headline */}
          <div key={activeTab} className="animate-fadeUp mt-4 sm:mt-5">
            <h1
              className="font-serif font-light leading-tight sm:leading-[1.05] 
                 text-gray-900 
                 text-[clamp(32px,6vw,84px)]"
            >
              {title}
            </h1>

            <p
              className="mt-2 sm:mt-3 
                max-w-full sm:max-w-xl 
                text-black 
                text-[clamp(13px,2vw,17px)] 
                leading-relaxed"
            >
              {sub}
            </p>
          </div>

          {/* Tabs */}
          <div className="mt-6 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
            {TABS.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => handleTabClick(key)}
                className={`flex items-center gap-2 rounded-full 
      px-3 py-2 sm:px-5 sm:py-2.5 
      text-xs sm:text-sm font-medium 
      border backdrop-blur-md 
      transition-all duration-300 ease-in-out 
      ${
        activeTab === key
          ? "bg-blue-100 border-blue-200 text-blue-800 shadow-lg"
          : "bg-white/50 border-gray-300 text-gray-700 hover:bg-white/70 hover:border-gray-400 active:scale-95"
      }`}
              >
                <span className="text-sm sm:text-base leading-none">
                  {icon}
                </span>
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>

          {/* Search Card */}
          <div className="mt-6 sm:mt-8 md:mt-10 bg-white/50 p-3 sm:p-5 md:p-8 rounded-2xl shadow-lg flex flex-col gap-3 sm:gap-4 md:flex-row md:items-end">
            {/* Destination */}
            <div className="flex flex-col gap-1.5 sm:gap-2 w-full md:flex-1">
              <span className="text-[9px] sm:text-xs font-semibold uppercase text-gray-900 tracking-wide">
                Destination
              </span>
              <div className="relative">
                <input
                  type="text"
                  name="city"
                  placeholder="City or destination"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-700 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base pl-9 sm:pl-10 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                />
              </div>
            </div>

            {/* Check-in */}
            <div className="flex flex-col gap-1.5 sm:gap-2 w-full md:flex-1">
              <span className="text-[9px] sm:text-xs font-semibold uppercase text-gray-900 tracking-wide">
                Check-in
              </span>
              <input
                type="date"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-700 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              />
            </div>

            {/* Check-out */}
            <div className="flex flex-col gap-1.5 sm:gap-2 w-full md:flex-1">
              <span className="text-[9px] sm:text-xs font-semibold uppercase text-gray-900 tracking-wide">
                Check-out
              </span>
              <input
                type="date"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-700 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              />
            </div>

            {/* Button */}
            <div className="w-full md:w-auto">
              <button
                onClick={handleSearch}
                className="w-full md:w-auto bg-linear-to-br from-[#c67c4e] to-[#b86c3d] text-white px-4 sm:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl text-xs sm:text-sm md:text-base font-semibold flex items-center justify-center gap-2 shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-[0.97]"
              >
                Search
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
            {[
              { label: "Destinations", value: "500+" },
              { label: "Happy Travellers", value: "2M+" },
              { label: "Hotels Listed", value: "12K+" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-gray-300 bg-white/50 
                 px-3 sm:px-4 py-1.5 sm:py-2 
                 text-xs sm:text-sm text-gray-700 
                 hover:bg-white/70 transition whitespace-nowrap"
              >
                <strong className="font-semibold text-gray-900 text-xs sm:text-sm">
                  {value}
                </strong>
                <span className="truncate max-w-22.5 sm:max-w-none">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Slide Dots */}
        <div className="absolute bottom-7 right-8 flex gap-1.5 z-30">
          {IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentImage(i)}
              className={`h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                i === currentImage
                  ? "w-7 bg-blue-500"
                  : "w-1.5 bg-gray-400 hover:bg-gray-600"
              }`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
