import React, { useContext, useState } from "react";
import { Context } from "../../context/Context";
import { Link } from "react-router-dom";
import useForm from "../../hooks/useForm/useForm";
import "./Login.scss";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { FaUser, FaLock, FaBus } from "react-icons/fa";

export const Login = () => {
  const { apiUrl, user, setUser, navigate, setToken } = useContext(Context);
  const { values, handleChange } = useForm({
    username: "",
    password: "",
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
      toast.success("Logged in successfully", {
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
          <div className="left__content">
            <FaBus className="icon-bus" />
            <h2>First time here?</h2>
            <p>Register with us to unlock exciting offers and discounts on bus bookings.</p>
            <Link to="/register">
              <button className="btn-register">Create Account</button>
            </Link>
          </div>
        </div>
        <div className="right">
          <div className="right__header">
            <h1>Welcome Back</h1>
            <p>Login to continue your journey</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  id="username"
                  placeholder="Enter your username"
                  name="username"
                  value={values.username}
                  onChange={handleChange}
                  required
                  disabled={mutation.isPending}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  required
                  disabled={mutation.isPending}
                />
              </div>
            </div>

            <button type="submit" className="btn-login" disabled={mutation.isPending}>
              {mutation.isPending ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

