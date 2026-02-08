import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin" || user?.role === "admin";

  const initials = user?.username
    ? user.username
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "GU";

  return (
    <aside className="sidebar" id="sidebar">
      <div className="brand">
        <img
          src="/datamaker-cover.png"
          alt="datamaker"
          className="brand-logo-img"
        />
      </div>
      <ul className="nav-menu">
        <li className="nav-item">
          <NavLink className="nav-link" to="/dashboard">
            <i className="fa-solid fa-grid-2"></i> Dashboard
          </NavLink>
        </li>
        {!isAdmin && (
          <li className="nav-item">
            <NavLink className="nav-link" to="/tickets/new">
              <i className="fa-solid fa-plus-circle"></i> Create Ticket
            </NavLink>
          </li>
        )}
        <li className="nav-item">
          <NavLink className="nav-link" to="/tickets">
            <i className="fa-solid fa-list-ul"></i> All Tickets
          </NavLink>
        </li>
        {isAdmin && (
          <li className="nav-item">
            <NavLink className="nav-link" to="/admin">
              <i className="fa-solid fa-gear"></i> Admin Panel
            </NavLink>
          </li>
        )}
      </ul>
      <div className="user-mini">
        <div className="avatar">{isAdmin ? "AD" : initials}</div>
        <div className="user-info">
          <h4>{isAdmin ? "Admin" : user?.username || "Guest User"}</h4>
          <span>
            {isAdmin ? "Administrator" : user?.role || "Not Logged In"}
          </span>
        </div>
      </div>
    </aside>
  );
}
