import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { smartSearch } from "../../features/user/searchSlice";

function HeroSection() {
  const [activeTab, setActiveTab] = useState("cities");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    city: "",
    checkIn: "",
    checkOut: "",
  });

  //search feature
  const handleSearch = () => {
    if (!formData.city?.trim()) {
      alert("Please enter city");
      return;
    }

    let query = "";
    let route = "";

    if (activeTab === "hotels") {
      query = `${formData.city.trim()} hotels`;
      route = "/hotels";
    } else if (activeTab === "places") {
      query = `${formData.city.trim()} places`;
      route = "/places";
    } else if (activeTab === "cities") {
      query = `${formData.city.trim()}`; // ✅ CITIES tab now works!
      route = "/cities";
    } else if (activeTab === "restaurants") {
      query = `${formData.city.trim()} restaurants`;
      route = "/restaurants";
    } else {
      query = `${formData.city.trim()}`;
      route = "/travel";
    }
    console.log("✅ SENDING QUERY:", query);
    console.log("📍 ROUTE:", route);

    dispatch(smartSearch(query))
      .unwrap()
      .then((res) => {
        navigate(route); 
      })
      .catch((err) => {
        console.error("API ERROR:", err);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // const handleSearch = () => {
  //   console.log("Search:", activeTab, formData);
  // };

  const images = [
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
    "https://images.unsplash.com/photo-1467269204594-9661b134dd2b",
  ];

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 10000); // every 10 sec.

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-full overflow-hidden">
      {/* Sliding Background Images */}
      <div className="absolute inset-0">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
              index === currentImage ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        {/* Dynamic overlay based on tab */}
        <div
          className={`absolute inset-0 transition-all duration-700 ${
            activeTab === "cities"
              ? "bg-gradient-to-b from-orange-500/20 via-amber-500/10 to-transparent"
              : activeTab === "hotels"
                ? "bg-gradient-to-b from-orange-500/20 via-amber-500/10 to-transparent"
                : activeTab === "places"
                  ? "bg-gradient-to-b from-emerald-500/20 via-green-500/10 to-transparent"
                  : activeTab === "restaurants"
                    ? "bg-gradient-to-b from-rose-500/20 via-pink-500/10 to-transparent"
                    : "bg-gradient-to-b from-blue-500/20 via-indigo-500/10 to-transparent"
          }`}
        />
        <div className="absolute inset-0 bg-black/50 lg:bg-black/40" />
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-40">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentImage
                ? "w-10 bg-white/90 backdrop-blur-sm shadow-lg"
                : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-30 flex items-center justify-center min-h-screen px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl mx-auto backdrop-blur-3xl bg-white/95 border border-white/20 shadow-2xl rounded-3xl md:rounded-[2.5rem] p-8 md:p-12 lg:p-8">
          {/* Icon Navigation Tabs - Like Booking.com */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-4 pb-8 mb-10 border-b border-gray-200/50">
            {[
              { key: "cities", label: "Cities", icon: "🏙️" },
              { key: "hotels", label: "Hotels", icon: "🏨" },
              { key: "places", label: "Places", icon: "📍" },
              { key: "restaurants", label: "Restaurants", icon: "🍽️" },
              { key: "travel", label: "Travel", icon: "✈️" },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => {
                  setActiveTab(key);
                  if (key === "cities") {
                    document
                      .getElementById("popular-cities")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }
                  if (key === "hotels") {
                    navigate("/hotels");
                  }
                  if (key === "places") navigate("/places");
                  if (key === "restaurants") navigate("/restaurants");
                  if (key === "travel") navigate("/travel");
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl font-semibold transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1 border-2 group min-w-[80px] ${
                  activeTab === key
                    ? "bg-gradient-to-r from-white to-gray-50 text-orange-600 border-orange-200 shadow-orange-200/50"
                    : "bg-white/80 text-gray-700 border-gray-200/50 hover:border-gray-300 hover:bg-white backdrop-blur-sm"
                }`}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                  {icon}
                </span>
                <span className="text-sm font-medium whitespace-nowrap">
                  {label}
                </span>
                {activeTab === key && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 h-2 w-8 bg-linear-to-r from-orange-500 to-amber-500 rounded-full shadow-lg" />
                )}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Where are you going?
              </label>
              <div className="relative group">
                <input
                  type="text"
                  name="city"
                  placeholder="Enter city or destination"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 rounded-3xl p-5 pl-14 pr-12 text-lg focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 outline-none transition-all duration-300 bg-gradient-to-r from-white via-white/90 to-gray-50/50 hover:border-gray-300 hover:shadow-md shadow-sm"
                />
                <svg
                  className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 group-hover:text-gray-500 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 3l-6 6m0 0V4m0 5h5M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5z"
                  />
                </svg>
                <kbd className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-100 px-2 py-1 rounded-lg text-xs font-mono text-gray-500 border">
                  ↵ Enter
                </kbd>
              </div>
            </div>

            {/* Check-in */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Check-in date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="checkIn"
                  value={formData.checkIn}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 rounded-3xl p-5 pl-14 pr-4 text-lg focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/50 outline-none transition-all duration-300 bg-gradient-to-r from-white via-white/90 to-gray-50/50 hover:border-gray-300 hover:shadow-md shadow-sm"
                />
                <svg
                  className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            {/* Check-out */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Check-out date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="checkOut"
                  value={formData.checkOut}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 rounded-3xl p-5 pl-14 pr-4 text-lg focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/50 outline-none transition-all duration-300 bg-gradient-to-r from-white via-white/90 to-gray-50/50 hover:border-gray-300 hover:shadow-md shadow-sm"
                />
                <svg
                  className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-center mt-10 lg:mt-15">
            <button
              onClick={handleSearch}
              className="group relative bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 text-white px-20 py-7 rounded-3xl font-black text-xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 overflow-hidden ring-4 ring-orange-200/30 hover:ring-orange-300/50"
            >
              <span className="flex items-center gap-3 relative z-10">
                🔍 Start Your Adventure
                <svg
                  className="h-6 w-6 group-hover:translate-x-2 transition-all duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
