import { useEffect, useState } from "react";
import { createContext } from "react";
import { useNavigate } from "react-router-dom";

export const Context = createContext();
const ContextProvider = (props) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate=useNavigate()
  const [token,setToken]=useState(localStorage.getItem("token")||null)
  const [user,setUser]=useState(JSON.parse(localStorage.getItem('user'))||{})
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
  return (
    <Context.Provider value={{ apiUrl,navigate,token,setToken,user,setUser }}>{props.children}</Context.Provider>
  );
};
export default ContextProvider;
