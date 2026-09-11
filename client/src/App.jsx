import React, { useEffect, useState } from 'react';
import API from './services/api';
import { Car, Server, Database, ShieldCheck, Activity, CheckCircle, RefreshCw } from 'lucide-react';

function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/health');
      setHealth(res.data);
    } catch (err) {
      setError(err.message || 'Failed to reach API server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

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
                Vehicle Rental & Fleet Management
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Customer & Rental Management Module (Member 1)
              </p>
            </div>
          </div>
          <div>
            <span className={`status-badge ${health?.services?.api === 'healthy' ? 'online' : 'offline'}`}>
              <span className="pulse-dot"></span>
              {loading ? 'Checking Status...' : health?.services?.api === 'healthy' ? 'System Online' : 'Service Disconnected'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard Card */}
      <main className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="var(--primary)" /> System Diagnostics & Health Status
          </h2>
          <button className="btn btn-primary" onClick={checkHealth} disabled={loading}>
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
              <span className={`status-badge ${health?.services?.api === 'healthy' ? 'online' : 'offline'}`}>
                {health?.services?.api === 'healthy' ? 'Active on Port 5000' : 'Offline / Error'}
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
              <span className={`status-badge ${health?.services?.database === 'connected' ? 'online' : 'offline'}`}>
                {health?.services?.database === 'connected' ? 'Connected' : 'Pending URI Config'}
              </span>
            </div>
          </div>

          {/* Module Responsibility Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <ShieldCheck color="var(--primary)" size={24} />
              <h3 style={{ fontSize: '1.1rem' }}>Active Module</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              {health?.module || 'Customer & Rental Management'}
            </p>
            <div>
              <span className="status-badge online" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--primary)', borderColor: 'var(--border-accent)' }}>
                Stage 1 — Complete
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', color: '#fca5a5' }}>
            ⚠️ <strong>Error connecting to backend:</strong> {error}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
