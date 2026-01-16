import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';

function Slots({ setPage, locationId, pageData }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const hasAlert = (alerts) => alerts && Object.values(alerts).some(Boolean);

  useEffect(() => {
    let isMounted = true; // to prevent state update if component unmounts

    const fetchSlots = async () => {
      try {
        let url = 'http://localhost:5000/api/slots/with-status';
        if (locationId?.state) url += `?state=${locationId.state}`;
        if (locationId?.location) url += `${url.includes('?') ? '&' : '?'}location=${locationId.location}`;

        const res = await axios.get(url);
        if (isMounted) {
          setSlots(res.data.slots || []);
          setLoading(false);
        }
      } catch (err) {
        console.error('❌ Fetch error:', err);
        if (isMounted) setLoading(false);
      }
    };

    fetchSlots();
    const interval = setInterval(fetchSlots, 5000); // refresh every 5s for live alerts
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [locationId]);

  if (loading) {
    return (
      <div className="home">
        <Navbar setPage={setPage} />
        <main>
          <h1>Loading {locationId?.location || 'All'} slots...</h1>
        </main>
      </div>
    );
  }

  const locationName = locationId?.location
    ? locationId.location.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : 'All Slots';

  const availableSlots = slots.filter(s => s.isAvailable);

  return (
    <div className="home">
      <Navbar setPage={setPage} />
      <main>
        <button
          className="btn-secondary"
          onClick={() => setPage('map')}
          style={{ marginBottom: '1rem', padding: '0.75rem 1.5rem' }}
        >
          ← Back to Map
        </button>

        <h1>{locationName} Slots</h1>
        <p>{availableSlots.length}/{slots.length} available</p>

        <div className="features" style={{ justifyContent: 'flex-start', gap: '1rem' }}>
          {slots.map(slot => {
            const alertActive = hasAlert(slot.alerts);
            return (
              <div
                key={slot._id}
                className={`feature-card slot-card ${slot.isAvailable ? 'available' : 'booked'} ${alertActive ? 'alert' : ''}`}
              >
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                  {slot.slotNumber}
                </div>
                <div style={{ fontSize: '1rem', opacity: 0.9 }}>
                  {slot.location}
                </div>
                <div style={{ fontSize: '1.1rem', color: '#10b981', fontWeight: 700 }}>
                  ₹{slot.amount || 20}/hr
                </div>
                <span className="status">
                  {alertActive ? '🚨 ALERT' : slot.isAvailable ? '✅ Free' : '❌ Booked'}
                </span>

                {alertActive && (
                  <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#dc2626' }}>
                    {slot.alerts.systemError && <div>⚠️ System Error</div>}
                    {slot.alerts.maintenance && <div>🔧 Maintenance</div>}
                    {slot.alerts.infrastructure && <div>🏗️ Infrastructure</div>}
                  </div>
                )}

                {slot.isAvailable && !alertActive && (
                  <button
                    className="btn-main"
                    style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}
                    onClick={() => setPage('booking', { selectedSlot: slot, locationId })}
                  >
                    Book Slot
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <style jsx>{`
          .slot-card.available {
            background: rgba(16,185,129,0.3) !important;
            border-left: 5px solid #10b981 !important;
          }
          .slot-card.booked {
            background: rgba(239,68,68,0.3) !important;
            border-left: 5px solid #ef4444 !important;
            opacity: 0.8;
          }
          .slot-card.alert {
            background: #f3f4f65d !important;
            border-left: 5px solid #ef4444 !important;
            opacity: 0.9;
          }
          .status {
            font-size: 0.9rem;
            margin-top: 0.5rem;
            font-weight: 600;
          }
          .btn-main, .btn-secondary {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
          }
          .btn-main {
            background: #3b82f6;
            color: white;
          }
          .btn-secondary {
            background: #6b7280;
            color: white;
          }
        `}</style>
      </main>
    </div>
  );
}

export default Slots;
