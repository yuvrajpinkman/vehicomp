import React, { useState, useEffect } from 'react';
import { reservationService } from '../../services/reservation.service';
import { vehicleService } from '../../services/vehicle.service';

export default function ReservationModal({ vehicle, onClose, onSuccess }) {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(tomorrow);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availabilityCheck, setAvailabilityCheck] = useState(null);

  // Calculate rental days & estimated total
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const rentalDays = !isNaN(diffTime) && end > start ? Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))) : 0;
  const estimatedTotal = rentalDays * (vehicle?.pricePerDay || 0);

  // Verify availability on date change
  useEffect(() => {
    if (!vehicle || !startDate || !endDate || start >= end) {
      setAvailabilityCheck(null);
      return;
    }

    let isMounted = true;
    vehicleService
      .checkAvailability(vehicle._id || vehicle.id, startDate, endDate)
      .then((res) => {
        if (isMounted) {
          const data = res.data?.data || res.data || {};
          setAvailabilityCheck(data);
          if (!data.available) {
            setError(data.reason || 'Vehicle is not available for selected dates');
          } else {
            setError(null);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.response?.data?.message || 'Error checking vehicle availability');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [vehicle, startDate, endDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (start >= end) {
      setError('End date must be strictly after start date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await reservationService.create({
        vehicleId: vehicle._id || vehicle.id,
        startDate,
        endDate,
        notes,
      });

      const reservationData = res.data?.data || res.data;
      if (onSuccess) {
        onSuccess(reservationData);
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create reservation';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!vehicle) return null;

  return (
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
      <div
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxWidth: '520px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          color: '#f8fafc',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              Reserve Vehicle
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>
              {vehicle.make} {vehicle.model} ({vehicle.year}) — <span style={{ color: '#38bdf8' }}>₹{vehicle.pricePerDay}/day</span>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '8px',
            }}
          >
            &times;
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '0.875rem',
                lineHeight: 1.4,
              }}
            >
              <strong>Booking Conflict / Warning:</strong> {error}
            </div>
          )}

          {/* Date Pickers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Start Date
              </label>
              <input
                type="date"
                min={today}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #475569',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                End Date
              </label>
              <input
                type="date"
                min={startDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #475569',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
              Special Notes / Requests (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="e.g., Preferred pickup time 10:00 AM, child seat requested"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #475569',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Price Breakdown Box */}
          <div
            style={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '8px' }}>
              <span>Daily Rate:</span>
              <span style={{ color: '#f8fafc', fontWeight: 600 }}>₹{vehicle.pricePerDay}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '12px' }}>
              <span>Duration:</span>
              <span style={{ color: '#f8fafc', fontWeight: 600 }}>{rentalDays} day(s)</span>
            </div>
            <div
              style={{
                borderTop: '1px border #334155',
                paddingTop: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#38bdf8',
              }}
            >
              <span>Estimated Total:</span>
              <span>₹{estimatedTotal}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid #475569',
                backgroundColor: 'transparent',
                color: '#94a3b8',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || rentalDays <= 0 || (availabilityCheck && !availabilityCheck.available)}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: '#ffffff',
                fontWeight: 700,
                cursor: loading || rentalDays <= 0 || (availabilityCheck && !availabilityCheck.available) ? 'not-allowed' : 'pointer',
                opacity: loading || rentalDays <= 0 || (availabilityCheck && !availabilityCheck.available) ? 0.6 : 1,
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              }}
            >
              {loading ? 'Confirming...' : 'Confirm Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
