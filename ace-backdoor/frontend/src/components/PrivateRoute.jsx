import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import the custom hook

const PrivateRoute = ({ children }) => {
  const { token } = useAuth(); // Get the token directly from context

  if (!token) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This is optional but good UX.
    return <Navigate to="/login" replace />;
  }

  // NOTE: The server will handle token expiration checks on every API call.
  // The client-side check can be removed for simplicity unless you need specific
  // pre-emptive logic. If the token is invalid, the first API call will fail,
  // and an error interceptor (a good next step) would call logout().

  return children;
};

export default PrivateRoute;
