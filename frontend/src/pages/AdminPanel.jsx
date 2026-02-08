import { useEffect, useState } from "react";
import { apiFetch } from "../config/api";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AdminPanel() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTickets: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [userError, setUserError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      setLoadingStats(true);
      try {
        const response = await apiFetch("/api/tickets?limit=1000");
        const tickets = response.tickets || [];
        setStats((prev) => ({
          ...prev,
          totalTickets: response.totalCount || tickets.length,
          open: tickets.filter((t) => t.status === "Open").length,
          inProgress: tickets.filter((t) => t.status === "In Progress").length,
          resolved: tickets.filter((t) => t.status === "Resolved").length,
        }));
      } catch (error) {
        console.error("Admin stats error:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    const loadUsers = async () => {
      setLoadingUsers(true);
      setUserError("");
      try {
        const response = await apiFetch("/api/admin/users");
        const list = response.users || [];
        setUsers(list);
        setStats((prev) => ({
          ...prev,
          totalUsers: list.length,
          activeUsers: list.length,
        }));
      } catch (error) {
        console.error("Admin users error:", error);
        setUserError(error.message || "Failed to load users");
      } finally {
        setLoadingUsers(false);
      }
    };

    loadStats();
    loadUsers();
  }, []);

  return (
    <div id="admin" className="page-section">
      <h2 style={{ marginBottom: "1rem" }}>System Administration</h2>

      <div className="admin-grid">
        <div className="card full-width">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h3>User Management</h3>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr>
                    <td
                      colSpan="3"
                      style={{
                        textAlign: "center",
                        padding: "1.5rem",
                        color: "var(--text-light)",
                      }}
                    >
                      <LoadingSpinner message="Loading users..." size="sm" />
                    </td>
                  </tr>
                ) : userError ? (
                  <tr>
                    <td
                      colSpan="3"
                      style={{
                        textAlign: "center",
                        padding: "1.5rem",
                        color: "var(--danger)",
                      }}
                    >
                      {userError}
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      style={{
                        textAlign: "center",
                        padding: "1.5rem",
                        color: "var(--text-light)",
                      }}
                    >
                      <EmptyState
                        icon="users"
                        title="No users found"
                        description="User accounts will appear here once created."
                      />
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id || user.username}>
                      <td>{user.username}</td>
                      <td>{user.role}</td>
                      <td style={{ color: "var(--success)", fontWeight: 600 }}>
                        Active
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>System Statistics</h3>
          {loadingStats ? (
            <LoadingSpinner message="Loading stats..." size="sm" />
          ) : (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  className="form-label"
                  style={{ color: "var(--secondary)" }}
                >
                  Total Users
                </label>
                <p style={{ margin: 0, fontSize: "1.8rem", fontWeight: 600 }}>
                  {stats.totalUsers}
                </p>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  className="form-label"
                  style={{ color: "var(--secondary)" }}
                >
                  Active Users
                </label>
                <p
                  style={{
                    margin: 0,
                    fontSize: "1.8rem",
                    fontWeight: 600,
                    color: "var(--success)",
                  }}
                >
                  {stats.activeUsers}
                </p>
              </div>
              <div>
                <label
                  className="form-label"
                  style={{ color: "var(--secondary)" }}
                >
                  Total Tickets
                </label>
                <p style={{ margin: 0, fontSize: "1.8rem", fontWeight: 600 }}>
                  {stats.totalTickets}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="card">
          <h3>Ticket Distribution</h3>
          {loadingStats ? (
            <LoadingSpinner message="Loading distribution..." size="sm" />
          ) : (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  className="form-label"
                  style={{ color: "var(--secondary)" }}
                >
                  Open Tickets
                </label>
                <p
                  style={{
                    margin: 0,
                    fontSize: "1.5rem",
                    fontWeight: 600,
                    color: "var(--primary)",
                  }}
                >
                  {stats.open}
                </p>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  className="form-label"
                  style={{ color: "var(--secondary)" }}
                >
                  In Progress
                </label>
                <p
                  style={{
                    margin: 0,
                    fontSize: "1.5rem",
                    fontWeight: 600,
                    color: "var(--warning)",
                  }}
                >
                  {stats.inProgress}
                </p>
              </div>
              <div>
                <label
                  className="form-label"
                  style={{ color: "var(--secondary)" }}
                >
                  Resolved
                </label>
                <p
                  style={{
                    margin: 0,
                    fontSize: "1.5rem",
                    fontWeight: 600,
                    color: "var(--success)",
                  }}
                >
                  {stats.resolved}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
