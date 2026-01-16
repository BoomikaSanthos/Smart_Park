import React, { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';

function Login({ setPage }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const timeoutRef = useRef(null);

  // ✅ Credential validation (FIX ONLY HERE)
  const validateCredentials = useCallback(async () => {
    if (!formData.email || !formData.password) {
      setIsValid(false);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/validate', {
        email: formData.email,
        password: formData.password,
        role: selectedRole // ✅ REQUIRED
      });

      setIsValid(true);
      setError('');
    } catch (err) {
      setIsValid(false);
      setError(err.response?.data?.message || 'Invalid credentials');
      setOtpRequired(false);
    }
  }, [formData.email, formData.password, selectedRole]);

  // ✅ Debounced validation
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(validateCredentials, 600);
    return () => clearTimeout(timeoutRef.current);
  }, [validateCredentials]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setIsValid(false);
    if (otpRequired) {
      setOtpRequired(false);
      setOtp('');
    }
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
    setError('');
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setError('');
    setOtpRequired(false);
    setOtp('');
    setIsValid(false);
  };

  const resendOtp = async () => {
    setOtp('');
    try {
      await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        password: formData.password,
        role: selectedRole,
      });
      setError('✅ New OTP sent!');
    } catch {
      setError('Resend failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || loading || (otpRequired && otp.length !== 6)) return;

    setLoading(true);
    setError('');

    try {
      const loginData = {
        email: formData.email,
        password: formData.password,
        role: selectedRole,
      };

      if (otpRequired && otp) loginData.otp = otp;

      const resData = await axios.post('http://localhost:5000/api/auth/login', loginData);

      if (resData.data.otpRequired) {
        setOtpRequired(true);
        setError('✅ OTP sent to your email!');
      } else {
        localStorage.setItem('token', resData.data.token);
        if (resData.data.role === 'admin') setPage('admin');
        else setPage('map');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <button className="back-btn" onClick={() => setPage('home')}>← Back</button>

      <div className="login-container">
        <div className="login-header">
          <h1>ParkSmart</h1>
          <p>Welcome to ParkSmart</p>
          <p>Manage your parking efficiently with ParkSmart.</p>
          <p>Register or login to access your profile</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {otpRequired && (
            <div style={{
              padding: '12px',
              background: '#f0f8ff',
              border: '2px solid #2196F3',
              borderRadius: '8px',
              margin: '12px 0'
            }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#1976d2' }}>
                🔐 Admin 2FA Required
              </p>

              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={handleOtpChange}
                maxLength={6}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '18px',
                  textAlign: 'center',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  letterSpacing: '4px',
                  fontWeight: 'bold',
                  marginBottom: '8px'
                }}
                autoFocus
              />

              <button
                type="button"
                onClick={resendOtp}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                🔄 Resend OTP
              </button>
            </div>
          )}

          <button
            type="submit"
            className={`login-btn ${isValid && (!otpRequired || otp.length === 6) ? '' : 'disabled'}`}
            disabled={!isValid || loading || (otpRequired && otp.length !== 6)}
          >
            {loading ? 'Logging in...' : otpRequired ? 'Verify OTP' : 'Log In'}
          </button>
        </form>

        {error && !otpRequired && (
          <div className="error-message" style={{
            color: 'red',
            padding: '8px',
            borderRadius: '4px',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            margin: '8px 0',
            fontSize: '14px'
          }}>
            ❌ {error}
          </div>
        )}

        <div className="auth-links">
          <button className="link-btn">Forgot Password?</button>
          <button className="link-btn" onClick={() => setPage('register')}>
            Register?
          </button>
        </div>

        <div className="role-selection">
          <label>
            <input
              type="radio"
              name="role"
              value="user"
              checked={selectedRole === 'user'}
              onChange={handleRoleChange}
            />
            Standard User
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="admin"
              checked={selectedRole === 'admin'}
              onChange={handleRoleChange}
            />
            Parking Admin
          </label>
        </div>

        <div className="bottom-nav">
          <button className="nav-icon">🏠</button>
          <button className="nav-icon">🔍</button>
          <button className="nav-icon">👤</button>
        </div>
      </div>
    </div>
  );
}

export default Login;
