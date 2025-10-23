import React, { useContext } from "react";
import { Link } from "react-router-dom";
import useForm from "../../hooks/useForm/useForm";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import "./Register.scss";
import { Context } from "../../context/Context";
import {toast} from 'react-toastify'

const Register = () => {
  const { apiUrl, setUser, navigate, setToken } = useContext(Context);
  const { values, handleChange } = useForm({
    username: "",
    email: "",
    password: "",
    password2: "",
    phone: "",
  });
  const validatePassword=(password,password2)=>{
    if(password.length<8){
      return "password must be at least 8 characters long"
    }
    if(password!==password2){
      return "passwords do not match"
    }
    return null
  }
  const mutation = useMutation({
    mutationFn: async (formData) =>
      await axios.post(`${apiUrl}users/register/`, formData),

    onSuccess: ({ data }) => {
      console.log("Registeration successfully:", data);
      localStorage.setItem("token", data.access);
      setToken(data.access);
      localStorage.setItem("refresh", data.refresh);
      const userData = { username: data.username, email: data.email };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      toast.success("user registered successfull", {
        onClose: () => {
          navigate("/");
        },
        autoClose: 2000,
      });
    },
    onError: (error) => {
      console.error("Registration failed:", error);
      toast.error(
         "registration failed. Please try again"
      );
    },
  });
  const handleSubmit = (e) => {
    const error=validatePassword(values.password,values.password2)
    if(error){
      toast.error(error)
    }
    e.preventDefault();
    mutation.mutate(values);
  };
  return (
    <div className="register">
      <div className="card">
        <div className="left">
          <h1>Lama Social.</h1>
          <p>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quos
            provident, aperiam dolorem impedit et omnis, error minus dignissimos
            inventore quidem ratione atque molestias numquam eligendi cupiditate
            non, sint vero aspernatur?
          </p>
          <span>Do you have an account?</span>
          <Link to="/login">
            <button>Login</button>
          </Link>
        </div>
        <div className="right">
          <h1>Register</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              name="username"
              value={values.username}
              onChange={handleChange}
            />
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={values.email}
              onChange={handleChange}
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={values.password}
              onChange={handleChange}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              name="password2"
              value={values.password2}
              onChange={handleChange}
            />
            <input
              type="number"
              placeholder="Mobile No"
              name="phone"
              value={values.phone}
              onChange={handleChange}
            />
            <button type="submit">Register</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
