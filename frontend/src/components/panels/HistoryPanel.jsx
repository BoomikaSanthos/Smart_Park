import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import axios from 'axios';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28']; // Active/Future/Past

function HistoryPanel({ token }) {  // ✅ Standalone - no setPage/navbar
  const [bookings, setBookings_] = useState([]);
  const [loading, setLoading_] = useState(true);
  const [error, setError_] = useState(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading_(true);
      setError_(null);
      const res = await axios.get('/api/bookings/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings_(res.data.bookings || []);
    } catch (err) {
      setError_('Failed to load bookings. Check backend or login.');
      console.error('Bookings error:', err.response?.data || err.message);
    } finally {
      setLoading_(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchBookings();
  }, [fetchBookings, token]);

  const formatTime = (timeStr) => timeStr || 'N/A';

  if (loading) {
    return (
      <div className="history-fullscreen">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your parking history...</p>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'Active', value: bookings.filter(b => b.bookingType === 'active').length },
    { name: 'Past', value: bookings.filter(b => b.bookingType === 'past').length },
    { name: 'Future', value: bookings.filter(b => b.bookingType === 'future').length }
  ].filter(item => item.value > 0);

  return (
    <div className="history-fullscreen">
      <div className="history-header">
        <h1>🅿️ Your Parking History</h1>
        <p>{bookings.length} total bookings</p>
      </div>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button onClick={fetchBookings} className="retry-btn">Retry</button>
        </div>
      )}

      {/* Pie Chart */}
      <section className="chart-section">
        <h2>Booking Status</h2>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80}
                dataKey="value" nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-chart">
            <p>No bookings yet</p>
          </div>
        )}
      </section>

      {/* Bookings Table */}
      <section className="table-section">
        <h2>All Bookings ({bookings.length})</h2>
        {bookings.length === 0 ? (
          <div className="empty-state">
            <p>No parking bookings found.</p>
            <a href="/parking" className="book-now-btn">Book Now →</a>
          </div>
        ) : (
          <div className="table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>ID</th><th>Slot</th><th>Vehicle</th><th>Booked</th>
                  <th>Actual</th><th>Status</th><th>Payment</th><th>Type</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td title={booking._id}>{booking._id.slice(-8)}</td>
                    <td>{booking.slot?.location || 'N/A'}</td>
                    <td>{booking.vehicleNumber}</td>
                    <td>{booking.bookedDurationHours}h</td>
                    <td>
                      {formatTime(booking.actualEntryTime)}<br />
                      <small>{Math.round(booking.actualDurationMinutes)}m</small>
                    </td>
                    <td><span className={`status-badge ${booking.status}`}>
                      {booking.status?.toUpperCase()}
                    </span></td>
                    <td><span className={`payment-badge ${booking.paymentStatus}`}>
                      {booking.paymentStatus?.toUpperCase()}
                    </span></td>
                    <td><span className={`type-badge ${booking.bookingType}`}>
                      {booking.bookingType?.toUpperCase()}
                    </span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default HistoryPanel;
