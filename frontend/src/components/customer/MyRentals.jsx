import React, { useState, useEffect } from 'react';
import { rentalService } from '../../services/rental.service';
import { generateInvoice } from '../../services/invoice.service';
import InvoiceModal from './InvoiceModal';

export default function MyRentals({ onBrowseVehicles }) {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE' | 'HISTORY'
  const [returnModalRental, setReturnModalRental] = useState(null);
  const [returnOdometer, setReturnOdometer] = useState('');
  const [returnNotes, setReturnNotes] = useState('');
  const [returning, setReturning] = useState(false);
  const [invoiceModalData, setInvoiceModalData] = useState(null);

  const fetchRentals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await rentalService.getMyRentals();
      const list = res.data?.data || res.data || [];
      setRentals(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load rentals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnModalRental) return;

    setReturning(true);
    try {
      await rentalService.returnRental(returnModalRental._id || returnModalRental.id, {
        returnOdometer: returnOdometer ? Number(returnOdometer) : undefined,
        notes: returnNotes,
      });
      setReturnModalRental(null);
      setReturnOdometer('');
      setReturnNotes('');
      fetchRentals();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to return vehicle');
    } finally {
      setReturning(false);
    }
  };

  const activeRentals = rentals.filter((r) => ['ACTIVE', 'OVERDUE'].includes((r.status || '').toUpperCase()));
  const historicalRentals = rentals.filter((r) => ['COMPLETED', 'CANCELLED'].includes((r.status || '').toUpperCase()));

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'ACTIVE':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: '1px solid #10b981', label: 'ACTIVE RENTAL' };
      case 'OVERDUE':
        return { bg: 'rgba(239, 68, 68, 0.2)', text: '#fca5a5', border: '1px solid #ef4444', label: 'OVERDUE' };
      case 'COMPLETED':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#93c5fd', border: '1px solid #3b82f6', label: 'COMPLETED' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', text: '#cbd5e1', border: '1px solid #64748b', label: s };
    }
  };

  const calculateLatePreview = (expectedReturnStr) => {
    if (!expectedReturnStr) return { isLate: false, hours: 0, fee: 0 };
    const expected = new Date(expectedReturnStr);
    const now = new Date();
    if (now > expected) {
      const diffMs = now.getTime() - expected.getTime();
      const hours = Math.ceil(diffMs / (1000 * 60 * 60));
      return { isLate: true, hours, fee: hours * 15 };
    }
    return { isLate: false, hours: 0, fee: 0 };
  };

  const displayedList = activeTab === 'ACTIVE' ? activeRentals : historicalRentals;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#f8fafc' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              margin: 0,
              background: 'linear-gradient(to right, #10b981, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            My Rental Lifecycle & Driving History
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            Track active rentals, odometer readings, return times, and late-return fees
          </p>
        </div>
        {onBrowseVehicles && (
          <button
            onClick={onBrowseVehicles}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
            }}
          >
            + Browse Fleet
          </button>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          borderBottom: '1px solid #334155',
          paddingBottom: '12px',
        }}
      >
        <button
          onClick={() => setActiveTab('ACTIVE')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'ACTIVE' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
            color: activeTab === 'ACTIVE' ? '#34d399' : '#94a3b8',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'ACTIVE' ? '2px solid #10b981' : '2px solid transparent',
          }}
        >
          Active & Ongoing ({activeRentals.length})
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: activeTab === 'HISTORY' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
            color: activeTab === 'HISTORY' ? '#60a5fa' : '#94a3b8',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'HISTORY' ? '2px solid #3b82f6' : '2px solid transparent',
          }}
        >
          Rental History ({historicalRentals.length})
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            color: '#fca5a5',
            marginBottom: '20px',
          }}
        >
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
          Loading your rental records...
        </div>
      ) : displayedList.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px',
            background: 'rgba(30, 41, 59, 0.5)',
            borderRadius: '12px',
            border: '1px dashed #334155',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🚗</div>
          <h3 style={{ fontSize: '1.1rem', color: '#cbd5e1', margin: '0 0 8px 0' }}>
            No {activeTab === 'ACTIVE' ? 'active' : 'historical'} rentals found
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            {activeTab === 'ACTIVE'
              ? 'You do not have any active rentals right now. Start a rental from your confirmed reservations!'
              : 'Completed rentals will appear here after you return your vehicles.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {displayedList.map((rental) => {
            const vehicle = rental.vehicle || {};
            const badge = getStatusBadge(rental.status);
            const latePreview = calculateLatePreview(rental.expectedReturnDate);

            return (
              <div
                key={rental._id || rental.id || rental.rentalNumber}
                style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  borderRadius: '12px',
                  border: rental.status === 'OVERDUE' ? '1px solid #ef4444' : '1px solid #334155',
                  padding: '20px',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '12px',
                    borderBottom: '1px solid #334155',
                    paddingBottom: '14px',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          background: '#0f172a',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          color: '#38bdf8',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {rental.rentalNumber}
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '12px',
                          background: badge.bg,
                          color: badge.text,
                          border: badge.border,
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '8px 0 2px 0', color: '#f8fafc' }}>
                      {vehicle.make} {vehicle.model} ({vehicle.registrationNumber || 'N/A'})
                    </h3>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
                      {vehicle.vehicleType} • {vehicle.fuelType} • City: {vehicle.location?.city || 'N/A'}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
                      ₹{rental.dailyRate} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>/ day</span>
                    </div>
                    {rental.lateFee > 0 && (
                      <div style={{ fontSize: '0.85rem', color: '#fca5a5', fontWeight: 600, marginTop: '4px' }}>
                        Late Fee: +₹{rental.lateFee} ({rental.lateHours} hrs)
                      </div>
                    )}
                  </div>
                </div>

                {/* Grid details */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    fontSize: '0.875rem',
                    color: '#cbd5e1',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>PICKUP TIME</span>
                    {rental.startDate ? new Date(rental.startDate).toLocaleString() : 'N/A'}
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>EXPECTED RETURN</span>
                    {rental.expectedReturnDate ? new Date(rental.expectedReturnDate).toLocaleString() : 'N/A'}
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>ACTUAL RETURN</span>
                    {rental.actualReturnDate ? new Date(rental.actualReturnDate).toLocaleString() : 'Ongoing'}
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>ODOMETER (START / RETURN)</span>
                    {rental.initialOdometer} km / {rental.returnOdometer ? `${rental.returnOdometer} km` : 'In use'}
                  </div>
                </div>

                {/* Overdue alert banner if applicable */}
                {rental.status === 'ACTIVE' && latePreview.isLate && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid #ef4444',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#fca5a5',
                      fontSize: '0.85rem',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>
                      ⚠️ <strong>Overdue Notice:</strong> Expected return date has passed by ~{latePreview.hours} hours.
                      Late fee rate: ₹15/hr (Est. Fee: ₹{latePreview.fee}).
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={async () => {
                      try {
                        const invRes = await generateInvoice(rental._id || rental.id || rental.rentalNumber);
                        setInvoiceModalData(invRes.data || invRes);
                      } catch (err) {
                        alert(err.message || 'Failed to generate invoice');
                      }
                    }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#c7d2fe',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    🧾 Generate / View Invoice
                  </button>

                  {['ACTIVE', 'OVERDUE'].includes(rental.status) && (
                    <button
                      onClick={() => {
                        setReturnModalRental(rental);
                        setReturnOdometer(rental.returnOdometer || rental.initialOdometer + 50);
                      }}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      🔄 Return Vehicle & Complete Rental
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Return Vehicle Modal */}
      {returnModalRental && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '500px',
              color: '#f8fafc',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 8px 0', color: '#34d399' }}>
              Return Vehicle — {returnModalRental.vehicle?.make} {returnModalRental.vehicle?.model}
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#94a3b8', fontSize: '0.875rem' }}>
              Record dropoff details to update vehicle status to RETURNED and compute final late fees.
            </p>

            <form onSubmit={handleReturnSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Initial Odometer (at pickup): <strong>{returnModalRental.initialOdometer} km</strong>
                </label>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Final Odometer Reading (km) *
                </label>
                <input
                  type="number"
                  required
                  min={returnModalRental.initialOdometer}
                  value={returnOdometer}
                  onChange={(e) => setReturnOdometer(e.target.value)}
                  placeholder={`Min ${returnModalRental.initialOdometer}`}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #475569',
                    background: '#0f172a',
                    color: '#fff',
                    fontSize: '0.95rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Return Notes & Vehicle Condition Comments
                </label>
                <textarea
                  rows={3}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="e.g. Fuel tank filled, clean condition..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #475569',
                    background: '#0f172a',
                    color: '#fff',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setReturnModalRental(null)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid #475569',
                    background: 'transparent',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={returning}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {returning ? 'Completing Return...' : 'Confirm Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceModalData && (
        <InvoiceModal
          invoice={invoiceModalData}
          onClose={() => setInvoiceModalData(null)}
        />
      )}
    </div>
  );
}
