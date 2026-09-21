import React, { useState, useEffect } from 'react';
import { X, Wrench, AlertCircle, RefreshCw, Calendar, DollarSign, ShieldAlert, Check } from 'lucide-react';
import vehicleService from '../../services/vehicle.service';

const SERVICE_TYPES = [
  'ROUTINE_SERVICE',
  'REPAIR',
  'INSPECTION',
  'OIL_CHANGE',
  'TIRE_ROTATION',
  'BRAKE_SERVICE',
  'ACCIDENT_REPAIR',
  'BODY_WORK',
  'BATTERY_SERVICE',
  'OTHER',
];

const PRIORITIES = [
  { value: 'LOW', label: 'Low', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  { value: 'MEDIUM', label: 'Medium', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  { value: 'HIGH', label: 'High', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)' },
  { value: 'CRITICAL', label: 'Critical', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
];

const STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function MaintenanceModal({ isOpen, onClose, onSave, recordToEdit, preselectedVehicle }) {
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  const [formData, setFormData] = useState({
    vehicleId: '',
    serviceType: 'ROUTINE_SERVICE',
    problemDescription: '',
    priority: 'MEDIUM',
    status: 'SCHEDULED',
    estimatedCost: '',
    actualCost: '',
    serviceProvider: 'In-House Fleet Workshop',
    performedBy: '',
    startDate: new Date().toISOString().split('T')[0],
    estimatedCompletionDate: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadFleetVehicles();
      if (recordToEdit) {
        setFormData({
          vehicleId: recordToEdit.vehicle?._id || recordToEdit.vehicle || '',
          serviceType: recordToEdit.serviceType || 'ROUTINE_SERVICE',
          problemDescription: recordToEdit.problemDescription || '',
          priority: recordToEdit.priority || 'MEDIUM',
          status: recordToEdit.status || 'SCHEDULED',
          estimatedCost: recordToEdit.estimatedCost ?? '',
          actualCost: recordToEdit.actualCost ?? '',
          serviceProvider: recordToEdit.serviceProvider || 'In-House Fleet Workshop',
          performedBy: recordToEdit.performedBy || '',
          startDate: recordToEdit.startDate ? new Date(recordToEdit.startDate).toISOString().split('T')[0] : '',
          estimatedCompletionDate: recordToEdit.estimatedCompletionDate ? new Date(recordToEdit.estimatedCompletionDate).toISOString().split('T')[0] : '',
          notes: recordToEdit.notes || '',
        });
      } else {
        setFormData({
          vehicleId: preselectedVehicle?._id || '',
          serviceType: 'ROUTINE_SERVICE',
          problemDescription: '',
          priority: 'MEDIUM',
          status: 'SCHEDULED',
          estimatedCost: '',
          actualCost: '',
          serviceProvider: 'In-House Fleet Workshop',
          performedBy: '',
          startDate: new Date().toISOString().split('T')[0],
          estimatedCompletionDate: '',
          notes: '',
        });
      }
      setError(null);
    }
  }, [isOpen, recordToEdit, preselectedVehicle]);

  const loadFleetVehicles = async () => {
    setLoadingVehicles(true);
    try {
      const res = await vehicleService.getAll({ limit: 100 });
      const list = res.data?.data || res.data || [];
      setVehicles(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Failed to load fleet vehicles for maintenance dropdown:', err.message);
    } finally {
      setLoadingVehicles(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicleId) {
      setError('Please select a fleet vehicle');
      return;
    }
    if (!formData.problemDescription.trim()) {
      setError('Problem description is required');
      return;
    }
    if (formData.estimatedCost === '' || Number(formData.estimatedCost) < 0) {
      setError('Please provide a valid estimated cost (>= 0)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        vehicleId: formData.vehicleId,
        serviceType: formData.serviceType,
        problemDescription: formData.problemDescription.trim(),
        priority: formData.priority,
        status: formData.status,
        estimatedCost: Number(formData.estimatedCost),
        actualCost: formData.actualCost !== '' ? Number(formData.actualCost) : undefined,
        serviceProvider: formData.serviceProvider.trim(),
        performedBy: formData.performedBy.trim(),
        startDate: formData.startDate || undefined,
        estimatedCompletionDate: formData.estimatedCompletionDate || undefined,
        notes: formData.notes.trim(),
      };

      await onSave(payload, recordToEdit?._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save maintenance request');
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(236, 72, 153, 0.15)', padding: '0.5rem', borderRadius: '10px' }}>
              <Wrench size={22} color="#ec4899" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                {recordToEdit ? `Edit Work Order: ${recordToEdit.maintenanceNumber || ''}` : 'Create Maintenance Request'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Schedule repair work, record labor &amp; parts costs, and auto-sync vehicle status.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
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

        <form onSubmit={handleSubmit}>
          {/* Vehicle Selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Target Fleet Vehicle *</label>
            <select
              value={formData.vehicleId}
              onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
              disabled={loadingVehicles || !!recordToEdit}
              style={inputStyle}
              required
            >
              <option value="" style={{ background: '#0f172a' }}>-- Select Vehicle --</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id} style={{ background: '#0f172a' }}>
                  {v.make} {v.model} ({v.registrationNumber}) • Status: {v.status}
                </option>
              ))}
            </select>
          </div>

          {/* Service Type & Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Service Category *</label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                style={inputStyle}
                required
              >
                {SERVICE_TYPES.map((type) => (
                  <option key={type} value={type} style={{ background: '#0f172a' }}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Maintenance Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={inputStyle}
                required
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status} style={{ background: '#0f172a' }}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority Chips */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Severity / Priority</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {PRIORITIES.map((pri) => {
                const isSelected = formData.priority === pri.value;
                return (
                  <button
                    key={pri.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: pri.value })}
                    style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: '8px',
                      border: `1.5px solid ${isSelected ? pri.color : 'rgba(255, 255, 255, 0.1)'}`,
                      background: isSelected ? pri.bg : 'rgba(255, 255, 255, 0.02)',
                      color: isSelected ? pri.color : 'var(--text-muted)',
                      fontWeight: isSelected ? '700' : '400',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isSelected && <Check size={14} />}
                    {pri.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Problem Description */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Problem Description / Work Required *</label>
            <textarea
              rows="3"
              placeholder="e.g. Engine check light on, grinding noise when braking at highway speeds"
              value={formData.problemDescription}
              onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
              style={{ ...inputStyle, resize: 'vertical' }}
              required
            />
          </div>

          {/* Estimated Cost & Actual Cost */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Estimated Cost (₹) *</label>
              <input
                type="number"
                min="0"
                step="50"
                placeholder="e.g. 3500"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Actual Final Cost (₹)</label>
              <input
                type="number"
                min="0"
                step="50"
                placeholder="Filled upon completion"
                value={formData.actualCost}
                onChange={(e) => setFormData({ ...formData, actualCost: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Start / Drop-off Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Est. Completion Date</label>
              <input
                type="date"
                value={formData.estimatedCompletionDate}
                onChange={(e) => setFormData({ ...formData, estimatedCompletionDate: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Service Provider & Performed By */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Workshop / Service Provider</label>
              <input
                type="text"
                placeholder="e.g. Bosch Car Care, authorized dealership"
                value={formData.serviceProvider}
                onChange={(e) => setFormData({ ...formData, serviceProvider: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Technician / Mechanic Name</label>
              <input
                type="text"
                placeholder="e.g. Rajesh Kumar"
                value={formData.performedBy}
                onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Staff / Diagnostic Notes (Optional)</label>
            <textarea
              rows="2"
              placeholder="e.g. Oil filter replaced, brake pads warranty 6 months"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#cbd5e1' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {loading && <RefreshCw size={16} className="spin" />}
              {loading ? 'Saving...' : recordToEdit ? 'Update Work Order' : 'Create Work Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '0.85rem',
  color: 'var(--text-muted)',
  marginBottom: '0.4rem',
  fontWeight: 500,
};

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
