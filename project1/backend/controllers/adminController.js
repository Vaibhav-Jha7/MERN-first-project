const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');
const { sendBookingStatusEmail } = require('../utils/sendEmail');

// @route GET /api/admin/bookings?status=pending|accepted|rejected|cancelled (admin only)
const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate('event', 'title date time venue price')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching bookings' });
  }
};

// @route PUT /api/admin/bookings/:id/status  body: { status: 'accepted' | 'rejected', adminNote }
const updateBookingStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'accepted' or 'rejected'" });
    }

    const booking = await Booking.findById(req.params.id).populate('user', 'name email').populate('event', 'title');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Booking is already ${booking.status}` });
    }

    // If rejecting, release the reserved seats back to the event
    if (status === 'rejected') {
      const event = await Event.findById(booking.event._id || booking.event);
      if (event) {
        event.availableSeats += booking.seats;
        await event.save();
      }
    }

    booking.status = status;
    if (adminNote) booking.adminNote = adminNote;
    await booking.save();

    try {
      await sendBookingStatusEmail(booking.user.email, booking.user.name, booking.event.title, status, booking.ticketId);
    } catch (emailErr) {
      console.error('Failed to send booking status email:', emailErr.message);
    }

    res.json({ success: true, message: `Booking ${status} successfully`, booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error updating booking status' });
  }
};

// @route GET /api/admin/stats (admin dashboard summary)
const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalEvents, totalBookings, pending, accepted, rejected] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Event.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'accepted' }),
      Booking.countDocuments({ status: 'rejected' }),
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalEvents, totalBookings, pending, accepted, rejected },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard stats' });
  }
};

module.exports = { getAllBookings, updateBookingStatus, getDashboardStats };
