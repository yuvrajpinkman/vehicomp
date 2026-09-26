import React, { useState, useEffect, useCallback } from 'react';
import maintenanceService from '../../services/maintenance.service';
import MaintenanceModal from './MaintenanceModal';
import MaintenanceDetailsModal from './MaintenanceDetailsModal';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  AlertCircle,
  Activity,
  Check,
  X,
} from 'lucide-react';

const STATUS_FILTERS = ['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const PRIORITY_FILTERS = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function MaintenanceList() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [detailsRecord, setDetailsRecord] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Quick Complete Modal State
  const [completingRecord, setCompletingRecord] = useState(null);
  const [quickActualCost, setQuickActualCost] = useState('');
  const [completingLoading, setCompletingLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (selectedPriority !== 'ALL') params.priority = selectedPriority;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const [listRes, statsRes] = await Promise.all([
        maintenanceService.getAll(params),
        maintenanceService.getStats().catch(() => ({ data: { data: null } })),
      ]);

      const raw = listRes.data?.data || listRes.data || [];
      const list = Array.isArray(raw) ? raw : (raw.maintenance || raw.records || []);
      setRecords(Array.isArray(list) ? list : []);

      const s = statsRes.data?.data || statsRes.data || null;
      setStats(s);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load maintenance records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, selectedPriority, searchTerm]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Save (Create or Update)
  const handleSave = async (payload, id) => {
    if (id) {
      await maintenanceService.update(id, payload);
    } else {
      await maintenanceService.create(payload);
    }
    await loadData();
  };

  // Handle Quick Complete
  const handleQuickComplete = async (id, actualCost) => {
    try {
      await maintenanceService.update(id, {
        status: 'COMPLETED',
        actualCost: Number(actualCost) || 0,
      });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to complete maintenance work order');
    }
  };

  // Handle Delete
  const handleDelete = async (id, mNum) => {
    if (!window.confirm(`Are you sure you want to remove work order ${mNum || 'this record'}?`)) return;
    try {
      await maintenanceService.delete(id);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to delete maintenance record');
    }
  };

  const priorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return { text: '#f87171', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' };
      case 'HIGH':
        return { text: '#fb923c', bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.3)' };
      case 'MEDIUM':
        return { text: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' };
      case 'LOW':
      default:
        return { text: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' };
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return { text: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' };
      case 'IN_PROGRESS':
        return { text: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' };
      case 'SCHEDULED':
        return { text: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.3)' };
      case 'CANCELLED':
      default:
        return { text: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', border: 'rgba(148, 163, 184, 0.3)' };
    }
  };

  const recordList = Array.isArray(records) ? records : [];

  return (
    <div>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Wrench size={24} color="#ec4899" /> Fleet Maintenance &amp; Repair Center
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Schedule repairs, track actual vs estimated costs, and enforce automated vehicle booking locks.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn" onClick={loadData} disabled={loading} style={{ background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setRecordToEdit(null);
              setIsModalOpen(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #ec4899, #be185d)' }}
          >
            <Plus size={18} /> Schedule Maintenance
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div className="glass-panel" style={{ padding: '1.1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active In Workshop</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#fbbf24', marginTop: '0.25rem' }}>
              {stats.inProgress || 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vehicles currently locked</span>
          </div>

          <div className="glass-panel" style={{ padding: '1.1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Scheduled Jobs</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#38bdf8', marginTop: '0.25rem' }}>
              {stats.scheduled || 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Upcoming servicing</span>
          </div>

          <div className="glass-panel" style={{ padding: '1.1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Completed Repairs</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#34d399', marginTop: '0.25rem' }}>
              {stats.completed || 0}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Released back to fleet</span>
          </div>

          <div className="glass-panel" style={{ padding: '1.1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Maintenance Spend</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#f472b6', marginTop: '0.25rem' }}>
              ₹{(stats.totalActualCost || stats.totalEstimatedCost || 0).toLocaleString()}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cumulative fleet repairs</span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '360px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search work order, reg, issue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem 0.6rem 2.4rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Priority Filter Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.3rem' }}>Priority:</span>
            {PRIORITY_FILTERS.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: selectedPriority === p ? '600' : '400',
                  background: selectedPriority === p ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedPriority === p ? '#fff' : 'var(--text-muted)',
                  border: '1px solid',
                  borderColor: selectedPriority === p ? 'var(--primary)' : 'var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Status Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: '0.55rem 0.85rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            >
              {STATUS_FILTERS.map((status) => (
                <option key={status} value={status} style={{ background: '#0f172a' }}>
                  {status === 'ALL' ? 'All Statuses' : status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{
          padding: '1rem',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#fca5a5',
          marginBottom: '1.5rem',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Work Orders Table */}
      <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '1rem' }}>Work Order</th>
              <th style={{ padding: '1rem' }}>Vehicle</th>
              <th style={{ padding: '1rem' }}>Problem &amp; Service</th>
              <th style={{ padding: '1rem' }}>Priority</th>
              <th style={{ padding: '1rem' }}>Cost (Est / Act)</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Service Provider</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && recordList.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading maintenance work orders...
                </td>
              </tr>
            ) : recordList.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No maintenance records found. Click <strong>"Schedule Maintenance"</strong> to record a service job.
                </td>
              </tr>
            ) : (
              recordList.map((m) => {
                const veh = typeof m.vehicle === 'object' && m.vehicle !== null ? m.vehicle : {};
                const makeModel = veh.make && veh.model ? `${veh.make} ${veh.model}` : (typeof m.vehicle === 'string' ? `Vehicle (${m.vehicle.slice(-6)})` : 'Fleet Vehicle');
                const regNum = veh.registrationNumber || (typeof m.vehicle === 'string' ? m.vehicle : 'N/A');
                const vehStatus = veh.status || 'MAINTENANCE';

                const pBadge = priorityBadge(m.priority);
                const sBadge = statusBadge(m.status);

                return (
                  <tr
                    key={m._id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '1rem' }}>
                      <code style={{ background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.8rem', color: '#93c5fd' }}>
                        {m.maintenanceNumber}
                      </code>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {m.startDate ? new Date(m.startDate).toLocaleDateString() : ''}
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                        {makeModel}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Reg: <code style={{ color: '#fff' }}>{regNum}</code> • {vehStatus}
                      </div>
                    </td>

                    <td style={{ padding: '1rem', maxWidth: '240px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: '#c7d2fe',
                        marginBottom: '0.25rem',
                      }}>
                        {m.serviceType?.replace(/_/g, ' ')}
                      </span>
                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={m.problemDescription}>
                        {m.problemDescription}
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: pBadge.bg,
                        color: pBadge.text,
                        border: `1px solid ${pBadge.border}`,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}>
                        {m.priority}
                      </span>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 600 }}>
                        ₹{m.estimatedCost?.toLocaleString() || 0}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: m.actualCost ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                        Act: ₹{m.actualCost?.toLocaleString() || '—'}
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: sBadge.bg,
                        color: sBadge.text,
                        border: `1px solid ${sBadge.border}`,
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}>
                        {m.status}
                      </span>
                    </td>

                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <div>{m.serviceProvider || 'In-House'}</div>
                      {m.performedBy && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tech: {m.performedBy}</div>}
                    </td>

                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        {m.status !== 'COMPLETED' && (
                          <button
                            onClick={() => {
                              setCompletingRecord(m);
                              setQuickActualCost(m.actualCost || m.estimatedCost || '');
                            }}
                            title="Quick Complete & Release Vehicle"
                            style={{ ...iconBtnStyle, color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                          >
                            <Check size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setDetailsRecord(m);
                            setIsDetailsOpen(true);
                          }}
                          title="View Details"
                          style={iconBtnStyle}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setRecordToEdit(m);
                            setIsModalOpen(true);
                          }}
                          title="Edit Work Order"
                          style={iconBtnStyle}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(m._id, m.maintenanceNumber)}
                          title="Delete Record"
                          style={{ ...iconBtnStyle, color: '#f87171' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Quick Complete Confirmation Modal */}
      {completingRecord && (
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
            maxWidth: '480px',
            width: '100%',
            padding: '1.75rem',
            borderRadius: '16px',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            background: '#0f172a',
            color: '#f8fafc',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.5rem', borderRadius: '10px' }}>
                  <CheckCircle size={22} color="#34d399" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                    Complete Work Order
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#93c5fd', fontFamily: 'monospace' }}>
                    {completingRecord.maintenanceNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setCompletingRecord(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Marking this service job as <strong style={{ color: '#34d399' }}>COMPLETED</strong> will automatically release vehicle{' '}
              <strong style={{ color: '#fff' }}>
                {typeof completingRecord.vehicle === 'object' && completingRecord.vehicle !== null
                  ? `${completingRecord.vehicle.make} ${completingRecord.vehicle.model}`
                  : 'Fleet Vehicle'}
              </strong>{' '}
              back to <span style={{ color: '#34d399', fontWeight: 600 }}>AVAILABLE</span> status in the fleet inventory.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 500 }}>
                Actual Final Repair Cost (₹)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                placeholder={`Estimated: ₹${completingRecord.estimatedCost || 0}`}
                value={quickActualCost}
                onChange={(e) => setQuickActualCost(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setCompletingRecord(null)}
                className="btn"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#cbd5e1' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={completingLoading}
                onClick={async () => {
                  setCompletingLoading(true);
                  try {
                    await handleQuickComplete(completingRecord._id, quickActualCost);
                    setCompletingRecord(null);
                  } finally {
                    setCompletingLoading(false);
                  }
                }}
                className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {completingLoading && <RefreshCw size={16} className="spin" />}
                {completingLoading ? 'Releasing...' : 'Mark Completed & Release'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <MaintenanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        recordToEdit={recordToEdit}
      />

      {/* Details Modal */}
      <MaintenanceDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        record={detailsRecord}
        onEdit={(rec) => {
          setRecordToEdit(rec);
          setIsModalOpen(true);
        }}
        onComplete={handleQuickComplete}
      />
    </div>
  );
}

const iconBtnStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid var(--border-color)',
  borderRadius: '6px',
  color: 'var(--text-muted)',
  padding: '0.4rem',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};
