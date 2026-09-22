import React, { useState, useEffect } from 'react';
import { reservationService } from '../../services/reservation.service';
import { rentalService } from '../../services/rental.service';

export default function MyReservations({ onBrowseVehicles, onNavigateRentals }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [cancelModalRes, setCancelModalRes] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reservationService.getMyReservations();
      const list = res.data?.data || res.data || [];
      setReservations(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleStartRental = async (res) => {
    const vehId = res.vehicle?._id || res.vehicle?.id || res.vehicle;
    if (!vehId) return alert('Invalid vehicle for rental');

    try {
      await rentalService.startRental({
        reservationId: res._id || res.id,
        vehicleId: vehId,
        expectedReturnDate: res.endDate,
        initialOdometer: res.vehicle?.mileage || 15000,
        notes: `Pickup from reservation #${res.reservationNumber}`,
      });
      alert('Rental started successfully! Vehicle status updated to RENTED.');
      if (onNavigateRentals) {
        onNavigateRentals();
      } else {
        fetchReservations();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to start rental');
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelModalRes) return;

    setCancelling(true);
    try {
      await reservationService.cancel(cancelModalRes._id || cancelModalRes.id, cancelReason);
      setCancelModalRes(null);
      setCancelReason('');
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel reservation');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'CONFIRMED':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: '1px solid #10b981', label: 'CONFIRMED' };
      case 'CANCELLED':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#fca5a5', border: '1px solid #ef4444', label: 'CANCELLED' };
      case 'COMPLETED':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#93c5fd', border: '1px solid #3b82f6', label: 'COMPLETED' };
      default:
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fcd34d', border: '1px solid #f59e0b', label: s };
    }
  };

  const filteredReservations = reservations.filter((r) => {
    if (filter === 'ALL') return true;
    return (r.status || '').toUpperCase() === filter;
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#f8fafc' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, background: 'linear-gradient(to right, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            My Reservations
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            View and manage your upcoming vehicle bookings
          </p>
        </div>
        {onBrowseVehicles && (
          <button
            onClick={onBrowseVehicles}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            }}
          >
            + New Reservation
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
        {['ALL', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: filter === tab ? '#3b82f6' : '#1e293b',
              color: filter === tab ? '#ffffff' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
          Loading your reservations...
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredReservations.length === 0 && (
        <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '48px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#cbd5e1' }}>No reservations found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
            {filter === 'ALL' ? "You haven't made any vehicle reservations yet." : `No reservations with status '${filter}'.`}
          </p>
          {onBrowseVehicles && (
            <button
              onClick={onBrowseVehicles}
              style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#3b82f6', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}
            >
              Browse Available Vehicles
            </button>
          )}
        </div>
      )}

      {/* Grid of Reservations */}
      {!loading && filteredReservations.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {filteredReservations.map((res) => {
            const badge = getStatusBadge(res.status);
            const veh = res.vehicle || {};
            const startDateStr = new Date(res.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
            const endDateStr = new Date(res.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

            return (
              <div
                key={res._id || res.id}
                style={{
                  backgroundColor: '#1e293b',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                }}
              >
                <div>
                  {/* Top Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px' }}>
                      #{res.reservationNumber || 'RES-1001'}
                    </span>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: badge.bg,
                        color: badge.text,
                        border: badge.border,
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* Vehicle Title */}
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: '#ffffff' }}>
                    {veh.make || 'Vehicle'} {veh.model || ''}
                  </h3>
                  <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#38bdf8' }}>
                    {veh.registrationNumber || 'N/A'} • {veh.vehicleType || 'CAR'}
                  </p>

                  {/* Dates Box */}
                  <div style={{ backgroundColor: '#0f172a', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '6px' }}>
                      <span>Pickup:</span>
                      <strong style={{ color: '#f8fafc' }}>{startDateStr}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                      <span>Return:</span>
                      <strong style={{ color: '#f8fafc' }}>{endDateStr}</strong>
                    </div>
                  </div>

                  {/* Price & Duration */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '0.9rem' }}>
                    <span style={{ color: '#94a3b8' }}>{res.totalDays || 1} Day(s) @ ₹{res.pricePerDay}/day</span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>₹{res.totalPrice}</span>
                  </div>

                  {res.cancellationReason && (
                    <div style={{ fontSize: '0.8rem', color: '#fca5a5', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px' }}>
                      Reason: {res.cancellationReason}
                    </div>
                  )}
                </div>

                {/* Footer action */}
                {res.status === 'CONFIRMED' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleStartRental(res)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#ffffff',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      🔑 Pickup & Start Rental
                    </button>
                    <button
                      onClick={() => setCancelModalRes(res)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#fca5a5',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalRes && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '24px', maxWidth: '440px', width: '100%', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#ffffff' }}>Cancel Reservation?</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '16px' }}>
              Are you sure you want to cancel reservation #{cancelModalRes.reservationNumber}?
            </p>

            <form onSubmit={handleCancelSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                  Cancellation Reason (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Change of plans, found alternate vehicle"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #475569',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setCancelModalRes(null)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #475569', backgroundColor: 'transparent', color: '#94a3b8', cursor: 'pointer' }}
                >
                  Keep Reservation
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
