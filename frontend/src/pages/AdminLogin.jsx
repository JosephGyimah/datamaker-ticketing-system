import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const alert = useAlert();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      alert.warning("Please enter your admin credentials.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      if (response.role !== "Admin" && response.role !== "admin") {
        alert.error("Access denied. Admin credentials required.");
        return;
      }

      login(response.token, {
        username: response.username,
        role: response.role,
      });
      alert.success("Welcome back, admin.");
      navigate("/admin");
    } catch (error) {
      alert.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
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
        <p className="login-sub">Admin Sign In</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: "left" }}>
            <label className="form-label">Username</label>
            <input
              name="username"
              type="text"
              className="form-control"
              placeholder="Enter admin username"
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
              placeholder="Enter admin password"
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
              "Admin Sign In"
            )}
          </button>

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
              <Link
                to="/signin"
                style={{ color: "var(--primary)", fontWeight: 600 }}
              >
                Back to Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
