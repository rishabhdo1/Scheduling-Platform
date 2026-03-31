# Schedulr — Appointment Scheduling Platform

A full-stack scheduling platform built with **Node.js + Express + MySQL** (backend)
and **React + Vite** (frontend). Calendar integration uses **ICS files via email** —
no Google Cloud or Azure account required.

---

## Tech Stack & Justification

| Layer | Choice | Why |
|---|---|---|
| Runtime | Node.js + Express | Non-blocking I/O ideal for scheduling; huge ecosystem; easy REST API setup |
| Database | MySQL (mysql2) | Relational model fits bookings perfectly; UNIQUE KEY enforces no double-booking at DB level |
| Auth | JWT + bcryptjs | Stateless tokens scale horizontally; bcrypt with 10 salt rounds is industry standard |
| Calendar | ICS files (ics npm) + Nodemailer | Works with every calendar app without OAuth; open RFC 5545 standard |
| Frontend | React + Vite | Component model suits multi-step booking UI; Vite gives fast dev experience |
| Timezone | Native Intl API | No extra library; handles DST and all IANA zones correctly |

---

## Features

- **User Registration & Authentication** — bcrypt-hashed passwords, JWT sessions, timezone stored per user
- **Calendar Integration** — ICS (.ics) files emailed to guest and host after every booking; works with Google Calendar, Outlook, Apple Calendar, Thunderbird, Proton Calendar, and any RFC 5545-compatible app
- **Appointment Scheduling** — Create event types, set weekly availability, share booking link, guests book without an account
- **Timezone Support** — Host sets their timezone; guests pick theirs; slots displayed in each party's local time; all times stored as UTC
- **Responsive UI** — React dashboard (event types, availability, bookings, calendar status) + public booking page with mini calendar, slot grid, confirm form

---

## Project Structure

```
schedulr/
├── server.js                     # Entry point — DB + mailer check + Express
├── package.json
├── .env.example
│
├── src/
│   ├── app.js                    # Express + CORS middleware
│   ├── schema.sql                # MySQL schema — run once
│   ├── config/
│   │   ├── db.js                 # mysql2 connection pool
│   │   └── env.js                # Centralised env access
│   ├── constants/index.js        # HTTP status codes, day names
│   ├── models/                   # Pure SQL — zero business logic
│   │   ├── user.model.js
│   │   ├── eventType.model.js
│   │   ├── availability.model.js
│   │   └── booking.model.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── eventType.service.js
│   │   ├── availability.service.js
│   │   ├── booking.service.js    # Core logic + calls CalendarService
│   │   └── calendar.service.js   # ICS generation + email dispatch
│   ├── controllers/              # HTTP layer — validate → call service → respond
│   │   ├── auth.controller.js
│   │   ├── calendar.controller.js
│   │   ├── eventType.controller.js
│   │   ├── availability.controller.js
│   │   └── booking.controller.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   ├── calendar.routes.js
│   │   ├── eventType.routes.js
│   │   ├── availability.routes.js
│   │   └── booking.routes.js
│   ├── middlewares/
│   │   ├── authenticate.js       # JWT guard
│   │   ├── asyncHandler.js       # Async error forwarding
│   │   ├── errorHandler.js       # Global error handler
│   │   └── notFound.js           # 404 fallback
│   ├── validators/               # Input validation — throws AppError(400)
│   │   ├── auth.validator.js
│   │   ├── eventType.validator.js
│   │   ├── availability.validator.js
│   │   └── booking.validator.js
│   └── utils/
│       ├── AppError.js           # Operational error class
│       ├── jwt.js                # generateToken / verifyToken
│       ├── response.js           # success() / created() / error()
│       ├── slotGenerator.js      # Timezone-aware slot splitting
│       ├── icsGenerator.js       # Generates .ics file content (RFC 5545)
│       └── mailer.js             # Nodemailer — sends emails with .ics attachment
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx               # Routes: login, register, dashboard, booking page
        ├── main.jsx
        ├── index.css             # Design system (CSS variables, utility classes)
        ├── context/
        │   └── AuthContext.jsx   # Auth state, login/logout/register
        ├── utils/
        │   ├── api.js            # fetch wrapper with JWT header
        │   └── timezones.js      # IANA timezone list + Intl format helpers
        ├── components/
        │   ├── Layout.jsx              # Sidebar nav
        │   ├── EventTypeModal.jsx      # Create / edit event type form
        │   ├── CalendarIntegrations.jsx # ICS status + setup instructions
        │   ├── AvailabilityEditor.jsx  # Weekly availability toggle + time picker
        │   └── BookingsList.jsx        # Host's bookings with cancel action
        └── pages/
            ├── LoginPage.jsx
            ├── RegisterPage.jsx        # Includes timezone selector
            ├── DashboardPage.jsx       # 4 tabs: Event Types, Availability, Bookings, Calendars
            ├── SettingsPage.jsx        # Timezone picker with live clock preview
            └── BookingPage.jsx         # Public booking page — calendar → slots → form → confirm
```

---

## Email / Calendar Setup

Calendar invites are sent as `.ics` file attachments. The recipient clicks the
attachment and it opens in their calendar app — no OAuth, no Google Cloud, no Azure.

### Option A — Gmail (easiest)

1. Enable 2-Step Verification on your Google account
2. Go to: **myaccount.google.com/apppasswords**
3. Create an App Password → select "Mail" → copy the 16-character code
4. Add to `.env`:

```env
EMAIL_USER=you@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```


> **Works without email too** — if `EMAIL_USER`/`EMAIL_PASS` are not set,
> bookings still save to the database normally; emails are silently skipped.

---

## API Reference

### Auth
| Method | URL | Auth | Body |
|---|---|---|---|
| POST | `/api/auth/register` | ✗ | `{ name, email, password, timezone? }` |
| POST | `/api/auth/login` | ✗ | `{ email, password }` |
| GET | `/api/auth/me` | ✅ | — |
| PATCH | `/api/auth/timezone` | ✅ | `{ timezone }` |

### Calendar
| Method | URL | Auth | Notes |
|---|---|---|---|
| GET | `/api/calendar/status` | ✅ | Returns whether email is configured |

### Event Types
| Method | URL | Auth | Body |
|---|---|---|---|
| POST | `/api/event-types` | ✅ | `{ title, duration, description?, color?, location? }` |
| GET | `/api/event-types` | ✅ | — |
| GET | `/api/event-types/:id` | ✅ | — |
| PATCH | `/api/event-types/:id` | ✅ | Any subset of create fields |
| DELETE | `/api/event-types/:id` | ✅ | — |

### Availability
| Method | URL | Auth | Body |
|---|---|---|---|
| POST | `/api/availability` | ✅ | `{ day_of_week, start_time, end_time }` |
| GET | `/api/availability/:userId` | ✗ | — |

### Bookings
| Method | URL | Auth | Notes |
|---|---|---|---|
| GET | `/api/bookings/slots/:eventTypeId` | ✗ | `?date=YYYY-MM-DD&timezone=Asia/Kolkata` |
| POST | `/api/bookings` | ✗ | `{ eventTypeId, guestName, guestEmail, startTime, guestTimezone?, notes? }` |
| GET | `/api/bookings` | ✅ | Host's full booking list |
| DELETE | `/api/bookings/:id` | ✅ | `{ reason? }` — cancels + emails guest |

---

## Security Considerations

- Passwords hashed with **bcrypt** (10 rounds — ~100ms, brute-force resistant)
- JWT tokens expire in 7 days; secret is env-variable only
- All SQL queries use **parameterised statements** (mysql2) — no SQL injection possible
- Input validated in a dedicated validator layer before reaching services
- CORS restricted to `CLIENT_URL` env variable
- `AppError` vs unexpected error distinction prevents stack traces leaking to clients
- Double-booking prevented at two levels: application check + DB `UNIQUE KEY`

## Scalability Considerations

- MySQL connection **pool** (10 connections) — handles concurrent requests
- **Stateless JWT** — no server-side session; API servers can scale horizontally
- Email sending is **fire-and-forget** — booking confirmation returns immediately without waiting for SMTP
- Slot generation is a **pure function** — can be unit-tested or moved to a worker
- Schema uses **UUID primary keys** — safe for eventual sharding / multi-node setups

---

## Tools Used

- **Node.js / Express** — REST API framework
- **mysql2** — MySQL driver with Promise support and parameterised queries
- **bcryptjs** — Password hashing
- **jsonwebtoken** — JWT generation and verification
- **uuid** — UUID v4 generation for primary keys
- **ics** — RFC 5545 iCalendar file generation (open source, MIT)
- **nodemailer** — SMTP email client (open source, MIT)
- **React + Vite** — Frontend SPA
- **Intl (built-in)** — Timezone-aware date formatting and slot generation
- **Claude (Anthropic)** — Used to scaffold architecture, generate boilerplate, and review code patterns
