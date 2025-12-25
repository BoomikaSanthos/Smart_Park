import React, { useState, useEffect } from 'react';
import axios from 'axios';

function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch booking history from your backend API
    axios.get('/api/bookings/history') // Replace with your actual API endpoint
      .then(response => {
        setBookings(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching bookings:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading booking history...</p>;

  return (
    <div>
      <h2>Booking History</h2>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <ul>
          {bookings.map(booking => (
            <li key={booking._id}>
              <p>Slot: {booking.slot}</p>
              <p>Date: {booking.date}</p>
              <p>Status: {booking.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BookingHistory;
