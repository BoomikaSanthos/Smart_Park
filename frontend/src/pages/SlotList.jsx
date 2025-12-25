import React, { useEffect, useState } from "react";
import "./SlotsPage.css";
import ParkingMap from "../components/ParkingMap";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";

const SlotList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [message, setMessage] = useState("");

  // Read ?state=... from URL (optional filter)
  const params = new URLSearchParams(location.search);
  const stateFilter = params.get("state"); // e.g. "KA" from /slots?state=KA

  const fetchSlots = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/slots/all`);
      const data = await res.json();
      // backend route currently returns slots array directly or {slots: [...]}
      const arr = Array.isArray(data) ? data : data.slots;
      setSlots(arr || []);
    } catch (error) {
      console.log("Error fetching slots:", error);
      setMessage("Error fetching slots");
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleSelect = (slot) => {
    if (!slot.isAvailable) return; // block booked slots
    setSelectedSlot(slot);
    setMessage("");
  };

  // Apply state filter after slots are loaded
  const visibleSlots =
    stateFilter && slots.length
      ? slots.filter((s) => s.state === stateFilter)
      : slots;

  return (
    <div className="spg-root">
      <div className="spg-bg"></div>
      <div className="spg-overlay"></div>

      <div className="spg-shell">
        {/* Map section at top – using visible slots */}
        <div style={{ marginBottom: "16px" }}>
          <ParkingMap slots={visibleSlots} />
        </div>

        {/* Header */}
        <header className="spg-header">
          <h1>Parking Slots</h1>
          <p>Select an available slot, then proceed to booking.</p>
        </header>

        {/* Layout: slots grid + booking panel */}
        <div className="spg-layout">
          {/* Left: Select Slot grid */}
          <section className="spg-slots">
            {visibleSlots.map((slot) => {
              const statusClass = slot.isAvailable ? "free" : "taken";
              const isSelected =
                selectedSlot && selectedSlot._id === slot._id;

              return (
                <button
                  key={slot._id}
                  className={`spg-slot-card ${statusClass} ${
                    isSelected ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(slot)}
                >
                  <div className="spg-slot-label">
                    Slot {slot.slotNumber}
                  </div>
                  <div className="spg-slot-status">
                    {slot.isAvailable ? "Available" : "Booked"}
                  </div>
                </button>
              );
            })}
          </section>

          {/* Right: Booking Details (navigation only) */}
          <aside className="spg-booking">
            <h2>Booking Details</h2>

            {selectedSlot ? (
              <div className="spg-summary">
                <p>
                  Slot <strong>{selectedSlot.slotNumber}</strong>
                </p>
                <p>
                  Status:{" "}
                  <strong>
                    {selectedSlot.isAvailable ? "Available" : "Booked"}
                  </strong>
                </p>
              </div>
            ) : (
              <p className="spg-hint">
                Select a green slot from the grid to start booking.
              </p>
            )}

            <button
              className="spg-book-btn"
              type="button"
              disabled={!selectedSlot}
              onClick={() => {
                if (!selectedSlot) return;
                navigate(`/book?slotId=${selectedSlot._id}`);
              }}
            >
              Go to Booking
            </button>

            {message && <p className="spg-message">{message}</p>}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SlotList;
