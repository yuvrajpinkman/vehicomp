import React from 'react';
import { Car, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export default function LandingPage({ onNavigateToAuth, onSelectSignUpType }) {
  return (
    <div style={{
      minHeight: '75vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      color: '#f8fafc'
    }}>
      {/* Hero / Intro Body */}
      <div style={{
        maxWidth: '860px',
        margin: '3rem auto 2rem auto',
        textAlign: 'center',
        padding: '0 1rem'
      }}>
        {/* Brand Logo & Tagline */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #6366f1, #10b981)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)'
        }}>
          <Car size={36} color="#ffffff" />
        </div>

        <h1 style={{
          fontSize: '2.75rem',
          fontWeight: '900',
          lineHeight: 1.15,
          marginBottom: '1rem',
          letterSpacing: '-0.025em'
        }}>
          Welcome to <span style={{ background: 'linear-gradient(135deg, #818cf8, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Vehicomp</span>
        </h1>

        <p style={{
          color: '#94a3b8',
          fontSize: '1.15rem',
          lineHeight: 1.6,
          marginBottom: '2.5rem',
          fontWeight: '400'
        }}>
          Vehicomp is a comprehensive Vehicle Rental &amp; Fleet Management solution.
          Whether you are a customer looking to reserve your next journey or a fleet administrator managing inventory, maintenance, and live telematics, Vehicomp provides a seamless, secure, and modern experience.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigateToAuth('login')}
            className="btn btn-primary"
            style={{
              padding: '0.85rem 2rem',
              fontSize: '1rem',
              fontWeight: '700',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
              cursor: 'pointer'
            }}
          >
            Sign In to Account
          </button>

          <button
            onClick={() => onSelectSignUpType && onSelectSignUpType()}
            className="btn"
            style={{
              padding: '0.85rem 2rem',
              fontSize: '1rem',
              fontWeight: '700',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            Create New Account
          </button>
        </div>

        {/* Quick Role Options Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginTop: '3.5rem',
          textAlign: 'left'
        }}>
          <div
            className="glass-panel"
            onClick={() => onSelectSignUpType('customer')}
            style={{
              padding: '1.75rem',
              borderRadius: '16px',
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, border-color 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCheck size={22} color="#818cf8" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>Customer Portal</h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
              Browse vehicle inventory, make reservations, view rental history, access itemized invoices, and submit ratings.
            </p>
          </div>

          <div
            className="glass-panel"
            onClick={() => onSelectSignUpType('admin')}
            style={{
              padding: '1.75rem',
              borderRadius: '16px',
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, border-color 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={22} color="#34d399" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>Admin Portal</h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
              Manage fleet inventory CRUD, track vehicle maintenance and repairs, monitor live GPS telematics, and view executive analytics.
            </p>
          </div>
        </div>
      </div>

      {/* Footer — ONLY Copyright Information */}
      <footer style={{
        textAlign: 'center',
        padding: '1.5rem 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        color: '#64748b',
        fontSize: '0.85rem',
        marginTop: '3rem'
      }}>
        © 2026 Vehicomp. All rights reserved.
      </footer>
    </div>
  );
}
