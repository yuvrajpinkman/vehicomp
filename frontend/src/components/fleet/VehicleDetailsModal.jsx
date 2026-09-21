import React, { useState, useEffect } from 'react';
import {
  X, Calendar, MapPin, Gauge, Fuel, Users, CheckCircle,
  Tag, Clock, History, ArrowRight, User, ShieldCheck, FileText
} from 'lucide-react';
import vehicleService from '../../services/vehicle.service';

const statusColors = {
  AVAILABLE: '#10b981',
  RESERVED: '#f59e0b',
  RENTED: '#3b82f6',
  RETURNED: '#8b5cf6',
  INSPECTION: '#06b6d4',
  DAMAGED: '#ef4444',
  MAINTENANCE: '#ec4899',
};

export default function VehicleDetailsModal({ isOpen, onClose, vehicle, onOpenTransition }) {
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'history'
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  useEffect(() => {
    if (isOpen && vehicle?._id) {
      setActiveTab('details');
      fetchHistory(vehicle._id);
    }
  }, [isOpen, vehicle?._id]);

  const fetchHistory = async (id) => {
    setLoadingHistory(true);
    setHistoryError(null);
    try {
      const res = await vehicleService.getHistory(id);
      const historyData = res.data?.data?.history || res.data?.history || vehicle?.statusHistory || [];
      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (err) {
      // Fallback to vehicle's in-memory statusHistory if endpoint fails
      if (Array.isArray(vehicle?.statusHistory)) {
        setHistory([...vehicle.statusHistory].reverse());
      } else {
        setHistoryError('Failed to load transition audit history');
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!isOpen || !vehicle) return null;

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
        maxWidth: '680px',
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 700 }}>
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
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Registration: <strong style={{ color: '#fff' }}>{vehicle.registrationNumber}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {onOpenTransition && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTransition(vehicle);
                }}
                className="btn btn-primary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ShieldCheck size={14} /> Transition Status
              </button>
            )}
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('details')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: activeTab === 'details' ? '600' : '400',
              background: activeTab === 'details' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'details' ? '#818cf8' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <FileText size={16} /> Vehicle Specs
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: activeTab === 'history' ? '600' : '400',
              background: activeTab === 'history' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'history' ? '#818cf8' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <History size={16} /> Lifecycle Audit Log ({history.length})
          </button>
        </div>

        {/* TAB 1: VEHICLE DETAILS */}
        {activeTab === 'details' && (
          <>
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
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
          </>
        )}

        {/* TAB 2: LIFECYCLE AUDIT TRAIL */}
        {activeTab === 'history' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                Status Transition Timeline
              </h4>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Current: <strong style={{ color: statusColors[vehicle.status] || '#fff' }}>{vehicle.status}</strong>
              </span>
            </div>

            {loadingHistory ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading lifecycle history...
              </div>
            ) : historyError ? (
              <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5' }}>
                {historyError}
              </div>
            ) : history.length === 0 ? (
              <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed var(--border-color)' }}>
                <Clock size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
                <p style={{ color: '#cbd5e1', fontWeight: 500, margin: '0 0 0.25rem' }}>
                  No Transition History Recorded
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  Vehicle is currently in its initial status <strong>{vehicle.status}</strong>. Transitions performed via the state machine will appear here in chronological order.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {history.map((item, idx) => (
                  <div
                    key={item._id || idx}
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-color)',
                      position: 'relative',
                    }}
                  >
                    {/* Header: From -> To + Timestamp */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: `${statusColors[item.fromStatus] || '#64748b'}22`,
                          color: statusColors[item.fromStatus] || '#94a3b8',
                          border: `1px solid ${statusColors[item.fromStatus] || '#64748b'}55`,
                        }}>
                          {item.fromStatus}
                        </span>
                        <ArrowRight size={14} color="var(--text-muted)" />
                        <span style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: `${statusColors[item.toStatus] || '#10b981'}22`,
                          color: statusColors[item.toStatus] || '#34d399',
                          border: `1px solid ${statusColors[item.toStatus] || '#10b981'}55`,
                        }}>
                          {item.toStatus}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Clock size={13} />
                        {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}
                      </div>
                    </div>

                    {/* Reason */}
                    {item.reason && (
                      <div style={{ fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '0.3rem', fontWeight: 500 }}>
                        {item.reason}
                      </div>
                    )}

                    {/* Notes */}
                    {item.notes && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '0.4rem', background: 'rgba(0,0,0,0.2)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                        "{item.notes}"
                      </div>
                    )}

                    {/* Actor */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#818cf8', marginTop: '0.25rem' }}>
                      <User size={12} />
                      <span>Changed by: <strong>{item.changedBy || 'System'}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
