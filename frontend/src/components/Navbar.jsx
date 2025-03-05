import React, { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../theme/DarkMode";
import Login from "../auth/Login";
import Signup from "../auth/SignUp";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const ThemeSwitcher = ({ currentTheme, onThemeChange }) => {
  const themes = [
    { name: "light", icon: Sun },
    { name: "dark", icon: Moon },
    { name: "system", icon: Monitor },
  ];

  const currentThemeData = themes.find((theme) => theme.name === currentTheme);

  const getNextTheme = () => {
    const currentIndex = themes.findIndex(
      (theme) => theme.name === currentTheme
    );
    return themes[(currentIndex + 1) % themes.length].name;
  };

  return (
    currentThemeData && (
      <button
        onClick={() => onThemeChange(getNextTheme())}
        className="relative p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg text-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-xl focus:ring-3 focus:ring-blue-300 dark:focus:ring-blue-800 group"
        title={`${
          currentThemeData.name.charAt(0).toUpperCase() +
          currentThemeData.name.slice(1)
        } mode`}
      >
        <currentThemeData.icon className="w-6 h-6" />
      </button>
    )
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useTheme();
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [isSignUpPopupOpen, setIsSignUpPopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    new URLSearchParams(location.search).get("search") || ""
  );
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("Token"));
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setSearchQuery(queryParams.get("search") || "");
  }, [location.search]);

  useEffect(() => {
    //function which call every second
    const interval = setInterval(() => {
      if (localStorage.getItem("Token")) {
        const decodedToken = jwtDecode(localStorage.getItem("Token"));
        if (decodedToken.exp * 1000 < Date.now()) {
          handleLogout();
        } else {
          if (decodedToken.role === "ADMIN") {
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
  };

  const handleSignUpPopup = () => {
    setIsSignUpPopupOpen(!isSignUpPopupOpen);
    setIsLoginPopupOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Update the URL search params
    if (searchQuery) {
      navigate(`?search=${searchQuery}`);
    } else {
      navigate("/");
    }
    console.log("Searching for:", searchQuery);
  };

  const handleLogout = async () => {
    try {
      // Send a request to the backend to log out
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

      // Check if the response indicates a successful logout
      if (response.status === 200) {
        console.log("Successfully logged out");
        // Remove token from localStorage
        localStorage.removeItem("Token");
        setIsLoggedIn(false); // Update state to reflect logged out status
      } else {
        console.error("Logout failed:", response.data);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Navigation links
  const redirect = (path) => {
    navigate(path);
  };

  return (
    <div className="mb-12 z-50">
      <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left Side Logo */}
            <div className="flex items-center">
              <button
                onClick={() => redirect("/")}
                className="flex items-center text-4xl font-bold cursor-pointer"
              >
                <span className="relative text-blue-700 dark:text-blue-500 text-5xl">
                  L
                </span>
                <span className="relative dark:text-white">H8080</span>
              </button>
            </div>

            {/* Search Bar */}
            <form
              className="flex items-center shadow-md rounded-lg"
              onSubmit={handleSearch}
            >
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 rounded-lg"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
              >
                Search
              </button>
            </form>

            {/* Navigation Links */}
            {localStorage.getItem("Token") && isAdmin && (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => redirect("addProducts")}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-md dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Add Products
                </button>
              </div>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {localStorage.getItem("Token") ? (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-md dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={handleLoginPopup}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-md dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Login/Register
                </button>
              )}
              <ThemeSwitcher currentTheme={theme} onThemeChange={setTheme} />
            </div>
          </div>
        </div>
      </nav>

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
