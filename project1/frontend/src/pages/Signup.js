import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/signup', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      navigate('/verify-email', { state: { email: res.data.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create your account</h2>
        <p className="auth-subtitle">Sign up to start booking events</p>

        {error && <div className="alert alert-error">{error}</div>}

        <label>Full Name</label>
        <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />

        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />

        <label>Password</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" required />

        <label>Confirm Password</label>
        <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" required />

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
