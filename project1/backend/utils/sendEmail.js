const nodemailer = require('nodemailer');

// Create reusable transporter using SMTP settings from .env
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send an email
 * @param {Object} options - { to, subject, html, text }
 */
const sendEmail = async (options) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send the 6-digit verification code email
 */
const sendVerificationEmail = async (toEmail, name, code) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border:1px solid #eee; border-radius:8px; overflow:hidden;">
      <div style="background:#4f46e5; padding:20px; text-align:center;">
        <h1 style="color:#fff; margin:0;">Event Booking</h1>
      </div>
      <div style="padding:24px;">
        <h2 style="margin-top:0;">Hi ${name},</h2>
        <p>Thanks for signing up! Please use the verification code below to confirm your email address. This code will expire in 10 minutes.</p>
        <div style="text-align:center; margin:24px 0;">
          <span style="font-size:32px; letter-spacing:8px; font-weight:bold; background:#f3f4f6; padding:12px 24px; border-radius:8px; display:inline-block;">
            ${code}
          </span>
        </div>
        <p>If you did not request this, you can safely ignore this email.</p>
        <p style="color:#888; font-size:12px;">— The Event Booking Team</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: toEmail,
    subject: 'Verify your email - Event Booking',
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
    html,
  });
};

/**
 * Send booking status update email (accepted / rejected)
 */
const sendBookingStatusEmail = async (toEmail, name, eventTitle, status, ticketId) => {
  const isAccepted = status === 'accepted';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border:1px solid #eee; border-radius:8px; overflow:hidden;">
      <div style="background:${isAccepted ? '#16a34a' : '#dc2626'}; padding:20px; text-align:center;">
        <h1 style="color:#fff; margin:0;">Booking ${isAccepted ? 'Confirmed' : 'Rejected'}</h1>
      </div>
      <div style="padding:24px;">
        <h2 style="margin-top:0;">Hi ${name},</h2>
        <p>Your booking for <strong>${eventTitle}</strong> (Ticket ID: ${ticketId}) has been
        <strong>${status.toUpperCase()}</strong> by the admin.</p>
        ${isAccepted ? '<p>We look forward to seeing you there!</p>' : '<p>You may browse other events and try booking again.</p>'}
        <p style="color:#888; font-size:12px;">— The Event Booking Team</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: toEmail,
    subject: `Your booking has been ${status}`,
    text: `Your booking for ${eventTitle} has been ${status}.`,
    html,
  });
};

module.exports = { sendEmail, sendVerificationEmail, sendBookingStatusEmail };
