import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "../utils/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));

  // This effect synchronizes the axios header whenever the token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  }, [token]);

  const login = async (username, password) => {
    try {
      delete axios.defaults.headers.common["Authorization"];

      const response = await axios.post("/api/auth/login", {
        username,
        password,
      });
      setToken(response.data.token);
      // REMOVE navigate("/dashboard");
      return { success: true }; // RETURN success status
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, message: "Login failed. Check credentials." };
    }
  };

  const logout = () => {
    setToken(null);
  };

  const value = { token, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
