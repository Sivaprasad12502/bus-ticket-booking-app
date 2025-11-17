// ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Context } from "../../context/Context";


function isTokenExpired(token) {
  if (!token) return true;
  try {
    const [, payloadBase64] = token.split(".");
    const payload = JSON.parse(atob(payloadBase64));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

const ProtectedRoute = ({ children }) => {
  const { token } = useContext(Context);

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    // return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
