import React, { useContext, useState } from "react";
import { Context } from "../../context/Context";
import { Link } from "react-router-dom";
import useForm from "../../hooks/useForm/useForm";
import "./Login.scss";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import { FaUser, FaLock, FaBus,FaGoogle,FaCheckSquare,FaRegSquare } from "react-icons/fa";

import { auth, googleProvider } from "../../firebase/Firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export const Login = () => {
  const { apiUrl, user, setUser, navigate, setToken } = useContext(Context);
  const params = new URLSearchParams(location.search);
  const next = params.get("next") || "/";
  const { values, handleChange } = useForm({
    username: "",
    password: "",
  });
  const [showPassword,setShowPassword]=useState(false)
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
          if (next) {
            navigate(next);
          }
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
  // -----------GOOGLE LOGIN -------------//
  const loginWithGoogle = useMutation({
    mutationFn: async (idToken) => {
      return await axios.post(`${apiUrl}users/google/login/`, {
        id_token: idToken,
      });
    },
    onSuccess: ({ data }) => {
      localStorage.setItem("token", data.access);
      setToken(data.access);
      localStorage.setItem("refresh", data.refresh);
      const userData = {
        username: data.username,
        email: data.email,
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      toast.success("login successful!", {
        onClose: () => navigate(next),
        autoClose: 1500,
      });
    },
    onError: (err) => {
      console.log(err);
      toast.error(err.response?.data?.error || "Login failed");
    },
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(values);
  };
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      loginWithGoogle.mutate(idToken);
    } catch (error) {
      console.log(error);
      toast.error("login failed");
    }
  };
  return (
    <div className="login">
      <div className="card">
        <div className="left">
          <div className="left__content">
            <FaBus className="icon-bus" />
            <h2>First time here?</h2>
            <p>
              Register with us to unlock exciting offers and discounts on bus
              bookings.
            </p>
            <Link to={`/register?next=${encodeURIComponent(next)}`}>
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
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  required
                  disabled={mutation.isPending}
                />
              </div>
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaCheckSquare /> : <FaRegSquare />} Show Password
              </button>
            </div>

            <button
              type="submit"
              className="btn-login"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className="google-login">
            
            <button
              onClick={handleGoogleLogin}
              className="btn-google-login"
              disabled={loginWithGoogle.isPending}
            >
              <FaGoogle/>{loginWithGoogle.isPending ? "logging..." : "Continue with Google"}
            </button>
          </div>
          <div className="forgot-password">
            <Link to={'/forgot-password'}>Forgot password?</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
