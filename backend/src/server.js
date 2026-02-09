const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const connectDB = require("./config/db");
const Ticket = require("./models/Ticket.model");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

// Make io accessible to routes
app.set("socketio", io);

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("✅ Socket.io: Client connected [", socket.id, "]");
  console.log("   Total clients connected:", io.engine.clientsCount);

  socket.on("disconnect", (reason) => {
    console.log(
      "❌ Socket.io: Client disconnected [",
      socket.id,
      "] - Reason:",
      reason,
    );
    console.log("   Total clients connected:", io.engine.clientsCount);
  });
});

const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);
const adminRoutes = require("./routes/admin.routes");
app.use("/api/admin", adminRoutes);
const ticketRoutes = require("./routes/ticket.routes");
app.use("/api/tickets", ticketRoutes);
const notificationRoutes = require("./routes/notification.routes");
app.use("/api/notifications", notificationRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Datamaker Ticketing API running" });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  // Ensure updated index options (e.g., sparse ticket IDs) are applied.
  await Ticket.syncIndexes();

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`🔌 Socket.io ready for real-time connections`);
    console.log(`📡 CORS enabled for all origins`);
    console.log(`\n✅ Backend is ready!\n`);
  });
};

startServer();

// Export socket instance for use in other modules if needed
module.exports = { io, app, server };
