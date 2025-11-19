import React, { Children, useEffect, useState } from "react";
import { Context } from "../../context/Context";
import { useContext } from "react";
import { Navigate } from "react-router-dom";

function isTokenExpired(operatorAccessToken) {
  if (!operatorAccessToken) return true;
  try {
    const [, payloadBase64] = operatorAccessToken.split(".");
    const payload = JSON.parse(atob(payloadBase64));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
const OperatorProtectedRoute = ({ children }) => {
  const {
    operator,
    setOperator,
    operatorAccessToken,
    setOperatorAccessToken,
    operatorRefreshToken,
    setOperatorRefreshToken,
  } = useContext(Context);
  const [authorized, setAuthorized] = useState(null);
  useEffect(()=>{
    const isInvalid=!operatorAccessToken||isTokenExpired(operatorAccessToken)
    if(isInvalid){
        setOperatorAccessToken(null)
        setOperatorRefreshToken(null)
        setOperator({})
        setAuthorized(false)
    }else{
        setAuthorized(true)
    }
  },[operatorAccessToken])
  if(authorized===null) return null;
  if(!authorized){
    return <Navigate to="/operator/login" replace/>
  }
  return children
};
export default OperatorProtectedRoute
