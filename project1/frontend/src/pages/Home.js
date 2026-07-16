import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const CATEGORIES = ['All', 'Technology', 'Music', 'Business', 'Sports', 'Arts', 'General'];

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [error, setError] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/events', { params: { search, category } });
      setEvents(res.data.events);
    } catch (err) {
      setError('Could not load events. Is the backend server running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchEvents, 300); // debounce search
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category]);

  return (
    <div className="page-container">
      <div className="hero">
        <h1>Find your next great experience</h1>
        <p>Discover and book events happening near you</p>
      </div>

      <div className="filters-bar">
        <input
          className="search-input"
          placeholder="Search by title or venue..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <div className="page-loader">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="empty-state">No events found. Try a different search.</div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <Link to={`/events/${event._id}`} key={event._id} className="event-card">
              <img src={event.image} alt={event.title} className="event-card-img" />
              <div className="event-card-body">
                <span className="badge">{event.category}</span>
                <h3>{event.title}</h3>
                <p className="event-meta">
                  📅 {new Date(event.date).toLocaleDateString()} &nbsp; 🕒 {event.time}
                </p>
                <p className="event-meta">📍 {event.venue}</p>
                <div className="event-card-footer">
                  <span className="event-price">{event.price > 0 ? `₹${event.price}` : 'Free'}</span>
                  <span className={`seats-left ${event.availableSeats === 0 ? 'sold-out' : ''}`}>
                    {event.availableSeats === 0 ? 'Sold Out' : `${event.availableSeats} seats left`}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
