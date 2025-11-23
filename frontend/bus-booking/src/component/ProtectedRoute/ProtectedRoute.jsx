// ProtectedRoute.jsx
import React, { useContext, useEffect } from "react";
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
  const { token,setToken,setUser } = useContext(Context);


  useEffect(()=>{
    if (!token || isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user")
    setToken(null)
    setUser({})

    // return <Navigate to="/login" replace />;
    
  }
  }, [token])

  return children;
};

export default ProtectedRoute;
