// src/pages/History.jsx - Full Payment Status + Smart Controls
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';

const History = ({ setPage }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'all', paymentStatus: 'all' });
  const [token] = useState(localStorage.getItem('token'));

  const fetchHistory = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/bookings/history', {
        headers: { 'x-auth-token': token }
      });
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error('History fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // 🚀 CHECK-IN API
  const handleCheckIn = async (bookingId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/checkin`, {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        fetchHistory();
      } else {
        alert('Check-in failed');
      }
    } catch (err) {
      alert('Check-in error');
    }
  };

  // 🚀 CHECK-OUT API
  const handleCheckOut = async (bookingId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}/checkout`, {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        fetchHistory();
      } else {
        alert('Check-out failed');
      }
    } catch (err) {
      alert('Check-out error');
    }
  };

  // 🚀 FULL PAYMENT STATUS + CHECK-IN/CHECK-OUT LOGIC
  const calculateBookingStatus = useCallback((booking) => {
    const now = new Date();
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    const entry = booking.actualEntryTime ? new Date(booking.actualEntryTime) : null;
    const exit = booking.actualExitTime ? new Date(booking.actualExitTime) : null;

    // Backend payment status (priority)
    const backendPaymentStatus = booking.paymentStatus || booking.payment?.status || 'pending';

    // Booking lifecycle status
    let bookingStatus = 'future';
    if (now < start) bookingStatus = 'future';
    else if (now >= start && now <= end) bookingStatus = 'active';
    else if (exit) bookingStatus = 'completed';
    else if (!entry && now > end) bookingStatus = 'no-show';

    // Slot usage duration
    let actualDurationMinutes = 0;
    if (entry && exit) actualDurationMinutes = (exit - entry) / 60000;
    else if (entry && !exit) actualDurationMinutes = (now - entry) / 60000;
    else actualDurationMinutes = (end - start) / 60000;

    // Payment calculation: 1 slab = 15min = ₹5
    const slabs = Math.ceil(actualDurationMinutes / 15);
    let parkingCharge = slabs * 5;
    let penalty = 0;
    let penaltyType = '';

    // Penalty rules
    const isNoShow = !entry && now > end;
    if (isNoShow) {
      parkingCharge = 0;
      penalty = 5;
      penaltyType = 'no-show';
    } else if (exit && (now - exit) > 86400000) { // >1 day late
      penalty = 5;
      penaltyType = 'late-payment';
    }

    const totalAmount = parkingCharge + penalty;

    // ✅ Button visibility logic
    const showCheckIn = bookingStatus === 'active' && !entry;
    const showCheckOut = bookingStatus === 'active' && entry && !exit &&
                        actualDurationMinutes >= ((end - start) / 60000);
    const showPayButton = backendPaymentStatus === 'pending' &&
                         (bookingStatus === 'no-show' || bookingStatus === 'completed');

    return {
      bookingStatus,
      paymentStatus: backendPaymentStatus,
      showCheckIn,
      showCheckOut,
      showPayButton,
      amount: totalAmount,
      parkingCharge,
      penalty,
      slabs,
      actualDurationMinutes: Math.round(actualDurationMinutes),
      penaltyType
    };
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Enrich bookings
  const enrichedBookings = bookings.map(booking => ({
    ...booking,
    ...calculateBookingStatus(booking)
  }));

  const filteredBookings = enrichedBookings.filter(b => {
    return (filters.status === 'all' || b.bookingStatus === filters.status) &&
           (filters.paymentStatus === 'all' || b.paymentStatus === filters.paymentStatus);
  });

  const handlePayClick = (booking) => {
    setPage('payment', {
      bookingId: booking._id,
      amount: booking.amount,
      parkingCharge: booking.parkingCharge,
      penalty: booking.penalty,
      penaltyType: booking.penaltyType,
      actualDurationMinutes: booking.actualDurationMinutes,
      vehicleNumber: booking.vehicleNumber,
      slotNumber: booking.slot?.slotNumber || 'N/A',
      slabs: booking.slabs,
      paymentStatus: booking.paymentStatus
    });
  };

  if (loading) {
    return (
      <div className="history-loading">
        <Navbar setPage={setPage} />
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Loading booking controls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <Navbar setPage={setPage} />

      {/* Dual Filters */}
      <div className="history-header">
        <div>
          <h1>🅿️ Parking Dashboard</h1>
          <p>{filteredBookings.length} bookings • Payment: {filters.paymentStatus}</p>
        </div>
        <div className="dual-filters">
          <select
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
            className="filter-select"
          >
            <option value="all">All Booking Status</option>
            <option value="future">Future</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="no-show">No-Show</option>
          </select>
          <select
            value={filters.paymentStatus}
            onChange={e => setFilters({ ...filters, paymentStatus: e.target.value })}
            className="filter-select"
          >
            <option value="all">All Payment Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="history-grid">
        {filteredBookings.map((booking) => (
          <div key={booking._id} className={`booking-card ${booking.bookingStatus}`}>
            {/* Header: Slot + Booking Status */}
            <div className="booking-header">
              <div className="slot-info">
                <span className="slot-number">Slot {booking.slot?.slotNumber || 'N/A'}</span>
                <span className="location">{booking.slot?.location || '—'}</span>
              </div>
              <div className={`status-badge booking-${booking.bookingStatus}`}>
                {booking.bookingStatus.toUpperCase()}
              </div>
            </div>

            {/* Payment Status Badge */}
            <div className={`payment-status-badge ${booking.paymentStatus}`}>
              💳 {booking.paymentStatus.toUpperCase()}
            </div>

            {/* Vehicle & Time */}
            <div className="booking-details">
              <div className="vehicle-plate">{booking.vehicleNumber}</div>
              <div className="time-range">
                📅 {formatDate(booking.startTime)} → {formatDate(booking.endTime)}
              </div>
              <div className="slot-usage">
                ⏱️ Used: {booking.actualDurationMinutes}min ({booking.slabs} slabs)
              </div>
            </div>

            {/* Check-in/Checkout Controls */}
            <div className="control-buttons">
              {booking.showCheckIn && (
                <button className="checkin-btn" onClick={() => handleCheckIn(booking._id)}>
                  🚗 CHECK IN
                </button>
              )}
              {booking.showCheckOut && (
                <button className="checkout-btn" onClick={() => handleCheckOut(booking._id)}>
                  🚙 CHECK OUT
                </button>
              )}
              {!booking.showCheckIn && !booking.showCheckOut && (
                <div className="no-controls">✓ Time completed</div>
              )}
            </div>

            {/* Fee Breakdown */}
            <div className="fee-breakdown">
              <div className="fee-row">
                <span>🅿️ Parking ({booking.slabs} × 15min)</span>
                <span>₹{booking.parkingCharge}</span>
              </div>
              {booking.penalty > 0 && (
                <div className="fee-row penalty">
                  <span>⚠️ {booking.penaltyType?.replace('-', ' ').toUpperCase()}</span>
                  <span>+₹{booking.penalty}</span>
                </div>
              )}
              <div className="fee-total">
                <strong>₹{booking.amount}</strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              {booking.showPayButton && booking.paymentStatus === 'pending' && (
                <button className="pay-button" onClick={() => handlePayClick(booking)}>
                  💳 PAY ₹{booking.amount}
                </button>
              )}
              {booking.paymentStatus === 'paid' && (
                <div className="paid-status">✅ Payment Completed</div>
              )}
              {booking.paymentStatus === 'completed' && (
                <div className="completed-status">✅ Booking Completed</div>
              )}
            </div>

            {/* Payment Method */}
            {booking.paymentMethod && (
              <div className="payment-method">
                💳 {booking.paymentMethod.toUpperCase()}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🚗</div>
          <h2>No matching bookings</h2>
          <p>Filter by booking status or payment status</p>
          <button onClick={() => setPage('slots')} className="cta-button">
            Book New Slot
          </button>
        </div>
      )}
    </div>
  );
};

export default History;
