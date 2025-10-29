import React, { useContext } from "react";
import { Link } from "react-router-dom";
import useForm from "../../hooks/useForm/useForm";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import "./Register.scss";
import { Context } from "../../context/Context";
import { toast } from "react-toastify";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaBus } from "react-icons/fa";

const Register = () => {
  const { apiUrl, setUser, navigate, setToken } = useContext(Context);
  const { values, handleChange } = useForm({
    username: "",
    email: "",
    password: "",
    password2: "",
    phone: "",
  });

  const validatePassword = (password, password2) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (password !== password2) {
      return "Passwords do not match";
    }
    return null;
  };

  const mutation = useMutation({
    mutationFn: async (formData) =>
      await axios.post(`${apiUrl}users/register/`, formData),

    onSuccess: ({ data }) => {
      console.log("Registration successfully:", data);
      localStorage.setItem("token", data.access);
      setToken(data.access);
      localStorage.setItem("refresh", data.refresh);
      const userData = { username: data.username, email: data.email };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      toast.success("User registered successfully", {
        onClose: () => {
          navigate("/");
        },
        autoClose: 2000,
      });
    },
    onError: (error) => {
      console.error("Registration failed:", error);
      if(error.response&&error.response.status===400){
        const data=error.response.data;
        const errorMessages=Object.entries(data).flat().join("\n")
        toast.error(errorMessages)
      }
      // toast.error("Registration failed. Please try again");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validatePassword(values.password, values.password2);
    if (error) {
      toast.error(error);
      return;
    }
    mutation.mutate(values);
  };

  return (
    <div className="register">
      <div className="card">
        <div className="left">
          <div className="left__content">
            <FaBus className="icon-bus" />
            <h2>Already have an account?</h2>
            <p>
              Welcome back! Login to access exclusive deals, track bookings, and enjoy seamless bus ticket booking.
            </p>
            <Link to="/login">
              <button className="btn-login">Login Now</button>
            </Link>
          </div>
        </div>
        <div className="right">
          <div className="right__header">
            <h1>Create Account</h1>
            <p>Join us to start your journey</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  id="username"
                  placeholder="Choose a username"
                  name="username"
                  value={values.username}
                  onChange={handleChange}
                  required
                  disabled={mutation.isPending}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  name="email"
                  value={values.email}
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
                  placeholder="Create a password (min. 8 characters)"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  required
                  disabled={mutation.isPending}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password2">Confirm Password</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  id="password2"
                  placeholder="Confirm your password"
                  name="password2"
                  value={values.password2}
                  onChange={handleChange}
                  required
                  disabled={mutation.isPending}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Mobile Number</label>
              <div className="input-wrapper">
                <FaPhone className="input-icon" />
                <input
                  type="tel"
                  id="phone"
                  placeholder="Enter your mobile number"
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  required
                  disabled={mutation.isPending}
                />
              </div>
            </div>

            <button type="submit" className="btn-register" disabled={mutation.isPending}>
              {mutation.isPending ? "Registering..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
