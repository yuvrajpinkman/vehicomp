import React, { useEffect, useState } from 'react';
import api, { checkHealth } from './services/api';
import { Car, Server, Database, ShieldCheck, Activity, RefreshCw, Users, Wrench } from 'lucide-react';

function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealthStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkHealth();
      setHealth(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  const isOnline = health?.services?.api === 'healthy' || health?.status === 'ok' || health?.status === 'success';

  return (
    <div className="app-container">
      {/* Header Banner */}
      <header className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
            }}>
              <Car size={30} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>
                Vehicle Rental & Fleet Management System
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Unified Platform — Customer & Rental Management (Member 1) & Fleet & Admin (Member 2)
              </p>
            </div>
          </div>
          <div>
            <span className={`status-badge ${isOnline ? 'online' : 'offline'}`}>
              <span className="pulse-dot"></span>
              {loading ? 'Checking Status...' : isOnline ? 'System Online' : 'Service Disconnected'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="var(--primary)" /> System Diagnostics & Stage 1 Status
          </h2>
          <button className="btn btn-primary" onClick={fetchHealthStatus} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh Status
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
          {/* Express API Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Server color="var(--accent-cyan)" size={24} />
              <h3 style={{ fontSize: '1.1rem' }}>Backend API</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Express.js REST API Server
            </p>
            <div>
              <span className={`status-badge ${isOnline ? 'online' : 'offline'}`}>
                {isOnline ? 'Active on Port 5000' : 'Offline / Error'}
              </span>
            </div>
          </div>

          {/* Database Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Database color="var(--accent-emerald)" size={24} />
              <h3 style={{ fontSize: '1.1rem' }}>Database</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              MongoDB Atlas Connection
            </p>
            <div>
              <span className={`status-badge ${health?.database?.status === 'connected' || health?.services?.database === 'connected' ? 'online' : 'offline'}`}>
                {health?.database?.status === 'connected' || health?.services?.database === 'connected' ? 'Connected' : 'Pending URI Config'}
              </span>
            </div>
          </div>

          {/* System Setup Status Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <ShieldCheck color="var(--primary)" size={24} />
              <h3 style={{ fontSize: '1.1rem' }}>Project Consolidation</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Unified Structure (/frontend & /backend)
            </p>
            <div>
              <span className="status-badge online" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--primary)', borderColor: 'var(--border-accent)' }}>
                Stage 1 — Consolidated & Ready
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Backend Response Metadata */}
        {health && (
          <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Backend Health Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
              <div><strong>Service:</strong> {health.service || 'vehicomp-backend'}</div>
              <div><strong>Environment:</strong> {health.environment || 'development'}</div>
              <div><strong>DB State:</strong> {health.database?.status || health.services?.database || 'disconnected'}</div>
              <div><strong>Uptime:</strong> {health.uptime ? `${Math.round(health.uptime)}s` : 'N/A'}</div>
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', color: '#fca5a5' }}>
            ⚠️ <strong>Error connecting to backend:</strong> {error}
          </div>
        )}
      </main>

      {/* Module Responsibilities Summary */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Users color="var(--primary)" size={24} />
            <h3 style={{ fontSize: '1.15rem' }}>Member 1: Customer & Rental Module</h3>
          </div>
          <ul style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.8', paddingLeft: '1.2rem' }}>
            <li>Authentication (Register, Login, Role Guards)</li>
            <li>Customer Dashboard & Profile Management</li>
            <li>Vehicle Catalog & Recommendation Engine</li>
            <li>Booking, Reservation & Double-Booking Prevention</li>
            <li>Rental Agreement Lifecycle & Invoicing</li>
          </ul>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Wrench color="var(--accent-cyan)" size={24} />
            <h3 style={{ fontSize: '1.15rem' }}>Member 2: Fleet & Admin Module</h3>
          </div>
          <ul style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.8', paddingLeft: '1.2rem' }}>
            <li>Fleet Management & Vehicle Inventory CRUD</li>
            <li>Vehicle Status Controls (Available, Reserved, Rented, Maintenance)</li>
            <li>Automated Maintenance Scheduling & Repair Cost Tracking</li>
            <li>System Admin & Analytics Dashboard</li>
            <li>Location Tracking & Fleet Utilization Logs</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export default App;
