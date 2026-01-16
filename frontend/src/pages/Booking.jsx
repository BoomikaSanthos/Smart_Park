import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';

function Booking({ setPage, selectedSlot, locationId }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentPreview, setPaymentPreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const token = localStorage.getItem('token');
  const [form, setForm] = useState({ slotId: '', vehicleNumber: '', startTime: '', endTime: '' });

  const loadSlots = useCallback(async () => {
    if (!token) return (setError('Please login first'), setPage('login'));
    try {
      let url = 'http://localhost:5000/api/slots/with-status';
      if (locationId?.state) url += `?state=${locationId.state}`;
      if (locationId?.location) url += `${url.includes('?') ? '&' : '?'}location=${locationId.location}`;
      const res = await fetch(url, { headers: { 'x-auth-token': token } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSlots((await res.json()).slots || []);
      setError('');
    } catch (err) {
      console.error('Slots load error:', err);
      setError('Failed to load slots');
    }
  }, [token, setPage, locationId]);

  // Auto-fill selected slot
  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  useEffect(() => {
    if (selectedSlot?._id) setForm(prev => ({ ...prev, slotId: selectedSlot._id }));
  }, [selectedSlot]);

  // Payment preview calculation
  useEffect(() => {
    if (form.startTime && form.endTime && form.slotId) {
      const start = new Date(form.startTime), end = new Date(form.endTime);
      if (start < end) {
        const durationMs = end - start, fifteenMinMs = 15 * 60 * 1000;
        const slabs = Math.ceil(durationMs / fifteenMinMs), totalCost = slabs * 5;
        setPaymentPreview({
          slabs, durationMinutes: Math.ceil(durationMs / 60000), totalCost, ratePer15Min: 5,
          startTime: start.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }),
          endTime: end.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })
        });
      }
    } else setPaymentPreview(null);
  }, [form.startTime, form.endTime, form.slotId]);

  const availableSlots = slots.filter(slot => slot.isAvailable);
  const currentSlot = slots.find(slot => slot._id === form.slotId) || selectedSlot;

  const openBookingModal = () => {
    if (!form.slotId || !form.vehicleNumber || !form.startTime || !form.endTime) {
      return setError('Please fill all fields');
    }
    const start = new Date(form.startTime), end = new Date(form.endTime);
    if (start >= end) return setError('End time must be after start time');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('http://localhost:5000/api/bookings/preview-and-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ Booked ${currentSlot?.slotNumber || 'slot'}!\n${data.paymentDetails.message}`);
        setPage('history');
        setShowModal(false);
      } else setError(data.message || 'Booking failed');
    } catch (err) {
      console.error('Booking error:', err);
      setError('Network error - check console');
    } finally { setLoading(false); }
  };

  if (!token) return <div style={{ padding: '40px', textAlign: 'center' }}>Login via Navbar</div>;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.5)), url('book.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: "url('Book.png')",
        backgroundSize: 'cover', backgroundPosition: 'center',
        opacity: 0.3, zIndex: -1
      }} />

      <Navbar setPage={setPage} />

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '80px 40px 40px',
        display: 'flex',
        alignItems: 'center',
        minHeight: 'calc(100vh - 80px)',
        gap: '60px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: '1', minWidth: '400px', zIndex: 2 }}>
          <div style={{
            fontSize: '64px',
            fontWeight: '800',
            lineHeight: '1.1',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #fff 0%, #f0f9ff 50%, #e0f2fe 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            150+ Slots
          </div>
          <div style={{
            fontSize: '48px',
            fontWeight: '700',
            lineHeight: '1.2',
            marginBottom: '32px',
            color: '#f8fafc'
          }}>
            To Choose From
          </div>
          <div style={{
            fontSize: '20px',
            lineHeight: '1.7',
            color: '#cbd5e1',
            maxWidth: '500px',
            marginBottom: '40px'
          }}>
            Wide variety of premium parking slots with modern security and 24/7 surveillance
          </div>
          <button
            onClick={() => setPage('slots', { locationId })}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            ← View All Slots
          </button>
        </div>

        <div style={{
          flex: '1',
          minWidth: '450px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(40px)',
          borderRadius: '24px',
          padding: '48px',
          boxShadow: '0 50px 100px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.2)',
          zIndex: 2,
          position: 'relative'
        }}>
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            Book a Slot
          </div>

          {error && <div style={{
            background: '#fef2f2',
            color: '#dc2626',
            padding: '16px',
            borderRadius: '12px',
            borderLeft: '4px solid #dc2626',
            marginBottom: '24px',
            fontWeight: '500'
          }}>
            ⚠️ {error}
          </div>}

          <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                Select Slot
              </label>
              <select
                value={form.slotId}
                onChange={e => setForm({...form, slotId: e.target.value})}
                required
                disabled={loading || !!selectedSlot}
                style={{
                  width: '100%', padding: '16px 20px', border: '2px solid #e5e7eb',
                  borderRadius: '12px', fontSize: '16px', background: 'white',
                  color: '#1f2937', appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
                  backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat',
                  backgroundSize: '16px', cursor: 'pointer'
                }}
              >
                <option value="">{selectedSlot ? `Pre-selected: ${selectedSlot.slotNumber}` : 'Choose a slot'}</option>
                {availableSlots.map(slot => (
                  <option key={slot._id} value={slot._id}>{slot.slotNumber} - {slot.location}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                Vehicle Number
              </label>
              <input
                type="text"
                placeholder="TN01AB1234"
                value={form.vehicleNumber}
                onChange={e => setForm({...form, vehicleNumber: e.target.value.toUpperCase()})}
                required
                disabled={loading}
                maxLength={15}
                style={{
                  width: '100%', padding: '16px 20px', border: '2px solid #e5e7eb',
                  borderRadius: '12px', fontSize: '16px', fontWeight: '600',
                  textTransform: 'uppercase', background: 'white', color: '#1f2937'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Start Time</label>
                <input type="datetime-local" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} required disabled={loading} min={new Date().toISOString().slice(0, 16)} style={{ width: '100%', padding: '16px 20px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '16px', background: 'white', color: '#1f2937' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>End Time</label>
                <input type="datetime-local" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} required disabled={loading} min={form.startTime || new Date(Date.now() + 3600000).toISOString().slice(0,16)} style={{ width: '100%', padding: '16px 20px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '16px', background: 'white', color: '#1f2937' }} />
              </div>
            </div>

            {paymentPreview && (
              <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '24px', borderRadius: '16px', textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>₹{paymentPreview.totalCost}</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>{paymentPreview.durationMinutes}min • {paymentPreview.slabs} slabs</div>
              </div>
            )}

            <button
              type="button"
              onClick={openBookingModal}
              disabled={loading}
              style={{
                width: '100%',
                padding: '20px',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? '🔒 Preparing...' : '👁️ Preview & Book'}
            </button>
          </form>

          {/* MODAL */}
          {showModal && (
            <>
              {/* Backdrop */}
              <div
                style={{
                  position: 'fixed',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(0, 0, 0, 0.7)',
                  backdropFilter: 'blur(8px)',
                  zIndex: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => setShowModal(false)}
              />

              {/* Modal */}
              <div
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 'min(90vw, 520px)',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                  backdropFilter: 'blur(40px)',
                  borderRadius: '28px',
                  padding: '0',
                  boxShadow: '0 50px 100px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  zIndex: 10000
                }}
              >
                {/* Header */}
                <div style={{
                  padding: '32px 32px 24px',
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '64px', height: '64px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    borderRadius: '20px',
                    margin: '0 auto 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 20px 40px rgba(16,185,129,0.3)'
                  }}>
                    ✅
                  </div>
                  <h2 style={{
                    fontSize: '28px',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    margin: 0,
                    lineHeight: '1.3'
                  }}>
                    Confirm Booking
                  </h2>
                  <p style={{
                    color: '#64748b',
                    fontSize: '16px',
                    margin: '8px 0 0',
                    fontWeight: '500'
                  }}>
                    Review details before confirming
                  </p>
                </div>

                {/* Content */}
                <div style={{ padding: '32px' }}>
                  {/* Slot Info */}
                  <div style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '24px'
                  }}>
                    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
                      Selected Slot
                    </div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <span style={{
                        width: '48px', height: '48px',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '18px'
                      }}>
                        {currentSlot?.slotNumber?.charAt(0) || 'S'}
                      </span>
                      <div>
                        <div>{currentSlot?.slotNumber || 'Slot'}</div>
                        <div style={{ fontSize: '14px', color: '#64748b' }}>
                          {currentSlot?.location || 'Location'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle & Timing */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
                    <div>
                      <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
                        Vehicle Number
                      </div>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#1e293b',
                        letterSpacing: '1px'
                      }}>
                        {form.vehicleNumber || 'TN01AB1234'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
                        Duration
                      </div>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#1e293b'
                      }}>
                        {paymentPreview?.durationMinutes || 0} mins
                      </div>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  {paymentPreview && (
                    <div style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      padding: '28px 24px',
                      borderRadius: '20px',
                      textAlign: 'center',
                      marginBottom: '32px',
                      boxShadow: '0 20px 40px rgba(16,185,129,0.3)'
                    }}>
                      <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '4px' }}>
                        ₹{paymentPreview.totalCost}
                      </div>
                      <div style={{ fontSize: '16px', opacity: 0.95 }}>
                        {paymentPreview.slabs} × ₹5 (15 min slabs)
                      </div>
                      <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '8px' }}>
                        {paymentPreview.startTime} → {paymentPreview.endTime}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div style={{
                  padding: '24px 32px 32px',
                  borderTop: '1px solid rgba(0,0,0,0.05)',
                  display: 'flex',
                  gap: '16px'
                }}>
                  <button
                    onClick={() => setShowModal(false)}
                    style={{
                      flex: 1,
                      padding: '16px 24px',
                      background: 'transparent',
                      color: '#64748b',
                      border: '2px solid #e2e8f0',
                      borderRadius: '16px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#f1f5f9';
                      e.target.style.borderColor = '#cbd5e1';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.borderColor = '#e2e8f0';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '16px 24px',
                      background: loading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '16px',
                      fontWeight: '700',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 10px 25px rgba(16,185,129,0.4)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? '🔒 Securing...' : `✅ Book for ₹${paymentPreview?.totalCost || 0}`}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Booking;
