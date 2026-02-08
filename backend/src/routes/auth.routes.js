/**
 * Authentication routes
 * Handles user login, registration, and authentication endpoints
 */

const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// POST /signup - Register a new user
router.post("/signup", authController.signup);

// POST /login - Authenticate user and return JWT token
router.post("/login", authController.login);

// POST /request-reset - Request password reset token
router.post("/request-reset", authController.requestPasswordReset);

// POST /reset-password - Reset password with token
router.post("/reset-password", authController.resetPassword);

// POST /logout - Logout user
router.post("/logout", authController.logout);

module.exports = router;
