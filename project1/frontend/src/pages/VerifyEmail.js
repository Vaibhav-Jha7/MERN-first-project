import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/verify-email', { email, code });
      login(res.data.token, res.data.user);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    setResending(true);
    try {
      const res = await api.post('/auth/resend-code', { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleVerify}>
        <h2>Verify your email</h2>
        <p className="auth-subtitle">
          We sent a 6-digit verification code to your email. Enter it below to activate your account.
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />

        <label>Verification Code</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="6-digit code"
          maxLength={6}
          required
          className="code-input"
        />

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>

        <button type="button" className="btn-secondary" onClick={handleResend} disabled={resending}>
          {resending ? 'Sending...' : 'Resend Code'}
        </button>

        <p className="auth-footer">
          <Link to="/login">Back to Login</Link>
        </p>
      </form>
    </div>
  );
};

export default VerifyEmail;
