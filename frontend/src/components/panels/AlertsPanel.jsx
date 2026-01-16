import React, { useEffect, useState } from "react";
import axios from "axios";

function AlertsPanel() {
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [newSlot, setNewSlot] = useState({
    state: "",
    location: "",
    slotNumber: "",
    vehicleType: "",
    amount: 20,
    isAvailable: true,
    slotStatus: "available",
    alerts: { systemError: false, maintenance: false, infrastructure: false },
  });

  // Fetch slots from backend
  const fetchSlots = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/slots/all");
      setSlots(res.data.slots);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSlots();
    const interval = setInterval(fetchSlots, 5000);
    return () => clearInterval(interval);
  }, []);

  // Slot color based on status
  const getSlotColor = (slot) => {
    if (slot.alerts && Object.values(slot.alerts).some(Boolean)) return "#f3f4f6";
    if (!slot.isAvailable || slot.slotStatus === "currently occupied" || slot.slotStatus === "booked future") return "#fee2e2";
    return "#f0fdf4";
  };

  const hasAlert = (alerts) => alerts && Object.values(alerts).some(Boolean);

  // Remove alerts for a slot
  const removeAlert = async (slot) => {
    const cleared = { systemError: false, maintenance: false, infrastructure: false };
    await axios.put(`http://localhost:5000/api/slots/manage/${slot.slotNumber}`, { alerts: cleared });
    fetchSlots();
  };

  // Update slot (alerts / price / status)
  const updateSlot = async () => {
    if (!selectedSlot) return;
    await axios.put(`http://localhost:5000/api/slots/manage/${selectedSlot.slotNumber}`, {
      alerts: selectedSlot.alerts,
      amount: Number(selectedSlot.amount),
      isAvailable: selectedSlot.isAvailable,
      slotStatus: selectedSlot.slotStatus,
    });
    setSelectedSlot(null);
    fetchSlots();
  };

  // Remove slot
  const removeSlot = async (slotNumber) => {
    if (!window.confirm("Remove this slot?")) return;
    await axios.delete(`http://localhost:5000/api/slots/remove/${slotNumber}`);
    fetchSlots();
  };

  // Add new slot
  const addSlot = async () => {
    await axios.post("http://localhost:5000/api/slots/add", newSlot);
    setNewSlot({
      state: "",
      location: "",
      slotNumber: "",
      vehicleType: "",
      amount: 20,
      isAvailable: true,
      slotStatus: "available",
      alerts: { systemError: false, maintenance: false, infrastructure: false },
    });
    setShowAddPanel(false);
    fetchSlots();
  };

  // Group slots by state and location
  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.state]) acc[slot.state] = {};
    if (!acc[slot.state][slot.location]) acc[slot.state][slot.location] = [];
    acc[slot.state][slot.location].push(slot);
    return acc;
  }, {});

  return (
    <div style={{
      padding: "24px",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#111",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        marginBottom: "24px",
      }}>
        <h2 style={{
          margin: 0,
          fontSize: "28px",
          fontWeight: "800",
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          🚨 Alerts & Slot Management
          <span style={{
            background: "rgba(102, 126, 234, 0.2)",
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "600",
            color: "#4f46e5"
          }}>
            LIVE
          </span>
        </h2>
      </div>

      {/* States Container */}
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {Object.entries(groupedSlots).map(([state, locations]) => (
          <div key={state}>
            {/* State Header */}
            <div style={{
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              marginBottom: "20px"
            }}>
              <h3 style={{
                margin: "0 0 20px 0",
                fontSize: "24px",
                fontWeight: "800",
                color: "#1f2937",
                paddingBottom: "12px",
                borderBottom: "3px solid #667eea",
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}>
                📍 {state}
              </h3>

              {/* Locations Container */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {Object.entries(locations).map(([location, locSlots]) => (
                  <div key={location}>
                    {/* Location Header */}
                    <h4 style={{
                      margin: "0 0 20px 0",
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#374151",
                      background: "rgba(102, 126, 234, 0.15)",
                      padding: "12px 20px",
                      borderRadius: "16px",
                      borderLeft: "5px solid #667eea",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)"
                    }}>
                      🏬 {location}
                      <span style={{
                        background: "rgba(102, 126, 234, 0.2)",
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#4f46e5"
                      }}>
                        {locSlots.length} slots
                      </span>
                    </h4>

                    {/* Horizontal Slot Cards - Stack when end of page */}
                    <div style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "16px",
                      alignItems: "flex-start"
                    }}>
                      {locSlots.map((slot) => {
                        const alertActive = hasAlert(slot.alerts);
                        return (
                          <div
                            key={slot._id || slot.slotNumber}
                            style={{
                              flex: "0 0 260px", // Fixed width, wrap to next line
                              padding: "20px",
                              borderRadius: "16px",
                              border: "2px solid rgba(0,0,0,0.1)",
                              background: getSlotColor(slot),
                              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                              transition: "all 0.3s ease",
                              position: "relative",
                              overflow: "hidden"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "translateY(-4px)";
                              e.currentTarget.style.boxShadow = "0 20px 40px -10px rgba(0, 0, 0, 0.2)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(0, 0, 0, 0.1)";
                            }}
                          >
                            {alertActive && (
                              <div style={{
                                position: "absolute",
                                top: "12px",
                                right: "12px",
                                background: "#ef4444",
                                color: "white",
                                padding: "4px 8px",
                                borderRadius: "9999px",
                                fontSize: "12px",
                                fontWeight: "600"
                              }}>
                                🚨 ALERT
                              </div>
                            )}

                            <h4 style={{
                              margin: "0 0 12px 0",
                              fontSize: "18px",
                              fontWeight: "700",
                              color: alertActive ? "#dc2626" : "#1f2937"
                            }}>
                              {slot.slotNumber}
                            </h4>

                            <div style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "12px",
                              padding: "8px 12px",
                              background: "rgba(0,0,0,0.05)",
                              borderRadius: "8px"
                            }}>
                              <span style={{ fontSize: "14px", fontWeight: "600" }}>Status:</span>
                              <span style={{
                                fontSize: "13px",
                                fontWeight: "600",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                background: alertActive ? "#fee2e2" : slot.isAvailable ? "#dcfce7" : "#dbeafe",
                                color: alertActive ? "#dc2626" : slot.isAvailable ? "#166534" : "#1e40af"
                              }}>
                                {alertActive ? "ALERT" : slot.slotStatus || "Available"}
                              </span>
                            </div>

                            <p style={{ margin: "8px 0", fontSize: "14px", color: "#6b7280" }}>
                              🚗 {slot.vehicleType || "Any"}
                            </p>
                            <p style={{
                              margin: "8px 0",
                              fontSize: "16px",
                              fontWeight: "700",
                              color: "#059669"
                            }}>
                              ₹{slot.amount || 20}/hr
                            </p>

                            {alertActive && (
                              <div style={{
                                marginBottom: "16px",
                                padding: "12px",
                                background: "rgba(239, 68, 68, 0.1)",
                                borderRadius: "8px",
                                borderLeft: "4px solid #ef4444"
                              }}>
                                {slot.alerts.systemError && <div style={{ fontSize: "13px", color: "#dc2626", marginBottom: "4px" }}>⚠️ System Error</div>}
                                {slot.alerts.maintenance && <div style={{ fontSize: "13px", color: "#dc2626", marginBottom: "4px" }}>🔧 Maintenance</div>}
                                {slot.alerts.infrastructure && <div style={{ fontSize: "13px", color: "#dc2626" }}>🏗️ Infrastructure</div>}
                                <button
                                  onClick={() => removeAlert(slot)}
                                  style={{
                                    marginTop: "8px",
                                    padding: "6px 12px",
                                    fontSize: "12px",
                                    background: "#ef4444",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontWeight: "600"
                                  }}
                                >
                                  ✅ Clear All Alerts
                                </button>
                              </div>
                            )}

                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                onClick={() => setSelectedSlot(slot)}
                                style={{
                                  flex: 1,
                                  padding: "10px 8px",
                                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "8px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                  transition: "all 0.2s"
                                }}
                              >
                                ⚙️ Manage
                              </button>
                              <button
                                onClick={() => removeSlot(slot.slotNumber)}
                                style={{
                                  flex: 1,
                                  padding: "10px 8px",
                                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "8px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                  transition: "all 0.2s"
                                }}
                              >
                                🗑️ Remove
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Slot Panel */}
      <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        marginTop: "24px"
      }}>
        <button
          onClick={() => setShowAddPanel(!showAddPanel)}
          style={{
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)",
            transition: "all 0.2s"
          }}
        >
          {showAddPanel ? "❌ Close Add Panel" : "➕ Add New Slot"}
        </button>
        {showAddPanel && (
          <div style={{
            marginTop: "20px",
            padding: "24px",
            border: "2px dashed #d1d5db",
            borderRadius: "16px",
            background: "rgba(248, 250, 252, 0.8)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px"
          }}>
            <input
              type="text"
              placeholder="State"
              value={newSlot.state}
              onChange={e => setNewSlot({ ...newSlot, state: e.target.value })}
              style={{
                padding: "12px 16px",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "14px",
                transition: "border-color 0.2s"
              }}
            />
            <input
              type="text"
              placeholder="Location"
              value={newSlot.location}
              onChange={e => setNewSlot({ ...newSlot, location: e.target.value })}
              style={{
                padding: "12px 16px",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "14px",
                transition: "border-color 0.2s"
              }}
            />
            <input
              type="text"
              placeholder="Slot Number (e.g., A-01)"
              value={newSlot.slotNumber}
              onChange={e => setNewSlot({ ...newSlot, slotNumber: e.target.value })}
              style={{
                padding: "12px 16px",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "14px",
                transition: "border-color 0.2s"
              }}
            />
            <input
              type="text"
              placeholder="Vehicle Type (Car/Bike)"
              value={newSlot.vehicleType}
              onChange={e => setNewSlot({ ...newSlot, vehicleType: e.target.value })}
              style={{
                padding: "12px 16px",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "14px",
                transition: "border-color 0.2s"
              }}
            />
            <input
              type="number"
              placeholder="Amount"
              value={newSlot.amount}
              onChange={e => setNewSlot({ ...newSlot, amount: Number(e.target.value) })}
              style={{
                padding: "12px 16px",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "14px",
                transition: "border-color 0.2s"
              }}
            />
            <select
              value={newSlot.slotStatus}
              onChange={e => setNewSlot({ ...newSlot, slotStatus: e.target.value })}
              style={{
                padding: "12px 16px",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "14px",
                background: "white",
                transition: "border-color 0.2s"
              }}
            >
              <option value="available">Available</option>
              <option value="booked future">Booked Future</option>
              <option value="currently occupied">Currently Occupied</option>
            </select>
            <button
              onClick={addSlot}
              style={{
                padding: "12px 24px",
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)",
                transition: "all 0.2s",
                gridColumn: "1 / -1"
              }}
            >
              ✅ Create Slot
            </button>
          </div>
        )}
      </div>

      {/* Manage slot panel - UNCHANGED */}
      {selectedSlot && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(8px)",
              zIndex: 999
            }}
            onClick={() => setSelectedSlot(null)}
          />

          {/* Modal */}
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(90vw, 500px)",
            padding: "32px",
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            boxShadow: "0 50px 100px -20px rgba(0, 0, 0, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            zIndex: 1000,
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <h3 style={{
              margin: "0 0 24px 0",
              fontSize: "24px",
              fontWeight: "800",
              color: "#1f2937",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              ⚙️ Manage Slot: <span style={{ color: "#667eea" }}>{selectedSlot.slotNumber}</span>
            </h3>

            <div style={{ display: "grid", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "rgba(34, 197, 94, 0.1)", borderRadius: "12px" }}>
                <input
                  type="checkbox"
                  checked={selectedSlot.isAvailable}
                  onChange={(e) => setSelectedSlot({ ...selectedSlot, isAvailable: e.target.checked })}
                  style={{ width: "20px", height: "20px" }}
                />
                <span style={{ fontWeight: "600", color: "#059669" }}>Available for Booking</span>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Price per Hour</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "18px", fontWeight: "700", color: "#059669" }}>₹</span>
                  <input
                    type="number"
                    value={selectedSlot.amount || 20}
                    onChange={(e) => setSelectedSlot({ ...selectedSlot, amount: Number(e.target.value) })}
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      fontSize: "18px",
                      fontWeight: "600"
                    }}
                  />
                  <span>/hr</span>
                </div>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Status</label>
                <select
                  value={selectedSlot.slotStatus}
                  onChange={(e) => setSelectedSlot({ ...selectedSlot, slotStatus: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                    fontSize: "16px",
                    background: "white"
                  }}
                >
                  <option value="available">🟢 Available</option>
                  <option value="booked future">🟡 Booked (Future)</option>
                  <option value="currently occupied">🔴 Currently Occupied</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "16px", fontWeight: "600", color: "#dc2626" }}>🚨 Alerts</label>
                <div style={{ display: "grid", gap: "12px" }}>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={selectedSlot.alerts?.systemError || false}
                      onChange={(e) =>
                        setSelectedSlot({ ...selectedSlot, alerts: { ...selectedSlot.alerts, systemError: e.target.checked } })
                      }
                      style={{ width: "20px", height: "20px", marginTop: "2px" }}
                    />
                    <span>⚠️ System Error</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={selectedSlot.alerts?.maintenance || false}
                      onChange={(e) =>
                        setSelectedSlot({ ...selectedSlot, alerts: { ...selectedSlot.alerts, maintenance: e.target.checked } })
                      }
                      style={{ width: "20px", height: "20px", marginTop: "2px" }}
                    />
                    <span>🔧 Construction/Maintenance</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={selectedSlot.alerts?.infrastructure || false}
                      onChange={(e) =>
                        setSelectedSlot({ ...selectedSlot, alerts: { ...selectedSlot.alerts, infrastructure: e.target.checked } })
                      }
                      style={{ width: "20px", height: "20px", marginTop: "2px" }}
                    />
                    <span>🏗️ Infrastructure Issue</span>
                  </label>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button
                  onClick={updateSlot}
                  style={{
                    flex: 1,
                    padding: "14px 24px",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)"
                  }}
                >
                  💾 Save Changes
                </button>
                <button
                  onClick={() => setSelectedSlot(null)}
                  style={{
                    flex: 1,
                    padding: "14px 24px",
                    background: "rgba(0,0,0,0.1)",
                    color: "#6b7280",
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AlertsPanel;
