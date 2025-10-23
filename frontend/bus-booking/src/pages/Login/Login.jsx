import React, { useContext, useState } from "react";
import { Context } from "../../context/Context";
import { Link } from "react-router-dom";
import useForm from "../../hooks/useForm/useForm";
import "./Login.scss";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

export const Login = () => {
  const { apiUrl, user, setUser, navigate, setToken } = useContext(Context);
  const { values, handleChange } = useForm({
    username: "",
    password: "",
    password2: "",
  });
  const mutation = useMutation({
    mutationFn: async (formData) =>
      await axios.post(`${apiUrl}users/login/`, formData),

    onSuccess: ({ data }) => {
      console.log("login successfully:", data);
      localStorage.setItem("token", data.access);
      setToken(data.access);
      localStorage.setItem("refresh", data.refresh);
      const userData = { username: data.username, email: data.email };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      toast.success("Logged in successfull", {
        onClose: () => {
          navigate("/");
        },
        autoClose: 2000,
      });
    },
    onError: (error) => {
      console.error("login failed:", error);
      toast.error(
        error.response?.data?.error || "Login failed. Please try again"
      );
    },
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(values);
  };

  return (
    <div className="login">
      <div className="card">
        <div className="left">
          <span>Dont' you have an account?</span>
          <Link to="/register">
            {" "}
            <button>Register</button>
          </Link>
        </div>
        <div className="right">
          <h1>Login</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              name="username"
              value={values.username}
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
              placeholder="confirm Password"
              name="password2"
              value={values.password2}
              onChange={handleChange}
            />

            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};
