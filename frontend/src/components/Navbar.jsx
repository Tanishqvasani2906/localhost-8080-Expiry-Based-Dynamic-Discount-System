import React, { useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../theme/DarkMode";
import Login from "../auth/login";
import Signup from "../auth/SignUp";
import { Link } from "react-router-dom";

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
  const [theme, setTheme] = useTheme();
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [isSignUpPopupOpen, setIsSignUpPopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
    console.log("Searching for:", searchQuery); // Replace with your search logic
  };

  return (
    <div className="mb-12 z-50">
      <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left Side Logo */}
            <div className="flex items-center">
              <div className="flex items-center text-4xl font-bold">
                <span className="relative text-blue-700 dark:text-blue-500 text-5xl">
                  L
                </span>
                <span className="relative dark:text-white">H8080</span>
              </div>
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

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLoginPopup}
                className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-md dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Login/Register
              </button>
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
