import React, { useContext, useState } from "react";
import { Context } from "../../context/Context";
import { Link } from "react-router-dom";

export const Login = () => {
  
  const { apiUrl } = useContext(Context);
  const onSubmitHandler=()=>{

  }

  return (
    <form action="">
        <input type="email" placeholder="please enter your email"/>
        <input type="password" placeholder="enter your password"/>
        <input type="password" placeholder="confirm your password"/>
        <p>Dont have any account? <Link to={'/register'}></Link></p>
    </form>
  );
};
