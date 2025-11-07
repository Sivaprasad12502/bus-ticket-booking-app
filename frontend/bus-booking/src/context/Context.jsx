import { useEffect, useState } from "react";
import { createContext } from "react";
import { useNavigate } from "react-router-dom";

export const Context = createContext();
const ContextProvider = (props) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate=useNavigate()
  const [token,setToken]=useState(localStorage.getItem("token")||null)
  const [user,setUser]=useState(JSON.parse(localStorage.getItem('user'))||{})
  const [adminUser,setAdminUser]=useState(JSON.parse(localStorage.getItem('adminUser'))||{})
  const [adminAccessToken,setAdminAccessToken]=useState(localStorage.getItem("adminAccessToken")||null)
  const [adminRefreshToken,setAdminRefreshToken]=useState(localStorage.getItem("adminRefreshToken")||null)
  // useEffect(()=>{
  //   if(token){
  //     localStorage.setItem("token",token)
  //   }else{
  //     localStorage.removeItem("token")
  //   }
  // },[token])
  // useEffect(()=>{
  //   if(user){
  //     localStorage.setItem('user',JSON.stringify(user))
  //   }
  // },[user])
  useEffect(()=>{
    if(adminAccessToken&&adminRefreshToken&&adminUser){
      localStorage.setItem("adminAccessToken",adminAccessToken)
      localStorage.setItem("adminRefreshToken",adminRefreshToken)
      localStorage.setItem("adminUser",JSON.stringify(adminUser))
    }else{
      localStorage.removeItem('adminAccessToken')
      localStorage.removeItem('adminRefreshToken')
      localStorage.removeItem('adminUser')
    }
  },[adminAccessToken,adminRefreshToken,adminUser])
  return (
    <Context.Provider value={{ apiUrl,navigate,token,setToken,user,setUser,adminUser,setAdminUser,adminAccessToken,setAdminAccessToken,adminRefreshToken,setAdminRefreshToken }}>{props.children}</Context.Provider>
  );
};
export default ContextProvider;
