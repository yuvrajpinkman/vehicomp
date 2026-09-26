import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Car,
  User,
  LogOut,
  LayoutDashboard,
  Wrench,
  MapPin,
  Calendar,
  Receipt,
  Sparkles,
  Key,
  Activity,
  UserCheck,
  ShieldCheck
} from 'lucide-react';

function Navbar({ activeTab, setActiveTab, setAuthMode }) {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    logout();
    setActiveTab('home');
  };

  const isCustomer = user?.role === 'CUSTOMER';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
      {/* Top Header Bar: Logo, App Name, Sign In / Sign Up or User Profile & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Logo & App Name */}
        <div
          onClick={() => setActiveTab('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          title="Vehicomp Home Page"
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #10b981)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}>
            <Car size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Vehicomp
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0, fontWeight: '500' }}>
              Vehicle Rental &amp; Fleet Management System
            </p>
          </div>
        </div>

        {/* Right Header Controls: Public Sign In / Sign Up OR Authenticated Profile & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          {!isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                onClick={() => {
                  setActiveTab('auth');
                  if (setAuthMode) setAuthMode('login');
                }}
                className="btn"
                style={{
                  padding: '0.5rem 1.1rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  borderRadius: '9px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#a5b4fc',
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>

              <button
                onClick={() => {
                  setActiveTab('auth');
                  if (setAuthMode) setAuthMode('register');
                }}
                className="btn btn-primary"
                style={{
                  padding: '0.5rem 1.15rem',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  borderRadius: '9px',
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: '#ffffff',
                  boxShadow: '0 2px 10px rgba(99, 102, 241, 0.35)',
                  cursor: 'pointer'
                }}
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Authenticated User Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'rgba(255,255,255,0.05)',
                padding: '0.4rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isAdmin ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '0.8rem'
                }}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: '600', color: '#fff', lineHeight: 1.1 }}>
                    {user?.name}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: isAdmin ? '#6ee7b7' : '#a5b4fc', fontWeight: '700' }}>
                    {isAdmin ? 'FLEET ADMIN' : 'CUSTOMER'}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="btn"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  color: '#fca5a5',
                  padding: '0.45rem 0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.825rem',
                  fontWeight: '600'
                }}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Sub-Navigation Bar ONLY SHOWN WHEN AUTHENTICATED */}
      {isAuthenticated && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.85rem',
          marginTop: '0.75rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            
            {/* CUSTOMER NAVIGATION ONLY */}
            {isCustomer && (
              <>
                <button
                  onClick={() => setActiveTab('customer-dashboard')}
                  style={tabStyle(activeTab === 'customer-dashboard', '#6366f1')}
                >
                  <UserCheck size={15} /> Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('browse')}
                  style={tabStyle(activeTab === 'browse', '#6366f1')}
                >
                  <Car size={15} /> Browse Vehicles
                </button>
                <button
                  onClick={() => setActiveTab('reservations')}
                  style={tabStyle(activeTab === 'reservations', '#6366f1')}
                >
                  <Calendar size={15} /> My Reservations
                </button>
                <button
                  onClick={() => setActiveTab('rentals')}
                  style={tabStyle(activeTab === 'rentals', '#6366f1')}
                >
                  <Key size={15} /> My Rentals
                </button>
                <button
                  onClick={() => setActiveTab('invoices')}
                  style={tabStyle(activeTab === 'invoices', '#6366f1')}
                >
                  <Receipt size={15} /> My Invoices
                </button>
                <button
                  onClick={() => setActiveTab('recommendations')}
                  style={tabStyle(activeTab === 'recommendations', '#6366f1')}
                >
                  <Sparkles size={15} /> Recommendations
                </button>
              </>
            )}

            {/* ADMIN NAVIGATION ONLY */}
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  style={tabStyle(activeTab === 'dashboard', '#10b981')}
                >
                  <LayoutDashboard size={15} /> Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('fleet')}
                  style={tabStyle(activeTab === 'fleet', '#10b981')}
                >
                  <Car size={15} /> Fleet / Vehicles
                </button>
                <button
                  onClick={() => setActiveTab('maintenance')}
                  style={tabStyle(activeTab === 'maintenance', '#10b981')}
                >
                  <Wrench size={15} /> Maintenance
                </button>
                <button
                  onClick={() => setActiveTab('location')}
                  style={tabStyle(activeTab === 'location', '#10b981')}
                >
                  <MapPin size={15} /> Live Fleet Map
                </button>
                <button
                  onClick={() => setActiveTab('diagnostics')}
                  style={tabStyle(activeTab === 'diagnostics', '#10b981')}
                >
                  <Activity size={15} /> Diagnostics &amp; Health
                </button>
              </>
            )}

          </div>

          {/* Active Portal Badge */}
          <div style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            background: isAdmin ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
            color: isAdmin ? '#34d399' : '#818cf8',
            border: isAdmin ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(99, 102, 241, 0.25)'
          }}>
            {isAdmin ? '🛡️ Admin Portal' : '👤 Customer Portal'}
          </div>

        </div>
      )}
    </header>
  );
}

function tabStyle(isActive, colorHex = '#6366f1') {
  return {
    padding: '0.45rem 0.85rem',
    borderRadius: '8px',
    border: 'none',
    background: isActive ? colorHex : 'transparent',
    color: isActive ? '#ffffff' : 'var(--text-muted)',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'all 0.2s ease',
    boxShadow: isActive ? `0 2px 8px ${colorHex}55` : 'none'
  };
}

export default Navbar;
