import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const CATEGORIES = ['Technology', 'Music', 'Business', 'Sports', 'Arts', 'General'];

const emptyForm = {
  title: '',
  description: '',
  category: 'General',
  date: '',
  time: '',
  venue: '',
  price: 0,
  totalSeats: 50,
  image: '',
};

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events');
      setEvents(res.data.events);
    } catch (err) {
      setError('Could not load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'price' || name === 'totalSeats' ? Number(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title || !form.description || !form.date || !form.time || !form.venue || !form.totalSeats) {
      setError('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const payload = { ...form };
      if (!payload.image) delete payload.image; // let backend use its default image
      await api.post('/events', payload);
      setSuccess('Event created successfully!');
      setForm(emptyForm);
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create event');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete event');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page-container">
      <h1>Manage Events</h1>
      <p className="auth-subtitle">
        Create new events or remove existing ones. Go to <Link to="/admin">Admin Dashboard</Link> to manage bookings.
      </p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="admin-events-layout">
        <form className="auth-card event-form-card" onSubmit={handleSubmit}>
          <h2>Add New Event</h2>

          <label>Title *</label>
          <input name="title" value={form.title} onChange={handleChange} placeholder="Tech Innovators Summit" required />

          <label>Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="What is this event about?"
            rows={3}
            required
          />

          <label>Category</label>
          <select name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="form-row">
            <div>
              <label>Date *</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} required />
            </div>
            <div>
              <label>Time *</label>
              <input name="time" value={form.time} onChange={handleChange} placeholder="6:00 PM" required />
            </div>
          </div>

          <label>Venue *</label>
          <input name="venue" value={form.venue} onChange={handleChange} placeholder="Main Hall, City Center" required />

          <div className="form-row">
            <div>
              <label>Price (₹, 0 = free)</label>
              <input type="number" min="0" name="price" value={form.price} onChange={handleChange} />
            </div>
            <div>
              <label>Total Seats *</label>
              <input type="number" min="1" name="totalSeats" value={form.totalSeats} onChange={handleChange} required />
            </div>
          </div>

          <label>Image URL ()</label>
          <input name="image" value={form.image} onChange={handleChange} placeholder="https://..." />

          <button type="submit" className="btn-primary" disabled={creating}>
            {creating ? 'Creating...' : 'Create Event'}
          </button>
        </form>

        <div className="events-manage-list">
          <h2>Existing Events ({events.length})</h2>
          {loading ? (
            <div className="page-loader">Loading...</div>
          ) : events.length === 0 ? (
            <div className="empty-state">No events yet. Create one on the left.</div>
          ) : (
            events.map((ev) => (
              <div className="manage-event-row" key={ev._id}>
                <img src={ev.image} alt={ev.title} />
                <div className="manage-event-info">
                  <strong>{ev.title}</strong>
                  <span className="event-meta">
                    {new Date(ev.date).toLocaleDateString()} · {ev.venue}
                  </span>
                  <span className="event-meta">
                    {ev.availableSeats}/{ev.totalSeats} seats left · {ev.price > 0 ? `₹${ev.price}` : 'Free'}
                  </span>
                </div>
                <button className="btn-reject" onClick={() => handleDelete(ev._id)} disabled={deletingId === ev._id}>
                  {deletingId === ev._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEvents;
