import React, { useState, useEffect } from 'react';
import { getRecommendations } from '../../services/recommendation.service';
import {
  Sparkles,
  Search,
  SlidersHorizontal,
  MapPin,
  Fuel,
  Star,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Compass,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Info,
} from 'lucide-react';

const PRESET_WEIGHTS = {
  balanced: {
    label: 'Balanced (Standard)',
    description: 'Equally balances budget, vehicle condition, distance & reviews',
    weights: { price: 0.30, rating: 0.25, condition: 0.20, distance: 0.15, fuel: 0.10 },
  },
  budget: {
    label: 'Best Budget',
    description: 'Prioritizes lowest cost and high value-for-money deals',
    weights: { price: 0.55, rating: 0.15, condition: 0.15, distance: 0.10, fuel: 0.05 },
  },
  distance: {
    label: 'Closest to Me',
    description: 'Prioritizes vehicles parked nearest to your location',
    weights: { price: 0.20, rating: 0.15, condition: 0.10, distance: 0.45, fuel: 0.10 },
  },
  rating: {
    label: 'Highest Customer Rating',
    description: 'Prioritizes vehicles with top customer feedback & star ratings',
    weights: { price: 0.15, rating: 0.50, condition: 0.20, distance: 0.10, fuel: 0.05 },
  },
  eco: {
    label: 'Eco-Friendly & Modern',
    description: 'Favors Electric & Hybrid vehicles in mint condition',
    weights: { price: 0.15, rating: 0.15, condition: 0.25, distance: 0.10, fuel: 0.35 },
  },
};

const VehicleRecommendations = ({ onSelectVehicle, onNavigateToBrowse }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search Criteria State
  const [vehicleType, setVehicleType] = useState('ALL');
  const [city, setCity] = useState('Hyderabad');
  const [minPrice, setMinPrice] = useState(1500);
  const [maxPrice, setMaxPrice] = useState(4000);
  const [preferredFuel, setPreferredFuel] = useState('ANY');
  const [preset, setPreset] = useState('balanced');
  const [showBreakdownId, setShowBreakdownId] = useState(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const activeWeights = PRESET_WEIGHTS[preset].weights;
      const res = await getRecommendations(
        {
          vehicleType: vehicleType !== 'ALL' ? vehicleType : undefined,
          city: city.trim() ? city.trim() : undefined,
          minPrice: Number(minPrice) || undefined,
          maxPrice: Number(maxPrice) || undefined,
          preferredFuel: preferredFuel !== 'ANY' ? preferredFuel : undefined,
        },
        { weights: activeWeights, limit: 20 }
      );

      if (res && res.data) {
        setVehicles(res.data);
      } else {
        setVehicles([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [preset]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecommendations();
  };

  return (
    <div style={{ color: '#fff' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.75rem', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <Sparkles size={16} /> Stage 6 — Multi-Attribute Recommendation Engine
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
            Smart Vehicle Matcher & Ranking
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.4rem', margin: 0 }}>
            Find optimal fleet vehicles mathematically ranked by Price, Distance, Reviews, Condition & Fuel type.
          </p>
        </div>

        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="btn"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.1rem',
            borderRadius: '10px',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Recalculate Scores
        </button>
      </div>

      {/* Interactive Criteria & Custom Weighting Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            
            {/* Vehicle Type */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>
                Vehicle Category
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  fontSize: '0.9rem',
                }}
              >
                <option value="ALL" style={{ background: '#1e293b' }}>All Categories</option>
                <option value="SUV" style={{ background: '#1e293b' }}>SUV</option>
                <option value="SEDAN" style={{ background: '#1e293b' }}>Sedan</option>
                <option value="HATCHBACK" style={{ background: '#1e293b' }}>Hatchback</option>
                <option value="LUXURY" style={{ background: '#1e293b' }}>Luxury</option>
                <option value="ELECTRIC" style={{ background: '#1e293b' }}>Electric (EV)</option>
              </select>
            </div>

            {/* City Location */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>
                City / Pickup Hub
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Hyderabad, Bangalore"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            {/* Budget Range */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>
                Daily Budget Range (₹)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  style={{
                    width: '50%',
                    padding: '0.65rem 0.6rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: '0.85rem',
                  }}
                />
                <span style={{ color: 'var(--text-muted)' }}>–</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  style={{
                    width: '50%',
                    padding: '0.65rem 0.6rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: '0.85rem',
                  }}
                />
              </div>
            </div>

            {/* Preferred Fuel */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>
                Fuel / Energy Type
              </label>
              <select
                value={preferredFuel}
                onChange={(e) => setPreferredFuel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  fontSize: '0.9rem',
                }}
              >
                <option value="ANY" style={{ background: '#1e293b' }}>Any Fuel Type</option>
                <option value="ELECTRIC" style={{ background: '#1e293b' }}>Electric (EV)</option>
                <option value="PETROL" style={{ background: '#1e293b' }}>Petrol</option>
                <option value="DIESEL" style={{ background: '#1e293b' }}>Diesel</option>
                <option value="HYBRID" style={{ background: '#1e293b' }}>Hybrid</option>
                <option value="CNG" style={{ background: '#1e293b' }}>CNG</option>
              </select>
            </div>
          </div>

          {/* Strategy Presets */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <SlidersHorizontal size={16} color="#818cf8" />
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                Ranking Strategy Focus:
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {Object.entries(PRESET_WEIGHTS).map(([key, item]) => {
                const isActive = preset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPreset(key)}
                    style={{
                      padding: '0.5rem 0.9rem',
                      borderRadius: '8px',
                      border: isActive ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)',
                      background: isActive ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.02)',
                      color: isActive ? '#fff' : 'var(--text-muted)',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? '700' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
              ℹ️ {PRESET_WEIGHTS[preset].description}
            </div>
          </div>

          {/* Search Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.7rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '600',
              }}
            >
              <Search size={16} /> Run Matcher Query
            </button>
          </div>
        </form>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          Ranked Recommendations <span style={{ fontSize: '0.85rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px', color: '#a5b4fc' }}>{vehicles.length} found</span>
        </h3>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Sorted by descending composite match score
        </span>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem', display: 'block', color: 'var(--primary)' }} />
          Calculating multi-factor ranking scores for fleet...
        </div>
      )}

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#fca5a5', marginBottom: '1.5rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && vehicles.length === 0 && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '16px' }}>
          <Compass size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Suitable Vehicles Found</h4>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            No available vehicles matched your exact criteria. Try broadening your budget range, changing fuel preference, or selecting "All Categories".
          </p>
          <button
            onClick={() => {
              setVehicleType('ALL');
              setPreferredFuel('ANY');
              setMinPrice(1000);
              setMaxPrice(8000);
              fetchRecommendations();
            }}
            className="btn btn-primary"
          >
            Reset Filters & Search Again
          </button>
        </div>
      )}

      {/* Ranked Vehicle List */}
      {!loading && vehicles.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {vehicles.map((vehicle, index) => {
            const score = vehicle.recommendationScore || 0;
            const rank = index + 1;
            const breakdown = vehicle.scoreBreakdown || {};
            const isTopRanked = rank === 1;
            const isViewingBreakdown = showBreakdownId === vehicle._id;

            // Determine score badge color
            let badgeBg = 'rgba(16, 185, 129, 0.15)';
            let badgeColor = '#34d399';
            let badgeBorder = 'rgba(16, 185, 129, 0.3)';
            if (score < 75) {
              badgeBg = 'rgba(245, 158, 11, 0.15)';
              badgeColor = '#fbbf24';
              badgeBorder = 'rgba(245, 158, 11, 0.3)';
            }
            if (score < 60) {
              badgeBg = 'rgba(239, 68, 68, 0.15)';
              badgeColor = '#f87171';
              badgeBorder = 'rgba(239, 68, 68, 0.3)';
            }

            return (
              <div
                key={vehicle._id || index}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  borderRadius: '16px',
                  background: isTopRanked
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(15, 23, 42, 0.8))'
                    : 'rgba(255, 255, 255, 0.02)',
                  border: isTopRanked
                    ? '1px solid rgba(99, 102, 241, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                {/* Top Rank Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: isTopRanked ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)',
                        color: isTopRanked ? '#000' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                      }}
                    >
                      #{rank}
                    </div>
                    {isTopRanked && (
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.15)', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>
                        TOP CHOICE
                      </span>
                    )}
                  </div>

                  {/* Match Score Badge */}
                  <div
                    style={{
                      background: badgeBg,
                      color: badgeColor,
                      border: `1px solid ${badgeBorder}`,
                      padding: '0.35rem 0.75rem',
                      borderRadius: '14px',
                      fontSize: '0.85rem',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <Sparkles size={14} /> {score}% Match
                  </div>
                </div>

                {/* Vehicle Details */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
                      {vehicle.make} {vehicle.model}
                    </h4>
                    <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#38bdf8' }}>
                      ₹{vehicle.pricePerDay}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '400' }}>/day</span>
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                    <span>{vehicle.year}</span>
                    <span>•</span>
                    <span>{vehicle.vehicleType}</span>
                    <span>•</span>
                    <span style={{ color: '#93c5fd' }}>{vehicle.registrationNumber}</span>
                  </div>
                </div>

                {/* Highlights Tags */}
                {vehicle.matchHighlights && vehicle.matchHighlights.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.2rem' }}>
                    {vehicle.matchHighlights.map((hl, i) => (
                      <span
                        key={i}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          color: '#e2e8f0',
                        }}
                      >
                        {hl}
                      </span>
                    ))}
                  </div>
                )}

                {/* Quick Spec Pills */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.2rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                    <Fuel size={14} color="#818cf8" />
                    <span>{vehicle.fuelType}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                    <Star size={14} color="#fbbf24" />
                    <span>{vehicle.rating || 4.5} / 5.0</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                    <ShieldCheck size={14} color="#34d399" />
                    <span>{vehicle.condition || 'GOOD'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                    <MapPin size={14} color="#f43f5e" />
                    <span>
                      {vehicle.location?.city}
                      {breakdown.distanceKm !== null && breakdown.distanceKm !== undefined && (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}> ({breakdown.distanceKm} km)</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Score Breakdown Accordion */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowBreakdownId(isViewingBreakdown ? null : vehicle._id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#818cf8',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: 0,
                    }}
                  >
                    <Info size={14} />
                    {isViewingBreakdown ? 'Hide Score Breakdown' : 'Why is this recommended?'}
                  </button>

                  {isViewingBreakdown && (
                    <div style={{ marginTop: '0.75rem', background: 'rgba(0, 0, 0, 0.3)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Budget & Price ({Math.round((breakdown.weights?.price || 0.3) * 100)}% wt):</span>
                        <strong>{breakdown.priceScore || 0}/100</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Customer Rating ({Math.round((breakdown.weights?.rating || 0.25) * 100)}% wt):</span>
                        <strong>{breakdown.ratingScore || 0}/100</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Vehicle Condition ({Math.round((breakdown.weights?.condition || 0.2) * 100)}% wt):</span>
                        <strong>{breakdown.conditionScore || 0}/100</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Proximity ({Math.round((breakdown.weights?.distance || 0.15) * 100)}% wt):</span>
                        <strong>{breakdown.distanceScore || 0}/100</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Fuel Type Match ({Math.round((breakdown.weights?.fuel || 0.1) * 100)}% wt):</span>
                        <strong>{breakdown.fuelScore || 0}/100</strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary Card Action */}
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button
                    onClick={() => {
                      if (onSelectVehicle) {
                        onSelectVehicle(vehicle);
                      } else if (onNavigateToBrowse) {
                        onNavigateToBrowse();
                      }
                    }}
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      padding: '0.65rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    Select for Booking <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VehicleRecommendations;
