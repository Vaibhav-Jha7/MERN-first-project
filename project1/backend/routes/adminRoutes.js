const express = require('express');
const router = express.Router();
const { getAllBookings, updateBookingStatus, getDashboardStats } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.use(protect, adminOnly); // every route below requires an authenticated admin

router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', updateBookingStatus);
router.get('/stats', getDashboardStats);

module.exports = router;
