import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { toast } from "react-toastify";
import passwordEye from "../public/assets/passwordEye.svg";
import { useAuth } from "../context/AuthContext";

/**
 * @file Login.jsx
 * @description The login page for the admin panel. Handles user authentication.
 */
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error("Please Enter both username and password.");
      setIsError(true);
      return;
    }
    setIsLoading(true);
    try {
      const result = await login(username, password);

      if (result.success) {
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        // Login Failed (Wrong password or username)
        toast.error(result.message || "Invalid credentials");
        setIsError(true); // Turn border red
        setPassword(""); // Security: Clear password field on failure
      }
    } catch (error) {
      toast.error("Network error. Please check your connection.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  /**
   * Temporarily shows the password when the user toggles by clicking the visibility toggle.
   */
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
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
            onChange={(e) => {
              setUsername(e.target.value);
              if (isError) setIsError(false);
            }}
            className={`w-full p-3 bg-[#040D27] text-[#98B3FF] rounded-lg outline-none border-2 font-GilroyBold transition-all duration-200
                ${
                  isError
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#102151] focus:border-[#284DB7]"
                }`}
            required
            disabled={isLoading}
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
              onChange={(e) => {
                setPassword(e.target.value);
                if (isError) setIsError(false);
              }}
              className={`w-full p-3 bg-[#040D27] rounded-lg outline-none border-2 text-[#98B3FF] font-GilroyBold pr-12 transition-all duration-200
                ${
                  isError
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#102151] focus:border-[#284DB7]"
                }`}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex="-1"
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
          disabled={isLoading}
          className={`w-full bg-gradient-to-r from-[#284DB7] to-[#1E4FDC] py-4 rounded-lg text-white font-GilroyBold text-md transition-all shadow-lg shadow-blue-900/20
            ${
              isLoading
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-blue-700 hover:scale-[1.02]"
            }`}
        >
          {isLoading ? "Verifying..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
