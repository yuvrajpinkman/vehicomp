const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Rental = require('../models/Rental');
const pricingService = require('./pricing.service');
const vehicleService = require('./vehicle.service');
const User = require('../models/User');

let inMemoryInvoices = [];

class InvoiceService {
  /**
   * Helper to populate user, vehicle, rental in invoice output
   */
  async _populateInvoice(invoice) {
    if (!invoice) return null;
    const invObj = invoice.toObject ? invoice.toObject() : { ...invoice };

    // Populate vehicle if ID reference
    if (invObj.vehicle && (typeof invObj.vehicle === 'string' || invObj.vehicle instanceof mongoose.Types.ObjectId)) {
      try {
        const v = await vehicleService.getVehicleById(invObj.vehicle);
        if (v) invObj.vehicle = v;
      } catch (e) {
        // Keep ID if lookup fails
      }
    }

    return invObj;
  }

  /**
   * Calculate rental pricing breakdown
   */
  calculatePricing(params) {
    return pricingService.calculatePricing(params);
  }

  /**
   * Generate invoice for a given rental ID
   */
  async generateInvoice(rentalId, options = {}) {
    if (!rentalId) {
      const error = new Error('Rental ID is required to generate invoice');
      error.statusCode = 400;
      throw error;
    }

    let rental = null;

    if (mongoose.connection.readyState === 1) {
      try {
        rental = await Rental.findById(rentalId).populate('vehicle');
      } catch (e) {
        // fallback
      }
    }

    if (!rental) {
      // Check rental via rental service or in-memory
      const rentalService = require('./rental.service');
      rental = await rentalService.getRentalById(rentalId);
    }

    if (!rental) {
      const error = new Error('Rental not found');
      error.statusCode = 404;
      throw error;
    }

    const rawUser = rental._doc?.user || rental.user;
    let userId = rawUser?._id ? rawUser._id.toString() : (rawUser?.id ? rawUser.id.toString() : (rawUser ? rawUser.toString() : null));
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      userId = options.userId || new mongoose.Types.ObjectId().toString();
    }

    let vehicleId = rental.vehicle?._id ? rental.vehicle._id.toString() : (rental.vehicle?.id ? rental.vehicle.id.toString() : (rental.vehicle ? rental.vehicle.toString() : null));
    if (!vehicleId || !mongoose.Types.ObjectId.isValid(vehicleId)) {
      vehicleId = new mongoose.Types.ObjectId().toString();
    }

    const dailyRate = rental.dailyRate || rental.vehicle?.pricePerDay || 100;
    const startDate = rental.startDate || new Date();
    const returnDate = rental.actualReturnDate || rental.expectedReturnDate || new Date();

    const {
      insurancePlan = options.insurancePlan || 'NONE',
      hasInsurance = options.hasInsurance || false,
      hasAdditionalDriver = options.hasAdditionalDriver || false,
      isPeakSeason = options.isPeakSeason,
      damageCharges = options.damageCharges || 0,
      discount = options.discount || 0,
      notes = options.notes || rental.notes || '',
    } = options;

    // Use late hours and late fee from rental if completed, or calculated options
    const lateHours = rental.lateHours || options.lateHours || 0;
    const hourlyLateFeeRate = rental.hourlyLateFeeRate || options.hourlyLateFeeRate || 15;

    // Calculate full pricing breakdown
    const pricingDetails = pricingService.calculatePricing({
      startDate,
      endDate: returnDate,
      dailyRate,
      insurancePlan,
      hasInsurance,
      hasAdditionalDriver,
      isPeakSeason,
      lateHours,
      hourlyLateFeeRate,
      damageCharges,
      discount,
    });

    // Check if invoice already exists for this rental
    let existingInvoice = null;
    if (mongoose.connection.readyState === 1) {
      try {
        existingInvoice = await Invoice.findOne({ rental: rental._id || rentalId });
      } catch (e) {
        // fallback
      }
    } else {
      existingInvoice = inMemoryInvoices.find(
        (i) => i.rental.toString() === rentalId.toString()
      );
    }

    if (existingInvoice) {
      // Update existing invoice pricing details
      existingInvoice.pricingDetails = pricingDetails;
      if (notes) existingInvoice.notes = notes;
      existingInvoice.updatedAt = new Date();

      if (mongoose.connection.readyState === 1 && typeof existingInvoice.save === 'function') {
        const saved = await existingInvoice.save();
        return await this._populateInvoice(saved);
      } else {
        const idx = inMemoryInvoices.findIndex((i) => i._id.toString() === existingInvoice._id.toString());
        if (idx !== -1) {
          inMemoryInvoices[idx] = existingInvoice;
        }
        return await this._populateInvoice(existingInvoice);
      }
    }

    const invoiceNumber = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const issueDate = new Date();
    const dueDate = new Date(issueDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days due date

    const invoicePayload = {
      _id: new mongoose.Types.ObjectId().toString(),
      invoiceNumber,
      rental: rental._id ? rental._id.toString() : rentalId,
      reservation: rental.reservation ? (rental.reservation._id ? rental.reservation._id.toString() : rental.reservation.toString()) : null,
      user: userId,
      vehicle: vehicleId,
      issueDate,
      dueDate,
      status: 'ISSUED',
      pricingDetails,
      paymentDetails: {
        paymentStatus: 'UNPAID',
        paymentMethod: 'PENDING',
        paidAt: null,
        transactionId: '',
      },
      notes: notes || 'Rental vehicle invoice',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const newInvoice = new Invoice(invoicePayload);
        const savedInvoice = await newInvoice.save();
        inMemoryInvoices.push(savedInvoice.toObject());
        return await this._populateInvoice(savedInvoice);
      } catch (err) {
        console.warn('[InvoiceService] DB save failed, fallback to in-memory:', err.message);
      }
    }

    inMemoryInvoices.push(invoicePayload);
    return await this._populateInvoice(invoicePayload);
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(invoiceId) {
    if (mongoose.connection.readyState === 1) {
      try {
        const invoice = await Invoice.findById(invoiceId)
          .populate('rental')
          .populate('vehicle')
          .populate('user', 'name email phone');
        if (invoice) return await this._populateInvoice(invoice);
      } catch (err) {
        // Fallback
      }
    }

    const found = inMemoryInvoices.find(
      (i) => i._id.toString() === invoiceId.toString() || i.invoiceNumber === invoiceId
    );
    if (!found) return null;
    return await this._populateInvoice(found);
  }

  /**
   * Get invoice by Rental ID
   */
  async getInvoiceByRentalId(rentalId) {
    if (mongoose.connection.readyState === 1) {
      try {
        const invoice = await Invoice.findOne({ rental: rentalId })
          .populate('rental')
          .populate('vehicle')
          .populate('user', 'name email phone');
        if (invoice) return await this._populateInvoice(invoice);
      } catch (err) {
        // Fallback
      }
    }

    const found = inMemoryInvoices.find(
      (i) => (i.rental?._id ? i.rental._id.toString() : i.rental?.toString()) === rentalId.toString()
    );
    if (!found) return null;
    return await this._populateInvoice(found);
  }

  /**
   * Get user invoices
   */
  async getUserInvoices(userId) {
    if (!userId) {
      const error = new Error('User ID is required');
      error.statusCode = 400;
      throw error;
    }

    const userIdStr = userId.toString();

    if (mongoose.connection.readyState === 1) {
      try {
        const invoices = await Invoice.find({ user: userIdStr })
          .sort({ createdAt: -1 })
          .populate('vehicle')
          .populate('rental');
        if (invoices && invoices.length > 0) {
          return await Promise.all(invoices.map((inv) => this._populateInvoice(inv)));
        }
      } catch (err) {
        console.warn('[InvoiceService] DB find error, fallback:', err.message);
      }
    }

    const filtered = inMemoryInvoices.filter((i) => {
      const u = i.user;
      const uId = u?._id ? u._id.toString() : (u?.id ? u.id.toString() : (u ? u.toString() : ''));
      return uId === userIdStr;
    });
    return await Promise.all(filtered.map((inv) => this._populateInvoice(inv)));
  }

  /**
   * Process invoice payment
   */
  async payInvoice(invoiceId, paymentData = {}) {
    const { paymentMethod = 'CREDIT_CARD', transactionId } = paymentData;

    let invoice = null;
    if (mongoose.connection.readyState === 1) {
      try {
        invoice = await Invoice.findById(invoiceId);
      } catch (e) {
        // Fallback
      }
    }

    if (!invoice) {
      invoice = inMemoryInvoices.find(
        (i) => i._id.toString() === invoiceId.toString() || i.invoiceNumber === invoiceId
      );
    }

    if (!invoice) {
      const error = new Error('Invoice not found');
      error.statusCode = 404;
      throw error;
    }

    if (invoice.paymentDetails?.paymentStatus === 'PAID') {
      const error = new Error('Invoice has already been paid');
      error.statusCode = 400;
      throw error;
    }

    const txnId = transactionId || `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    invoice.status = 'PAID';
    invoice.paymentDetails = {
      paymentStatus: 'PAID',
      paymentMethod,
      paidAt: new Date(),
      transactionId: txnId,
    };
    invoice.updatedAt = new Date();

    if (mongoose.connection.readyState === 1 && typeof invoice.save === 'function') {
      await invoice.save();
    } else {
      const idx = inMemoryInvoices.findIndex((i) => i._id.toString() === invoiceId.toString());
      if (idx !== -1) {
        inMemoryInvoices[idx] = { ...inMemoryInvoices[idx], ...invoice };
      }
    }

    return await this._populateInvoice(invoice);
  }
}

module.exports = new InvoiceService();
module.exports.InvoiceService = InvoiceService;
