import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";

export default function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const alert = useAlert();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      alert.warning("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      login(response.token, {
        username: response.username,
        role: response.role,
      });

      alert.success("Signed in successfully.");

      if (response.role === "Admin" || response.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      alert.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const username = await alert.prompt({
      title: "Reset Password",
      message: "Enter your username to reset your password.",
      placeholder: "Username",
      confirmText: "Continue",
    });
    if (!username) return;

    setResetLoading(true);
    try {
      const response = await apiFetch("/api/auth/request-reset", {
        method: "POST",
        body: JSON.stringify({ username: username.trim() }),
      });

      // Store reset context briefly for the reset form
      sessionStorage.setItem(
        "resetContext",
        JSON.stringify({ username: response.username, token: response.token }),
      );
      alert.info("Reset link ready. Please set a new password.");
      navigate("/reset-password");
    } catch (error) {
      alert.error(error.message || "Unable to start password reset");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="login-view">
      <div className="login-card admin-login-card">
        <div className="login-logo">
          <img
            src="/datamaker-cover.png"
            alt="datamaker logo"
            className="logo-img"
          />
        </div>
        <p className="login-sub">Sign In to your account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: "left" }}>
            <label className="form-label">Username</label>
            <input
              name="username"
              type="text"
              className="form-control"
              placeholder="Enter username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group" style={{ textAlign: "left" }}>
            <label className="form-label">Password</label>
            <input
              name="password"
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? (
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <span className="spinner spinner-sm" aria-hidden="true"></span>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>

          <div style={{ textAlign: "center", marginTop: "0.75rem" }}>
            <button
              type="button"
              className="link-button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
            >
              {resetLoading ? "Starting reset..." : "Forgot password?"}
            </button>
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: "1.5rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--secondary)",
                margin: 0,
              }}
            >
              First time?{" "}
              <Link
                to="/signup"
                style={{ color: "var(--primary)", fontWeight: 600 }}
              >
                Sign Up
              </Link>
              <span style={{ margin: "0 6px", color: "var(--text-light)" }}>
                |
              </span>
              <Link
                to="/admin-login"
                style={{ color: "var(--primary)", fontWeight: 600 }}
              >
                Admin Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
