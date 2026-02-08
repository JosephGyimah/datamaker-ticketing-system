/**
 * Ticket model
 * Defines the Ticket schema and structure using Mongoose
 */

const mongoose = require("mongoose");
const Counter = require("./Counter.model");

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: Number,
      unique: true,
      index: true,
      sparse: true,
    },
    ticketId: {
      type: String,
      unique: true,
      index: true,
      sparse: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved"],
      default: "Open",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resolutionComment: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  },
);

// Ensure sequential, human-readable ticket IDs
ticketSchema.pre("save", async function () {
  if (!this.isNew || this.ticketNumber) {
    return;
  }

  const counter = await Counter.findOneAndUpdate(
    { name: "ticket" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  this.ticketNumber = counter.seq;
  this.ticketId = `#${counter.seq}`;
});

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;
