import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function SuperAdminProtectedRouter({ children }) {

  const { superAdminToken, superAdmin, loading } = useSelector(
    (state) => state.superAdminAuth
  );
  console.log("superAdminToken: ",superAdminToken);
  console.log("superAdmin", superAdmin);
  // wait until login process finishes
  if (loading) {
    return <div>Loading...</div>;
  }

  // check token from redux OR localStorage
  const authToken = superAdminToken || localStorage.getItem("superAdminToken");

  if (!authToken) {
    return <Navigate to="/superAdmin/login" replace />;
  }

  return children;
}

export default SuperAdminProtectedRouter;