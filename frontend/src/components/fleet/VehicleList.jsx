import React, { useState, useEffect, useCallback } from 'react';
import vehicleService from '../../services/vehicle.service';
import VehicleModal from './VehicleModal';
import VehicleDetailsModal from './VehicleDetailsModal';
import {
  Car, Plus, Search, Filter, RefreshCw, Edit2, Trash2, Eye,
  CheckCircle, AlertTriangle, Power, ArrowUpDown
} from 'lucide-react';

const VEHICLE_TYPES = ['ALL', 'HATCHBACK', 'SEDAN', 'SUV', 'LUXURY', 'ELECTRIC'];
const VEHICLE_STATUSES = [
  'ALL',
  'AVAILABLE',
  'RESERVED',
  'RENTED',
  'RETURNED',
  'INSPECTION',
  'DAMAGED',
  'MAINTENANCE',
];

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState(null);
  const [detailsVehicle, setDetailsVehicle] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch vehicles
  const loadVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedType !== 'ALL') params.vehicleType = selectedType;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const response = await vehicleService.getAll(params);
      setVehicles(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedStatus, searchTerm]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // Handle Save (Add / Edit)
  const handleSaveVehicle = async (payload, id) => {
    if (id) {
      await vehicleService.update(id, payload);
    } else {
      await vehicleService.create(payload);
    }
    await loadVehicles();
  };

  // Handle Quick Status Change
  const handleStatusChange = async (id, newStatus) => {
    try {
      await vehicleService.updateStatus(id, newStatus);
      setVehicles((prev) =>
        prev.map((v) => (v._id === id ? { ...v, status: newStatus } : v))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update vehicle status');
    }
  };

  // Handle Toggle Active
  const handleToggleActive = async (id, currentActive) => {
    try {
      const response = await vehicleService.toggleActive(id, !currentActive);
      setVehicles((prev) =>
        prev.map((v) => (v._id === id ? { ...v, isActive: !currentActive } : v))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update vehicle active state');
    }
  };

  // Handle Delete
  const handleDelete = async (id, reg) => {
    if (!window.confirm(`Are you sure you want to remove vehicle ${reg} from the fleet?`)) return;
    try {
      await vehicleService.delete(id);
      setVehicles((prev) => prev.filter((v) => v._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete vehicle');
    }
  };

  const statusBadgeColor = (status) => {
    switch (status) {
      case 'AVAILABLE': return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
      case 'RESERVED': return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
      case 'RENTED': return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
      case 'RETURNED': return { bg: 'rgba(139, 92, 246, 0.15)', text: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)' };
      case 'INSPECTION': return { bg: 'rgba(6, 182, 212, 0.15)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)' };
      case 'DAMAGED': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
      case 'MAINTENANCE': return { bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6', border: 'rgba(236, 72, 153, 0.3)' };
      default: return { bg: 'rgba(255, 255, 255, 0.1)', text: '#cbd5e1', border: 'rgba(255, 255, 255, 0.2)' };
    }
  };

  return (
    <div>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Car size={24} color="var(--primary)" /> Fleet Inventory Management
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Add, update, deactivate, and track real-time statuses across the vehicle fleet.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn" onClick={loadVehicles} disabled={loading} style={{ background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setVehicleToEdit(null);
              setIsModalOpen(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={18} /> Add Vehicle
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '360px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search make, model, reg..."
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

          {/* Type Filter Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.3rem' }}>Type:</span>
            {VEHICLE_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: selectedType === type ? '600' : '400',
                  background: selectedType === type ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedType === type ? '#fff' : 'var(--text-muted)',
                  border: '1px solid',
                  borderColor: selectedType === type ? 'var(--primary)' : 'var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {type}
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
              {VEHICLE_STATUSES.map((status) => (
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

      {/* Vehicles Table */}
      <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '1rem' }}>Vehicle</th>
              <th style={{ padding: '1rem' }}>Reg. Number</th>
              <th style={{ padding: '1rem' }}>Type &amp; Fuel</th>
              <th style={{ padding: '1rem' }}>Daily Rate</th>
              <th style={{ padding: '1rem' }}>Location</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Active</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && vehicles.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading fleet inventory...
                </td>
              </tr>
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No vehicles found matching current criteria. Click <strong>"Add Vehicle"</strong> to create one.
                </td>
              </tr>
            ) : (
              vehicles.map((v) => {
                const sBadge = statusBadgeColor(v.status);
                return (
                  <tr
                    key={v._id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      opacity: v.isActive ? 1 : 0.6,
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                        {v.make} {v.model}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Year: {v.year} • {v.condition}
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <code style={{ background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                        {v.registrationNumber}
                      </code>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: '#a5b4fc',
                        marginRight: '0.4rem',
                      }}>
                        {v.vehicleType}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.fuelType}</span>
                    </td>

                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--accent-emerald)' }}>
                      ₹{v.pricePerDay?.toLocaleString()}
                    </td>

                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {v.location?.city}
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <select
                        value={v.status}
                        onChange={(e) => handleStatusChange(v._id, e.target.value)}
                        style={{
                          background: sBadge.bg,
                          color: sBadge.text,
                          border: `1px solid ${sBadge.border}`,
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        {VEHICLE_STATUSES.filter((s) => s !== 'ALL').map((status) => (
                          <option key={status} value={status} style={{ background: '#0f172a', color: '#fff' }}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => handleToggleActive(v._id, v.isActive)}
                        title={v.isActive ? 'Deactivate vehicle' : 'Activate vehicle'}
                        style={{
                          background: v.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: v.isActive ? '#34d399' : '#f87171',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.3rem 0.6rem',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                      >
                        <Power size={12} />
                        {v.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button
                          onClick={() => {
                            setDetailsVehicle(v);
                            setIsDetailsOpen(true);
                          }}
                          title="View Details"
                          style={iconBtnStyle}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setVehicleToEdit(v);
                            setIsModalOpen(true);
                          }}
                          title="Edit Vehicle"
                          style={iconBtnStyle}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(v._id, v.registrationNumber)}
                          title="Delete Vehicle"
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

      {/* Add / Edit Modal */}
      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVehicle}
        vehicleToEdit={vehicleToEdit}
      />

      {/* Details Modal */}
      <VehicleDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        vehicle={detailsVehicle}
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
