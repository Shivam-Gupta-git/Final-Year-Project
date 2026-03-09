import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function UserProtectedRouter({ children }) {

  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.user);

  // If no token → go login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Wait until user loads
  if (!user) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  // Check role
  if (user.role !== "user") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default UserProtectedRouter;