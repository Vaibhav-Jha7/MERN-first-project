import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const STATUS_STYLES = {
  pending: { label: 'Pending Approval', className: 'status-pending' },
  accepted: { label: 'Confirmed', className: 'status-accepted' },
  rejected: { label: 'Rejected', className: 'status-rejected' },
  cancelled: { label: 'Cancelled', className: 'status-cancelled' },
};

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data.bookings);
    } catch (err) {
      setError('Could not load your bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="page-container">
      <h1>My Bookings</h1>
      <p className="auth-subtitle">Track the status of your event tickets</p>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="page-loader">Loading your bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">You haven't booked any events yet. Go explore the events page!</div>
      ) : (
        <div className="tickets-list">
          {bookings.map((b) => {
            const statusInfo = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
            return (
              <div className="ticket-card" key={b._id}>
                <img src={b.event?.image} alt={b.event?.title} className="ticket-img" />
                <div className="ticket-body">
                  <div className="ticket-header">
                    <h3>{b.event?.title || 'Event removed'}</h3>
                    <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>
                  </div>
                  <p className="event-meta">
                    📅 {b.event ? new Date(b.event.date).toLocaleDateString() : '-'} &nbsp; 🕒 {b.event?.time}
                  </p>
                  <p className="event-meta">📍 {b.event?.venue}</p>
                  <p className="event-meta">🎫 Ticket ID: {b.ticketId}</p>
                  <p className="event-meta">
                    👥 Seats: {b.seats} &nbsp; 💰 Total: {b.totalPrice > 0 ? `₹${b.totalPrice}` : 'Free'}
                  </p>
                  {b.adminNote && <p className="admin-note">Admin note: {b.adminNote}</p>}

                  {(b.status === 'pending' || b.status === 'accepted') && (
                    <button
                      className="btn-secondary"
                      onClick={() => handleCancel(b._id)}
                      disabled={cancellingId === b._id}
                    >
                      {cancellingId === b._id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
