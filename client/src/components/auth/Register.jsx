import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Phone, CreditCard, UserPlus, AlertCircle, Loader2 } from 'lucide-react';

function Register({ onSwitchToLogin }) {
  const { register, authError, setAuthError } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    licenseNumber: '',
    role: 'CUSTOMER',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (authError) setAuthError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setAuthError('Please fill in required fields (Name, Email, Password).');
      return;
    }
    if (formData.password.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    const res = await register(formData);
    setSubmitting(false);

    if (res.success) {
      setFormData({ name: '', email: '', password: '', phone: '', licenseNumber: '', role: 'CUSTOMER' });
    }
  };

  return (
    <div className="auth-card glass-panel" style={{ maxWidth: '460px', margin: '0 auto', padding: '2.5rem 2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem auto'
        }}>
          <UserPlus color="#10b981" size={26} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>Create Account</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Register as a Customer to reserve and manage rentals
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
          <AlertCircle size={18} style={{ shrink: 0 }} />
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
              placeholder="John Doe"
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
                fontSize: '0.95rem',
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
              placeholder="john@example.com"
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
                fontSize: '0.95rem',
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
                fontSize: '0.95rem',
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
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
              Driver License #
            </label>
            <div style={{ position: 'relative' }}>
              <CreditCard size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                name="licenseNumber"
                placeholder="DL-98213"
                value={formData.licenseNumber}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.65rem 0.65rem 2.2rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  color: '#fff',
                  fontSize: '0.875rem',
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
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            fontWeight: '600',
            fontSize: '0.95rem',
            border: 'none',
            cursor: submitting ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '0.75rem'
          }}
        >
          {submitting ? <Loader2 size={18} className="spin" /> : <UserPlus size={18} />}
          {submitting ? 'Creating Account...' : 'Register Customer'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          style={{
            background: 'none',
            border: 'none',
            color: '#34d399',
            fontWeight: '600',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0
          }}
        >
          Sign in here
        </button>
      </div>
    </div>
  );
}

export default Register;
