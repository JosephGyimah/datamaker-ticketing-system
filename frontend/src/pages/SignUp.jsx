import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../config/api";
import { useAlert } from "../context/AlertContext";

export default function SignUp() {
  const navigate = useNavigate();
  const alert = useAlert();
  const [form, setForm] = useState({ username: "", role: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.role || !form.password) {
      alert.warning("Please complete all required fields.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(form),
      });
      alert.success("Account created. Please sign in.");
      navigate("/signin");
    } catch (error) {
      alert.error(error.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-view">
      <div className="login-card">
        <div className="login-logo">
          <img
            src="/datamaker-cover.png"
            alt="datamaker logo"
            className="logo-img"
          />
        </div>
        <p className="login-sub">Create your account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: "left" }}>
            <label className="form-label">Username</label>
            <input
              name="username"
              type="text"
              className="form-control"
              placeholder="Enter your name"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group" style={{ textAlign: "left" }}>
            <label className="form-label">Role</label>
            <select
              name="role"
              className="form-control"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="">Select a role</option>
              <option value="MD">Managing Director (MD)</option>
              <option value="HPM">Head Project Manager (HPM)</option>
              <option value="IT/FM">IT/Facility Manager (IT/FM)</option>
              <option value="AssIT/FM">
                Assistant IT/Facility Manager (IT/FM)
              </option>
              <option value="SnrPM">Senior Project Manager (SnrPM)</option>
              <option value="PM">Project Manager (PM)</option>
              <option value="QM">Quality Manager (QM)</option>
              <option value="Lbl">Data Labeler (Lbl)</option>
            </select>
          </div>
          <div className="form-group" style={{ textAlign: "left" }}>
            <label className="form-label">Password</label>
            <input
              name="password"
              type="password"
              className="form-control"
              placeholder="Enter your password"
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
                Creating account...
              </span>
            ) : (
              "Sign Up"
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
                Sign In
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
