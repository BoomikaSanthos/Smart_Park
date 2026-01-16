// AdminDashboard.jsx
import React, { useState } from 'react';
import DashboardPanel from './panels/DashboardPanel';
import ParkingPanel from './panels/ParkingPanel';
import UsersPanel from './panels/UsersPanel';
import AlertsPanel from './panels/AlertsPanel';
import BookingsPanel from './panels/BookingsPanel';
import './AdminDashboard.css';

function AdminDashboard({ setPage }) {
  const [activePane, setActivePane] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = localStorage.getItem('token');

  const panes = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'parking', label: 'Parking Info', icon: '🅿️' },
    { key: 'users', label: 'Users', icon: '👥' },
    { key: 'alerts', label: 'Alerts', icon: '🚨' },
    { key: 'bookings', label: 'Bookings', icon: '📜' },
  ];

  const renderPanel = () => {
    switch (activePane) {
      case 'dashboard': return <DashboardPanel token={token} />;
      case 'parking': return <ParkingPanel token={token} />;
      case 'users': return <UsersPanel token={token} />;
      case 'alerts': return <AlertsPanel token={token} />;
      case 'bookings': return <BookingsPanel token={token} />;
      default: return <div className="empty-state">Select a panel</div>;
    }
  };

  return (
    <div className="admin-container">
      {/* Top Navigation */}
      <nav className="admin-navbar">
        <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        <h2>ParkSmart Admin</h2>
        <div className="navbar-tabs">
          {panes.map(pane => (
            <button
              key={pane.key}
              className={`tab-button ${activePane === pane.key ? 'active' : ''}`}
              onClick={() => setActivePane(pane.key)}
            >
              <span className="tab-icon">{pane.icon}</span>
              <span className="tab-text">{pane.label}</span>
            </button>
          ))}
        </div>
        <div className="nav-actions">
          <button className="icon-btn">🔔</button>
          <button className="logout-btn" onClick={() => {
            localStorage.removeItem('token');
            setPage('login');
          }}>
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {panes.map(pane => (
          <button
            key={pane.key}
            className={activePane === pane.key ? 'active' : ''}
            onClick={() => {
              setActivePane(pane.key);
              setSidebarOpen(false);
            }}
          >
            {pane.icon} {pane.label}
          </button>
        ))}
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="pane-content">
          {renderPanel()}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
