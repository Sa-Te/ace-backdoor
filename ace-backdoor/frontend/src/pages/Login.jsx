// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { toast } from "react-toastify";
import passwordEye from "../public/assets/passwordEye.svg";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/auth/login", {
        username,
        password,
      });
      localStorage.setItem("token", response.data.token);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
    }
  };

  const handleMouseDown = () => {
    setShowPassword(true);
  };

  const handleMouseUp = () => {
    setShowPassword(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-login-background bg-primaryColor">
      <form
        onSubmit={handleLogin}
        className="p-8 rounded text-white w-full max-w-md flex flex-col gap-5"
      >
        <h2 className="text-3xl font-GilroyBold mb-4">Login</h2>
        <div className="mb-4">
          <label className="block text-md font-GilroysemiBold mb-2">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 bg-[#040D27] text-[#98B3FF] rounded focus:outline-none border-2 border-[#102151] font-GilroyBold"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-md font-GilroysemiBold mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-[#040D27] rounded focus:outline-none border-2 border-[#102151] text-[#98B3FF] font-GilroyBold pr-12"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                src={passwordEye}
                alt="Toggle Password Visibility"
                className="w-5 h-5 transform transition-transform duration-200 hover:scale-110"
              />
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#284DB7] to-[#1E4FDC] hover:bg-blue-700 py-4 rounded-lg text-white font-GilroyBold text-md"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
