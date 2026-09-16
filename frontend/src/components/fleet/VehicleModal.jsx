import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

const VEHICLE_TYPES = ['HATCHBACK', 'SEDAN', 'SUV', 'LUXURY', 'ELECTRIC'];
const FUEL_TYPES = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG'];
const VEHICLE_CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'];
const VEHICLE_STATUSES = [
  'AVAILABLE',
  'RESERVED',
  'RENTED',
  'RETURNED',
  'INSPECTION',
  'DAMAGED',
  'MAINTENANCE',
];

export default function VehicleModal({ isOpen, onClose, onSave, vehicleToEdit }) {
  const initialForm = {
    registrationNumber: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vehicleType: 'SEDAN',
    fuelType: 'PETROL',
    pricePerDay: '',
    condition: 'EXCELLENT',
    status: 'AVAILABLE',
    city: 'Hyderabad',
    address: '',
    seatingCapacity: 5,
    mileage: 0,
    features: '',
  };

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (vehicleToEdit) {
      setForm({
        registrationNumber: vehicleToEdit.registrationNumber || '',
        make: vehicleToEdit.make || '',
        model: vehicleToEdit.model || '',
        year: vehicleToEdit.year || new Date().getFullYear(),
        vehicleType: vehicleToEdit.vehicleType || 'SEDAN',
        fuelType: vehicleToEdit.fuelType || 'PETROL',
        pricePerDay: vehicleToEdit.pricePerDay || '',
        condition: vehicleToEdit.condition || 'EXCELLENT',
        status: vehicleToEdit.status || 'AVAILABLE',
        city: vehicleToEdit.location?.city || 'Hyderabad',
        address: vehicleToEdit.location?.address || '',
        seatingCapacity: vehicleToEdit.seatingCapacity || 5,
        mileage: vehicleToEdit.mileage || 0,
        features: Array.isArray(vehicleToEdit.features) ? vehicleToEdit.features.join(', ') : '',
      });
    } else {
      setForm(initialForm);
    }
    setError(null);
  }, [vehicleToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!form.registrationNumber.trim()) {
      setError('Registration number is required');
      return;
    }
    if (!form.make.trim() || !form.model.trim()) {
      setError('Make and model are required');
      return;
    }
    if (!form.pricePerDay || Number(form.pricePerDay) <= 0) {
      setError('Please provide a valid price per day');
      return;
    }
    if (!form.city.trim()) {
      setError('City location is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        registrationNumber: form.registrationNumber.trim().toUpperCase(),
        make: form.make.trim(),
        model: form.model.trim(),
        year: Number(form.year),
        vehicleType: form.vehicleType,
        fuelType: form.fuelType,
        pricePerDay: Number(form.pricePerDay),
        condition: form.condition,
        status: form.status,
        location: {
          city: form.city.trim(),
          address: form.address.trim(),
        },
        seatingCapacity: Number(form.seatingCapacity),
        mileage: Number(form.mileage),
        features: form.features
          ? form.features.split(',').map((f) => f.trim()).filter(Boolean)
          : [],
      };

      await onSave(payload, vehicleToEdit?._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save vehicle');
    } finally {
      setSubmitting(false);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 600 }}>
            {vehicleToEdit ? 'Edit Vehicle Details' : 'Add New Fleet Vehicle'}
          </h2>
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
            fontSize: '0.9rem',
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Registration Number *
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={form.registrationNumber}
                onChange={handleChange}
                placeholder="e.g. TS09-AB-1234"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Make / Brand *
              </label>
              <input
                type="text"
                name="make"
                value={form.make}
                onChange={handleChange}
                placeholder="e.g. Hyundai, Toyota"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Model *
              </label>
              <input
                type="text"
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="e.g. Creta, Fortuner"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Year *
              </label>
              <input
                type="number"
                name="year"
                value={form.year}
                onChange={handleChange}
                min="1990"
                max={new Date().getFullYear() + 1}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Vehicle Type *
              </label>
              <select name="vehicleType" value={form.vehicleType} onChange={handleChange} style={inputStyle}>
                {VEHICLE_TYPES.map((t) => (
                  <option key={t} value={t} style={{ background: '#1e293b' }}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Fuel / Energy Type *
              </label>
              <select name="fuelType" value={form.fuelType} onChange={handleChange} style={inputStyle}>
                {FUEL_TYPES.map((f) => (
                  <option key={f} value={f} style={{ background: '#1e293b' }}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Price / Day (₹) *
              </label>
              <input
                type="number"
                name="pricePerDay"
                value={form.pricePerDay}
                onChange={handleChange}
                placeholder="e.g. 2500"
                min="0"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Condition
              </label>
              <select name="condition" value={form.condition} onChange={handleChange} style={inputStyle}>
                {VEHICLE_CONDITIONS.map((c) => (
                  <option key={c} value={c} style={{ background: '#1e293b' }}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Initial Status
              </label>
              <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
                {VEHICLE_STATUSES.map((s) => (
                  <option key={s} value={s} style={{ background: '#1e293b' }}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                City Location *
              </label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Hyderabad"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Seating Capacity
              </label>
              <input
                type="number"
                name="seatingCapacity"
                value={form.seatingCapacity}
                onChange={handleChange}
                min="1"
                max="20"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Mileage (km)
              </label>
              <input
                type="number"
                name="mileage"
                value={form.mileage}
                onChange={handleChange}
                min="0"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Address / Branch Hub
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="e.g. Hitec City Metro Station Parking"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Features (Comma-separated)
            </label>
            <input
              type="text"
              name="features"
              value={form.features}
              onChange={handleChange}
              placeholder="e.g. Sunroof, GPS, 360 Camera, Heated Seats"
              style={inputStyle}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#cbd5e1' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={16} />
              {submitting ? 'Saving...' : vehicleToEdit ? 'Update Vehicle' : 'Add to Fleet'}
            </button>
          </div>
        </form>
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
