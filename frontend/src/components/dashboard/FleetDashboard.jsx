import React, { useState, useEffect, useCallback } from 'react';
import dashboardService from '../../services/dashboard.service';
import {
  Car,
  TrendingUp,
  DollarSign,
  Wrench,
  Activity,
  Award,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  Layers,
  Calendar,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

const statusColorMap = {
  AVAILABLE: '#10b981',
  RESERVED: '#f59e0b',
  RENTED: '#3b82f6',
  RETURNED: '#8b5cf6',
  INSPECTION: '#06b6d4',
  DAMAGED: '#ef4444',
  MAINTENANCE: '#ec4899',
};

export default function FleetDashboard({ onNavigateToFleet, onNavigateToMaintenance }) {
  const [data, setData] = useState(null);
  const [trend, setTrend] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [syncNotice, setSyncNotice] = useState(null);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else if (!data) {
      setLoading(true);
    }
    setError(null);
    try {
      const [statsRes, trendRes, perfRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRevenueTrend(7).catch(() => ({ data: { data: [] } })),
        dashboardService.getVehiclePerformance().catch(() => ({ data: { data: [] } })),
      ]);

      setData(statsRes.data?.data || null);
      setTrend(trendRes.data?.data || []);
      setLeaderboard(perfRes.data?.data || []);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      if (isManualRefresh) {
        setSyncNotice('Telemetry & Financial Analytics Synced');
        setTimeout(() => setSyncNotice(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [data]);

  useEffect(() => {
    fetchDashboardData(false);
    const interval = setInterval(() => {
      fetchDashboardData(false);
    }, 15000); // Live sync every 15s
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={28} className="spin" style={{ margin: '0 auto 1rem', display: 'block', color: 'var(--primary)' }} />
        <h3 style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '0.5rem' }}>Aggregating Fleet &amp; Revenue Analytics...</h3>
        <p style={{ margin: 0 }}>Computing real-time statistics from MongoDB Atlas.</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#fca5a5' }}>
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button onClick={() => fetchDashboardData(true)} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  const { fleet = {}, revenue = {}, mostRentedVehicle = null } = data || {};
  const statusCounts = fleet.statusCounts || {};
  const typeBreakdown = fleet.typeBreakdown || {};

  const totalStatusCount = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem', letterSpacing: '-0.02em' }}>
            <Activity size={26} color="var(--primary)" /> Executive Fleet &amp; Revenue Dashboard
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              Live vehicle telemetry, fleet utilization, real-time revenue generation, and maintenance cost analysis.
            </p>
            {lastRefreshed && (
              <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.15rem 0.5rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                Live Sync: {lastRefreshed}
              </span>
            )}
            {syncNotice && (
              <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.15rem 0.6rem', borderRadius: '6px', fontWeight: 600 }}>
                ✓ {syncNotice}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="btn"
            style={{
              background: refreshing ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.06)',
              color: refreshing ? '#a5b4fc' : '#cbd5e1',
              border: refreshing ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
            }}
          >
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} /> {refreshing ? 'Syncing...' : 'Refresh'}
          </button>
          {onNavigateToFleet && (
            <button
              onClick={onNavigateToFleet}
              className="btn"
              style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Car size={16} /> Inventory
            </button>
          )}
          {onNavigateToMaintenance && (
            <button
              onClick={onNavigateToMaintenance}
              className="btn"
              style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.3)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Wrench size={16} /> Maintenance
            </button>
          )}
        </div>
      </div>

      {/* KPI Hero Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Card 1: Total Fleet & Utilization */}
        <div className="glass-panel" style={{ padding: '1.4rem', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #6366f1, #818cf8)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Total Fleet</span>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '0.45rem', borderRadius: '8px' }}>
              <Car size={20} color="#818cf8" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.1 }}>
            {fleet.totalVehicles || 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Vehicles</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}>
              <ArrowUpRight size={12} /> {fleet.utilizationRate || 0}%
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fleet Utilization</span>
          </div>
        </div>

        {/* Card 2: Operations Status */}
        <div className="glass-panel" style={{ padding: '1.4rem', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #10b981, #06b6d4)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Operations</span>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.45rem', borderRadius: '8px' }}>
              <CheckCircle size={20} color="#34d399" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', lineHeight: 1.1 }}>
            {statusCounts.AVAILABLE || 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>Available</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span><strong style={{ color: '#60a5fa' }}>{statusCounts.RENTED || 0}</strong> Rented</span>
            <span>•</span>
            <span><strong style={{ color: '#fbbf24' }}>{statusCounts.RESERVED || 0}</strong> Reserved</span>
          </div>
        </div>

        {/* Card 3: Revenue Generated */}
        <div className="glass-panel" style={{ padding: '1.4rem', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #f59e0b, #eab308)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Gross Revenue</span>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0.45rem', borderRadius: '8px' }}>
              <TrendingUp size={20} color="#fbbf24" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24', lineHeight: 1.1 }}>
            ₹{(revenue.monthlyRevenue || revenue.totalGrossRevenue || 0).toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Today: <strong style={{ color: '#fff' }}>₹{(revenue.dailyRevenue || 0).toLocaleString()}</strong></span>
            <span>•</span>
            <span>All-time: <strong style={{ color: '#fff' }}>₹{(revenue.totalGrossRevenue || 0).toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Card 4: Net Operational Profit */}
        <div className="glass-panel" style={{ padding: '1.4rem', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #ec4899, #a855f7)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Net Profit</span>
            <div style={{ background: 'rgba(236, 72, 153, 0.15)', padding: '0.45rem', borderRadius: '8px' }}>
              <ShieldCheck size={20} color="#f472b6" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: (revenue.netProfit || 0) >= 0 ? 'var(--accent-emerald)' : '#f87171', lineHeight: 1.1 }}>
            ₹{(revenue.netProfit || 0).toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Maintenance Spend: <strong style={{ color: '#f472b6' }}>₹{(revenue.totalMaintenanceCost || 0).toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      {/* Middle Row: Spotlight & Fleet Status Visualizer */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
        
        {/* Most Rented Vehicle Spotlight */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Award size={20} color="#fbbf24" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              Top Revenue Generator (Most Rented)
            </h3>
          </div>

          {mostRentedVehicle ? (
            <div style={{
              padding: '1.25rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(15, 23, 42, 0.6))',
              border: '1px solid rgba(99, 102, 241, 0.25)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                    {mostRentedVehicle.make} {mostRentedVehicle.model}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Reg: <code style={{ color: '#93c5fd' }}>{mostRentedVehicle.registrationNumber}</code> • {mostRentedVehicle.vehicleType}
                  </div>
                </div>
                <span style={{
                  background: statusColorMap[mostRentedVehicle.status] || '#10b981',
                  color: '#fff',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}>
                  {mostRentedVehicle.status}
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Total Bookings</span>
                  <strong style={{ fontSize: '1.2rem', color: '#fff' }}>{mostRentedVehicle.totalTrips || 0} Trips</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Gross Earned</span>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--accent-emerald)' }}>
                    ₹{(mostRentedVehicle.totalRevenue || 0).toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No rental data recorded yet.</p>
          )}
        </div>

        {/* Fleet Status Distribution Visualizer */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Layers size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              Live Fleet Status Allocation
            </h3>
          </div>

          {/* Color Bar Visualizer */}
          <div style={{
            height: '14px',
            borderRadius: '9999px',
            background: 'rgba(255,255,255,0.05)',
            display: 'flex',
            overflow: 'hidden',
            marginBottom: '1.25rem',
          }}>
            {Object.entries(statusCounts).map(([stat, count]) => {
              if (count === 0) return null;
              const widthPct = (count / totalStatusCount) * 100;
              return (
                <div
                  key={stat}
                  title={`${stat}: ${count} (${widthPct.toFixed(1)}%)`}
                  style={{
                    width: `${widthPct}%`,
                    background: statusColorMap[stat] || '#cbd5e1',
                    transition: 'width 0.3s ease',
                  }}
                />
              );
            })}
          </div>

          {/* Grid of status tags */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem' }}>
            {Object.entries(statusCounts).map(([stat, count]) => {
              const color = statusColorMap[stat] || '#cbd5e1';
              return (
                <div
                  key={stat}
                  style={{
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    background: `${color}15`,
                    border: `1px solid ${color}35`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color }}>{stat}</span>
                  <strong style={{ fontSize: '0.9rem', color: '#f8fafc' }}>{count}</strong>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 7-Day Revenue vs Maintenance Expense Trend */}
      {trend.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} color="#38bdf8" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                7-Day Cashflow Timeline (Revenue vs Maintenance Spend)
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399' }} /> Rental Revenue
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ec4899' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ec4899' }} /> Maintenance Spend
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${trend.length}, 1fr)`, gap: '0.75rem', overflowX: 'auto' }}>
            {trend.map((day, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem 0.75rem',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>{day.day}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  {day.date.split('-').slice(1).join('/')}
                </div>

                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399', marginBottom: '0.2rem' }}>
                  ₹{day.revenue?.toLocaleString() || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: day.maintenanceCost ? '#ec4899' : 'var(--text-muted)' }}>
                  ₹{day.maintenanceCost?.toLocaleString() || 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vehicle Performance Leaderboard */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              Fleet Performance &amp; Utilization Leaderboard
            </h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Ranked by Total Revenue Generated
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.75rem' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Rank</th>
                <th style={{ padding: '0.75rem 1rem' }}>Vehicle</th>
                <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem' }}>Daily Price</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Completed Bookings</th>
                <th style={{ padding: '0.75rem 1rem' }}>Days In Use</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Revenue Earned</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No vehicle performance records available.
                  </td>
                </tr>
              ) : (
                leaderboard.map((v, idx) => (
                  <tr
                    key={v.vehicleId || idx}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s ease' }}
                  >
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: idx === 0 ? '#fbbf24' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#b45309' : 'var(--text-muted)' }}>
                      #{idx + 1}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                        {v.make} {v.model}
                      </div>
                      <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.registrationNumber}</code>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: '#c7d2fe',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}>
                        {v.vehicleType}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>
                      ₹{v.pricePerDay?.toLocaleString()}/day
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: `${statusColorMap[v.status] || '#64748b'}20`,
                        color: statusColorMap[v.status] || '#94a3b8',
                        border: `1px solid ${statusColorMap[v.status] || '#64748b'}40`,
                      }}>
                        {v.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#f8fafc', fontWeight: 600 }}>
                      {v.totalTrips || 0}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                      {v.totalDaysUtilized || 0} days
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                      ₹{(v.totalRevenueEarned || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
