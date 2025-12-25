import React, { useState } from "react";

// const Booking = ({ slots }) => {
const Booking = ({ slots, bookSlot }) => {
  const [vehicleNo, setVehicleNo] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Step 1: Validate empty fields
    if (!vehicleNo || !selectedSlot) {
      setMessage("Please fill all fields");
      return;
    }

    // Step 2: Find selected slot
    const slot = slots.find((s) => s.id === Number(selectedSlot));

    // Step 3: Check availability
    if (slot.status === "booked") {
      setMessage(" Selected slot is already booked");
      return;
    }

    // Step 4: Confirm availability (UI only)
    // setMessage(` Slot ${slot.id} is available. Ready to book.`);

    setMessage(` Slot ${slot.id} booked successfully`);

    bookSlot(slot.id);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Book Parking Slot</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Vehicle Number"
          value={vehicleNo}
          onChange={(e) => setVehicleNo(e.target.value)}
        />

        <br />
        <br />

        <select
          value={selectedSlot}
          onChange={(e) => setSelectedSlot(e.target.value)}
        >
          <option value="">Select Slot</option>
          {slots.map((slot) => (
            <option key={slot.id} value={slot.id}>
              Slot {slot.id}
              Status {slot.status}
            </option>
          ))}
        </select>

        <br />
        <br />

        <button type="submit">Check Availability</button>
      </form>

      <p>{message}</p>
    </div>
  );
};

export default Booking;
