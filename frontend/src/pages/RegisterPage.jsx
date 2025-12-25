import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthPages.css";

const API_BASE = "http://localhost:5000";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    vehicleNumber: "",
    vehicleType: "",
    phone: "",
    role: "user",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Registration failed");
        return;
      }

      setMessage("Registration successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-bg"></div>
      <div className="auth-overlay"></div>

      <div className="auth-shell">
        {/* Left: wide glass card (different layout from login) */}
        <div className="auth-card auth-card-register">
          <div className="auth-header-row">
            <div className="auth-logo">
              PARK<span>SMART</span>
            </div>
            <button
              className="auth-link-btn"
              type="button"
              onClick={() => navigate("/login")}
            >
              Already registered? Login
            </button>
          </div>

          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">
            Register once to manage your vehicles, bookings and parking slots.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-grid">
              <label className="auth-label">
                Name
                <input
                  className="auth-input"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full name"
                />
              </label>

              <label className="auth-label">
                Email
                <input
                  className="auth-input"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
              </label>

              <label className="auth-label">
                Password
                <input
                  className="auth-input"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                />
              </label>

              <label className="auth-label">
                Vehicle number
                <input
                  className="auth-input"
                  name="vehicleNumber"
                  value={form.vehicleNumber}
                  onChange={handleChange}
                  placeholder="HR26AB1234"
                />
              </label>

              <label className="auth-label">
                Vehicle type
                <input
                  className="auth-input"
                  name="vehicleType"
                  value={form.vehicleType}
                  onChange={handleChange}
                  placeholder="Car / Bike"
                />
              </label>

              <label className="auth-label">
                Phone
                <input
                  className="auth-input"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10‑digit number"
                />
              </label>

              <label className="auth-label">
                Role
                <select
                  className="auth-input"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="user">Standard user</option>
                  <option value="admin">Parking admin</option>
                </select>
              </label>
            </div>

            <div className="auth-actions">
              <button className="auth-primary" type="submit">
                Register
              </button>
              <button
                className="auth-secondary"
                type="button"
                onClick={() => navigate("/")}
              >
                Back to home
              </button>
            </div>
          </form>

          {message && <p className="auth-message">{message}</p>}
        </div>

        {/* Right side empty / breathing space (optional text later) */}
        <div className="auth-intro" style={{ maxWidth: 280 }}>
          <h2>Parking made simple</h2>
          <p>
            One account is all you need to discover nearby slots, reserve ahead
            of time, and skip circling around for parking.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
