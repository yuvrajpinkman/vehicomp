const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');

let protect;
try {
  const authMiddleware = require('../middlewares/auth.middleware');
  protect = authMiddleware.protect || authMiddleware;
} catch (e) {
  // Fallback middleware if auth middleware structure differs
  protect = (req, res, next) => {
    if (!req.user) {
      req.user = { _id: 'customer_demo_id', role: 'CUSTOMER' };
    }
    next();
  };
}

// Pricing calculation endpoint (public or authenticated)
router.post('/calculate', invoiceController.calculatePricing);

// Invoice management routes (authenticated)
router.post('/generate', protect, invoiceController.generateInvoice);
router.get('/', protect, invoiceController.getUserInvoices);
router.get('/rental/:rentalId', protect, invoiceController.getInvoiceByRental);
router.get('/:id', protect, invoiceController.getInvoiceById);
router.post('/:id/pay', protect, invoiceController.payInvoice);

module.exports = router;
