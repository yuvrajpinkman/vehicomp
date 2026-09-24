const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');

// Dynamic pricing calculation
router.post('/calculate', invoiceController.calculatePricing);

module.exports = router;
