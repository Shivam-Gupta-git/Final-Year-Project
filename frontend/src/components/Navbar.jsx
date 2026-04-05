import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { userLogout } from "../features/auth/authSlice";
import { getUserData } from "../features/user/userSlice";
import { FaRegUserCircle } from "react-icons/fa";
import { GrLocationPin } from "react-icons/gr";
import UpdateUserLocation from "./UpdateUserLocation";
import { FiSearch } from "react-icons/fi";
import { RxDashboard } from "react-icons/rx";
import { superAdminLogout } from "../features/auth/superAdminAuthSlice";
import { getSuperAdminData } from "../features/user/superAdminSlice";
import { getAdminData } from "../features/user/adminSlice";
import { adminLogout } from "../features/auth/adminAuthSlice";
import { FaUserShield } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { selectCartItemCount } from "../features/user/cartSlice";
import { BiTrip } from "react-icons/bi";
import { FaHeart } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";
import { MdOutlineCancel } from "react-icons/md";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import { LuMapPinned } from "react-icons/lu";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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

  return (
    <>
      <nav
        className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-xl"
        ref={dropdownRef}
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* LEFT */}
            <div className="flex items-center gap-3">
              {/* Logo */}
              <Link
                to="/"
                className="text-2xl font-black tracking-tight text-white transition hover:text-blue-400"
              >
                <span className="bg-linear-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                  NotDefine
                </span>
              </Link>

              {/* Location */}
              {(token || adminToken) && (
                <Link
                  to={"/updateUserLocation"}
                  className="hidden sm:flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 transition hover:border-blue-500/30 hover:bg-zinc-800 hover:text-white"
                >
                  <GrLocationPin className="text-blue-400" />

                  <span className="max-w-37.5 truncate">
                    {currentUser?.location?.city
                      ? `${currentUser.location.city}, ${currentUser.location.state}`
                      : "Add Location"}
                  </span>
                </Link>
              )}
              {/* global map section */}
              {token && (
                <Link to={"/globalMap"}>
                  <div className="flex items-center gap-1 p-1  rounded-full bg-linear-to-br from-gray-600 via-gray-600 to-gray-300 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group">
                    {/* Icon Circle */}
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-white/20 text-white shadow-md group-hover:scale-110 transition-transform duration-300">
                      <LuMapPinned className="h-5 w-5 text-white" />
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
                      `rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}

                <div className="mx-2 h-6 w-px bg-white/10" />

                <NavLink
                  to="/superadmin/adminApprovel"
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20"
                        : "bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white"
                    }`
                  }
                >
                  <FaUserShield className="text-base" />
                  Admin Approval
                </NavLink>
              </div>
            )}

            {/* RIGHT */}
            <div className="flex items-center gap-3">
              {!token && !superAdminToken && !adminToken ? (
                <>
                  <div className="hidden md:flex items-center gap-3">
                    <Link
                      to="/loginPage"
                      className="rounded-2xl border border-white/10 bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-all duration-300 hover:border-white/20 hover:bg-zinc-800 hover:text-white"
                    >
                      Login
                    </Link>

                    <Link
                      to="/signUp"
                      className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:bg-blue-500"
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
                    className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:scale-105"
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

                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-black bg-green-500" />
                  </button>

                  {/* PROFILE SIDEBAR */}
                  {profileOpen && (
                    <>
                      {/* Overlay */}
                      <div
                        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
                        onClick={() => setProfileOpen(false)}
                      />

                      {/* Sidebar */}
                      <div className="fixed right-0 top-0 z-50 h-screen w-full max-w-sm overflow-y-auto border-l border-white/10 bg-black shadow-[0_0_60px_rgba(0,0,0,0.8)]">
                        {/* Header */}
                        <div className="sticky top-0 border-b border-white/10 bg-black/95 p-6 backdrop-blur-xl">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 to-cyan-500 text-lg font-bold text-white">
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
                                <h2 className="max-w-45 truncate text-lg font-semibold text-white">
                                  {currentUser?.userName ||
                                    user?.userName ||
                                    "User"}
                                </h2>

                                <p className="text-sm capitalize text-zinc-400">
                                  {currentUser?.role ||
                                    admin?.host ||
                                    superAdmin?.role ||
                                    "Member"}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => setProfileOpen(false)}
                              className="rounded-xl border border-white/10 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                            >
                              <MdOutlineCancel className="text-xl" />
                            </button>
                          </div>

                          {(token || adminToken) && (
                            <div className="mt-5 rounded-2xl border border-white/10 bg-zinc-900 p-4 mb-3">
                              <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                                  <GrLocationPin className="text-lg" />
                                </div>

                                <div className="flex-1">
                                  <p className="text-[11px] uppercase tracking-wider text-zinc-500">
                                    Current Location
                                  </p>

                                  <p className="mt-1 text-sm font-medium text-white">
                                    {currentUser?.location?.city
                                      ? `${currentUser.location.city}, ${currentUser.location.state}`
                                      : "Location not added"}
                                  </p>
                                </div>

                                <Link
                                  to={"/updateUserLocation"}
                                  className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 transition hover:bg-blue-600 hover:text-white"
                                >
                                  Update
                                </Link>
                              </div>
                            </div>
                          )}

                          {/* Hotel Admin Profile */}
                          {admin?.host === "hotel" && (
                            <Link
                              to="/admin/adminProfile"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900 p-4 transition hover:border-emerald-500/40 hover:bg-emerald-500/10"
                            >
                              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                                <FaRegUserCircle className="text-xl" />
                              </div>

                              <div>
                                <p className="font-medium text-white">
                                  Hotel Admin Profile
                                </p>
                                <p className="text-sm text-zinc-400">
                                  Manage hotel admin account
                                </p>
                              </div>
                            </Link>
                          )}

                          {/* Restaurant Admin Profile */}
                          {admin?.host === "restaurant" && (
                            <Link
                              to="/admin/adminProfile"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900 p-4 transition hover:border-yellow-500/40 hover:bg-yellow-500/10"
                            >
                              <div className="rounded-xl bg-yellow-500/10 p-3 text-yellow-400">
                                <FaRegUserCircle className="text-xl" />
                              </div>

                              <div>
                                <p className="font-medium text-white">
                                  Restaurant Admin Profile
                                </p>
                                <p className="text-sm text-zinc-400">
                                  Manage restaurant admin account
                                </p>
                              </div>
                            </Link>
                          )}

                          {/* Delivery Boy Profile */}
                          {admin?.host === "delivery_boy" && (
                            <Link
                              to="/admin/adminProfile"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900 p-4 transition hover:border-indigo-500/40 hover:bg-indigo-500/10"
                            >
                              <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
                                <FaRegUserCircle className="text-xl" />
                              </div>

                              <div>
                                <p className="font-medium text-white">
                                  Delivery Profile
                                </p>
                                <p className="text-sm text-zinc-400">
                                  Manage delivery account
                                </p>
                              </div>
                            </Link>
                          )}
                        </div>

                        {/* Menu */}
                        <div className="space-y-3 p-5">
                          {token && (
                            <>
                              <Link
                                to="/user-profile"
                                onClick={() => setProfileOpen(false)}
                                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900 p-4 transition hover:border-blue-500/40 hover:bg-blue-500/10"
                              >
                                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                                  <FaRegUserCircle className="text-xl" />
                                </div>

                                <div>
                                  <p className="font-medium text-white">
                                    My Profile
                                  </p>
                                  <p className="text-sm text-zinc-400">
                                    Manage your account
                                  </p>
                                </div>
                              </Link>

                              <Link
                                to="/trips"
                                onClick={() => setProfileOpen(false)}
                                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900 p-4 transition hover:border-purple-500/40 hover:bg-purple-500/10"
                              >
                                <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">
                                  <BiTrip className="text-xl" />
                                </div>

                                <div>
                                  <p className="font-medium text-white">
                                    My Trips
                                  </p>
                                  <p className="text-sm text-zinc-400">
                                    View travel history
                                  </p>
                                </div>
                              </Link>

                              <Link
                                to="/wishlist"
                                onClick={() => setProfileOpen(false)}
                                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900 p-4 transition hover:border-pink-500/40 hover:bg-pink-500/10"
                              >
                                <div className="rounded-xl bg-pink-500/10 p-3 text-pink-400">
                                  <FaHeart className="text-xl" />
                                </div>

                                <div>
                                  <p className="font-medium text-white">
                                    Wishlist
                                  </p>
                                  <p className="text-sm text-zinc-400">
                                    Saved favourites
                                  </p>
                                </div>
                              </Link>

                              <Link
                                to="/My-Food-orders"
                                onClick={() => setProfileOpen(false)}
                                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900 p-4 transition hover:border-orange-500/40 hover:bg-orange-500/10"
                              >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-xl text-orange-400">
                                  🍽️
                                </div>

                                <div>
                                  <p className="font-medium text-white">
                                    Food Orders
                                  </p>
                                  <p className="text-sm text-zinc-400">
                                    Track food orders
                                  </p>
                                </div>
                              </Link>

                              {/* Cart */}
                              <Link
                                to="/cart"
                                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900 p-4 transition hover:border-orange-500/40 hover:bg-orange-500/10 relative"
                                aria-label="Cart"
                              >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-xl text-orange-400">
                                  🍽️
                                </div>
                                <div className="flex flex-col">
                                  <p className="font-medium text-white">
                                    Food Cart
                                  </p>
                                  <p className="text-sm text-zinc-400">
                                    Saved favourites
                                  </p>
                                  {cartCount > 0 && (
                                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white shadow-lg">
                                    {cartCount > 99 ? "99+" : cartCount}
                                  </span>
                                )}
                                </div>
                              </Link>
                            </>
                          )}

                          {/* Super Admin Profile */}
                          {superAdmin?.role === "super_admin" && (
                            <Link
                              to="/superAdmin/superAdminProfile"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900 p-4 transition hover:border-cyan-500/40 hover:bg-cyan-500/10"
                            >
                              <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
                                <FaRegUserCircle className="text-xl" />
                              </div>

                              <div>
                                <p className="font-medium text-white">
                                  Super Admin Profile
                                </p>
                                <p className="text-sm text-zinc-400">
                                  Manage super admin account
                                </p>
                              </div>
                            </Link>
                          )}

                          {superAdmin?.role === "super_admin" && (
                            <Link
                              to="/superAdmin/superAdminDashboard"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900 p-4 transition hover:border-cyan-500/40 hover:bg-cyan-500/10"
                            >
                              <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
                                <RxDashboard className="text-xl" />
                              </div>

                              <div>
                                <p className="font-medium text-white">
                                  Super Admin Dashboard
                                </p>
                              </div>
                            </Link>
                          )}

                          {admin?.host === "hotel" && (
                            <Link
                              to="/admin/adminDashboard"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900 p-4 transition hover:border-emerald-500/40 hover:bg-emerald-500/10"
                            >
                              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                                <RxDashboard className="text-xl" />
                              </div>

                              <div>
                                <p className="font-medium text-white">
                                  Hotel Dashboard
                                </p>
                              </div>
                            </Link>
                          )}

                          {admin?.host === "restaurant" && (
                            <Link
                              to="/admin/restaurantDashboard"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900 p-4 transition hover:border-yellow-500/40 hover:bg-yellow-500/10"
                            >
                              <div className="rounded-xl bg-yellow-500/10 p-3 text-yellow-400">
                                <RxDashboard className="text-xl" />
                              </div>

                              <div>
                                <p className="font-medium text-white">
                                  Restaurant Dashboard
                                </p>
                              </div>
                            </Link>
                          )}

                          {admin?.host === "delivery_boy" && (
                            <Link
                              to="/admin/deliveryBoy-dashboard"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900 p-4 transition hover:border-indigo-500/40 hover:bg-indigo-500/10"
                            >
                              <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
                                <RxDashboard className="text-xl" />
                              </div>

                              <div>
                                <p className="font-medium text-white">
                                  Delivery Dashboard
                                </p>
                              </div>
                            </Link>
                          )}

                          <Link
                            to="/settings"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900 p-4 transition hover:border-white/20 hover:bg-zinc-800"
                          >
                            <div className="rounded-xl bg-zinc-700 p-3 text-zinc-300">
                              <IoMdSettings className="text-xl" />
                            </div>

                            <div>
                              <p className="font-medium text-white">Settings</p>
                            </div>
                          </Link>
                        </div>

                        {/* Logout */}
                        <div className="sticky bottom-0 border-t border-white/10 bg-black p-5">
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
                            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 font-medium text-red-400 transition hover:bg-red-500 hover:text-white"
                          >
                            <span>🚪</span>
                            Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMenu}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900 text-zinc-300 transition hover:bg-zinc-800 md:hidden"
              >
                {isOpen ? (
                  <MdOutlineCancel className="text-xl" />
                ) : (
                  <HiOutlineMenuAlt3 className="text-xl" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isOpen && (
          <div className="border-t border-white/10 bg-black md:hidden">
            <div className="space-y-2 px-4 py-4">
              {[
                { to: "/", label: "Home" },
                { to: "/cities", label: "Cities" },
                { to: "/places", label: "Places" },
                { to: "/hotels", label: "Hotels" },
                { to: "/restaurants", label: "Restaurants" },
                { to: "/travel", label: "Travel Option" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={toggleMenu}
                  className="block rounded-2xl px-4 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}

              {!token && !superAdminToken && !adminToken && (
                <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4">
                  <Link
                    to="/loginPage"
                    onClick={toggleMenu}
                    className="rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-center text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                  >
                    Login
                  </Link>

                  <Link
                    to="/signUp"
                    onClick={toggleMenu}
                    className="rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-blue-500"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

export default Navbar;