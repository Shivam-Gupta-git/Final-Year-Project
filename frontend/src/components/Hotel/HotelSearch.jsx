import { useState, useEffect } from "react";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
} from "react-icons/fa";
import { useDispatch } from "react-redux";

const HeroSearch = () => {
  const dispatch = useDispatch();

  const getToday = () => {
    const today = new Date(2026, 2, 17);
    return today.toISOString().split("T")[0];
  };

  const getTomorrow = () => {
    const tomorrow = new Date(2026, 2, 19);
    return tomorrow.toISOString().split("T")[0];
  };

  const [searchData, setSearchData] = useState({
    city: "",
    checkIn: getToday(),
    checkOut: getTomorrow(),
    guests: "1 Room, 2 Adults",
  });

  const [showGuests, setShowGuests] = useState(false);

  useEffect(() => {
    setSearchData((prev) => ({
      ...prev,
      checkIn: getToday(),
      checkOut: getTomorrow(),
    }));
  }, []);

  const handleChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleGuests = () => {
    setShowGuests(!showGuests);
  };

  const handleGuestSelect = (guestOption) => {
    setSearchData({ ...searchData, guests: guestOption });
    setShowGuests(false);
  };

  const handleSearch = () => {
    dispatch(
      fetchActiveHotels({
        city: searchData.city,
        checkIn: searchData.checkIn,
        checkOut: searchData.checkOut,
        guests: searchData.guests,
      }),
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white shadow-xl p-4 md:p-6 rounded-2xl">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-2">
        {/* City */}
        <div className="relative flex-1 min-w-0 group">
          <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-blue-600" />
          <input
            type="text"
            name="city"
            placeholder="City, Area or Property"
            value={searchData.city}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200"
          />
        </div>

        {/* Check-in */}
        <div className="relative flex-1 min-w-0 group">
          <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-blue-600" />
          <input
            type="date"
            name="checkIn"
            value={searchData.checkIn}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200"
          />
        </div>

        {/* Check-out */}
        <div className="relative flex-1 min-w-0 group">
          <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-blue-600" />
          <input
            type="date"
            name="checkOut"
            value={searchData.checkOut}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200"
          />
        </div>

        {/* Guests */}
        {/* Guests */}
        <div className="relative flex-1 min-w-0 lg:flex-none lg:w-48 group">
          <button
            type="button"
            onClick={toggleGuests}
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200 bg-linear-to-r from-gray-50 to-white"
          >
            <div className="flex items-center">
              <FaUsers className="text-gray-400 text-lg mr-2 group-focus-within:text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {searchData.guests}
              </span>
            </div>
          </button>

          {showGuests && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-2">
              <label>
                <input
                  type="radio"
                  name="guests"
                  value="1 Room, 1 Adult"
                  onChange={(e) => handleGuestSelect(e.target.value)}
                  className="sr-only"
                />
                <div className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                  1 Room, 1 Adult
                </div>
              </label>

              <label>
                <input
                  type="radio"
                  name="guests"
                  value="1 Room, 2 Adults"
                  onChange={(e) => handleGuestSelect(e.target.value)}
                  className="sr-only"
                />
                <div className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                  1 Room, 2 Adults
                </div>
              </label>

              <label>
                <input
                  type="radio"
                  name="guests"
                  value="1 Room, 3 Adults"
                  onChange={(e) => handleGuestSelect(e.target.value)}
                  className="sr-only"
                />
                <div className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                  1 Room, 3 Adults
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center whitespace-nowrap min-w-25 lg:min-w-30"
        >
          <FaSearch className="mr-2" />
          SEARCH
        </button>
      </div>
    </div>
  );
};

export default HeroSearch;
