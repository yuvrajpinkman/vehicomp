import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, Loader2 } from 'lucide-react';

function Login({ onSwitchToRegister }) {
  const { login, authError, setAuthError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (authError) setAuthError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setAuthError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    const res = await login(formData);
    setSubmitting(false);

    if (res.success) {
      setFormData({ email: '', password: '' });
    }
  };

  return (
    <div className="auth-card glass-panel" style={{ maxWidth: '420px', margin: '0 auto', padding: '2.5rem 2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem auto'
        }}>
          <LogIn color="var(--primary, #6366f1)" size={26} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>Customer Login</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Access your account & rental bookings
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

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
            Email Address
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="email"
              name="email"
              placeholder="customer@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
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
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.5rem',
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

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: '0.85rem',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: '#fff',
            fontWeight: '600',
            fontSize: '0.95rem',
            border: 'none',
            cursor: submitting ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '0.5rem'
          }}
        >
          {submitting ? <Loader2 size={18} className="spin" /> : <LogIn size={18} />}
          {submitting ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Don't have an account?{' '}
        <button
          onClick={onSwitchToRegister}
          style={{
            background: 'none',
            border: 'none',
            color: '#818cf8',
            fontWeight: '600',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0
          }}
        >
          Register here
        </button>
      </div>
    </div>
  );
}

export default Login;
