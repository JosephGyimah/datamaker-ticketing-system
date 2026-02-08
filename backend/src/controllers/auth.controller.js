/**
 * Authentication controller
 * Contains logic for user registration, login, and authentication
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User.model");

const normalizeRole = (role) => {
  if (!role) return "User";

  const trimmed = String(role).trim();
  if (!trimmed) return "User";

  const normalized = trimmed.toLowerCase();
  const roleMap = {
    user: "User",
    admin: "Admin",
    md: "MD",
    "managing director (md)": "MD",
    hpm: "HPM",
    "head project manager (hpm)": "HPM",
    "it/fm": "IT/FM",
    "it/facility manager (it/fm)": "IT/FM",
    "assistant it/fm manager": "AssIT/FM",
    "assistant it/fm": "AssIT/FM",
    "assistant it/facility manager (it/fm)": "AssIT/FM",
    "assit/fm": "AssIT/FM",
    snrpm: "SnrPM",
    "senior project manager (snrpm)": "SnrPM",
    pm: "PM",
    "project manager (pm)": "PM",
    qm: "QM",
    "quality manager (qm)": "QM",
    lbl: "Lbl",
    "data labeler (lbl)": "Lbl",
  };

  const allowed = new Set([
    "User",
    "Admin",
    "MD",
    "HPM",
    "IT/FM",
    "AssIT/FM",
    "SnrPM",
    "PM",
    "QM",
    "Lbl",
  ]);

  if (allowed.has(trimmed)) return trimmed;

  return roleMap[normalized] || "User";
};

/**
 * POST /signup
 * Register a new user
 */
const signup = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Create and save new user to MongoDB
    const user = new User({
      username,
      password,
      role: normalizeRole(role),
    });

    await user.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

/**
 * POST /login
 * Authenticate user and return JWT token
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Compare passwords using bcryptjs
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Create JWT token with 1h expiration
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.status(200).json({
      token,
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

/**
 * POST /request-reset
 * Request a password reset token using username only
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a short-lived reset token
    const token = crypto.randomBytes(24).toString("hex");
    user.resetToken = token;
    user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    res.status(200).json({
      message: "Password reset initiated",
      username: user.username,
      token,
      expiresAt: user.resetTokenExpires,
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({ message: "Server error initiating reset" });
  }
};

/**
 * POST /reset-password
 * Reset password using username and reset token
 */
const resetPassword = async (req, res) => {
  try {
    const { username, token, password } = req.body;

    if (!username || !token || !password) {
      return res
        .status(400)
        .json({ message: "Username, token, and password are required" });
    }

    const user = await User.findOne({
      username,
      resetToken: token,
      resetTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Reset token is invalid or expired" });
    }

    user.password = password;
    user.resetToken = "";
    user.resetTokenExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Server error resetting password" });
  }
};

const logout = (req, res) => {
  // TODO: Implement user logout logic
  res.status(200).json({ message: "Logout endpoint - to be implemented" });
};

module.exports = {
  signup,
  login,
  logout,
  requestPasswordReset,
  resetPassword,
};
