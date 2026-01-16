// UsersPanel.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  // -------------------- FETCH LIVE DATA --------------------
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please log in as admin.");
          setLoading(false);
          return;
        }

        const res = await axios.get("http://localhost:5000/api/admin/alldata", {
          headers: { "x-auth-token": token },
        });

        if (!res.data || !res.data.users) {
          setError("No users returned. Check admin privileges or database.");
          setUsers([]);
          setBookings([]);
          setPayments([]);
        } else {
          setError(null);
          setUsers(res.data.users || []);
          setBookings(res.data.bookings || []);
          setPayments(res.data.payments || []);
          setLastUpdated(new Date());
        }
        setLoading(false);
      } catch (err) {
        console.error("Admin user fetch failed:", err);
        setError("Failed to fetch data. Check console for details.");
        setLoading(false);
      }
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, 3000);
    return () => clearInterval(interval);
  }, []);

  // -------------------- UTILITY FUNCTIONS --------------------
  const getUserBookings = (userId) =>
    bookings.filter((b) => String(b.user.$oid || b.user) === String(userId));

  const getUserPayments = (userId) =>
    payments.filter((p) => String(p.userId || p.user) === String(userId));

  const getBookingPayment = (booking) =>
    payments.find(
      (p) =>
        String(p._id?.$oid || p._id) ===
        String(booking.paymentId?.$oid || booking.paymentId)
    );

  // -------------------- DASHBOARD STATS --------------------
  const computeDashboardStats = () => {
    const totalUsers = users.length;
    const totalPayments = payments.length;
    const pendingPayments = payments.filter(
      (p) => p.payment?.status !== "completed"
    ).length;
    const noShowBookings = bookings.filter((b) => b.status === "no-show").length;
    const penaltiesApplied = bookings.filter(
      (b) => b.penaltyAmount > 0
    ).length;

    return [
      { name: "Users", value: totalUsers },
      { name: "Payments", value: totalPayments },
      { name: "Pending Payments", value: pendingPayments },
      { name: "No-Shows", value: noShowBookings },
      { name: "Penalties", value: penaltiesApplied },
    ];
  };

  if (loading)
    return (
      <div style={fullScreenCenter}>
        <div style={loader} />
        <p style={loaderText}>Loading users and bookings...</p>
      </div>
    );

  if (error)
    return (
      <div style={fullScreenCenter}>
        <div style={errorBadge}>{error}</div>
      </div>
    );

  if (users.length === 0)
    return (
      <div style={fullScreenCenter}>
        <p style={mutedText}>No users found in database.</p>
      </div>
    );

  const chartData = computeDashboardStats();

  // -------------------- HELPER FUNCTIONS FOR USER CARD --------------------
  const getUserBookingStats = (userBookings) => {
    const now = new Date();
    const past = userBookings.filter((b) => new Date(b.endTime) < now);
    const current = userBookings.filter(
      (b) => new Date(b.startTime) <= now && new Date(b.endTime) >= now
    );
    const future = userBookings.filter((b) => new Date(b.startTime) > now);
    const noShows = userBookings.filter((b) => b.status === "no-show");
    const penalties = userBookings.filter((b) => b.penaltyAmount > 0);
    const penaltiesPaid = penalties.filter((b) => b.penaltyPaid === true);
    return { past, current, future, noShows, penalties, penaltiesPaid };
  };

  const getUserPaymentStats = (userPayments) => {
    const completed = userPayments.filter(
      (p) => p.payment?.status === "completed"
    );
    const pending = userPayments.filter(
      (p) => p.payment?.status !== "completed"
    );
    return { completed, pending };
  };

  return (
    <div style={page}>
      <div style={container}>
        {/* HEADER */}
        <div style={headerRow}>
          <div>
            <h2 style={title}>Users Dashboard</h2>
            <p style={subtitle}>Live overview of users, bookings, and payments</p>
          </div>
          <div style={headerMeta}>
            <span style={pill}>Admin Panel</span>
            <span style={updatedText}>
              Last updated:{" "}
              <span style={{ fontWeight: 500 }}>
                {lastUpdated ? lastUpdated.toLocaleTimeString() : "-"}
              </span>
            </span>
          </div>
        </div>

        {/* TOP SUMMARY CARDS */}
        <div style={summaryRow}>
          <div style={summaryCard}>
            <p style={summaryLabel}>Total Users</p>
            <p style={summaryValue}>{users.length}</p>
          </div>
          <div style={summaryCard}>
            <p style={summaryLabel}>Total Payments</p>
            <p style={summaryValue}>{payments.length}</p>
          </div>
          <div style={summaryCard}>
            <p style={summaryLabel}>Total Bookings</p>
            <p style={summaryValue}>{bookings.length}</p>
          </div>
        </div>

        {/* BAR CHART WRAPPER */}
        <div style={chartCard}>
          <div style={chartHeader}>
            <h3 style={chartTitle}>System Metrics</h3>
            <p style={chartSubtitle}>Key counts across users, bookings, and payments</p>
          </div>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={{ stroke: "#1f2937" }}
                />
                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={{ stroke: "#1f2937" }}
                />
                <Tooltip
                  contentStyle={customTooltip}
                  cursor={{ fill: "rgba(55, 65, 81, 0.25)" }}
                />
                <Bar
                  dataKey="value"
                  radius={[6, 6, 0, 0]}
                  fill="url(#grad)"
                  barSize={30}
                />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* USER SECTIONS */}
        {users.map((user) => {
          const userBookings = getUserBookings(user._id);
          const userPayments = getUserPayments(user._id);
          const stats = getUserBookingStats(userBookings);
          const paymentStats = getUserPaymentStats(userPayments);

          return (
            <div key={user._id} style={userSection}>
              {/* USER INFO + SUMMARY */}
              <div style={userHeaderRow}>
                <div style={userCard}>
                  <div style={userHeader}>
                    <div style={avatar}>
                      {(user.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={userName}>{user.name || "Unnamed User"}</h3>
                      <p style={userEmail}>{user.email || "N/A"}</p>
                    </div>
                  </div>

                  <div style={userMetaRow}>
                    <span style={metaPill}>
                      Vehicle: {user.vehicleNumber || "N/A"}
                    </span>
                    <span style={metaPill}>Phone: {user.phone || "N/A"}</span>
                    <span style={rolePill(user.role)}>
                      {user.role || "N/A"}
                    </span>
                  </div>

                  <div style={divider} />

                  <div style={statsGrid}>
                    <div style={statItem}>
                      <span style={statLabel}>Total Bookings</span>
                      <span style={statValue}>{userBookings.length}</span>
                    </div>
                    <div style={statItem}>
                      <span style={statLabel}>Past</span>
                      <span style={statValue}>{stats.past.length}</span>
                    </div>
                    <div style={statItem}>
                      <span style={statLabel}>Current</span>
                      <span style={statValue}>{stats.current.length}</span>
                    </div>
                    <div style={statItem}>
                      <span style={statLabel}>Future</span>
                      <span style={statValue}>{stats.future.length}</span>
                    </div>
                    <div style={statItem}>
                      <span style={statLabel}>No-Shows</span>
                      <span style={statValueDanger}>{stats.noShows.length}</span>
                    </div>
                    <div style={statItem}>
                      <span style={statLabel}>Penalties</span>
                      <span style={statValueDanger}>
                        {stats.penalties.length}
                      </span>
                    </div>
                    <div style={statItem}>
                      <span style={statLabel}>Penalties Paid</span>
                      <span style={statValue}>
                        {stats.penaltiesPaid.length}
                      </span>
                    </div>
                    <div style={statItem}>
                      <span style={statLabel}>Completed Payments</span>
                      <span style={statValue}>
                        {paymentStats.completed.length}
                      </span>
                    </div>
                    <div style={statItem}>
                      <span style={statLabel}>Pending Payments</span>
                      <span style={statValueWarning}>
                        {paymentStats.pending.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ENHANCED BOOKINGS SECTION */}
              <div style={sectionHeader}>
                <h4 style={sectionTitle}>Bookings</h4>
                {userBookings.length === 0 ? (
                  <p style={emptyState}>No bookings found</p>
                ) : (
                  <div style={horizontalRow}>
                    {userBookings.map((b) => {
                      const payment = getBookingPayment(b);
                      const isPaid =
                        payment?.payment?.status === "completed" ||
                        b.paymentStatus === "completed";
                      const penaltyType = b.penaltyType || "-";

                      return (
                        <div
                          key={b._id.$oid || b._id}
                          style={enhancedBookingCard(isPaid)}
                        >
                          {/* Header with status badges */}
                          <div style={cardHeader}>
                            <div style={statusGroup}>
                              <span style={primaryBadge(isPaid)}>
                                {isPaid ? "✓ Paid" : "○ Unpaid"}
                              </span>
                              {b.status && (
                                <span style={secondaryBadge(b.status)}>
                                  {b.status.replace("-", " ")}
                                </span>
                              )}
                            </div>
                            <div style={timeIndicator(b)}>
                              <span style={timeDot}></span>
                            </div>
                          </div>

                          {/* Main content grid */}
                          <div style={bookingContentGrid}>
                            <div style={infoGroup}>
                              <div style={idRow}>
                                <span style={label}>ID:</span>
                                <span style={value}>{truncateId(b._id.$oid || b._id)}</span>
                              </div>
                              <div style={slotRow}>
                                <span style={label}>Slot:</span>
                                <span style={value}>{b.slot?.$oid || b.slot || "N/A"}</span>
                              </div>
                            </div>

                            <div style={timeGroup}>
                              <div style={timeRange}>
                                <span style={timeLabel}>From</span>
                                <span style={timeValue}>{formatTime(b.startTime)}</span>
                              </div>
                              <div style={timeRange}>
                                <span style={timeLabel}>To</span>
                                <span style={timeValue}>
                                  {b.actualExitTime || b.endTime || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Financial details */}
                          <div style={financialRow}>
                            <div style={amountCard}>
                              <span style={amountLabel}>₹{payment?.payment?.amount || 0}</span>
                              <span style={amountSubtext}>Booking</span>
                            </div>
                            <div style={penaltyCard(b.penaltyAmount, b.penaltyPaid)}>
                              <span style={penaltyLabel}>₹{b.penaltyAmount || 0}</span>
                              <span style={penaltySubtext}>
                                {b.penaltyPaid ? "Paid" : "Pending"}
                              </span>
                            </div>
                          </div>

                          {/* Penalty type & payment status */}
                          <div style={footerRow}>
                            <span style={footerText}>
                              Penalty: {penaltyType}
                            </span>
                            <span style={footerText}>
                              Payment: {b.paymentStatus || payment?.payment?.status || "N/A"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ENHANCED PAYMENTS SECTION */}
              <div style={sectionHeader}>
                <h4 style={sectionTitle}>Payments</h4>
                {userPayments.length === 0 ? (
                  <p style={emptyState}>No payments found</p>
                ) : (
                  <div style={horizontalRow}>
                    {userPayments.map((p) => {
                      const isPaid = p.payment?.status === "completed";
                      return (
                        <div key={p._id.$oid || p._id} style={enhancedPaymentCard(isPaid)}>
                          {/* Header */}
                          <div style={cardHeader}>
                            <span style={primaryBadge(isPaid, true)}>
                              {isPaid ? "✓ Completed" : "⚠ Pending"}
                            </span>
                            <div style={priorityIndicator(isPaid)}>
                              <span style={priorityDot(isPaid)}></span>
                            </div>
                          </div>

                          {/* Main content */}
                          <div style={paymentContentGrid}>
                            <div style={paymentInfo}>
                              <div style={idRow}>
                                <span style={label}>Payment ID:</span>
                                <span style={value}>{truncateId(p._id.$oid || p._id)}</span>
                              </div>
                              <div style={idRow}>
                                <span style={label}>Booking:</span>
                                <span style={value}>
                                  {p.bookingId?.$oid || p.bookingId || "N/A"}
                                </span>
                              </div>
                            </div>

                            <div style={amountGroup}>
                              <span style={paymentAmount}>
                                ₹{p.payment?.amount || "N/A"}
                              </span>
                              <span style={methodTag}>{p.payment?.method || "N/A"}</span>
                            </div>
                          </div>

                          {/* Status & timestamp */}
                          <div style={paymentFooter}>
                            <span style={statusChip(p.payment?.status)}>
                              {p.payment?.status || "Unknown"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UsersPanel;

/* -------------------- ENHANCED STYLES -------------------- */
const page = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top, #1f2937 0, #020617 45%, #020617 100%)",
  padding: "32px 16px",
};

const container = {
  maxWidth: "1360px",
  margin: "0 auto",
  color: "#e5e7eb",
  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
};

// ... [Keep all existing styles unchanged until horizontalRow] ...

const horizontalRow = {
  display: "flex",
  gap: "16px",
  overflowX: "auto",
  paddingBottom: "8px",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  WebkitOverflowScrolling: "touch",
};
horizontalRow['&::-webkit-scrollbar'] = {
  display: "none"
};

// ==================== ENHANCED BOOKING CARD ====================
const enhancedBookingCard = (isPaid) => ({
  minWidth: "320px",
  flex: "0 0 auto",
  background: isPaid
    ? "linear-gradient(145deg, rgba(6, 95, 70, 0.95), rgba(5, 78, 59, 0.92))"
    : "linear-gradient(145deg, rgba(127, 29, 29, 0.95), rgba(153, 27, 27, 0.92))",
  border: isPaid
    ? "1px solid rgba(34, 197, 94, 0.6)"
    : "1px solid rgba(248, 113, 113, 0.7)",
  borderRadius: "20px",
  padding: "20px",
  boxShadow: isPaid
    ? "0 20px 50px rgba(34, 197, 94, 0.3), 0 8px 25px rgba(0, 0, 0, 0.4)"
    : "0 20px 50px rgba(248, 113, 113, 0.3), 0 8px 25px rgba(0, 0, 0, 0.4)",
  color: isPaid ? "#ecfdf5" : "#fee2e2",
  position: "relative",
  overflow: "hidden",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  cursor: "pointer",
  ...(!isPaid && {
    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
  })
});

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "16px",
  paddingBottom: "12px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
};

const statusGroup = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap"
};

const primaryBadge = (isPaid, isPayment = false) => ({
  padding: "6px 12px",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: 600,
  background: isPaid
    ? "rgba(34, 197, 94, 0.2)"
    : isPayment
    ? "rgba(245, 158, 11, 0.2)"
    : "rgba(248, 113, 113, 0.2)",
  border: isPaid
    ? "1px solid rgba(34, 197, 94, 0.5)"
    : isPayment
    ? "1px solid rgba(245, 158, 11, 0.5)"
    : "1px solid rgba(248, 113, 113, 0.5)",
  color: isPaid ? "#ecfdf5" : "#fee2e2"
});

const secondaryBadge = (status) => {
  let color = "#9ca3af";
  let bgColor = "rgba(156, 163, 175, 0.2)";
  if (status === "no-show") {
    color = "#f97373";
    bgColor = "rgba(249, 115, 115, 0.2)";
  } else if (status === "completed") {
    color = "#22c55e";
    bgColor = "rgba(34, 197, 94, 0.2)";
  } else if (status === "active") {
    color = "#38bdf8";
    bgColor = "rgba(56, 189, 248, 0.2)";
  }

  return {
    padding: "4px 10px",
    borderRadius: "10px",
    fontSize: "11px",
    fontWeight: 500,
    border: `1px solid ${color}40`,
    color,
    backgroundColor: bgColor,
    textTransform: "capitalize"
  };
};

const timeIndicator = (booking) => {
  const now = new Date();
  const start = new Date(booking.startTime);
  const end = new Date(booking.actualExitTime || booking.endTime);
  let status = "future";
  if (now >= start && now <= end) status = "active";
  else if (now > end) status = "past";

  const colors = {
    active: "#facc15",
    past: "#9ca3af",
    future: "#6b7280"
  };

  return {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: colors[status],
    boxShadow: `0 0 12px ${colors[status]}40`,
    alignSelf: "flex-start"
  };
};

const bookingContentGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
  marginBottom: "16px"
};

const infoGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const idRow = {
  display: "flex",
  flexDirection: "column",
  gap: "2px"
};

const label = {
  fontSize: "11px",
  fontWeight: 500,
  opacity: 0.8,
  letterSpacing: "0.5px",
  textTransform: "uppercase"
};

const value = {
  fontSize: "13px",
  fontWeight: 600,
  lineHeight: 1.3
};

const slotRow = {
  ...idRow,
  fontSize: "12px"
};

const timeGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  justifyContent: "center"
};

const timeRange = {
  display: "flex",
  flexDirection: "column",
  gap: "4px"
};

const timeLabel = {
  fontSize: "11px",
  color: "rgba(255, 255, 255, 0.6)",
  fontWeight: 500
};

const timeValue = {
  fontSize: "14px",
  fontWeight: 600
};

const financialRow = {
  display: "flex",
  gap: "12px",
  marginBottom: "12px",
  padding: "12px",
  background: "rgba(255, 255, 255, 0.05)",
  borderRadius: "12px",
  border: "1px solid rgba(255, 255, 255, 0.08)"
};

const amountCard = {
  flex: 1,
  textAlign: "center",
  padding: "8px 0"
};

const amountLabel = {
  display: "block",
  fontSize: "18px",
  fontWeight: 700,
  lineHeight: 1.1
};

const amountSubtext = {
  fontSize: "11px",
  opacity: 0.7,
  marginTop: "2px"
};

const penaltyCard = (amount, isPaid) => ({
  flex: 1,
  textAlign: "center",
  padding: "8px 0",
  ...(amount > 0 && {
    background: isPaid ? "rgba(34, 197, 94, 0.15)" : "rgba(248, 113, 113, 0.15)",
    borderRadius: "8px"
  })
});

const penaltyLabel = {
  display: "block",
  fontSize: "18px",
  fontWeight: 700,
  lineHeight: 1.1
};

const penaltySubtext = {
  fontSize: "11px",
  opacity: 0.8,
  marginTop: "2px",
  fontWeight: 500
};

const footerRow = {
  display: "flex",
  justifyContent: "space-between",
  paddingTop: "12px",
  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  fontSize: "12px",
  opacity: 0.9
};

const footerText = {
  fontWeight: 500
};

// ==================== ENHANCED PAYMENT CARD ====================
const enhancedPaymentCard = (isPaid) => ({
  minWidth: "280px",
  flex: "0 0 auto",
  background: isPaid
    ? "linear-gradient(145deg, rgba(6, 95, 70, 0.96), rgba(6, 78, 59, 0.93))"
    : "linear-gradient(145deg, rgba(120, 53, 15, 0.96), rgba(146, 64, 14, 0.93))",
  border: isPaid
    ? "1px solid rgba(34, 197, 94, 0.6)"
    : "1px solid rgba(245, 158, 11, 0.7)",
  borderRadius: "20px",
  padding: "20px",
  boxShadow: isPaid
    ? "0 20px 50px rgba(34, 197, 94, 0.3), 0 8px 25px rgba(0, 0, 0, 0.4)"
    : "0 20px 50px rgba(245, 158, 11, 0.3), 0 8px 25px rgba(0, 0, 0, 0.4)",
  color: "#ecfdf5",
  position: "relative",
  overflow: "hidden"
});

const paymentContentGrid = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: "16px",
  marginBottom: "16px"
};

const paymentInfo = {
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const amountGroup = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "8px",
  justifyContent: "center"
};

const paymentAmount = {
  fontSize: "22px",
  fontWeight: 700,
  lineHeight: 1
};

const methodTag = {
  padding: "4px 10px",
  background: "rgba(255, 255, 255, 0.1)",
  borderRadius: "20px",
  fontSize: "11px",
  fontWeight: 500,
  border: "1px solid rgba(255, 255, 255, 0.2)"
};

const paymentFooter = {
  textAlign: "right"
};

const statusChip = (status) => {
  let color = "#9ca3af";
  let bgColor = "rgba(156, 163, 175, 0.2)";
  if (status === "completed") {
    color = "#22c55e";
    bgColor = "rgba(34, 197, 94, 0.2)";
  } else if (status === "pending") {
    color = "#facc15";
    bgColor = "rgba(250, 204, 21, 0.2)";
  } else if (status === "failed") {
    color = "#f97373";
    bgColor = "rgba(249, 115, 115, 0.2)";
  }

  return {
    padding: "6px 14px",
    borderRadius: "20px",
    backgroundColor: bgColor,
    color,
    fontSize: "12px",
    fontWeight: 600,
    border: `1px solid ${color}40`
  };
};

// ==================== NEW SECTION STYLES ====================
const sectionHeader = {
  marginBottom: "24px"
};

const sectionTitle = {
  margin: "0 0 16px 0",
  fontSize: "16px",
  fontWeight: 600,
  color: "#f9fafb"
};

const emptyState = {
  color: "#6b7280",
  fontSize: "14px",
  padding: "24px",
  textAlign: "center",
  background: "rgba(17, 24, 39, 0.5)",
  borderRadius: "12px",
  border: "1px solid rgba(55, 65, 81, 0.5)"
};

// ==================== UTILITY FUNCTIONS ====================
const truncateId = (id) => id?.slice(-8) || "N/A";
const formatTime = (time) => time ? new Date(time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "N/A";

const priorityIndicator = (isPaid) => ({
  width: "12px",
  height: "12px",
  borderRadius: "50%",
  backgroundColor: isPaid ? "#22c55e" : "#f97316",
  boxShadow: `0 0 16px ${isPaid ? "#22c55e40" : "#f9731640"}`,
  alignSelf: "flex-start"
});

const priorityDot = (isPaid) => ({
  width: "4px",
  height: "4px",
  borderRadius: "50%",
  backgroundColor: isPaid ? "#22c55e" : "#facc15",
  marginLeft: "4px"
});

const timeDot = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  backgroundColor: "#facc15",
  boxShadow: "0 0 8px #facc1540",
  marginTop: "2px"
};

// ==================== ALL EXISTING STYLES (UNCHANGED) ====================
// [Include all the original styles from headerRow down to errorBadge exactly as they were]
const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  marginBottom: "24px",
};

const title = {
  margin: 0,
  fontSize: "24px",
  fontWeight: 600,
};

const subtitle = {
  margin: "6px 0 0",
  fontSize: "14px",
  color: "#9ca3af",
};

const headerMeta = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "8px",
  fontSize: "13px",
};

const pill = {
  padding: "4px 10px",
  borderRadius: "999px",
  border: "1px solid rgba(156, 163, 175, 0.5)",
  fontSize: "12px",
  color: "#e5e7eb",
  background: "rgba(17, 24, 39, 0.6)",
  backdropFilter: "blur(8px)",
};

const updatedText = {
  color: "#9ca3af",
};

const summaryRow = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "16px",
  marginBottom: "24px",
};

const summaryCard = {
  padding: "14px 16px",
  borderRadius: "14px",
  background:
    "linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.7))",
  border: "1px solid rgba(75, 85, 99, 0.8)",
  boxShadow: "0 18px 45px rgba(0, 0, 0, 0.55)",
};

const summaryLabel = {
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "#9ca3af",
  marginBottom: "6px",
};

const summaryValue = {
  fontSize: "22px",
  fontWeight: 600,
};

const chartCard = {
  marginBottom: "28px",
  padding: "18px 18px 10px",
  borderRadius: "18px",
  background:
    "linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(17, 24, 39, 0.92))",
  border: "1px solid rgba(55, 65, 81, 0.9)",
  boxShadow:
    "0 24px 60px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(15, 23, 42, 0.9) inset",
};

const chartHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  marginBottom: "10px",
};

const chartTitle = {
  margin: 0,
  fontSize: "16px",
  fontWeight: 500,
};

const chartSubtitle = {
  margin: 0,
  fontSize: "13px",
  color: "#9ca3af",
};

const customTooltip = {
  background: "rgba(15, 23, 42, 0.95)",
  borderRadius: "10px",
  border: "1px solid rgba(55, 65, 81, 0.9)",
  color: "#f9fafb",
  fontSize: "12px",
  padding: "8px 10px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.55)",
};

const userSection = {
  marginBottom: "32px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const userHeaderRow = {
  display: "flex",
  gap: "16px",
};

const userCard = {
  padding: "18px 18px 16px",
  background:
    "linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(15, 23, 42, 0.92))",
  borderRadius: "18px",
  border: "1px solid rgba(55, 65, 81, 0.95)",
  boxShadow:
    "0 22px 55px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(17, 24, 39, 0.85) inset",
  minWidth: "260px",
  flex: "0 0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const userHeader = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const avatar = {
  width: "40px",
  height: "40px",
  borderRadius: "999px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "radial-gradient(circle at 30% 0, #f97316, #4f46e5 55%, #22c55e 110%)",
  color: "#f9fafb",
  fontWeight: 600,
  fontSize: "18px",
};

const userName = {
  margin: 0,
  fontSize: "16px",
  fontWeight: 500,
};

const userEmail = {
  margin: "2px 0 0",
  fontSize: "13px",
  color: "#9ca3af",
};

const userMetaRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
};

const metaPill = {
  padding: "4px 8px",
  borderRadius: "999px",
  background: "rgba(17, 24, 39, 0.9)",
  border: "1px solid rgba(55, 65, 81, 0.9)",
  fontSize: "11px",
  color: "#d1d5db",
};

const rolePill = (role) => ({
  ...metaPill,
  borderColor: role === "admin" ? "#f97316" : "#4b5563",
  color: role === "admin" ? "#fed7aa" : "#d1d5db",
});

const divider = {
  borderTop: "1px dashed rgba(55, 65, 81, 0.8)",
  margin: "4px 0 2px",
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
  gap: "10px",
  marginTop: "4px",
};

const statItem = {
  display: "flex",
  flexDirection: "column",
  gap: "2px",
};

const statLabel = {
  fontSize: "11px",
  color: "#9ca3af",
};

const statValue = {
  fontSize: "14px",
  fontWeight: 500,
};

const statValueDanger = {
  ...statValue,
  color: "#f97373",
};

const statValueWarning = {
  ...statValue,
  color: "#facc15",
};

const mutedText = {
  color: "#6b7280",
  fontSize: "13px",
};

const fullScreenCenter = {
  minHeight: "60vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background:
    "radial-gradient(circle at top, #1f2937 0, #020617 45%, #020617 100%)",
  color: "#e5e7eb",
  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
};

const loader = {
  width: "32px",
  height: "32px",
  borderRadius: "999px",
  border: "3px solid rgba(156, 163, 175, 0.35)",
  borderTopColor: "#6366f1",
  animation: "spin 0.9s linear infinite",
};

const loaderText = {
  marginTop: "10px",
  fontSize: "14px",
  color: "#9ca3af",
};

const errorBadge = {
  padding: "10px 16px",
  borderRadius: "12px",
  border: "1px solid rgba(248, 113, 113, 0.9)",
  background:
    "linear-gradient(145deg, rgba(127, 29, 29, 0.98), rgba(153, 27, 27, 0.93))",
  color: "#fee2e2",
  fontSize: "14px",
  maxWidth: "420px",
  textAlign: "center",
};

/* Add these keyframes to your global CSS:
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
*/
