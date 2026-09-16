import React from 'react';
import { X, Calendar, MapPin, Gauge, Fuel, Users, CheckCircle, Tag, Clock } from 'lucide-react';

export default function VehicleDetailsModal({ isOpen, onClose, vehicle }) {
  if (!isOpen || !vehicle) return null;

  const statusColors = {
    AVAILABLE: '#10b981',
    RESERVED: '#f59e0b',
    RENTED: '#3b82f6',
    RETURNED: '#8b5cf6',
    INSPECTION: '#06b6d4',
    DAMAGED: '#ef4444',
    MAINTENANCE: '#ec4899',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {vehicle.make} {vehicle.model}
              </h2>
              <span style={{
                background: statusColors[vehicle.status] || '#6366f1',
                color: '#fff',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
              }}>
                {vehicle.status}
              </span>
              {!vehicle.isActive && (
                <span style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}>
                  DEACTIVATED
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Registration: <strong style={{ color: '#fff' }}>{vehicle.registrationNumber}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Highlight Stats Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          padding: '1rem',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-color)',
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Daily Rental</span>
            <strong style={{ fontSize: '1.2rem', color: 'var(--accent-emerald)' }}>
              ₹{vehicle.pricePerDay?.toLocaleString() || 0}
            </strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/day</span>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Vehicle Type</span>
            <strong style={{ fontSize: '1.05rem', color: '#fff' }}>{vehicle.vehicleType}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Condition</span>
            <strong style={{ fontSize: '1.05rem', color: '#38bdf8' }}>{vehicle.condition}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Year</span>
            <strong style={{ fontSize: '1.05rem', color: '#fff' }}>{vehicle.year}</strong>
          </div>
        </div>

        {/* Key Specs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.9rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Fuel size={20} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fuel / Powertrain</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{vehicle.fuelType}</div>
            </div>
          </div>

          <div style={{ padding: '0.9rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={20} color="var(--accent-cyan)" />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Capacity</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{vehicle.seatingCapacity} Passengers</div>
            </div>
          </div>

          <div style={{ padding: '0.9rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Gauge size={20} color="var(--accent-emerald)" />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Odometer</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{vehicle.mileage?.toLocaleString() || 0} km</div>
            </div>
          </div>

          <div style={{ padding: '0.9rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MapPin size={20} color="#f59e0b" />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location Hub</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                {vehicle.location?.city} {vehicle.location?.address ? `— ${vehicle.location.address}` : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Features List */}
        {Array.isArray(vehicle.features) && vehicle.features.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Equipped Features
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {vehicle.features.map((feat, i) => (
                <span key={i} style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#c7d2fe',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}>
                  <CheckCircle size={14} color="#818cf8" />
                  {feat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Metadata Footer */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <div>ID: <code>{vehicle._id}</code></div>
          <div>Added: {new Date(vehicle.createdAt).toLocaleDateString()}</div>
          <div>Last Updated: {new Date(vehicle.updatedAt).toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
}
