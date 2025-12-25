import React from "react";
import "./SlotGrid.css";

const SlotCard = ({ slot, onSelect }) => {
  const statusClass = slot.isAvailable ? "available" : "booked";
  const statusText = slot.isAvailable ? "AVAILABLE" : "BOOKED";

  return (
    <div
      className={`slot-box ${statusClass}`}
      onClick={() => onSelect && onSelect({ ...slot, status: statusText })}
    >
      <h3>{slot.slotNumber}</h3>
    </div>
  );
};

export default SlotCard;
