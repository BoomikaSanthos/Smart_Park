import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';  // ✅ GLOBAL CSS for ALL pages
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
