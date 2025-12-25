// frontend/src/pages/BookingPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SlotsPage.css";

const API_BASE = "http://localhost:5000";

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const slotId = params.get("slotId");

  const [slot, setSlot] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchSlot = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/slots/all`);
        const data = await res.json();
        const s = (data.slots || []).find((x) => x._id === slotId);
        setSlot(s || null);
      } catch (e) {
        setMessage("Error loading slot");
      }
    };
    if (slotId) fetchSlot();
  }, [slotId]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!slot) {
      setMessage("Invalid slot.");
      return;
    }
    if (!vehicleNumber || !startTime || !endTime) {
      setMessage("Please fill all fields.");
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start) || isNaN(end)) {
      setMessage("Invalid time values.");
      return;
    }
    if (start >= end) {
      setMessage("End time must be after start time.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          slotId,
          vehicleNumber,
          startTime,
          endTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Booking failed.");
        return;
      }

      setMessage("Booking confirmed.");
      setVehicleNumber("");
      setStartTime("");
      setEndTime("");
      setTimeout(() => navigate("/slots"), 800);
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  return (
    <div className="spg-root">
      <div className="spg-bg"></div>
      <div className="spg-overlay"></div>

      <div className="spg-shell">
        <header className="spg-header">
          <h1>Book Slot</h1>
          <p>Choose duration and confirm your booking.</p>
        </header>

        <div className="spg-booking">
          {slot ? (
            <div className="spg-summary">
              <p>
                Slot <strong>{slot.slotNumber}</strong>
              </p>
              <p>
                Status:{" "}
                <strong>{slot.isAvailable ? "Available" : "Booked"}</strong>
              </p>
            </div>
          ) : (
            <p className="spg-hint">Loading slot details…</p>
          )}

          <form className="spg-form" onSubmit={handleBook}>
            <label className="spg-label">
              Vehicle number
              <input
                className="spg-input"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="HR26AB1234"
              />
            </label>

            <label className="spg-label">
              Start time
              <input
                className="spg-input"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </label>

            <label className="spg-label">
              End time
              <input
                className="spg-input"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </label>

            <button className="spg-book-btn" type="submit">
              Confirm Booking
            </button>
          </form>

          {message && <p className="spg-message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
