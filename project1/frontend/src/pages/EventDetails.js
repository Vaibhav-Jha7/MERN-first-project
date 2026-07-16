import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data.event);
      } catch (err) {
        setError('Event not found');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) {
      navigate('/login');
      return;
    }

    setBooking(true);
    try {
      await api.post('/bookings', { eventId: id, seats: Number(seats) });
      setSuccess('Booking request submitted! Check "My Bookings" for status updates.');
      // Refresh event to reflect updated seat count
      const res = await api.get(`/events/${id}`);
      setEvent(res.data.event);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="page-loader">Loading event...</div>;
  if (!event) return <div className="empty-state">{error || 'Event not found'}</div>;

  return (
    <div className="page-container">
      <div className="event-details">
        <img src={event.image} alt={event.title} className="event-details-img" />
        <div className="event-details-body">
          <span className="badge">{event.category}</span>
          <h1>{event.title}</h1>
          <p className="event-meta">📅 {new Date(event.date).toLocaleDateString()} &nbsp; 🕒 {event.time}</p>
          <p className="event-meta">📍 {event.venue}</p>
          <p className="event-description">{event.description}</p>

          <div className="booking-box">
            <div className="booking-box-row">
              <span>Price per seat</span>
              <strong>{event.price > 0 ? `₹${event.price}` : 'Free'}</strong>
            </div>
            <div className="booking-box-row">
              <span>Seats available</span>
              <strong className={event.availableSeats === 0 ? 'sold-out' : ''}>
                {event.availableSeats} / {event.totalSeats}
              </strong>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {event.availableSeats === 0 ? (
              <button className="btn-primary" disabled>
                Sold Out
              </button>
            ) : (
              <form onSubmit={handleBook} className="booking-form">
                <label>Number of seats</label>
                <input
                  type="number"
                  min="1"
                  max={event.availableSeats}
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                />
                <button type="submit" className="btn-primary" disabled={booking}>
                  {booking ? 'Booking...' : user ? 'Book Now' : 'Log in to Book'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
