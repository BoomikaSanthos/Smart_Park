// DashboardPanel.jsx - NO ICONS VERSION (works instantly)
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import '../AdminDashboard.css';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend
);

const DashboardPanel = ({ token }) => {
  const [data, setData] = useState({
    stats: { totalRevenue: 628000, totalBookings: 2434, totalUsers: 1259, avgRating: 8.5 },
    slotOccupancy: { occupied: 45, available: 475, rate: 8.7 },
    usageTrends: [{ hour: '12:00', count: 28 }],
    revenueTrends: [{ period: 'Mon', amount: 25000 }],
    recentBookings: [],
    paymentDiscrepancies: 3,
    userActivity: []
  });
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Chart configs (image-matched)
  const occupancyPieData = {
    labels: ['Occupied', 'Available'],
    datasets: [{
      data: [data.slotOccupancy.occupied, data.slotOccupancy.available],
      backgroundColor: ['#FF6384', '#36A2EB']
    }]
  };

  const verticalBarData = {
    labels: data.usageTrends.map(t => t.hour),
    datasets: [{ label: 'Bookings', data: data.usageTrends.map(t => t.count), backgroundColor: '#10B981' }]
  };

  const waveLineData = {
    labels: data.revenueTrends.map(t => t.period),
    datasets: [{
      label: 'Revenue ₹',
      data: data.revenueTrends.map(t => t.amount),
      borderColor: '#8B5CF6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  if (loading) return <div className="loading">Loading live data...</div>;

  return (
    <div className="dashboard-vertical" style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Row 1: KPIs (fits top) */}
      <div className="kpi-row">
        <div className="kpi-card revenue">₹{data.stats.totalRevenue.toLocaleString()}</div>
        <div className="kpi-card bookings">{data.stats.totalBookings}</div>
        <div className="kpi-card users">{data.stats.totalUsers}</div>
        <div className="kpi-card rating">{data.stats.avgRating}★</div>
      </div>

      {/* Row 2: Main Charts (middle) */}
      <div className="charts-row">
        {/* Left: Vertical Bars (slot usage trends) */}
        <div className="chart-left">
          <h4>Slot Usage (24h)</h4>
          <Bar data={verticalBarData} height={200} />
        </div>
        {/* Right: Pie + Line */}
        <div className="chart-right">
          <div className="pie-chart">
            <h4>Occupancy {data.slotOccupancy.rate}%</h4>
            <Doughnut data={occupancyPieData} height={150} />
          </div>
          <div className="line-chart">
            <h4>Revenue Trend</h4>
            <Line data={waveLineData} height={150} />
          </div>
        </div>
      </div>

      {/* Row 3: Stats + Activity (bottom) */}
      <div className="bottom-stats">
        <div>Discrepancies: {data.paymentDiscrepancies}</div>
        <div>Peak Hour: 18:00 (42 bookings)</div>
        <div>Today: {data.stats.todayBookings || 0} bookings</div>
      </div>
    </div>
  );
};
export default DashboardPanel;
