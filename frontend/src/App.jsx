import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { io } from "socket.io-client";
import "./App.css";
import "./index.css";
import { API_URL, apiFetch } from "./config/api";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AlertProvider } from "./context/AlertContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import NotificationPanel from "./components/NotificationPanel";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import AdminLogin from "./pages/AdminLogin";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import CreateTicket from "./pages/CreateTicket";
import AllTickets from "./pages/AllTickets";
import TicketView from "./pages/TicketView";
import AdminPanel from "./pages/AdminPanel";

function Layout({ children, title }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const togglePanel = () => {
    setPanelOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!panelOpen) return;
    const handler = (event) => {
      const panel = document.getElementById("notification-panel");
      const button = document.getElementById("notifications-btn");
      if (!panel || !button) return;
      if (!panel.contains(event.target) && !button.contains(event.target)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [panelOpen]);

  useEffect(() => {
    if (!panelOpen || !user) return;
    apiFetch("/api/notifications/read-all", { method: "PATCH" })
      .then(() =>
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
      )
      .catch(() => {});
  }, [panelOpen, user]);

  useEffect(() => {
    if (!user) return;
    const loadNotifications = async () => {
      try {
        const response = await apiFetch("/api/notifications");
        setNotifications(response || []);
      } catch (error) {
        console.error("Notifications error:", error);
      }
    };
    loadNotifications();
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;
    const socket = io(API_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on("ticketCreated", () => {
      apiFetch("/api/notifications")
        .then(setNotifications)
        .catch(() => {});
      window.dispatchEvent(new Event("tickets-updated"));
    });

    socket.on("ticketUpdated", () => {
      apiFetch("/api/notifications")
        .then(setNotifications)
        .catch(() => {});
      window.dispatchEvent(new Event("tickets-updated"));
    });

    return () => socket.disconnect();
  }, [user]);

  if (!user) return children;

  return (
    <div id="app-view">
      <Sidebar />
      <main className="main-content">
        <Topbar
          title={title}
          onToggleNotifications={togglePanel}
          unreadCount={unreadCount}
        />
        <NotificationPanel notifications={notifications} open={panelOpen} />
        <div className="content-scroll">{children}</div>
      </main>
    </div>
  );
}

function AppRoutes() {
  const titleMap = {
    "/dashboard": "Dashboard",
    "/tickets/new": "Create Ticket",
    "/tickets": "All Tickets",
    "/admin": "Admin Panel",
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signup" replace />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout title={titleMap["/dashboard"]}>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets/new"
        element={
          <ProtectedRoute>
            <Layout title={titleMap["/tickets/new"]}>
              <CreateTicket />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <Layout title={titleMap["/tickets"]}>
              <AllTickets />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets/:id"
        element={
          <ProtectedRoute>
            <Layout title="Ticket View">
              <TicketView />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <Layout title={titleMap["/admin"]}>
              <AdminPanel />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/signup" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AlertProvider>
    </AuthProvider>
  );
}
