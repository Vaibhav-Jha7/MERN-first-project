const express = require('express');
const router = express.Router();
const { signup, verifyEmail, resendCode, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/verify-email', verifyEmail);
router.post('/resend-code', resendCode);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
