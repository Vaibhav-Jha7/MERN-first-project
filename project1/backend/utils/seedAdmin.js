// Run with: npm run seed:admin
// Creates a default admin account and a few sample events (only if none exist).
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Event = require('../models/Event');

const run = async () => {
  await connectDB();

  const adminEmail = 'vaibhavkumarjha414@gmail.com';
  let admin = await User.findOne({ email: adminEmail });

  if (!admin) {
    admin = await User.create({
      name: 'Admin',
      email: adminEmail,
      password: 'Vaibhavjhaji@9128', // change after first login!
      role: 'admin',
      isVerified: true,
    });
    console.log('✅ Admin created -> email: vaibhavkumarjha414@gmail.com | password: Vaibhavjhaji@9128');
  } else {
    console.log('ℹ️ Admin already exists:', adminEmail);
  }

  const existingEvents = await Event.countDocuments();
  if (existingEvents === 0) {
    await Event.insertMany([
      {
        title: 'Tech Innovators Summit 2026',
        description: 'A full-day summit featuring talks from leading engineers and founders on AI, cloud, and the future of software.',
        category: 'Technology',
        date: new Date('2026-09-12'),
        time: '10:00 AM',
        venue: 'Bengaluru Convention Center',
        price: 999,
        totalSeats: 200,
        availableSeats: 200,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        createdBy: admin._id,
      },
      {
        title: 'Live in Concert: Acoustic Nights',
        description: 'An intimate evening of acoustic music featuring indie artists from across the country.',
        category: 'Music',
        date: new Date('2026-08-20'),
        time: '7:00 PM',
        venue: 'Open Air Amphitheatre, Delhi',
        price: 499,
        totalSeats: 300,
        availableSeats: 300,
        image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
        createdBy: admin._id,
      },
      {
        title: 'Startup Pitch Fest',
        description: 'Watch early-stage startups pitch to a panel of investors, followed by networking.',
        category: 'Business',
        date: new Date('2026-10-05'),
        time: '2:00 PM',
        venue: 'WeWork, Mumbai',
        price: 0,
        totalSeats: 150,
        availableSeats: 150,
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
        createdBy: admin._id,
      },
    ]);
    console.log('✅ Sample events created');
  } else {
    console.log('ℹ️ Events already exist, skipping sample event seeding');
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
