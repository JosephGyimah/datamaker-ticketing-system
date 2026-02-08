import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL, apiFetch } from "../config/api";
import { useAuth } from "../context/AuthContext";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAlert } from "../context/AlertContext";

const initialFilters = {
  search: "",
  status: "all",
  priority: "all",
  sort: "newest",
  page: 1,
  limit: 10,
};

export default function AllTickets() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const alert = useAlert();
  const [filters, setFilters] = useState(initialFilters);
  const [tickets, setTickets] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [counts, setCounts] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const isAdmin = user?.role === "Admin" || user?.role === "admin";
  const hasActiveFilters =
    filters.search || filters.status !== "all" || filters.priority !== "all";

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.status !== "all") params.append("status", filters.status);
    if (filters.priority !== "all") params.append("priority", filters.priority);

    const sortMap = {
      newest: { sortBy: "createdAt", order: "desc" },
      oldest: { sortBy: "createdAt", order: "asc" },
    };
    const sort = sortMap[filters.sort] || sortMap.newest;
    params.append("sortBy", sort.sortBy);
    params.append("order", sort.order);

    params.append("page", filters.page);
    params.append("limit", filters.limit);

    return params.toString();
  }, [filters]);

  const exportQueryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.status !== "all") params.append("status", filters.status);
    if (filters.priority !== "all") params.append("priority", filters.priority);

    const sortMap = {
      newest: { sortBy: "createdAt", order: "desc" },
      oldest: { sortBy: "createdAt", order: "asc" },
    };
    const sort = sortMap[filters.sort] || sortMap.newest;
    params.append("sortBy", sort.sortBy);
    params.append("order", sort.order);

    return params.toString();
  }, [filters]);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`/api/tickets?${queryString}`);
      setTickets(response.tickets || []);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      alert.error(error.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [queryString, alert]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    const handler = () => {
      loadTickets();
      apiFetch("/api/tickets?limit=1000")
        .then((response) => {
          const data = response.tickets || [];
          setCounts({
            total: response.totalCount || data.length,
            open: data.filter((t) => t.status === "Open").length,
            inProgress: data.filter((t) => t.status === "In Progress").length,
            resolved: data.filter((t) => t.status === "Resolved").length,
          });
        })
        .catch(() => {});
    };
    window.addEventListener("tickets-updated", handler);
    return () => window.removeEventListener("tickets-updated", handler);
  }, [loadTickets]);

  const totalPages = Math.ceil(totalCount / filters.limit);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const response = await apiFetch("/api/tickets?limit=1000");
        const data = response.tickets || [];
        setCounts({
          total: response.totalCount || data.length,
          open: data.filter((t) => t.status === "Open").length,
          inProgress: data.filter((t) => t.status === "In Progress").length,
          resolved: data.filter((t) => t.status === "Resolved").length,
        });
      } catch (error) {
        console.error("Ticket counts error:", error);
      }
    };
    loadCounts();
  }, []);

  const handleStatusUpdate = async (ticketId, status) => {
    try {
      await apiFetch(`/api/tickets/${ticketId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      alert.success("Ticket status updated.");
      loadTickets();
    } catch (error) {
      alert.error(error.message || "Failed to update status");
    }
  };

  const handleExport = async () => {
    if (!isAdmin) return;
    setExporting(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${API_URL}/api/tickets/export?${exportQueryString}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      if (!response.ok) {
        throw new Error("Failed to export tickets");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "tickets.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert.success("CSV export started.");
    } catch (error) {
      alert.error(error.message || "Failed to export tickets");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div id="all-tickets" className="page-section">
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div className="stat-card" style={{ flex: 1, minWidth: 150 }}>
          <div
            className="stat-value"
            style={{
              color: "var(--primary)",
              fontSize: "2rem",
              fontWeight: 700,
            }}
          >
            {counts.total}
          </div>
          <div
            className="stat-label"
            style={{
              color: "var(--text-light)",
              fontSize: "0.9rem",
              marginTop: "0.25rem",
            }}
          >
            Total Tickets
          </div>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: 150 }}>
          <div
            className="stat-value"
            style={{ color: "#f59e0b", fontSize: "2rem", fontWeight: 700 }}
          >
            {counts.open}
          </div>
          <div
            className="stat-label"
            style={{
              color: "var(--text-light)",
              fontSize: "0.9rem",
              marginTop: "0.25rem",
            }}
          >
            Open
          </div>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: 150 }}>
          <div
            className="stat-value"
            style={{ color: "#3b82f6", fontSize: "2rem", fontWeight: 700 }}
          >
            {counts.inProgress}
          </div>
          <div
            className="stat-label"
            style={{
              color: "var(--text-light)",
              fontSize: "0.9rem",
              marginTop: "0.25rem",
            }}
          >
            In Progress
          </div>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: 150 }}>
          <div
            className="stat-value"
            style={{ color: "#10b981", fontSize: "2rem", fontWeight: 700 }}
          >
            {counts.resolved}
          </div>
          <div
            className="stat-label"
            style={{
              color: "var(--text-light)",
              fontSize: "0.9rem",
              marginTop: "0.25rem",
            }}
          >
            Resolved
          </div>
        </div>
        {isAdmin ? (
          <div style={{ marginLeft: "auto" }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        ) : null}
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            className="form-control"
            placeholder="Search by Title or Description..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                search: e.target.value,
                page: 1,
              }))
            }
          />
        </div>
        <select
          className="form-control"
          style={{ width: 150 }}
          value={filters.status}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))
          }
        >
          <option value="all">Status: All</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
        <select
          className="form-control"
          style={{ width: 150 }}
          value={filters.priority}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              priority: e.target.value,
              page: 1,
            }))
          }
        >
          <option value="all">Priority: All</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <select
          className="form-control"
          style={{ width: 150 }}
          value={filters.sort}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, sort: e.target.value }))
          }
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>User</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "var(--text-light)",
                  }}
                >
                  <LoadingSpinner message="Loading tickets..." size="sm" />
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "var(--text-light)",
                  }}
                >
                  <EmptyState
                    icon={hasActiveFilters ? "filter" : "inbox"}
                    title={
                      hasActiveFilters
                        ? "No tickets match your filters"
                        : "No tickets created yet"
                    }
                    description={
                      hasActiveFilters
                        ? "Try adjusting your search or filter selections."
                        : "Create a ticket to get started."
                    }
                  />
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket._id}>
                  <td style={{ fontFamily: "monospace" }}>
                    {ticket.ticketId || `#${ticket._id.slice(-6)}`}
                  </td>
                  <td style={{ fontWeight: 500 }}>{ticket.title}</td>
                  <td>{ticket.createdBy?.username || "Unknown"}</td>
                  <td>
                    <span
                      className={`badge badge-priority-${ticket.priority.toLowerCase()}`}
                    >
                      {ticket.priority}
                    </span>
                  </td>
                  <td>
                    {isAdmin ? (
                      <select
                        className="form-control status-dropdown"
                        style={{
                          padding: "4px 8px",
                          fontSize: "0.8rem",
                          width: "auto",
                          minWidth: 120,
                        }}
                        value={ticket.status}
                        onChange={(e) =>
                          handleStatusUpdate(ticket._id, e.target.value)
                        }
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    ) : (
                      <span
                        className={`badge ${ticket.status.toLowerCase().replace(" ", "-")}`}
                      >
                        {ticket.status}
                      </span>
                    )}
                  </td>
                  <td
                    style={{ fontSize: "0.9rem", color: "var(--text-light)" }}
                  >
                    {new Date(ticket.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <button
                      className="btn btn-outline"
                      style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                      onClick={() => navigate(`/tickets/${ticket._id}`)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ color: "var(--secondary)", fontSize: "0.9rem" }}>
          Showing {(filters.page - 1) * filters.limit + 1}-
          {Math.min(filters.page * filters.limit, totalCount)} of {totalCount}{" "}
          tickets
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-outline"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                page: Math.max(1, prev.page - 1),
              }))
            }
            disabled={filters.page <= 1}
          >
            Previous
          </button>
          <button
            className="btn btn-outline"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                page: Math.min(totalPages, prev.page + 1),
              }))
            }
            disabled={filters.page >= totalPages || totalPages === 0}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
