const invoiceService = require('../services/invoice.service');

/**
 * Calculate dynamic rental pricing breakdown
 */
const calculatePricing = async (req, res, next) => {
  try {
    const pricing = invoiceService.calculatePricing(req.body);
    res.status(200).json({
      status: 'success',
      data: pricing,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Generate invoice for a rental
 */
const generateInvoice = async (req, res, next) => {
  try {
    const { rentalId, ...options } = req.body;
    const targetRentalId = rentalId || req.params.rentalId;

    if (!targetRentalId) {
      return res.status(400).json({
        status: 'error',
        message: 'rentalId is required to generate an invoice',
      });
    }

    const invoice = await invoiceService.generateInvoice(targetRentalId, options);
    res.status(201).json({
      status: 'success',
      message: 'Invoice generated successfully',
      data: invoice,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get invoices for logged-in user (or specific user if query provided)
 */
const getUserInvoices = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id || req.query.userId;
    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'Authentication required to view invoices',
      });
    }

    const invoices = await invoiceService.getUserInvoices(userId);
    res.status(200).json({
      status: 'success',
      count: invoices.length,
      data: invoices,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single invoice details by invoice ID
 */
const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        status: 'error',
        message: 'Invoice not found',
      });
    }
    res.status(200).json({
      status: 'success',
      data: invoice,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get invoice by Rental ID
 */
const getInvoiceByRental = async (req, res, next) => {
  try {
    const invoice = await invoiceService.getInvoiceByRentalId(req.params.rentalId);
    if (!invoice) {
      return res.status(404).json({
        status: 'error',
        message: 'No invoice found for this rental',
      });
    }
    res.status(200).json({
      status: 'success',
      data: invoice,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Process invoice payment
 */
const payInvoice = async (req, res, next) => {
  try {
    const invoice = await invoiceService.payInvoice(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Invoice payment completed successfully',
      data: invoice,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  calculatePricing,
  generateInvoice,
  getUserInvoices,
  getInvoiceById,
  getInvoiceByRental,
  payInvoice,
};
