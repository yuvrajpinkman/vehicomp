const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { protect } = require('../middlewares/auth.middleware');

// GET /api/customer/dashboard
router.get('/dashboard', protect, customerController.getCustomerDashboard);

module.exports = router;
