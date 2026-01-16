import React from 'react';

function Navbar({ setPage, currentPage }) {
  const isLoggedIn = !!localStorage.getItem('token');

  // ✅ Extract role from JWT
  const getRole = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch {
      return null;
    }
  };

  const role = getRole();

  // Home page ONLY: Login/Register
  if (currentPage === 'home') {
    return (
      <nav className="navbar">
        <div className="logo">🅿️ SmartPark</div>
        <div className="navbar-map">
  <h1>SmartPark</h1>
</div>
        <div className="nav-buttons">
          <button className="nav-btn" onClick={() => setPage('login')}>Login</button>
          <button className="btn-main" onClick={() => setPage('register')}>Register</button>
        </div>
      </nav>
    );
  }

  // Other pages: Full menu - ✅ Fixed page names to match App.jsx switch cases
  return (
    <nav className="navbar">
      <div className="logo">🅿️ SmartPark</div>
      <div className="nav-buttons">
        {isLoggedIn && (
          <>
            <button className="nav-btn" onClick={() => setPage('map')}>Map</button>
            <button className="nav-btn" onClick={() => setPage('slots')}>Slots</button>
            <button className="nav-btn" onClick={() => setPage('booking')}>Book</button>
            <button className="nav-btn" onClick={() => setPage('history')}>History</button>
            <button className="nav-btn" onClick={() => setPage('payment')}>Payment</button>
            <button className="nav-btn" onClick={() => setPage('profile')}>Profile</button>
            {role === 'admin' && (
              <button
                className="nav-btn bg-orange-500 hover:bg-orange-600 text-white font-bold"
                onClick={() => setPage('admin')}
              >
                👑 Admin
              </button>
            )}
          </>
        )}
        <button
          className="nav-btn bg-red-500 hover:bg-red-600 text-white"
          onClick={() => {
            localStorage.removeItem('token');
            setPage('home'); // ✅ Better UX: Go to home instead of hard reload
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
