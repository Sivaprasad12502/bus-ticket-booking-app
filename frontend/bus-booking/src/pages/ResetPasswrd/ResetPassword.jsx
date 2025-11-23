import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../context/Context";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./ResetPassword.scss";

const ResetPassword = () => {
  const { apiUrl, navigate } = useContext(Context);
  const { uidb64, token } = useParams();

  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Verify reset token
  useEffect(() => {
    axios
      .get(`${apiUrl}users/password-reset/verify/${uidb64}/${token}/`)
      .then(() => {
        setValid(true);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Invalid or expired reset link");
        setLoading(false);
      });
  }, []);

  const handleReset = async () => {
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      await axios.post(`${apiUrl}users/password-reset/confirm/`, {
        uidb64,
        token,
        password,
      });

      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (err) {
      toast.error("Failed to reset password");
      console.log(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="reset-container"><h3>Verifying link...</h3></div>;
  }

  if (!valid) {
    return (
      <div className="reset-container">
        <h3 className="error-text">Invalid or expired link.</h3>
      </div>
    );
  }

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h2>Reset Your Password</h2>
        <p>Please enter your new password below.</p>

        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={submitting}
          />
        </div>

        <button
          className="btn-reset"
          onClick={handleReset}
          disabled={submitting}
        >
          {submitting ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
