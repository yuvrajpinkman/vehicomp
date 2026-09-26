import React, { useEffect, useState } from 'react';
import API, { checkHealth, getProfile } from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import LandingPage from './components/common/LandingPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VehicleList from './components/fleet/VehicleList';
import MaintenanceList from './components/maintenance/MaintenanceList';
import CustomerVehicleBrowse from './components/customer/CustomerVehicleBrowse';
import MyReservations from './components/customer/MyReservations';
import MyRentals from './components/customer/MyRentals';
import MyInvoices from './components/customer/MyInvoices';
import CustomerDashboard from './components/customer/CustomerDashboard';
import FleetDashboard from './components/dashboard/FleetDashboard';
import VehicleRecommendations from './components/recommendations/VehicleRecommendations';
import FleetLocationMap from './components/location/FleetLocationMap';
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
  Lock,
  Wrench,
  Users
} from 'lucide-react';

function AppContent() {
  const { user, token, isAuthenticated, logout } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [registerInitialRole, setRegisterInitialRole] = useState(null); // null | 'CUSTOMER' | 'ADMIN'
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'auth' | 'customer-dashboard' | 'browse' | 'reservations' | 'rentals' | 'invoices' | 'recommendations' | 'dashboard' | 'fleet' | 'maintenance' | 'location' | 'diagnostics'
  const [health, setHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [healthError, setHealthError] = useState(null);

  const fetchHealthStatus = async () => {
    setLoadingHealth(true);
    setHealthError(null);
    try {
      const res = await checkHealth();
      setHealth(res.data || res);
    } catch (err) {
      setHealthError(err.message || 'Failed to reach API server');
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
  }, []);

  // Post-Login Routing & Protection Rules
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        // Admin user routing & protection
        if (['home', 'auth', 'customer-dashboard'].includes(activeTab)) {
          setActiveTab('dashboard');
        }
      } else {
        // Customer user routing & protection
        if (['home', 'auth', 'dashboard', 'fleet', 'maintenance', 'location', 'diagnostics'].includes(activeTab)) {
          setActiveTab('customer-dashboard');
        }
      }
    } else if (!isAuthenticated) {
      // Unauthenticated users can only access public pages ('home', 'auth')
      if (!['home', 'auth'].includes(activeTab)) {
        setActiveTab('home');
      }
    }
  }, [isAuthenticated, user]);

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setAuthMode={setAuthMode}
      />

      {/* Main Content Area */}
      <main>
        {/* PUBLIC HOME PAGE — FIRST PAGE */}
        {activeTab === 'home' && (
          <LandingPage
            onNavigateToAuth={(mode) => {
              setAuthMode(mode);
              setRegisterInitialRole(null);
              setActiveTab('auth');
            }}
            onSelectSignUpType={(role = null) => {
              setAuthMode('register');
              setRegisterInitialRole(role);
              setActiveTab('auth');
            }}
          />
        )}

        {/* AUTHENTICATION PAGES (SIGN IN / SIGN UP) */}
        {activeTab === 'auth' && (
          <div>
            {!isAuthenticated ? (
              <div style={{ padding: '1rem 0' }}>
                {authMode === 'login' ? (
                  <Login
                    onSwitchToRegister={() => {
                      setRegisterInitialRole(null);
                      setAuthMode('register');
                    }}
                  />
                ) : (
                  <Register
                    initialRole={registerInitialRole}
                    onSwitchToLogin={() => setAuthMode('login')}
                  />
                )}
              </div>
            ) : (
              /* Already Authenticated Session Overview */
              <div className="glass-panel" style={{ maxWidth: '540px', margin: '2rem auto', padding: '2rem', textAlign: 'center' }}>
                <span className="status-badge online" style={{ marginBottom: '1rem', display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                  <CheckCircle size={14} /> Session Active
                </span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '700', margin: '0.5rem 0' }}>
                  Welcome back, {user?.name}! 👋
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                  Logged in as <strong>{user?.email}</strong> ({user?.role || 'CUSTOMER'})
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button
                    onClick={() => setActiveTab(user?.role === 'ADMIN' ? 'dashboard' : 'customer-dashboard')}
                    className="btn btn-primary"
                  >
                    Go to {user?.role === 'ADMIN' ? 'Admin Dashboard' : 'Customer Dashboard'}
                  </button>
                  <button onClick={logout} className="btn" style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5' }}>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CUSTOMER PORTAL FUNCTIONALITY */}
        {isAuthenticated && user?.role !== 'ADMIN' && (
          <>
            {activeTab === 'customer-dashboard' && (
              <div style={{ marginBottom: '2rem' }}>
                <CustomerDashboard onBrowseVehicles={() => setActiveTab('browse')} />
              </div>
            )}

            {activeTab === 'browse' && (
              <div style={{ marginBottom: '2rem' }}>
                <CustomerVehicleBrowse onNavigateToReservations={() => setActiveTab('reservations')} />
              </div>
            )}

            {activeTab === 'reservations' && (
              <div style={{ marginBottom: '2rem' }}>
                <MyReservations onBrowseVehicles={() => setActiveTab('browse')} onNavigateRentals={() => setActiveTab('rentals')} />
              </div>
            )}

            {activeTab === 'rentals' && (
              <div style={{ marginBottom: '2rem' }}>
                <MyRentals onBrowseVehicles={() => setActiveTab('browse')} />
              </div>
            )}

            {activeTab === 'invoices' && (
              <div style={{ marginBottom: '2rem' }}>
                <MyInvoices onBrowseVehicles={() => setActiveTab('browse')} />
              </div>
            )}

            {activeTab === 'recommendations' && (
              <main className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <VehicleRecommendations
                  onNavigateToBrowse={() => setActiveTab('browse')}
                  onSelectVehicle={() => setActiveTab('browse')}
                />
              </main>
            )}
          </>
        )}

        {/* ADMIN PORTAL FUNCTIONALITY */}
        {isAuthenticated && user?.role === 'ADMIN' && (
          <>
            {activeTab === 'dashboard' && (
              <main className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <FleetDashboard
                  onNavigateToFleet={() => setActiveTab('fleet')}
                  onNavigateToMaintenance={() => setActiveTab('maintenance')}
                />
              </main>
            )}

            {activeTab === 'fleet' && (
              <main className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <VehicleList />
              </main>
            )}

            {activeTab === 'maintenance' && (
              <main className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <MaintenanceList />
              </main>
            )}

            {activeTab === 'location' && (
              <main className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <FleetLocationMap />
              </main>
            )}

            {activeTab === 'diagnostics' && (
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={20} color="var(--primary)" /> System Diagnostics &amp; Health Status
                  </h2>
                  <button className="btn btn-primary" onClick={fetchHealthStatus} disabled={loadingHealth}>
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
                      <span className={`status-badge ${health?.services?.api === 'healthy' || health?.status === 'ok' ? 'online' : 'offline'}`}>
                        {health?.services?.api === 'healthy' || health?.status === 'ok' ? 'Active on Port 5000' : 'Offline / Error'}
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

                  {/* System Status Card */}
                  <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <ShieldCheck color="var(--primary)" size={24} />
                      <h3 style={{ fontSize: '1.1rem' }}>System Status</h3>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      {health?.module || 'Vehicle Rental & Fleet Management'}
                    </p>
                    <div>
                      <span className="status-badge online" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--primary)', borderColor: 'var(--border-accent)' }}>
                        Auth &amp; API Active
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
          </>
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
