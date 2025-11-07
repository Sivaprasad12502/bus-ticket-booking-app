import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Context = createContext();
const ContextProvider = (props) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate=useNavigate()
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accesstoken") || null
  );
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refreshtoken") || null
  );
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || {}
  );
  console.log("user in context",user)
  useEffect(() => {
    if (accessToken && refreshToken && user) {
      localStorage.setItem("accesstoken", accessToken);
      localStorage.setItem("refreshtoken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("accesstoken");
      localStorage.removeItem("refreshtoken");
      localStorage.removeItem("user");
    }
  }, [accessToken, refreshToken, user]);
  return (
    <Context.Provider
      value={{
        apiUrl,
        accessToken,
        setAccessToken,
        refreshToken,
        setRefreshToken,
        user,
        setUser,
       navigate
      }}
    >
      {props.children}
    </Context.Provider>
  );
};
export default ContextProvider;
