import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { userLogout } from "../features/auth/authSlice";
import { getUserData } from "../features/user/userSlice";
import { FaRegUserCircle } from "react-icons/fa";
import { GrLocationPin } from "react-icons/gr";
import UpdateUserLocation from "./UpdateUserLocation";
import { FiSearch } from "react-icons/fi";
import { addHistory, searchHotels, setQuery } from "../features/user/searchSlice";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showLocationSection, setShowLocationSection] = useState(false);

  //Search
  const { query, history } = useSelector((state) => state.search);
  const [showHistory, setShowHistory] = useState(false);
  const searchRef = useRef(null);

  const handleSearch = (search) => {
  if (!search.trim()) return;

  dispatch(searchHotels(search)); // fake backend call
  dispatch(addHistory(search));   
  dispatch(setQuery(search));    


  setShowHistory(false);
};

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);



  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.user);
  // console.log(user.location.state);

  const location = useLocation();
  const dropdownRef = useRef(null);

  const getInitials = (name = "User") => {
    if (typeof name !== "string") return "U";
    return name
      .trim()
      .split(" ")
      .filter((n) => n)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const handelLogout = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(userLogout());
      if (result.success) {
        navigate("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (token) {
      dispatch(getUserData());
    }
  }, [token, dispatch]);

  useEffect(() => {
    setProfileOpen(false);

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [location.pathname]);

  return (
    <>
      <nav
        className="bg-white/90 dark:bg-gray-900 shadow-md sticky top-0 z-50"
        ref={dropdownRef}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* LEFT SIDE */}
            <div className="flex items-center gap-2">
              {/* Logo */}
              <Link
                to="/"
                className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                NotDefine
              </Link>

              {/* Location */}
              {token && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-lg">
                  <GrLocationPin style={{ fontSize: "22px", color: "red" }} />

                  <button
                    onClick={() => setShowLocationSection(true)}
                    className="text-sm font-medium text-blue-700 hover:text-blue-900 transition"
                  >
                    {user?.location?.city
                      ? `${user.location.city}, ${user.location.state}`
                      : "Add Location"}
                  </button>
                </div>
              )}
            </div>

            {/*SEARCH BAR */}           
            <div className="relative w-96 mr-30">
              <div className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-xl">
                <FiSearch className="text-gray-500 text-lg" />

                <input
                  type="text"
                  value={query}
                  placeholder="Search for Cities, Hotels & more"
                  className="bg-transparent outline-none text-sm flex-1"
                  onFocus={() => setShowHistory(true)}
                  onChange={(e) => dispatch(setQuery(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch(query);
                    }
                  }}
                />
              </div>

              {showHistory && history.length > 0 && (
                <div className="absolute top-12 left-0 w-full bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => handleSearch(item)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <FiSearch className="text-gray-400" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center space-x-4">
              {!token ? (
                <>
                  <Link to="/login">
                    <button className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
                      Login
                    </button>
                  </Link>
                  <Link to="/signUp">
                    <button className="px-5 py-2 text-sm font-medium text-white bg-linear-to-r from-blue-600 to-blue-700 rounded-full hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200">
                      Register
                    </button>
                  </Link>
                </>
              ) : (
                <div className="relative">
                  {/* Avatar Button */}
                  <button
                    type="button"
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center border overflow-hidden"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.userName || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(user?.userName)
                    )}
                  </button>

                  {/* Dropdown */}
                  {profileOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transform transition-all duration-300 ease-out animate-dropdown">
                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/user-profile"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                        >
                          <span className="bg-blue-400 rounded-full text-white">
                            <FaRegUserCircle style={{ fontSize: "22px" }} />
                          </span>
                          My Profile
                        </Link>

                        <Link
                          to="/trips"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span>🧳</span>
                          My Trips
                        </Link>

                        <Link
                          to="/wishlist"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span>❤️</span>
                          Wishlist
                        </Link>

                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span>⚙️</span>
                          Settings
                        </Link>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-100"></div>

                      {/* Logout */}
                      <button
                        type="button"
                        onClick={handelLogout}
                        className="flex items-center gap-3 w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <span>🚪</span>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile hamburger button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-1 ml-1 mr-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:shadow-outline transition-all duration-200"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200"
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link
                to="/cities"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200"
                onClick={toggleMenu}
              >
                Cities
              </Link>
              <Link
                to="/places"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200"
                onClick={toggleMenu}
              >
                Places
              </Link>
              <Link
                to="/hotels"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200"
                onClick={toggleMenu}
              >
                Hotels
              </Link>
              <Link
                to="/restaurants"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200"
                onClick={toggleMenu}
              >
                Restaurants
              </Link>
              <Link
                to="/travel"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200"
                onClick={toggleMenu}
              >
                Travel Option
              </Link>
              <div className="border-t border-gray-200 pt-4 pb-3 mt-4">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
                <Link
                  to="/signUp"
                  className="block w-full px-3 py-2 mt-2 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200"
                  onClick={toggleMenu}
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Location Popup Modal */}
      {showLocationSection && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowLocationSection(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-[90%] max-w-lg p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowLocationSection(false)}
              className="absolute top-3 right-4 text-xl text-gray-500 hover:text-red-500"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4">Add Your Location</h2>

            {/* Location Component */}
            <UpdateUserLocation />
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;