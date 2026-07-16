const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Event = require('../models/Event');

// @route POST /api/bookings  (logged in user books seats for an event)
const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { eventId, seats } = req.body;
    const seatsRequested = Number(seats) || 1;

    if (!eventId) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'eventId is required' });
    }

    const event = await Event.findById(eventId).session(session);
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.availableSeats < seatsRequested) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: `Only ${event.availableSeats} seats left for this event` });
    }

    // Reserve seats immediately; they are released again if admin rejects
    event.availableSeats -= seatsRequested;
    await event.save({ session });

    const booking = await Booking.create(
      [
        {
          user: req.user._id,
          event: event._id,
          seats: seatsRequested,
          totalPrice: seatsRequested * event.price,
          status: 'pending',
        },
      ],
      { session }
    );

    await session.commitTransaction();

    const populatedBooking = await Booking.findById(booking[0]._id).populate('event', 'title date time venue image price');

    res.status(201).json({
      success: true,
      message: 'Booking request submitted. Await admin approval.',
      booking: populatedBooking,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error creating booking' });
  } finally {
    session.endSession();
  }
};

// @route GET /api/bookings/my (logged in user's own bookings)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event', 'title date time venue image price category')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching your bookings' });
  }
};

// @route PUT /api/bookings/:id/cancel (user cancels their own pending/accepted booking)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }
    if (booking.status === 'cancelled' || booking.status === 'rejected') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled or rejected' });
    }

    // release seats back to the event
    const event = await Event.findById(booking.event);
    if (event) {
      event.availableSeats += booking.seats;
      await event.save();
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error cancelling booking' });
  }
};

module.exports = { createBooking, getMyBookings, cancelBooking };
