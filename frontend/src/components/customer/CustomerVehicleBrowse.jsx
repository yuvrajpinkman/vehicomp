import React, { useState, useEffect, useCallback } from 'react';
import vehicleService from '../../services/vehicle.service';
import ReservationModal from './ReservationModal';
import {
  Car, Search, Filter, Calendar, MapPin, Zap, Fuel, Users,
  CheckCircle, AlertCircle, Info, ArrowRight, ShieldCheck, X, RefreshCw, DollarSign, Sparkles
} from 'lucide-react';

const VEHICLE_TYPES = ['ALL', 'HATCHBACK', 'SEDAN', 'SUV', 'LUXURY', 'ELECTRIC'];
const FUEL_TYPES = ['ALL', 'PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG'];
const CITIES = ['ALL', 'Hyderabad', 'Bengaluru', 'Mumbai', 'Delhi', 'Pune'];

export default function CustomerVehicleBrowse({ onNavigateToReservations }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reservationTargetVehicle, setReservationTargetVehicle] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedFuel, setSelectedFuel] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [maxPrice, setMaxPrice] = useState(10000);

  // Date Selection for Availability
  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(nextWeekStr);

  // Modal State
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availabilityData, setAvailabilityData] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Fetch Vehicles
  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { status: 'AVAILABLE' };
      if (selectedType !== 'ALL') params.vehicleType = selectedType;
      if (selectedFuel !== 'ALL') params.fuelType = selectedFuel;
      if (selectedCity !== 'ALL') params.city = selectedCity;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (maxPrice < 10000) params.maxPrice = maxPrice;

      const response = await vehicleService.getAll(params);
      const vehicleList = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      setVehicles(vehicleList);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load vehicle catalog');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedFuel, selectedCity, searchTerm, maxPrice]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Handle View Details & Check Availability
  const handleOpenDetails = async (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
    setCheckingAvailability(true);
    setAvailabilityData(null);
    try {
      const res = await vehicleService.checkAvailability(vehicle._id, startDate, endDate);
      setAvailabilityData(res.data?.data || res.data || res);
    } catch (err) {
      setAvailabilityData({
        available: false,
        reason: err.response?.data?.message || err.message || 'Could not verify dates',
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Re-check availability on date change in modal
  const handleDateCheck = async () => {
    if (!selectedVehicle) return;
    setCheckingAvailability(true);
    try {
      const res = await vehicleService.checkAvailability(selectedVehicle._id, startDate, endDate);
      setAvailabilityData(res.data?.data || res.data || res);
    } catch (err) {
      setAvailabilityData({
        available: false,
        reason: err.response?.data?.message || err.message || 'Date verification error',
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const getVehicleBadgeStyle = (type) => {
    switch (type) {
      case 'ELECTRIC':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)', icon: <Zap size={13} /> };
      case 'LUXURY':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)', icon: <Sparkles size={13} /> };
      case 'SUV':
        return { bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.3)', icon: <Car size={13} /> };
      default:
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)', icon: <Car size={13} /> };
    }
  };

  return (
    <div style={{ paddingBottom: '2rem' }}>
      {/* Hero Banner Header */}
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem 2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '16px',
        }}
      >
        <div style={{ maxWidth: '800px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '20px',
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#c7d2fe',
              fontSize: '0.8rem',
              fontWeight: '600',
              marginBottom: '1rem',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            <Sparkles size={14} /> Customer Vehicle Browsing
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', lineHeight: 1.2, margin: '0 0 0.5rem 0' }}>
            Find &amp; Reserve Your Ideal Ride
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0, lineHeight: 1.5 }}>
            Browse live fleet inventory, filter by vehicle type, fuel efficiency, price, and instant date availability.
          </p>
        </div>

        {/* Quick Search & Travel Dates Bar */}
        <div
          style={{
            marginTop: '1.75rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>
              SEARCH VEHICLE
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Make, model, or feature..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Pickup Date */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>
              PICKUP DATE
            </label>
            <input
              type="date"
              min={todayStr}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Return Date */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>
              RETURN DATE
            </label>
            <input
              type="date"
              min={startDate || todayStr}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* City Location */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>
              LOCATION / CITY
            </label>
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} style={selectStyle}>
              {CITIES.map((c) => (
                <option key={c} value={c} style={{ background: '#0f172a' }}>
                  {c === 'ALL' ? '📍 All Cities' : `📍 ${c}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Toolbar Filter Section */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Row 1: Vehicle Types */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', minWidth: '90px' }}>Vehicle Category:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {VEHICLE_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: selectedType === type ? '700' : '500',
                    background: selectedType === type ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'rgba(255, 255, 255, 0.05)',
                    color: selectedType === type ? '#fff' : 'var(--text-muted)',
                    border: '1px solid',
                    borderColor: selectedType === type ? '#6366f1' : 'var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Fuel Type & Price Slider */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.85rem' }}>
            
            {/* Fuel Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Fuel size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 500 }}>Fuel Type:</span>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {FUEL_TYPES.map((fuel) => (
                  <button
                    key={fuel}
                    onClick={() => setSelectedFuel(fuel)}
                    style={{
                      padding: '0.3rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      background: selectedFuel === fuel ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      color: selectedFuel === fuel ? '#34d399' : 'var(--text-muted)',
                      border: '1px solid',
                      borderColor: selectedFuel === fuel ? 'rgba(16, 185, 129, 0.4)' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    {fuel}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 500 }}>
                Max Price: <strong style={{ color: '#34d399' }}>₹{maxPrice.toLocaleString()}/day</strong>
              </span>
              <input
                type="range"
                min="1000"
                max="10000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ cursor: 'pointer', accentColor: '#6366f1', width: '130px' }}
              />
              {maxPrice < 10000 && (
                <button
                  onClick={() => setMaxPrice(10000)}
                  style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Reset Price
                </button>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchVehicles}
              disabled={loading}
              className="btn"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Catalog
            </button>
          </div>

        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5', marginBottom: '1.5rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Vehicle Cards Grid */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="spin" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
          <p style={{ fontSize: '1rem' }}>Searching available fleet inventory...</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '16px' }}>
          <Car size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>No Vehicles Found</h3>
          <p style={{ fontSize: '0.9rem', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
            We couldn't find any vehicles matching your search criteria. Try adjusting your filters or price limit.
          </p>
          <button
            onClick={() => {
              setSelectedType('ALL');
              setSelectedFuel('ALL');
              setSelectedCity('ALL');
              setSearchTerm('');
              setMaxPrice(10000);
            }}
            className="btn btn-primary"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {vehicles.map((v) => {
            const badge = getVehicleBadgeStyle(v.vehicleType);
            return (
              <div
                key={v._id}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(30, 41, 59, 0.4)',
                }}
              >
                <div>
                  {/* Card Header: Type Badge & Price */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        background: badge.bg,
                        color: badge.text,
                        border: `1px solid ${badge.border}`,
                      }}
                    >
                      {badge.icon}
                      {v.vehicleType}
                    </span>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#34d399', lineHeight: 1.1 }}>
                        ₹{v.pricePerDay?.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>per day</div>
                    </div>
                  </div>

                  {/* Vehicle Graphic Placeholder / Image */}
                  <div
                    style={{
                      height: '140px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.7))',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {v.images && v.images.length > 0 && v.images[0].startsWith('http') ? (
                      <img src={v.images[0]} alt={v.model} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <>
                        <Car size={54} color="#6366f1" style={{ opacity: 0.8 }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                          {v.make} • {v.model}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Vehicle Name & Specs */}
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', margin: '0 0 0.35rem 0' }}>
                    {v.make} {v.model}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
                    Year {v.year} • Condition: <span style={{ color: '#a5b4fc', fontWeight: 600 }}>{v.condition}</span>
                  </p>

                  {/* Key Highlights Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.6rem', borderRadius: '6px' }}>
                      <Fuel size={14} color="#38bdf8" />
                      <span>{v.fuelType}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.6rem', borderRadius: '6px' }}>
                      <Users size={14} color="#a78bfa" />
                      <span>{v.seatingCapacity || 5} Seats</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.6rem', borderRadius: '6px', gridColumn: 'span 2' }}>
                      <MapPin size={14} color="#f472b6" />
                      <span>{v.location?.city || 'Hyderabad'} ({v.location?.address || 'City Hub'})</span>
                    </div>
                  </div>

                  {/* Feature Tags (First 3) */}
                  {v.features && v.features.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
                      {v.features.slice(0, 3).map((f, i) => (
                        <span key={i} style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.1)', color: '#c7d2fe', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                          ✓ {f}
                        </span>
                      ))}
                      {v.features.length > 3 && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>+{v.features.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Button */}
                <button
                  onClick={() => handleOpenDetails(v)}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                  }}
                >
                  View Specs &amp; Check Dates <ArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Vehicle Details & Date Availability Modal */}
      {isModalOpen && selectedVehicle && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '20px',
              padding: '2rem',
              background: '#0f172a',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              position: 'relative',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: '#fff',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span className="status-badge online" style={{ marginBottom: '0.5rem', display: 'inline-flex', gap: '0.3rem' }}>
                <CheckCircle size={14} /> Verified Vehicle Specifications
              </span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0.25rem 0' }}>
                {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                Registration: <code style={{ color: '#93c5fd' }}>{selectedVehicle.registrationNumber}</code> • City: <strong>{selectedVehicle.location?.city}</strong>
              </p>
            </div>

            {/* Date Range Picker & Pricing Estimation Box */}
            <div
              style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '14px',
                padding: '1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#c7d2fe', margin: '0 0 0.85rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={18} color="#818cf8" /> Select Rental Duration &amp; Calculate Price
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>
                    START DATE
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: 600 }}>
                    END DATE
                  </label>
                  <input
                    type="date"
                    min={startDate || todayStr}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <button
                onClick={handleDateCheck}
                disabled={checkingAvailability}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', marginBottom: '1rem' }}
              >
                {checkingAvailability ? 'Checking Availability...' : 'Re-check Date Availability'}
              </button>

              {/* Availability Results Banner */}
              {checkingAvailability ? (
                <div style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <RefreshCw size={16} className="spin" /> Verifying backend availability API...
                </div>
              ) : availabilityData ? (
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    background: availabilityData.available ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid',
                    borderColor: availabilityData.available ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: availabilityData.available ? '#34d399' : '#fca5a5' }}>
                    {availabilityData.available ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {availabilityData.available ? 'Vehicle Available For Selected Dates!' : 'Vehicle Not Available'}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0.75rem 0' }}>
                    {availabilityData.reason}
                  </p>

                  {availabilityData.available && (
                    <div style={{ borderTop: '1px dashed rgba(255,255,255,0.15)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                          Duration: <strong>{availabilityData.rentalDays} Days</strong> (₹{availabilityData.pricePerDay}/day)
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ESTIMATED TOTAL</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#34d399' }}>
                          ₹{availabilityData.estimatedTotal?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Detailed Vehicle Specs Table */}
            <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.75rem' }}>Vehicle Specifications</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              <div style={specBoxStyle}>
                <span style={{ color: 'var(--text-muted)' }}>Vehicle Type:</span>
                <strong style={{ color: '#fff' }}>{selectedVehicle.vehicleType}</strong>
              </div>
              <div style={specBoxStyle}>
                <span style={{ color: 'var(--text-muted)' }}>Fuel / Power:</span>
                <strong style={{ color: '#fff' }}>{selectedVehicle.fuelType}</strong>
              </div>
              <div style={specBoxStyle}>
                <span style={{ color: 'var(--text-muted)' }}>Daily Rate:</span>
                <strong style={{ color: '#34d399' }}>₹{selectedVehicle.pricePerDay?.toLocaleString()}</strong>
              </div>
              <div style={specBoxStyle}>
                <span style={{ color: 'var(--text-muted)' }}>Seating:</span>
                <strong style={{ color: '#fff' }}>{selectedVehicle.seatingCapacity || 5} Persons</strong>
              </div>
              <div style={specBoxStyle}>
                <span style={{ color: 'var(--text-muted)' }}>Mileage:</span>
                <strong style={{ color: '#fff' }}>{selectedVehicle.mileage ? `${selectedVehicle.mileage} km` : 'Low Mileage'}</strong>
              </div>
              <div style={specBoxStyle}>
                <span style={{ color: 'var(--text-muted)' }}>Condition:</span>
                <strong style={{ color: '#a5b4fc' }}>{selectedVehicle.condition}</strong>
              </div>
            </div>

            {/* Features List */}
            {selectedVehicle.features && selectedVehicle.features.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.5rem' }}>Included Features &amp; Amenities</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedVehicle.features.map((feat, idx) => (
                    <span key={idx} style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', fontSize: '0.8rem', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)' }}>
                      ✨ {feat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.25rem' }}>
              <button onClick={() => setIsModalOpen(false)} className="btn" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}>
                Close
              </button>
              <button
                disabled={!availabilityData?.available}
                onClick={() => {
                  setReservationTargetVehicle(selectedVehicle);
                  setIsModalOpen(false);
                }}
                className="btn btn-primary"
                style={{ opacity: availabilityData?.available ? 1 : 0.5 }}
              >
                Proceed to Book Vehicle
              </button>
            </div>

          </div>
        </div>
      )}

      {reservationTargetVehicle && (
        <ReservationModal
          vehicle={reservationTargetVehicle}
          onClose={() => setReservationTargetVehicle(null)}
          onSuccess={(resData) => {
            alert(`Reservation #${resData.reservationNumber || resData._id} confirmed successfully!`);
            if (onNavigateToReservations) {
              onNavigateToReservations();
            }
          }}
        />
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '0.85rem',
  outline: 'none',
};

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
};

const specBoxStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  background: 'rgba(255,255,255,0.03)',
  padding: '0.6rem 0.8rem',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.05)',
};
