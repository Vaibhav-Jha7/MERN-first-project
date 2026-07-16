import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
 
const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
 
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
 
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🎟️ EventOra
      </Link>
      <div className="navbar-links">
        <Link to="/">Events</Link>
        {user && !isAdmin && <Link to="/dashboard">My Bookings</Link>}
        {isAdmin && <Link to="/admin">Admin Dashboard</Link>}
        {isAdmin && <Link to="/admin/events">Manage Events</Link>}
        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup" className="btn-nav">
              Sign Up
            </Link>
          </>
        ) : (
          <>
            <span className="navbar-user">Hi, {user.name.split(' ')[0]}</span>
            <button className="btn-nav-outline" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};
 
export default Navbar;
 