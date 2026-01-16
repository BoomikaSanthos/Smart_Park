import React, { useEffect, useState } from "react";
import axios from "axios";

function SlotsGrid() {
  const [slotsData, setSlotsData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchSlots = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/slots/with-status");
      const { slots } = res.data;

      // Group slots by state -> location (real name from DB)
      const grouped = {};
      slots.forEach((slot) => {
        const state = slot.state || "Unknown";
        // Use full name from DB if exists, otherwise fallback to location
        const placeName = slot.fullPlaceName || slot.location || "Unknown";

        if (!grouped[state]) grouped[state] = {};
        if (!grouped[state][placeName]) grouped[state][placeName] = [];

        grouped[state][placeName].push(slot);
      });

      // Sort slots by slotNumber
      Object.keys(grouped).forEach((state) => {
        Object.keys(grouped[state]).forEach((place) => {
          grouped[state][place].sort((a, b) => a.slotNumber - b.slotNumber);
        });
      });

      setSlotsData(grouped);
    } catch (err) {
      console.error("Error fetching slots:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots(); // initial fetch

    const interval = setInterval(fetchSlots, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div style={{ padding: "20px" }}>Loading slots...</div>;

  return (
    <div style={{ padding: "20px" }}>
      {Object.keys(slotsData).length === 0 && <div>No slots available</div>}

      {Object.keys(slotsData).map((state) => (
        <div key={state} style={{ marginBottom: "40px" }}>
          <h2 style={{ borderBottom: "2px solid #ccc", paddingBottom: "5px" }}>
            State: {state}
          </h2>

          {Object.keys(slotsData[state]).map((place) => {
            const slotsArray = slotsData[state][place];

            return (
              <div key={place} style={{ marginBottom: "30px" }}>
                <h3 style={{ marginBottom: "10px" }}>
                  Place: {place}
                </h3>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  {slotsArray.map((slot) => (
                    <div
                      key={slot._id}
                      style={{
                        flex: "0 0 80px",
                        height: "60px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: "8px",
                        textAlign: "center",
                        backgroundColor: slot.isAvailable ? "#d4edda" : "#f8d7da",
                        color: slot.isAvailable ? "#155724" : "#721c24",
                        fontWeight: "bold",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                        cursor: "pointer",
                      }}
                    >
                      {slot.slotNumber}
                      <div style={{ fontSize: "12px", marginTop: "5px" }}>
                        {slot.isAvailable ? "Available" : "Booked"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default SlotsGrid;
