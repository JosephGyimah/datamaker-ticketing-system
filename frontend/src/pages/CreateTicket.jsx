import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";

export default function CreateTicket() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const alert = useAlert();
  const [form, setForm] = useState({
    title: "",
    category: "",
    priority: "",
    lab: "",
    tableId: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.priority || !form.description) {
      alert.warning("Please fill in all required fields.");
      return;
    }

    const detailBlock = [
      form.category ? `Category: ${form.category}` : null,
      form.lab ? `Lab: ${form.lab}` : null,
      form.tableId ? `Table ID: ${form.tableId}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const payload = {
      title: form.title,
      priority: form.priority,
      description: detailBlock
        ? `${form.description}\n\n${detailBlock}`
        : form.description,
    };

    setLoading(true);
    try {
      await apiFetch("/api/tickets", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      alert.success("Ticket submitted successfully.");
      navigate("/tickets");
    } catch (error) {
      alert.error(error.message || "Failed to submit ticket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "Admin" || user?.role === "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div id="create-ticket" className="page-section">
      <div className="card" style={{ maxWidth: 800, margin: "0 auto" }}>
        <h2
          style={{
            marginBottom: "1.5rem",
            borderBottom: "1px solid var(--border)",
            paddingBottom: "1rem",
          }}
        >
          Submit a New Ticket
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Issue Title</label>
            <input
              type="text"
              className="form-control"
              name="title"
              placeholder="Brief summary of the issue"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-control"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software / OS</option>
                <option value="Network">Network / Internet</option>
                <option value="Access">Access / Permissions</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <select
                className="form-control"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                required
              >
                <option value="">Select priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">LAB</label>
              <select
                className="form-control"
                name="lab"
                value={form.lab}
                onChange={handleChange}
              >
                <option value="">Please select a Lab</option>
                <option value="LAB A">LAB A</option>
                <option value="LAB B">LAB B</option>
                <option value="Training Center">Training Center</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Table ID</label>
              <input
                type="text"
                className="form-control"
                name="tableId"
                placeholder="Enter your Table ID"
                value={form.tableId}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              name="description"
              placeholder="Please provide a description of the issue..."
              value={form.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div style={{ textAlign: "right", marginTop: "2rem" }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ marginRight: 10 }}
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    className="spinner spinner-sm"
                    aria-hidden="true"
                  ></span>
                  Submitting...
                </span>
              ) : (
                "Submit Ticket"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
