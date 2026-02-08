/**
 * CSV export utility
 * Handles conversion of tickets to CSV format and file generation
 */

const fs = require("fs");
const path = require("path");

/**
 * Convert tickets array to CSV string
 * @param {Array} tickets - Array of ticket objects
 * @returns {String} CSV formatted string
 */
const ticketsToCSV = (tickets) => {
  try {
    // Define CSV headers
    const headers = [
      "TicketId",
      "Title",
      "Description",
      "Status",
      "Priority",
      "CreatedAt",
      "CreatedBy",
    ];

    // Create CSV header row
    const csvRows = [headers.join(",")];

    // Convert each ticket to CSV row
    tickets.forEach((ticket) => {
      const row = [
        escapeCsvValue(ticket.ticketId || ticket._id),
        escapeCsvValue(ticket.title),
        escapeCsvValue(ticket.description),
        escapeCsvValue(ticket.status),
        escapeCsvValue(ticket.priority),
        ticket.createdAt ? new Date(ticket.createdAt).toISOString() : "",
        ticket.createdBy?.username || ticket.createdBy || "",
      ];
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  } catch (error) {
    console.error("Error converting tickets to CSV:", error);
    throw error;
  }
};

/**
 * Escape CSV values (handle commas, quotes, newlines)
 * @param {String} value - Value to escape
 * @returns {String} Escaped value
 */
const escapeCsvValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

/**
 * Export tickets to CSV file on server
 * @param {Array} tickets - Array of ticket objects
 * @param {String} filename - Filename for the CSV (optional)
 * @returns {String} File path
 */
const exportTicketsToFile = (tickets, filename = "tickets.csv") => {
  try {
    const csvContent = ticketsToCSV(tickets);
    const exportDir = path.join(__dirname, "../../exports");

    // Create exports directory if it doesn't exist
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const timestamp = Date.now();
    const filePath = path.join(exportDir, `${timestamp}_${filename}`);

    // Write CSV to file
    fs.writeFileSync(filePath, csvContent, "utf8");

    return filePath;
  } catch (error) {
    console.error("Error exporting tickets to file:", error);
    throw error;
  }
};

/**
 * Send CSV as downloadable response
 * Only admins can call this function (should be checked in route)
 * @param {Object} res - Express response object
 * @param {Array} tickets - Array of ticket objects
 * @param {String} filename - Filename for download (optional)
 */
const sendTicketsAsCSV = (res, tickets, filename = "tickets.csv") => {
  try {
    const csvContent = ticketsToCSV(tickets);

    // Set headers for CSV download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Send CSV content
    res.status(200).send(csvContent);
  } catch (error) {
    console.error("Error sending CSV:", error);
    res.status(500).json({ message: "Error generating CSV export" });
  }
};

module.exports = {
  ticketsToCSV,
  exportTicketsToFile,
  sendTicketsAsCSV,
  escapeCsvValue,
};
