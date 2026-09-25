import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Car, User, LogOut, ShieldCheck } from 'lucide-react';

function Navbar({ activeTab, setActiveTab, health }) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="glass-panel" style={{ padding: '1.25rem 2rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(99, 102, 241, 0.3)'
          }}>
            <Car size={26} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, lineHeight: 1.2 }}>
              Vehicomp
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              {activeTab === 'fleet' || activeTab === 'maintenance' || activeTab === 'dashboard' || activeTab === 'recommendations' || activeTab === 'location'
                ? 'Fleet & Administration Management (Member 2)'
                : activeTab === 'auth' || activeTab === 'browse' || activeTab === 'reservations' || activeTab === 'rentals' || activeTab === 'invoices' || activeTab === 'customer-dashboard'
                ? 'Customer & Rental Management (Member 1)'
                : 'System Diagnostics & Infrastructure'}
            </p>
          </div>
        </div>

        {/* Center Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.5)', padding: '0.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => setActiveTab('auth')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'auth' ? 'var(--primary, #6366f1)' : 'transparent',
              color: activeTab === 'auth' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🔐 Auth & Account
          </button>
          <button
            onClick={() => setActiveTab('customer-dashboard')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'customer-dashboard' ? 'var(--primary, #6366f1)' : 'transparent',
              color: activeTab === 'customer-dashboard' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            👤 Customer Hub
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'browse' ? 'var(--primary, #6366f1)' : 'transparent',
              color: activeTab === 'browse' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🚘 Browse Vehicles
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'reservations' ? 'var(--primary, #6366f1)' : 'transparent',
              color: activeTab === 'reservations' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📅 My Reservations
          </button>
          <button
            onClick={() => setActiveTab('rentals')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'rentals' ? 'var(--primary, #6366f1)' : 'transparent',
              color: activeTab === 'rentals' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🔑 My Rentals
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'invoices' ? 'var(--primary, #6366f1)' : 'transparent',
              color: activeTab === 'invoices' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🧾 My Invoices
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'recommendations' ? 'var(--primary, #6366f1)' : 'transparent',
              color: activeTab === 'recommendations' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            ✨ Recommendations
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'dashboard' ? 'var(--primary, #6366f1)' : 'transparent',
              color: activeTab === 'dashboard' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('fleet')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'fleet' ? 'var(--primary, #6366f1)' : 'transparent',
              color: activeTab === 'fleet' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🚗 Fleet Inventory
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'maintenance' ? 'var(--primary, #6366f1)' : 'transparent',
              color: activeTab === 'maintenance' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🛠️ Maintenance
          </button>
          <button
            onClick={() => setActiveTab('location')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'location' ? 'var(--primary, #6366f1)' : 'transparent',
              color: activeTab === 'location' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🗺️ Live Fleet Map
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'diagnostics' ? 'var(--primary, #6366f1)' : 'transparent',
              color: activeTab === 'diagnostics' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            ⚡ Diagnostics & Health
          </button>

        </div>

        {/* Right User State & Health Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className={`status-badge ${health?.services?.api === 'healthy' ? 'online' : 'offline'}`}>
            <span className="pulse-dot"></span>
            {health?.services?.api === 'healthy' ? 'API Online' : 'Connecting...'}
          </span>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: '700',
                fontSize: '0.85rem'
              }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>
                  {user?.name}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: '500' }}>
                  Role: {user?.role || 'CUSTOMER'}
                </span>
              </div>
              <button
                onClick={logout}
                title="Logout"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  color: '#fca5a5',
                  padding: '0.35rem 0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.75rem',
                  marginLeft: '0.5rem'
                }}
              >
                <LogOut size={14} /> Exit
              </button>
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Not Logged In
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default Navbar;
