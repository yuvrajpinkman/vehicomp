const mongoose = require('mongoose');

const INVOICE_STATUSES = ['DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'CANCELLED'];
const PAYMENT_STATUSES = ['UNPAID', 'PAID', 'REFUNDED'];

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental',
      required: [true, 'Rental ID is required'],
    },
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle ID is required'],
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: INVOICE_STATUSES,
        message: '{VALUE} is not a valid invoice status',
      },
      default: 'ISSUED',
      uppercase: true,
    },
    pricingDetails: {
      totalDays: { type: Number, required: true, min: 0 },
      dailyRate: { type: Number, required: true, min: 0 },
      basePrice: { type: Number, required: true, min: 0 },
      weekendDays: { type: Number, default: 0, min: 0 },
      weekendCharges: { type: Number, default: 0, min: 0 },
      isPeakSeason: { type: Boolean, default: false },
      peakCharges: { type: Number, default: 0, min: 0 },
      insurancePlan: { type: String, default: 'NONE' },
      insuranceFee: { type: Number, default: 0, min: 0 },
      hasAdditionalDriver: { type: Boolean, default: false },
      additionalDriverFee: { type: Number, default: 0, min: 0 },
      lateHours: { type: Number, default: 0, min: 0 },
      hourlyLateFeeRate: { type: Number, default: 15, min: 0 },
      lateFee: { type: Number, default: 0, min: 0 },
      damageCharges: { type: Number, default: 0, min: 0 },
      subtotal: { type: Number, required: true, min: 0 },
      taxRate: { type: Number, default: 0.10, min: 0 },
      taxAmount: { type: Number, required: true, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      totalAmount: { type: Number, required: true, min: 0 },
    },
    paymentDetails: {
      paymentStatus: {
        type: String,
        enum: {
          values: PAYMENT_STATUSES,
          message: '{VALUE} is not a valid payment status',
        },
        default: 'UNPAID',
        uppercase: true,
      },
      paymentMethod: {
        type: String,
        default: 'PENDING',
      },
      paidAt: {
        type: Date,
        default: null,
      },
      transactionId: {
        type: String,
        default: '',
      },
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

invoiceSchema.index({ user: 1, status: 1 });
invoiceSchema.index({ rental: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
module.exports.Invoice = Invoice;
module.exports.INVOICE_STATUSES = INVOICE_STATUSES;
module.exports.PAYMENT_STATUSES = PAYMENT_STATUSES;
