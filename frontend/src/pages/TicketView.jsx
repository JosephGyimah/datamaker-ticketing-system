import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../config/api";
import { useAuth } from "../context/AuthContext";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAlert } from "../context/AlertContext";

export default function TicketView() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const alert = useAlert();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusDraft, setStatusDraft] = useState("Open");
  const [commentDraft, setCommentDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === "Admin" || user?.role === "admin";

  const loadTicket = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/tickets/${id}`);
      setTicket(data);
      setStatusDraft(data.status);
      setCommentDraft(data.resolutionComment || "");
    } catch (error) {
      alert.error(error.message || "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  }, [id, alert]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  const handleStatusChange = async () => {
    setSaving(true);
    try {
      await apiFetch(`/api/tickets/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: statusDraft,
          comment: statusDraft === "Resolved" ? commentDraft : "",
        }),
      });
      alert.success("Ticket status updated.");
      loadTicket();
    } catch (error) {
      alert.error(error.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-section">
        <LoadingSpinner message="Loading ticket..." />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="page-section">
        <EmptyState
          icon="circle-exclamation"
          title="Ticket not found"
          description="This ticket may have been removed or you might not have access."
        />
      </div>
    );
  }

  return (
    <div id="single-ticket" className="page-section">
      <button
        className="btn btn-outline"
        onClick={() => navigate("/tickets")}
        style={{ marginBottom: "1rem", padding: "0.4rem 0.8rem" }}
      >
        <i className="fa-solid fa-arrow-left"></i> Back
      </button>

      <div id="ticket-details-view">
        <div className="ticket-header">
          <div>
            <h1>{ticket.title}</h1>
            <div className="ticket-meta">
              <span style={{ marginRight: "2rem" }}>
                <strong>Ticket ID:</strong>{" "}
                {ticket.ticketId || `#${ticket._id.slice(-6)}`}
              </span>
              <span>
                <strong>Created:</strong>{" "}
                {new Date(ticket.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="ticket-layout">
          <div className="card">
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
              Ticket Details
            </h3>
            <div style={{ marginBottom: "1rem" }}>
              <label
                className="form-label"
                style={{ color: "var(--secondary)" }}
              >
                Created By
              </label>
              <p style={{ margin: 0, fontWeight: 500 }}>
                {ticket.createdBy?.username || "Unknown User"}
              </p>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label
                className="form-label"
                style={{ color: "var(--secondary)" }}
              >
                Priority
              </label>
              <p style={{ margin: 0 }}>
                <span
                  className={`badge badge-priority-${ticket.priority.toLowerCase()}`}
                >
                  {ticket.priority}
                </span>
              </p>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label
                className="form-label"
                style={{ color: "var(--secondary)" }}
              >
                Status
              </label>
              <div style={{ marginTop: "0.5rem" }}>
                {isAdmin ? (
                  <div>
                    <select
                      className="form-control"
                      style={{ width: 200, padding: "0.5rem" }}
                      value={statusDraft}
                      onChange={(e) => setStatusDraft(e.target.value)}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                    <div style={{ marginTop: "0.75rem" }}>
                      <label
                        className="form-label"
                        style={{ color: "var(--secondary)" }}
                      >
                        Comment
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Add a resolution comment"
                        value={commentDraft}
                        onChange={(e) => setCommentDraft(e.target.value)}
                        disabled={statusDraft !== "Resolved"}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ marginTop: "0.75rem" }}
                      onClick={handleStatusChange}
                      disabled={saving}
                    >
                      {saving ? "Updating..." : "Update Status"}
                    </button>
                  </div>
                ) : (
                  <span
                    className={`badge ${ticket.status.toLowerCase().replace(" ", "-")}`}
                  >
                    {ticket.status}
                  </span>
                )}
              </div>
            </div>
            <hr
              style={{
                border: 0,
                borderTop: "1px solid var(--border)",
                margin: "1rem 0",
              }}
            />
            <label className="form-label" style={{ color: "var(--secondary)" }}>
              Description
            </label>
            <p>{ticket.description}</p>
            {ticket.resolutionComment ? (
              <div style={{ marginTop: "1rem" }}>
                <label
                  className="form-label"
                  style={{ color: "var(--secondary)" }}
                >
                  Resolution Comment
                </label>
                <p>{ticket.resolutionComment}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
