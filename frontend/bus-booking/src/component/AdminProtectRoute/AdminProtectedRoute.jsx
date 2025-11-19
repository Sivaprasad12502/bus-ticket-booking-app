import React, { useEffect, useState } from "react";
import { Context } from "../../context/Context";
import { useContext } from "react";
import { Navigate } from "react-router-dom";
function isTokenExpired(adminAccessToken) {
  if (!adminAccessToken) return true;
  try {
    const [, payloadBase64] = adminAccessToken.split(".");
    const payload = JSON.parse(atob(payloadBase64));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
const AdminProtectedRoute = ({ children }) => {
  const {
    adminUser,
    setAdminUser,
    adminAccessToken,
    setAdminAccessToken,
    adminRefreshToken,
    setAdminRefreshToken,
  } = useContext(Context);
  const [authorized, setAuthorized] = useState(null);
  useEffect(() => {
    const isInvalid =
      !adminAccessToken ||
      isTokenExpired(adminAccessToken) ||
      adminUser?.is_staff !== true;
    if (isInvalid) {
      setAdminAccessToken(null);
      setAdminRefreshToken(null);
      setAdminUser({});
      setAuthorized(false);
    } else {
      setAuthorized(true);
    }
  }, [adminAccessToken]);
  if(authorized===null) return null;//or loadign
  if (!authorized) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

export default AdminProtectedRoute;
