# EventBooking — Full-Stack MERN Event Booking System

A complete event booking platform built with **MongoDB, Express, React, and Node.js**.

## Features

- 🔐 **Auth with email verification** — signup sends a 6-digit code via Nodemailer; users must verify before logging in
- 🎫 **Event browsing & booking** — search/filter events, view details, book seats
- 👤 **User dashboard** — see all your bookings/tickets with live status (pending / accepted / rejected / cancelled), cancel a booking
- 🛠️ **Admin dashboard** — stats overview, and a booking queue to **Accept** / **Reject** pending requests (with automatic seat release on rejection and an email notification to the user)
- 🔑 JWT-based authentication, bcrypt password hashing, protected routes on both API and frontend

## Project Structure

```
event-booking-mern/
├── backend/            Express + MongoDB API
│   ├── config/db.js
│   ├── models/          User.js, Event.js, Booking.js
│   ├── middleware/       auth.js (JWT), admin.js (role check)
│   ├── controllers/      authController, eventController, bookingController, adminController
│   ├── routes/           authRoutes, eventRoutes, bookingRoutes, adminRoutes
│   ├── utils/            sendEmail.js (Nodemailer), generateToken.js, seedAdmin.js
│   ├── server.js
│   └── .env.example
└── frontend/            React app (Create React App)
    └── src/
        ├── api/axios.js          Axios instance w/ JWT interceptor
        ├── context/AuthContext.js
        ├── components/          Navbar, PrivateRoute, AdminRoute
        ├── pages/                Home, EventDetails, Login, Signup, VerifyEmail,
        │                         UserDashboard, AdminDashboard
        └── styles/App.css
```

## 1. Prerequisites

- Node.js 18+ and npm
- A MongoDB instance (local `mongod` or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- An email account for sending verification codes (Gmail works well with an **App Password**)

## 2. Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/event_booking     # or your Atlas connection string
JWT_SECRET=some_long_random_string
JWT_EXPIRE=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM="Event Booking <your_email@gmail.com>"

CLIENT_URL=http://localhost:3000
ADMIN_SIGNUP_SECRET=letmein_admin_2026
```

> **Getting a Gmail App Password:** enable 2-Step Verification on your Google account, then go to
> Google Account → Security → App Passwords, generate one for "Mail", and use that 16-character
> value as `EMAIL_PASS` (not your normal Gmail password).

Install dependencies and seed an admin account + sample events:

```bash
npm install
npm run seed:admin     # creates admin@example.com / admin123 and 3 sample events
npm run dev            # starts on http://localhost:5000 (nodemon)
```

## 3. Frontend Setup

```bash
cd frontend
cp .env.example .env    # REACT_APP_API_URL=http://localhost:5000/api
npm install
npm start                # starts on http://localhost:3000
```

## 4. Using the App

1. Go to `http://localhost:3000`, click **Sign Up**, create a user account.
2. Check your email for the 6-digit code and enter it on the **Verify Email** page.
3. Browse events on the home page, open one, and click **Book Now**.
4. Your booking status will show as **Pending** in **My Bookings**.
5. Log in as the seeded admin (`admin@example.com` / `admin123`) — or set `ADMIN_SIGNUP_SECRET`
   in the signup request body to create your own admin — and go to **Admin Dashboard**.
6. In the **Pending** tab, click **Accept** or **Reject** on the booking. The user gets an email,
   and their dashboard updates automatically to reflect the new status.

### Creating admin-only events

Events are created via the API (`POST /api/events`, admin JWT required). You can do this with curl/Postman, e.g.:

```bash
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My New Event",
    "description": "Details here",
    "category": "Technology",
    "date": "2026-12-01",
    "time": "6:00 PM",
    "venue": "Main Hall",
    "price": 199,
    "totalSeats": 100
  }'
```

(A simple "Create Event" admin UI form can be added on top of this API easily if you'd like — just ask!)

## 5. Notes on Seats & Booking Flow

- When a user books, seats are **reserved immediately** (subtracted from `availableSeats`) and the
  booking is created with status `pending`.
- If the admin **rejects** the booking, the reserved seats are automatically **released** back to the event.
- If the user **cancels** their own pending/accepted booking, seats are also released.
- Emails are sent for: (1) signup verification code, (2) booking accepted/rejected by admin.

## 6. Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, React Router v6, Axios, plain CSS |
| Backend | Node.js, Express, Mongoose |
| Auth | JWT, bcryptjs |
| Email | Nodemailer |
| Database | MongoDB |

## 7. Security Notes for Production

- Change `JWT_SECRET` and the seeded admin password before deploying.
- Set `NODE_ENV=production` and use HTTPS.
- Consider rate-limiting `/api/auth/*` routes to prevent brute-force / spam signups.
- Store secrets in your hosting provider's environment variable manager, never commit `.env`.
