import React, { useState } from 'react';
import { payInvoice } from '../../services/invoice.service';
import {
  FileText,
  X,
  CreditCard,
  CheckCircle,
  Calendar,
  Car,
  User,
  Clock,
  ShieldCheck,
  AlertTriangle,
  DollarSign,
  Printer,
  Sparkles
} from 'lucide-react';

function InvoiceModal({ invoice, onClose, onPaymentSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paidInvoice, setPaidInvoice] = useState(invoice);

  if (!invoice) return null;

  const currentInvoice = paidInvoice || invoice;
  const isPaid = currentInvoice.status === 'PAID' || currentInvoice.paymentDetails?.paymentStatus === 'PAID';
  const p = currentInvoice.pricingDetails || {};

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      const res = await payInvoice(currentInvoice._id || currentInvoice.id, {
        paymentMethod,
        transactionId: `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      });

      const updated = res.data || currentInvoice;
      setPaidInvoice(updated);
      if (onPaymentSuccess) onPaymentSuccess(updated);
    } catch (err) {
      setError(err.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        overflowY: 'auto',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '750px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: isPaid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${isPaid ? 'rgba(16, 185, 129, 0.4)' : 'rgba(99, 102, 241, 0.4)'}`,
              }}
            >
              <FileText color={isPaid ? '#10b981' : '#818cf8'} size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>
                  Invoice #{currentInvoice.invoiceNumber}
                </h3>
                <span
                  style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    background: isPaid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: isPaid ? '#34d399' : '#fbbf24',
                    border: `1px solid ${isPaid ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                  }}
                >
                  {isPaid ? '✓ PAID' : 'PENDING PAYMENT'}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                Issued: {currentInvoice.issueDate ? new Date(currentInvoice.issueDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
              }}
            >
              <Printer size={15} /> Print
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: 'var(--text-muted)',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
          {/* Metadata Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Car size={14} color="#818cf8" /> Vehicle Details
              </span>
              <p style={{ fontWeight: '600', fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>
                {currentInvoice.vehicle?.make} {currentInvoice.vehicle?.model} ({currentInvoice.vehicle?.registrationNumber || 'Standard Fleet'})
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <User size={14} color="#34d399" /> Billed To
              </span>
              <p style={{ fontWeight: '600', fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>
                {currentInvoice.user?.name || 'Valued Customer'}
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {currentInvoice.user?.email}
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={14} color="#f59e0b" /> Rental Period
              </span>
              <p style={{ fontWeight: '600', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                {p.startDate ? new Date(p.startDate).toLocaleDateString() : 'N/A'} — {p.endDate ? new Date(p.endDate).toLocaleDateString() : 'N/A'}
              </p>
              <span style={{ fontSize: '0.75rem', color: '#c7d2fe', fontWeight: '500' }}>
                Duration: {p.totalDays || 1} Day(s)
              </span>
            </div>
          </div>

          {/* Itemized Price Breakdown Table */}
          <div
            className="glass-panel"
            style={{
              padding: '1.25rem',
              background: 'rgba(15, 23, 42, 0.6)',
              marginBottom: '1.5rem',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <h4
              style={{
                fontSize: '0.95rem',
                fontWeight: '700',
                marginBottom: '1rem',
                color: '#c7d2fe',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <DollarSign size={16} color="#818cf8" /> Itemized Pricing Breakdown (Stage 6)
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
              {/* Base Rate */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.08)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  Base Rental Rate ({p.totalDays || 1} day(s) @ ${p.dailyRate || 100}/day)
                </span>
                <span style={{ fontWeight: '600' }}>${(p.basePrice || 0).toFixed(2)}</span>
              </div>

              {/* Weekend Surcharge */}
              {p.weekendCharges > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.08)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Sparkles size={14} /> Weekend Surge ({p.weekendDays} weekend day(s) @ +20%)
                  </span>
                  <span style={{ fontWeight: '600', color: '#fbbf24' }}>+${p.weekendCharges.toFixed(2)}</span>
                </div>
              )}

              {/* Peak Season Surcharge */}
              {p.isPeakSeason && p.peakCharges > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.08)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertTriangle size={14} /> Peak Season Surcharge (+15%)
                  </span>
                  <span style={{ fontWeight: '600', color: '#f43f5e' }}>+${p.peakCharges.toFixed(2)}</span>
                </div>
              )}

              {/* Insurance */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.08)', paddingBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ShieldCheck size={14} color="#34d399" /> Insurance Protection ({p.insurancePlan || 'NONE'})
                </span>
                <span style={{ fontWeight: '600' }}>
                  {p.insuranceFee > 0 ? `+$${p.insuranceFee.toFixed(2)}` : '$0.00'}
                </span>
              </div>

              {/* Additional Driver */}
              {p.hasAdditionalDriver && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.08)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Additional Driver Coverage (${15}/day)
                  </span>
                  <span style={{ fontWeight: '600' }}>+${(p.additionalDriverFee || 0).toFixed(2)}</span>
                </div>
              )}

              {/* Late Return Fee */}
              {p.lateFee > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.08)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={14} /> Late Return Fee ({p.lateHours} hr(s) @ ${p.hourlyLateFeeRate || 15}/hr)
                  </span>
                  <span style={{ fontWeight: '600', color: '#ef4444' }}>+${p.lateFee.toFixed(2)}</span>
                </div>
              )}

              {/* Damage Charges */}
              {p.damageCharges > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.08)', paddingBottom: '0.4rem' }}>
                  <span style={{ color: '#ef4444' }}>Vehicle Damage Charges</span>
                  <span style={{ fontWeight: '600', color: '#ef4444' }}>+${p.damageCharges.toFixed(2)}</span>
                </div>
              )}

              {/* Subtotal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontWeight: '600' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span>${(p.subtotal || 0).toFixed(2)}</span>
              </div>

              {/* Tax */}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Sales Tax ({((p.taxRate || 0.10) * 100).toFixed(0)}%)</span>
                <span>+${(p.taxAmount || 0).toFixed(2)}</span>
              </div>

              {/* Discount */}
              {p.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399' }}>
                  <span>Discount</span>
                  <span>-${p.discount.toFixed(2)}</span>
                </div>
              )}

              {/* Grand Total */}
              <div
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  marginTop: '0.6rem',
                  paddingTop: '0.75rem',
                  borderTop: '2px solid rgba(255, 255, 255, 0.15)',
                  fontSize: '1.15rem',
                  fontWeight: '800',
                  color: '#fff',
                }}
              >
                <span>Total Amount Due</span>
                <span style={{ color: '#818cf8' }}>${(p.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          {!isPaid ? (
            <form onSubmit={handlePay} className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '14px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '0 0 1rem 0', color: '#c7d2fe', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CreditCard size={18} color="#818cf8" /> Secure Invoice Payment Simulation
              </h4>

              {error && (
                <div style={{ padding: '0.6rem 0.8rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      borderRadius: '8px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                      fontSize: '0.85rem',
                    }}
                  >
                    <option value="CREDIT_CARD">💳 Credit Card</option>
                    <option value="DEBIT_CARD">🏦 Debit Card</option>
                    <option value="NET_BANKING">🌐 Online Net Banking</option>
                    <option value="UPI">📱 Instant UPI Payment</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                    Account / Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      borderRadius: '8px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                }}
              >
                <CheckCircle size={18} /> {processing ? 'Processing Payment...' : `Pay $${(p.totalAmount || 0).toFixed(2)} Now`}
              </button>
            </form>
          ) : (
            <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '0 0 0.2rem 0', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle size={18} /> Payment Completed
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Method: {currentInvoice.paymentDetails?.paymentMethod || 'Credit Card'} | Txn ID: <code style={{ color: '#a5b4fc' }}>{currentInvoice.paymentDetails?.transactionId || 'TXN-999'}</code>
                </p>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: '600' }}>
                Paid on {currentInvoice.paymentDetails?.paidAt ? new Date(currentInvoice.paymentDetails.paidAt).toLocaleString() : new Date().toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InvoiceModal;
