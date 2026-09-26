import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Phone, CreditCard, UserPlus, AlertCircle, Loader2, ShieldCheck, UserCheck, KeyRound, ArrowLeft } from 'lucide-react';

function Register({ onSwitchToLogin, initialRole = null }) {
  const { register, authError, setAuthError } = useAuth();
  const [selectedRole, setSelectedRole] = useState(initialRole); // null | 'CUSTOMER' | 'ADMIN'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    licenseNumber: '',
    adminSecret: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (authError) setAuthError(null);
  };

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    if (authError) setAuthError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setAuthError('Please fill in all required fields (Name, Email, Password).');
      return;
    }
    if (formData.password.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    const payload = {
      ...formData,
      role: selectedRole
    };
    const res = await register(payload);
    setSubmitting(false);

    if (res.success) {
      // After successful registration -> redirect to Sign In page
      if (onSwitchToLogin) {
        onSwitchToLogin();
      }
    }
  };

  // If no role has been selected yet, show the Registration Selection Page
  if (!selectedRole) {
    return (
      <div className="auth-card glass-panel" style={{ maxWidth: '600px', margin: '2rem auto', padding: '2.5rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem', color: '#f8fafc' }}>
          Create Your Vehicomp Account
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Select your registration type below to proceed:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Customer Registration Card */}
          <div
            onClick={() => handleSelectRole('CUSTOMER')}
            style={{
              padding: '2rem 1.5rem',
              borderRadius: '16px',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.15)'
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}>
              <UserCheck size={28} color="#ffffff" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', color: '#ffffff' }}>
              Customer Registration
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.4, margin: 0 }}>
              Register as a customer to browse vehicles, manage reservations, rentals, and invoices.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              style={{
                marginTop: '1.5rem',
                width: '100%',
                padding: '0.65rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                fontWeight: '600'
              }}
            >
              Select Customer
            </button>
          </div>

          {/* Admin Registration Card */}
          <div
            onClick={() => handleSelectRole('ADMIN')}
            style={{
              padding: '2rem 1.5rem',
              borderRadius: '16px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.15)'
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              <ShieldCheck size={28} color="#ffffff" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', color: '#ffffff' }}>
              Admin Registration
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.4, margin: 0 }}>
              Register as a fleet administrator to manage vehicle inventory, maintenance, and GPS telematics.
            </p>
            <button
              type="button"
              className="btn"
              style={{
                marginTop: '1.5rem',
                width: '100%',
                padding: '0.65rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                fontWeight: '600',
                border: 'none'
              }}
            >
              Select Admin
            </button>
          </div>

        </div>

        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <button
            onClick={onSwitchToLogin}
            style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Sign in here
          </button>
        </div>
      </div>
    );
  }

  const isCustomer = selectedRole === 'CUSTOMER';
  const themeColor = isCustomer ? '#6366f1' : '#10b981';

  return (
    <div className="auth-card glass-panel" style={{ maxWidth: '480px', margin: '1rem auto', padding: '2rem 1.75rem' }}>
      
      <button
        onClick={() => setSelectedRole(null)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.85rem',
          cursor: 'pointer',
          marginBottom: '1rem'
        }}
      >
        <ArrowLeft size={16} /> Back to registration selection
      </button>

      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: isCustomer ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          border: `1px solid ${isCustomer ? 'rgba(99, 102, 241, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 0.75rem auto'
        }}>
          {isCustomer ? <UserCheck color="#6366f1" size={26} /> : <ShieldCheck color="#10b981" size={26} />}
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
          {isCustomer ? 'Customer Registration' : 'Admin Registration'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {isCustomer
            ? 'Create your customer account to reserve and manage rentals'
            : 'Register administrative account for fleet management'}
        </p>
      </div>

      {authError && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.75rem 1rem',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#fca5a5',
          fontSize: '0.875rem',
          marginBottom: '1.25rem'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{authError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
            Full Name *
          </label>
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              name="name"
              placeholder={isCustomer ? "John Doe" : "Fleet Admin Jane"}
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.7rem 0.7rem 0.7rem 2.5rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'rgba(15, 23, 42, 0.6)',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
            Email Address *
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="email"
              name="email"
              placeholder={isCustomer ? "john@example.com" : "admin@vehicomp.com"}
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.7rem 0.7rem 0.7rem 2.5rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'rgba(15, 23, 42, 0.6)',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
            Password (min 6 characters) *
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required
              style={{
                width: '100%',
                padding: '0.7rem 0.7rem 0.7rem 2.5rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: 'rgba(15, 23, 42, 0.6)',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
              Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                name="phone"
                placeholder="+1 555-0192"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.65rem 0.65rem 2.2rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
              {isCustomer ? 'Driver License #' : 'Admin Code / PIN'}
            </label>
            <div style={{ position: 'relative' }}>
              {isCustomer ? (
                <CreditCard size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              ) : (
                <KeyRound size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              )}
              <input
                type="text"
                name={isCustomer ? "licenseNumber" : "adminSecret"}
                placeholder={isCustomer ? "DL-98213" : "ADM-778"}
                value={isCustomer ? formData.licenseNumber : formData.adminSecret}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.65rem 0.65rem 2.2rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: '0.85rem',
            borderRadius: '8px',
            background: isCustomer
              ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
              : 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            fontWeight: '600',
            fontSize: '0.95rem',
            border: 'none',
            cursor: submitting ? 'not-allowed' : 'pointer',
            boxShadow: isCustomer
              ? '0 4px 12px rgba(99, 102, 241, 0.3)'
              : '0 4px 12px rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '0.5rem'
          }}
        >
          {submitting ? <Loader2 size={18} className="spin" /> : <UserPlus size={18} />}
          {submitting ? 'Registering...' : (isCustomer ? 'Register as Customer' : 'Register as Admin')}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          style={{
            background: 'none',
            border: 'none',
            color: themeColor,
            fontWeight: '600',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0
          }}
        >
          Sign in to your account
        </button>
      </div>
    </div>
  );
}

export default Register;
