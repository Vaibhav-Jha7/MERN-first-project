const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    seats: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending',
    },
    ticketId: {
      type: String,
      unique: true,
    },
    adminNote: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Generate a unique-ish ticket id before saving a new booking
BookingSchema.pre('save', function (next) {
  if (!this.ticketId) {
    this.ticketId =
      'TCKT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);
