import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from "recharts";

const API_BASE = "http://localhost:5000/api/analytics";

const Analytics = () => {
  const [filters, setFilters] = useState({
    time: "month", type: "admin", state: "TN", location: "", userId: ""
  });
  const [states, setStates] = useState([]);
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Back button
  const goBackToHome = () => {
    window.location.href = '/';
  };

  // 🎯 STYLED HTML REPORT EXPORT (Enhanced)
  const exportStyledReport = useCallback(() => {
    const now = new Date();
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Smart Parking Analytics Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; color: #1e293b; }
    .container { max-width: 1400px; margin: 0 auto; background: rgba(255,255,255,0.95); border-radius: 24px; box-shadow: 0 30px 60px rgba(0,0,0,0.2); overflow: hidden; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; }
    .header h1 { font-size: 2.8em; font-weight: 900; margin-bottom: 10px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; padding: 40px; }
    .metric-card { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 30px; border-radius: 20px; text-align: center; box-shadow: 0 15px 35px rgba(0,0,0,0.1); }
    .metric-value { font-size: 3em; font-weight: 900; }
    .metric-blue { color: #3b82f6; } .metric-gold { color: #f59e0b; } .metric-red { color: #ef4444; } .metric-green { color: #10b981; }
    .table-section { padding: 40px; border-top: 1px solid #e2e8f0; }
    .table-title { font-size: 1.8em; color: #1e293b; margin-bottom: 25px; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    th { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 15px; text-align: left; font-weight: 600; }
    td { padding: 18px 15px; border-bottom: 1px solid #f1f5f9; }
    tr:hover { background: #f8fafc; }
    .status-pending { background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; }
    .status-completed { background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; }
    .footer { background: #f8fafc; padding: 30px; text-align: center; color: #64748b; border-top: 1px solid #e2e8f0; }
    .user-info { background: linear-gradient(135deg, #10b981, #059669); margin: 20px 40px; padding: 25px; border-radius: 16px; color: white; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚗 Smart Parking Analytics</h1>
      <p>Generated: ${now.toLocaleString('en-IN')} | ${filters.type.toUpperCase()} | ${filters.time.toUpperCase()}</p>
      ${filters.type === 'user' && metrics.userDetails ? `
        <div class="user-info">
          <strong>👤 User:</strong> ${metrics.userDetails.name} | 🚗 ${metrics.userDetails.vehicleNumber}
        </div>
      ` : ''}
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value metric-blue">${(metrics.totalBookings || 0).toLocaleString()}</div>
        <div>Total Bookings</div>
      </div>
      <div class="metric-card">
        <div class="metric-value metric-gold">₹${(metrics.totalRevenue || 0).toLocaleString('en-IN')}</div>
        <div>Total Revenue</div>
      </div>
      <div class="metric-card">
        <div class="metric-value metric-red">${metrics.activeBookings || 0}</div>
        <div>Active Bookings</div>
      </div>
      <div class="metric-card">
        <div class="metric-value metric-green">${(metrics.averageDurationHours || 0).toFixed(1)}h</div>
        <div>Avg Duration</div>
      </div>
    </div>

    <div class="table-section">
      <h2 class="table-title">📊 Peak Hours Analysis (HH:00 - HH:59)</h2>
      <table>
        <thead><tr><th>Time Slot</th><th>Bookings</th><th>% of Total</th></tr></thead>
        <tbody>
          ${metrics.peakHours?.map(h => {
            const total = metrics.peakHours.reduce((sum, x) => sum + x.bookings, 0);
            const pct = total > 0 ? ((h.bookings / total) * 100).toFixed(1) : 0;
            return `<tr><td>${String(h.hour).padStart(2,'0')}:00-${String(h.hour).padStart(2,'0')}:59</td><td>${h.bookings}</td><td>${pct}%</td></tr>`;
          }).join('') || '<tr><td colspan="3">No data available</td></tr>'}
        </tbody>
      </table>
    </div>

    <div class="table-section">
      <h2 class="table-title">🎯 Top Slot Usage</h2>
      <table>
        <thead><tr><th>Slot ID</th><th>Bookings</th><th>% Usage</th></tr></thead>
        <tbody>
          ${metrics.slotUsage?.slice(0, 15).map(s => {
            const total = metrics.slotUsage.reduce((sum, x) => sum + x.bookings, 0);
            const pct = total > 0 ? ((s.bookings / total) * 100).toFixed(1) : 0;
            return `<tr><td>${s.slot}</td><td>${s.bookings}</td><td>${pct}%</td></tr>`;
          }).join('') || '<tr><td colspan="3">No data available</td></tr>'}
        </tbody>
      </table>
    </div>

    <div class="table-section">
      <h2 class="table-title">💰 Payment Status Distribution</h2>
      <table>
        <thead><tr><th>Status</th><th>Count</th><th>Percentage</th></tr></thead>
        <tbody>
          ${(() => {
            const totalPayments = (metrics.pendingPayments || 0) + (metrics.completedPayments || 0);
            const pendingPct = totalPayments > 0 ? ((metrics.pendingPayments / totalPayments) * 100).toFixed(1) : 0;
            const completedPct = totalPayments > 0 ? ((metrics.completedPayments / totalPayments) * 100).toFixed(1) : 0;
            return `
              <tr><td><span class="status-pending">⏳ Pending</span></td><td>${metrics.pendingPayments || 0}</td><td>${pendingPct}%</td></tr>
              <tr><td><span class="status-completed">✅ Completed</span></td><td>${metrics.completedPayments || 0}</td><td>${completedPct}%</td></tr>
            `;
          })()}
        </tbody>
      </table>
    </div>

    <div class="footer">
      <p>Smart Parking System | Pattukkottai, Tamil Nadu | ${now.getFullYear()}</p>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `parking-report-${filters.type}-${filters.time}-${now.toISOString().split('T')[0]}.html`;
    link.click();
    URL.revokeObjectURL(url);
  }, [metrics, filters]);

  // 🎯 CSV EXPORT
  const exportToCSV = useCallback(() => {
    let csv = '';
    const now = new Date();
    const filename = `parking-report-${filters.type}-${filters.time}-${now.toISOString().split('T')[0]}.csv`;

    csv += '\uFEFF'; // BOM for Excel UTF-8 support

    csv += `SUMMARY METRICS,Value,Unit\n`;
    csv += `Generated On,${now.toLocaleString('en-IN')},\n`;
    csv += `Report Type,${filters.type.toUpperCase()},,\n`;
    csv += `Time Period,${filters.time.toUpperCase()},,\n`;
    csv += `State,${filters.state || 'ALL'},,\n`;
    csv += `Location,${filters.location || 'ALL'},,\n\n`;

    csv += `Total Bookings,${metrics.totalBookings || 0},count\n`;
    csv += `Total Revenue,₹${(metrics.totalRevenue || 0).toLocaleString('en-IN')},INR\n`;
    csv += `Active Bookings,${metrics.activeBookings || 0},count\n`;
    csv += `Average Duration,${(metrics.averageDurationHours || 0).toFixed(1)},hours\n`;
    csv += `Pending Payments,${metrics.pendingPayments || 0},count\n`;
    csv += `Completed Payments,${metrics.completedPayments || 0},count\n`;
    if (filters.type === 'admin' && metrics.totalUsers) {
      csv += `Total Users,${metrics.totalUsers},count\n`;
    }
    csv += `\n`;

    csv += `PEAK HOURS ANALYSIS (HH:00-HH:59),Bookings,Percentage\n`;
    if (metrics.peakHours?.length > 0) {
      const totalPeak = metrics.peakHours.reduce((sum, h) => sum + h.bookings, 0);
      metrics.peakHours.forEach(hour => {
        const pct = totalPeak > 0 ? ((hour.bookings / totalPeak) * 100).toFixed(1) : '0.0';
        csv += `"${String(hour.hour).padStart(2,'0')}:00-${String(hour.hour).padStart(2,'0')}:59",${hour.bookings},${pct}%\n`;
      });
    } else {
      csv += `No peak data available,0,0%\n`;
    }
    csv += `\n`;

    csv += `TOP SLOT USAGE,Bookings,Percentage\n`;
    if (metrics.slotUsage?.length > 0) {
      const totalSlots = metrics.slotUsage.reduce((sum, s) => sum + s.bookings, 0);
      metrics.slotUsage.slice(0, 20).forEach(slot => {
        const pct = totalSlots > 0 ? ((slot.bookings / totalSlots) * 100).toFixed(1) : '0.0';
        csv += `"${slot.slot}",${slot.bookings},${pct}%\n`;
      });
    } else {
      csv += `No slot data available,0,0%\n`;
    }
    csv += `\n`;

    csv += `PAYMENT STATUS DISTRIBUTION,Count,Percentage\n`;
    const totalPayments = (metrics.pendingPayments || 0) + (metrics.completedPayments || 0);
    csv += `⏳ Pending,${metrics.pendingPayments || 0},${totalPayments > 0 ? ((metrics.pendingPayments / totalPayments) * 100).toFixed(1) : 0}%\n`;
    csv += `✅ Completed,${metrics.completedPayments || 0},${totalPayments > 0 ? ((metrics.completedPayments / totalPayments) * 100).toFixed(1) : 0}%\n`;
    csv += `Total,${totalPayments},100%\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [metrics, filters]);

  // Load locations for selected state
  const loadLocationsForState = useCallback(async (state) => {
    if (!state) { setLocations([]); return; }
    try {
      const res = await axios.get(`${API_BASE}/locations?state=${state}`).catch(() => ({ data: [] }));
      setLocations(res.data);
    } catch (err) {
      console.error('Locations load failed:', err);
      setLocations([]);
    }
  }, []);

  // Load dropdown data
  const loadDropdowns = useCallback(async () => {
    try {
      const [statesRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE}/states`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/users`, {
          headers: { "x-auth-token": localStorage.getItem("token") }
        }).catch(() => ({ data: { users: [] } }))
      ]);
      setStates(statesRes.data);
      setUsers(usersRes.data.users || []);
    } catch (err) {
      console.error('Dropdown load failed:', err);
    }
  }, []);

  // Transform peakHours data for better chart labels
  const transformedPeakHours = useMemo(() => {
    if (!metrics.peakHours?.length) return [];
    return metrics.peakHours.map(hour => ({
      ...hour,
      timeLabel: `${String(hour.hour).padStart(2, '0')}:00-${String(hour.hour).padStart(2, '0')}:59`,
      hourLabel: `${String(hour.hour).padStart(2, '0')}:30` // Center time for label
    }));
  }, [metrics.peakHours]);

  // Fetch analytics metrics
  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const currentTime = new Date().toLocaleTimeString();
      setLastUpdate(currentTime);

      const params = new URLSearchParams();
      params.append('time', filters.time);
      params.append('type', filters.type);
      if (filters.state) params.append('state', filters.state);
      if (filters.location) params.append('location', filters.location);
      if (filters.type === 'user' && filters.userId) params.append('userId', filters.userId);

      const url = `${API_BASE}/custom?${params.toString()}`;
      const res = await axios.get(url, {
        headers: { "x-auth-token": localStorage.getItem("token") },
        timeout: 15000
      });

      setMetrics({
        totalBookings: Number(res.data.totalBookings) || 0,
        totalRevenue: Number(res.data.totalRevenue) || 0,
        activeBookings: Number(res.data.activeBookings) || 0,
        averageDurationHours: Number(res.data.averageDurationHours) || 0,
        pendingPayments: Number(res.data.pendingPayments) || 0,
        completedPayments: Number(res.data.completedPayments) || 0,
        peakHours: Array.isArray(res.data.peakHours) ? res.data.peakHours : [],
        slotUsage: Array.isArray(res.data.slotUsage) ? res.data.slotUsage : [],
        userDetails: res.data.userDetails || null,
        totalUsers: Number(res.data.totalUsers) || 0
      });
    } catch (err) {
      setError(`No data for ${filters.type === 'user' ? `user` : 'selection'}`);
      setMetrics({
        totalBookings: 0, peakHours: [], slotUsage: [], totalRevenue: 0,
        activeBookings: 0, averageDurationHours: 0, pendingPayments: 0,
        completedPayments: 0, totalUsers: 0
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Effects
  useEffect(() => { loadDropdowns(); }, [loadDropdowns]);
  useEffect(() => { loadLocationsForState(filters.state); }, [filters.state, loadLocationsForState]);
  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);
  useEffect(() => {
    const interval = setInterval(fetchMetrics, 900000); // 15 min
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'state' ? { location: '', userId: '' } : {}),
      ...(name === 'location' ? { userId: '' } : {}),
      ...(name === 'type' ? { userId: '' } : {})
    }));
  }, []);

  const paymentData = useMemo(() => [
    { name: '⏳ Pending', value: metrics.pendingPayments || 0, color: '#f97316' },
    { name: '✅ Completed', value: metrics.completedPayments || 0, color: '#10b981' },
  ].filter(d => d.value > 0), [metrics]);

  return (
    <div style={{
      padding: 30, maxWidth: 1600, margin: '0 auto',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      fontFamily: "'Segoe UI', Arial, sans-serif"
    }}>
      {/* TITLE */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{
          fontSize: '3.5em', fontWeight: 900,
          background: 'linear-gradient(45deg, #fff, #e2e8f0)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0
        }}>
          🚗 Smart Parking Analytics
        </h1>
        {lastUpdate && <div style={{ color: '#e2e8f0', fontSize: '1.1em', marginTop: 10 }}>
          Last updated: {lastUpdate} • Auto-refresh: 15min 🔄
        </div>}
      </div>

      {/* BUTTONS */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 15,
        padding: '20px 30px', background: 'rgba(255,255,255,0.95)',
        borderRadius: 24, marginBottom: 30, boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <button onClick={goBackToHome} style={{
          padding: '14px 28px', background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: 'white', border: 'none', borderRadius: 16, fontWeight: 600,
          fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 25px rgba(239,68,68,0.4)'
        }}>
          ← Back to Home
        </button>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={exportStyledReport}
            disabled={loading || metrics.totalBookings === 0}
            style={{
              padding: '14px 28px',
              background: loading || metrics.totalBookings === 0
                ? '#9ca3af'
                : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white', border: 'none', borderRadius: 16, fontWeight: 600,
              fontSize: '16px', cursor: (loading || metrics.totalBookings === 0) ? 'not-allowed' : 'pointer',
              boxShadow: '0 10px 25px rgba(102,126,234,0.4)'
            }}
            title="Beautiful HTML report with charts & styling"
          >
            🌟 Styled HTML Report
          </button>
          <button
            onClick={exportToCSV}
            disabled={loading || metrics.totalBookings === 0}
            style={{
              padding: '14px 28px',
              background: loading || metrics.totalBookings === 0
                ? '#9ca3af'
                : 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white', border: 'none', borderRadius: 16, fontWeight: 600,
              fontSize: '16px', cursor: (loading || metrics.totalBookings === 0) ? 'not-allowed' : 'pointer',
              boxShadow: '0 10px 25px rgba(16,185,129,0.4)'
            }}
            title="Excel-ready CSV with all data"
          >
            📊 Excel CSV Report
          </button>
        </div>
      </div>

      {/* USER INFO */}
      {filters.type === 'user' && metrics.userDetails && (
        <div style={{
          background: 'rgba(255,255,255,0.95)', padding: 25, borderRadius: 20,
          marginBottom: 30, backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '2px solid #10b981'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#059669', fontSize: '1.4em' }}>👤 Selected User</h3>
          <div style={{ fontSize: '1.2em', color: '#1e293b', lineHeight: '1.6' }}>
            <strong>{metrics.userDetails.name}</strong><br/>🚗 {metrics.userDetails.vehicleNumber}
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div style={{
        display: 'flex', gap: 15, flexWrap: 'wrap', padding: 30,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
        borderRadius: 24, marginBottom: 40, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <select name="time" value={filters.time} onChange={handleFilterChange}
          style={{ padding: '16px 20px', borderRadius: 16, border: '2px solid #e2e8f0',
            background: 'white', minWidth: 160, fontWeight: 500 }}>
          <option value="month">📅 All Data</option>
          <option value="week">📅 Last 7 Days</option>
          <option value="day">📅 Today</option>
        </select>
        <select name="type" value={filters.type} onChange={handleFilterChange}
          style={{ padding: '16px 20px', borderRadius: 16, border: '2px solid #e2e8f0',
            background: 'white', minWidth: 200 }}>
          <option value="admin">🏢 Admin (All Users)</option>
          <option value="user">👤 Single User</option>
        </select>
        <select name="state" value={filters.state} onChange={handleFilterChange}
          style={{ padding: '16px 20px', borderRadius: 16, border: '2px solid #e2e8f0',
            background: 'white', minWidth: 160 }}>
          <option value="">🌍 All States</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select name="location" value={filters.location} onChange={handleFilterChange}
          style={{ padding: '16px 20px', borderRadius: 16, border: '2px solid #e2e8f0',
            background: 'white', minWidth: 220 }}>
          <option value="">📍 All Locations ({filters.state || 'Any'})</option>
          {locations.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        {filters.type === 'user' && (
          <select name="userId" value={filters.userId} onChange={handleFilterChange}
            style={{ minWidth: 300, padding: '16px 20px', borderRadius: 16,
              border: '2px solid #e2e8f0', background: 'white' }}>
            <option value="">👤 Select User</option>
            {users.slice(0, 10).map(u => (
              <option key={u._id} value={u._id}>{u.name} ({u.vehicleNumber})</option>
            ))}
          </select>
        )}
        {loading && <div style={{ padding: '16px 28px', background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
          color: 'white', borderRadius: 20, fontWeight: 600 }}>🔄 LOADING...</div>}
        {error && !loading && <div style={{ padding: '16px 28px', background: 'linear-gradient(90deg, #f59e0b, #d97706)',
          color: 'white', borderRadius: 20 }}>ℹ️ {error}</div>}
      </div>

      {/* KPI CARDS */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 25, marginBottom: 40, padding: '40px',
        background: 'rgba(255,255,255,0.95)', borderRadius: '24px',
        boxShadow: '0 30px 60px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          padding: 30, borderRadius: 20, textAlign: 'center',
          boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '0.9em', opacity: 0.8, marginBottom: 12, color: '#64748b' }}>Total Bookings</div>
          <div style={{ fontSize: '3em', fontWeight: 900, color: '#3b82f6' }}>
            {(metrics.totalBookings || 0).toLocaleString()}
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          padding: 30, borderRadius: 20, textAlign: 'center',
          boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '0.9em', opacity: 0.8, marginBottom: 12, color: '#64748b' }}>Total Revenue</div>
          <div style={{ fontSize: '3em', fontWeight: 900, color: '#f59e0b' }}>
            ₹{(metrics.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          padding: 30, borderRadius: 20, textAlign: 'center',
          boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '0.9em', opacity: 0.8, marginBottom: 12, color: '#64748b' }}>Active Bookings</div>
          <div style={{ fontSize: '3em', fontWeight: 900, color: '#ef4444' }}>
            {metrics.activeBookings || 0}
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          padding: 30, borderRadius: 20, textAlign: 'center',
          boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '0.9em', opacity: 0.8, marginBottom: 12, color: '#64748b' }}>Avg Duration</div>
          <div style={{ fontSize: '3em', fontWeight: 900, color: '#10b981' }}>
            {(metrics.averageDurationHours || 0).toFixed(1)}h
          </div>
        </div>
      </div>

      {/* CHARTS - Enhanced with Labels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, marginBottom: 30 }}>
        <div style={{
          padding: 40, background: 'rgba(255,255,255,0.95)', borderRadius: 24,
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(20px)'
        }}>
          <h3 style={{ margin: '0 0 25px 0', fontSize: '1.9em', color: '#1e293b', fontWeight: 700 }}>
            📊 Peak Hours Distribution<br/>
            <span style={{ fontSize: '0.85em', color: '#64748b', fontWeight: 400 }}>Bookings per hour (HH:00 - HH:59)</span>
          </h3>
          {transformedPeakHours.length > 0 ? (
            <ResponsiveContainer width="100%" height={420}>
              <BarChart data={transformedPeakHours} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="hourLabel"
                  stroke="#64748b"
                  fontSize={13}
                  fontWeight={600}
                  tickLine={false}
                  tickMargin={10}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={13}
                  fontWeight={500}
                  tickLine={false}
                />
                <Tooltip
                  labelFormatter={(label) => `Time: ${label}`}
                  formatter={(value) => [`${value} Bookings`, 'Count']}
                />
                <Legend />
                <Bar
                  dataKey="bookings"
                  fill="#667eea"
                  name="Bookings"
                  radius={[8, 8, 0, 0]}
                  barSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#94a3b8', fontSize: '1.2em', flexDirection: 'column' }}>
              <div>📈 No peak hour data</div>
              <div style={{ fontSize: '0.9em', opacity: 0.7, marginTop: 8 }}>Try different time filters</div>
            </div>
          )}
        </div>

        <div style={{
          padding: 40, background: 'rgba(255,255,255,0.95)', borderRadius: 24,
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(20px)'
        }}>
          <h3 style={{ margin: '0 0 25px 0', fontSize: '1.9em', color: '#1e293b', fontWeight: 700 }}>
            💰 Payment Status Breakdown<br/>
            <span style={{ fontSize: '0.85em', color: '#64748b', fontWeight: 400 }}>Pending vs Completed payments</span>
          </h3>
          {paymentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={420}>
              <PieChart>
                <Pie
                  data={paymentData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={130}
                  cornerRadius={12}
                  minAngle={15}
                  label={({ name, percent, value }) =>
                    `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                  }
                  labelLine={true}
                >
                  {paymentData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} strokeWidth={3} stroke="rgba(255,255,255,0.8)" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} payments`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#94a3b8', fontSize: '1.2em', flexDirection: 'column' }}>
              <div>💳 No payment data</div>
              <div style={{ fontSize: '0.9em', opacity: 0.7, marginTop: 8 }}>No transactions found</div>
            </div>
          )}
        </div>
      </div>

      <div style={{
        padding: 40, background: 'rgba(255,255,255,0.95)', borderRadius: 24,
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(20px)'
      }}>
        <h3 style={{ margin: '0 0 30px 0', fontSize: '1.9em', color: '#1e293b', fontWeight: 700 }}>
          🎯 Top Parking Slot Usage<br/>
          <span style={{ fontSize: '0.85em', color: '#64748b', fontWeight: 400 }}>Most popular slots by bookings</span>
        </h3>
        {metrics.slotUsage?.length > 0 ? (
          <ResponsiveContainer width="100%" height={480}>
            <BarChart data={metrics.slotUsage.slice(0, 15)} layout="vertical" margin={{ right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                type="number"
                stroke="#64748b"
                fontSize={13}
                fontWeight={500}
                tickLine={false}
              />
              <YAxis
                dataKey="slot"
                type="category"
                width={140}
                stroke="#64748b"
                fontSize={13}
                fontWeight={600}
                tickLine={false}
                tickMargin={8}
              />
              <Tooltip
                formatter={(value) => [`${value} bookings`, 'Usage']}
                labelFormatter={(label) => `Slot ${label}`}
              />
              <Legend />
              <Bar
                dataKey="bookings"
                fill="#10b981"
                name="Bookings per Slot"
                radius={[6, 6, 0, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#94a3b8', fontSize: '1.2em', flexDirection: 'column' }}>
            <div>🎯 No slot usage data</div>
            <div style={{ fontSize: '0.9em', opacity: 0.7, marginTop: 8 }}>No parking slot bookings</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
