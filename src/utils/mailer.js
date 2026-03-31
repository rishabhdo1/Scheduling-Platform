
const nodemailer = require('nodemailer');

// ── Transport ───────────────────────────────────────────────
// Supports both generic SMTP config and the Gmail shorthand.
function createTransport() {
  const host = process.env.EMAIL_HOST;

  if (host) {
    // Generic SMTP (Brevo, Resend, Mailgun, etc.)
    return nodemailer.createTransport({
      host,
      port:   parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Gmail shorthand
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

const transporter = createTransport();

// ── Helpers ─────────────────────────────────────────────────
const FROM = () =>
  `"Schedulr" <${process.env.EMAIL_USER}>`;

/**
 * Send booking confirmation to the GUEST.
 * Attaches a .ics file so they can add it to any calendar app.
 */
async function sendGuestConfirmation({
  guestEmail, guestName,
  hostName,
  title, guestTime, hostTime,
  location, notes,
  duration,
  icsContent,
}) {
  const locationLine = location
    ? `<p>📍 <strong>Location:</strong> ${location}</p>`
    : '';
  const notesLine = notes
    ? `<p>📝 <strong>Notes:</strong> ${notes}</p>`
    : '';

  await transporter.sendMail({
    from:    FROM(),
    to:      guestEmail,
    subject: `✅ Confirmed: ${title}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#0d0d12">
        <div style="background:#5b4fff;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;color:#fff;font-size:22px">You're booked! 🎉</h1>
        </div>
        <div style="background:#fff;padding:28px 32px;border:1px solid #e2e2ea;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 20px">Hi <strong>${guestName}</strong>, your appointment is confirmed.</p>

          <div style="background:#f5f5f8;border-radius:8px;padding:16px 20px;margin-bottom:20px">
            <p style="margin:0 0 8px;font-size:18px;font-weight:700">${title}</p>
            <p style="margin:0 0 6px">🕐 <strong>Your time:</strong> ${guestTime}</p>
            ${hostTime !== guestTime ? `<p style="margin:0 0 6px;color:#7b7b8f;font-size:13px">Host's time: ${hostTime}</p>` : ''}
            <p style="margin:0 0 6px">⏱ <strong>Duration:</strong> ${duration} minutes</p>
            ${locationLine}
            ${notesLine}
          </div>

          <p style="color:#7b7b8f;font-size:13px;margin:0">
            📎 A calendar invite (.ics) is attached — click it to add this event to
            Google Calendar, Outlook, Apple Calendar, or any other calendar app.
          </p>

          <hr style="border:none;border-top:1px solid #e2e2ea;margin:24px 0"/>
          <p style="color:#7b7b8f;font-size:12px;margin:0">
            Powered by <strong>Schedulr</strong> · If you need to reschedule, contact the host directly.
          </p>
        </div>
      </div>
    `,
    attachments: [{
      filename:    'booking.ics',
      content:     icsContent,
      contentType: 'text/calendar; method=REQUEST',
    }],
  });
}

/**
 * Send booking notification to the HOST.
 * Also attaches the .ics so the host can add it to their calendar.
 */
async function sendHostNotification({
  hostEmail, hostName,
  guestName, guestEmail,
  title, hostTime, guestTime,
  location, notes,
  duration,
  icsContent,
}) {
  const locationLine = location
    ? `<p>📍 <strong>Location:</strong> ${location}</p>`
    : '';
  const notesLine = notes
    ? `<p>📝 <strong>Guest notes:</strong> ${notes}</p>`
    : '';

  await transporter.sendMail({
    from:    FROM(),
    to:      hostEmail,
    subject: `📅 New booking: ${title} with ${guestName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#0d0d12">
        <div style="background:#0d0d12;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;color:#fff;font-size:20px">New booking received</h1>
        </div>
        <div style="background:#fff;padding:28px 32px;border:1px solid #e2e2ea;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 20px">Hi <strong>${hostName}</strong>, someone just booked time with you.</p>

          <div style="background:#f5f5f8;border-radius:8px;padding:16px 20px;margin-bottom:20px">
            <p style="margin:0 0 8px;font-size:18px;font-weight:700">${title}</p>
            <p style="margin:0 0 6px">👤 <strong>Guest:</strong> ${guestName} (${guestEmail})</p>
            <p style="margin:0 0 6px">🕐 <strong>Your time:</strong> ${hostTime}</p>
            ${guestTime !== hostTime ? `<p style="margin:0 0 6px;color:#7b7b8f;font-size:13px">Guest's time: ${guestTime}</p>` : ''}
            <p style="margin:0 0 6px">⏱ <strong>Duration:</strong> ${duration} minutes</p>
            ${locationLine}
            ${notesLine}
          </div>

          <p style="color:#7b7b8f;font-size:13px;margin:0">
            📎 Calendar invite attached — add it to your calendar with one click.
          </p>

          <hr style="border:none;border-top:1px solid #e2e2ea;margin:24px 0"/>
          <p style="color:#7b7b8f;font-size:12px;margin:0">Powered by <strong>Schedulr</strong></p>
        </div>
      </div>
    `,
    attachments: [{
      filename:    'booking.ics',
      content:     icsContent,
      contentType: 'text/calendar; method=REQUEST',
    }],
  });
}

/**
 * Send cancellation notice to the guest.
 */
async function sendCancellationEmail({
  guestEmail, guestName,
  title, guestTime, reason,
}) {
  await transporter.sendMail({
    from:    FROM(),
    to:      guestEmail,
    subject: `❌ Cancelled: ${title}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#0d0d12">
        <div style="background:#ef4444;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;color:#fff;font-size:20px">Appointment Cancelled</h1>
        </div>
        <div style="background:#fff;padding:28px 32px;border:1px solid #e2e2ea;border-top:none;border-radius:0 0 12px 12px">
          <p>Hi <strong>${guestName}</strong>,</p>
          <p>Your appointment <strong>${title}</strong> scheduled for <strong>${guestTime}</strong> has been cancelled.</p>
          ${reason ? `<p>Reason: ${reason}</p>` : ''}
          <p style="color:#7b7b8f;font-size:13px">Please reach out to the host to reschedule if needed.</p>
        </div>
      </div>
    `,
  });
}

/**
 * Verify SMTP connection on startup (optional — logs a warning if it fails).
 */
async function verifyMailer() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  EMAIL_USER / EMAIL_PASS not set — email sending disabled');
    return false;
  }
  try {
    await transporter.verify();
    console.log('✅ Mailer connected');
    return true;
  } catch (err) {
    console.warn('⚠️  Mailer connection failed:', err.message);
    return false;
  }
}

module.exports = {
  sendGuestConfirmation,
  sendHostNotification,
  sendCancellationEmail,
  verifyMailer,
};
