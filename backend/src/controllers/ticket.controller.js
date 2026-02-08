/**
 * Ticket controller
 * Contains logic for ticket operations (CRUD operations)
 */

const Ticket = require("../models/Ticket.model");
const {
  notifyAdminsNewTicket,
  notifyStatusChange,
} = require("../utils/notification");
const { sendTicketsAsCSV } = require("../utils/csvExport");

const saveTicketWithRetry = async (ticket, attempts = 2) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      // Retry sequential ID generation if a duplicate key occurs.
      if (attempt > 0) {
        ticket.ticketNumber = undefined;
        ticket.ticketId = undefined;
      }
      await ticket.save();
      return;
    } catch (error) {
      if (error?.code === 11000 && attempt < attempts - 1) {
        continue;
      }
      throw error;
    }
  }
};

/**
 * POST /tickets
 * Create a new ticket
 */
const createTicket = async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    // Validate input
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    // Create new ticket
    const ticket = new Ticket({
      title,
      description,
      priority: priority || "Medium",
      createdBy: req.user.id,
    });

    await saveTicketWithRetry(ticket);

    // Populate ticket creator details
    await ticket.populate("createdBy", "username");

    // Create notifications for admins
    try {
      await notifyAdminsNewTicket(ticket, req.user.username);
    } catch (notifError) {
      console.error("Error creating notifications:", notifError);
    }

    // Emit Socket.io event for new ticket (after database save)
    const io = req.app.get("socketio");
    if (io) {
      io.emit("ticketCreated", {
        _id: ticket._id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        createdBy: ticket.createdBy,
        createdAt: ticket.createdAt,
      });
      console.log(
        "✅ Socket.io: ticketCreated event emitted for ticket",
        ticket._id,
      );
    }

    res.status(201).json(ticket);
  } catch (error) {
    console.error("Create ticket error:", error);
    res.status(500).json({
      message: "Server error creating ticket",
      detail: error?.message || "Unknown error",
    });
  }
};

/**
 * GET /tickets
 * Get all tickets with filtering, searching, sorting, and pagination
 */
const getAllTickets = async (req, res) => {
  try {
    const {
      status,
      priority,
      search,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    // Build base query based on user role
    let query = {};
    if (req.user.role === "Admin") {
      // Admin can see all tickets
      query = {};
    } else {
      // User can only see their own tickets
      query.createdBy = req.user.id;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Determine sort order
    const sortOrder = order === "asc" ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    // Execute query with pagination
    const tickets = await Ticket.find(query)
      .select(
        "ticketId ticketNumber title description status priority createdAt createdBy",
      )
      .populate("createdBy", "username")
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalCount = await Ticket.countDocuments(query);

    res.status(200).json({
      tickets,
      totalCount,
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (error) {
    console.error("Get all tickets error:", error);
    res.status(500).json({ message: "Server error retrieving tickets" });
  }
};

/**
 * GET /tickets/export
 * Export tickets to CSV
 */
const exportTicketsCsv = async (req, res) => {
  try {
    const {
      status,
      priority,
      search,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    if (req.user.role !== "Admin") {
      return res
        .status(403)
        .json({ message: "Only admins can export tickets" });
    }

    let query = {};

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const sortOrder = order === "asc" ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const tickets = await Ticket.find(query)
      .select(
        "ticketId ticketNumber title description status priority createdAt createdBy",
      )
      .populate("createdBy", "username")
      .sort(sortOptions);

    sendTicketsAsCSV(res, tickets, "tickets.csv");
  } catch (error) {
    console.error("Export tickets error:", error);
    res.status(500).json({ message: "Server error exporting tickets" });
  }
};

/**
 * GET /tickets/:id
 * Get ticket details by ID
 */
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id).populate("createdBy", "username");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Check if user has permission to view this ticket
    if (
      req.user.role !== "Admin" &&
      ticket.createdBy._id.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "You do not have permission to view this ticket" });
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error("Get ticket by ID error:", error);
    res.status(500).json({ message: "Server error retrieving ticket" });
  }
};

/**
 * PATCH /tickets/:id/status
 * Update ticket status (Admin only)
 */
const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    // Only admin can update status
    if (req.user.role !== "Admin") {
      return res
        .status(403)
        .json({ message: "Only admins can update ticket status" });
    }

    // Validate status
    const validStatuses = ["Open", "In Progress", "Resolved"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be Open, In Progress, or Resolved",
      });
    }

    const update = { status };
    if (status === "Resolved") {
      update.resolutionComment =
        typeof comment === "string" ? comment.trim() : "";
    } else {
      update.resolutionComment = "";
    }

    const ticket = await Ticket.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "username");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Create notification for ticket owner about status change
    try {
      const oldStatus = status === "Open" ? "In Progress" : "Open"; // Simplified for now
      await notifyStatusChange(ticket.createdBy._id, ticket, oldStatus, status);
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
    }

    // Emit Socket.io event for status update (after database update)
    const io = req.app.get("socketio");
    if (io) {
      io.emit("ticketUpdated", {
        _id: ticket._id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        createdBy: ticket.createdBy,
        updatedAt: new Date(),
      });
      console.log(
        "✅ Socket.io: ticketUpdated event emitted for ticket",
        ticket._id,
      );
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error("Update ticket status error:", error);
    res.status(500).json({ message: "Server error updating ticket status" });
  }
};

const updateTicket = (req, res) => {
  // TODO: Implement ticket update logic
  res
    .status(200)
    .json({ message: "Update ticket endpoint - to be implemented" });
};

const deleteTicket = (req, res) => {
  // TODO: Implement ticket deletion logic
  res.status(204).send();
};

module.exports = {
  createTicket,
  getAllTickets,
  exportTicketsCsv,
  getTicketById,
  updateTicketStatus,
  updateTicket,
  deleteTicket,
};
