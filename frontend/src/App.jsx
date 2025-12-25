//import SlotList3 from "./pages/SlotList";
import Booking from "./pages/Booking";
import React, { useState } from "react";

function App() {
  // const slots = [
  //   "9:00 - 10:00 AM",
  //   "10:00 - 11:00 AM",
  //   "11:00 - 12:00 PM",
  //   "1:00 - 2:00 PM",
  //   "2:00 - 3:00 PM",
  //   "3:00 - 4:00 PM",
  // ];

  // const slots = [
  //   { id: 1, status: "available" },
  //   { id: 2, status: "booked" },
  //   { id: 3, status: "available" },
  // ];

  const [slots, setSlots] = useState([
    { id: 1, status: "available" },
    { id: 2, status: "booked" },
    { id: 3, status: "available" },
    { id: 4, status: "available" },
    { id: 5, status: "booked" },
  ]);

  const bookSlot = (slotId) => {
    const updatedSlots = slots.map((slot) =>
      slot.id === slotId ? { ...slot, status: "booked" } : slot
    );
    setSlots(updatedSlots);
  };

  return (
    <div className="container">
      <h1>Available Slots</h1>

      {/* <SlotList3 slots={slots} /> */}
      {/* <Booking slots={slots} /> */}
      <Booking slots={slots} bookSlot={bookSlot} />
    </div>
  );
}

export default App;
