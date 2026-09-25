import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Key,
  CreditCard,
  Star,
  Car,
  Clock,
  CheckCircle,
  FileText,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import customerService from '../../services/customer.service';
import ratingService from '../../services/rating.service';
import MyReservations from './MyReservations';
import MyRentals from './MyRentals';
import MyInvoices from './MyInvoices';
import RatingModal from './RatingModal';
import InvoiceModal from './InvoiceModal';

export default function CustomerDashboard({ onBrowseVehicles }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subTab, setSubTab] = useState('overview'); // 'overview' | 'reservations' | 'rentals' | 'invoices' | 'reviews'
  const [userRatings, setUserRatings] = useState([]);
  const [ratingModalVehicle, setRatingModalVehicle] = useState(null);
  const [invoiceModalData, setInvoiceModalData] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await customerService.getCustomerDashboard();
      setDashboardData(res.data?.data || res.data || null);

      // Fetch user ratings history
      const ratingsRes = await ratingService.getUserRatings().catch(() => ({ data: [] }));
      setUserRatings(ratingsRes.data?.data || ratingsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load customer dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const summary = dashboardData?.summary || {
    totalReservations: 0,
    activeRentals: 0,
    completedRentals: 0,
    totalSpent: 0,
    ratingsCount: userRatings.length || 0,
    averageRatingGiven: 0,
  };

  return (
    <div style={{ color: '#f8fafc' }}>
      {/* Top Welcome Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          borderRadius: '16px',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <span
            className="status-badge online"
            style={{ marginBottom: '0.5rem', display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}
          >
            <CheckCircle size={14} /> Stage 7 — Customer Dashboard & Rating Active
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0.25rem 0' }}>
            Customer Management Hub
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
            Manage your active bookings, rental lifecycle, pricing invoices, and vehicle feedback in one place.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={fetchDashboardData}
            className="btn"
            disabled={loading}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh Data
          </button>
          <button
            onClick={onBrowseVehicles}
            className="btn btn-primary"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <PlusCircle size={18} /> Book New Vehicle
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* Total Reservations Card */}
        <div
          onClick={() => setSubTab('reservations')}
          className="glass-panel"
          style={{
            padding: '1.5rem',
            borderRadius: '14px',
            background: 'rgba(30, 41, 59, 0.6)',
            border: subTab === 'reservations' ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: '600' }}>Total Reservations</span>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Calendar size={20} color="#818cf8" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f8fafc' }}>
            {summary.totalReservations}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#818cf8', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            View all bookings <ChevronRight size={14} />
          </div>
        </div>

        {/* Active Rentals Card */}
        <div
          onClick={() => setSubTab('rentals')}
          className="glass-panel"
          style={{
            padding: '1.5rem',
            borderRadius: '14px',
            background: 'rgba(30, 41, 59, 0.6)',
            border: subTab === 'rentals' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: '600' }}>Active & Past Rentals</span>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Key size={20} color="#34d399" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f8fafc' }}>
            {summary.activeRentals} <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: '500' }}>active / {summary.completedRentals} done</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#34d399', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Return or view rentals <ChevronRight size={14} />
          </div>
        </div>

        {/* Total Spent Card */}
        <div
          onClick={() => setSubTab('invoices')}
          className="glass-panel"
          style={{
            padding: '1.5rem',
            borderRadius: '14px',
            background: 'rgba(30, 41, 59, 0.6)',
            border: subTab === 'invoices' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: '600' }}>Total Spend / Invoices</span>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CreditCard size={20} color="#38bdf8" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#38bdf8' }}>
            ₹{summary.totalSpent?.toLocaleString() || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#38bdf8', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Access complete invoices <ChevronRight size={14} />
          </div>
        </div>

        {/* Vehicle Reviews Card */}
        <div
          onClick={() => setSubTab('reviews')}
          className="glass-panel"
          style={{
            padding: '1.5rem',
            borderRadius: '14px',
            background: 'rgba(30, 41, 59, 0.6)',
            border: subTab === 'reviews' ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: '600' }}>My Reviews & Ratings</span>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Star size={20} color="#f59e0b" fill="#f59e0b" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f59e0b' }}>
            {summary.averageRatingGiven || (userRatings.length > 0 ? (userRatings.reduce((s, r) => s + r.score, 0) / userRatings.length).toFixed(1) : '5.0')} ⭐
          </div>
          <div style={{ fontSize: '0.8rem', color: '#fbbf24', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {userRatings.length} reviews submitted <ChevronRight size={14} />
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          background: 'rgba(15, 23, 42, 0.7)',
          padding: '0.35rem',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.08)',
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => setSubTab('overview')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '10px',
            border: 'none',
            background: subTab === 'overview' ? 'var(--primary, #6366f1)' : 'transparent',
            color: subTab === 'overview' ? '#fff' : '#94a3b8',
            fontWeight: '600',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          📊 Dashboard Overview
        </button>
        <button
          onClick={() => setSubTab('reservations')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '10px',
            border: 'none',
            background: subTab === 'reservations' ? 'var(--primary, #6366f1)' : 'transparent',
            color: subTab === 'reservations' ? '#fff' : '#94a3b8',
            fontWeight: '600',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          📅 My Reservations ({summary.totalReservations})
        </button>
        <button
          onClick={() => setSubTab('rentals')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '10px',
            border: 'none',
            background: subTab === 'rentals' ? 'var(--primary, #6366f1)' : 'transparent',
            color: subTab === 'rentals' ? '#fff' : '#94a3b8',
            fontWeight: '600',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          🔑 My Rentals ({summary.activeRentals + summary.completedRentals})
        </button>
        <button
          onClick={() => setSubTab('invoices')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '10px',
            border: 'none',
            background: subTab === 'invoices' ? 'var(--primary, #6366f1)' : 'transparent',
            color: subTab === 'invoices' ? '#fff' : '#94a3b8',
            fontWeight: '600',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          🧾 Invoices & Access
        </button>
        <button
          onClick={() => setSubTab('reviews')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '10px',
            border: 'none',
            background: subTab === 'reviews' ? 'var(--primary, #6366f1)' : 'transparent',
            color: subTab === 'reviews' ? '#fff' : '#94a3b8',
            fontWeight: '600',
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          ⭐ Given Reviews ({userRatings.length})
        </button>
      </div>

      {/* Main Tab Contents */}
      {subTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Recent Activity Streams */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
            
            {/* Recent Rentals Overview */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', background: 'rgba(30, 41, 59, 0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Key size={18} color="#34d399" /> Recent Rentals
                </h3>
                <button onClick={() => setSubTab('rentals')} style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.85rem', cursor: 'pointer' }}>
                  View All
                </button>
              </div>

              {dashboardData?.recentRentals && dashboardData.recentRentals.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {dashboardData.recentRentals.slice(0, 3).map((r) => (
                    <div
                      key={r._id || r.id}
                      style={{
                        padding: '1rem',
                        borderRadius: '10px',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                          {r.vehicle?.make ? `${r.vehicle.make} ${r.vehicle.model}` : `Rental ${r.rentalNumber}`}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                          Expected Return: {r.expectedReturnDate ? new Date(r.expectedReturnDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '8px',
                          background: r.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                          color: r.status === 'ACTIVE' ? '#34d399' : '#818cf8',
                        }}
                      >
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>No active or past rentals found.</p>
              )}
            </div>

            {/* Recent Reservations Overview */}
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', background: 'rgba(30, 41, 59, 0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={18} color="#818cf8" /> Recent Bookings
                </h3>
                <button onClick={() => setSubTab('reservations')} style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.85rem', cursor: 'pointer' }}>
                  View All
                </button>
              </div>

              {dashboardData?.recentReservations && dashboardData.recentReservations.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {dashboardData.recentReservations.slice(0, 3).map((resv) => (
                    <div
                      key={resv._id || resv.id}
                      style={{
                        padding: '1rem',
                        borderRadius: '10px',
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                          {resv.vehicle?.make ? `${resv.vehicle.make} ${resv.vehicle.model}` : `Booking ${resv.reservationNumber}`}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                          Dates: {new Date(resv.startDate).toLocaleDateString()} → {new Date(resv.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '8px',
                          background: resv.status === 'CONFIRMED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: resv.status === 'CONFIRMED' ? '#34d399' : '#fca5a5',
                        }}
                      >
                        {resv.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic', margin: 0 }}>No recent reservations found.</p>
              )}
            </div>

          </div>
        </div>
      )}

      {subTab === 'reservations' && (
        <MyReservations onBrowseVehicles={onBrowseVehicles} onNavigateRentals={() => setSubTab('rentals')} />
      )}

      {subTab === 'rentals' && (
        <MyRentals onBrowseVehicles={onBrowseVehicles} />
      )}

      {subTab === 'invoices' && (
        <MyInvoices onBrowseVehicles={onBrowseVehicles} />
      )}

      {subTab === 'reviews' && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', background: 'rgba(30, 41, 59, 0.6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>Your Ratings & Reviews History</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0.2rem 0 0 0' }}>
                Feedback submitted for vehicles you have rented across the platform.
              </p>
            </div>
          </div>

          {userRatings.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {userRatings.map((rating) => (
                <div
                  key={rating._id || rating.id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '12px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ fontWeight: '700', color: '#f8fafc' }}>
                      {rating.vehicle?.make ? `${rating.vehicle.make} ${rating.vehicle.model}` : 'Vehicle Review'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontWeight: '700' }}>
                      <Star size={16} fill="#f59e0b" color="#f59e0b" /> {rating.score}/5
                    </div>
                  </div>
                  {rating.comment && (
                    <p style={{ color: '#cbd5e1', fontSize: '0.875rem', fontStyle: 'italic', margin: '0 0 0.75rem 0' }}>
                      "{rating.comment}"
                    </p>
                  )}
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'right' }}>
                    Submitted on {new Date(rating.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Star size={40} color="#64748b" style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem', color: '#cbd5e1' }}>No Reviews Submitted Yet</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Complete a rental and share your experience with the community!
              </p>
              <button onClick={() => setSubTab('rentals')} className="btn btn-primary">
                View Rentals to Leave a Review
              </button>
            </div>
          )}
        </div>
      )}

      {/* Rating Modal Trigger */}
      {ratingModalVehicle && (
        <RatingModal
          vehicle={ratingModalVehicle}
          onClose={() => setRatingModalVehicle(null)}
          onSuccess={() => {
            setRatingModalVehicle(null);
            fetchDashboardData();
          }}
        />
      )}

      {/* Invoice Modal Trigger */}
      {invoiceModalData && (
        <InvoiceModal
          invoice={invoiceModalData}
          onClose={() => setInvoiceModalData(null)}
        />
      )}
    </div>
  );
}
