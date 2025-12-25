import React, { useEffect, useState } from "react";
import ParkingMap from "../components/ParkingMap";   // Google map component
import StateGallery from "../components/StateGallery";

const API_BASE = "http://localhost:5000";

const MapPage = () => {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/slots/all`);
        const data = await res.json();
        // backend should return { slots: [...] }
        setSlots(data.slots || []);
      } catch (err) {
        console.log("Error fetching slots:", err);
      }
    };
    fetchSlots();
  }, []);

  return (
    <div style={{ padding: "16px" }}>
      <h2>Parking Map</h2>

      {/* 1) Google map at top */}
      <div style={{ marginBottom: "16px" }}>
        <ParkingMap slots={slots} />
      </div>

      {/* 2) State cards below map */}
      <StateGallery />
    </div>
  );
};

export default MapPage;
