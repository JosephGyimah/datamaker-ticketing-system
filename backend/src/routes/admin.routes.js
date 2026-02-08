/**
 * Admin routes
 * Handles administrative operations and system management
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// Routes to be implemented
router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getAllUsers);
router.post('/export', adminController.exportData);

module.exports = router;
