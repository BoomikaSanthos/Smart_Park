import React, { useState } from "react";
import Navbar from "../components/Navbar";

const Payment = ({ setPage, pageData }) => {
  const {
    bookingId = "",
    amount = 0,
    parkingCharge = 0,
    penalty = 0,
    penaltyType = "",
    actualDurationMinutes = 0,
    vehicleNumber = "",
    slotNumber = "",
    slabs = 0
  } = pageData || {};

  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [loading, setLoading] = useState(false);

  // 🔴 MODIFIED - Just display success message, keep all other logic
  const handlePayment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Login required");
        return;
      }

      // Simulate API call delay but don't actually call backend
      await new Promise(resolve => setTimeout(resolve, 1500));

      const data = { message: "Payment successful" }; // Mock response

      // Keep original response handling logic
      if (!true) { // Always success for mock
        console.error("Payment failed:", data);
        alert(data.message || "Payment failed");
        return;
      }

      alert("✅ Payment Successful!");
      setPage("history");
    } catch (error) {
      console.error(error);
      alert("Payment error occurred");
    } finally {
      setLoading(false);
    }
  };

  const PaymentMethodCard = ({ method, label, icon, description }) => (
    <div
      className={`payment-method-card ${paymentMethod === method ? "active" : ""}`}
      onClick={() => setPaymentMethod(method)}
    >
      <div className="method-icon">{icon}</div>
      <div className="method-content">
        <h4>{label}</h4>
        <p>{description}</p>
      </div>
      {paymentMethod === method && <div className="check-icon">✓</div>}
    </div>
  );

  return (
    <div className="payment-page">
      <Navbar setPage={setPage} />

      <div className="payment-container">
        <div className="payment-card">
          {/* HEADER */}
          <div className="header-section">
            <div className="header-icon">💳</div>
            <div>
              <h1 className="page-title">Complete Payment</h1>
              <div className="booking-id">
                <span className="id-label">Booking ID:</span>
                <span className="id-value">#{bookingId}</span>
              </div>
            </div>
          </div>

          {/* PARKING DETAILS */}
          <div className="details-section">
            <h3>🅿️ Parking Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Vehicle</span>
                <span className="detail-value">{vehicleNumber}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Slot</span>
                <span className="detail-value">{slotNumber}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Duration</span>
                <span className="detail-value">{actualDurationMinutes} mins</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Slabs</span>
                <span className="detail-value">{slabs}</span>
              </div>
            </div>
          </div>

          {/* BILL SUMMARY */}
          <div className="summary-section">
            <h3>💰 Bill Summary</h3>
            <div className="charges-list">
              <div className="charge-item">
                <span>Parking Charge</span>
                <span>₹{parkingCharge.toLocaleString()}</span>
              </div>
              {penalty > 0 && (
                <div className="charge-item penalty">
                  <span>Penalty ({penaltyType})</span>
                  <span>₹{penalty.toLocaleString()}</span>
                </div>
              )}
              <div className="total-divider"></div>
              <div className="total-amount">
                <span className="total-label">Total Amount</span>
                <span className="total-value">₹{amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* PAYMENT METHODS */}
          <div className="payment-methods-section">
            <h3>🎯 Choose Payment Method</h3>
            <div className="payment-methods-grid">
              <PaymentMethodCard
                method="upi"
                label="UPI"
                icon="🤳"
                description="Google Pay, PhonePe, Paytm"
              />
              <PaymentMethodCard
                method="card"
                label="Card"
                icon="💳"
                description="Debit / Credit Card"
              />
              <PaymentMethodCard
                method="cash"
                label="Cash"
                icon="💵"
                description="Pay at counter"
              />
            </div>
          </div>

          {/* PAY BUTTON */}
          <button
            className={`pay-now-btn ${loading ? 'loading' : ''}`}
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              `PAY ₹${amount.toLocaleString()}`
            )}
          </button>

          {/* SECURITY & HELP */}
          <div className="footer-section">
            <div className="security-note">
              <span className="lock-icon">🔒</span>
              100% Secure Payment
            </div>
            <div className="help-text">
              Need help? Contact support at <a href="tel:+91">+91 98765 43210</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
