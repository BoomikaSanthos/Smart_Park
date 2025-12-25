import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthPages.css";

const API_BASE = "http://localhost:5000";

const LoginPage = () => {
  const [emailOrVehicle, setEmailOrVehicle] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailOrVehicle,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      navigate("/slots");
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
        {/* Left: text only, no card – different from landing */}
        <div className="auth-intro">
          <h2>Welcome back, driver</h2>
          <p>
            Sign in to continue booking slots, checking availability and
            managing your vehicles inside ParkSmart.
          </p>
        </div>

        {/* Right: compact glass login card */}
        <div className="auth-card auth-card-login">
          <div className="auth-header-row">
            <div className="auth-logo">
              PARK<span>SMART</span>
            </div>
            <button
              className="auth-link-btn"
              type="button"
              onClick={() => navigate("/register")}
            >
              New here? Register
            </button>
          </div>

          <h1 className="auth-title">Login</h1>
          <p className="auth-subtitle">
            Use your registered email and password to access your account.
          </p>

          <form className="auth-form" onSubmit={handleLogin}>
            <label className="auth-label">
              Email
              <input
                className="auth-input"
                type="text"
                value={emailOrVehicle}
                onChange={(e) => setEmailOrVehicle(e.target.value)}
                placeholder="you@example.com"
              />
            </label>

            <label className="auth-label">
              Password
              <input
                className="auth-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>

            <div className="auth-actions">
              <button className="auth-primary" type="submit">
                Log in
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
      </div>
    </div>
  );
};

export default LoginPage;
