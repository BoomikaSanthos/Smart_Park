import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SlotList from "./pages/SlotList";
import MapPage from "./pages/MapPage";
import RegisterPage from "./pages/RegisterPage";
import BookingPage from "./pages/BookingPage";
import BookingHistory from './components/BookingHistory';

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing shown first */}
        <Route path="/" element={<LandingPage />} />

        {/* Login is public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Register is public */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected pages: only show if logged in */}
        <Route
          path="/map"
          element={token ? <MapPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/slots"
          element={token ? <SlotList /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/book"
          element={token ? <BookingPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/history"
          element={token ? <BookingHistory /> : <Navigate to="/login" replace />}
        />

        {/* Default path: go to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
