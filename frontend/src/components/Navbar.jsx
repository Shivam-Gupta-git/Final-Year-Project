import React, { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200"
          >
            NotDefine
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              to="/cities"
              className="text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors duration-200"
            >
              Cities
            </Link>
            <Link
              to="/places"
              className="text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors duration-200"
            >
              Places
            </Link>
            <Link
              to="/hotels"
              className="text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors duration-200"
            >
              Hotels
            </Link>
            <Link
              to="/restaurants"
              className="text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors duration-200"
            >
              Restaurants
            </Link>
            <Link
              to="/travel"
              className="text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors duration-200"
            >
              Travel Option
            </Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <button className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
                Login
              </button>
            </Link>
            <Link to="/signUp">
              <button className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-full hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-200">
                Register
              </button>
            </Link>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
  );
}

export default Navbar;
