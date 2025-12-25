import React from "react";
import "./LandingPage.css";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="hp-root">
      {/* top navigation bar */}
      <header className="hp-topbar">
        <div className="hp-logo">
          <span className="hp-logo-badge">P</span>
          <span className="hp-logo-text">SmartPark Pro</span>
        </div>
        <nav className="hp-nav">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
          <button className="hp-nav-btn" onClick={() => navigate("/login")}>
            Login
          </button>
        </nav>
      </header>

      {/* hero section */}
      <main className="hp-hero">
        <p className="hp-eyebrow">SMART PARKING • AI &amp; IoT</p>

        <h1 className="hp-title">
          Revolutionize Your <span>Parking Experience</span>
        </h1>

        <p className="hp-subtitle">
          SmartPark Pro uses cutting‑edge AI and IoT technology to optimize
          parking management, reduce congestion, and enhance user experience
          across commercial and residential properties.
        </p>

        <div className="hp-actions">
          <button className="hp-primary" onClick={() => navigate("/login")}>
            Get Started
          </button>
          <button
            className="hp-secondary"
            onClick={() =>
              window.scrollTo({ top: 600, behavior: "smooth" })
            }
          >
            Explore Features
          </button>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
