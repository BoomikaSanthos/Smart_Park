import React, { useState } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MapPage from './pages/MapPage';
import Analytics from './pages/Analytics';
import Slots from './pages/Slots';
import Booking from './pages/Booking';
import History from './pages/History';
import Profile from './pages/Profile';
import Payment from './pages/Payment';
import AdminPage from './pages/AdminPage';
// REMOVED: import Navbar from './components/Navbar';  ❌ No global navbar
import './App.css';
import "leaflet/dist/leaflet.css";

function App() {
  const [page, setPage] = useState('home');
  const [pageData, setPageData] = useState({});

  const commonProps = {
    setPage: (newPage, data = {}) => {
      setPage(newPage);
      setPageData(data);
    },
    pageData,
    currentPage: page
  };

  const renderPage = () => {
    switch(page) {
      case 'login': return <Login {...commonProps} />;
      case 'register': return <Register {...commonProps} />;
      case 'map': return <MapPage {...commonProps} />;
      case 'slots':
        const slotsLocationId = pageData.locationId || pageData;
        return <Slots locationId={slotsLocationId} {...commonProps} />;
      case 'booking':
        const bookingData = pageData.selectedSlot || pageData || {};
        return (
          <Booking
            selectedSlot={bookingData}
            locationId={pageData.locationId}
            {...commonProps}
          />
        );
      case 'history': return <History {...commonProps} />;
      case 'profile': return <Profile {...commonProps} />;
      case 'payment': return <Payment {...commonProps} />;
      case 'admin': return <AdminPage setPage={setPage} />;
      case 'analytics': return <Analytics {...commonProps} />; // ✅ Added Analytics
      default: return <Home {...commonProps} />;
    }
  };

  return (
    <>
      {/* ✅ REMOVED: Global Navbar - No more white bar! */}
      {renderPage()}
    </>
  );
}

export default App;
