// pages/AdminPage.jsx
import React from 'react';
import AdminDashboard from '../components/AdminDashboard';

function AdminPage() {
  const setPage = (page) => {
    // Handle page navigation (use React Router or state)
    window.location.href = `/#/${page}`;
  };

  return <AdminDashboard setPage={setPage} />;
}

export default AdminPage;
