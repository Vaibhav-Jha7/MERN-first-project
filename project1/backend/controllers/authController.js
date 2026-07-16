const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendVerificationEmail } = require('../utils/sendEmail');

const CODE_EXPIRE_MINUTES = 10;

const generateSixDigitCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// @route POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Optional: allow creating an admin account only if the correct secret is supplied
    let role = 'user';
    if (adminSecret && adminSecret === process.env.ADMIN_SIGNUP_SECRET) {
      role = 'admin';
    }

    const code = generateSixDigitCode();
    const codeExpire = new Date(Date.now() + CODE_EXPIRE_MINUTES * 60 * 1000);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      verificationCode: code,
      verificationCodeExpire: codeExpire,
    });

    try {
      await sendVerificationEmail(user.email, user.name, code);
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr.message);
      // Don't block signup if email fails - user can request a resend
    }

    res.status(201).json({
      success: true,
      message: 'Account created. Please check your email for a verification code.',
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during signup' });
  }
};

// @route POST /api/auth/verify-email
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+verificationCode +verificationCodeExpire'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    if (!user.verificationCode || user.verificationCode !== code) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    if (user.verificationCodeExpire < new Date()) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpire = undefined;
    await user.save();

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during verification' });
  }
};

// @route POST /api/auth/resend-code
const resendCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    const code = generateSixDigitCode();
    user.verificationCode = code;
    user.verificationCodeExpire = new Date(Date.now() + CODE_EXPIRE_MINUTES * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, user.name, code);

    res.json({ success: true, message: 'A new verification code has been sent to your email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error while resending code' });
  }
};

// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
        needsVerification: true,
        email: user.email,
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

module.exports = { signup, verifyEmail, resendCode, login, getMe };
