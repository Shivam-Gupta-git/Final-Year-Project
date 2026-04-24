import { useEffect, useRef, useState } from "react";
import { BiTrip } from "react-icons/bi";
import { FaRegUserCircle, FaUserShield } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { GiCancel } from "react-icons/gi";
import { GrLocationPin } from "react-icons/gr";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import { IoMdSettings } from "react-icons/io";
import { LuMapPinned } from "react-icons/lu";
import { MdOutlineCancel } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { adminLogout } from "../features/auth/adminAuthSlice";
import { userLogout } from "../features/auth/authSlice";
import { superAdminLogout } from "../features/auth/superAdminAuthSlice";
import { getAdminData } from "../features/user/adminSlice";
import { selectCartItemCount } from "../features/user/cartSlice";
import { getSuperAdminData } from "../features/user/superAdminSlice";
import { getUserData } from "../features/user/userSlice";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showLocationSection, setShowLocationSection] = useState(false);
  //Search
  const searchRef = useRef(null);
  const { token } = useSelector((state) => state.auth);
  const { user, loading } = useSelector((state) => state.user);
  const { superAdminToken, loginSuccess } = useSelector(
    (state) => state.superAdminAuth
  );
  const { superAdmin } = useSelector((state) => state.superAdmin);
  const { adminToken } = useSelector((state) => state.adminAuth);
  const { admin } = useSelector((state) => state.admin);
  const cartCount = useSelector(selectCartItemCount);

  const location = useLocation();
  const dropdownRef = useRef(null);

  // console.log("user: ", user?.role);
  // console.log(user);
  // console.log("superAdmin: ",superAdmin?.role);
  // console.log("superAdmin: ",superAdmin);
  // console.log("adminToken ", adminToken);
  // console.log("admin: ", admin);

  const currentUser = user || superAdmin || admin;

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

  const handelUserLogout = async (e) => {
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

  const handeSuperAdminLogout = async (e) => {
    e.preventDefault();

    try {
      const result = await dispatch(superAdminLogout());
      // console.log(result);
      if (result.type === "auth/superAdminLogout/fulfilled") {
        navigate("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handelAdminLogout = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(adminLogout());
      if (result.type === "admin/adminLogout/fulfilled") navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    /* ---- get User Data ---- */
    if (token) {
      dispatch(getUserData());
    }
    /* ---- get Super Admin Data ---- */
    if (superAdminToken) {
      dispatch(getSuperAdminData());
    }

    /* ----- get Admin Data ---- */
    if (adminToken) {
      dispatch(getAdminData());
    }
  }, [token, dispatch, superAdminToken, adminToken]);

  useEffect(() => {
    if (loading == false) {
      setShowLocationSection(false);
    }
  }, [loading]);
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

  const profilePath = token
    ? "/user-profile"
    : adminToken
      ? "/admin/adminProfile"
      : superAdminToken
        ? "/superAdmin/superAdminProfile"
        : null;

  const mobileMenuItems =
    superAdmin?.role === "super_admin"
      ? [
        { to: "/superAdmin/superAdminDashboard", label: "Dashboard", icon: "📊" },
        { to: "/superAdmin/cityDashboard", label: "City", icon: "🌆" },
        { to: "/superAdmin/hotelDashboard", label: "Hotel", icon: "🏨" },
        { to: "/superAdmin/place-dashboard", label: "Place", icon: "📍" },
        { to: "/superAdmin/restaurant-dashboard", label: "Restaurant", icon: "🍽️" },
        { to: "/superadmin/adminApprovel", label: "Admin Approval", icon: "🛡️" },
      ]
      : [
        { to: "/", label: "Home", icon: "🏠" },
        { to: "/explore", label: "Cities", icon: "🌆" },
        { to: "/hotels", label: "Hotels", icon: "🏨" },
        { to: "/RestaurantLandingPage", label: "Restaurants", icon: "🍽️" },
        { to: "/travel", label: "Travel", icon: "✈️" },
      ];

  return (
    <>
      <nav
        className="sticky top-0 z-50  bg-transparent font-['Poppins'] backdrop-blur-xl"
        ref={dropdownRef}
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* LEFT */}
            <div className="flex min-w-0 items-center gap-3">
              {/* Logo */}
              <Link
                to="/"
                className="text-2xl font-black tracking-tight text-amber-950 transition hover:text-amber-600"
              >
                <span
                  className="bg-linear-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent 
                             text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight"
                >
                  Travel Planner
                </span>
              </Link>

              {/* Location */}
              {(token || adminToken) && (
                <Link
                  to={"/updateUserLocation"}
                  className="hidden sm:flex items-center gap-2 rounded-2xl border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-950"
                >
                  <GrLocationPin className="text-amber-500" />

                  <span className="max-w-37.5 truncate font-medium">
                    {currentUser?.location?.city
                      ? `${currentUser.location.city}, ${currentUser.location.state}`
                      : "Add Location"}
                  </span>
                </Link>
              )}

              {/* global map section */}
              {(token || adminToken || superAdminToken) && (
                <Link to={"/globalMap"} className="block">
                  <div
                    className="
                   group flex items-center justify-center
                   rounded-full 
                   bg-white
                   p-1.5 sm:p-2 md:p-2
                   
                   transition-all duration-300 
                   hover:shadow-2xl active:scale-95
                 "
                  >
                    <div
                      className="
                     flex items-center justify-center 
                     rounded-full 
                     bg-white 
                     text-amber-700 
                     shadow-sm sm:shadow-md
                     h-5 w-5 sm:h-5 sm:w-5 md:h-5 md:w-5
                     transition-transform duration-300 
                     group-hover:scale-110
                   "
                    >
                      <LuMapPinned className="h-3 w-3 sm:h-5 sm:w-5 md:h-3 md:w-3" />
                    </div>
                  </div>
                </Link>
              )}
            </div>

            {/* CENTER SUPER ADMIN LINKS */}
            {superAdmin?.role === "super_admin" && (
              <div className="hidden xl:flex items-center gap-2">
                {[
                  {
                    to: "/superAdmin/superAdminDashboard",
                    label: "Dashboard",
                  },
                  {
                    to: "/superAdmin/cityDashboard",
                    label: "City",
                  },
                  {
                    to: "/superAdmin/hotelDashboard",
                    label: "Hotel",
                  },
                  {
                    to: "/superAdmin/place-dashboard",
                    label: "Place",
                  },
                  {
                    to: "/superAdmin/restaurant-dashboard",
                    label: "Restaurant",
                  },
                ].map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${isActive
                        ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                        : "text-amber-800 hover:bg-amber-100 hover:text-amber-950"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}

                <div className="mx-2 h-6 w-px bg-amber-300" />

                <NavLink
                  to="/superadmin/adminApprovel"
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${isActive
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                      : "bg-orange-100 text-orange-700 hover:bg-orange-500 hover:text-white"
                    }`
                  }
                >
                  <FaUserShield className="text-base" />
                  Admin Approval
                </NavLink>
              </div>
            )}

            {/* RIGHT Login and SignUp Links */}
            <div className="flex items-center gap-3">
              {!token && !superAdminToken && !adminToken ? (
                <>
                  <div className="hidden md:flex items-center gap-3">
                    <Link
                      to="/loginPage"
                      className="rounded-2xl border border-amber-200 bg-white px-5 py-2.5 text-sm font-semibold text-amber-900 transition-all duration-300 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-950"
                    >
                      Login
                    </Link>

                    <Link
                      to="/signUp"
                      className="rounded-2xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all duration-300 hover:bg-amber-400"
                    >
                      Register
                    </Link>
                  </div>
                </>
              ) : (
                <div className="relative">
                  {/* Avatar */}
                  <button
                    type="button"
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-amber-200 bg-amber-500 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-all duration-300 hover:scale-105"
                  >
                    {currentUser?.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser?.userName || "User"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(currentUser?.userName || user?.userName)
                    )}

                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                  </button>

                  {/* PROFILE SIDEBAR */}
                  {profileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                        onClick={() => setProfileOpen(false)}
                      />

                      <div className="fixed right-0 top-0 z-50 h-screen w-full max-w-sm overflow-y-auto border-l border-amber-200 bg-[#fff8ed] font-['Poppins'] shadow-[0_0_60px_rgba(0,0,0,0.15)]">
                        {/* Header */}
                        <div className="sticky top-0 border-b border-amber-200 bg-[#fff8ed] p-6 backdrop-blur-xl">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-amber-500 to-orange-400 text-lg font-bold text-white">
                                {currentUser?.avatar ? (
                                  <img
                                    src={currentUser.avatar}
                                    alt={currentUser?.userName}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  getInitials(
                                    currentUser?.userName || user?.userName
                                  )
                                )}
                              </div>

                              <div>
                                <h2 className="max-w-45 truncate text-lg font-bold text-amber-950">
                                  {currentUser?.userName ||
                                    user?.userName ||
                                    "User"}
                                </h2>

                                <p className="text-sm font-medium capitalize text-amber-700">
                                  {currentUser?.role ||
                                    admin?.host ||
                                    superAdmin?.role ||
                                    "Member"}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => setProfileOpen(false)}
                              className="rounded-xl border border-amber-200 p-2 text-amber-700 transition hover:bg-amber-100 hover:text-amber-950"
                            >
                              <MdOutlineCancel className="text-xl" />
                            </button>
                          </div>
                        </div>

                        {/* PROFILE SIDEBAR */}
                        <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-sm flex-col border-l border-slate-200 bg-white font-['Poppins'] shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
                          {/* Header */}
                          <div className="border-b border-slate-200 bg-slate-50 p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex min-w-0 items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-sky-500 to-indigo-500 text-lg font-bold text-white shadow-md">
                                  {currentUser?.avatar ? (
                                    <img
                                      src={currentUser.avatar}
                                      alt={currentUser?.userName}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    getInitials(
                                      currentUser?.userName || user?.userName
                                    )
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <h2 className="truncate text-lg font-semibold tracking-tight text-slate-800">
                                    {currentUser?.userName ||
                                      user?.userName ||
                                      "User"}
                                  </h2>

                                  <p className="text-sm font-medium capitalize text-slate-500">
                                    {currentUser?.role ||
                                      admin?.host ||
                                      superAdmin?.role ||
                                      "Member"}
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => setProfileOpen(false)}
                                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700"
                              >
                                <MdOutlineCancel className="text-xl" />
                              </button>
                            </div>

                            {(token || adminToken) && (
                              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                  <div className="rounded-xl bg-sky-100 p-3 text-sky-600">
                                    <GrLocationPin className="text-lg" />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                      Current Location
                                    </p>

                                    <p className="mt-1 truncate text-sm font-medium text-slate-700">
                                      {currentUser?.location?.city
                                        ? `${currentUser.location.city}, ${currentUser.location.state}`
                                        : "Location not added"}
                                    </p>
                                  </div>

                                  <Link
                                    to="/updateUserLocation"
                                    onClick={() => setProfileOpen(false)}
                                    className="rounded-xl bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-600"
                                  >
                                    Update
                                  </Link>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Menu */}
                          <div className="flex-1 overflow-y-auto bg-white p-5">
                            <div className="space-y-3">
                              {profilePath && (
                                <Link
                                  to={profilePath}
                                  onClick={() => setProfileOpen(false)}
                                  className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-sky-300 hover:bg-sky-50"
                                >
                                  <div className="rounded-xl bg-sky-100 p-3 text-sky-600">
                                    <FaRegUserCircle className="text-xl" />
                                  </div>

                                  <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                      My Profile
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      Manage your account
                                    </p>
                                  </div>
                                </Link>
                              )}

                              {token && (
                                <>
                                  <Link
                                    to="/trips"
                                    onClick={() => setProfileOpen(false)}
                                    className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-violet-300 hover:bg-violet-50"
                                  >
                                    <div className="rounded-xl bg-violet-100 p-3 text-violet-600">
                                      <BiTrip className="text-xl" />
                                    </div>

                                    <div>
                                      <p className="text-sm font-semibold text-slate-800">
                                        My Trips
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        View travel history
                                      </p>
                                    </div>
                                  </Link>

                                  <Link
                                    to="/wishlist"
                                    onClick={() => setProfileOpen(false)}
                                    className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-pink-300 hover:bg-pink-50"
                                  >
                                    <div className="rounded-xl bg-pink-100 p-3 text-pink-600">
                                      <FaHeart className="text-xl" />
                                    </div>

                                    <div>
                                      <p className="text-sm font-semibold text-slate-800">
                                        Wishlist
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        Saved favourites
                                      </p>
                                    </div>
                                  </Link>

                                  <Link
                                    to="/My-Food-orders"
                                    onClick={() => setProfileOpen(false)}
                                    className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-amber-300 hover:bg-amber-50"
                                  >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-lg text-amber-600">
                                      🍽️
                                    </div>

                                    <div>
                                      <p className="text-sm font-semibold text-slate-800">
                                        Food Orders
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        Track food orders
                                      </p>
                                    </div>
                                  </Link>

                                  <Link
                                    to="/cart"
                                    onClick={() => setProfileOpen(false)}
                                    className="relative flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-orange-300 hover:bg-orange-50"
                                  >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-lg text-orange-600">
                                      🛒
                                    </div>

                                    <div>
                                      <p className="text-sm font-semibold text-slate-800">
                                        Food Cart
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        Your saved cart items
                                      </p>
                                    </div>

                                    {cartCount > 0 && (
                                      <span className="absolute right-4 top-4 flex h-6 min-w-6 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                                        {cartCount > 99 ? "99+" : cartCount}
                                      </span>
                                    )}
                                  </Link>
                                </>
                              )}

                              <Link
                                to="/settings"
                                onClick={() => setProfileOpen(false)}
                                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-slate-100"
                              >
                                <div className="rounded-xl bg-slate-200 p-3 text-slate-600">
                                  <IoMdSettings className="text-xl" />
                                </div>

                                <div>
                                  <p className="text-sm font-semibold text-slate-800">
                                    Settings
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    Manage preferences
                                  </p>
                                </div>
                              </Link>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="border-t border-slate-200 bg-white p-5">
                            <button
                              type="button"
                              onClick={
                                token
                                  ? handelUserLogout
                                  : superAdminToken
                                    ? handeSuperAdminLogout
                                    : adminToken
                                      ? handelAdminLogout
                                      : null
                              }
                              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-red-500 px-4 py-4 text-sm font-semibold text-white transition hover:bg-red-600"
                            >
                              <span>🚪</span>
                              Logout
                            </button>
                          </div>
                        </aside>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Mobile Menu Button */}

              <button
                onClick={toggleMenu}
                className="flex h-9 w-11 items-center justify-center rounded-2xl border border-amber-200 bg-white text-amber-800 transition hover:bg-amber-50 md:hidden"
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
              >
                {isOpen ? (
                  <MdOutlineCancel className="text-xl" />
                ) : (
                  <HiOutlineMenuAlt3 className="text-xl" />
                )}
              </button>
              {!token && !adminToken && !superAdminToken && (
                <Link
                  to="/loginPage"
                  className="rounded-2xl border border-amber-200 bg-white px-2 py-1.5 text-sm font-semibold text-amber-900 transition-all duration-300 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-950 md:hidden"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        <>
          {/* OVERLAY */}
          <div
            onClick={() => setIsOpen(false)}
            className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
          />

          {/* DRAWER */}
          <div
            className={`fixed top-0 left-0 z-50 h-screen w-[75%] max-w-xs 
     bg-linear-to-br from-[#d99434] to-[#fff3e0] 
     shadow-2xl border-r border-amber-100 
     transform transition-transform duration-300 ease-in-out border-5 ${isOpen ? "translate-x-0" : "-translate-x-full"
              }`}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-amber-100 bg-white/60 backdrop-blur-md">
              <h2 className="text-lg font-bold text-amber-900 tracking-wide">
                Menu
              </h2>

              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full  flex items-center justify-center hover:bg-amber-100 active:scale-95 transition cursor-pointer border border-[#d38212] p-1 text-[#a87022]"
              >
                <GiCancel />
              </button>
            </div>

            {/* MENU */}
            <div className="p-4 space-y-2">
              {mobileMenuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${isActive
                      ? "bg-[#d0861e] text-white shadow-lg"
                      : "text-amber-900 hover:bg-white hover:shadow-md active:scale-[0.97]"
                    }`
                  }
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="tracking-wide">{item.label}</span>
                  </div>

                  {/* RIGHT ARROW */}
                  <span className="text-sm transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </NavLink>
              ))}
            </div>
          </div>
        </>
      </nav>
    </>
  );
}

export default Navbar;
