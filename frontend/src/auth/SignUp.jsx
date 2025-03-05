import React, { useState, useEffect } from "react";

const Signup = ({ onClose, onSwitch }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Prevent background scrolling when the modal is open
  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  const handleSignup = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Signing up with:", {
      username,
      password,
      email,
      firstName,
      lastName,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/3 max-w-lg max-h-[80vh] overflow-y-auto relative transition-all transform hover:scale-101 duration-300">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-700 hover:text-red-600 text-2xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-3xl font-extrabold mb-4 text-center text-green-700">
          Sign Up
        </h2>
        <p className="text-center text-gray-600 mb-8 italic">
          Waste Less, Save More – Create Your Account Today!
        </p>
        <form onSubmit={handleSignup} className="space-y-6">
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-gray-700 font-medium">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 outline-none"
                placeholder="First Name"
                required
              />
            </div>
            <div className="w-1/2">
              <label className="block text-gray-700 font-medium">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 outline-none"
                placeholder="Last Name"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 outline-none"
              placeholder="Username"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 outline-none"
              placeholder="Email"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 outline-none"
              placeholder="Password"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 outline-none"
              placeholder="Confirm Password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105"
          >
            Sign Up
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-700">
            Already have an account?
            <button
              onClick={onSwitch}
              className="text-blue-600 hover:underline ml-1"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
