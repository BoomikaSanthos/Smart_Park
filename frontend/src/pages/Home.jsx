import React from 'react';
import Navbar from '../components/Navbar';

function Home({ setPage, isLoggedIn }) {
  return (
    <div className="home">
      <Navbar setPage={setPage} currentPage="home" />
      <main>
        <h1>
          Smart <span>Parking</span>
        </h1>
        <p>Real-time slots • Secure booking • Admin dashboard</p>

        <div className="features">
          <div className="feature-card">📍 Live Slots</div>
          <div className="feature-card">🔐 JWT Auth</div>
          <div className="feature-card">🚗 Vehicle Booking</div>
        </div>

        <div
          className="auth-buttons"
          style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}
        >
          {!isLoggedIn ? (
            <>
              <button className="btn-main" onClick={() => setPage('login')}>
                Get Started
              </button>
              <button className="nav-btn" onClick={() => setPage('register')}>
                Create Account
              </button>
              {/* Analytics Button */}
              <button
                className="btn-main"
                style={{ backgroundColor: '#4f46e5' }}
                onClick={() => setPage('analytics')}
              >
                📊 Analytics
              </button>
            </>
          ) : (
            <>
              <button className="btn-main" onClick={() => setPage('profile')}>
                Go to Profile
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;
