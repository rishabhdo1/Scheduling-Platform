
CREATE DATABASE IF NOT EXISTS schedulr_db;
USE schedulr_db;

-- ── Users ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id           CHAR(36)     NOT NULL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,             -- bcrypt hash
  timezone     VARCHAR(60)  NOT NULL DEFAULT 'UTC',
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Event Types ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS event_types (
  id           CHAR(36)     NOT NULL PRIMARY KEY,
  user_id      CHAR(36)     NOT NULL,
  title        VARCHAR(150) NOT NULL,
  description  TEXT,
  duration     INT          NOT NULL,             -- minutes
  color        VARCHAR(7)   NOT NULL DEFAULT '#5b4fff',
  location     VARCHAR(255),                      -- address or video link
  slug         VARCHAR(100) NOT NULL,
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uq_event_type_slug (user_id, slug),
  CONSTRAINT fk_event_types_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Availability ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS availability (
  id           CHAR(36)     NOT NULL PRIMARY KEY,
  user_id      CHAR(36)     NOT NULL,
  day_of_week  TINYINT      NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time   TIME         NOT NULL,             -- e.g. "09:00:00"
  end_time     TIME         NOT NULL,             -- e.g. "17:00:00"
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uq_availability (user_id, day_of_week),
  CONSTRAINT fk_availability_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Bookings ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bookings (
  id                  CHAR(36)     NOT NULL PRIMARY KEY,
  event_type_id       CHAR(36)     NOT NULL,
  guest_name          VARCHAR(100) NOT NULL,
  guest_email         VARCHAR(150) NOT NULL,
  guest_timezone      VARCHAR(60)  NOT NULL DEFAULT 'UTC',
  start_time          DATETIME     NOT NULL,      -- UTC
  end_time            DATETIME     NOT NULL,      -- UTC
  status              ENUM('confirmed','cancelled') NOT NULL DEFAULT 'confirmed',
  notes               TEXT,
  cancellation_reason TEXT,
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Prevents two bookings at the same slot for the same event type
  UNIQUE KEY uq_booking_slot (event_type_id, start_time),

  CONSTRAINT fk_bookings_event_type
    FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE
);
