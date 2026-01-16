import React, { useState } from 'react';
import axios from 'axios';

function Register({ setPage }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    vehicleNumber: '',
    vehicleType: '',
    phone: '',
    role: 'user'
  });
  const [otp, setOtp] = useState('');
  const [otpRequired, setOtpRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
    setError('');
  };

  const resendOtp = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        ...formData,
        resendOtp: true
      });
      setError('✅ New OTP sent to your email');
    } catch {
      setError('OTP resend failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = { ...formData };
      if (otpRequired && otp) payload.otp = otp;

      const res = await axios.post('http://localhost:5000/api/auth/register', payload);

      if (res.data.otpRequired) {
        setOtpRequired(true);
        setError('🔐 OTP sent to admin email');
        setLoading(false);
        return;
      }

      alert('Registration successful! Please login.');
      setPage('login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <button className="back-btn" onClick={() => setPage('home')}>← Back</button>
      <div className="auth-container">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <input name="vehicleNumber" placeholder="Vehicle Number" value={formData.vehicleNumber} onChange={handleChange} required />
          <input name="vehicleType" placeholder="Vehicle Type" value={formData.vehicleType} onChange={handleChange} required />
          <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          {otpRequired && (
            <div style={{ marginTop: '12px', padding: '12px', border: '2px solid #2196F3', borderRadius: '8px', background: '#f0f8ff' }}>
              <p style={{ color: '#1976d2' }}>🔐 Admin Verification Required</p>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={handleOtpChange}
                maxLength={6}
                style={{ width: '100%', fontSize: '18px', textAlign: 'center', letterSpacing: '4px', marginBottom: '8px' }}
                autoFocus
              />
              <button type="button" onClick={resendOtp} className="btn-secondary">🔄 Resend OTP</button>
            </div>
          )}

          <button
            type="submit"
            className="btn-main"
            disabled={loading || (otpRequired && otp.length !== 6)}
          >
            {loading ? 'Processing...' : otpRequired ? 'Verify OTP' : 'Register'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Already have an account?
          <button className="link-btn" onClick={() => setPage('login')}>Login</button>
        </p>
      </div>
    </div>
  );
}

export default Register;
