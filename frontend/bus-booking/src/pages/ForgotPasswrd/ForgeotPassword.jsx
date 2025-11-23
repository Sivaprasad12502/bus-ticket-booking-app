import React, { useContext, useState } from "react";
import { Context } from "../../context/Context";
import axios from "axios";
import { toast } from "react-toastify";
import { MdEmail, MdArrowBack, MdLock, MdCheckCircle } from "react-icons/md";
import { Link } from "react-router-dom";
import "./ForgotPassword.scss";

const ForgotPassword = () => {
  const { apiUrl, navigate } = useContext(Context);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${apiUrl}users/password-reset/`, { email });
      setEmailSent(true);
      toast.success("Password reset link sent to your email!", {
        position: "top-center",
        autoClose: 5000,
      });
    } catch (error) {
      console.error("Password reset error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to send reset link. Please try again.";
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setEmailSent(false);
    setEmail("");
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        {/* Back to login button */}
        <Link to="/login" className="back-to-login">
          <MdArrowBack />
          <span>Back to Login</span>
        </Link>

        {!emailSent ? (
          // Password Reset Request Form
          <div className="forgot-password-card">
            <div className="card-header">
              <div className="icon-wrapper">
                <MdLock className="lock-icon" />
              </div>
              <h2>Forgot Password?</h2>
              <p className="subtitle">
                No worries! Enter your email address and we'll send you a link
                to reset your password.
              </p>
            </div>

            <form className="forgot-password-form" onSubmit={handleSend}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <MdEmail className="input-icon" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <MdEmail />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>
            </form>

           
          </div>
        ) : (
          // Success Message
          <div className="forgot-password-card success-card">
            <div className="success-animation">
              <MdCheckCircle className="success-icon" />
            </div>

            <h2>Check Your Email</h2>
            <p className="success-message">
              We've sent a password reset link to
            </p>
            <p className="email-display">{email}</p>

            <div className="instructions">
              <h4>What's next?</h4>
              <ul>
                <li>Check your email inbox (and spam folder)</li>
                <li>Click on the password reset link</li>
                <li>Create a new password</li>
                <li>Sign in with your new password</li>
              </ul>
            </div>

            <div className="success-actions">
              <button onClick={handleResend} className="resend-btn">
                Send to Different Email
              </button>
              <Link to="/login" className="goto-login-btn">
                Go to Login
              </Link>
            </div>

            <div className="help-text">
              <p>
                Didn't receive the email?{" "}
                <button
                  onClick={handleSend}
                  className="text-link"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Resend"}
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
