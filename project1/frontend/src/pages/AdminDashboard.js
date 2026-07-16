import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'All' },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actioningId, setActioningId] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.stats);
    } catch (err) {
      // non-fatal
    }
  };

  const fetchBookings = async (status) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/bookings', { params: { status } });
      setBookings(res.data.bookings);
    } catch (err) {
      setError('Could not load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchBookings(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleAction = async (bookingId, status) => {
    setActioningId(bookingId);
    setError('');
    try {
      await api.put(`/admin/bookings/${bookingId}/status`, { status });
      await fetchBookings(activeTab);
      await fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="page-container">
      <h1>Admin Dashboard</h1>
      <p className="auth-subtitle">Review and manage event booking requests</p>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.totalUsers}</span>
            <span className="stat-label">Users</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.totalEvents}</span>
            <span className="stat-label">Events</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.totalBookings}</span>
            <span className="stat-label">Total Bookings</span>
          </div>
          <div className="stat-card pending">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card accepted">
            <span className="stat-value">{stats.accepted}</span>
            <span className="stat-label">Accepted</span>
          </div>
          <div className="stat-card rejected">
            <span className="stat-value">{stats.rejected}</span>
            <span className="stat-label">Rejected</span>
          </div>
        </div>
      )}

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="page-loader">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">No bookings in this category.</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>User</th>
                <th>Event</th>
                <th>Seats</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.ticketId}</td>
                  <td>
                    {b.user?.name}
                    <br />
                    <small>{b.user?.email}</small>
                  </td>
                  <td>
                    {b.event?.title}
                    <br />
                    <small>
                      {b.event ? new Date(b.event.date).toLocaleDateString() : ''} {b.event?.time}
                    </small>
                  </td>
                  <td>{b.seats}</td>
                  <td>{b.totalPrice > 0 ? `₹${b.totalPrice}` : 'Free'}</td>
                  <td>
                    <span className={`status-badge status-${b.status}`}>{b.status}</span>
                  </td>
                  <td>
                    {b.status === 'pending' ? (
                      <div className="action-buttons">
                        <button
                          className="btn-accept"
                          disabled={actioningId === b._id}
                          onClick={() => handleAction(b._id, 'accepted')}
                        >
                          Accept
                        </button>
                        <button
                          className="btn-reject"
                          disabled={actioningId === b._id}
                          onClick={() => handleAction(b._id, 'rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
