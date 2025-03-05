import React, { useState, useEffect } from "react";

const Login = ({ onClose, onSwitch }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Prevent background scrolling when the modal is open
  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert("Please fill in all fields");
      return;
    }
    console.log("Logging in with:", username, password);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/3 max-w-lg max-h-[80vh] overflow-y-auto relative transition-all transform hover:scale-100 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-600 text-2xl font-bold transition-colors duration-200"
        >
          &times;
        </button>
        <h2 className="text-3xl font-extrabold mb-4 text-center text-green-700">
          Welcome Back!
        </h2>
        <p className="text-center text-gray-600 mb-8 italic">
          Let’s Pick Up Where You Left Off – Login
        </p>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 outline-none transition-transform transform hover:scale-105"
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 outline-none transition-transform transform hover:scale-105"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 duration-300"
          >
            Login
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-700">
            Don't have an account?
            <button
              onClick={onSwitch}
              className="text-blue-600 hover:underline ml-1 transition-all duration-200"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
