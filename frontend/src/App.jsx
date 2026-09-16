import React, { useEffect, useState } from 'react';
import API, { getProfile } from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import {
  Car,
  Server,
  Database,
  ShieldCheck,
  Activity,
  RefreshCw,
  UserCheck,
  Key,
  CheckCircle,
  Lock
} from 'lucide-react';

function AppContent() {
  const { user, token, isAuthenticated, logout } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('auth'); // 'auth' | 'diagnostics'
  const [health, setHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [healthError, setHealthError] = useState(null);
  const [apiProfileResult, setApiProfileResult] = useState(null);
  const [testingProfile, setTestingProfile] = useState(false);

  const checkHealth = async () => {
    setLoadingHealth(true);
    setHealthError(null);
    try {
      const res = await API.get('/health');
      setHealth(res.data);
    } catch (err) {
      setHealthError(err.message || 'Failed to reach API server');
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleTestProtectedEndpoint = async () => {
    setTestingProfile(true);
    try {
      const res = await getProfile();
      setApiProfileResult({
        status: 200,
        success: true,
        data: res.data
      });
    } catch (err) {
      setApiProfileResult({
        status: err.status || 401,
        success: false,
        error: err.message || 'Unauthorized'
      });
    } finally {
      setTestingProfile(false);
    }
  };

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} health={health} />

      {/* Main Content Area */}
      <main>
        {activeTab === 'auth' ? (
          <div>
            {!isAuthenticated ? (
              <div style={{ padding: '1rem 0' }}>
                {authMode === 'login' ? (
                  <Login onSwitchToRegister={() => setAuthMode('register')} />
                ) : (
                  <Register onSwitchToLogin={() => setAuthMode('login')} />
                )}
              </div>
            ) : (
              /* Authenticated Customer Dashboard Preview */
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <span className="status-badge online" style={{ marginBottom: '0.5rem', display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                      <CheckCircle size={14} /> Stage 2 — Authentication Verified
                    </span>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.25rem' }}>
                      Welcome back, {user?.name}! 👋
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      Logged in as <strong>{user?.email}</strong> with role <span style={{ color: '#818cf8', fontWeight: '600' }}>{user?.role || 'CUSTOMER'}</span>
                    </p>
                  </div>
                  <button
                    onClick={logout}
                    className="btn"
                    style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}
                  >
                    Logout Account
                  </button>
                </div>

                {/* Grid Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                  
                  {/* User Profile Info Card */}
                  <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <UserCheck color="#10b981" size={24} />
                      <h3 style={{ fontSize: '1.1rem' }}>Customer Profile</h3>
                    </div>
                    <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Customer ID:</span>
                        <code style={{ fontSize: '0.8rem', color: '#93c5fd' }}>{user?._id || user?.id}</code>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Phone:</span>
                        <span>{user?.phone || 'Not provided'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Driver License:</span>
                        <span>{user?.licenseNumber || 'Not provided'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Registered:</span>
                        <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Session'}</span>
                      </div>
                    </div>
                  </div>

                  {/* JWT Session Token Card */}
                  <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <Key color="#6366f1" size={24} />
                      <h3 style={{ fontSize: '1.1rem' }}>JWT Security Session</h3>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                      Bearer Token stored securely in browser state & Authorization headers:
                    </p>
                    <div style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      color: '#a5b4fc',
                      wordBreak: 'break-all',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      maxHeight: '70px',
                      overflowY: 'auto'
                    }}>
                      {token}
                    </div>
                  </div>

                  {/* Test Protected API Endpoint Card */}
                  <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <Lock color="#f59e0b" size={24} />
                      <h3 style={{ fontSize: '1.1rem' }}>Protected Route Test</h3>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      Verify backend authentication middleware by querying <code>/api/auth/me</code>:
                    </p>
                    <button
                      onClick={handleTestProtectedEndpoint}
                      disabled={testingProfile}
                      style={{
                        padding: '0.6rem 1rem',
                        borderRadius: '8px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        color: '#fbbf24',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <RefreshCw size={14} className={testingProfile ? 'spin' : ''} />
                      Test <code>/api/auth/me</code>
                    </button>

                    {apiProfileResult && (
                      <div style={{ marginTop: '0.75rem', padding: '0.6rem', borderRadius: '6px', background: apiProfileResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', fontSize: '0.8rem', color: apiProfileResult.success ? '#34d399' : '#fca5a5' }}>
                        HTTP {apiProfileResult.status}: {apiProfileResult.success ? 'Authorized User Profile Received ✅' : apiProfileResult.error}
                      </div>
                    )}
                  </div>

                </div>

                {/* Stage Roadmap Footer */}
                <div style={{ marginTop: '2rem', padding: '1.25rem', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#c7d2fe', margin: '0 0 0.25rem 0' }}>
                      Ready for Stage 3: Vehicle Browsing
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                      Authentication is complete. Next stage will introduce vehicle search, filtering, and availability checking.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
        ) : (
          /* System Diagnostics Tab */
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} color="var(--primary)" /> System Diagnostics & Health Status
              </h2>
              <button className="btn btn-primary" onClick={checkHealth} disabled={loadingHealth}>
                <RefreshCw size={16} className={loadingHealth ? 'spin' : ''} /> Refresh Status
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
                  <span className={`status-badge ${health?.services?.api === 'healthy' || health?.status === 'healthy' || health?.status === 'success' ? 'online' : 'offline'}`}>
                    {health ? 'Active on Port 5000' : 'Offline / Error'}
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
                  <span className={`status-badge ${health?.services?.database === 'connected' || health?.database?.status === 'connected' ? 'online' : 'offline'}`}>
                    {health?.services?.database === 'connected' || health?.database?.status === 'connected' ? 'Connected' : 'Pending URI Config'}
                  </span>
                </div>
              </div>

              {/* Active Module Card */}
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
                    Stage 2 — Auth Integrated
                  </span>
                </div>
              </div>
            </div>

            {healthError && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', color: '#fca5a5' }}>
                ⚠️ <strong>Error connecting to backend:</strong> {healthError}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
