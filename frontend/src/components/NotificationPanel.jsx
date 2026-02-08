export default function NotificationPanel({ notifications = [], open }) {
  if (!open) return null;

  return (
    <div id="notification-panel" className="notification-panel">
      <div className="notification-panel-header">Notifications</div>
      <div id="notification-list" className="notification-list">
        {notifications.length === 0 ? (
          <div className="notification-empty">No notifications yet</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id || n.id}
              className={`notification-item ${n.read ? "read" : ""}`}
            >
              <div className="notification-title">
                {n.message || n.title || "Notification"}
              </div>
              <div className="notification-time">
                {new Date(
                  n.createdAt || n.timestamp || new Date(),
                ).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
