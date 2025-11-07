import React, {  useContext } from "react";
import { Context } from "../../context/Context";
import { Navigate } from "react-router-dom";
function isTokenExpired(token) {
  if (!token) return true;
  try {
    const [, payloadBase64] = token.split(".");
    const payload = JSON.parse(atob(payloadBase64));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error("error checking token expiration:", error);
    return true;
  }
}
const ProtectedRoute = ({children}) => {
  const { accessToken } = useContext(Context);
  if (!accessToken || isTokenExpired(accessToken)) {
    localStorage.removeItem("accesstoken");
    localStorage.removeItem("refreshtoken");
    return <Navigate to={"/login"} replace />;
  }
  return children
};

export default ProtectedRoute;
