import { useEffect, useState } from "react";
import { apiFetch } from "../config/api";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Dashboard() {
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const response = await apiFetch("/api/tickets?limit=100");
        const tickets = response.tickets || [];
        setStats({
          open: tickets.filter((t) => t.status === "Open").length,
          inProgress: tickets.filter((t) => t.status === "In Progress").length,
          resolved: tickets.filter((t) => t.status === "Resolved").length,
        });
        const sorted = [...tickets].sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt) -
            new Date(a.updatedAt || a.createdAt),
        );
        setRecent(sorted.slice(0, 3));
      } catch (error) {
        console.error("Dashboard stats error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();

    const handler = () => loadStats();
    window.addEventListener("tickets-updated", handler);
    return () => window.removeEventListener("tickets-updated", handler);
  }, []);

  return (
    <div id="dashboard" className="page-section active">
      {loading ? (
        <LoadingSpinner message="Loading dashboard..." />
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-info">
                <h3>{stats.open}</h3>
                <p>Open Tickets</p>
              </div>
              <div className="stat-icon bg-blue-light">
                <i className="fa-solid fa-folder-open"></i>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <h3>{stats.inProgress}</h3>
                <p>In Progress</p>
              </div>
              <div className="stat-icon bg-orange-light">
                <i className="fa-solid fa-clock"></i>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <h3>{stats.resolved}</h3>
                <p>Resolved</p>
              </div>
              <div className="stat-icon bg-green-light">
                <i className="fa-solid fa-check-circle"></i>
              </div>
            </div>
          </div>

          <h2>Recent Activity</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Subject</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "var(--text-light)",
                      }}
                    >
                      <EmptyState
                        icon="inbox"
                        title="No tickets created yet"
                        description="New tickets will appear here once created."
                      />
                    </td>
                  </tr>
                ) : (
                  recent.map((ticket) => (
                    <tr key={ticket._id}>
                      <td
                        style={{
                          fontFamily: "monospace",
                          color: "var(--primary)",
                        }}
                      >
                        {ticket.ticketId || `#${ticket._id.slice(-6)}`}
                      </td>
                      <td>{ticket.title}</td>
                      <td>{ticket.createdBy?.username || "Unknown"}</td>
                      <td>
                        <span
                          className={`badge ${ticket.status?.toLowerCase().replace(" ", "-")}`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td>
                        {new Date(
                          ticket.updatedAt || ticket.createdAt,
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
