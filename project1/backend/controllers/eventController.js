const Event = require('../models/Event');

// @route GET /api/events  (public - list all events, supports ?search=&category=)
const getEvents = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
      ];
    }
    if (category && category !== 'All') {
      filter.category = category;
    }

    const events = await Event.find(filter).sort({ date: 1 });
    res.json({ success: true, count: events.length, events });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching events' });
  }
};

// @route GET /api/events/:id (public - single event)
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching event' });
  }
};

// @route POST /api/events (admin only)
const createEvent = async (req, res) => {
  try {
    const { title, description, category, date, time, venue, price, totalSeats, image } = req.body;

    if (!title || !description || !date || !time || !venue || totalSeats == null) {
      return res.status(400).json({ success: false, message: 'Missing required event fields' });
    }

    const event = await Event.create({
      title,
      description,
      category,
      date,
      time,
      venue,
      price: price || 0,
      totalSeats,
      availableSeats: totalSeats,
      image,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Event created successfully', event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error creating event' });
  }
};

// @route PUT /api/events/:id (admin only)
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const fields = ['title', 'description', 'category', 'date', 'time', 'venue', 'price', 'image'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) event[field] = req.body[field];
    });

    // If totalSeats changes, adjust availableSeats proportionally
    if (req.body.totalSeats !== undefined) {
      const bookedSeats = event.totalSeats - event.availableSeats;
      event.totalSeats = req.body.totalSeats;
      event.availableSeats = Math.max(req.body.totalSeats - bookedSeats, 0);
    }

    await event.save();
    res.json({ success: true, message: 'Event updated successfully', event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating event' });
  }
};

// @route DELETE /api/events/:id (admin only)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    await event.deleteOne();
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error deleting event' });
  }
};

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent };
