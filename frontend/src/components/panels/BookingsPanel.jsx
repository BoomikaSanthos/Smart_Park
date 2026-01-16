import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#facc15", "#ef4444"];

const BookingRow = React.memo(({ b, getSlotName }) => {
  // Enhanced user name fetching - handles more cases
  let userName = "N/A";
  if (typeof b.user === "string") {
    userName = "N/A";
  } else if (b.user) {
    userName = b.user.name || b.user.username || b.user.fullName || b.user.displayName || "N/A";
  }

  const userId = typeof b.user === "string" ? b.user : b.user?._id || "N/A";

  return (
    <tr
      style={{
        whiteSpace: "nowrap",
        borderBottom: "1px solid #e5e7eb",
        transition: "background-color 0.2s",
        cursor: "default",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
    >
      <td style={{ padding: "12px 8px", fontSize: "14px" }}>{b._id}</td>
      <td style={{ padding: "12px 8px", fontSize: "14px", fontWeight: "500" }}>{userName}</td>
      <td style={{ padding: "12px 8px", fontSize: "13px", color: "#6b7280" }}>{userId}</td>
      <td style={{ padding: "12px 8px", fontSize: "14px", fontWeight: 500 }}>{b.vehicleNumber}</td>
      <td style={{ padding: "12px 8px", fontSize: "14px", fontWeight: 600 }}>{getSlotName(b.slot)}</td>
      <td style={{ padding: "12px 8px", fontSize: "13px" }}>{b.startTime}</td>
      <td style={{ padding: "12px 8px", fontSize: "13px" }}>{b.endTime}</td>
      <td style={{ padding: "12px 8px", fontSize: "13px", color: b.actualEntryTime ? "#059669" : "#9ca3af" }}>
        {b.actualEntryTime || "-"}
      </td>
      <td style={{ padding: "12px 8px", fontSize: "13px", color: b.actualExitTime ? "#059669" : "#9ca3af" }}>
        {b.actualExitTime || "-"}
      </td>
      <td style={{ padding: "12px 8px", fontSize: "14px", fontWeight: 600 }}>{b.bookedDurationHours}</td>
      <td style={{ padding: "12px 8px", fontSize: "14px" }}>
        {b.actualDurationMinutes ? Math.round(b.actualDurationMinutes) : "-"}
      </td>
      <td style={{
        padding: "12px 8px",
        fontWeight: "bold",
        minWidth: "90px",
        textAlign: "center",
        borderRadius: "6px",
        fontSize: "13px"
      }}>
        <span style={{
          backgroundColor: b.status === "active" ? "#dcfce7" : b.status === "completed" ? "#dbeafe" : "#fef3c7",
          color: b.status === "active" ? "#166534" : b.status === "completed" ? "#1e40af" : "#92400e",
          padding: "4px 12px",
          borderRadius: "9999px"
        }}>
          {b.status}
        </span>
      </td>
      <td style={{ padding: "12px 8px", fontSize: "13px" }}>{b.paymentStatus}</td>
      <td style={{ padding: "12px 8px", fontSize: "13px" }}>{b.bookingType}</td>
    </tr>
  );
});

export default function AdminBookingsDashboard() {
  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [stats, setStats] = useState({ active: 0, current: 0, future: 0, past: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  const getSlotName = useCallback(
    (slotId) => {
      const slot = slots.find((s) => s._id === slotId);
      return slot ? slot.slotNumber || slot.name || slotId : slotId;
    },
    [slots]
  );

  const classifyBookings = useCallback(
    (list) => {
      let active = 0, current = 0, future = 0, past = 0;
      list.forEach((b) => {
        if (b.bookingType === "current") current++;
        else if (b.bookingType === "future") future++;
        else if (b.bookingType === "past") past++;

        const slot = slots.find((s) => s._id === b.slot);
        if (slot && slot.isAvailable === false) active++;
      });
      setStats({ active, current, future, past });
    },
    [slots]
  );

  const fetchSlots = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/slots", {
        headers: { "x-auth-token": token },
      });
      setSlots(res.data.slots || []);
    } catch (err) {
      console.error("Slots fetch error:", err);
      setError("Failed to fetch slots");
    }
  }, [token]);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/bookings", {
        headers: { "x-auth-token": token },
      });
      const bookingData = res.data.bookings || [];
      setBookings(bookingData);
      classifyBookings(bookingData);
      setLoading(false);
    } catch (err) {
      console.error("Bookings fetch error:", err);
      setError("Failed to fetch bookings");
      setLoading(false);
    }
  }, [token, classifyBookings]);

  useEffect(() => {
    fetchSlots();
    fetchBookings();
    const interval = setInterval(fetchBookings, 5000);
    return () => clearInterval(interval);
  }, [fetchSlots, fetchBookings]);

  // FIXED: Ensure left edge is always visible - reset scroll on bookings change
  useEffect(() => {
    const container = document.getElementById("booking-table-container");
    if (container) {
      container.scrollLeft = 0;
    }
  }, [bookings]);

  const pieData = [
    { name: "Active", value: stats.active },
    { name: "Current", value: stats.current },
    { name: "Future", value: stats.future },
    { name: "Past", value: stats.past },
  ];

  return (
    <div style={{
      padding: "20px 0 0 20px",  // FIXED: Added left/right padding to show full edge
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#111",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      position: "relative",
      overflowX: "hidden",  // FIXED: Prevent page-level horizontal scroll
      boxSizing: "border-box",
      width: "100vw"  // FIXED: Ensure full viewport width
    }}>
      {/* Header */}
      <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        borderRadius: "20px",
        padding: "20px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        marginBottom: "20px",
        maxWidth: "100%",
        boxSizing: "border-box",
        width: "100%"  // FIXED: Full width
      }}>
        <h2 style={{
          margin: 0,
          fontSize: "24px",
          fontWeight: 800,
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          📊 Admin Bookings Dashboard
          <span style={{
            background: "rgba(102, 126, 234, 0.2)",
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#4f46e5"
          }}>
            LIVE
          </span>
        </h2>
      </div>

      {loading && (
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          padding: "32px",
          borderRadius: "20px",
          textAlign: "center",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          maxWidth: "100%",
          marginBottom: "20px",
          boxSizing: "border-box",
          width: "100%"  // FIXED: Full width
        }}>
          <div style={{
            width: "48px",
            height: "48px",
            border: "4px solid #e5e7eb",
            borderTop: "4px solid #667eea",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px"
          }} />
          <div style={{ fontSize: "16px", color: "#6b7280" }}>Loading bookings...</div>
        </div>
      )}

      {error && (
        <div style={{
          background: "rgba(239, 68, 68, 0.1)",
          backdropFilter: "blur(20px)",
          padding: "20px",
          borderRadius: "16px",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          color: "#dc2626",
          marginBottom: "20px",
          maxWidth: "100%",
          width: "100%"  // FIXED: Full width
        }}>
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* SUMMARY CARDS - FIXED: Responsive grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
            maxWidth: "100%",
            width: "100%",
            padding: "0 20px",  // FIXED: Balanced padding
            boxSizing: "border-box"
          }}>
            {Object.entries(stats).map(([k, v]) => (
              <div
                key={k}
                style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  color: "#111",
                  padding: "20px 16px",
                  borderRadius: "16px",
                  textAlign: "center",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  transition: "transform 0.2s, box-shadow 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
                }}
              >
                <h4 style={{
                  margin: "0 0 8px 0",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>{k.toUpperCase()}</h4>
                <p style={{
                  margin: 0,
                  fontSize: "28px",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>{v}</p>
              </div>
            ))}
          </div>

          {/* PIE CHART - FIXED: Full width */}
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            padding: "24px",
            borderRadius: "20px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            marginBottom: "24px",
            maxWidth: "100%",
            width: "100%",
            boxSizing: "border-box",
            paddingRight: "20px"  // FIXED: Balanced padding
          }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* TABLE SECTION - FIXED: Only table scrolls horizontally */}
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            overflow: "hidden",
            maxWidth: "100%",
            width: "100%",
            marginRight: "20px"  // FIXED: Right spacing
          }}>
            <div style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              padding: "20px 24px",
              color: "white"
            }}>
              <h3 style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}>
                📋 Full Booking Records
                <span style={{ fontSize: "14px", opacity: 0.9 }}>
                  ({bookings.length} total)
                </span>
              </h3>
            </div>

            {bookings.length === 0 ? (
              <div style={{
                padding: "48px 24px",
                textAlign: "center",
                color: "#6b7280",
                fontSize: "18px"
              }}>
                No bookings yet
              </div>
            ) : (
              <div
                id="booking-table-container"
                style={{
                  overflowX: "auto",
                  width: "100%",
                  boxSizing: "border-box",
                  scrollbarWidth: "thin",  // FIXED: Better scrollbar
                  scrollbarColor: "#cbd5e1 #f1f5f9"
                }}
              >
                <table
                  style={{
                    minWidth: 1400,  // FIXED: Slightly reduced from 1600
                    width: "100%",
                    borderCollapse: "collapse",
                    tableLayout: "auto",
                    fontSize: "14px"
                  }}
                >
                  <thead style={{
                    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    borderBottom: "3px solid #e5e7eb"
                  }}>
                    <tr>
                      <th style={{ padding: "16px 12px", fontWeight: 700, fontSize: "13px" }}>Booking ID</th>
                      <th style={{ padding: "16px 12px", fontWeight: 700, fontSize: "13px" }}>User Name</th>
                      <th style={{ padding: "16px 12px", fontWeight: 700, fontSize: "13px" }}>User ID</th>
                      <th style={{ padding: "16px 12px", fontWeight: 700, fontSize: "13px" }}>Vehicle</th>
                      <th style={{ padding: "16px 12px", fontWeight: 700, fontSize: "13px" }}>Slot</th>
                      <th style={{ padding: "16px 12px", fontWeight: 700, fontSize: "13px" }}>Start</th>
                      <th style={{ padding: "16px 12px", fontWeight: 700, fontSize: "13px" }}>End</th>
                      <th style={{ padding: "16px 12px", fontWeight: 700, fontSize: "13px" }}>Entry</th>
                      <th style={{ padding: "16px 12px", fontWeight: 700, fontSize: "13px" }}>Exit</th>
                      <th style={{ padding: "16px 12px", fontWeight: 700, fontSize: "13px" }}>Booked (hrs)</th>
                      <th style={{ padding: "16px 12px", fontWeight: 700, fontSize: "13px" }}>Actual (mins)</th>
                      <th style={{ padding: "16px 12px", fontWeight: 700, fontSize: "13px" }}>Status</th>
                      <th style={{ padding: "16px 12px", fontWeight: 700, fontSize: "13px" }}>Payment</th>
                      <th style={{ padding: "16px 12px", fontWeight: 700, fontSize: "13px" }}>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <BookingRow key={b._id} b={b} getSlotName={getSlotName} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* FIXED: Custom scrollbar for table only */
        #booking-table-container::-webkit-scrollbar {
          height: 8px;
        }
        #booking-table-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        #booking-table-container::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #cbd5e1, #94a3b8);
          border-radius: 4px;
        }
        #booking-table-container::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }

        /* FIXED: Mobile responsiveness */
        @media (max-width: 768px) {
          div[style*="padding: 20px 0 0 20px"] {
            padding: 16px !important;
          }
          table[style*="minWidth: 1400"] {
            min-width: 1000px !important;
          }
        }
      `}</style>
    </div>
  );
}
