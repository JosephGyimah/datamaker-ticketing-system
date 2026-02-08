import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ title, onToggleNotifications, unreadCount }) {
  const { logout } = useAuth();

  const handleToggle = () => {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.toggle("active");
  };

  return (
    <header className="topbar">
      <button
        className="icon-btn"
        onClick={handleToggle}
        style={{ marginRight: 15, display: "none" }}
        id="mobile-toggle"
        type="button"
      >
        <i className="fa-solid fa-bars"></i>
      </button>
      <div className="page-title">{title}</div>
      <div className="top-actions">
        <button
          className="icon-btn"
          id="notifications-btn"
          type="button"
          onClick={onToggleNotifications}
        >
          <i className="fa-regular fa-bell"></i>
          <span
            className="badge-dot"
            id="notification-badge"
            style={{ display: unreadCount > 0 ? "inline-block" : "none" }}
          ></span>
          <span
            className="badge-count"
            id="notification-count"
            style={{ display: unreadCount > 0 ? "inline-block" : "none" }}
          >
            {unreadCount}
          </span>
        </button>
        <button
          className="btn btn-outline"
          style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
