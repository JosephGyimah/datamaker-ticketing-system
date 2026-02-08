/**
 * Admin controller
 * Contains logic for administrative operations and reporting
 */

const User = require("../models/User.model");

const getDashboard = (req, res) => {
  // TODO: Implement dashboard logic
  res.status(200).json({ message: "Dashboard endpoint - to be implemented" });
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("username role createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ users });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error fetching users" });
  }
};

const exportData = (req, res) => {
  // TODO: Implement data export logic
  res.status(200).json({ message: "Export data endpoint - to be implemented" });
};

module.exports = {
  getDashboard,
  getAllUsers,
  exportData,
};
