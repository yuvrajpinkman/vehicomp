import React, { useState, useEffect } from 'react';
import { checkHealth } from './services/api';

function App() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkHealth();
      setHealthData(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div style={{ maxWidth: '960px', margin: '40px auto', padding: '0 20px' }}>
      <header style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '28px', color: '#0f172a', fontWeight: '700' }}>
              Vehicomp Fleet &amp; Admin System
            </h1>
            <p style={{ color: '#64748b', marginTop: '6px' }}>
              Vehicle Rental &amp; Fleet Management — Member 2 Workspace
            </p>
          </div>
          <span
            style={{
              padding: '6px 14px',
              backgroundColor: '#dbeafe',
              color: '#1d4ed8',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            Stage 1: Setup Verified
          </span>
        </div>
      </header>

      <main>
        <section
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', color: '#1e293b' }}>Backend Health Status</h2>
            <button
              onClick={fetchHealth}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              {loading ? 'Checking...' : 'Refresh Status'}
            </button>
          </div>

          {loading && !healthData && (
            <p style={{ color: '#64748b' }}>Connecting to backend at <code>/api/health</code>...</p>
          )}

          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                color: '#b91c1c',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            >
              <strong>Connection Alert:</strong> {error}
              <div style={{ marginTop: '8px', fontSize: '13px', color: '#7f1d1d' }}>
                Ensure backend server is running on <code>http://localhost:5000</code>.
              </div>
            </div>
          )}

          {healthData && (
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#16a34a',
                  }}
                />
                <strong style={{ color: '#166534' }}>Backend API is Online (200 OK)</strong>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px', color: '#374151', lineHeight: '1.8' }}>
                <li><strong>Service:</strong> {healthData.service}</li>
                <li><strong>Version:</strong> {healthData.version}</li>
                <li><strong>Environment:</strong> {healthData.environment}</li>
                <li><strong>MongoDB State:</strong> {healthData.database?.status} ({healthData.database?.readyState})</li>
                <li><strong>Server Time:</strong> {new Date(healthData.timestamp).toLocaleString()}</li>
                <li><strong>Uptime:</strong> {Math.round(healthData.uptime)} seconds</li>
              </ul>
            </div>
          )}
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          <div style={{ background: '#fff', padding: '18px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: '15px', color: '#0f172a', marginBottom: '6px' }}>Fleet Management</h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Stage 2: Vehicles CRUD &amp; Status Controls</p>
          </div>
          <div style={{ background: '#fff', padding: '18px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: '15px', color: '#0f172a', marginBottom: '6px' }}>Vehicle Lifecycle</h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Stage 3: AVAILABLE → RESERVED → RENTED → RETURNED → INSPECTION</p>
          </div>
          <div style={{ background: '#fff', padding: '18px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: '15px', color: '#0f172a', marginBottom: '6px' }}>Maintenance Engine</h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Stage 4: Automated lock, priority, repair cost tracking</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
