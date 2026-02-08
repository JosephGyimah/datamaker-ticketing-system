/**
 * Ticket routes
 * Handles ticket creation, retrieval, and management endpoints
 */

const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticket.controller");
const authMiddleware = require("../middleware/auth.middleware");

// All ticket routes require authentication
router.use(authMiddleware);

// POST /tickets - Create a new ticket
router.post("/", ticketController.createTicket);

// GET /tickets - Get all tickets (filtered by role)
router.get("/", ticketController.getAllTickets);

// GET /tickets/export - Export tickets to CSV
router.get("/export", ticketController.exportTicketsCsv);

// GET /tickets/:id - Get ticket by ID
router.get("/:id", ticketController.getTicketById);

// PATCH /tickets/:id/status - Update ticket status (Admin only)
router.patch("/:id/status", ticketController.updateTicketStatus);

// PUT /tickets/:id - Update ticket
router.put("/:id", ticketController.updateTicket);

// DELETE /tickets/:id - Delete ticket
router.delete("/:id", ticketController.deleteTicket);

module.exports = router;
