import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

const TRANSITION_DETAILS = {
  RESERVED: { label: 'Reserve Vehicle', desc: 'Lock vehicle for customer reservation', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  RENTED: { label: 'Start Rental (Handover)', desc: 'Customer takes delivery; trip active', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  RETURNED: { label: 'Record Return', desc: 'Customer dropped off vehicle at hub', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
  INSPECTION: { label: 'Send for Inspection', desc: 'Clean, check fluid levels, & verify condition', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' },
  AVAILABLE: { label: 'Clear to Available', desc: 'Ready for customer search & booking', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  DAMAGED: { label: 'Flag Vehicle Damaged', desc: 'Record damage & freeze from booking', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
  MAINTENANCE: { label: 'Send to Workshop', desc: 'Bodywork, engine repair, or routine service', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' },
};

const ALLOWED_MAP = {
  AVAILABLE: ['RESERVED', 'MAINTENANCE'],
  RESERVED: ['RENTED', 'AVAILABLE'],
  RENTED: ['RETURNED'],
  RETURNED: ['INSPECTION', 'DAMAGED'],
  INSPECTION: ['AVAILABLE', 'DAMAGED', 'MAINTENANCE'],
  DAMAGED: ['MAINTENANCE'],
  MAINTENANCE: ['AVAILABLE', 'INSPECTION'],
};

export default function StatusTransitionModal({ isOpen, onClose, vehicle, onTransitionSuccess }) {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (vehicle) {
      const allowed = ALLOWED_MAP[vehicle.status] || [];
      setSelectedStatus(allowed[0] || '');
      setReason('');
      setNotes('');
      setError(null);
    }
  }, [vehicle, isOpen]);

  if (!isOpen || !vehicle) return null;

  const currentStatus = vehicle.status;
  const allowedTransitions = ALLOWED_MAP[currentStatus] || [];

  const handleConfirm = async () => {
    if (!selectedStatus) {
      setError('Please select a target status');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onTransitionSuccess(vehicle._id, {
        status: selectedStatus,
        reason: reason.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to transition status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    }}>
      <div className="glass-panel" style={{
        maxWidth: '560px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '2rem',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        background: '#0f172a',
        color: '#f8fafc',
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <ShieldCheck size={20} color="var(--primary)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                Vehicle Lifecycle Transition
              </h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {vehicle.make} {vehicle.model} • <code>{vehicle.registrationNumber}</code>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Current State Display */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderRadius: '10px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Current Status</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem', color: TRANSITION_DETAILS[currentStatus]?.color || '#fff' }}>
              {currentStatus}
            </div>
          </div>
          <ArrowRight size={22} color="var(--text-muted)" />
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Next Status</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.2rem', color: TRANSITION_DETAILS[selectedStatus]?.color || '#fff' }}>
              {selectedStatus || 'Select below'}
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            color: '#fca5a5',
            fontSize: '0.85rem',
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Allowed Transitions Options */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
            Permitted State Machine Transitions:
          </label>

          {allowedTransitions.length === 0 ? (
            <p style={{ color: '#f87171', fontSize: '0.9rem' }}>
              No outgoing transitions currently allowed from <strong>{currentStatus}</strong>.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '0.6rem' }}>
              {allowedTransitions.map((status) => {
                const info = TRANSITION_DETAILS[status] || { label: status, desc: '', color: '#fff', bg: 'rgba(255,255,255,0.05)' };
                const isSelected = selectedStatus === status;
                return (
                  <div
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '10px',
                      border: `1.5px solid ${isSelected ? info.color : 'rgba(255, 255, 255, 0.08)'}`,
                      background: isSelected ? info.bg : 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: info.color }}>
                        {info.label} ({status})
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {info.desc}
                      </div>
                    </div>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: `2px solid ${isSelected ? info.color : 'var(--text-muted)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: info.color }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reason / Notes Inputs */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Transition Reason (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Customer pickup, scheduled checkup, drop-off return"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '1.75rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Inspector / Staff Notes (Optional)
          </label>
          <textarea
            rows="2"
            placeholder="e.g. Odometer reading 34,500 km, clean fuel tank, no body scratches"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#cbd5e1' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || !selectedStatus}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {loading ? <RefreshCw size={16} className="spin" /> : <ShieldCheck size={16} />}
            {loading ? 'Validating...' : 'Confirm Transition'}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.65rem 0.85rem',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  color: '#f8fafc',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
};
