import React, { useState } from 'react';
import { X, Wrench, CheckCircle, Calendar, DollarSign, User, MapPin, Clock, Edit2, AlertTriangle, ShieldCheck } from 'lucide-react';

const priorityColors = {
  LOW: { text: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' },
  MEDIUM: { text: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
  HIGH: { text: '#fb923c', bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.3)' },
  CRITICAL: { text: '#f87171', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' },
};

const statusColors = {
  SCHEDULED: { text: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.3)' },
  IN_PROGRESS: { text: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' },
  COMPLETED: { text: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' },
  CANCELLED: { text: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.3)' },
};

export default function MaintenanceDetailsModal({
  isOpen,
  onClose,
  record,
  onEdit,
  onComplete,
}) {
  const [completing, setCompleting] = useState(false);
  const [finalCost, setFinalCost] = useState('');

  if (!isOpen || !record) return null;

  const vehicle = record.vehicle || {};
  const pri = priorityColors[record.priority] || priorityColors.MEDIUM;
  const stat = statusColors[record.status] || statusColors.SCHEDULED;

  const handleQuickComplete = async () => {
    const cost = finalCost !== '' ? Number(finalCost) : record.actualCost || record.estimatedCost;
    if (isNaN(cost) || cost < 0) {
      alert('Please enter a valid non-negative actual cost');
      return;
    }
    await onComplete(record._id, cost);
    setCompleting(false);
    onClose();
  };

  const costDelta = (record.actualCost || 0) - (record.estimatedCost || 0);

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
        maxWidth: '650px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '2rem',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        background: '#0f172a',
        color: '#f8fafc',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                {record.maintenanceNumber}
              </h2>
              <span style={{
                background: stat.bg,
                color: stat.text,
                border: `1px solid ${stat.border}`,
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}>
                {record.status}
              </span>
              <span style={{
                background: pri.bg,
                color: pri.text,
                border: `1px solid ${pri.border}`,
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}>
                {record.priority} PRIORITY
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Category: <strong style={{ color: '#c7d2fe' }}>{record.serviceType?.replace(/_/g, ' ')}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Vehicle Telemetry Card */}
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Assigned Vehicle
            </span>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.2rem' }}>
              {vehicle.make} {vehicle.model} ({vehicle.year || '2024'})
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Reg: <code style={{ color: '#93c5fd' }}>{vehicle.registrationNumber || 'N/A'}</code> • {vehicle.fuelType}
            </div>
          </div>
          <div>
            <span style={{
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#a5b4fc',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}>
              Current Status: {vehicle.status || 'MAINTENANCE'}
            </span>
          </div>
        </div>

        {/* Cost & Financial Analysis */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Estimated Expense</span>
            <strong style={{ fontSize: '1.25rem', color: '#f8fafc' }}>
              ₹{record.estimatedCost?.toLocaleString() || 0}
            </strong>
          </div>

          <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Actual Final Cost</span>
            <strong style={{ fontSize: '1.25rem', color: record.actualCost ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
              ₹{record.actualCost?.toLocaleString() || 0}
            </strong>
          </div>

          <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Variance</span>
            <strong style={{ fontSize: '1.1rem', color: costDelta > 0 ? '#f87171' : costDelta < 0 ? '#34d399' : '#cbd5e1' }}>
              {costDelta > 0 ? `+₹${costDelta.toLocaleString()} (Over)` : costDelta < 0 ? `-₹${Math.abs(costDelta).toLocaleString()} (Under)` : 'On Budget'}
            </strong>
          </div>
        </div>

        {/* Problem Description */}
        <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
            Problem Diagnostic &amp; Work Description
          </h4>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#f1f5f9', lineHeight: 1.5 }}>
            {record.problemDescription}
          </p>
        </div>

        {/* Schedule & Vendor Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Wrench size={18} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Service Provider</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{record.serviceProvider || 'In-House Workshop'}</div>
            </div>
          </div>

          <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <User size={18} color="var(--accent-cyan)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lead Technician</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{record.performedBy || 'Unassigned'}</div>
            </div>
          </div>

          <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Calendar size={18} color="#f59e0b" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Commenced</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                {record.startDate ? new Date(record.startDate).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>

          <div style={{ padding: '0.85rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle size={18} color="var(--accent-emerald)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completion Date</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                {record.completionDate ? new Date(record.completionDate).toLocaleDateString() : 'Pending completion'}
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {record.notes && (
          <div style={{ marginBottom: '1.5rem', padding: '0.85rem', borderRadius: '8px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Technician Notes:</span>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1', fontStyle: 'italic' }}>
              "{record.notes}"
            </p>
          </div>
        )}

        {/* Quick Completion Section */}
        {completing && (
          <div style={{
            padding: '1rem',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            marginBottom: '1.5rem',
          }}>
            <h4 style={{ fontSize: '0.9rem', color: '#34d399', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} /> Finalize Maintenance &amp; Release Vehicle
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '0 0 0.75rem 0' }}>
              Confirming completion will automatically transition vehicle <code>{vehicle.registrationNumber}</code> back to <strong>AVAILABLE</strong> in the fleet inventory.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="number"
                min="0"
                placeholder={`Actual cost (default: ₹${record.estimatedCost})`}
                value={finalCost}
                onChange={(e) => setFinalCost(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  flex: '1',
                }}
              />
              <button
                onClick={handleQuickComplete}
                className="btn btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Confirm Release
              </button>
              <button
                onClick={() => setCompleting(false)}
                className="btn"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Created: {new Date(record.createdAt).toLocaleDateString()} by {record.recordedBy || 'Admin'}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {record.status !== 'COMPLETED' && !completing && (
              <button
                onClick={() => setCompleting(true)}
                className="btn"
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.85rem',
                }}
              >
                <CheckCircle size={15} /> Complete Maintenance
              </button>
            )}
            <button
              onClick={() => {
                onClose();
                onEdit(record);
              }}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
            >
              <Edit2 size={15} /> Edit Work Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
