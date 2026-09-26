import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  getFleetLocations,
  getVehicleLocationHistory,
  simulateMovement,
} from '../../services/location.service';
import {
  MapPin,
  Navigation,
  Compass,
  Play,
  Pause,
  RefreshCw,
  Search,
  Activity,
} from 'lucide-react';

const FleetLocationMap = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [historyTrail, setHistoryTrail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const polylineRef = useRef(null);
  const simIntervalRef = useRef(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center on Hyderabad
    const map = L.map(mapContainerRef.current, {
      center: [17.3850, 78.4867],
      zoom: 12,
      zoomControl: true,
    });

    // Standard OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Trigger map invalidation after layout render
    const resizeTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 300);

    return () => {
      clearTimeout(resizeTimer);
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Fetch Fleet Locations
  const fetchFleet = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFleetLocations();
      const list = res?.data || res || [];
      if (Array.isArray(list)) {
        setVehicles(list);
        updateMapMarkers(list);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load fleet locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  // Fetch History Trail when vehicle is selected
  useEffect(() => {
    if (!selectedVehicle) {
      if (polylineRef.current && mapInstanceRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }
      setHistoryTrail([]);
      return;
    }

    const loadHistory = async () => {
      try {
        const vid = selectedVehicle.vehicleId || selectedVehicle._id;
        const res = await getVehicleLocationHistory(vid);
        const trail = res?.data || res || [];
        if (Array.isArray(trail)) {
          setHistoryTrail(trail);
          drawTrail(trail);
        }
      } catch (e) {
        // history is optional
      }
    };

    loadHistory();
  }, [selectedVehicle]);

  // Draw breadcrumb path on map
  const drawTrail = (trailLogs) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (!trailLogs || trailLogs.length < 2) return;

    const latlngs = trailLogs.map((log) => [log.latitude, log.longitude]);
    const polyline = L.polyline(latlngs, {
      color: '#6366f1',
      weight: 4,
      opacity: 0.8,
      dashArray: '6, 8',
    }).addTo(map);

    polylineRef.current = polyline;
  };

  // Create or Update Markers on Map
  const updateMapMarkers = (vehicleList) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const currentMarkers = markersRef.current;

    vehicleList.forEach((v) => {
      const vid = v.vehicleId || v._id;
      if (!vid) return;

      const lat = Number(v.latitude) || 17.3850;
      const lng = Number(v.longitude) || 78.4867;
      const isMoving = v.speed > 0 || v.telemetryStatus === 'MOVING';
      const statusColor = isMoving ? '#10b981' : v.fleetStatus === 'RENTED' ? '#6366f1' : v.fleetStatus === 'MAINTENANCE' ? '#f59e0b' : '#38bdf8';
      const regLabel = (v.registrationNumber || 'VEH-000').slice(-6);

      const customIcon = L.divIcon({
        className: 'custom-fleet-marker',
        html: `
          <div style="
            position: relative;
            width: 38px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #0f172a;
            border: 2px solid ${statusColor};
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.6);
            cursor: pointer;
          ">
            ${isMoving ? `<div style="
              position: absolute;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              background: ${statusColor};
              opacity: 0.3;
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>` : ''}
            <span style="font-size: 16px;">🚗</span>
            <div style="
              position: absolute;
              bottom: -18px;
              white-space: nowrap;
              background: rgba(15, 23, 42, 0.95);
              border: 1px solid rgba(255,255,255,0.2);
              color: #fff;
              font-size: 10px;
              font-weight: 700;
              padding: 1px 5px;
              border-radius: 4px;
            ">${regLabel}</div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      if (currentMarkers[vid]) {
        currentMarkers[vid].setLatLng([lat, lng]);
        currentMarkers[vid].setIcon(customIcon);
      } else {
        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        marker.on('click', () => {
          setSelectedVehicle(v);
          map.setView([lat, lng], 14, { animate: true });
        });
        currentMarkers[vid] = marker;
      }
    });

    // Invalidate size to guarantee tile rendering
    map.invalidateSize();
  };

  // Center map on specific vehicle
  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    const map = mapInstanceRef.current;
    if (map) {
      const lat = Number(vehicle.latitude) || 17.3850;
      const lng = Number(vehicle.longitude) || 78.4867;
      map.setView([lat, lng], 14, { animate: true });
      map.invalidateSize();
    }
  };

  // Single Simulation Tick
  const handleSimulateTick = async (targetId) => {
    const vid = targetId || selectedVehicle?.vehicleId || selectedVehicle?._id || vehicles[0]?.vehicleId || vehicles[0]?._id;
    if (!vid) return;

    try {
      await simulateMovement(vid, 0.0025);
      await fetchFleet();
    } catch (err) {
      console.error('Simulation tick error:', err);
    }
  };

  // Continuous Live Simulation Toggle
  useEffect(() => {
    if (simulating) {
      simIntervalRef.current = setInterval(() => {
        const vid = selectedVehicle?.vehicleId || selectedVehicle?._id || vehicles[Math.floor(Math.random() * vehicles.length)]?.vehicleId || vehicles[Math.floor(Math.random() * vehicles.length)]?._id;
        if (vid) {
          handleSimulateTick(vid);
        }
      }, 3000);
    } else {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
    }

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [simulating, selectedVehicle, vehicles]);

  // Filtered Vehicle List
  const filteredVehicles = vehicles.filter((v) => {
    const matchesStatus =
      statusFilter === 'ALL' ||
      v.fleetStatus === statusFilter ||
      (statusFilter === 'MOVING' && v.speed > 0);
    const matchesSearch =
      v.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ color: '#fff' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <Compass size={16} /> Real-Time Telematics &amp; GPS Tracking
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0 }}>
            Fleet Telematics &amp; Live Location Map
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem', margin: 0 }}>
            Monitor live coordinates, vehicle speed, battery levels, breadcrumb history, and simulated movement.
          </p>
        </div>

        {/* Global Action Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSimulating(!simulating)}
            style={{
              padding: '0.6rem 1.1rem',
              borderRadius: '10px',
              border: 'none',
              background: simulating ? '#ef4444' : '#10b981',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: simulating ? '0 0 16px rgba(239, 68, 68, 0.4)' : '0 0 16px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.2s',
            }}
          >
            {simulating ? <Pause size={16} /> : <Play size={16} />}
            {simulating ? 'Stop Live Simulation' : 'Start Live Movement Sim'}
          </button>

          <button
            onClick={() => handleSimulateTick()}
            className="btn"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
            }}
          >
            <Navigation size={16} /> Step Movement Tick
          </button>

          <button
            onClick={fetchFleet}
            className="btn"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 0.9rem',
              borderRadius: '10px',
            }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#fca5a5', marginBottom: '1rem', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Main Grid: Interactive Map + Fleet Telematics Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) 1fr', gap: '1.5rem', minHeight: '620px' }}>
        
        {/* Sidebar: Vehicle List & Telemetry HUD */}
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxHeight: '620px'
          }}
        >
          {/* Search & Filter Header */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search registration or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.6rem 0.6rem 2.2rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            {/* Quick Status Filters */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['ALL', 'RENTED', 'AVAILABLE', 'MAINTENANCE', 'MOVING'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: statusFilter === st ? '#6366f1' : 'rgba(255, 255, 255, 0.05)',
                    color: statusFilter === st ? '#fff' : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Telematics Cards List */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.25rem' }}>
            {filteredVehicles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No vehicles matching filter.
              </div>
            ) : (
              filteredVehicles.map((v) => {
                const vid = v.vehicleId || v._id;
                const isSelected = selectedVehicle?.vehicleId === vid || selectedVehicle?._id === vid;
                const isMoving = v.speed > 0 || v.telemetryStatus === 'MOVING';

                return (
                  <div
                    key={vid}
                    onClick={() => handleSelectVehicle(v)}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '10px',
                      background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0 }}>
                          {v.make} {v.model}
                        </h4>
                        <span style={{ fontSize: '0.8rem', color: '#93c5fd', fontFamily: 'monospace' }}>
                          {v.registrationNumber}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '8px',
                          background: isMoving ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          color: isMoving ? '#34d399' : 'var(--text-muted)',
                          border: isMoving ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        {isMoving ? 'MOVING' : v.fleetStatus}
                      </span>
                    </div>

                    {/* Coordinates & Location */}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={12} color="#f43f5e" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {v.address || `${Number(v.latitude || 17.385).toFixed(4)}, ${Number(v.longitude || 78.486).toFixed(4)}`}
                      </span>
                    </div>

                    {/* Telemetry Stats: Speed, Battery, Fuel */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', fontSize: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '0.4rem', borderRadius: '6px' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem' }}>Speed</span>
                        <strong style={{ color: isMoving ? '#34d399' : '#fff' }}>{v.speed || 0} km/h</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem' }}>Battery</span>
                        <strong>{v.batteryLevel || 100}%</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem' }}>Fuel / EV</span>
                        <strong>{v.fuelLevel || 80}%</strong>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Leaflet Map Canvas */}
        <div
          className="glass-panel"
          style={{
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative',
            height: '100%',
            minHeight: '620px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Map Target Div */}
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '620px', zIndex: 1 }} />

          {/* Selected Vehicle Overlay HUD */}
          {selectedVehicle && (
            <div
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                zIndex: 1000,
                background: 'rgba(15, 23, 42, 0.92)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '1rem',
                minWidth: '260px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>
                    {selectedVehicle.make} {selectedVehicle.model}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: '#93c5fd', fontFamily: 'monospace' }}>
                    {selectedVehicle.registrationNumber}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedVehicle(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                  <span style={{ color: '#10b981', fontWeight: '600' }}>{selectedVehicle.fleetStatus || selectedVehicle.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>GPS:</span>
                  <code>{Number(selectedVehicle.latitude || 17.385).toFixed(4)}, {Number(selectedVehicle.longitude || 78.486).toFixed(4)}</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Speed:</span>
                  <strong>{selectedVehicle.speed || 0} km/h</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>History Trail:</span>
                  <span>{historyTrail.length} pings logged</span>
                </div>
              </div>

              <button
                onClick={() => handleSimulateTick(selectedVehicle.vehicleId || selectedVehicle._id)}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                <Navigation size={14} /> Move Vehicle Forward
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FleetLocationMap;
