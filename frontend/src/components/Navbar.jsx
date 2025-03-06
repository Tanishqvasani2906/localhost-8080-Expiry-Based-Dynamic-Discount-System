import React, { useState, useEffect } from "react";
import Login from "../auth/Login";
import Signup from "../auth/SignUp";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [isSignUpPopupOpen, setIsSignUpPopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    new URLSearchParams(location.search).get("search") || ""
  );
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("Token"));
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setSearchQuery(queryParams.get("search") || "");
  }, [location.search]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (localStorage.getItem("Token") && !isAdmin) {
        const decodedToken = jwtDecode(localStorage.getItem("Token"));
        if (decodedToken.exp * 1000 < Date.now()) {
          handleLogout();
        } else {
          if (decodedToken.roles === "ADMIN") {
            setIsAdmin(true);
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn, isAdmin]);

  const handleLoginPopup = () => {
    setIsLoginPopupOpen(!isLoginPopupOpen);
    setIsSignUpPopupOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleSignUpPopup = () => {
    setIsSignUpPopupOpen(!isSignUpPopupOpen);
    setIsLoginPopupOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      navigate(`?search=${searchQuery}`);
    } else {
      navigate("/");
    }
    console.log("Searching for:", searchQuery);
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/userlogin/logout`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
        }
      );

      if (response.status === 200) {
        console.log("Successfully logged out");
        localStorage.removeItem("Token");
        setIsLoggedIn(false);
      } else {
        console.error("Logout failed:", response.data);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="mb-12 z-50">
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left Side Logo */}
            <div className="flex items-center">
              <button
                onClick={() => navigate("/")}
                className="flex items-center text-4xl font-bold cursor-pointer"
              >
                <span className="relative text-blue-700 text-5xl">L</span>
                <span className="relative">H8080</span>
              </button>
            </div>

            {/* Search Bar */}
            <form
              className="flex items-center shadow-md rounded-lg md:w-1/2"
              onSubmit={handleSearch}
            >
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 rounded-lg w-full"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
              >
                Search
              </button>
            </form>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Navigation Links */}
              {localStorage.getItem("Token") && isAdmin && (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate("/addProduct")}
                    className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-md"
                  >
                    Add Products
                  </button>
                </div>
              )}

              {localStorage.getItem("Token") ? (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-md"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={handleLoginPopup}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-md"
                >
                  Login/Register
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-y-0 right-0 bg-white w-full md:w-1/2 shadow-lg transform transition-transform duration-300 ease-in-out">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/")}
                className="flex items-center text-4xl font-bold cursor-pointer"
              >
                <span className="relative text-blue-700 text-5xl">L</span>
                <span className="relative">H8080</span>
              </button>
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form
              className="flex items-center shadow-md rounded-lg my-4"
              onSubmit={handleSearch}
            >
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 rounded-lg w-full"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
              >
                Search
              </button>
            </form>
            <div className="flex items-center space-x-4">
              {localStorage.getItem("Token") && isAdmin && (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigate("/addProduct")}
                    className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-md"
                  >
                    Add Products
                  </button>
                </div>
              )}
              {localStorage.getItem("Token") ? (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-md"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={handleLoginPopup}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-md"
                >
                  Login/Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Popup */}
      {isLoginPopupOpen && (
        <Login onClose={handleLoginPopup} onSwitch={handleSignUpPopup} />
      )}

      {/* Register Popup */}
      {isSignUpPopupOpen && (
        <Signup onClose={handleSignUpPopup} onSwitch={handleLoginPopup} />
      )}
    </div>
  );
};

export default Navbar;
