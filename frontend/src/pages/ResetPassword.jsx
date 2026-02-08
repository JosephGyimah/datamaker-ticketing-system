import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../config/api";
import { useAlert } from "../context/AlertContext";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const alert = useAlert();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [context, setContext] = useState({ username: "", token: "" });

  useEffect(() => {
    // Prefer stored reset context for a seamless flow
    const stored = sessionStorage.getItem("resetContext");
    if (stored) {
      try {
        setContext(JSON.parse(stored));
        return;
      } catch {
        sessionStorage.removeItem("resetContext");
      }
    }

    if (location.state?.username && location.state?.token) {
      setContext({
        username: location.state.username,
        token: location.state.token,
      });
    }
  }, [location.state]);

  const validationMessage = useMemo(() => {
    if (!form.password || !form.confirm) return "";
    if (form.password.length < 6) {
      return "Password must be at least 6 characters.";
    }
    if (form.password !== form.confirm) {
      return "Passwords do not match.";
    }
    return "";
  }, [form]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!context.username || !context.token) {
      alert.warning("Reset session expired. Please start again.");
      return;
    }

    if (validationMessage) {
      alert.warning(validationMessage);
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          username: context.username,
          token: context.token,
          password: form.password,
        }),
      });
      sessionStorage.removeItem("resetContext");
      alert.success("Password reset successful. Please sign in.");
      navigate("/signin");
    } catch (error) {
      alert.error(error.message || "Unable to reset password");
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
        <p className="login-sub">Reset your password</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: "left" }}>
            <label className="form-label">New Password</label>
            <input
              name="password"
              type="password"
              className="form-control"
              placeholder="Enter a new password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group" style={{ textAlign: "left" }}>
            <label className="form-label">Confirm Password</label>
            <input
              name="confirm"
              type="password"
              className="form-control"
              placeholder="Confirm your password"
              value={form.confirm}
              onChange={handleChange}
              required
            />
          </div>
          {validationMessage ? (
            <div
              style={{
                color: "var(--danger)",
                fontSize: "0.85rem",
                marginBottom: "0.75rem",
              }}
            >
              {validationMessage}
            </div>
          ) : null}
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
                Resetting...
              </span>
            ) : (
              "Reset Password"
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
