import React, { useContext, useState } from "react";
import { Context } from "../../context/Context";
import { FaUser, FaLock, FaBus, FaEye, FaEyeSlash } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
// import "./Login.scss";

const AdminLogin = () => {
  const {
    apiUrl,
    setAdminUser,
    adminAccessToken,
    setAdminAccessToken,
    adminRefreshToken,
    setAdminRefreshToken,
    navigate,
  } = useContext(Context);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async (formData) =>
      await axios.post(`${apiUrl}users/admin/login/`, formData),
    onSuccess: ({ data }) => {
      console.log("Admin login successful:", data);
      setAdminAccessToken(data.access);
      setAdminRefreshToken(data.refresh);
      const userData = { username: data.username, email: data.email,is_staff:data.is_staff };
      setAdminUser(userData);
      toast.success("admin Loggged in successfully")
      navigate("/admin/dashboard");
    },
    onError: (error) => {
      console.error("Admin login failed:", error);
      setError(
        error.response?.data?.error || "Login failed. Please try again."
      );
      toast.error(error.response?.data?.error||"Admin Login failed. Please try again.")
    },
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error on input change
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.username || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    mutation.mutate(formData);
  };

  return (
    <div className="login">
      <div className="card">
        <div className="left">
          <div className="left__content">
            <FaBus className="icon-bus" />
            <h2>Admin Portal</h2>
            <p>
              Manage your bus operations, routes, bookings, and users
              efficiently from this comprehensive admin dashboard.
            </p>
            <div className="features">
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Real-time Analytics</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Fleet Management</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✓</span>
                <span>Booking Control</span>
              </div>
            </div>
          </div>
        </div>
        <div className="right">
          <div className="right__header">
            {/* <h1>Welcome Back</h1> */}
            <p>Login to access admin dashboard</p>
          </div>

          {error && (
            <div className="error-message">
              <span>{error}</span>
            </div>
          )}

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
                  value={formData.username}
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
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={mutation.isPending}
                />
                {/* <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button> */}
              </div>
            </div>

            <button
              type="submit"
              className="btn-login"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <span className="spinner"></span>
                  Logging in...
                </>
              ) : (
                "Login to Dashboard"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
