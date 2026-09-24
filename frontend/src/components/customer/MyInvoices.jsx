import React, { useState, useEffect } from 'react';
import { getUserInvoices, generateInvoice } from '../../services/invoice.service';
import InvoiceModal from './InvoiceModal';
import {
  FileText,
  DollarSign,
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Eye,
  CreditCard,
  Calendar,
  AlertCircle
} from 'lucide-react';

function MyInvoices({ onBrowseVehicles }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUserInvoices();
      setInvoices(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PAID') return inv.status === 'PAID' || inv.paymentDetails?.paymentStatus === 'PAID';
    if (statusFilter === 'ISSUED') return inv.status === 'ISSUED' && inv.paymentDetails?.paymentStatus !== 'PAID';
    return true;
  });

  const totalInvoicesCount = invoices.length;
  const totalPaidAmount = invoices
    .filter((inv) => inv.status === 'PAID' || inv.paymentDetails?.paymentStatus === 'PAID')
    .reduce((acc, inv) => acc + (inv.pricingDetails?.totalAmount || 0), 0);
  const totalPendingAmount = invoices
    .filter((inv) => inv.status !== 'PAID' && inv.paymentDetails?.paymentStatus !== 'PAID')
    .reduce((acc, inv) => acc + (inv.pricingDetails?.totalAmount || 0), 0);

  const handleInvoicePaid = (updatedInvoice) => {
    setInvoices((prev) =>
      prev.map((i) => (i._id === updatedInvoice._id || i.invoiceNumber === updatedInvoice.invoiceNumber ? updatedInvoice : i))
    );
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      {/* Top Banner & Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="status-badge online" style={{ marginBottom: '0.4rem', display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
            <FileText size={14} /> Stage 6 — Pricing & Invoices
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.2rem' }}>
            My Invoices & Billing Breakdown 🧾
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
            View complete itemized price breakdowns including base rate, weekend surcharges, peak charges, insurance, and late fees.
          </p>
        </div>

        <button
          onClick={fetchInvoices}
          disabled={loading}
          className="btn"
          style={{
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#c7d2fe',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh Invoices
        </button>
      </div>

      {/* Metrics Header Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText size={16} color="#818cf8" /> Total Invoices
          </span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0.4rem 0 0 0', color: '#fff' }}>
            {totalInvoicesCount}
          </h3>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.05)' }}>
          <span style={{ fontSize: '0.8rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle size={16} /> Total Paid
          </span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0.4rem 0 0 0', color: '#34d399' }}>
            ${totalPaidAmount.toFixed(2)}
          </h3>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(245, 158, 11, 0.05)' }}>
          <span style={{ fontSize: '0.8rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={16} /> Outstanding Balance
          </span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0.4rem 0 0 0', color: '#fbbf24' }}>
            ${totalPendingAmount.toFixed(2)}
          </h3>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.5)', padding: '0.3rem', borderRadius: '10px', width: 'fit-content' }}>
        <button
          onClick={() => setStatusFilter('ALL')}
          style={{
            padding: '0.4rem 1rem',
            borderRadius: '8px',
            border: 'none',
            background: statusFilter === 'ALL' ? 'var(--primary)' : 'transparent',
            color: statusFilter === 'ALL' ? '#fff' : 'var(--text-muted)',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          All ({invoices.length})
        </button>
        <button
          onClick={() => setStatusFilter('ISSUED')}
          style={{
            padding: '0.4rem 1rem',
            borderRadius: '8px',
            border: 'none',
            background: statusFilter === 'ISSUED' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
            color: statusFilter === 'ISSUED' ? '#fbbf24' : 'var(--text-muted)',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Pending Payment
        </button>
        <button
          onClick={() => setStatusFilter('PAID')}
          style={{
            padding: '0.4rem 1rem',
            borderRadius: '8px',
            border: 'none',
            background: statusFilter === 'PAID' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
            color: statusFilter === 'PAID' ? '#34d399' : 'var(--text-muted)',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Paid
        </button>
      </div>

      {/* Loading & Error states */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="spin" style={{ marginBottom: '1rem', color: '#818cf8' }} />
          <p>Loading invoices & price breakdowns...</p>
        </div>
      ) : error ? (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}>
          ⚠️ {error}
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'rgba(255, 255, 255, 0.01)' }}>
          <FileText size={48} color="var(--text-muted)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Invoices Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Invoices are automatically generated when starting or returning vehicle rentals.
          </p>
          {onBrowseVehicles && (
            <button className="btn btn-primary" onClick={onBrowseVehicles}>
              Browse Available Fleet
            </button>
          )}
        </div>
      ) : (
        /* Invoices List Grid */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {filteredInvoices.map((inv) => {
            const isPaid = inv.status === 'PAID' || inv.paymentDetails?.paymentStatus === 'PAID';
            const p = inv.pricingDetails || {};

            return (
              <div
                key={inv._id || inv.invoiceNumber}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${isPaid ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Invoice Number</span>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0.1rem 0 0 0', color: '#fff' }}>
                        #{inv.invoiceNumber}
                      </h4>
                    </div>
                    <span
                      style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        background: isPaid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: isPaid ? '#34d399' : '#fbbf24',
                        border: `1px solid ${isPaid ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                      }}
                    >
                      {isPaid ? '✓ PAID' : 'PENDING'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>Vehicle:</span>
                      <strong style={{ color: '#fff' }}>
                        {inv.vehicle?.make} {inv.vehicle?.model}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>Rental Duration:</span>
                      <span style={{ color: '#c7d2fe' }}>{p.totalDays || 1} day(s)</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>Issued Date:</span>
                      <span>{inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : 'N/A'}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                      <span style={{ fontWeight: '700', color: '#fff' }}>Total Amount:</span>
                      <span style={{ fontWeight: '800', fontSize: '1.1rem', color: isPaid ? '#34d399' : '#818cf8' }}>
                        ${(p.totalAmount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      borderRadius: '8px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      color: '#c7d2fe',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Eye size={15} /> View Breakdown
                  </button>

                  {!isPaid && (
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      style={{
                        padding: '0.6rem 1rem',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        color: '#fff',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <CreditCard size={15} /> Pay Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onPaymentSuccess={handleInvoicePaid}
        />
      )}
    </div>
  );
}

export default MyInvoices;
